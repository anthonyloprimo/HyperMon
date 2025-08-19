(function (global) {
    function noop(){}
 
    function SceneManager(){
        this.stack = [];
    }
    SceneManager.prototype.top = function(){ return this.stack[this.stack.length - 1] || null; };
    SceneManager.prototype.push = function(s){ (s.onEnter||noop)(); this.stack.push(s); };
    SceneManager.prototype.replace = function(s){
        const cur = this.top(); if (cur && cur.onExit) cur.onExit();
        this.stack = []; (s.onEnter||noop)(); this.stack.push(s);
    };
    SceneManager.prototype.pop = function(){
        const cur = this.stack.pop(); if (cur && cur.onExit) cur.onExit();
    };
    SceneManager.prototype.update = function(dt){ const t=this.top(); if (t && t.update) t.update(dt); };
    SceneManager.prototype.draw   = function(){ const t=this.top(); if (t && t.draw)   t.draw();   };
 
    global.SceneManager = SceneManager;
})(window);