(function (g) {
    "use strict";

    // Utility: make a full-screen overlay; underUI=false puts it above UI
    function makeOverlay({ underUI = false } = {}) {
        const root =
            (g.Renderer && g.Renderer.root) ||
            document.getElementById("gameRoot") ||
            document.body;

        if (getComputedStyle(root).position === "static") {
            root.style.position = "relative";
        }

        const overlay = document.createElement("div");
        Object.assign(overlay.style, {
            position: "absolute",
            inset: "0",
            background: "rgba(0,0,0,0)",
            pointerEvents: "none",
            // place either just under UI or above everything
            zIndex: underUI ? "99998" : "99999",
            // we’ll step filters to get a GB-ish feel
            filter: "none",
        });
        root.appendChild(overlay);
        return { root, overlay };
    }

    // Discrete “GB-ish” mapping for a step 0..4
    function gbStepStyle(step) {
        // step: 0 (no fade) → 4 (full black)
        const pct = step / 4;               // 0, .25, .5, .75, 1
        const alpha = pct;                  // overlay alpha
        const brightness = 1 - 0.6 * pct;   // 1 → 0.4
        const contrast   = 1 + 0.4 * pct;   // 1 → 1.4
        return {
            bg: `rgba(0,0,0,${alpha})`,
            filter: `brightness(${brightness}) contrast(${contrast})`
        };
    }

    // ---- GEN 1 (stepped) ----------------------------------------------------

    // Fade to black in 4 hard steps (25% each).
    function gen1ToBlack(opts = {}) {
        const duration = opts.duration ?? 240;    // total ms (≈60ms/step)
        const underUI  = !!opts.underUI;

        const { overlay } = makeOverlay({ underUI });

        return new Promise(resolve => {
            const stepDur = Math.max(1, Math.round(duration / 4));
            let step = 0;

            // do an immediate update to step 1 at t≈stepDur
            const tick = () => {
                step++;
                const { bg, filter } = gbStepStyle(step);
                overlay.style.background = bg;
                overlay.style.filter = filter;

                if (step < 4) {
                    setTimeout(tick, stepDur);
                } else {
                    // done at step 4
                    resolve();
                }
            };

            // start stepping
            setTimeout(tick, stepDur);
        });
    }

    // From black back to clear in 4 hard steps.
    function gen1FromBlack(opts = {}) {
        const duration = opts.duration ?? 240;
        const underUI  = !!opts.underUI;

        const { overlay, root } = makeOverlay({ underUI });

        // start fully black
        {
            const { bg, filter } = gbStepStyle(4);
            overlay.style.background = bg;
            overlay.style.filter = filter;
        }

        return new Promise(resolve => {
            const stepDur = Math.max(1, Math.round(duration / 4));
            let step = 4;

            const tick = () => {
                step--;
                const { bg, filter } = gbStepStyle(step);
                overlay.style.background = bg;
                overlay.style.filter = filter;

                if (step > 0) {
                    setTimeout(tick, stepDur);
                } else {
                    // fully clear → remove overlay
                    overlay.remove();
                    resolve();
                }
            };

            setTimeout(tick, stepDur);
        });
    }

    // ---- GEN 2 (smooth alpha) ----------------------------------------------

    function gen2ToBlack(opts = {}) {
        const duration = opts.duration ?? 220;
        const underUI  = !!opts.underUI;
        const { overlay } = makeOverlay({ underUI });

        overlay.style.filter = ""; // smooth: no GB-ish filter

        return new Promise(resolve => {
            const start = performance.now();
            function frame(now) {
                const t = Math.min(1, (now - start) / duration);
                overlay.style.background = `rgba(0,0,0,${t})`;
                if (t < 1) requestAnimationFrame(frame);
                else resolve();
            }
            requestAnimationFrame(frame);
        });
    }

    function gen2FromBlack(opts = {}) {
        const duration = opts.duration ?? 220;
        const underUI  = !!opts.underUI;
        const { overlay } = makeOverlay({ underUI });

        overlay.style.background = "rgba(0,0,0,1)";
        overlay.style.filter = "";

        return new Promise(resolve => {
            const start = performance.now();
            function frame(now) {
                const t = Math.min(1, (now - start) / duration);
                overlay.style.background = `rgba(0,0,0,${1 - t})`;
                if (t < 1) requestAnimationFrame(frame);
                else {
                overlay.remove();
                resolve();
                }
            }
            requestAnimationFrame(frame);
        });
    }

    // Minimal test hooks (optional)
    function testGen1() {
        console.debug("[Transitions] gen1 test start");
        return gen1ToBlack({ duration: 320 }).then(() =>
            gen1FromBlack({ duration: 320 }).then(() =>
                console.debug("[Transitions] gen1 test done")
            )
        );
    }

    function testGen2() {
        console.debug("[Transitions] gen2 test start");
        return gen2ToBlack({ duration: 220 }).then(() =>
            gen2FromBlack({ duration: 220 }).then(() =>
                console.debug("[Transitions] gen2 test done")
            )
        );
    }

    g.Transitions = {
        gen1ToBlack,
        gen1FromBlack,
        gen2ToBlack,
        gen2FromBlack,
        testGen1,
        testGen2
    };

})(window);