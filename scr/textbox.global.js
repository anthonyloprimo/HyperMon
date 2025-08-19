(function (g) {
    "use strict";
 
    const SCREEN_W = 160;
    const SCREEN_H = 144;
    const DEFAULT_MARGIN = 8;
    const SCROLL_STEP_FRAMES = 8; // TODO: Verify against pokered disassembly to determine exact amount of frames to scroll text.
 
    // --- Tokenizer ---------------------------------------------------------
    // Produces tokens: WORD(text), SP(count), NL, CMD({name, n?})  (CMD parsed)
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
                if (cmd) {
                    tokens.push({ t: "CMD", name: cmd.name, n: cmd.n });
                    i = cmd.nextIndex;
                    continue;
                }
                // No valid command → treat '*' as a normal char and fall through to word capture
            }
 
            // Spaces (preserve multiple)
            if (ch === " ") {
                let n = 1; i++;
                while (i < s.length && s[i] === " ") { n++; i++; }
                pushSpaces(n); continue;
            }
 
            // WORD: run of non-space, non-newline, not command-start
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
    // *WAIT:         (no number, default frames)
    // *WAIT,NN:      (number)
    // *AUTO:
    // Must be UPPERCASE and end with ':' immediately, otherwise it's treated as text!
    function tryParseCommand(s, startIdx) {
        // starts with '*'
        let i = startIdx + 1;
        // read until colon or end
        const colon = s.indexOf(":", i);
        if (colon === -1) return null;
        const body = s.slice(i, colon); // e.g., "WAIT" or "WAIT,40" or "AUTO"
 
        // Validate uppercase
        if (!/^[A-Z][A-Z0-9,]*$/.test(body)) return null;
 
        // WAIT,NN?
        if (body === "WAIT") {
            return { name: "WAIT", n: null, nextIndex: colon + 1 };
        }
        if (body.startsWith("WAIT,")) {
            const nStr = body.slice(5);
            if (!/^[0-9]+$/.test(nStr)) return null;
            return { name: "WAIT", n: parseInt(nStr, 10), nextIndex: colon + 1 };
        }
        if (body === "AUTO") {
            return { name: "AUTO", n: null, nextIndex: colon + 1 };
        }
        return null;
    }
 
    // --- Layout ------------------------------------------------------------
    // Dialog mode: 2 usable lines per page, row2 then row4.
    // Line1 width = 18. Line2 width = 17 if another page remains, else 18.
    // Trims trailing spaces at EOL; preserves interior spaces; respects forced NL.
function layoutPagesDialog(src) {
    const toks = tokenize(src);
 
    // Strip CMDs from the layout stream (we’ll use them in Step 3)
    const stream = [];
    for (let k = 0; k < toks.length; k++) {
        const t = toks[k];
        if (t.t !== "CMD") stream.push(cloneTok(t));
    }
 
    const pages = [];
    let cursor = 0;
    let haveTop = false;
    let topLine = ""; // becomes the next page’s top (previous bottom)
 
    function contentLeft(arr, idx) {
        for (let m = idx; m < arr.length; m++) {
            const t = arr[m];
            if (t.t === "WORD") return true;
            if (t.t === "NL")   return true;
            if (t.t === "SP" && t.n > 0) return true;
        }
        return false;
    }
 
    if (!contentLeft(stream, 0)) {
        return [{ text: "\n\n\n", caret: false, cmds: [] }]; // empty
    }
 
    while (true) {
        let line1, line2;
 
        // Determine the top line of this window
        if (!haveTop) {
            // First window: consume the first line at width 18
            const r1 = takeLine(stream, cursor, 18);
            line1 = rtrim(r1.text);
            cursor = r1.next;
            haveTop = true;
        } else {
            // Subsequent windows reuse previous bottom as the new top
            line1 = topLine;
        }
 
        // If there’s no more content, the final window has a blank bottom
        if (!contentLeft(stream, cursor)) {
            line2 = "";
            // No caret since nothing follows
            const pageText = "\n" + line1 + "\n\n" + line2;
            pages.push({ text: pageText, caret: false, cmds: [] });
            break;
        }
 
        // Decide if a caret would be needed AFTER this bottom line:
        // Peek with width 17; if anything remains, caret is needed.
        const peek = deepSlice(stream, cursor);
        const try17 = takeLine(peek, 0, 17);
        const caretNeeded = contentLeft(peek, try17.next);
 
        // Consume the actual bottom line with chosen width
        const widthL2 = caretNeeded ? 17 : 18;
        const r2 = takeLine(stream, cursor, widthL2);
        line2 = rtrim(r2.text);
        cursor = r2.next;
 
        // Emit window [line1, line2]
        const pageText = "\n" + line1 + "\n\n" + line2;
        pages.push({ text: pageText, caret: caretNeeded, cmds: [] });
 
        // Prepare next window: the new top is our just-shown bottom
        topLine = line2;
 
        // If no more content remains, we stop; otherwise we loop to build the next overlapping window.
        if (!contentLeft(stream, cursor)) break;
    }
 
    return pages;
}
 
    // Consume one visual line up to maxWidth from stream starting at idx.
    // Returns { text, next }
    function takeLine(stream, idx, maxWidth) {
        let width = 0;
        let out = "";
        let i = idx;
 
        // Skip leading spaces
        while (i < stream.length && stream[i].t === "SP") i++;
 
        while (i < stream.length) {
            const t = stream[i];
 
            if (t.t === "NL") {
                i++; // consume forced break
                break;
            }
 
            if (t.t === "WORD") {
                const w = t.text;
                const wlen = w.length;
                const rem = maxWidth - width;
 
                if (wlen <= rem) {
                    // fits on this line
                    out += w;
                    width += wlen;
                    i++;
                    continue;
                }
 
                if (wlen > maxWidth) {
                    // word longer than an entire line → hard-break ONLY if we're at column 0
                    if (width === 0) {
                        out += w.slice(0, maxWidth);
                        stream[i] = { t: "WORD", text: w.slice(maxWidth) }; // leave remainder
                        width = maxWidth;
                    }
                    // if width > 0, defer to next line without consuming
                    break;
                }
 
                // wlen > rem but wlen <= maxWidth → push whole word to next line (don’t consume)
                break;
            }
 
            if (t.t === "SP") {
                if (width === 0) { i++; continue; } // no leading spaces
                const rem = maxWidth - width;
                if (rem <= 0) break;
 
                const toAdd = Math.min(t.n, rem);
                out += " ".repeat(toAdd);
                width += toAdd;
 
                if (toAdd === t.n) { i++; } else { stream[i] = { t: "SP", n: t.n - toAdd }; }
                if (width >= maxWidth) break;
                continue;
            }
 
            // Unknown token: skip
            i++;
        }
 
        return { text: out, next: i };
    }
 

    function rtrim(s) { return s.replace(/[ ]+$/g, ""); }
    function cloneTok(t) { return (t.t === "WORD") ? { t: "WORD", text: t.text } : (t.t === "SP" ? { t: "SP", n: t.n } : { t: t.t }); }
    function deepSlice(arr, start) { const out = []; for (let i = start; i < arr.length; i++) out.push(cloneTok(arr[i])); return out; }
 
    // ---------- TextBox ----------
    function TextBox(options) {
        options = options || {};
 
        // Parent is the UI layer so coords are in 160x144 space
        this.container = options.container || document.getElementById("layer-ui") || document.body;
 
        // Geometry defaults
        const m = (options.margin != null) ? options.margin : DEFAULT_MARGIN;
        const h = (options.height != null) ? options.height : 32;
        const w = (options.width  != null) ? options.width  : (SCREEN_W - m * 2);
        const left = (options.left != null) ? options.left : 0;
        const top  = (options.top  != null) ? options.top  : (SCREEN_H - (h + m * 2));
 
        // Create the box (visuals defined in CSS)
        const el = document.createElement("div");
        el.className = "msgBox";
        el.style.display = "none";
        el.style.width  = w + "px";
        el.style.height = h + "px";
        el.style.left   = left + "px";
        el.style.top    = top + "px";
 
        const p = document.createElement("p");
        el.appendChild(p);
 
        // Caret glyph (blink)
        const caret = document.createElement("div");
        caret.textContent = "▼"; // caret symbol
        caret.style.position = "absolute";
        caret.style.width = "8px";
        caret.style.height = "8px";
        caret.style.fontFamily = "pkmnFont, monospace";
        caret.style.fontSize = "8px";
        caret.style.lineHeight = "8px";
        caret.style.letterSpacing = "0";
        caret.style.animation = "blink 600ms steps(1) infinite";
        caret.style.display = "none"; // only when a next page exists
        el.appendChild(caret);
 
        this.container.appendChild(el);
 
        // Public references
        this.el = el;
        this.p  = p;
        this.caretEl = caret;
 
        // State
        this.visible = false;
        this.pages = [];
        this.pageIndex = 0;
 
        // Scroll animation state
        this._scrollPhase = "PAGE"; // "PAGE" | "SCROLL1" | "SCROLL2"
        this._phaseFrames = 0;      // countdown in frames
        this._prevL2 = "";          // remember previous page lines for scroll
        this._prevL4 = "";
 
        // Position caret
        this._positionCaret();
    }
 
    TextBox.prototype._positionCaret = function () {
        // bottom-right character cell (8x8)
        if (!this.el) return;
        const w = this.el.clientWidth || parseInt(this.el.style.width, 10) || 0;
        const h = this.el.clientHeight || parseInt(this.el.style.height, 10) || 0;
        this.caretEl.style.left = (w - 8) + "px";
        this.caretEl.style.top  = (h - 8) + "px";
    };
 
    // ----- Public API -----
    TextBox.prototype.show = function (text, opts) {  // text = source string, opts = coords/size
        opts = opts || {};
        this.pages = layoutPagesDialog(text);
        this.pageIndex = 0;
        this.visible = true;
        this._scrollPhase = "PAGE";
        this._phaseFrames = 0;
        this.el.style.display = "inline-block";
        this._renderCurrentPageInstant();
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
    };
 
    // Step 2: update runs the two-step scroll when active.
    TextBox.prototype.update = function () {
        if (!this.visible) return;
 
        if (this._scrollPhase === "SCROLL1") {
            if (this._phaseFrames > 0) { this._phaseFrames--; return; }
            // move to phase 2
            this._renderScrollPhase2();
            this._scrollPhase = "SCROLL2";
            this._phaseFrames = SCROLL_STEP_FRAMES;
            return;
        }
 
        if (this._scrollPhase === "SCROLL2") {
            if (this._phaseFrames > 0) { this._phaseFrames--; return; }
            // finish scroll → show next page instantly
            this.pageIndex++;
            this._scrollPhase = "PAGE";
            this._renderCurrentPageInstant();
            return;
        }
 
        // "PAGE": idle; nothing to do (waiting for A)
    };
 
    TextBox.prototype.advance = function () {
        if (!this.visible || this._scrollPhase !== "PAGE") return;
 
        // more pages? start two-step scroll
        if (this.pageIndex + 1 < this.pages.length) {
            // capture previous L2/L4
            const prev = this.pages[this.pageIndex];
            const [L1, L2, L3, L4] = splitPageLines(prev.text);
            this._prevL2 = L2 || "";
            this._prevL4 = L4 || "";
 
            // phase 1 frame
            this._renderScrollPhase1();
            this._scrollPhase = "SCROLL1";
            this._phaseFrames = SCROLL_STEP_FRAMES;
 
            // hide caret during scroll
            this._setCaretVisible(false);
            return;
        }
 
        // final page - close (destroy: false if just hiding but we ususally don't want that...)
        this.hide({ destroy: true });
    };
 
    // ----- Rendering helpers -----
    TextBox.prototype._renderCurrentPageInstant = function () {
        const pg = this.pages[this.pageIndex] || { text: "", caret: false };
        this.p.textContent = pg.text;
        this._setCaretVisible(!!pg.caret);
    };
 
    // Phase 1 (one frame):
    // L2 → L1, L4 → L3, L2 blank, L4 blank
    TextBox.prototype._renderScrollPhase1 = function () {
        const L1 = this._prevL2;
        const L2 = ""; // blank
        const L3 = this._prevL4;
        const L4 = ""; // blank
        this.p.textContent = L1 + "\n" + L2 + "\n" + L3 + "\n" + L4;
    };
 
    // Phase 2 (one frame):
    // L1 blank, L3 → L2, L4 blank
    TextBox.prototype._renderScrollPhase2 = function () {
        const L1 = "";
        const L2 = this._prevL4;
        const L3 = "";
        const L4 = "";
        this.p.textContent = L1 + "\n" + L2 + "\n" + L3 + "\n" + L4;
    };
 
    // check if we're able to advance the text (preventing "A" from being accepted while text is scrolling/printing)
    TextBox.prototype.canAdvance = function () {
        return this.visible && this._scrollPhase === "PAGE";
    };
 

    TextBox.prototype._setCaretVisible = function (on) {
        if (!this.caretEl) return;
        this.caretEl.style.display = on ? "block" : "none";
        this._positionCaret();
    };
 
    // Split page text ("\nL1\n\nL2") into exactly 4 lines.
    function splitPageLines(txt) {
        const parts = String(txt).split("\n");
        // We expect 4 lines: [ "", L1, "", L2 ]
        // Normalize to 4 entries
        while (parts.length < 4) parts.push("");
        if (parts.length > 4) parts.length = 4;
        return parts;
    }
 
    // Expose globally
    g.TextBox = TextBox;
 
})(window);