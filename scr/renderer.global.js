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
        spritesheet: 'res/spr/staticSprites.png',  // path/to/file/ from root of 

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

    // New code: per-map square imagery cache (mapId -> { img:[], pos:[] })
    const _MAP_CACHE = new Map();

    // New code: compute square background image/position arrays for a specific map
    function prepareMapCache(map) {
        if (!map || !map.id || !map.tileset || !Array.isArray(map.squares)) return;
        if (_MAP_CACHE.has(map.id)) return;

        const ts = map.tileset;
        const tileW   = ts.tileWidth;
        const tileH   = ts.tileHeight;
        const gapX    = ts.gapX ?? ts.tileWidth;
        const gapY    = ts.gapY ?? ts.tileHeight;
        const pitchX  = ts.pitchX ?? (tileW + gapX);
        const pitchY  = ts.pitchY ?? (tileH + gapY);
        const columns = ts.columns;
        const anims   = ts.animations;

        function basePosForIndex(ti) {
            const col = ti % columns;
            const row = Math.floor(ti / columns);
            const bx = -(col * pitchX);
            const by = -(row * pitchY);
            return [bx, by];
        }
        function posStatic(bx, by, dx, dy) {
            return `${(bx + dx)}px ${(by + dy)}px`;
        }
        function posAnim(key, dx, dy) {
            // frames move horizontally; dx adds quadrant shift; var provides frame offset (negative)
            return `calc(var(--a-${key}-x) + ${dx}px) ${dy}px`;
        }

        const img = new Array(map.squares.length);
        const pos = new Array(map.squares.length);

        for (let i = 0; i < map.squares.length; i++) {
            const sq = map.squares[i];
            const [tl, tr, bl, br] = sq.tiles.map(n => (typeof n === 'number' ? n : parseInt(String(n), 16)));

            const src = [ts.image, ts.image, ts.image, ts.image];

            const [bx0, by0] = basePosForIndex(tl);
            const [bx1, by1] = basePosForIndex(tr);
            const [bx2, by2] = basePosForIndex(bl);
            const [bx3, by3] = basePosForIndex(br);

            let p0 = posStatic(bx0, by0, 0,          0);
            let p1 = posStatic(bx1, by1, tileW,      0);
            let p2 = posStatic(bx2, by2, 0,          tileH);
            let p3 = posStatic(bx3, by3, tileW,      tileH);

            // New code: swap to animation image + CSS var if this tile index is animated in this map
            if (anims && typeof anims.forEach === 'function') {
                const a0 = anims.get && anims.get(tl);
                const a1 = anims.get && anims.get(tr);
                const a2 = anims.get && anims.get(bl);
                const a3 = anims.get && anims.get(br);
                if (a0 && a0.image) { src[0] = a0.image; p0 = posAnim(tl.toString(16).toUpperCase(), 0,          0); }
                if (a1 && a1.image) { src[1] = a1.image; p1 = posAnim(tr.toString(16).toUpperCase(), tileW,     0); }
                if (a2 && a2.image) { src[2] = a2.image; p2 = posAnim(bl.toString(16).toUpperCase(), 0,          tileH); }
                if (a3 && a3.image) { src[3] = a3.image; p3 = posAnim(br.toString(16).toUpperCase(), tileW,     tileH); }
            }

            img[i] = `url(${src[0]}), url(${src[1]}), url(${src[2]}), url(${src[3]})`;
            pos[i] = `${p0}, ${p1}, ${p2}, ${p3}`;
        }

        _MAP_CACHE.set(map.id, { img, pos });
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
        
        // New code: build/cache imagery for the current map
        prepareMapCache(map);

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
            // Point all layers to the new tileset for a clean base
            d.style.backgroundImage = `url(${R.tilesetImage}), url(${R.tilesetImage}), url(${R.tilesetImage}), url(${R.tilesetImage})`;
            // Invalidate cached square id so drawView refreshes this cell on first paint after attach
            delete d.dataset.sq;
            // Reset positions to a benign value until drawView writes per-square positions
            d.style.backgroundPosition = `0px 0px, 0px 0px, 0px 0px, 0px 0px`;
        }

        R._animDefs.clear();
        R._animTick = 0;
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

        const els = R._tileEls;
        const cols = R.viewCols + (R.gutter * 2);
        const rows = R.viewRows + (R.gutter * 2);

        let k = 0;
        for (let gy = 0; gy < rows; gy++) {
            const sy = originY + gy - R.gutter;
            for (let gx = 0; gx < cols; gx++, k++) {
                const sx = originX + gx - R.gutter;

                // New code: resolve owning map for this world tile (sx,sy) relative to current
                let owner = null;
                if (window.World && typeof World.resolveOwner === "function") {
                    owner = World.resolveOwner(sx, sy);
                }

                let cacheMap = map;              // default to current map
                let qx = sx, qy = sy;            // coords to sample in owner's grid
                if (owner && owner.map && owner.map.grid && owner.map.grid.squares) {
                    cacheMap = owner.map;
                    qx = owner.tx;
                    qy = owner.ty;
                }

                // Ensure cache for the chosen map exists
                if (!_MAP_CACHE.has(cacheMap.id)) {
                    prepareMapCache(cacheMap);
                }
                const cache = _MAP_CACHE.get(cacheMap.id);

                const grid = cacheMap.grid.squares;
                let sqIndex;
                if (qx >= 0 && qy >= 0 && qx < grid.width && qy < grid.height) {
                    sqIndex = grid.ids[qy * grid.width + qx];
                    if (sqIndex == null) sqIndex = cacheMap.voidSquare;
                } else {
                    // Outside owning grid: fallback to current map's void square visual
                    sqIndex = map.voidSquare;
                }

                const el = els[k];
                // New key combines map id + square index to avoid false cache hits
                const key = cacheMap.id + ":" + String(sqIndex);

                if (el.dataset.sq !== key) {
                    el.dataset.sq = key;
                    el.style.backgroundImage = cache.img[sqIndex];
                    el.style.backgroundPosition = cache.pos[sqIndex];
                }
            }
        }
    }

    // clear the BG view
    function clearBg(){
        if (!R._tileEls || R._tileEls.length === 0) return;
        for (let i = 0; i < R._tileEls.length; i++){
            const d = R._tileEls[i];
            d.style.backgroundImage = 'none, none, none, none';
            d.style.backgroundPosition = '0px 0px, 0px 0px, 0px 0px, 0px 0px';
            delete d.dataset.sq;
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
        console.debug(`frameIndex: ${frameIndex}`)
        const bx = -((frameIndex % perRow) * fw);
        console.debug(`Index: ${bx}`)
        const by = -(Math.floor(frameIndex / perRow) * fw);
        console.debug(`row: ${by}`)
        el.style.backgroundPosition = `${bx}px ${by}px`;
        console.debug(`BG POS: ${bx}px ${by}px`)
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
        animate: animate,
        clearBg: clearBg,
        prepareMapCache: prepareMapCache
    };
})(window);