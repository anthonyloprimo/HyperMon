// transitions.global.js
(function (g) {
    "use strict";

    // Public API
    const Transitions = {
        // Gen1-ish (stepped)
        gen1ToBlack:   (opts) => fadeSteps(true,  opts),
        gen1FromBlack: (opts) => fadeSteps(false, opts),

        // Gen2-ish (smooth)
        gen2ToBlack:   (opts) => fadeSmooth(true,  opts),
        gen2FromBlack: (opts) => fadeSmooth(false, opts),

        // Quick console sanity check
        test() {
            console.debug("[Transitions] test start");
            return Transitions.gen1ToBlack({ duration: 300, steps: 4 })
                .then(() => new Promise(r => setTimeout(r, 200)))
                .then(() => Transitions.gen1FromBlack({ duration: 300, steps: 4 }))
                .then(() => console.debug("[Transitions] test done"));
        }
    };
    g.Transitions = Transitions;

    // ---- Internals ----------------------------------------------------------

    let rootEl = null;       // the container we’ll cover (defaults to #gameRoot or body)
    let overlay = null;      // the dark overlay
    let filterLayer = null;  // optional filter layer for “GB-ish” contrast steps

    function ensureRoot() {
        if (rootEl) return rootEl;
        // Prefer the renderer’s root if available
        rootEl = (g.Renderer && g.Renderer.root) || document.getElementById("gameRoot") || document.body;
        return rootEl;
    }

    function ensureLayers() {
        ensureRoot();
        if (!overlay) {
        overlay = document.createElement("div");
        Object.assign(overlay.style, {
            position: "absolute",
            left: "0", top: "0", right: "0", bottom: "0",
            background: "black",
            opacity: "0",
            pointerEvents: "none",
            zIndex: "99999" // above UI
        });
        // Make sure the root is positioned so absolute children anchor correctly
        if (getComputedStyle(rootEl).position === "static") {
                rootEl.style.position = "relative";
        }
        rootEl.appendChild(overlay);
        }
        if (!filterLayer) {
        // A transparent layer that we can apply CSS filters to, without changing gameplay layers directly.
        filterLayer = document.createElement("div");
        Object.assign(filterLayer.style, {
            position: "absolute",
            left: "0", top: "0", right: "0", bottom: "0",
            pointerEvents: "none",
            zIndex: "99998",   // just under the overlay
            background: "transparent",
            // We’ll set filter dynamically
        });
        rootEl.appendChild(filterLayer);
        }
    }

    function stepContrast(t) {
        // t in [0..1] → approximate GB palette stepping by reducing brightness/contrast in 3–4 chunks
        // Map t to 4 steps: 0, 0.33, 0.66, 1.0
        const s = (t <= 0) ? 0 : (t >= 1 ? 1 : Math.round(t * 3) / 3);
        // As s increases, lower brightness and boost contrast a bit
        const brightness = 1 - 0.6 * s; // 1 → 0.4
        const contrast   = 1 + 0.4 * s; // 1 → 1.4
        return `brightness(${brightness}) contrast(${contrast})`;
    }

    function rafLoop(duration, onProgress) {
        return new Promise(resolve => {
        const start = performance.now();
        function frame(now) {
            const t = Math.min(1, (now - start) / (duration || 1));
            onProgress(t);
            if (t < 1) requestAnimationFrame(frame);
            else resolve();
        }
        requestAnimationFrame(frame);
        });
    }

    function fadeSteps(toBlack, opts = {}) {
        ensureLayers();
        const duration = opts.duration ?? 240; // ms
        const steps    = Math.max(1, opts.steps ?? 4);

        // We’ll combine opacity and stepped filter:
        // - overlay opacity goes 0→1 (toBlack) or 1→0 (fromBlack)
        // - filter moves in N steps for the “chunky” look
        return rafLoop(duration, t => {
            const p = toBlack ? t : (1 - t);
            // stepped progress
            const s = Math.round(p * (steps - 1)) / (steps - 1);
            overlay.style.opacity = String(p);
            filterLayer.style.filter = stepContrast(s);
        }).then(() => {
            // Clean up filter on completion so normal rendering looks correct
            filterLayer.style.filter = "";
        });
    }

    function fadeSmooth(toBlack, opts = {}) {
        ensureLayers();
        const duration = opts.duration ?? 220; // ms
        return rafLoop(duration, t => {
            const p = toBlack ? t : (1 - t);
            overlay.style.opacity = String(p);
            // no filter for gen2-ish; just a clean alpha fade
            filterLayer.style.filter = "";
        });
    }

})(window);