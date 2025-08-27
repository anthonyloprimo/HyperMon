// audio system
(function (g) {
    "use strict";

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const sfxCache = new Map();
    let currentBgm = null;         // { id, node, gain }
    const bgmStack = [];           // for ONCE/restore

    function playSfx(id) {
        const buf = sfxCache.get(id);
        if (!buf) return null;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        src.connect(gain).connect(ctx.destination);
        src.start(0);
        return { src, gain };
    }

    g.AudioHooks = {
        onSfx: (id, { blocking, resume }) => {
            const h = playSfx(id);
            if (!h) { if (resume) resume(); return; }
            if (!blocking) return;
            h.src.addEventListener("ended", () => resume && resume(), { once: true });
        },

        onBgm: ({ id, fade, loop, once, returnTo, stop }) => {
            // implement: stop/fade current; start new; if once, push current & restore on end (or use returnTo)
            // keep it non-blocking
        }
    };

})(window);