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
 
    // precompute "x y, x y, x y, x y" bg positions for each square id
    function _precomputeSquareBgPos(map){
        R._squareBgPos = new Array(map.squares.length);
        for (let i = 0; i < map.squares.length; i++){
            const sq = map.squares[i];
            const [tl, tr, bl, br] = sq.tiles;
 
            const [bx0, by0] = _basePosForTileIndex(tl);
            const [bx1, by1] = _basePosForTileIndex(tr);
            const [bx2, by2] = _basePosForTileIndex(bl);
            const [bx3, by3] = _basePosForTileIndex(br);
 
            // quadrant shifts
            const T = R.tileW;
            const p0 = `${bx0}px ${by0}px`;          // TL
            const p1 = `${bx1 + T}px ${by1}px`;      // TR
            const p2 = `${bx2}px ${by2 + T}px`;      // BL
            const p3 = `${bx3 + T}px ${by3 + T}px`;  // BR
 
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
                    el.style.backgroundPosition = R._squareBgPos[sqIndex];
                }
            }
        }
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
        ensureTextBox: ensureTextBox
    };
})(window);