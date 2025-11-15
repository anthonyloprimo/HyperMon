/* 
    SCRIPTS
    Scripts are... javascript functions, primarily.  That's it.  It's a semantic thing.  Scripts are small functions intended for events and actions in-game.
    
*/
(function(g) {
    // The SCRIPT_MANIFEST contains all of the scripts (functions) that do things.
    // When called via *PAUSE,SCRIPTNAME: it looks up the relevant script and executes it.
    // These MUST have a callback via done() or return a Promise that resolves when done.
    const SCRIPT_MANIFEST = {
        SAVEGAME(ctx, done) {
            // do save work...
            setTimeout(() => {
                console.log("Saved.");
                done();
            }, 300); // example async
        },

        FOLLOW(ctx, who, done) {
            console.log("Following:", who);
            // ...play a little cutscene, move the player, etc...
            // when complete:
            done();
            // OR return a Promise:
            // return playFollowCutscene(who);
        },

        PKMNSCREEN(ctx, done) {
            // open a menu, etc...
            // if it returns a Promise, you can skip done();
            done();
        },

        TEST(ctx, done) {
            const testBox = new TextBox({
                top: 48,
                left: 24,
                width: 104,
                height: 16
            });

            testBox.show(`*DOTS,13:*AUTO:`);
            done();
        },

        SIGN_PLAYERHOUSE(ctx, done) {
            const box = new TextBox();
            box.show("PLAYER's house");
            done();
        },

        SIGN_RIVALHOUSE(ctx, done) {
            const box = new TextBox();
            box.show("RIVAL's house");
            done();
        },

        SIGN_OAKSLAB(ctx, done) {
            const box = new TextBox();
            box.show(`OAK POKeMON\nRESEARCH LAB`);
            done();
        },

        SIGN_PALLET(ctx, done) {
            const box = new TextBox();
            box.show(`PALLET TOWN\nShades of your journey await!`);
            done();
        },
    };

    // The run() function acts as a liaison: run a script by id with args, support callback or Promises
    function run(id, args, ctx, resume) {
        const fn = SCRIPT_MANIFEST[id];
        if (!fn) {
            console.warn(`[Script] Unknown id: ${id}`);
            resume(); // don't freeze the textbox
            return;
        }

        let resumed = false;
        const safeResume = () => {
            if (resumed) return;
            resumed = true;
            resume();
        };

        try {
            const maybePromise = fn(ctx, ...(args || []), safeResume);
            if (maybePromise && typeof maybePromise.then === "function") {
                maybePromise.then(safeResume, safeResume);
            }
        } catch (e) {
            console.error(e);
            safeResume();
        }
    }

    g.Script = {
        run,
        manifest: SCRIPT_MANIFEST
    };
})(window);