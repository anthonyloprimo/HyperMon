(function (global) {
    "use strict";

    /*
        MapLoader: Parses authoring JSON (your map format) into a normalized, runtime-friendly object.
        - Uses console.debug with collapsed groups for readable diagnostics.
        - No rendering here. Output is a plain JS structure your renderer/logic can consume later.

        Public API:
            MapLoader.loadFromUrl(url) -> Promise<{ map: MapData, diagnostics: Diag[] }>
            MapLoader.parse(rawJsonObject) -> { map: MapData, diagnostics: Diag[] }

        MapData shape (summary):
            {
                id: <string from "mapName">,
                version: <number or string from "schema">,
                tileset: {  <string from "image">,
                            <number from "tileWidth">,
                            <number from "tileHeight">,
                            <number from "columns">,
                            <object from "animations">:
                                <hex number from the key name>,
                                <values from "image" (string), "totalFrames" (number), "frameWidth" (number), and "frameHeight" (number)> },
                squares: [ { tiles:[n,n,n,n], flags, tags:string[] } ],
                blocks:  [ { squares:[n,n,n,n] } ] | [],  <-- This is OPTIONAL!  If "blocks" key is present, we parse blocks and normalize to squares, otherwise only pull from "squares"
                placement: "blocks"|"squares",  <------------ detected implicitly
                grid: {
                    squares: { width, height, ids: Uint16Array },  <-------- always present
                    blocks:  { width, height, ids: Uint16Array } | null  <-- optional, only if "blocks" key is present.
                },
                voidSquare: number,  <===------------------------ Pick a square to repeat for out-of-bounds appearance
                voidBlock: [number, number, number, number],  <-- ...or pick a block to repeat for out-of-bounds appearance.
                connections: { north, east, south, west },  <---- null or { mapId, offset }
                objects: [ normalized objects... ],  <----------- collection of objects to place on the map (i.e. NPCs, items, decor)
                encounters: { land, water, rods:{old,good,super}, zones: [...] },  <-- Encounter tables, may include zones to override global map encounter tables if desired
                diagnostics: [ { level:"warn"|"error"|"info", code, message, ctx? } ]
            }
    */

    const MapLoader = {};

    // -----------------------
    // Utilities
    // -----------------------

    function dgroup(title) { try { console.groupCollapsed(title); } catch (e) {} }
    function dend() { try { console.groupEnd(); } catch (e) {} }

    function diagPush(diags, level, code, message, ctx) {
        diags.push({ level, code, message, ctx });
        const prefix = (level === "error") ? "❌" : (level === "warn") ? "⚠️" : "ℹ️";
        console.debug(prefix, `[${code}]`, message, ctx || "");
    }

    function isHexString(v) { return typeof v === "string" && /^0x[0-9A-Fa-f]+$/.test(v); }

    function hexToInt(v, diags, ctx) {
        if (typeof v === "number") return v;
        if (isHexString(v)) return parseInt(v, 16);
        diagPush(diags, "warn", "HEX_PARSE", `Expected hex string like 0x1A; got ${String(v)}`, ctx);
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    }

    function clampInt(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    }

    function arrayOfLength(n, fill) {
        const a = new Array(n);
        for (let i = 0; i < n; i++) a[i] = (typeof fill === "function") ? fill(i) : fill;
        return a;
    }

    // Compile simple collision flags to a compact byte/bitfield (expand later if needed)
    function compileCollisionFlags(c) {
        // bits: 0=solid, 1=talkOver, 2..3=ledge dir, 4..6=surface enum
        const SURF = { normal: 0, water: 1, ice: 2, sand: 3 };
        const LEDGE = { N: 1, S: 2, E: 3, W: 4 };
        let bits = 0;
        if (c && c.solid) bits |= 1 << 0;
        if (c && c.talkOver) bits |= 1 << 1;
        if (c && c.ledge && LEDGE[c.ledge]) {
            bits |= (LEDGE[c.ledge] & 0b11) << 2; // 2 bits
        }
        if (c && c.surface && (c.surface in SURF)) {
            bits |= (SURF[c.surface] & 0b111) << 4; // 3 bits
        }
        return bits;
    }

    function sumWeights(arr) {
        let s = 0;
        for (let i = 0; i < arr.length; i++) s += (arr[i].rate || 0);
        return s;
    }

    function compileEncounterTable(raw) {
        // Returns { slots:[...], total:number, cdf: number[] }
        const slots = Array.isArray(raw) ? raw.slice() : [];
        const total = sumWeights(slots);
        let c = 0;
        const cdf = slots.map(s => (c += (s.rate || 0)));
        return { slots, total, cdf };
    }

    function composeRods(mapLevel) {
        // Fallback rule: effective rod table = sum of tiers up to the rod rank, capped by highest defined tier
        const oldT = compileEncounterTable(mapLevel.rodOld || []);
        const goodT = compileEncounterTable(mapLevel.rodGood || []);
        const superT = compileEncounterTable(mapLevel.rodSuper || []);

        const hasOld = oldT.total > 0;
        const hasGood = goodT.total > 0;
        const hasSuper = superT.total > 0;

        function mergeTables(a, b) {
            if (!a || a.slots.length === 0) return b;
            if (!b || b.slots.length === 0) return a;
            const slots = a.slots.concat(b.slots);
            const total = sumWeights(slots);
            let c = 0;
            const cdf = slots.map(s => (c += (s.rate || 0)));
            return { slots, total, cdf };
        }

        // Highest defined tier among map-level tables:
        const highest = hasSuper ? "super" : (hasGood ? "good" : (hasOld ? "old" : null));

        const effOld  = (highest === "old")  ? oldT  : (highest === "good") ? oldT : (highest === "super") ? oldT : compileEncounterTable([]);
        const effGood = (highest === "old")  ? oldT  :
                        (highest === "good") ? mergeTables(oldT, goodT) :
                        (highest === "super")? mergeTables(oldT, goodT) : compileEncounterTable([]);
        const effSuper = (highest === "old")  ? oldT  :
                        (highest === "good") ? mergeTables(oldT, goodT) :
                        (highest === "super")? mergeTables(mergeTables(oldT, goodT), superT) :
                        compileEncounterTable([]);

        return { old: effOld, good: effGood, super: effSuper };
    }

    // -----------------------
    // Compilers
    // -----------------------

    function compileTileset(raw, diags) {
        dgroup("Tileset");
        const tileset = {
            image: String(raw.image || ""),
            tileWidth: clampInt(raw.tileWidth || 8, 1, 1024),
            tileHeight: clampInt(raw.tileHeight || 8, 1, 1024),
            columns: clampInt(raw.columns || 16, 1, 1024),
            animations: new Map()
        };
        // Optional author override; if not present we assume padded = tile size
        const gapX = Number.isFinite(raw.gapX) ? Math.max(0, raw.gapX|0) : tileset.tileWidth;
        const gapY = Number.isFinite(raw.gapY) ? Math.max(0, raw.gapY|0) : tileset.tileHeight;

        tileset.gapX   = gapX;
        tileset.gapY   = gapY;
        tileset.pitchX = tileset.tileWidth  + gapX;   // 8 + 8 = 16 in your default
        tileset.pitchY = tileset.tileHeight + gapY;

        const anims = raw.animations || {};
        for (const key in anims) {
            const ti = hexToInt(key, diags, { where: "tileset.animations.key" });
            const a = anims[key] || {};
            const def = {
                image: String(a.image || ""),
                totalFrames: clampInt(a.totalFrames || 1, 1, 4096),
                frameWidth: clampInt(a.frameWidth || tileset.tileWidth, 1, 4096),
                frameHeight: clampInt(a.frameHeight || tileset.tileHeight, 1, 4096)
            };
            tileset.annotations = tileset.annotations || {};
            tileset.animations.set(ti, def);
            console.debug("↳ anim tile", key, "→", def);
        }

        console.debug("tileset:", tileset);
        dend();
        return tileset;
    }

    function compileSquares(rawSquares, diags) {
        dgroup("Squares (meta tiles)");
        const out = [];
        if (!Array.isArray(rawSquares) || rawSquares.length === 0) {
            diagPush(diags, "error", "SQUARES_EMPTY", "No squares defined.", null);
            dend();
            return out;
        }

        function normalizeCollision(c) {
            if (!c) c = {};
            // allow null or any of the cardinal directions (N, E, S, W) for ledge
            const ledge = (c.ledge === null || c.ledge === undefined) ? null : String(c.ledge);
            return {
                solid: !!c.solid,
                talkOver: !!c.talkOver,
                ledge: ledge,
                surface: c.surface ?? "normal"
            };
        }

        for (let i = 0; i < rawSquares.length; i++) {
            const sq = rawSquares[i] || {};
            const tiles = sq.tiles || [];
            if (tiles.length !== 4) {
                diagPush(diags, "warn", "SQUARE_TILES_LEN", `Square ${i} has ${tiles.length} tiles; expected 4.`, null);
            }
            const t0 = hexToInt(tiles[0] ?? 0, diags, { square: i, tile: 0 });
            const t1 = hexToInt(tiles[1] ?? 0, diags, { square: i, tile: 1 });
            const t2 = hexToInt(tiles[2] ?? 0, diags, { square: i, tile: 2 });
            const t3 = hexToInt(tiles[3] ?? 0, diags, { square: i, tile: 3 });

            const collision = normalizeCollision(sq.collision || {});
            const tags = Array.isArray(sq.attributes?.tags) ? sq.attributes.tags.slice() : [];

            out.push({ tiles: [t0, t1, t2, t3], collision, tags });
        }
        console.debug(`compiled ${out.length} squares`);
        dend();
        return out;
    }

    function compileBlocks(rawBlocks, squares, diags) {
        dgroup("Blocks (optional)");
        if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) {
            console.debug("(absent)");
            dend();
            return [];
        }
        const out = [];
        for (let i = 0; i < rawBlocks.length; i++) {
            const b = rawBlocks[i] || {};
            const arr = b.squares || [];
            if (arr.length !== 4) {
                diagPush(diags, "warn", "BLOCK_SQUARES_LEN", `Block ${i} has ${arr.length} entries; expected 4.`, null);
            }
            const s0 = clampInt(arr[0] ?? 0, 0, squares.length - 1);
            const s1 = clampInt(arr[1] ?? 0, 0, squares.length - 1);
            const s2 = clampInt(arr[2] ?? 0, 0, squares.length - 1);
            const s3 = clampInt(arr[3] ?? 0, 0, squares.length - 1);
            out.push({ squares: [s0, s1, s2, s3] });
        }
        console.debug(`compiled ${out.length} blocks`);
        dend();
        return out;
    }

    function expandMapGrid(rawMap, squares, blocks, diags) {
        dgroup("Map grid expansion");

        const widthSq = clampInt(rawMap.width || 0, 1, 100000);
        const heightSq = clampInt(rawMap.height || 0, 1, 100000);
        const ids = Array.isArray(rawMap.ids) ? rawMap.ids.slice() : [];
        const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
        const placement = hasBlocks ? "blocks" : "squares";

        let blockGrid = null;
        let squareGrid = null;

        if (placement === "squares") {
            const needed = widthSq * heightSq;
            if (ids.length !== needed) {
                diagPush(diags, "error", "MAP_IDS_LEN",
                    `ids length (${ids.length}) does not match width*height (${needed}) for squares placement.`, null);
            }
            const sqIds = new Uint16Array(needed);
            for (let i = 0; i < needed; i++) {
                const idx = clampInt(ids[i] ?? 0, 0, squares.length - 1);
                sqIds[i] = idx;
            }
            squareGrid = { width: widthSq, height: heightSq, ids: sqIds };
        } else {
            // placement === "blocks"
            // Authoring rule: map.width/height are in SQUARES, ids array is in BLOCKS (W/2 x H/2).
            if (widthSq % 2 !== 0 || heightSq % 2 !== 0) {
                diagPush(diags, "warn", "MAP_ODD_DIMS",
                    "Width/height are in squares but map uses blocks; expected even numbers. Truncating last row/col.", { widthSq, heightSq });
            }
            const bw = Math.floor(widthSq / 2);
            const bh = Math.floor(heightSq / 2);
            const neededBlocks = bw * bh;
            if (ids.length !== neededBlocks) {
                diagPush(diags, "error", "MAP_BLOCK_IDS_LEN",
                    `ids length (${ids.length}) does not match expected block grid (${bw}*${bh}=${neededBlocks}).`, null);
            }

            // Build blockGrid (for reference / potential rendering by blocks)
            const blockIds = new Uint16Array(neededBlocks);
            for (let i = 0; i < neededBlocks; i++) {
                const bid = clampInt(ids[i] ?? 0, 0, blocks.length - 1);
                blockIds[i] = bid;
            }
            blockGrid = { width: bw, height: bh, ids: blockIds };

            // Expand to squareGrid (truth for collision/logic)
            const sqW = bw * 2, sqH = bh * 2;
            const sqIds = new Uint16Array(sqW * sqH);
            for (let by = 0; by < bh; by++) {
                for (let bx = 0; bx < bw; bx++) {
                    const bIndex = by * bw + bx;
                    const block = blocks[blockIds[bIndex]];
                    const [ul, ur, bl, br] = block.squares;
                    const baseX = bx * 2;
                    const baseY = by * 2;
                    sqIds[(baseY + 0) * sqW + (baseX + 0)] = ul;
                    sqIds[(baseY + 0) * sqW + (baseX + 1)] = ur;
                    sqIds[(baseY + 1) * sqW + (baseX + 0)] = bl;
                    sqIds[(baseY + 1) * sqW + (baseX + 1)] = br;
                }
            }
            squareGrid = { width: sqW, height: sqH, ids: sqIds };
        }

        const voidSquare = clampInt(rawMap.voidSquare ?? 0, 0, squares.length - 1);
        const voidBlock = [voidSquare, voidSquare, voidSquare, voidSquare];

        console.debug(`placement=${placement}`, { widthSq, heightSq }, squareGrid, blockGrid);
        dend();
        return { placement, squareGrid, blockGrid, voidSquare, voidBlock };
    }

    function normalizeConnections(rawConn) {
        dgroup("Connections");
        const normEdge = (edge) => {
            if (edge == null) return null;
            const mapId = String(edge.mapId || "");
            const offset = Number.isFinite(edge.offset) ? Math.trunc(edge.offset) : 0;
            return { mapId, offset };
        };
        const connections = {
            north: normEdge(rawConn?.north || null),
            east:  normEdge(rawConn?.east  || null),
            south: normEdge(rawConn?.south || null),
            west:  normEdge(rawConn?.west  || null)
        };
        console.debug("connections:", connections);
        dend();
        return connections;
    }

    function normalizeObjects(rawObjects, diags) {
        dgroup("Objects");
        const out = [];
        const arr = Array.isArray(rawObjects) ? rawObjects : [];
        for (let i = 0; i < arr.length; i++) {
            const o = arr[i] || {};
            const name = String(o.name || `obj_${i}`);
            const kind = String(o.kind || "decor");
            const x = clampInt(o.x ?? 0, 0, 1 << 20);
            const y = clampInt(o.y ?? 0, 0, 1 << 20);
            const facing = o.facing ? String(o.facing) : undefined;
            const script = o.script ? String(o.script) : undefined;
            const itemId = o.itemId ? String(o.itemId) : undefined;
            out.push({ id: `${name}_${i}`, name, kind, x, y, facing, script, itemId });
        }
        console.debug(`objects: ${out.length}`);
        dend();
        return out;
    }

    function compileEncounters(raw, diags) {
        dgroup("Encounters");
        const land = compileEncounterTable(raw?.land || []);
        const water = compileEncounterTable(raw?.water || []);
        const rods = composeRods({
            rodOld: raw?.rodOld || [],
            rodGood: raw?.rodGood || [],
            rodSuper: raw?.rodSuper || []
        });

        const zones = [];
        const rz = Array.isArray(raw?.zones) ? raw.zones : [];
        for (let i = 0; i < rz.length; i++) {
            const z = rz[i] || {};
            const tl = Array.isArray(z.region?.tl) ? z.region.tl : [0, 0];
            const br = Array.isArray(z.region?.br) ? z.region.br : tl;
            const x = Math.min(tl[0] | 0, br[0] | 0);
            const y = Math.min(tl[1] | 0, br[1] | 0);
            const x2 = Math.max(tl[0] | 0, br[0] | 0);
            const y2 = Math.max(tl[1] | 0, br[1] | 0);
            const rect = { x, y, w: (x2 - x + 1), h: (y2 - y + 1) };

            const zLand = compileEncounterTable(z.land || []);
            const zWater = compileEncounterTable(z.water || []);
            const zRods = composeRods({
                rodOld: z.rodOld || [],
                rodGood: z.rodGood || [],
                rodSuper: z.rodSuper || []
            });

            zones.push({ rect, land: zLand, water: zWater, rods: zRods });
        }

        console.debug("land:", land, "water:", water, "rods:", rods, "zones:", zones);
        dend();
        return { land, water, rods, zones };
    }

    // -----------------------
    // Assembly
    // -----------------------

    function buildMapData(raw) {
        const diagnostics = [];
        dgroup(`MapLoader.parse – ${String(raw.mapName || "(unnamed)")}`);

        // 1) Tileset
        const tileset = compileTileset(raw.tileset || {}, diagnostics);

        // 2) Squares / Blocks
        const squares = compileSquares(raw.squares || [], diagnostics);
        const blocks  = compileBlocks(raw.blocks || [], squares, diagnostics);

        // 3) Map grid expansion
        const mapRaw = raw.map || {};
        const gridInfo = expandMapGrid(mapRaw, squares, blocks, diagnostics);

        // 4) Connections
        const connections = normalizeConnections(mapRaw.connections || null);

        // 5) Objects
        const objects = normalizeObjects(raw.objects || [], diagnostics);

        // 6) Encounters
        const encounters = compileEncounters(raw.encounters || {}, diagnostics);

        // 7) Final assembly
        const map = {
            id: String(raw.mapName || ""),
            version: raw.schema ?? 1,
            tileset,
            squares,
            blocks,
            placement: gridInfo.placement,
            grid: {
                squares: gridInfo.squareGrid,
                blocks: gridInfo.blockGrid
            },
            voidSquare: gridInfo.voidSquare,
            voidBlock: gridInfo.voidBlock,
            connections,
            objects,
            encounters,
            diagnostics
        };

        console.debug(
            `Loaded map ${map.id || "(unnamed)"} (schema ${map.version}).` +
            ` Squares: ${map.grid.squares.width}x${map.grid.squares.height}` +
            ` | blocks: ${map.grid.blocks ? (map.grid.blocks.width + "x" + map.grid.blocks.height) : "-"}` +
            ` | objects: ${map.objects.length}` +
            ` | zones: ${map.encounters.zones.length}`
        );
        dend();

        return { map, diagnostics };
    }

    // -----------------------
    // Public API
    // -----------------------

    MapLoader.parse = function (rawJsonObject) {
        return buildMapData(rawJsonObject);
    };

    MapLoader.loadFromUrl = async function (url) {
        dgroup(`MapLoader.loadFromUrl - ${url}`);
        try {
            if (location.protocol === "file:") {
                throw new Error("file:// origin blocks fetch for JSON.  Use MapLoader.register(...) with a .js map, or run over http(s).");
            }
            const resp = await fetch(url, { cache: "no-cache" });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const raw = await resp.json();
            dend();
            return buildMapData(raw);
        } catch (err) {
            console.debug("FETCH_ERROR", err);
            dend();
            return { map: null, diagnostics: [{ level: "error", code: "FETCH", message: String(err) }] };
        }
    };

    // --- Map registry for file:// mode (and general preloaded use) ---
    const _reg = Object.create(null);

    MapLoader.register = function(name, data) {
        _reg[name] = data;
    };

    MapLoader.get = function(name) {
        return _reg[name] || null;
    };

    MapLoader.has = function(name) {
        return Object.prototype.hasOwnProperty.call(_reg, name);
    };

    // -----------------------
    // Hybrid loader (.json first, then .js) for file:// and http(s)
    // -----------------------

    const _loadedScripts = new Set();

    function _joinPath(dir, filename) {
        if (!dir) return filename;
        if (!dir.endsWith("/") && !dir.endsWith("\\")) dir += "/";
        return dir + filename;
    }

    async function _tryFetchJson(url) {
        // fetch is blocked for file:// JSON; skip in that case
        if (location.protocol === "file:") return { ok: false, reason: "FILE_PROTOCOL" };
        try {
            const resp = await fetch(url, { cache: "no-cache" });
            if (!resp.ok) return { ok: false, reason: `HTTP_${resp.status}` };
            const raw = await resp.json();
            return { ok: true, raw };
        } catch (e) {
            return { ok: false, reason: String(e) };
        }
    }

    function _getRegisteredOrGlobal(name) {
        // Prefer registry if used
        if (MapLoader.has && MapLoader.has(name)) return MapLoader.get(name);
        // Otherwise look for a global var/window property (requires: var name = {...} OR window.name = {...})
        try {
            // Using Function avoids Closure Compiler removing bracket access; safe for our use.
            // eslint-disable-next-line no-new-func
            const getter = new Function("return this['" + name.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'];");
            const val = getter.call(window);
            if (val) return val;
        } catch (e) {}
        return null;
    }

    function _injectScriptOnce(src) {
        return new Promise((resolve, reject) => {
            if (_loadedScripts.has(src)) return resolve();
            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.onload = () => { _loadedScripts.add(src); resolve(); };
            s.onerror = () => { reject(new Error("SCRIPT_LOAD_FAILED: " + src)); };
            document.head.appendChild(s);
        });
    }

    // Public: try JSON, then JS. dir like "res/bg/maps/", name like "mapTemplate".
    MapLoader.loadMap = async function (dir, baseName) {
        const jsonUrl = _joinPath(dir, baseName + ".json");
        const jsUrl   = _joinPath(dir, baseName + ".js");

        dgroup(`MapLoader.loadMap – ${baseName}`);

        // Try JSON first (works on http/https)
        const jsonTry = await _tryFetchJson(jsonUrl);
        if (jsonTry.ok) {
            console.debug("→ loaded JSON:", jsonUrl);
            dend();
            return MapLoader.parse(jsonTry.raw);
        } else {
            console.debug("JSON not available:", jsonUrl, "reason:", jsonTry.reason);
        }

        // Fallback: load JS map file (works on file:// and http)
        try {
            await _injectScriptOnce(jsUrl);
            const raw = _getRegisteredOrGlobal(baseName);
            if (raw) {
                console.debug("→ loaded JS map:", jsUrl);
                dend();
                return MapLoader.parse(raw);
            }
            const hint = "Map JS must either call MapLoader.register('" + baseName + "', {...}) "
                    + "or assign a global var: var " + baseName + " = {...};";
            dend();
            return { map: null, diagnostics: [{ level: "error", code: "MAP_JS_NOT_FOUND", message: hint }] };
        } catch (e) {
            dend();
            return { map: null, diagnostics: [{ level: "error", code: "SCRIPT_LOAD_FAILED", message: String(e) }] };
        }
    };

    global.MapLoader = MapLoader;

})(window);
