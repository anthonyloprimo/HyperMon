// camera system
(function(g){
    const TILE = 16;
    const GUTTER = 1;

    const Camera = {
        target: null,
        // "center" is 64x64 px in from the top and left - player is actually centered vertically, but is on the left side of the center line horizontally.
        cx: 64, cy: 64,
        setTarget(actor){ this.target = actor; },
        update(){
            if(!this.target) return;

            const tx = this.target.x;
            const ty = this.target.y;  // const ty = this.target.y + (this.target.voff ?? -4);

            viewLeft = tx - this.cx;
            viewTop  = ty - this.cy;

            const ox = Math.floor(viewLeft / TILE);
            const oy = Math.floor(viewTop  / TILE);
            
            if (ox !== this._ox || oy !== this._oy) {
                this._ox = ox; this._oy = oy;
                Renderer.drawView(ox, oy);
            }

            // const camX = Math.round(this.cx - tx);
            // const camY = Math.round(this.cy - ty);
            // document.documentElement.style.setProperty('--camX', camX + 'px');
            // document.documentElement.style.setProperty('--camY', camY + 'px');
            const wrap = (n) => ((n % TILE) + TILE) % TILE;
            const subX = -wrap(viewLeft) - GUTTER * TILE;
            const subY = -wrap(viewTop)  - GUTTER * TILE;
            document.documentElement.style.setProperty('--camX', subX + 'px');
            document.documentElement.style.setProperty('--camY', subY + 'px');
        }
    };
    g.Camera = Camera;
})(window);