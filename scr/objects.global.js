/*
    objects.global.js
    Runtime object manager for map-placed objects (NPCs, items, warps, triggers, etc.).

    Responsibilities:
    - Accept the current map (from MapLoader) and index objects by tile for fast queries.
    - Provide trigger evaluations for common interactions:
        - onStep: called after the player moves onto a tile (e.g., auto warp tiles).
        - onPressA: interaction with the tile in front; if the front tile is talkOver, also check one beyond.

    Notes:
    - This module is purely a decision layer: it returns "actions" to be executed by the caller
    (e.g., warps should be executed by a runner in main.js).
    - Flags gates are respected when present:
        - requires: [flagKey,...] must all be true (Flags.has(key) === true).
        - once: action will not fire again if a default "used" flag is already set for this object.
        - setOnUse: [flagKey,...] should be set true after successful execution by the runner.

    Action shapes (returned by onStep/onPressA):
        { type:'warp',   object, to:{mapId,x,y}, transition?:{out,in}, sfx?:string, setOnUse?:string[], once?:boolean }
        { type:'script', object, id:string, args?:any[] }
        { type:'sfx',    object, id:string }

    Integration points:
    - Call ObjectManager.attachMap(map) after MapLoader returns a map and before gameplay resumes.
    - After the player finishes a step: call ObjectManager.onStep({ tx, ty }).
    - On A-press: call ObjectManager.onPressA({ tx, ty, dir, facing }) and run the first action if returned.

    Dependencies:
    - Collision.squareAt(tx,ty) to read per-square attributes (talkOver).
    - Collision.step(tx,ty,dir) to compute front/next tiles.
    - Flags (optional but used when present).

    Implementation style:
    - IIFE that attaches a single ObjectManager instance to window.
    - 4-space indentation and verbose comments by design, consistent with project style.
*/

