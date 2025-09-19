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
    const TURN_TAP_FRAMES = 4;     // tap threshold to turn without moving
    const STEP_PIXELS = TILE;      // grid step size
    const SPEED_PX_PER_SEC = 96;   // ~0.167s per tile @60fps
    const WALK_FRAME_PERIOD = 8;   // frames between animation frame advances while walking
    const BUMP_FRAME_PERIOD = 16;  // slower animation when moving against wall

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
     *    cols:   number of columns in the sheet (Mode0 expects 2 columns, Mode1 expects 4 columns)
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
        // HOP motion (ignore input when mid-hop)
        if (a.motion && a.motion.kind === "HOP") {
            updateHopMotion(a, dt);
            return;
        }

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
                const seq = walkSequenceFor(a, a.facing);        // 2 frames in CLASSIC; 4 in FULL
                const i = seq.indexOf(a.frameIndex);
                const next = seq[(i < 0 ? 0 : (i + 1) % seq.length)];

                // mode 0 up/down flipping for every other step
                if (a.def.mode === MODE.CLASSIC && (a.facing === "up" || a.facing === "down")) {
                    const idle = idleFrameFor(a, a.facing);
                    if (next !== idle) a._footFlip = !a._footFlip;
                }

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

                // mode 0 up/down flipping for every other step
                if (a.def.mode === MODE.CLASSIC && (a.facing === "up" || a.facing === "down")) {
                    const idle = idleFrameFor(a, a.facing);
                    if (next !== idle) a._footFlip = !a._footFlip;
                }

                const doFlip = flipFor(a, a.facing, /*walking*/true);
                applyFrame(a, next, doFlip);
            }

            if (a.x === a.targetX && a.y === a.targetY) {
                a.moving = false;

                if (jp && jp.held && jp.held(a.facing)) {
                    a._chainMove = true;
                    startMoveOneTile(a, a.facing);
                    return;
                }
                
                // settle to idle facing when stopped
                a.animTick = 0;
                applyFrame(a, idleFrameFor(a, a.facing), flipFor(a, a.facing, false));
            }
        } else {
            // idle: ensure idle frame stays
            applyFrame(a, idleFrameFor(a, a.facing), flipFor(a, a.facing, false));
        }
    }

    function startMoveOneTile(a, dir) {
        a.facing = dir;

        const chaining = !!a._chainMove;
        a._chainMove = false;

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

        if (!chaining) {
            a.animTick = 0;
            if (a.def.mode === MODE.CLASSIC && (dir === "up" || dir === "down")) {
                a._footFlip = !a._footFlip; // toggled every start; used by Mode 0 up/down
            }
        }

        if (res.mode === "WALK") {
            if (dir === "left")  { a.targetX = a.x - STEP_PIXELS; a.targetY = a.y; }
            if (dir === "right") { a.targetX = a.x + STEP_PIXELS; a.targetY = a.y; }
            if (dir === "up")    { a.targetY = a.y - STEP_PIXELS; a.targetX = a.x; }
            if (dir === "down")  { a.targetY = a.y + STEP_PIXELS; a.targetX = a.x; }

            if (!chaining) {
                const seq = walkSequenceFor(a, dir);
                applyFrame(a, seq[0], flipFor(a, dir, true));
            }
        } else if (res.mode === "HOP") {
            // we aren't using the normal one-tile movement process...
            a.moving = false;
            // a.animTick = 0;
            a.animTick = chaining ? a.animTick : 0;
            // a._footFlip = !a._footFlip;

            const v = dirToVec(dir);
            startHopMotion(a, v, res.landing);
            return;
        }
        // kick into the first walk frame immediately
        // const seq = walkSequenceFor(a, dir);
        // applyFrame(a, seq[0], flipFor(a, dir, true));
    }

    // Frame/mapping

    // Mode 0 convention (2 cols x 3 rows):
    // row0: up [idle, step]     -> frames [0,1]
    // row1: side [idle, step]   -> frames [2,3] (right-facing art; left is flipped)
    // row2: down   [idle, step] -> frames [4,5]
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

    function dirToVec(dir) {
        switch (dir) {
            case "up":    return { dx:  0, dy: -1 };
            case "right": return { dx:  1, dy:  0 };
            case "down":  return { dx:  0, dy:  1 };
            case "left":  return { dx: -1, dy:  0 };
        }
        const d = String(dir || "").trim().toUpperCase();
        if (d === "N" || d === "NORTH") return { dx:  0, dy: -1 };
        if (d === "E" || d === "EAST")  return { dx:  1, dy:  0 };
        if (d === "S" || d === "SOUTH") return { dx:  0, dy:  1 };
        if (d === "W" || d === "WEST")  return { dx: -1, dy:  0 };
        return { dx: 0, dy: 0};
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
        const drawY = a.y + (a.voff ?? -4) + (a._hopBob || 0);
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
        const drawY = a.y + (a.voff ?? -4) + (a._hopBob || 0);
        a.el.style.transform = a.flip
            ? `translate(${drawX}px, ${drawY}px) scaleX(-1)`
            : `translate(${drawX}px, ${drawY}px)`;

        // draw order: same formula renderer uses
        a.el.style.zIndex = String(100 + Math.floor(a.y / TILE));
    }

    // Ledge hop
    // const HOP_SEQ = (function () {
    //     const up = [4, 3, 2, 1, 1, 1];
    //     const down = up.slice().reverse();
    //     const steps = up.concat(down);
    //     // cumulative offsets (negative goes up)
    //     const cum = [0];
    //     for (let i = 0; i < steps.length; i++) cum.push(cum[i] - steps[i]);
    //     return cum; // length 13 (index 0..12), cum[0]=0, cum[6]=-12, cum[12]=0
    // })();
    function hopBobAt(p, apex) {
        if (p <= 0 || p >= 1) return 0;
        const s = Math.sin(Math.PI * p);
        return -Math.round(apex * s);
    }

    function startHopMotion(player, dirVec /* {dx,dy} */, landingTile /* [tx,ty] */) {
        const DIST = 32; // px, two tiles
        const duration = DIST / SPEED_PX_PER_SEC; // seconds
        const startX = player.x, startY = player.y;

        // Shadow: appears 8px below the player's ground position, removed on land
        const SHADOW_FRAME = 9;
        Renderer.addSprite("player_shadow", SHADOW_FRAME, startX, startY + 8);

        player.motion = {
            kind: "HOP",
            t: 0,
            duration,
            dist: DIST,
            px: 0,
            apex: 12,
            startX, startY,
            dir: dirVec,
            landingTile: landingTile || null,
            // yOffsetAt(p) {
            //     const idx = Math.max(0, Math.min(HOP_SEQ.length - 1, Math.round(p * (HOP_SEQ.length - 1))));
            //     return HOP_SEQ[idx];
            // },
            onDone() {
                Renderer.removeSprite("player_shadow");
            }
        };

        player._hopBob = 0;
        const seq = walkSequenceFor(player, player.facing);
        applyFrame(player, seq[0], flipFor(player, player.facing, /*walking*/true));

        stampTransform(player);
    }

    // Call this from your main update loop after dt is computed
    function updateHopMotion(player, dt) {
        const m = player.motion;
        if (!m || m.kind !== "HOP") return;

        const step = (SPEED_PX_PER_SEC * dt) | 0;
        if (step > 0) m.px = Math.min((m.px || 0) + step, m.dist);

        const p = m.px / m.dist;
        const baseX = m.startX + (m.dir.dx * m.px);
        const baseY = m.startY + (m.dir.dy * m.px);

        // const idx = Math.max(0, Math.min(HOP_SEQ.length - 1, Math.round(p * (HOP_SEQ.length - 1))));
        // const yOff = HOP_SEQ[idx];
        player._hopBob = hopBobAt(p, m.apex);

        // player position
        player.x = baseX;
        player.y = baseY;
        // player._hopBob = yOff;
        stampTransform(player);

        // maintain walking animation when hopping
        player.animTick = (player.animTick || 0) + 1;
        if ((player.animTick % WALK_FRAME_PERIOD) === 0) {
            const seq = walkSequenceFor(player, player.facing);
            const i = seq.indexOf(player.frameIndex);
            const next = seq[(i < 0 ? 0 : (i + 1) % seq.length)];

            // flip sprites every other step frame
            if (player.def.mode === MODE.CLASSIC && (player.facing === "up" || player.facing === "down")) {
                const idle = idleFrameFor(player, player.facing);
                if (next !== idle) player._footFlip = !player._footFlip;
            }

            const doFlip = flipFor(player, player.facing, /*walking*/true);
            applyFrame(player, next, doFlip);
        }

        // Shadow sticks to ground path (no vertical offset), always +8px
        Renderer.updateSprite("player_shadow", 0, baseX, baseY + 8);

        if (m.px >= m.dist) {
            player._hopBob = 0;
            stampTransform(player);
            
            if (m.onDone) m.onDone();
            player.motion = null;
            
            applyFrame(player, idleFrameFor(player, player.facing), flipFor(player, player.facing, false));
        }

        // if ((m.px || 0) >= m.dist) {
        //     player._hopBob = 0;
        //     stampTransform(player);
        //     if (m.onDone) m.onDone();
        //     player.motion = null;
        //     applyFrame(player, idleFrameFor(player, player.facing), flipFor(player, player.facing, false));
        // }

        // if (p >= 1) {
        //     // snap final, clear motion and finishes on idle frame.
        //     player.x = m.startX + (m.dir.dx * m.dist);
        //     player.y = m.startY + (m.dir.dy * m.dist);
        //     player._hopBob = 0;
        //     stampTransform(player);

        //     if (m.onDone) m.onDone();
        //     player.motion = null;

        //     applyFrame(player, idleFrameFor(player, player.facing), flipFor(player, player.facing, false));
        // }
    }

})(window);