/*
    TEXT ENGINE
 
    HOW TO USE:
        The text engine allows a wide range of features that imitate Generation I and II Pokemon games.
        At it's core, we create a textbox and print text.  But, there's a lot more to it than that.
        First, create a new textbox object with something like this:
            > const box = new TextBox();
 
        Next, you can call the functions for said textbox object like so:
            > box.show(`This is a message!\n  A really long message, at that!`);
 
        Ideally you'll want to use template literals instead of normal strings, as we can combine perks of JavaScript
            as well as our own built in commands. Commands, you say? Yes! We have commands!  Here they are...
           
            > *CMD,arg:
 
            Commands for our textbox engine have a strict format to ensure we don't accidentally display text.
            Commands start with an asterisk (*), with a command name following immediately (no spaces) in all capitals.
            Commands end with a colon (:), and before that, can contain a comma (,) followed by any parameters/arguments.
            There are no spaces in commands, otherwise they will be considered text, instead.
 
            Commands are:
                - *WAIT: Pauses the text progression for a default of 45 frames.
                - *WAIT,nn: waits for a duration of nn frames, specified as an integer value.  *WAIT,100: will pause text for 100 frames.
                - *AUTO: will automatically invoke an "A" button press to advance the text.
                - *PAUSE,func: will indefinitely pause text progression to execute a function spoecified as a parameter.
                               A function *must* be set otherwise it's ignored and treated as text (even if it's written as a valid command)
                               A function written for this should always have a callback to signal the end of the command and continue text.
                               An example of this is saving the game.  For example:
                                   `Saving the game, do not turn off the power*PAUSE,SAVEGAME:*AUTO:${playerName} has saved the game.`
                                   
                                   We display the first part of the text, pause the text engine to save the game, and when it
                                       completes, it resumes processing the string, which includes an *AUTO: command and then displaying the text that the player has saved the game.
                -
 

*/
(function (g) {
    "use strict";
 
    const SCREEN_W = 160;
    const SCREEN_H = 144;
    const DEFAULT_MARGIN = 8;
    const SCROLL_STEP_FRAMES = 8; // TODO: Verify against pokered disassembly to determine exact amount of frames to scroll text.
    const DEFAULT_WAIT_FRAMES = 45; // TODO: Verify against pokered disassembly
<<<<<<< HEAD
    // const TYPE_SPEEDS = {
    //     SLOW: 1,
    //     MED:  3,
    //     FAST: 999
    // };
    const FRAMES_PER_CHAR = {
        SLOW: 3,  // TODO: verify against pokered disassembly
        MED:  1   // TODO: verify against pokered disassembly
        // FAST is not specified as it's "instant" in displaying each line.
    };
 
    g.EngineSettings = g.EngineSettings || { textSpeedDefault: 'MED'};
=======
    const TYPE_SPEEDS = {
        SLOW: 1,
        MED: 2,
        FAST: 999
    };
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
 
    // --- Tokenizer ---------------------------------------------------------
    // WORD(text), SP(count), NL, CMD({name, n})
    function tokenize(src) {
        const tokens = [];
        const s = String(src);
        let i = 0;
 
        function pushWord(text) { if (text.length) tokens.push({ t: "WORD", text }); }
        function pushSpaces(n) { if (n > 0) tokens.push({ t: "SP", n }); }
        function pushNL() { tokens.push({ t: "NL" }); }
 
        while (i < s.length) {
            const ch = s[i];
 
            if (ch === "\n") { pushNL(); i++; continue; }
 
            // Commands: *WAIT:  *WAIT,NN:  *AUTO:
            if (ch === "*") {
                const cmd = tryParseCommand(s, i);
<<<<<<< HEAD
                if (cmd) { tokens.push({ t: "CMD", name: cmd.name, n: cmd.n, arg: cmd.arg }); i = cmd.nextIndex; continue; }
=======
                if (cmd) { tokens.push({ t: "CMD", name: cmd.name, n: cmd.n }); i = cmd.nextIndex; continue; }
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
                // If a command isn't valid, treat '*' as normal text
            }
 
            // Spaces (preserve multiple)
            if (ch === " ") { 
                let n = 1; i++;
                while (i < s.length && s[i] === " ") { n++; i++; }
                pushSpaces(n); continue;
            }
 
            // WORD: run until space, newline, or potential command
            let j = i;
            while (j < s.length) {
                const c = s[j];
                if (c === "\n" || c === " " || c === "*") break;
                j++;
            }
            pushWord(s.slice(i, j));
            i = j;
        }
        return tokens;
    }
 
    // Strict command grammar:
    // *WAIT:         (without a number results in default frames defined via const DEFAULT_WAIT_FRAMES)
    // *WAIT,NN:      (immediately follow WAIT with a comma and integer to override DEFAULT_WAIT_FRAMES and specify frames to wait.)
    // *AUTO:         (Automatically triggers an "A" press.  Should follow a newline, or automatically force one?)
    // Must be UPPERCASE and end with ':' immediately, otherwise it's treated as text!
    function tryParseCommand(s, startIdx) {
        // starts with '*'
        let i = startIdx + 1;
        // read until colon or end
        const colon = s.indexOf(":", i);
        if (colon === -1) return null;
        const body = s.slice(i, colon); // i.e "WAIT", "WAIT,40", "AUTO" "TSPD,SLOW"
 
        // Ensure command is uppercase.
        if (!/^[A-Z][A-Z0-9,]*$/.test(body)) return null;
 
        // *WAIT: without a parameter - waits a default amount of frames.
            if (body === "WAIT") return { name: "WAIT", n: null, nextIndex: colon + 1 };
 
        // *WAIT,nn: 'nn' is an integer in frames to wait.
            if (body.startsWith("WAIT,")) {
                const nStr = body.slice(5);
                if (!/^[0-9]+$/.test(nStr)) return null;
                return { name: "WAIT", n: parseInt(nStr, 10), nextIndex: colon + 1 };
            }
 
        // *AUTO: - automatically invokes an "A" button press and advances the text without human input.
        if (body === "AUTO") return { name: "AUTO", n: null, nextIndex: colon + 1 };
 
<<<<<<< HEAD
        // *TSPD,spd|int: - immediately alters the text speed being printed at the point this command is parsed.
        if (body.startsWith("TSPD,")) {
            const arg = body.slice(5);  // "SLOW" | "MED" | "FAST" | "DEF" | int (number as string)
            if (!arg.length) return null;
            return { name: "TSPD", arg, nextIndex: colon + 1};
        }
 
=======
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
        return null;
    }
 
    // ---------- Layout (dialog) ----------
    // Overlapping windows:
    // The first page (page0) shows lines 1 and 2.  Each new 'page' reveals one new line at a time after pushing each line up (line 1 and 2, then 2 and 3, 3 and 4, etc...)
    // Caret will display if there's content after what's currently displayed
    //
    // We also capture per-line event streams for typewriter:
    //   events = [{type:"text", text}, {type:"cmd", name, n}, ...]
    function layoutPagesDialog(src) {
        const toks = tokenize(src);
 
        // Keep commands in the stream (so we preserve their order relative to text)
        const stream = [];
        for (let k = 0; k < toks.length; k++) {
            const t = toks[k];
            // clone to avoid mutating the original
            if (t.t === "WORD") stream.push({ t: "WORD", text: t.text });
            else if (t.t === "SP") stream.push({ t: "SP", n: t.n });
            else if (t.t === "NL") stream.push({ t: "NL" });
            else if (t.t === "CMD") stream.push({ t: "CMD", name: t.name, n: t.n });
        }
 
        const pages = [];
        let cursor = 0;
        let haveTop = false;
        let topLineText = "";
        let topLineEvents = [];
 
        function contentLeft(arr, idx) {
            for (let m = idx; m < arr.length; m++) {
                const t = arr[m];
                if (t.t === "WORD") return true;
                if (t.t === "NL")   return true;
                if (t.t === "SP" && t.n > 0) return true;
                // CMD alone doesn't constitute content
            }
            return false;
        }
 
        if (!contentLeft(stream, 0)) {
            pages.push({ text: "\n\n\n", caret: false, l1: { text: "", events: [] }, l2: { text: "", events: [] } });
            return pages;
        }
 
        while (true) {
            let line1, ev1;
 
            if (!haveTop) {
                const r1 = takeLineWithCmds(stream, cursor, 18);
                line1 = rtrim(r1.text);
                ev1 = r1.events;
                cursor = r1.next;
                haveTop = true;
            } else {
                line1 = topLineText;
                ev1 = []; // already executed last window
            }
 
            // If no content remains, final window is [line1, ""]
            if (!contentLeft(stream, cursor)) {
                const pageText = "\n" + line1 + "\n\n";
                pages.push({
                    text: pageText,
                    caret: false,
                    l1: { text: line1, events: ev1 },
                    l2: { text: "", events: [] }
                });
                break;
            }
 
            // Decide caret by peeking bottom width 17
            const peek = deepSlice(stream, cursor);
            measureTakeLine(peek, 17); // mutate peek
            const caretNeeded = contentLeft(peek, idxOf(peek)); // idxOf(peek) returns next index? (we'll avoid; see measureTakeLine impl)
 
            // Actually take bottom with chosen width
            // We can't reuse peek's index, so do real take:
            const try17 = takeLineWithCmds(deepSlice(stream, cursor), 0, 17);
            const caretNeededReal = contentLeft(deepSlice(stream, cursor), try17.next);
            const widthL2 = caretNeededReal ? 17 : 18;
 
            const r2 = takeLineWithCmds(stream, cursor, widthL2);
            const line2 = rtrim(r2.text);
            const ev2 = r2.events;
            cursor = r2.next;
 
            const pageText = "\n" + line1 + "\n\n" + line2;
            pages.push({
                text: pageText,
                caret: caretNeededReal,
                l1: { text: line1, events: ev1 },
                l2: { text: line2, events: ev2 }
            });
 
            // Next window's top is this bottom
            topLineText = line2;
            topLineEvents = ev2;
 
            if (!contentLeft(stream, cursor)) break;
        }
 
        return pages;
    }
 
    // Consume one visual line up to maxWidth, producing text + event stream.
    // Events are ordered: {type:'text', text} or {type:'cmd', name, n}
    function takeLineWithCmds(stream, idx, maxWidth) {
        let width = 0;
        let out = "";
        let i = idx;
        const events = [];
 
        function pushTextChunk(txt) {
            if (!txt) return;
            // merge with previous text event if possible
            out += txt;
            const last = events[events.length - 1];
            if (last && last.type === "text") last.text += txt;
            else events.push({ type: "text", text: txt });
        }
 
        // skip leading spaces (they don't display at line start)
        while (i < stream.length && stream[i].t === "SP") i++;
 
        while (i < stream.length) {
            const t = stream[i];
 
            if (t.t === "CMD") {
<<<<<<< HEAD
                events.push({ type: "cmd", name: t.name, n: t.n, arg: t.arg });
=======
                events.push({ type: "cmd", name: t.name, n: t.n });
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
                i++;
                continue;
            }
 
            if (t.t === "NL") { i++; break; }
 
            if (t.t === "WORD") {
                const w = t.text;
                const wlen = w.length;
                const rem = maxWidth - width;
 
                if (wlen <= rem) {
                    pushTextChunk(w);
                    width += wlen;
                    i++;
                    continue;
                }
 
                if (wlen > maxWidth) {
                    // hard-break ONLY if at col 0; else defer
                    if (width === 0) {
                        pushTextChunk(w.slice(0, maxWidth));
                        stream[i] = { t: "WORD", text: w.slice(maxWidth) };
                        width = maxWidth;
                    }
                    break;
                }
 
                // fits on fresh line but not remaining → move to next line (don't consume)
                break;
            }
 
            if (t.t === "SP") {
                if (width === 0) { i++; continue; } // no leading spaces
                const rem = maxWidth - width;
                if (rem <= 0) break;
 
                const toAdd = Math.min(t.n, rem);
                pushTextChunk(" ".repeat(toAdd));
                width += toAdd;
 
                if (toAdd === t.n) { i++; }
                else { stream[i] = { t: "SP", n: t.n - toAdd }; }
                if (width >= maxWidth) break;
                continue;
            }
 
            // Unknown token
            i++;
        }
 
        return { text: out, next: i, events };
<<<<<<< HEAD
    }
 
    // For caret peek (ignore cmd content; just mutate until line width filled)
    function measureTakeLine(stream, maxWidth) {
        let width = 0;
        let i = 0;
=======
    }
 
    // For caret peek (ignore cmd content; just mutate until line width filled)
    function measureTakeLine(stream, maxWidth) {
        let width = 0;
        let i = 0;
 
        // skip leading spaces
        while (i < stream.length && stream[i].t === "SP") i++;
 
        while (i < stream.length) {
            const t = stream[i];
 
            if (t.t === "CMD") { i++; continue; }
            if (t.t === "NL")  { i++; break; }
 
            if (t.t === "WORD") {
                const wlen = t.text.length;
                const rem = maxWidth - width;
                if (wlen <= rem) { width += wlen; i++; continue; }
                if (wlen > maxWidth) {
                    if (width === 0) {
                        // consume maxWidth chars
                        if (t.text.length > maxWidth) {
                            t.text = t.text.slice(maxWidth); // leave remainder
                        } else {
                            i++;
                        }
                        width = maxWidth;
                    }
                    break;
                }
                break;
            }
 
            if (t.t === "SP") {
                if (width === 0) { i++; continue; }
                const rem = maxWidth - width;
                if (rem <= 0) break;
                if (t.n <= rem) { width += t.n; i++; }
                else { t.n -= rem; width += rem; }
                if (width >= maxWidth) break;
                continue;
            }
 
            i++;
        }
        // return not needed; we just mutated
    }
 
    function rtrim(s) { return s.replace(/[ ]+$/g, ""); }
    function deepSlice(arr, start) {
        const out = [];
        for (let i = start; i < arr.length; i++) {
            const t = arr[i];
            if (t.t === "WORD") out.push({ t: "WORD", text: t.text });
            else if (t.t === "SP") out.push({ t: "SP", n: t.n });
            else if (t.t === "NL") out.push({ t: "NL" });
            else if (t.t === "CMD") out.push({ t: "CMD", name: t.name, n: t.n });
        }
        return out;
    }
    // (helper used in a previous draft; no-op now)
    function idxOf(_arr) { return 0; }
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
 
        // skip leading spaces
        while (i < stream.length && stream[i].t === "SP") i++;
 
        while (i < stream.length) {
            const t = stream[i];
 
            if (t.t === "CMD") { i++; continue; }
            if (t.t === "NL")  { i++; break; }
 
            if (t.t === "WORD") {
                const wlen = t.text.length;
                const rem = maxWidth - width;
                if (wlen <= rem) { width += wlen; i++; continue; }
                if (wlen > maxWidth) {
                    if (width === 0) {
                        // consume maxWidth chars
                        if (t.text.length > maxWidth) {
                            t.text = t.text.slice(maxWidth); // leave remainder
                        } else {
                            i++;
                        }
                        width = maxWidth;
                    }
                    break;
                }
                break;
            }
 
            if (t.t === "SP") {
                if (width === 0) { i++; continue; }
                const rem = maxWidth - width;
                if (rem <= 0) break;
                if (t.n <= rem) { width += t.n; i++; }
                else { t.n -= rem; width += rem; }
                if (width >= maxWidth) break;
                continue;
            }
 
            i++;
        }
        // return not needed; we just mutated
    }
 
    function rtrim(s) { return s.replace(/[ ]+$/g, ""); }
    function deepSlice(arr, start) {
        const out = [];
        for (let i = start; i < arr.length; i++) {
            const t = arr[i];
            if (t.t === "WORD") out.push({ t: "WORD", text: t.text });
            else if (t.t === "SP") out.push({ t: "SP", n: t.n });
            else if (t.t === "NL") out.push({ t: "NL" });
            else if (t.t === "CMD") out.push({ t: "CMD", name: t.name, n: t.n });
        }
        return out;
    }
    // (helper used in a previous draft; no-op now)
    function idxOf(_arr) { return 0; }
 
    // TextBox
    function TextBox(options) {
        options = options || {};
        this.container = options.container || document.getElementById("layer-ui") || document.body;
 
        // Geometry (content area)
        const m = (options.margin != null) ? options.margin : DEFAULT_MARGIN;
        const h = (options.height != null) ? options.height : 32; // 4 rows × 8px
        const w = (options.width  != null) ? options.width  : (SCREEN_W - m * 2);
        const left = (options.left != null) ? options.left : 0;
        const top  = (options.top  != null) ? options.top  : (SCREEN_H - (h + m * 2));
 
        // Box element
        const el = document.createElement("div");
        el.className = "msgBox";
        el.style.display = "none";
        el.style.width  = w + "px";
        el.style.height = h + "px";
        el.style.left   = left + "px";
        el.style.top    = top  + "px";
 
        const p = document.createElement("p");
        el.appendChild(p);
 
        // Caret glyph
        const caret = document.createElement("div");
        caret.textContent = "▼";
        caret.style.position = "absolute";
        caret.style.width = "8px";
        caret.style.height = "8px";
        caret.style.fontFamily = "pkmnFont, monospace";
        caret.style.fontSize = "8px";
        caret.style.lineHeight = "8px";
        caret.style.letterSpacing = "0";
<<<<<<< HEAD
        caret.style.animation = "blink 600ms steps(1) infinite";
=======
        caret.style.animation = "blink 1000ms steps(1) infinite";  // On + off blink takes 1 second
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
        caret.style.display = "none";
        el.appendChild(caret);
 
        this.container.appendChild(el);
 
        // Public refs
        this.el = el;
        this.p  = p;
        this.caretEl = caret;
 
        // Page state
        this.visible = false;
        this.pages = [];
        this.pageIndex = 0;
 
        // Scroll state
        this._scrollPhase = "PAGE"; // "PAGE" | "SCROLL1" | "SCROLL2"
        this._phaseFrames = 0;
        this._prevL2 = "";
        this._prevL4 = "";
 
        // Typewriter state
        this.speed = (options.speed || "MED");
        this._typing = null;        // null | { line:1|2|'done', events, evIdx, charIdx, buffer, pause }
        this._autoPending = false;  // set by *AUTO:
        this._readyForAdvance = false; // true when page fully typed and no AUTO pending
 
<<<<<<< HEAD
        this._speedPreset = null;  // SLOW | MED | FAST | null
        this._speedFast   = false;  // true if FAST
        this._framesPerCharBase = FRAMES_PER_CHAR.MED; // numeric base (ignored when FAST)
        this._speedHeld = false;  // updated each update() call
 
=======
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
        this._positionCaret();
    }
 
    TextBox.prototype._positionCaret = function () {
        if (!this.el) return;
        const w = this.el.clientWidth || parseInt(this.el.style.width, 10) || 0;
        const h = this.el.clientHeight || parseInt(this.el.style.height, 10) || 0;
        this.caretEl.style.left = (w - 8) + "px";
        this.caretEl.style.top  = (h - 8) + "px";
    };
 
<<<<<<< HEAD
    TextBox.prototype._applySpeed = function(spec) {
        const conf = normalizeSpeedSpec(spec);
        this._speedFast = !!conf.fast;
        this._speedPreset = conf.preset;         // may be null
        if (!this._speedFast) {
            this._framesPerCharBase = conf.frames ?? FRAMES_PER_CHAR.MED;
        }
    };
 
    TextBox.prototype._effectiveFramesPerChar = function() {
        if (this._speedFast) return 0; // special: instant
        // “Hold to speed up” applies only when preset is SLOW
        if (this._speedPreset === 'SLOW' && this._speedHeld) {
            return FRAMES_PER_CHAR.MED;
        }
        return this._framesPerCharBase;
    };
 

    // Public API
    TextBox.prototype.show = function (text, opts) {
        opts = opts || {};
        //Resolve speed, per-call override or global default
        const want = (opts.speed != null ? opts.speed : g.EngineSettings.textSpeedDefault);
        this._applySpeed(want);
        // if (opts.speed) this.speed = opts.speed;
=======
    // ----- Public API -----
    TextBox.prototype.show = function (text, opts) {
        opts = opts || {};
        if (opts.speed) this.speed = opts.speed;
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
 
        this.pages = layoutPagesDialog(text);
        this.pageIndex = 0;
        this.visible = true;
 
        this._scrollPhase = "PAGE";
        this._phaseFrames = 0;
        this._autoPending = false;
        this._readyForAdvance = false;
 
        this.el.style.display = "inline-block";
 
        // Start typing: first page types L1 then L2
        this._startPageTyping(/*firstPage=*/true);
    };
 
    TextBox.prototype.hide = function (opts) {
        if (opts && opts.destroy) return this.destroy();
        this.visible = false;
        this.el.style.display = "none";
    };
 
    TextBox.prototype.destroy = function () {
        if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
        this.el = null; this.p = null; this.caretEl = null;
        this.pages = []; this.visible = false;
        this._typing = null;
    };
 
    // Update handles typing or two-step scroll
<<<<<<< HEAD
    TextBox.prototype.update = function (input = null) {
        if (!this.visible) return;
 
        // speedHeld = A/B currently held down (caller decides detection)
        this._speedHeld = !!(input && input.speedHeld);
 
        // --- scroll phases (block typing while scrolling) ---
        if (this._scrollPhase === "SCROLL1") {
            if (this._phaseFrames > 0) { this._phaseFrames--; return; }
            this._renderScrollPhase2();
            this._scrollPhase = "SCROLL2";
            this._phaseFrames = SCROLL_STEP_FRAMES;
            return;
        }
        if (this._scrollPhase === "SCROLL2") {
            if (this._phaseFrames > 0) { this._phaseFrames--; return; }
            this.pageIndex++;
            this._scrollPhase = "PAGE";
            this._autoPending = false;
            this._readyForAdvance = false;
            this._startPageTyping(false);
            return;
        }
 
        // --- typing phase (includes *WAIT: pauses) ---
        if (this._typing) {
            this._tickTypewriter();  // this is the ONLY place we render during typing
        } else {
            // --- idle page: DO NOT re-stamp text here ---
            // The page was stamped once when typing finished.
            // Only toggle caret while idle.
            const pg = this.pages[this.pageIndex];
            this._setCaretVisible(!!pg.caret && !this._autoPending);
        }
 
        // --- AUTO after page completes ---
        if (!this._typing && this._autoPending) {
            if (this.pageIndex + 1 < this.pages.length) this._startScroll();
            else this.hide({ destroy: true });
            this._autoPending = false;
        }
    };
=======
TextBox.prototype.update = function () {
    if (!this.visible) return;
 
    // --- scroll phases (block typing while scrolling) ---
    if (this._scrollPhase === "SCROLL1") {
        if (this._phaseFrames > 0) { this._phaseFrames--; return; }
        this._renderScrollPhase2();
        this._scrollPhase = "SCROLL2";
        this._phaseFrames = SCROLL_STEP_FRAMES;
        return;
    }
    if (this._scrollPhase === "SCROLL2") {
        if (this._phaseFrames > 0) { this._phaseFrames--; return; }
        this.pageIndex++;
        this._scrollPhase = "PAGE";
        this._autoPending = false;
        this._readyForAdvance = false;
        this._startPageTyping(false);
        return;
    }
 
    // --- typing phase (includes *WAIT: pauses) ---
    if (this._typing) {
        this._tickTypewriter();  // this is the ONLY place we render during typing
    } else {
        // --- idle page: DO NOT re-stamp text here ---
        // The page was stamped once when typing finished.
        // Only toggle caret while idle.
        const pg = this.pages[this.pageIndex];
        this._setCaretVisible(!!pg.caret && !this._autoPending);
    }
 
    // --- AUTO after page completes ---
    if (!this._typing && this._autoPending) {
        if (this.pageIndex + 1 < this.pages.length) this._startScroll();
        else this.hide({ destroy: true });
        this._autoPending = false;
    }
};
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
 
    TextBox.prototype.canAdvance = function () {
        return this.visible && this._scrollPhase === "PAGE" && !this._typing && this._readyForAdvance;
    };
 
    TextBox.prototype.advance = function () {
        // Only allow A when page is idle and ready (no typing, no pauses)
        if (!this.canAdvance()) return;
 
        if (this.pageIndex + 1 < this.pages.length) {
            this._startScroll();
        } else {
            this.hide({ destroy: true });
        }
    };
 
    // ----- Typewriter internals -----
    TextBox.prototype._startPageTyping = function (firstPage) {
        const pg = this.pages[this.pageIndex];
 
        // Reset caret
        this._setCaretVisible(false);
 
        // Set initial displayed lines
        if (firstPage) {
            // Start with L1 empty, then type L1 → L2
            this._renderLines("", "", "", "");
            this._typing = this._makeTypingState(1, pg.l1.events, pg.l1.text);
        } else {
            // After scroll, the new top is old bottom (already visible via scroll)
            // We show that on row 2; row 4 starts empty and will be typed
            // const prev = this.pages[this.pageIndex - 1];
            // const [_L1, prevL2, _L3, _L4] = splitPageLines(prev.text);
            // this._renderLines("", prevL2 || "", "", "");
            this._typing = this._makeTypingState(2, pg.l2.events, pg.l2.text);
        }
    };
 
    TextBox.prototype._makeTypingState = function (lineNum, events, fullText) {
        // Flatten events: list of {type:'text', text} and {type:'cmd', name, n}
        // Cursor: evIdx + charIdx into current text event
        return {
<<<<<<< HEAD
            line: lineNum,          // 1 or 2; 'done' when finished
            events: events.slice(),
            evIdx: 0,
            charIdx: 0,
            buffer: "",             // what we've revealed for this line
            full: fullText,
            pause: 0,               // frames remaining for WAIT
            framesUntilNextChar: 0  // Cadence counter
=======
            line: lineNum,        // 1 or 2; 'done' when finished
            events: events.slice(),
            evIdx: 0,
            charIdx: 0,
            buffer: "",           // what we've revealed for this line
            full: fullText,
            pause: 0              // frames remaining for WAIT
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
        };
    };
 
    TextBox.prototype._tickTypewriter = function () {
<<<<<<< HEAD
        // const rate = TYPE_SPEEDS[this.speed] || TYPE_SPEEDS.MED;
=======
        const rate = TYPE_SPEEDS[this.speed] || TYPE_SPEEDS.MED;
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
        const t = this._typing;
 
        // If paused due to WAIT, count down
        if (t.pause > 0) { t.pause--; return; }
 
        // If we finished all events for this line, advance to next line or finish page
        if (t.evIdx >= t.events.length) {
            // Render full line as done (ensure we show the full text)
            this._applyLineBuffer(t.line, t.full);
 
            if (t.line === 1) {
                // move to line 2 typing
                const pg = this.pages[this.pageIndex];
                this._typing = this._makeTypingState(2, pg.l2.events, pg.l2.text);
<<<<<<< HEAD
=======
                return;
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
            } else {
                // finished line 2 → page idle
                this._typing = null;
 
                // Lock the final, fully-typed page on screen so nothing blanks it out.
                this._renderIdlePage();
 
                // Ready for A (unless AUTO is pending)
                this._readyForAdvance = true;
                this._setCaretVisible(!!this.pages[this.pageIndex].caret);
<<<<<<< HEAD
            }
            return;
        }
 
        const ev = t.events[t.evIdx];
 
        if (ev.type === "cmd") {
            if (ev.name === "WAIT") {
                t.pause = (ev.n != null ? ev.n : DEFAULT_WAIT_FRAMES);
                t.framesUntilNextChar = 0;  // resume immeidately after wait
            } else if (ev.name === "AUTO") {
                // queue auto-advance when page completes
                this._autoPending = true;
                // caret should remain hidden
                this._setCaretVisible(false);
            } else if (ev.name === "TSPD") {
                const spec = (ev.arg === "DEF" ? "DEF" : ev.arg);
                this._applySpeed(spec);
                t.framesUntilNextChar = 0; // speed change applies immediately
            }
            t.evIdx++;
            return;
        }
 
        if (ev.type === "text") {
            // if (this.speed === "FAST") {
            //     // dump the rest of this text chunk
            //     t.buffer += ev.text.slice(t.charIdx);
            //     t.charIdx = ev.text.length;
            // } else {
            //     const remaining = ev.text.length - t.charIdx;
            //     const step = Math.min(rate, remaining);
            //     t.buffer += ev.text.slice(t.charIdx, t.charIdx + step);
            //     t.charIdx += step;
            // }
           
            // // Render partial buffer for this line
            // this._applyLineBuffer(t.line, t.buffer);
 
            if (this._speedFast) {
                t.buffer += ev.text.slice(t.charIdx);
                t.charIdx = ev.text.length;
                this._applyLineBuffer(t.line, t.buffer);
                t.evIdx++; t.charIdx = 0; // next event
                return;
            }
 
            // frames per char cadence
            if (t.framesUntilNextChar > 0) {
                t.framesUntilNextChar--;
                return;
            }
 
            // put out 1 character
            if (t.charIdx < ev.text.length) {
                t.buffer += ev.text.charAt(t.charIdx++);
                this._applyLineBuffer(t.line, t.buffer);
                t.framesUntilNextChar = this._effectiveFramesPerChar();
            }
=======
                return;
            }
        }
 
        const ev = t.events[t.evIdx];
 
        if (ev.type === "cmd") {
            if (ev.name === "WAIT") {
                t.pause = (ev.n != null ? ev.n : DEFAULT_WAIT_FRAMES);
            } else if (ev.name === "AUTO") {
                // queue auto-advance when page completes
                this._autoPending = true;
                // caret should remain hidden
                this._setCaretVisible(false);
            }
            t.evIdx++;
            return;
        }
 
        if (ev.type === "text") {
            if (this.speed === "FAST") {
                // dump the rest of this text chunk
                t.buffer += ev.text.slice(t.charIdx);
                t.charIdx = ev.text.length;
            } else {
                const remaining = ev.text.length - t.charIdx;
                const step = Math.min(rate, remaining);
                t.buffer += ev.text.slice(t.charIdx, t.charIdx + step);
                t.charIdx += step;
            }
 
            // Render partial buffer for this line
            this._applyLineBuffer(t.line, t.buffer);
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
 
            if (t.charIdx >= ev.text.length) {
                // move to next event
                t.evIdx++;
                t.charIdx = 0;
<<<<<<< HEAD
                t.framesUntilNextChar = 0;
=======
>>>>>>> e16cc03c03ae29576b39af5e2a05834095be965f
            }
            return;
        }
 
        // Unknown event: skip
        t.evIdx++;
    };
 
    TextBox.prototype._applyLineBuffer = function (lineNum, textSoFar) {
        const pg = this.pages[this.pageIndex];
        if (lineNum === 1) {
            // row 2 shows L1 buffer, row 4 remains empty (until we move to line 2 typing)
            this._renderLines("", textSoFar, "", "");
        } else {
            // row 2 shows full L1, row 4 shows buffer
            this._renderLines("", pg.l1.text, "", textSoFar);
        }
    };
 
    // ----- Scroll visuals -----
    TextBox.prototype._startScroll = function () {
        const prev = this.pages[this.pageIndex];
        const [_L1, L2, _L3, L4] = splitPageLines(prev.text);
        this._prevL2 = L2 || "";
        this._prevL4 = L4 || "";
 
        this._renderScrollPhase1();
        this._scrollPhase = "SCROLL1";
        this._phaseFrames = SCROLL_STEP_FRAMES;
        this._setCaretVisible(false);
        this._typing = null;            // block typing during scroll
        this._readyForAdvance = false;  // will reset after scroll
    };
 
    // Phase 1: L2→L1, L4→L3, L2 blank, L4 blank
    TextBox.prototype._renderScrollPhase1 = function () {
        const L1 = this._prevL2;
        const L2 = "";
        const L3 = this._prevL4;
        const L4 = "";
        this._renderLines(L1, L2, L3, L4);
    };
 
    // Phase 2: L1 blank, L3→L2, L4 blank
    TextBox.prototype._renderScrollPhase2 = function () {
        const L1 = "";
        const L2 = this._prevL4;
        const L3 = "";
        const L4 = "";
        this._renderLines(L1, L2, L3, L4);
    };
 
    // ----- Rendering helpers -----
    TextBox.prototype._renderCurrentPageInstant = function () {
        const pg = this.pages[this.pageIndex] || { text: "" };
        this.p.textContent = pg.text;
    };
 
    TextBox.prototype._renderLines = function (l1, l2, l3, l4) {
        // Always render exactly 4 lines
        this.p.textContent = (l1 || "") + "\n" + (l2 || "") + "\n" + (l3 || "") + "\n" + (l4 || "");
    };
 
    TextBox.prototype._renderIdlePage = function () {
        // Draw the stable, fully-typed page exactly as it will look while idle.
        const pg = this.pages[this.pageIndex] || { l1:{text:""}, l2:{text:""} };
        this.p.textContent = "\n" + (pg.l1.text || "") + "\n\n" + (pg.l2.text || "");
    };
 
    TextBox.prototype._setCaretVisible = function (on) {
        if (!this.caretEl) return;
        this.caretEl.style.display = on ? "block" : "none";
        this._positionCaret();
    };
 
    // Split "\nL1\n\nL2" → [ "", L1, "", L2 ] normalized to 4 entries
    function splitPageLines(txt) {
        const parts = String(txt).split("\n");
        while (parts.length < 4) parts.push("");
        if (parts.length > 4) parts.length = 4;
        return parts;
    }
 
    // Expose globally
    g.TextBox = TextBox;
 
    // Normalizing the text speeds
    function normalizeSpeedSpec(spec) {
        // Returns { fast:boolean, preset:'SLOW'|'MED'|null, frames:number|null }
        if (spec == null) spec = 'DEF';
 
        // DEFAULT/DEF: EngineSettings
        if (spec === 'DEFAULT' || spec === 'DEF') spec = (g.EngineSettings?.textSpeedDefault ?? 'MED');
 
        if (typeof spec === 'number') {
            return { fast: false, preset: null, frames: Math.max(1, (spec|0)) };
        }
 
        if (typeof spec === 'string') {
            if (spec === 'FAST') return { fast: true, preset: 'FAST', frames: null };
            if (spec === 'SLOW') return { fast: false, preset: 'SLOW', frames: FRAMES_PER_CHAR.SLOW };
            if (spec === 'MED')  return { fast: false, preset: 'MED',  frames: FRAMES_PER_CHAR.MED  };
            // numeric-looking strings allowed
            if (/^[0-9]+$/.test(spec)) return { fast: false, preset: null, frames: Math.max(1, parseInt(spec,10)) };
        }
        // Fallback
        return { fast: false, preset: 'MED', frames: FRAMES_PER_CHAR.MED };
    }
 

})(window);