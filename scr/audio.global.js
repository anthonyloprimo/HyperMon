// Audio Engine
// Handles SFX and BGM
// SFX data is stored in res/sfx/*.wav or *.ogg
// BGM data is stored in res/bgm/*.mp3 or *.ogg
(function (g) {
    "use strict";
 
    // Map your logical IDs to file paths. Keep IDs UPPERCASE to match parser.
    const SFX_MANIFEST = {
        PRESSAB:         "res/sfx/SFX_PRESS_AB.wav",
        ARROWTILES:      "res/sfx/SFX_ARROW_TILES.wav",
        BALLPOOF:        "res/sfx/SFX_BALL_POOF.wav",
        BALLTOSS:        "res/sfx/SFX_BALL_TOSS.wav",
        CAUGHTMON:       "res/sfx/SFX_CAUGHT_MON.wav",
        COLLISION:       "res/sfx/SFX_COLLISION.wav",
        CUT:             "res/sfx/SFX_CUT.wav",
        DENIED:          "res/sfx/SFX_DENIED.wav",
        TURNONPC:        "res/sfx/SFX_TURN_ON_PC.wav",
        TURNOFFPC:       "res/sfx/SFX_TURN_OFF_PC.wav",
        WITHDRAWDEPOSIT: "res/sfx/SFX_WITHDRAW_DEPOSIT.wav",
        GOINSIDE:        "res/sfx/SFX_GO_INSIDE.wav",
        GOOUTSIDE:       "res/sfx/SFX_GO_OUTSIDE.wav",
        HEALAILMENT:     "res/sfx/SFX_HEAL_AILMENT.wav",
        FLY:             "res/sfx/SFX_FLY.wav",
        GETITEM1:        "res/sfx/SFX_GET_ITEM_1.wav",
        GETITEM2:        "res/sfx/SFX_GET_ITEM_2.wav",
        GETKEYITEM:      "res/sfx/SFX_GET_KEY_ITEM.wav",
        LEVELUP:         "res/sfx/SFX_LEVEL_UP.wav",
        POKEDEXRATING:   "res/sfx/SFX_POKEDEX_RATING.wav",
        SLOTSSTOPWHEEL:  "res/sfx/SLOTS_STOP_WHEEL.wav",
        SLOTSNEWSPIN:    "res/sfx/SFX_SLOTS_NEW_SPIN.wav",
        SLOTSREWARD:     "res/sfx/SFX_SLOTS_REWARD.wav",
        PURCHASE:        "res/sfx/SFX_PURCHASE.wav",
        LEDGE:           "res/sfx/SFX_LEDGE.wav",
        RUN:             "res/sfx/SFX_RUN.wav",
        SAVE:            "res/sfx/SFX_SAVE.wav",
        SHRINK:          "res/sfx/SFX_SHRINK.wav",
        SILPHSCOPE:      "res/sfx/SFX_SILPH_SCOPE.wav",
        TELEPORTENTER1:  "res/sfx/SFX_TELEPORT_ENTER_1.wav",
        TELEPORTENTER2:  "res/sfx/SFX_TELEPORT_ENTER_2.wav",
        TELEPORTEXIT1:   "res/sfx/SFX_TELEPORT_EXIT_1.wav",
        TELEPORTEXIT2:   "res/sfx/SFX_TELEPORT_EXIT_2.wav",
        INTROHIP:        "res/sfx/SFX_INTRO_HIP.wav",
        INTROHOP:        "res/sfx/SFX_INTRO_HOP.wav",
        INTRORAISE:      "res/sfx/SFX_INTRO_RAISE.wav",
        INTROLUNGE:      "res/sfx/SFX_INTRO_LUNGE.wav",
        INTROWHOOSH:     "res/sfx/SFX_INTRO_WHOOSH.wav",
        INTROCRASH:      "res/sfx/SFX_INTRO_CRASH.wav",
        POISONED:        "res/sfx/SFX_POISONED.wav",
        STARTMENU:       "res/sfx/SFX_START_MENU.wav",
        SWITCH:          "res/sfx/SFX_SWITCH.wav",
        SWAP:            "res/sfx/SFX_SWAP.wav",
        HEALINGMACHINE:  "res/sfx/SFX_HEALING_MACHINE.wav",
    };
 
    const BGM_MANIFEST = {
        OPENING:    "res/bgm/02. Opening Movie - Stereo (Red, Green & Blue Version).mp3",
        TITLE:      "res/bgm/03. Title Screen.mp3",
        PALLET:     "res/bgm/04 Pallet Town.mp3",
        PROFOAK:    "res/bgm/05 Professor Oak.mp3",
        HURRYALONG: "res/bgm/06. Hurry Along.mp3",
        OAKSLAB:    "res/bgm/07. Pokémon Lab.mp3"
    };
 
    // Defaults when flags are omitted by *BGM,ID:
    const DEFAULT_BGM_LOOP = true;
    const DEFAULT_BGM_FADE = false;
 
    // Fade timings (ms)
    const FADE_OUT_MS = 500;
    const FADE_IN_MS  = 500;
 
    // Web Audio setup
    const AudioContextCtor = (window.AudioContext || window.webkitAudioContext);
    const ctx = new AudioContextCtor();
    let unlocked = false;
 
    function tryStartCurrentMedia() {
        if (currentBgm && currentBgm.media && currentBgm.media.paused) {
            currentBgm.media.play().catch(() => {});
            // ensure gain is up (in case we faded to 0)
            // try { fadeTo(currentBgm.gain, 1.0, FADE_IN_MS); } catch (e) {}
            if (currentBgm.gain) fadeTo(currentBgm.gain, 1.0, FADE_IN_MS);
            else fadeElementVolume(currentBgm.media, 1.0, FADE_IN_MS);
        }
    }
 
    function unlockAudio() {
        if (unlocked) return;
        // Resume context on first user gesture
        const resume = async () => {
            try { await ctx.resume(); } catch (e) {}
            unlocked = (ctx.state === "running");
            tryStartCurrentMedia();
            window.removeEventListener("pointerdown", resume);
            window.removeEventListener("keydown", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
    }
    unlockAudio();
 
    // SFX: buffer cache
    const sfxCache = new Map(); // id -> AudioBuffer
 
    async function loadSfx(id) {
        if (sfxCache.has(id)) return sfxCache.get(id);
        const url = SFX_MANIFEST[id];
        if (!url) return null;
        const resp = await fetch(url);
        const ab   = await resp.arrayBuffer();
        const buf  = await ctx.decodeAudioData(ab);
        sfxCache.set(id, buf);
        return buf;
    }
 
    function playSfxImmediate(id) {
        const buf = sfxCache.get(id);
        if (!buf) return null;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        src.connect(gain).connect(ctx.destination);
        src.start(0);
        return { src, gain };
    }
 
    const SFX_USE_ELEMENT = (location.protocol === "file:"); // force element for local files
 
    function playSfxElement(id) {
        const url = SFX_MANIFEST[id];
        if (!url) return null;
        const el = new Audio(url);
        el.preload = "auto";
        el.play().catch(()=>{ /* ignore autoplay errors; unlock will handle */ });
        return el;
    }
 
    // BGM: media element + gain for fade
    let currentBgm = null; // { id, media, node, gain, loop, once, returnTo }
    const bgmStack = [];   // stack for ONCE/restore (depth 1–2 is plenty)
 
    function makeMedia(url, loop) {
        const el = new Audio();
        el.src = url;
        el.loop = !!loop;
        el.preload = "auto";
        // Commenting out crossOrigin for now as we want to make this work for local files at this time (double-click index.html)
        // el.crossOrigin = "anonymous"; // safe if files are same-origin; harmless otherwise
        return el;
    }
 
    function connectMedia(el) {
        try {
            const node = ctx.createMediaElementSource(el);
            const gain = ctx.createGain();
            node.connect(gain).connect(ctx.destination);
            return { node, gain };
        } catch (e) {
            // Fallback to plain HTMLAudio
            return { node: null, gain: null, ok: false };
        }
    }
 
    function fadeTo(gainNode, target, ms) {
        const now = ctx.currentTime;
        const dur = Math.max(0.001, ms / 1000);
        const start = gainNode.gain.value;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(start, now);
        gainNode.gain.linearRampToValueAtTime(target, now + dur);
    }
 
        // fallback if local file only
        function fadeElementVolume(media, target, ms) {
            const start = media.volume;
            const startTime = performance.now();
            const dur = Math.max(1, ms|0);
 
            function step(now) {
                const t = Math.min(1, (now - startTime) / dur);
                media.volume = start + (target - start) * t;
                if (t < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }
 
    async function startBgm(opts) {
        const { id, fade = DEFAULT_BGM_FADE, loop = DEFAULT_BGM_LOOP, once = false, returnTo = null } = opts;
        if (!id) return;
        const url = BGM_MANIFEST[id];
        if (!url) return;
 
        // Prepare next media
        const media = makeMedia(url, !once && loop);
        // const { node, gain, ok } = connectMedia(media);
        // gain.gain.value = 0.0;
        const useGraph = location.protocol !== "file:";
        const { node, gain, ok } = useGraph ? connectMedia(media) : { node: null, gain: null, ok: false };
        if (ok) { gain.gain.value = 0.0; }
 
        // Handle ONCE: push current on stack
        if (once) {
            if (currentBgm && currentBgm.id) {
                bgmStack.push({ id: currentBgm.id, loop: currentBgm.media?.loop ?? DEFAULT_BGM_LOOP });
            } else {
                bgmStack.push(null);
            }
        }
        
        // Swap: stop current
        await stopBgmInternal({ fade }); // fade-out old track
 
        // Become current
        currentBgm = { id, media, node, gain, loop: !once && loop, once, returnTo };
 
        // If once, restore behavior on ended
        if (once) { media.addEventListener("ended", () => { restoreAfterOnce(); }, { once: true }); }
 
        // Play (ensure context running)
        if (ctx.state !== "running") { try { await ctx.resume(); } catch (e) {} }
        media.currentTime = 0;
 
        // Set starting loudness for chosen path and then play...
        if (ok) {
            gain.gain.value = 1.0;
            media.play().catch(()=>{ /* ignore autoplay errors; unlock will handle */ });
            // fadeTo(gain, 1.0, FADE_IN_MS);  // No fade in for playing
        } else {
            media.volume = 1.0;
            media.play().catch(()=>{ /* ignore autoplay errors; unlock will handle */ });
            fadeElementVolume(media, 1.0, FADE_IN_MS);
        }
 
        // Fade in
        // fadeTo(gain, 1.0, FADE_IN_MS);
        media.volume = ok ? 1.0 : 1.0;
        if (ok) fadeTo(gain, 1.0, FADE_IN_MS);
        else fadeElementVolume(media, 1.0, FADE_IN_MS);
    }
 
    async function stopBgmInternal({ fade = DEFAULT_BGM_FADE } = {}) {
        if (!currentBgm) return;
        const { media, gain } = currentBgm;
        if (fade) {
            if (gain) fadeTo(gain, 0.0, FADE_OUT_MS);
            else fadeElementVolume(media, 0.0, FADE_OUT_MS);
            await new Promise(r => setTimeout(r, FADE_OUT_MS));
        }
        try { media.pause(); } catch (e) {}
        try { media.volume = 0.0; } catch (e) {}
        try { media.src = ""; media.load?.(); } catch (e) {}
        // disconnect
        try { currentBgm.node.disconnect(); } catch (e) {}
        currentBgm = null;
    }
 
    async function restoreAfterOnce() {
        // If an explicit returnTo was set, prefer it
        if (currentBgm && currentBgm.returnTo) {
            const id = currentBgm.returnTo;
            currentBgm = null;
            await startBgm({ id, fade: true, loop: true, once: false });
            // clear stack because we overrode restore
            bgmStack.length = 0;
            return;
        }
 
        // Otherwise pop prior
        const prior = bgmStack.pop ? bgmStack.pop() : null;
        currentBgm = null;
 
        if (prior && prior.id) {
            await startBgm({ id: prior.id, fade: true, loop: prior.loop, once: false });
        } else {
            // No prior — just stop (silence)
            // nothing to do
        }
    }
 
    // ---------- Public hooks for TextBox ----------
    g.AudioHooks = {
        // Non-blocking or blocking SFX (event-driven). Text engine passes resume() for blocking.
        onSfx: (id, { blocking, resume /*, skippable */ }) => {
            if (SFX_USE_ELEMENT) { // fallback if local file only
                const el = playSfxElement(id);
                if (!el) { if (resume) resume(); return; }
                if (blocking) {
                    const done = () => { el.removeEventListener("ended", done); resume && resume(); };
                    el.addEventListener("ended", done, {once: true});
                    // 5 second failsafe
                    setTimeout(() => { el.pause?.(); done(); }, 5000);
                }
                return;
            }
 
            const ensure = sfxCache.has(id) ? Promise.resolve() : loadSfx(id);
            ensure.then(() => {
                const h = playSfxImmediate(id);
                if (!h) { if (resume) resume(); return; }
                if (!blocking) return;
                // Unblock when the buffer ends
                h.src.addEventListener("ended", () => resume && resume(), { once: true });
            }).catch(() => {
                if (resume) resume();
            });
        },
 
        // BGM control; never blocks the textbox
        onBgm: ({ id, fade, loop, once, returnTo, stop }) => {
            if (stop) {
                stopBgmInternal({ fade: !!fade });
                return;
            }
            // Defaults when flags omitted:
            const wantLoop = (loop != null) ? !!loop : DEFAULT_BGM_LOOP;
            const wantFade = (fade != null) ? !!fade : DEFAULT_BGM_FADE;
            startBgm({ id, fade: wantFade, loop: wantLoop, once: !!once, returnTo: returnTo || null });
        }
    };
 
    // ---------- Optional: simple preload helpers you can call from boot ----------
    g.AudioPreload = {
        // Prime SFX by IDs (returns a Promise that resolves when all decoded)
        sfx: async function(ids) {
            const jobs = (ids || []).map(id => loadSfx(id).catch(()=>null));
            await Promise.all(jobs);
        },
        // Ensure BGM element has buffered metadata (not strictly required, but helps quick start)
        bgm: async function(ids) {
            const tasks = (ids || []).map(id => {
                const url = BGM_MANIFEST[id];
                if (!url) return Promise.resolve();
                return new Promise((resolve) => {
                    const el = makeMedia(url, true);
                    el.preload = "auto";
                    el.addEventListener("loadedmetadata", () => resolve(), { once: true });
                    // kick network
                    // Some browsers need play/pause to cache metadata — avoid autoplay policy issues:
                    el.load();
                    // allow GC; we don't keep node connections for preloads
                });
            });
            await Promise.all(tasks);
        }
    };
 
    // Expose simple getters if needed elsewhere
    g.AudioState = {
        get currentBgmId() { return currentBgm?.id || null; },
        setBgmVolume(v) {
            v = Math.max(0, Math.min(1, v));
            if (!currentBgm) return;
            if (currentBgm.gain) currentBgm.gain.gain.value = v;
            else currentBgm.media.volume = v;
        }
    };
 
})(window);