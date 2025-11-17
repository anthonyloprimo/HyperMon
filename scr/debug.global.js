if (debug) {

$(".debugPane").css("display", "block");
const KNOWN_MAP_IDS = ["palletTown", "route1", "oaksLab", "playerHouse", "playerRoom", "rivalHouse"];

const muteBtn = document.getElementById("muteBtn");
if (muteBtn) {
    const syncMuteButton = () => {
        const vol = (window.AudioState && typeof AudioState.getMasterVolume === "function")
            ? AudioState.getMasterVolume()
            : 1;
        muteBtn.textContent = (vol > 0) ? "SOUND ON" : "SOUND OFF";
    };
    muteBtn.addEventListener("click", () => {
        if (window.AudioState && typeof AudioState.toggleMute === "function") {
            AudioState.toggleMute();
        }
        syncMuteButton();
    });
    syncMuteButton();
}

const clipBtn = document.getElementById("clipBtn");
if (clipBtn) {
    const syncClipButton = () => {
        const on = (window.Collision && typeof Collision.isIgnoringSolids === "function")
            ? Collision.isIgnoringSolids()
            : false;
        clipBtn.textContent = on ? "WALK THROUGH WALLS ON" : "WALK THROUGH WALLS OFF";
    };
    clipBtn.addEventListener("click", () => {
        if (window.Collision && typeof Collision.setIgnoreSolids === "function" && typeof Collision.isIgnoringSolids === "function") {
            Collision.setIgnoreSolids(!Collision.isIgnoringSolids());
        }
        syncClipButton();
    });
    syncClipButton();
}

const mapSelect = document.getElementById("mapSelect");
const mapXInput = document.getElementById("mapX");
const mapYInput = document.getElementById("mapY");
const mapWarpBtn = document.getElementById("mapWarpBtn");
if (mapSelect && mapXInput && mapYInput && mapWarpBtn) {
    const collectMapIds = () => {
        const set = new Set(KNOWN_MAP_IDS);
        if (window.World && typeof World.listLoadedMapIds === "function") {
            const extra = World.listLoadedMapIds();
            if (Array.isArray(extra)) {
                extra.forEach(id => { if (id) set.add(String(id)); });
            }
        }
        return Array.from(set).sort();
    };

    const populateMaps = () => {
        const current = mapSelect.value;
        const ids = collectMapIds();
        mapSelect.innerHTML = "";
        ids.forEach(id => {
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = id;
            mapSelect.appendChild(opt);
        });
        if (current && ids.includes(current)) {
            mapSelect.value = current;
        }
    };

    populateMaps();

    mapWarpBtn.addEventListener("click", () => {
        const mapId = mapSelect.value;
        if (!mapId) return;
        const tx = parseInt(mapXInput.value, 10);
        const ty = parseInt(mapYInput.value, 10);
        if (window.DebugWarpTo && typeof window.DebugWarpTo === "function") {
            window.DebugWarpTo({
                mapId,
                x: Number.isFinite(tx) ? tx : 0,
                y: Number.isFinite(ty) ? ty : 0
            });
        }
    });
}

(function (g) {
    "use strict";

    const TILE = 16;

    const Debug = { init, update, setEnabled };
    g.Debug = Debug;

    let el = null, enabled = true;

    function init() {
        if (el) return el;
        el = document.createElement("div");
        el.id = "debugPanel";
        el.style.cssText = [
            "position:fixed",
            "left:8px",
            "bottom:8px",
            "z-index:9999",
            "background: #00000077",
            "color: #FFFFFF",
            "font:8px/1.2 monospace",
            "padding:8px",
            "white-space:pre",
            "border:1px solid #FFFFFF77",
            "border-radius:4px",
            "pointer-events:none"
        ].join(";");
        document.body.appendChild(el);
        return el;
    }

    function setEnabled(v) {
        enabled = !!v;
        if (el) el.style.display = enabled ? "block" : "none";
    }

    function update() {
        if (!enabled) return;
        if (!el) init();

        const player = g.Sprites && Sprites.get("player");
        if (!player || !g.Collision) { el.textContent = "debug: no player/map"; return; }

        const tx = Collision.toTileX(player.x);
        const ty = Collision.toTileY(player.y);

        const d = dirDelta(player.facing || "down");
        const fx = tx + d.x;
        const fy = ty + d.y;

        const cur  = readSquare(tx, ty);
        const front = readSquare(fx, fy);

        const lines = [];
        lines.push(`PLAYER px=(${pad3(player.x)},${pad3(player.y)}) facing=${player.facing}${player.flip ? " [flip]" : ""}`);
        // Show current map id between PLAYER and TILE
        var mapId = (window.World && typeof World.currentMap === 'function' && World.currentMap())
            ? String(World.currentMap().id || '')
            : '';
        if (mapId) {
            // Insert a MAP: line; keep formatting consistent
            lines.push("MAP:   " + mapId);
        }
        lines.push(`TILE   =(${tx},${ty})  FRONT=(${fx},${fy})`);
        lines.push("");
        lines.push(formatSquare("CUR ", tx, ty, cur));
        lines.push(formatSquare("FWD ", fx, fy, front));
        lines.push(`________________________________\nProject HyperMon v00.00.39\nCONTROLS:\nD-Pad = ARROW KEYS\nA = Z | Start = ENTER\nB = X | Select = SHIFT`);

        el.textContent = lines.join("\n");
    }

    function readSquare(tx, ty) {
        const sq = Collision.squareAt(tx, ty);
        return { sq, tx, ty, inBounds: !!sq };
    }

    function formatSquare(label, tx, ty, info) {
        if (!info || !info.sq) return `${label}@(${tx},${ty}): OOB/void`;
        const sq = info.sq;
        const f  = decodeCollision(sq.collision);
        const tags = (sq.attributes && Array.isArray(sq.attributes.tags)) ? sq.attributes.tags.join(",") : "";
        const tiles = Array.isArray(sq.tiles) ? sq.tiles.map(hexTile).join(" ") : "";
        return (
`${label}@(${tx},${ty}):
solid=${!!f.solid}  ledge=${f.ledge ?? "null"}  surface=${f.surface ?? "normal"}  talkOver=${!!f.talkOver}
tiles=[${tiles}]
tags=[${tags}]`
        );
    }

    // decode the flags from MapLoader (collision in the map file is copied to "flags" in the MapLoader object version of the map)
    function decodeCollision(collision) {
        const c = collision || {};
        const ledge = (c.ledge == null) ? "none" : String(c.ledge);
        const surface = (c.surface == null) ? "normal" : String(c.surface);
        return {
            solid: !!c.solid,
            talkOver: !!c.talkover,
            ledge,
            surface
        };
    }

    // convert tile index to hext value (0xHH)
    function hexTile(v) {
        if (typeof v === "number") return "0x" + v.toString(16).toUpperCase();
        if (typeof v === "string") {
            // if it's already hex-like, update to be in all caps otherwise parse as decimal to hex
            const s = v.trim();
            if(/^0x[0-9a-f]+$/i.test(s)) return "0x" + s.slice(2).toUpperCase();
            const n = Number(s);
            return Number.isFinite(n) ? ("0x" + n.toString(16).toUpperCase()) : s.toUpperCase();
        }
        return String(v).toUpperCase();
    }

    function dirDelta(dir) {
        if (dir === "up")    return { x: 0,  y: -1 };
        if (dir === "down")  return { x: 0,  y:  1 };
        if (dir === "left")  return { x:-1,  y:  0 };
        if (dir === "right") return { x: 1,  y:  0 };
        return { x: 0, y: 0 };
    }

    function pad3(n) { return String(n).padStart(3, " "); }
})(window);
} else {
    $(".debugPane").remove();
}
