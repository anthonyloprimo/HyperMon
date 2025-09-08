(function (global) {
    const R = {
        root: null, bg: null, sprites: null, ui: null,
 
        // tileset info from MapLoader.attachMap
        tilesetImage: 'tileset.png',  // overwritten when a map is attached.
        tileW: 8,
        tileH: 8,
        gapX: 8,
        gapY: 8,
        pitchX: 16,
        pitchY: 16,
        columns: 16,
 
        // Grid info
        viewCols: 10,  // 10 tiles visible horizontally
        viewRows: 9,   // 9 tiles visible vertically
        gutter: 1,     // 1 tile gutter (or padding) around the entire screen
                       // The above makes a grand total of 12 columns (10 + 2 gutters), 11 (9 + 2 gutters) rows, a total of 132 tiles
        
        // sprite sheet info
        tilesPerRow: 16,
        tileSize: 16,
        tileSheet: 'tileset.png',
        spritesheet: 'sprites.png',
 
        // runtime buffers
        _tileEls: [],
        _spriteMap: new Map(),
 
        // animations
        _animDefs: new Map(),
        _squareBgImg: [],
        _animTick: 0,

        // Map & precomputed square backgrounds
        _map: null,
        _squareBgPos: []  // index - "x y, x y, x y, x y"
    };
 
    function initRenderer(){
        R.root    = document.getElementById('gameRoot');
        R.bg      = document.getElementById('layer-bg');
        R.sprites = document.getElementById('layer-sprites');
        R.ui      = document.getElementById('layer-ui');
 
        // mount fixed grid
        const cols = R.viewCols + (R.gutter * 2);
        const rows = R.viewRows + (R.gutter * 2);
        mountBgGrid(cols, rows);
    }
 
    function mountBgGrid(cols, rows){
        R.bg.innerHTML = '';
        R._tileEls.length = 0;
 
        // fit grid template to new size
        R.bg.style.display = 'grid';
        R.bg.style.gridTemplateColumns = `repeat(${cols}, 16px)`;
        R.bg.style.gridTemplateRows    = `repeat(${rows}, 16px)`;
 
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cols * rows; i++){
            const d = document.createElement('div');
            d.className = 'tile';
 
            // four layers - positions will be set per-square during draw
            const img = R.tilesetImage;
            d.style.backgroundImage = `url(${img}), url(${img}), url(${img}), url(${img})`;
            d.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat, no-repeat';
            frag.appendChild(d);
            R._tileEls.push(d);
        }
        R.bg.appendChild(frag);
    }
 
    // compute base (top-left) bg offset for a tile index on a padded atlas
    function _basePosForTileIndex(ti) {
        // ti is numeric, columns is padded-atlas columns
        console.log(ti);
        const col = ti % R.columns;
        const row = Math.floor(ti / R.columns);
        const baseX = -(col * R.pitchX);
        const baseY = -(row * R.pitchY);
        return [baseX, baseY];
    }
 
    // precompute "x y, x y, x y, x y" bg positions for each square id from background-image and background-position
    function _precomputeSquareBgPos(map){
        const squares = map.squares;
        R._squareBgPos = new Array(squares.length);
        R._squareBgImg = new Array(squares.length);

        const T = R.tileW;

        function posStatic(bx, by, dx, dy){
            return `${(bx + dx)}px ${(by + dy)}px`;
        }
        function posAnim(key, dx, dy){
            // frames move horizontally; dx adds quadrant shift; var provides frame offset (negative)
            return `calc(var(--a-${key}-x) + ${dx}px) ${dy}px`;
        }

        for (let i = 0; i < squares.length; i++){
            const sq = squares[i];
            const [tl, tr, bl, br] = sq.tiles;

            // per-layer source image (tileset by default)
            const src = [R.tilesetImage, R.tilesetImage, R.tilesetImage, R.tilesetImage];

            // base XY from static tileset (only used for static corners)
            const [bx0, by0] = _basePosForTileIndex(tl);
            const [bx1, by1] = _basePosForTileIndex(tr);
            const [bx2, by2] = _basePosForTileIndex(bl);
            const [bx3, by3] = _basePosForTileIndex(br);

            // decide per-layer if animated
            const a0 = R._animDefs.get(tl);
            const a1 = R._animDefs.get(tr);
            const a2 = R._animDefs.get(bl);
            const a3 = R._animDefs.get(br);

            // swap image sources for animated layers
            if (a0) src[0] = a0.image;
            if (a1) src[1] = a1.image;
            if (a2) src[2] = a2.image;
            if (a3) src[3] = a3.image;

            // build per-layer positions
            const p0 = a0 ? posAnim(a0.key, 0,   0  ) : posStatic(bx0, by0, 0,   0  );   // TL
            const p1 = a1 ? posAnim(a1.key, T,   0  ) : posStatic(bx1, by1, T,   0  );   // TR (+T x)
            const p2 = a2 ? posAnim(a2.key, 0,   T  ) : posStatic(bx2, by2, 0,   T  );   // BL (+T y)
            const p3 = a3 ? posAnim(a3.key, T,   T  ) : posStatic(bx3, by3, T,   T  );   // BR (+T x,y)

            R._squareBgImg[i] = `url(${src[0]}), url(${src[1]}), url(${src[2]}), url(${src[3]})`;
            R._squareBgPos[i] = `${p0}, ${p1}, ${p2}, ${p3}`;
        }
    }
 
    function attachMap(map){
        R._map = map;
        
        // tileset knobs
        const ts = map.tileset;
        R.tilesetImage = ts.image;
        R.tileW = ts.tileWidth;
        R.tileH = ts.tileHeight;
        R.gapX = ts.gapX ?? ts.tileWidth;
        R.gapY = ts.gapY ?? ts.tileHeight;
        R.pitchX = ts.pitchX ?? (R.tileW + R.gapX);
        R.pitchY = ts.pitchY ?? (R.tileH + R.gapY);
        R.columns = ts.columns;
 
        // ensure grid elements point to correct atlas
        for (let i = 0; i < R._tileEls.length; i++){
            const d = R._tileEls[i];
            d.style.backgroundImage = `url(${R.tilesetImage}), url(${R.tilesetImage}), url(${R.tilesetImage}), url(${R.tilesetImage})`;
        }

        R._animDefs.clear();
        if (ts.animations && typeof ts.animations.forEach === 'function') {
            ts.animations.forEach((def, tiNum) => {
                const key = tiNum.toString(16).toUpperCase();
                const total = def.totalFrames || 1;
                // default framrate of animations
                const period = def.periodFrames || 20;
                const frameW = def.frameWidth || R.tileW;
                const strideX = frameW + R.gapX;
                R._animDefs.set(tiNum, {
                    key, image: def.image, total, period, strideX
                });
                // use one variable for each animated tile id
                R.bg.style.setProperty(`--a-${key}-x`, `0px`);
            })
        }
 
        // precompute per-square bg position
        _precomputeSquareBgPos(map);
    }
 
    // function tileBgPos(index){
    //     const x = -((index % R.tilesPerRow) * R.tileSize);
    //     const y = -(Math.floor(index / R.tilesPerRow) * R.tileSize);
    //     return `${x}px ${y}px`;
    // }
 
    // draw visible grid from world-square origin (top-left) w/ gutter baked in
    function drawView(originX, originY) {
        const map = R._map;
        if (!map) return;
 
        const grid = map.grid.squares;
        const mw = grid.width;
        const mh = grid.height;
        const els = R._tileEls;
 
        const cols = R.viewCols + (R.gutter * 2);
        const rows = R.viewRows + (R.gutter * 2);
 
        let k = 0;
        for (let gy = 0; gy < rows; gy++) {
            const sy = originY + gy - R.gutter;
            for (let gx = 0; gx < cols; gx++, k++) {
                const sx = originX + gx - R.gutter;
 
                // clamp/fallback to void when outside of the map
                let sqIndex;
                if (sx >= 0 && sy >= 0 && sx < mw && sy < mh) {
                    sqIndex = grid.ids[sy * mw + sx];
                } else {
                    sqIndex = map.voidSquare;
                }
 
                const el = els[k];
                // avoid redundant style writes...
                if (el.dataset.sq != sqIndex) {
                    el.dataset.sq = sqIndex;
                    el.style.backgroundImage = R._squareBgImg[sqIndex];
                    el.style.backgroundPosition = R._squareBgPos[sqIndex];
                }
            }
        }
    }

    // animations
    function animate() {
        if (!R._animDefs || R._animDefs.size === 0) return;
        R._animTick++;
        R._animDefs.forEach(def => {
            const frame = Math.floor(R._animTick / def.period) % def.total;
            const x = -(frame * def.strideX);
            R.bg.style.setProperty(`--a-${def.key}-x`, `${x}px`);
        });
    }
 
    // Sprites
    function addSprite(id, frameIndex, x, y){
        let el = R._spriteMap.get(id);
        if (!el){
            el = document.createElement('div');
            el.className = 'sprite';
            el.style.backgroundImage = `url(${R.spritesheet})`;
            R._spriteMap.set(id, el);
            R.sprites.appendChild(el);
        }
        setSprite(el, frameIndex, x, y);
        return el;
    }
    function setSprite(el, frameIndex, x, y){
        el.style.transform = `translate(${x}px, ${y}px)`;
        const fw = R.tileSize, perRow = R.tilesPerRow;
        const bx = -((frameIndex % perRow) * fw);
        const by = -(Math.floor(frameIndex / perRow) * fw);
        el.style.backgroundPosition = `${bx}px ${by}px`;
        el.style.zIndex = String(100 + Math.floor(y / 16));
    }
    function updateSprite(id, frameIndex, x, y){
        const el = R._spriteMap.get(id);
        if (el) setSprite(el, frameIndex, x, y);
    }
    function removeSprite(id){
        const el = R._spriteMap.get(id);
        if (el){ el.remove(); R._spriteMap.delete(id); }
    }
 
    // TextBox (mounted in UI layer)
    function ensureTextBox(){
        let box = R.ui.querySelector('.ui-box');
        if (!box){
            box = document.createElement('div');
            box.className = 'ui-box';
            box.innerHTML = '<div class="ui-text"></div><div class="ui-caret">▼</div>';
            R.ui.appendChild(box);
        }
        return box;
    }
 
    global.Renderer = {
        init: initRenderer,
        attachMap: attachMap,
        drawView: drawView,
        addSprite: addSprite,
        updateSprite: updateSprite,
        removeSprite: removeSprite,
        ensureTextBox: ensureTextBox,
        animate: animate
    };
})(window);