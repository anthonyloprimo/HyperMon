(function (global) {
    const R = {
        root: null, bg: null, sprites: null, ui: null,
        tilesPerRow: 16, tileSize: 16,
        tilesheet: 'tileset.png',
        spritesheet: 'sprites.png',
        _tileEls: [],
        _spriteMap: new Map()
    };
 
    function initRenderer(){
        R.root    = document.getElementById('gameRoot');
        R.bg      = document.getElementById('layer-bg');
        R.sprites = document.getElementById('layer-sprites');
        R.ui      = document.getElementById('layer-ui');
        mountBgGrid(10, 9);
    }
 
    function mountBgGrid(cols, rows){
        R.bg.innerHTML = '';
        R._tileEls.length = 0;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cols * rows; i++){
            const d = document.createElement('div');
            d.className = 'tile';
            d.style.backgroundImage = `url(${R.tilesheet})`;
            frag.appendChild(d);
            R._tileEls.push(d);
        }
        R.bg.appendChild(frag);
    }
 
    function tileBgPos(index){
        const x = -((index % R.tilesPerRow) * R.tileSize);
        const y = -(Math.floor(index / R.tilesPerRow) * R.tileSize);
        return `${x}px ${y}px`;
    }
 
    // viewTiles: length 90 array of metatile indices
    function drawTiles(viewTiles){
        const els = R._tileEls;
        for (let i = 0; i < viewTiles.length; i++){
            const idx = viewTiles[i];
            const el = els[i];
            if (el.dataset.idx != idx){
                el.dataset.idx = idx;
                el.style.backgroundPosition = tileBgPos(idx);
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
        drawTiles: drawTiles,
        addSprite: addSprite,
        updateSprite: updateSprite,
        removeSprite: removeSprite,
        ensureTextBox: ensureTextBox
    };
})(window);