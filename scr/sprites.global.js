(function (g) {
    "use strict";

    // Public API
    const Sprites = {
        defineSheet,
        spawn,
        update,                // call from your main loop
        get: id => ACTORS.get(id) || null
    };
    g.Sprites = Sprites;

    // Configs
    const TILE = 16;
    const TURN_TAP_FRAMES = 6;     // tap threshold to turn without moving
    const STEP_PIXELS = TILE;      // grid step size
    const SPEED_PX_PER_SEC = 96;   // ~0.167s per tile @60fps
    const WALK_FRAME_PERIOD = 6;   // frames between animation frame advances while walking
    const BUMP_FRAME_PERIOD = 12;  // slower animation when moving against wall

    // Mode setup
    // CLASSIC - more like gameboy style, using limited frames and sprite flipping to get all directions and frames.
    // FULL    - inspired by RPG Maker - 4 directions used, 4 frames each without any flipping.  i.e. rival's sprite but without hair flipping
    // CUSTOM  - lets the user define a custom animation system for sprites.
    const MODE = { CLASSIC: 0, FULL: 1, CUSTOM: 2 };

    // Sheet setup
    // id -> { image, frameW, frameH, cols, mode, map }
    const SHEETS = new Map();

    /**
     * defineSheet(key, cfg)
     * example cfg values:
     *    image:  "res/spr/overworld/player.png"
     *    frameW: 16 (defaults)
     *    frameH: 16 (defaults)
     *    cols:   number of columns in the sheet (Mode0 2 expects columns, Mode1 expects 4 columns)
     *    mode:   0 | 1 | 2 - based on the mode specified above
     *    map:    optional custom mapping { up:[...], right:[...], down:[...], left:[...] } for MODE.CUSTOM
     */
    function defineSheet(key, cfg) {
        const c = Object.assign({ frameW: 16, frameH: 16, cols: 4, mode: MODE.CLASSIC }, cfg || {});
        SHEETS.set(key, c);
        return c;
    }

    // Actor store
    const ACTORS = new Map();

    function spawn({ id, sheet, x = 64, y = 64, facing = "down", voff = -4 }) {
        const def = SHEETS.get(sheet);
        if (!def) throw new Error(`Unknown sheet: ${sheet}`);

        // DOM element
        const spritesLayer = document.getElementById("layer-sprites");
        const el = document.createElement("div");
        el.className = "sprite";
        el.style.backgroundImage = `url(${def.image})`;
        el.style.width = `${def.frameW}px`;
        el.style.height = `${def.frameH}px`;
        el.style.willChange = "transform, background-position";
        el.style.transformOrigin = "top left";
        spritesLayer.appendChild(el);

        // actor
        const a = {
            id, el, def,
            x, y, voff, facing,     // world pixel position / dir as well as vertical offset
            flip: false,            // scaleX(-1) or not
            mode: def.mode,
            frameIndex: 0,          // local frame (0..N) used to compute bg-pos
            animTick: 0,
            moving: false,
            targetX: x, targetY: y,
            _pressAge: 0,           // how long current dir key has been held (frames)
            _footFlip: false,       // for Mode 0 up/down alternation
            bumping: false,         // true when trying to move into a solid square
            bumpTick: 0
        };

        // start in idle frame for the facing
        applyFrame(a, idleFrameFor(a, facing), false);
        ACTORS.set(id, a);
        stampTransform(a);
        return a;
    }

    // Update loop
    function update({ jp, dt, inputLock=false }) {
        ACTORS.forEach(a => tickActor(a, inputLock && a.id === 'player'? null : jp, dt));
    }

    // Per-actor logic
    function tickActor(a, jp, dt) {
        // check if textbox is active...
        if (!jp) {
            a.moving = false;
            a.animTick = 0;
            applyFrame(a, idleFrameFor(a, a.facing), flipFor(a, a.facing, false));
            stampTransform(a);
            return;
        }

        // Input → desired facing + maybe initiate a move
        const dirPressed =
            jp.pressed("up") ? "up" :
            jp.pressed("down") ? "down" :
            jp.pressed("left") ? "left" :
            jp.pressed("right") ? "right" : null;

        const dirHeld =
            jp.held("up") ? "up" :
            jp.held("down") ? "down" :
            jp.held("left") ? "left" :
            jp.held("right") ? "right" : null;

        if (!a.moving) {
            // handle taps to turn without moving
            if (dirPressed) {
                if (a.facing !== dirPressed) {
                    a.facing = dirPressed;
                    a._pressAge = 0;
                    // snap to idle frame for that direction
                    applyFrame(a, idleFrameFor(a, a.facing), flipFor(a, a.facing, /*walking*/false));
                    stampTransform(a);
                    return;
                } else {
                    a._pressAge = 0;
                    // a.bumping = false;
                    // a.bumpTick = 0;
                }
            }

            if (dirHeld) {
                a._pressAge++;
                if (a._pressAge <= TURN_TAP_FRAMES) {
                // still inside “turn only” window; don’t start moving yet
                // (Gen II feel—you can release here to only turn)
                } else {
                // start moving one tile in this direction
                startMoveOneTile(a, dirHeld);
                }
            } else {
                a._pressAge = 0;
                a.bumping = false;
                a.bumpTick = 0;
            }
        }

        // Slow “bump” animation while holding into a blocked direction
        if (a.bumping && !a.moving) {
            a.bumpTick++;
            if ((a.bumpTick % BUMP_FRAME_PERIOD) === 0) {
                console.log(a.bumpTick);
                const seq = walkSequenceFor(a, a.facing);        // 2 frames in CLASSIC; 4 in FULL
                const i = seq.indexOf(a.frameIndex);
                const next = seq[(i < 0 ? 0 : (i + 1) % seq.length)];
                // flip logic: same as walking (CLASSIC up/down alternate flip via _footFlip)
                // a._footFlip = !a._footFlip;
                const doFlip = flipFor(a, a.facing, true);
                applyFrame(a, next, doFlip);
            }
            stampTransform(a);  // keep z-index, voff, etc. up to date
            return;             // don’t fall through to idle
        }

        // Move if active
        if (a.moving) {
        const step = (SPEED_PX_PER_SEC * dt) | 0; // integer pixels per frame
        let nx = a.x, ny = a.y;
        if (a.targetX > a.x) nx = Math.min(a.x + step, a.targetX);
        if (a.targetX < a.x) nx = Math.max(a.x - step, a.targetX);
        if (a.targetY > a.y) ny = Math.min(a.y + step, a.targetY);
        if (a.targetY < a.y) ny = Math.max(a.y - step, a.targetY);

        a.x = nx; a.y = ny;
        stampTransform(a);

        // Advance walk animation
        a.animTick++;
        if ((a.animTick % WALK_FRAME_PERIOD) === 0) {
            // cycle between the walk frames for the facing
            const seq = walkSequenceFor(a, a.facing);
            const i = seq.indexOf(a.frameIndex);
            const next = seq[(i < 0 ? 0 : (i + 1) % seq.length)];
            // For Mode 0 up/down, alternate horizontal flip each “step”
            const doFlip = flipFor(a, a.facing, /*walking*/true);
            applyFrame(a, next, doFlip);
        }

        if (a.x === a.targetX && a.y === a.targetY) {
            a.moving = false;
            a.animTick = 0;
            // settle to idle facing
            applyFrame(a, idleFrameFor(a, a.facing), flipFor(a, a.facing, false));
        }
        } else {
            // idle: ensure idle frame stays
            applyFrame(a, idleFrameFor(a, a.facing), flipFor(a, a.facing, false));
        }
    }

    function startMoveOneTile(a, dir) {
        a.facing = dir;

        // current tile
        const tx = (a.x / TILE) | 0;
        const ty = (a.y / TILE) | 0;

        // Check if we can step
        const res = window.Collision && Collision.canStartStep(tx, ty, dir);
        if (!res || !res.ok) {
            // can't move forward
            a.moving = false;
            if (!a.bumping) {
                a.bumping = true;
                a.bumpTick = 0;
                const seq = walkSequenceFor(a, dir);
                applyFrame(a, seq[0], flipFor(a, dir, /*walking*/true));
            }
            return;
        }

        // allowed to move?  clear bump state, walk like normal...
        a.bumping = false;
        a.moving = true;
        a.animTick = 0;
        a._footFlip = !a._footFlip; // toggled every start; used by Mode 0 up/down

        if (res.mode === "WALK") {
            if (dir === "left")  { a.targetX = a.x - STEP_PIXELS; a.targetY = a.y; }
            if (dir === "right") { a.targetX = a.x + STEP_PIXELS; a.targetY = a.y; }
            if (dir === "up")    { a.targetY = a.y - STEP_PIXELS; a.targetX = a.x; }
            if (dir === "down")  { a.targetY = a.y + STEP_PIXELS; a.targetX = a.x; }
        } else if (res.mode === "HOP") {
            // ledges will have two-tile movement, jumping on the first and landing on the second.
            // const [lx, ly] = res.landing;
            // a._hop = { active: true, landTx: lx, landTy: ly, t: 0 };
            // a.targetX = a.x + (dir === "left" ? -STEP_PIXELS : dir === "right" ? STEP_PIXELS : 0);
            // a.targetY = a.y + (dir === "up" ? -STEP_PIXELS : dir === "down" ? STEP_PIXELS : 0);
        }
        // kick into the first walk frame immediately
        const seq = walkSequenceFor(a, dir);
        applyFrame(a, seq[0], flipFor(a, dir, true));
    }

    // Frame/mapping

    // Mode 0 convention (2 cols x 3 rows):
    // row0: down [idle, step]  -> frames [0,1]
    // row1: side [idle, step]  -> frames [2,3] (right-facing art; left is flipped)
    // row2: up   [idle, step]  -> frames [4,5]
    function idleFrameFor(a, dir) {
        const m = a.def.mode;
        if (m === MODE.CLASSIC) {
            // define frame for idle stage
            if (dir === "up")    return 0;
            if (dir === "right") return 2;
            if (dir === "down")  return 4;
            if (dir === "left")  return 2;  // flip
        }
        if (m === MODE.FULL) {
            // 4 cols per row: idle = col 0
            const base = rowBase(a, dir);
            return base + 0;
        }
        // MODE.CUSTOM
        const map = a.def.map?.[dir] || [0];
        return map[0] || 0;
    }

    function walkSequenceFor(a, dir) {
        const m = a.def.mode;
        if (m === MODE.CLASSIC) {
            // define frames in a list to switch between in the sprite sheet
            if (dir === "up")    return [0,1];
            if (dir === "right") return [2,3];
            if (dir === "down")  return [4,5];
            if (dir === "left")  return [2,3]; // flip applied separately
        }
        if (m === MODE.FULL) {
            // 4 cols per row: [0,1,2,3]
            const base = rowBase(a, dir);
            return [base+0, base+1, base+2, base+3];
        }
        // MODE.CUSTOM
        const map = a.def.map?.[dir] || [0];
        return map.slice(); // as-is
    }

    function rowBase(a, dir) {
        const cols = a.def.cols;
        const row =
            (dir === "up")    ? 0 :
            (dir === "right") ? 1 :
            (dir === "down")  ? 2 :
            (dir === "left")  ? 3 : 0;
            return row * cols;
    }

    // Flip logic:
    //    left/right: Mode 0 uses right art for both; left applies flipX
    //    up/down: Mode 0 alternates flip each *step* to swap “foot”
    //    Mode 1: never flips (full sheet includes left)
    function flipFor(a, dir, walking) {
        if (a.def.mode === MODE.FULL) return false;
        if (dir === "left") return true;
        if ((dir === "up" || dir === "down") && walking) return a._footFlip;
        return false;
    }

    function applyFrame(a, frameIndex, flipX) {
        a.frameIndex = frameIndex;
        a.flip = !!flipX;

        // compute background-position from frame index using this sheet’s column count
        const fw = a.def.frameW, fh = a.def.frameH, cols = a.def.cols;
        const sx = -((frameIndex % cols) * fw);
        const sy = -(Math.floor(frameIndex / cols) * fh);
        a.el.style.backgroundPosition = `${sx}px ${sy}px`;

        // transform: translate first, then optional scaleX(-1)
        // const base = `translate(${a.x}px, ${a.voff ?? -4}px)`;
        // const baseFlipped = `translate(${a.x+16}px, ${a.voff ?? -4}px)`;;
        // a.el.style.transform = a.flip ? `${baseFlipped} scaleX(-1)` : base;

        const drawX = a.x + (a.flip ? fw : 0);
        const drawY = a.y + (a.voff ?? -4);
        a.el.style.transform = a.flip
            ? `translate(${drawX}px, ${drawY}px) scaleX(-1)`
            : `translate(${drawX}px, ${drawY}px)`;

        // draw order: same formula renderer uses
        a.el.style.zIndex = String(100 + Math.floor(a.y / TILE));
    }

    function stampTransform(a) {
        // old method...
        // const base = `translate(${a.x}px, ${a.y + (a.voff ?? -4)}px)`;
        // const baseFlipped = `translate(${a.x+16}px, ${a.y + (a.voff ?? -4)}px)`;;
        // a.el.style.transform = a.flip ? `${baseFlipped} scaleX(-1)` : base;
        // a.el.style.zIndex = String(100 + Math.floor(a.y / TILE));

        const fw = a.def.frameW;
        const drawX = a.x + (a.flip ? fw : 0);
        const drawY = a.y + (a.voff ?? -4);
        a.el.style.transform = a.flip
            ? `translate(${drawX}px, ${drawY}px) scaleX(-1)`
            : `translate(${drawX}px, ${drawY}px)`;

        // draw order: same formula renderer uses
        a.el.style.zIndex = String(100 + Math.floor(a.y / TILE));
    }
})(window);