const jp = new Joypad({ repeatDelayFrames: 12, repeatRateFrames: 3 });

// Map directory and entry map (keep consistent with your existing load call)
const MAP_DIR = "res/bg/maps/";

// Simple busy gate to pause interactions during transitions/warps
let WORLD_BUSY = false;

// Track the player's last known tile for onStep triggers
let _lastPlayerTx = null, _lastPlayerTy = null;

// Track if the player was bumping against an onBump trigger
let _wasBumping = false;

// Auto-walk input lock flag: true while the player is performing an automatic one-tile step
let AUTO_WALKING = false;

// Helper to read current player tile (safe if player not yet spawned)
function getPlayerTile() {
    const p = Sprites.get('player');
    if (!p || !window.Collision) return null;
    const tx = Collision.toTileX(p.x);
    const ty = Collision.toTileY(p.y);
    return { tx, ty };
}

// Run a list of actions returned from ObjectManager (currently: warp, script, sfx)
// Returns a Promise that resolves when the first action completes.
function runActions(actions) {
    if (!actions || actions.length === 0) return Promise.resolve();

    const act = actions[0]; // For now: first action wins (expand as needed)
    if (act.type === 'warp') {
        return runWarp(act);
    } else if (act.type === 'script') {
        // Defer to your Script runner if/when hooked up
        if (window.Script && typeof Script.run === 'function') {
            return new Promise((res) => {
                Script.run(act.id, act.args || [], {}, res);
            });
        }
        return Promise.resolve();
    } else if (act.type === 'sfx') {
        if (window.Audio && typeof Audio.playSfx === 'function') {
            Audio.playSfx(act.id);
        }
        return Promise.resolve();
    }
    return Promise.resolve();
}

