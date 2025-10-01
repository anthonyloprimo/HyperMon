(function (g) {
    "use strict";

    // Single shared overlay node
    let overlayEl = null;

    // Layer z-index knobs (adjust if your UI/sprite layers differ)
    const Z_BELOW_UI = 9000;   // under UI, above playfield
    const Z_ABOVE_UI = 11000;  // above everything (full-screen cover)

    function ensureOverlay({ underUI = false } = {}) {
        if (!overlayEl) {
            overlayEl = document.createElement("div");
            overlayEl.id = "transition-overlay";
            Object.assign(overlayEl.style, {
                position: "absolute",
                left: "0", top: "0", width: "100%", height: "100%",
                pointerEvents: "none",
                backgroundColor: "rgba(0,0,0,0)",
                // We’ll use backdrop-filter for GB “palette step” feel (optional)
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                opacity: "1",
                display: "none",
            });
            // mount it once; stick it on game root so it spans everything
            const root = document.getElementById("gameRoot") || document.body;
            root.appendChild(overlayEl);
        }
        overlayEl.style.zIndex = String(underUI ? Z_BELOW_UI : Z_ABOVE_UI);
        overlayEl.style.display = "block";
        return overlayEl;
    }

    function hideOverlay() {
        if (!overlayEl) return;
        overlayEl.style.display = "none";
        overlayEl.style.backgroundColor = "rgba(0,0,0,0)";
        overlayEl.style.backdropFilter = "none";
        overlayEl.style.WebkitBackdropFilter = "none";
        overlayEl.style.opacity = "1";
    }

    // --- Step scheduler for Gen1 style (discrete, no easing) ---
    function runSteps({ duration = 320, steps = 4, onStep, keepFrame = false }) {
        return new Promise(resolve => {
            const per = Math.max(1, Math.floor(duration / steps));
            let i = 0;
            let lastTime = performance.now();

            function tick(now) {
                // run as many steps as time allows to stay deterministic
                while (i < steps && (now - lastTime) >= per) {
                    i++;
                    lastTime += per;
                    onStep(i, steps);
                }
                if (i >= steps) {
                    if (!keepFrame) {
                        // noop: caller decides whether to leave overlay up or hide it
                    }
                    resolve();
                    return;
                }
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    // ------- GEN 1: stepped palette-ish fade --------
    // OUT: step to 25/50/75/100% black; leave overlay up (fully black) at the end.
    function gen1ToBlack(opts = {}) {
        const { duration = 320, underUI = false } = opts;
        const el = ensureOverlay({ underUI });

        // Start from clear
        el.style.backgroundColor = "rgba(0,0,0,0)";
        el.style.backdropFilter = "none";
        el.style.WebkitBackdropFilter = "none";

        return runSteps({
            duration,
            steps: 4,
            keepFrame: true, // leave final frame (black) up so you can swap maps under cover
            onStep(i /*1..4*/, total) {
                // 1/4, 2/4, 3/4, 4/4
                const a = i / total; // 0.25, 0.5, 0.75, 1
                // “GB palette step” feel: jump both alpha and contrast in discrete chunks
                el.style.backgroundColor = `rgba(0,0,0,${a.toFixed(2)})`;
                // modest contrast bump to simulate palette remap harshness
                const c = 1 + (a * 1); // 1.15, 1.30, 1.45, 1.60-ish
                const filter = `contrast(${c.toFixed(2)})`;
                el.style.backdropFilter = filter;
                el.style.WebkitBackdropFilter = filter;
            }
        });
    }

    // IN: step back 100→75→50→25→0, then hide/remove overlay.
    function gen1FromBlack(opts = {}) {
        const { duration = 320, underUI = false } = opts;
        const el = ensureOverlay({ underUI });

        // Ensure we start at full black (in case called standalone)
        el.style.display = "block";
        el.style.backgroundColor = "rgba(0,0,0,1)";
        const startFilter = `contrast(1.60)`;
        el.style.backdropFilter = startFilter;
        el.style.WebkitBackdropFilter = startFilter;

        return runSteps({
            duration,
            steps: 2,
            onStep(i /*1..4*/, total) {
                // reverse: 1->0.75, 2->0.5, 3->0.25, 4->0
                const remain = (total - i) / total; // 0.75, 0.5, 0.25, 0
                el.style.backgroundColor = `rgba(255,255,255)`;
                const filter = `contrast(1)`;
                el.style.backdropFilter = filter;
                el.style.WebkitBackdropFilter = filter;
                if (remain === 0) hideOverlay();
            }
        });
    }

    // ------- GEN 2: smooth fade --------
    function gen2ToBlack(opts = {}) {
        const { duration = 280, underUI = false } = opts;
        const el = ensureOverlay({ underUI });
        // Immediate style prep (no CSS easing between discrete steps here)
        el.style.backdropFilter = "none";
        el.style.WebkitBackdropFilter = "none";
        el.style.transition = "none";
        el.style.backgroundColor = "rgba(0,0,0,0)";
        // Next frame: add transition and animate to black
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                el.style.transition = `background-color ${duration}ms linear`;
                el.style.backgroundColor = "rgba(0,0,0,1)";
                const onEnd = () => {
                    el.removeEventListener("transitionend", onEnd);
                    // leave up black, caller decides next step
                    resolve();
                };
                el.addEventListener("transitionend", onEnd);
            });
        });
    }

    function gen2FromBlack(opts = {}) {
        const { duration = 280, underUI = false } = opts;
        const el = ensureOverlay({ underUI });
        // Ensure start at black
        el.style.transition = "none";
        el.style.backgroundColor = "rgba(0,0,0,1)";
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                el.style.transition = `background-color ${duration}ms linear`;
                el.style.backgroundColor = "rgba(0,0,0,0)";
                const onEnd = () => {
                    el.removeEventListener("transitionend", onEnd);
                    hideOverlay();
                    resolve();
                };
                el.addEventListener("transitionend", onEnd);
            });
        });
    }

    // Tiny smoke test helpers you can call from console:
    function testGen1() {
        console.debug("[Transitions] gen1 test start");
        return gen1ToBlack({ duration: 320 })
            .then(() => gen1FromBlack({ duration: 320 }))
            .then(() => console.debug("[Transitions] gen1 test done"));
    }

    function testGen2() {
        console.debug("[Transitions] gen2 test start");
        return gen2ToBlack({ duration: 280 })
            .then(() => gen2FromBlack({ duration: 280 }))
            .then(() => console.debug("[Transitions] gen2 test done"));
    }

    g.Transitions = {
        // public API
        gen1ToBlack, gen1FromBlack,
        gen2ToBlack, gen2FromBlack,
        testGen1, testGen2,
        // utils if you need them elsewhere
        _ensureOverlay: ensureOverlay,
        _hideOverlay: hideOverlay
    };
})(window);