(function (g) {
    "use strict";

    // Utility: build "x,y" key for tile index map (keeps JS Maps simple).
    function keyOf(tx, ty) { return String(tx) + "," + String(ty); }

    // Utility: optional Flags reads (safe if Flags not loaded yet).
    function hasFlag(k)  { return (g.Flags && typeof g.Flags.has === "function") ? g.Flags.has(k) : false; }
    function setFlag(k)  { return (g.Flags && typeof g.Flags.set === "function") ? g.Flags.set(k, true) : true; }
    function getNS(ns)   { return (g.Flags && typeof g.Flags.ns === "function") ? g.Flags.ns(ns) : null; }

    // Module-scoped state
    var _map = null;                    // currently attached map
    var _byTile = new Map();            // "tx,ty" -> [object, ...]
    var _objIndex = new Map();          // object.id -> object (normalized record from MapLoader)

    // Public API shell
    var ObjectManager = {
        attachMap: attachMap,
        onStep: onStep,
        onPressA: onPressA,
        onBump: onBump,

        // helpers if needed for debugging or UI
        objectsAt: objectsAt,
        getById: function (id) { return _objIndex.get(id) || null; },
        currentMap: function () { return _map; }
    };

    // Attach a map and build per-tile indexes for objects
    function attachMap(map) {
        _map = map || null;
        _byTile.clear();
        _objIndex.clear();

        if (!_map || !Array.isArray(_map.objects)) return;

        for (var i = 0; i < _map.objects.length; i++) {
            var o = _map.objects[i];
            if (!o) continue;

            _objIndex.set(o.id, o);

            // Only place objects that have a valid grid coordinate.
            var tx = Number.isFinite(o.x) ? Math.trunc(o.x) : null;
            var ty = Number.isFinite(o.y) ? Math.trunc(o.y) : null;
            if (tx == null || ty == null) continue;

            var k = keyOf(tx, ty);
            var arr = _byTile.get(k);
            if (!arr) { arr = []; _byTile.set(k, arr); }
            arr.push(o);
        }
    }

    // Return shallow copy of objects at a tile (or empty array)
    function objectsAt(tx, ty) {
        var arr = _byTile.get(keyOf(tx, ty));
        return arr ? arr.slice() : [];
    }

    // Check flags for gating behavior.
    // - requires: every listed flag key must be present (true).
    // - once:     if true, we consult a default used-flag key for this object to prevent re-triggering.
    // - used-flag convention: "obj:<mapId>:<objId>:used"
    function isFlagGateOpen(obj) {
        // requires
        if (Array.isArray(obj.requires) && obj.requires.length > 0) {
            for (var i = 0; i < obj.requires.length; i++) {
                var req = String(obj.requires[i]);
                if (!hasFlag(req)) return false;
            }
        }
        // once
        if (obj.once) {
            var usedKey = "obj:" + String(_map && _map.id || "") + ":" + String(obj.id) + ":used";
            if (hasFlag(usedKey)) return false;
        }
        return true;
    }

    // Build actions for an object given a trigger context.
    // We support a minimal core: warp, script, and sfx. Extend as needed.
    function buildActionsFor(obj) {
        var actions = [];

        if (obj.kind === "warp" && obj.to && obj.to.mapId) {
            actions.push({
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
                    }
                    : undefined,
                sfx: (obj.sfx != null) ? String(obj.sfx) : undefined,
                setOnUse: Array.isArray(obj.setOnUse) ? obj.setOnUse.slice() : undefined,
                once: !!obj.once,
                autoWalk: !!obj.autoWalk
            });
            return actions;
        }

        if (obj.script) {
            actions.push({
                type: "script",
                object: obj,
                id: String(obj.script),
                args: Array.isArray(obj.args) ? obj.args.slice() : undefined
            });
        }

        if (obj.kind === "sfx" && obj.sfx) {
            actions.push({ type: "sfx", object: obj, id: String(obj.sfx) });
        }

        return actions;
    }

    // Decide if an object should respond to a given activation kind ("step" or "pressA")
    // Trigger conventions:
    //  - If trigger exists, respect explicit flags (onStep, onPressA).
    //  - If trigger is absent:
    //      * "warp": default is onStep (classic indoor door mats) unless author opted out.
    //      * "npc" / "sign" / "item": default is onPressA.
    function matchesTrigger(obj, kind) {
        var trg = obj.trigger || null;

        if (trg && typeof trg === "object") {
            if (kind === "step")   return !!trg.onStep;
            if (kind === "pressA") return !!trg.onPressA;
            if (kind === "bump")  return !!trg.onBump;
            return false;
        }

        // Defaults when no trigger object is authored
        if (obj.kind === "warp")  return (kind === "step");
        if (obj.kind === "npc")   return (kind === "pressA");
        if (obj.kind === "sign")  return (kind === "pressA");
        if (obj.kind === "item")  return (kind === "pressA");

        // Other kinds: opt-in only
        return false;
    }

    // STEP: called after the player occupies (tx,ty)
    function onStep(ctx) {
        if (!_map || !ctx) return [];
        var tx = Math.trunc(ctx.tx), ty = Math.trunc(ctx.ty);

        var list = objectsAt(tx, ty);
        if (list.length === 0) return [];

        for (var i = 0; i < list.length; i++) {
            var obj = list[i];

            // Gate by trigger and flags
            if (!matchesTrigger(obj, "step")) continue;
            if (!isFlagGateOpen(obj)) continue;

            var actions = buildActionsFor(obj);
            if (actions.length > 0) {
                return actions;
            }
        }
        return [];
    }

    // PRESS A: evaluate the tile in front; if that tile is talkOver, also check one beyond the front.
    // This enables "talk over a counter" behavior automatically when the front square has talkOver=true.
    function onPressA(ctx) {
        if (!_map || !ctx) return [];
        var tx = Math.trunc(ctx.tx), ty = Math.trunc(ctx.ty);
        var dir = String(ctx.dir || ctx.facing || "down");

        // Compute the candidate tiles to check:
        //   [front], and if front is talkOver, also [front + dir]
        var cand = [];

        if (g.Collision && typeof g.Collision.step === "function" && typeof g.Collision.squareAt === "function") {
            var step1 = g.Collision.step(tx, ty, dir);
            var fx = step1[0], fy = step1[1];
            cand.push([fx, fy]);

            var sqFront = g.Collision.squareAt(fx, fy);
            var isTalkOver = !!(sqFront && sqFront.collision && sqFront.collision.talkOver);

            if (isTalkOver) {
                var step2 = g.Collision.step(fx, fy, dir);
                cand.push([step2[0], step2[1]]);
            }
        } else {
            // Fallback: only the front tile if Collision isn't available
            cand.push([tx, ty]);
        }

        // Scan candidates in order; first actionable object wins
        for (var c = 0; c < cand.length; c++) {
            var pair = cand[c];
            var list = objectsAt(pair[0], pair[1]);
            if (list.length === 0) continue;

            for (var i = 0; i < list.length; i++) {
                var obj = list[i];

                // Gate by trigger and flags
                if (!matchesTrigger(obj, "pressA")) continue;
                if (!isFlagGateOpen(obj)) continue;

                var actions = buildActionsFor(obj);
                if (actions.length > 0) {
                    return actions;
                }
            }
        }

        return [];
    }

    // BUMP: called when the player attempts to move into a blocked/oob tile in a direction.
    // We look at the front tile first; if none match, we also consider the current tile as a fallback.
    function onBump(ctx) {
        if (!_map || !ctx) return [];
        var tx = Math.trunc(ctx.tx), ty = Math.trunc(ctx.ty);
        var dir = String(ctx.dir || ctx.facing || "down");

        var candidates = [];

        if (g.Collision && typeof g.Collision.step === "function") {
            var front = g.Collision.step(tx, ty, dir);
            candidates.push([front[0], front[1]]);    // front tile (can be OOB; we index objects by coords only)
        } else {
            // No collision helpers: fall back to current tile only
        }

        // Fallback: current tile (e.g., edge-case authoring)
        candidates.push([tx, ty]);

        for (var c = 0; c < candidates.length; c++) {
            var pair = candidates[c];
            var list = objectsAt(pair[0], pair[1]);
            if (list.length === 0) continue;

            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if (!matchesTrigger(obj, "bump")) continue;
                if (!isFlagGateOpen(obj)) continue;

                var actions = buildActionsFor(obj);
                if (actions.length > 0) return actions;
            }
        }

        return [];
    }

    // Expose globally
    g.ObjectManager = ObjectManager;

})(window);
