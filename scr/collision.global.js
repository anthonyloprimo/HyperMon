(function (g) {
    "use strict";

    const TILE = 16;

    const Collision = {
        attachMap,
        squareAt,
        canStartStep,
        // helpers (exported for later phases / debugging)
        toTileX: px => (px / TILE) | 0,
        toTileY: py => (py / TILE) | 0,
        step
    };
    g.Collision = Collision;

    // current map views
    let SQUARES = null;
    let GRID = null;
    let VOID_ID = 0;

    function attachMap(map) {
        // squares - tile definitions w/ collision/attributes
        SQUARES = map && map.squares || null;

        // grid - supports map.grid.squares or map.map
        if (map && map.grid && map.grid.squares) {
            GRID = map.grid.squares;
        } else if (map && map.map) {
            GRID = map.map;
        } else {
            GRID = null;
        }

        // void square ID
        VOID_ID = (map && (map.voidSquare ?? map.map?.voidSquare)) ?? 0;
    }

    function squareAt(tx, ty) {
        if (!GRID || !SQUARES) return null;
        if (tx < 0 || ty < 0 || tx >= GRID.width || ty >= GRID.height) return null;
        const sid = GRID.ids[ty * GRID.width + tx];
        const idx = (sid == null ? VOID_ID : sid);
        return SQUARES[idx] || null;
    }

    // dir: "up"|"down"|"left"|"right" OR "N"|"S"|"W"|"E"
    function step(tx, ty, dir) {
        switch (dir) {
            case "up": case "N":    return [tx,     ty - 1];
            case "down": case "S":  return [tx,     ty + 1];
            case "left": case "W":  return [tx - 1, ty    ];
            case "right": case "E": return [tx + 1, ty    ];
            default:                return [tx,     ty    ];
        }
    }

    // Check square flags
    function isSolidFromCollision(sq) {
        if (!sq) return true;
        const c = sq.collision || {};
        return !!c.solid;
    }
    function dirToCard(dir) {
        if (dir == null) return null;
        const d = String(dir).trim().toUpperCase();

        if (d === "UP" || d === "NORTH") return "N";
        if (d === "RIGHT" || d === "EAST") return "E";
        if (d === "DOWN" || d === "SOUTH") return "S";
        if (d === "LEFT" || d === "WEST") return "W";

        if ("NESW".includes(d)) return d;
        return d[0] ?? null;
    }
    function canLedgeHopFrom(tx, ty, dir) {
        const want = dirToCard(dir);
        const [nx, ny] = step(tx, ty, dir);
        const edgeSq = squareAt(nx, ny);
        if (!edgeSq) return null;

        const c = edgeSq.collision || {};
        const edgeLedge = c.ledge || null;
        if (edgeLedge !== want) return null;

        const [lx, ly]  = step(nx, ny, dir);
        const landingSq = squareAt(lx, ly);
        if (!landingSq || isSolidFromCollision(landingSq)) return null;

        return { via: [nx, ny], landing: [lx, ly] };
    }
    // solid/out-of-bounds movement restriction
    // returns: { ok:boolean, mode:"WALK"|"HOP", reason?:string, landing?:[tx,ty] }
    function canStartStep(tx, ty, dir) {
        // ledge hop check
        const hop = canLedgeHopFrom(tx, ty, dir);
        console.debug(hop);
        if (hop) {
            console.debug("Yes, we can hop!")
            return {
                ok: true,
                mode: "HOP",
                via: hop.via,
                landing: hop.landing,
                distanceTiles: 2
            }
        }

        // Normal walking
        const [nx, ny] = step(tx, ty, dir);
        const destSq = squareAt(nx, ny);
        if (!destSq) return { ok: false, reason: "oob" };
        if (isSolidFromCollision(destSq)) return { ok: false, reason: "solid" };
        return { ok: true, mode: "WALK", landing: [nx, ny], distanceTiles: 1 };
    }
})(window);