(function (g) {
    "use strict";

    // World state: manages current map, neighbor maps, and world-aware queries.
    // world management for multi-map seams and triggers.

    // Internal: simple LRU-ish store could be added later; for now keep current + all adjacents.
    const _maps = new Map();             // id -> parsed map
    const _objIndex = new Map();         // id -> { byTile:Map<"x,y",object[]>, byId:Map<id,object> }
    const _loading = new Set();          // ids currently loading (prevent duplicate loads)
    let _dir = "res/bg/maps/";           // default dir; set by init()
    let _current = null;                 // currently active map (object)
    let _audioBgmId = null;              // track current bgm id/path last played (if any)

    // Utility: "x,y" key
    function keyOf(tx, ty) { return String(tx) + "," + String(ty); }

    // Utility: clamp to integer
    function toInt(n) { return Number.isFinite(n) ? Math.trunc(n) : 0; }

    // Build per-map object index (safe for OOB coords; negative tiles allowed)
    function _indexMapObjects(map) {
        const byTile = new Map();
        const byId = new Map();
        const arr = Array.isArray(map.objects) ? map.objects : [];
        for (let i = 0; i < arr.length; i++) {
            const o = arr[i]; if (!o) continue;
            byId.set(o.id, o);
            const tx = Number.isFinite(o.x) ? Math.trunc(o.x) : null;
            const ty = Number.isFinite(o.y) ? Math.trunc(o.y) : null;
            if (tx == null || ty == null) continue;
            const k = keyOf(tx, ty);
            let list = byTile.get(k);
            if (!list) { list = []; byTile.set(k, list); }
            list.push(o);
        }
        _objIndex.set(map.id, { byTile, byId });
    }

    // Public: set maps directory used by loader
    function init(opts) {
        // opts.dir: e.g. "res/bg/maps/"
        if (opts && opts.dir) _dir = String(opts.dir);
    }

    // Public: return current map (or null)
    function currentMap() { return _current; }

    // Internal: get a parsed map by id (if loaded)
    function _getMap(id) { return _maps.get(String(id)) || null; }

    // Internal: load a map by id via MapLoader; cache and index objects
    async function _ensureMapLoaded(mapId) {
        const mid = String(mapId || "");
        if (!mid) return null;
        if (_maps.has(mid)) return _maps.get(mid);
        if (_loading.has(mid)) {
            return new Promise((resolve) => {
                const t = setInterval(() => {
                    if (_maps.has(mid)) { clearInterval(t); resolve(_maps.get(mid)); }
                }, 10);
            });
        }
        _loading.add(mid);
        try {
            const res = await MapLoader.loadMap(_dir, mid);
            const map = res && res.map;
            if (!map) {
                console.debug("[World] Neighbor load failed:", mid, res && res.diagnostics);
                return null;
            }
            _maps.set(map.id, map);
            _indexMapObjects(map);

            // prepare renderer cache for this neighbor
            if (window.Renderer && typeof Renderer.prepareMapCache === "function") {
                Renderer.prepareMapCache(map);
            }

            // force a one-shot redraw so the newly loaded neighbor appears at the seam
            const p = window.Sprites && Sprites.get && Sprites.get('player');
            if (p && window.Camera && window.Renderer && typeof Renderer.drawView === "function") {
                const TILE = 16;
                const ox = Math.floor((p.x - Camera.cx) / TILE);
                const oy = Math.floor((p.y - Camera.cy) / TILE);
                Renderer.drawView(ox, oy);
            }

            return map;
        } catch (e) {
            console.debug("[World] Neighbor load exception:", mid, e);
            return null;
        } finally {
            _loading.delete(mid);
        }
    }

    // Internal: preload adjacents for a map (no reloading current)
    async function _preloadNeighbors(map) {
        if (!map || !map.connections) return;
        const conn = map.connections || {};
        const want = [];
        if (conn.north && conn.north.mapId) want.push(conn.north.mapId);
        if (conn.east  && conn.east.mapId)  want.push(conn.east.mapId);
        if (conn.south && conn.south.mapId) want.push(conn.south.mapId);
        if (conn.west  && conn.west.mapId)  want.push(conn.west.mapId);
        const jobs = want.map(id => _ensureMapLoaded(id));
        await Promise.allSettled(jobs);
    }

    // Public: attach a new current map (keep it resident, preload neighbors)
    async function attachMap(map) {
        if (!map) return;
        _maps.set(map.id, map);
        _current = map;
        _indexMapObjects(map);
        // prepare renderer cache for the current map
        if (window.Renderer && typeof Renderer.prepareMapCache === "function") {
            Renderer.prepareMapCache(map);
        }
        // Preload after a microtask to avoid blocking attach
        Promise.resolve().then(() => _preloadNeighbors(map));
        // Handle BGM immediately on world attach (used by warp and seam switch)
        _maybeSwitchBgmFor(map);
    }

    // Public: optionally set/override directory
    function setDir(dir) { if (dir) _dir = String(dir); }

    // Compute neighbor ownership for a tile relative to current map
    // Returns { map, tx, ty } if the tile belongs to current or a loaded neighbor; otherwise null.
    function resolveOwner(tx, ty) {
        const cur = _current;
        if (!cur) return null;
        const cx = Math.trunc(tx), cy = Math.trunc(ty);

        // First: if inside current bounds, the owner is current
        const grid = cur.grid && cur.grid.squares;
        if (grid && cx >= 0 && cy >= 0 && cx < grid.width && cy < grid.height) {
            return { map: cur, tx: cx, ty: cy };
        }

        // Outside current: check each side with offsets.
        const c = cur.connections || null;
        if (!c) return null;

        // Helper: test one direction
        function testNorth() {
            // north neighbor's SOUTH edge meets current's north edge; X offset applies
            if (!c.north || !c.north.mapId) return null;
            const nb = _getMap(c.north.mapId);
            if (!nb || !nb.grid || !nb.grid.squares) return null;
            // New code: map current cy (-1, -2, ...) to neighbor ty = nb.height + cy (so -1 -> nb.height-1)
            const ny = nb.grid.squares.height + cy;
            const nx = cx - toInt(c.north.offset);
            if (nx >= 0 && nx < nb.grid.squares.width && ny >= 0 && ny < nb.grid.squares.height) {
                return { map: nb, tx: nx, ty: ny };
            }
            return null;
        }
        function testSouth() {
            if (!c.south || !c.south.mapId) return null;
            const nb = _getMap(c.south.mapId);
            if (!nb || !nb.grid || !nb.grid.squares) return null;
            // Current y = cur.height maps to neighbor ty = 0
            const ny = cy - grid.height; // cy == grid.height .. -> 0
            const nx = cx - toInt(c.south.offset);
            if (nx >= 0 && nx < nb.grid.squares.width && ny >= 0 && ny < nb.grid.squares.height) {
                return { map: nb, tx: nx, ty: ny };
            }
            return null;
        }
        function testWest() {
            if (!c.west || !c.west.mapId) return null;
            const nb = _getMap(c.west.mapId);
            if (!nb || !nb.grid || !nb.grid.squares) return null;
            // New code: map current cx (-1, -2, ...) to neighbor tx = nb.width + cx (so -1 -> nb.width-1)
            const nx = nb.grid.squares.width + cx;
            const ny = cy - toInt(c.west.offset);
            if (ny >= 0 && ny < nb.grid.squares.height && nx >= 0 && nx < nb.grid.squares.width) {
                return { map: nb, tx: nx, ty: ny };
            }
            return null;
        }
        function testEast() {
            if (!c.east || !c.east.mapId) return null;
            const nb = _getMap(c.east.mapId);
            if (!nb || !nb.grid || !nb.grid.squares) return null;
            // Current x = cur.width maps to neighbor tx = 0
            const nx = cx - grid.width; // cx == grid.width .. -> 0
            const ny = cy - toInt(c.east.offset);
            if (ny >= 0 && ny < nb.grid.squares.height && nx >= 0 && nx < nb.grid.squares.width) {
                return { map: nb, tx: nx, ty: ny };
            }
            return null;
        }

        // Test in most likely directions first by sign
        if (cy < 0) {
            return testNorth() || testWest() || testEast() || null;
        } else if (cy >= (grid ? grid.height : 0)) {
            return testSouth() || testWest() || testEast() || null;
        } else if (cx < 0) {
            return testWest() || testNorth() || testSouth() || null;
        } else if (cx >= (grid ? grid.width : 0)) {
            return testEast() || testNorth() || testSouth() || null;
        }
        return null;
    }

    // Public: world-aware square read for visuals/collision (null if no owner)
    function worldSquareAt(tx, ty) {
        const own = resolveOwner(tx, ty);
        if (!own) return null;
        const grid = own.map.grid && own.map.grid.squares;
        if (!grid) return null;
        const id = grid.ids[own.ty * grid.width + own.tx];
        const idx = (id == null ? own.map.voidSquare : id);
        return own.map.squares[idx] || null;
    }

    // Internal: get indexed objects for a map
    function _objectsAt(map, tx, ty) {
        const idx = _objIndex.get(map.id);
        if (!idx) return [];
        const arr = idx.byTile.get(keyOf(tx, ty));
        return arr ? arr.slice() : [];
    }

    // Public: trigger queries with precedence (owning map first, then current map OOB)
    function onStep(ctx) {
        if (!_current || !ctx) return [];
        const tx = Math.trunc(ctx.tx), ty = Math.trunc(ctx.ty);
        const own = resolveOwner(tx, ty);
        // owning map first
        if (own) {
            const list = _objectsAt(own.map, own.tx, own.ty);
            const act = _firstActions(list);
            if (act.length > 0) return act;
        }
        // fallback: OOB objects on current map at the original coords
        const listCur = _objectsAt(_current, tx, ty);
        return _firstActions(listCur);
    }

    function onPressA(ctx) {
        if (!_current || !ctx) return [];
        const tx = Math.trunc(ctx.tx), ty = Math.trunc(ctx.ty);
        const dir = String(ctx.dir || ctx.facing || "down");
        // check front tile; if talkOver, also check one beyond (use Collision.step if present)
        const stepFn = (g.Collision && typeof g.Collision.step === "function")
            ? g.Collision.step
            : ((x, y, d) => {
                switch (String(d).toLowerCase()) {
                    case "up": case "n": return [x, y - 1];
                    case "down": case "s": return [x, y + 1];
                    case "left": case "w": return [x - 1, y];
                    case "right": case "e": return [x + 1, y];
                    default: return [x, y];
                }
            });

        const tiles = [];
        const [fx, fy] = stepFn(tx, ty, dir);
        tiles.push([fx, fy]);

        // if front is talkOver, add one more
        const frontSq = worldSquareAt(fx, fy);
        if (frontSq && frontSq.collision && frontSq.collision.talkOver) {
            const [fx2, fy2] = stepFn(fx, fy, dir);
            tiles.push([fx2, fy2]);
        }

        for (let i = 0; i < tiles.length; i++) {
            const [qx, qy] = tiles[i];
            const own = resolveOwner(qx, qy);
            if (own) {
                const list = _objectsAt(own.map, own.tx, own.ty);
                const act = _firstActions(list);
                if (act.length > 0) return act;
            }
            const listCur = _objectsAt(_current, qx, qy);
            const act2 = _firstActions(listCur);
            if (act2.length > 0) return act2;
        }
        return [];
    }

    function onBump(ctx) {
        if (!_current || !ctx) return [];
        const tx = Math.trunc(ctx.tx), ty = Math.trunc(ctx.ty);
        const dir = String(ctx.dir || ctx.facing || "down");

        const stepFn = (g.Collision && typeof g.Collision.step === "function")
            ? g.Collision.step
            : ((x, y, d) => {
                switch (String(d).toLowerCase()) {
                    case "up": case "n": return [x, y - 1];
                    case "down": case "s": return [x, y + 1];
                    case "left": case "w": return [x - 1, y];
                    case "right": case "e": return [x + 1, y];
                    default: return [x, y];
                }
            });

        const [fx, fy] = stepFn(tx, ty, dir);

        const own = resolveOwner(fx, fy);
        if (own) {
            const list = _objectsAt(own.map, own.tx, own.ty);
            const act = _firstActions(list);
            if (act.length > 0) return act;
        }
        const listCur = _objectsAt(_current, fx, fy);
        return _firstActions(listCur);
    }

    // Build first action list using existing ObjectManager semantics
    function _firstActions(list) {
        if (!Array.isArray(list) || list.length === 0) return [];
        for (let i = 0; i < list.length; i++) {
            const obj = list[i];
            // Borrow ObjectManager’s action building logic by replicating minimal subset here
            if (obj.kind === "warp" && obj.to && obj.to.mapId) {
                return [{
                    type: "warp",
                    object: obj,
                    to: {
                        mapId: String(obj.to.mapId),
                        x: Number.isFinite(obj.to.x) ? Math.trunc(obj.to.x) : undefined,
                        y: Number.isFinite(obj.to.y) ? Math.trunc(obj.to.y) : undefined,
                        facing: (obj.to.facing != null) ? String(obj.to.facing) : undefined
                    },
                    transition: (obj.transition && typeof obj.transition === "object")
                        ? {
                            out: obj.transition.out ? String(obj.transition.out) : undefined,
                            in:  obj.transition.in  ? String(obj.transition.in)  : undefined
                        } : undefined,
                    sfx: (obj.sfx != null) ? String(obj.sfx) : undefined,
                    setOnUse: Array.isArray(obj.setOnUse) ? obj.setOnUse.slice() : undefined,
                    once: !!obj.once,
                    autoWalk: !!obj.autoWalk
                }];
            }
            if (obj.script) {
                return [{
                    type: "script",
                    object: obj,
                    id: String(obj.script),
                    args: Array.isArray(obj.args) ? obj.args.slice() : undefined
                }];
            }
            if (obj.kind === "sfx" && obj.sfx) {
                return [{ type: "sfx", object: obj, id: String(obj.sfx) }];
            }
        }
        return [];
    }

    // Public: call each frame after player tile settles to switch maps seamlessly if needed
    async function checkMapSwitchAndApply(player) {
        if (!_current || !player) return;
        if (!g.Collision) return;

        // Determine player tile relative to current
        const tx = g.Collision.toTileX(player.x);
        const ty = g.Collision.toTileY(player.y);

        const own = resolveOwner(tx, ty);
        if (!own) return; // no neighbor ownership applies; still on current

        // If owner map differs, perform a seamless switch
        if (own.map.id !== _current.id) {
            // Ensure owner is loaded (it should be if resolveOwner succeeded)
            await attachMap(own.map);
            
            // Snap player to resolved neighbor tile coordinates (tile -> px)
            player.x = own.tx * 16;
            player.y = own.ty * 16;

            // New code: cancel in-progress movement so we don’t keep walking after the seam switch
            if (player) {
                player.moving = false;
                player.targetX = player.x;
                player.targetY = player.y;
                player.animTick = 0;
                player.bumping = false;
                player.bumpTick = 0;
                if (typeof player._pressAge === 'number') player._pressAge = 0;
            }

            // Attach to renderer and collision for the new current map
            if (g.Renderer && typeof g.Renderer.attachMap === "function") {
                g.Renderer.attachMap(_current);
            }
            if (g.Collision && typeof g.Collision.attachMap === "function") {
                g.Collision.attachMap(_current);
            }

            // Force a redraw aligned to camera
            const TILE = 16;
            const ox = Math.floor((player.x - g.Camera.cx) / TILE);
            const oy = Math.floor((player.y - g.Camera.cy) / TILE);
            if (g.Renderer && typeof g.Renderer.drawView === "function") {
                g.Renderer.drawView(ox, oy);
            }
            // Camera target remains the same; Debug UI will read World.currentMap()
        }
    }

    // Internal: switch BGM according to the map’s bgm field and policy
    function _maybeSwitchBgmFor(map) {
        const next = String(map.bgm || "");
        if (!_audioBgmId) {
            _audioBgmId = next || null;
            if (next && g.Audio && typeof g.Audio.playBgm === "function") {
                // play immediately on first attach
                g.Audio.playBgm(next, { fadeMs: 0 });
            }
            return;
        }
        // Identical track: do nothing
        if (next && _audioBgmId && next === _audioBgmId) return;

        // Different track: fade out current, play next immediately (no fade-in)
        if (g.Audio) {
            if (typeof g.Audio.fadeOutBgm === "function") {
                g.Audio.fadeOutBgm(250);
            }
            if (next && typeof g.Audio.playBgm === "function") {
                g.Audio.playBgm(next, { fadeMs: 0 });
            }
        }
        _audioBgmId = next || null;
    }

    g.World = {
        init,
        setDir,
        attachMap,
        currentMap,
        resolveOwner,
        worldSquareAt,
        onStep,
        onPressA,
        onBump,
        checkMapSwitchAndApply
    };
})(window);
