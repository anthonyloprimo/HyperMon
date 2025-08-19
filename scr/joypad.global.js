(function (global) {
    class Joypad {
        // Logical buttons in GB order-ish
        static BTN = ['right','left','up','down','a','b','select','start'];
       
        constructor({
            repeatDelayFrames = 12,   // ~200ms at 60Hz (tweak per taste)
            repeatRateFrames  = 3,    // repeat every 3 frames after delay
            blockOpposites    = true, // SOCD: never allow Up+Down or Left+Right
            preventDefaults   = true  // stop arrow keys from scrolling
        } = {}) {
            this._held    = new Set();
            this._pressed = new Set();   // rises on the frame the key goes down
            this._released= new Set();   // rises on the frame the key goes up
            this._edgePressed = new Set();
            this._edgeReleased = new Set();
            this._repeat  = new Set();   // auto-repeat fire for menus
            this._age     = new Map();   // frames held per button
            this._cfg = { repeatDelayFrames, repeatRateFrames, blockOpposites };
       
            this._keymap = {
            // arrows = dpad
            'ArrowUp':'up', 'ArrowDown':'down', 'ArrowLeft':'left', 'ArrowRight':'right',
            // Z/X for A/B (classic emulator mapping)
            'KeyZ':'a', 'KeyX':'b',
            // Enter/Shift for Start/Select
            'Enter':'start', 'ShiftLeft':'select', 'ShiftRight':'select',
            // Extras if you like: Space as A
            'Space':'a',
            };
       
            // Keyboard listeners
            addEventListener('keydown', e => {
            const btn = this._keymap[e.code];
            if (!btn) return;
            if (preventDefaults) e.preventDefault();
            // pressed edge
            if (!this._held.has(btn)) {
                this._held.add(btn);
                this._age.set(btn, 0);
                this._edgePressed.add(btn);
            }
            }, { passive:false });
       
            addEventListener('keyup', e => {
            const btn = this._keymap[e.code];
            if (!btn) return;
            if (preventDefaults) e.preventDefault();
            if (this._held.has(btn)) {
                this._held.delete(btn);
                this._age.delete(btn);
                this._edgeReleased.add(btn);
            }
            }, { passive:false });
       
            // Safety: clear all on blur so nothing gets "stuck"
            addEventListener('blur', () => this._hardClear());
        }
       
        // Call once per frame (before your scene update)
        poll() {
            this._pressed = this._edgePressed;
            this._released = this._edgeReleased;
 
            this._edgePressed = new Set();
            this._edgeReleased = new Set();
 
            this._repeat.clear();
       
            // SOCD (Simultaneous Opposite Cardinal Directions)
            if (this._cfg.blockOpposites) {
                if (this._held.has('up') && this._held.has('down')) {
                    this._held.delete('up'); this._held.delete('down');
                    this._age.delete('up');  this._age.delete('down');
                }
                if (this._held.has('left') && this._held.has('right')) {
                    this._held.delete('left'); this._held.delete('right');
                    this._age.delete('left');  this._age.delete('right');
                }
            }
       
            // Advance “ages” and compute repeat events
            for (const btn of this._held) {
                const age = (this._age.get(btn) ?? 0) + 1;
                this._age.set(btn, age);
                const { repeatDelayFrames: d, repeatRateFrames: r } = this._cfg;
                // if (age === 1) continue; // edge handled via _pressed when keydown happened
                if (age >= d && ((age - d) % r) === 0) this._repeat.add(btn);
            }
        }
       
        // Query helpers
        held(btn)     { return this._held.has(btn); }
        pressed(btn)  { return this._pressed.has(btn); }   // edge this frame
        released(btn) { return this._released.has(btn); }  // edge this frame
        repeat(btn)   { return this._repeat.has(btn); }    // auto-repeat pulse
        anyPressed()  { return this._pressed.size > 0; }
       
        // P1-like 8‑bit snapshot (bit=0 means pressed, like GB)
        snapshotP1() {
            // Order: Right Left Up Down A B Select Start (matches Joypad.BTN)
            let v = 0xFF;
            Joypad.BTN.forEach((name, i) => {
            if (this._held.has(name)) v &= ~(1 << i);
            });
            return v & 0xFF;
        }
       
        _hardClear() {
            this._held.clear(); this._pressed.clear(); this._released.clear();
            this._repeat.clear(); this._age.clear();
        }
    }
 
    // exposed globally
    global.Joypad = Joypad;
})(window);