// focusManager.global.js
(function(g){
    class FocusManager {
        constructor() {
            this.stack = [];          // top of stack = current focus
            this._z = 100;            // base z for layered UI (can tune)
        }
 
        push(owner) {
            if (!owner) return;
            // ensure owner is unique and ends up on top
            const i = this.stack.indexOf(owner);
            if (i >= 0) this.stack.splice(i, 1);
            this.stack.push(owner);
            this._bringToFront(owner);
        }
 
        bringToFront(owner) {
            if (!owner) return;
            this._bringToFront(owner);
            // move to top of stack too
            const i = this.stack.indexOf(owner);
            if (i >= 0) {
                this.stack.splice(i, 1);
                this.stack.push(owner);
            }
        }
 
        _bringToFront(owner) {
            // Visual: raise z-index and move to end of container to normalize stacking
            if (owner.el) {
                owner.el.style.zIndex = String(this._z++);
                if (owner.el.parentNode) {
                    owner.el.parentNode.appendChild(owner.el);
                }
            }
        }
 
        pop(owner) {
            if (!owner) {
                this.stack.pop();
                return;
            }
            const i = this.stack.indexOf(owner);
            if (i >= 0) this.stack.splice(i, 1);
        }
 
        current() {
            return this.stack[this.stack.length - 1] || null;
        }
 
        update({jp, dt}) {
            // consider A or B held if either is pressed/repeating this frame...
            const speedHeld = (jp.pressed('a') || jp.held('a') || jp.pressed('b') || jp.held('b'));
 
            for (let i=0; i < this.stack.length; i++) {
                const owner = this.stack[i];
                if (owner && typeof owner.update === "function") {
                    owner.update( {jp, dt, speedHeld} );
                }
            }
        }
 
        // Route input only to the focus owner
        handleInput(input) {
            const cur = this.current();
            if (cur && typeof cur.handleInput === "function") {
                cur.handleInput(input);
            }
        }
    }
 
    g.FocusManager = new FocusManager();
})(window);