// Handle warp actions: fade out, load target map, reposition player, fade in
async function runWarp(act) {
    if (WORLD_BUSY) return; // avoid re-entrancy
    WORLD_BUSY = true;

    try {
        // Optional SFX on warp activation
        if (act.sfx && window.Audio && typeof Audio.playSfx === 'function') {
            Audio.playSfx(act.sfx);
        }

        // Fade out (default to Gen1 style if unspecified)
        const outFx = (act.transition && act.transition.out) || 'gen1ToBlack';
        if (window.Transitions && typeof Transitions[outFx] === 'function') {
            await Transitions[outFx]({ duration: 320 });
        }
        // Clear current BG while black
        if (window.Renderer && typeof Renderer.clearBg === 'function') {
            Renderer.clearBg();
        }

        // Load and attach the destination map
        const mapId = String(act.to.mapId || '');
        if (!mapId) throw new Error('Warp has empty to.mapId');

        const res = await MapLoader.loadMap(MAP_DIR, mapId);
        const nextMap = res && res.map;
        if (!nextMap) throw new Error('Failed to load destination map: ' + mapId);

        // Attach map to renderer/collision/objects
        Renderer.attachMap(nextMap);
        Collision.attachMap(nextMap);
        if (window.ObjectManager) ObjectManager.attachMap(nextMap);

        // Move player to destination tile (snap to 16px grid) and apply facing if provided
        const p = Sprites.get('player');
        if (p) {
            const destX = Number.isFinite(act.to.x) ? (Math.trunc(act.to.x) * 16) : p.x;
            const destY = Number.isFinite(act.to.y) ? (Math.trunc(act.to.y) * 16) : p.y;
            p.x = destX; p.y = destY;

            // Optional: arrival facing from warp definition
            if (act.to && act.to.facing != null) {
                p.facing = String(act.to.facing);
            }

            // Reset player state so we don't chain movement across warp
            p.moving = false;
            p.animTick = 0;

            // Reset last-tile tracker so onStep for the new tile can fire once post-warp
            const curTile = getPlayerTile();
            if (curTile) { _lastPlayerTx = curTile.tx; _lastPlayerTy = curTile.ty; }

            // Force camera to re-evaluate view next frame
            Camera.setTarget(p);

            const TILE = 16;
            const ox = Math.floor((p.x - Camera.cx) / TILE);
            const oy = Math.floor((p.y - Camera.cy) / TILE);
            Renderer.drawView(ox, oy);
        }

        // Fade back in (default to Gen1 style if unspecified)
        const inFx = (act.transition && act.transition.in) || 'gen1FromBlack';
        if (window.Transitions && typeof Transitions[inFx] === 'function') {
            await Transitions[inFx]({ duration: 320 });
        }

        // Auto-walk one tile in current facing if requested by the warp
        if (act.autoWalk) {
            // Engage lock immediately so the very next frame sees jp=null for the player
            AUTO_WALKING = true;

            // Defer the actual move start by one tick so WORLD_BUSY is cleared
            setTimeout(() => {
                const p = Sprites.get('player');
                if (p && window.Collision && typeof Sprites.startMove === 'function') {
                    const tx = Collision.toTileX(p.x);
                    const ty = Collision.toTileY(p.y);

                    const res = Collision.canStartStep(tx, ty, p.facing, { moveMode: p.moveMode || 'WALK' });

                    if (res && res.ok && res.mode === "WALK") {
                        Sprites.startMove('player', p.facing);
                    } else {
                        // Nothing to do (blocked) — ensure we don't remain locked
                        AUTO_WALKING = false;
                    }
                } else {
                    AUTO_WALKING = false;
                }
            }, 0);
        }

        // Post-warp flags: mark once-used and setOnUse flags if any
        if (window.Flags) {
            // "once": set a conventional used flag to suppress future triggers
            if (act.once) {
                const usedKey = "obj:" + String(nextMap.id || '') + ":" + String(act.object.id) + ":used";
                Flags.set(usedKey, true);
            }
            // User-authored flags to set after success
            if (Array.isArray(act.setOnUse)) {
                for (let i = 0; i < act.setOnUse.length; i++) {
                    Flags.set(String(act.setOnUse[i]), true);
                }
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        WORLD_BUSY = false;
    }
}

// Testing map loading system
MapLoader.loadMap("res/bg/maps/", "playerRoom").then(({ map }) => {
    if (!map) return;
    Renderer.init();
    Renderer.attachMap(map);
    Collision.attachMap(map);

    // Attach objects so triggers can be queried
    if (window.ObjectManager) ObjectManager.attachMap(map);

    Renderer.drawView(0, 0);

    // spawn player
    const p = Sprites.spawn({
        id: 'player',
        sheet: 'PLAYER_MODE0',
        x: 48, y: 96,  // in px, so specify (tile x 16) i.3. (3, 6) = (48, 96)
        facing: 'down'
    });
    Camera.setTarget(p);

    // Initialize last known tile for onStep detection
    const cur = getPlayerTile();
    if (cur) { _lastPlayerTx = cur.tx; _lastPlayerTy = cur.ty; }

    Debug.init();
});

// Initialize renderer & scene system
// Renderer.init();
const scenes = new SceneManager();

// const box = new TextBox();
// box.show(`This is magic!*PAUSE,TEST:\n *DOTS,3:Press A to continue.`);

// Sprites test mode 0
Sprites.defineSheet(`PLAYER_MODE0`, {
    image: `res/spr/overworld/player.png`,
    cols: 2,
    mode: 0
});
// Sprites test mode 1
// Sprites.defineSheet(`PLAYER_MODE1`, {
//     image: `res/spr/overworld/player1.png`,
//     cols: 4,
//     mode: 1
// });

// box.show(`This is a test*DOTS,3:\n ...To see if the DOTS function works!`, {speed: "MED"});
// Demo scenes you can delete later
// function TitleScene(){
//     const box = new TextBox();
//     this.onEnter = function(){ box.show("Hello! Press START to begin.  Either dismiss the textbox or press START now.", { pt: true }); };
//     this.update  = function(dt){
//         box.update();
//         if (jp.pressed('start')) scenes.replace(new OverworldScene());
//         if (jp.pressed('a')) box.advance();
//     };
//     this.draw    = function(){ /* DOM is already updated by components */ };
//     this.onExit  = function(){ box.hide(); };
// }
//
// function OverworldScene(){
//     // super-minimal: fill tiles with a single metatile index
//     const grass = Array(90).fill(5);
//     const pid = 'player';
//     let px = 64, py = 64, frame = 0, t = 0;
//
//     this.onEnter = function(){
//         Renderer.drawTiles(grass);
//         Renderer.addSprite(pid, frame, px, py);
//     };
//     this.update = function(dt){
//         t += dt;
//         // input: one step per repeat for grid movement
//         const step = 16;
//         if (jp.pressed('up')    || jp.repeat('up'))    py = Math.max(0, py - step);
//         else if (jp.pressed('down')  || jp.repeat('down'))  py = Math.min(128, py + step);
//         else if (jp.pressed('left')  || jp.repeat('left'))  px = Math.max(0, px - step);
//         else if (jp.pressed('right') || jp.repeat('right')) px = Math.min(144, px + step);
//         frame = (frame + 1) % 4;
//         Renderer.updateSprite(pid, frame, px, py);
//         if (jp.pressed('start')) scenes.replace(new TitleScene());
//     };
//     this.draw = function(){};
//     this.onExit = function(){ Renderer.removeSprite(pid); };
// }
//
// scenes.replace(new TitleScene());

// simple fixed-step loop without modules
let acc = 0, last = performance.now();
const STEP = 1000/60;
const MAX_FRAME = 250;
const MAX_STEPS = 5;

function update(dt){
    FocusManager.update({ jp, dt});
    FocusManager.handleInput({ jp, dt});

    scenes.update(dt);

    // Lock player input while any textbox is open or world is busy (e.g., during warp)
    const lockInput = TextBox.anyOpen() || WORLD_BUSY || AUTO_WALKING;
    Sprites.update({ jp, dt, inputLock: lockInput });
    Camera.update();

    // Object triggers: STEP
    if (!WORLD_BUSY && window.ObjectManager && window.Collision) {
        const p = Sprites.get('player');
        if (p && !p.moving) {
            const cur = getPlayerTile();
            if (cur) {
                // Fire onStep only when tile truly changed since last settled position
                if (cur.tx !== _lastPlayerTx || cur.ty !== _lastPlayerTy) {
                    _lastPlayerTx = cur.tx; _lastPlayerTy = cur.ty;
                    const actions = ObjectManager.onStep({ tx: cur.tx, ty: cur.ty });
                    if (actions && actions.length > 0) {
                        // Run first action (warp/script/sfx)
                        runActions(actions);
                    }
                }
            }
        }
    }

    // If we are in auto-walk mode, unlock input once the player finishes the one-tile move
    if (AUTO_WALKING) {
        const p = Sprites.get('player');
        if (p && !p.moving) {
            AUTO_WALKING = false;
        }
    }

    // Object triggers: PRESS A (front tile, with talkOver support inside ObjectManager)
    if (!WORLD_BUSY && !AUTO_WALKING && !TextBox.anyOpen() && window.ObjectManager) {
        const wantA = jp.pressed('a');
        if (wantA) {
            const p = Sprites.get('player');
            if (p) {
                const cur = getPlayerTile();
                if (cur) {
                    const actions = ObjectManager.onPressA({ tx: cur.tx, ty: cur.ty, dir: p.facing });
                    if (actions && actions.length > 0) {
                        runActions(actions);
                    }
                }
            }
        }
    }

    // Object triggers: BUMP (rising edge of bumping flag)
    if (!WORLD_BUSY && !AUTO_WALKING && window.ObjectManager) {
        const p = Sprites.get('player');
        if (p) {
            const justBumped = !!p.bumping && !_wasBumping;
            _wasBumping = !!p.bumping;

            if (justBumped) {
                const cur = getPlayerTile();
                if (cur) {
                    const actions = ObjectManager.onBump({ tx: cur.tx, ty: cur.ty, dir: p.facing });
                    if (actions && actions.length > 0) {
                        runActions(actions);
                    }
                }
            }
        } else {
            _wasBumping = false;
        }
    }

    Debug.update();
    Renderer.animate();
}

function draw() {
    // dom updates if separate renderer
    scenes.draw();
}

function frame(now){
    let delta = now - last; last = now;

    // clamp huge pauses to keep loop stable
    if (delta > MAX_FRAME) delta = MAX_FRAME;

    acc += delta;

    // catch up
    let steps = 0;
    while (acc >= STEP && steps < MAX_STEPS) { jp.poll(); update(STEP/1000); acc -= STEP; steps++; }

    draw();
    requestAnimationFrame(frame);
}

// safety: clear input when window loses focus so keys don't get “stuck”
addEventListener('blur', () => { acc = 0; last = performance.now(); });

requestAnimationFrame(frame);