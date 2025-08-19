/**********************************************
 * HyperMon - main.js (minimal bootstrap)
 * Uses: Joypad, SceneManager, Renderer, TextBox
 **********************************************/

(function () {
  // --- Instances ---
  const joypad = new Joypad({
    // keep defaults; we only need pressed('a') each frame
  });
  const scenes = new SceneManager();

  // Init renderer/layers
  Renderer.init();

  // Create the textbox in the UI layer
  const textbox = new TextBox({
    container: document.getElementById('layer-ui')
    // geometry uses defaults from textbox.global.js
  });


  // Show the test box on load
  textbox.show(`Press "Z" to advance the text!\n\nHello WARZYRAPTOR!\nThis is a really, really cool message showing what I've made so far!\n\n...In JavaScript, no less!  This INDIGO guy?  He's insane.  Doing this all in JavaScript?  Who is that DUMB!?  Eh, whatever.  All we got is this basic text stuff, but soon we'll have a proper game to play!`);

  // --- Simple game loop (60fps-ish) ---
  let last = performance.now();
  function loop(t) {
    const dt = (t - last) / 1000;
    last = t;

    // Poll input once per frame
    joypad.poll();

    // Advance text on A or Start (edge press), but only if allowed
    if (textbox.canAdvance() && (joypad.pressed('a') || joypad.pressed('start'))) {
      textbox.advance();
    }

    // Update textbox (handles the two-phase scroll)
    textbox.update();

    // If you add scenes later:
    // scenes.update(dt);
    // scenes.draw();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Expose for quick debugging in console (optional)
  window.HyperMon = Object.assign(window.HyperMon || {}, {
    joypad, scenes, textbox
  });
})();
