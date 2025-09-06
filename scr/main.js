const jp = new Joypad({ repeatDelayFrames: 12, repeatRateFrames: 3 });

// Testing map loading system
MapLoader.loadMap("res/bg/maps/", "mapTemplate").then(({ map }) => {
    if (!map) return;
    Renderer.init();
    Renderer.attachMap(map);
    Renderer.drawView(0, 0);
});

// Initialize renderer & scene system
// Renderer.init();
const scenes = new SceneManager();

const box = new TextBox();
box.show(`This is magic!*PAUSE,TEST:\n *DOTS,3:Press A to continue.`);
 
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