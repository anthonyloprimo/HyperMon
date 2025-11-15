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
        SIGN_PALLET(ctx, done) {
            const box = new TextBox();
            box.show(`PALLET TOWN\nShades of your journey await!`);
            done();
        },
        SIGN_OAKSLAB(ctx, done) {
            const box = new TextBox();
            box.show(`OAK POKeMON\nRESEARCH LAB`);
            done();
        },
        PC_BROKEN(ctx, done) {
            const box1 = new TextBox();
            const box2 = new TextBox();
            box2.show(`It isn't working!`)
            box1.show(`PLAYER looked at\nthe screen*DOTS,3:\nThe screen is blue, with some strange white text.`)
            done();
        },
        SNES_TEXT(ctx, done) {
            const box = new TextBox();
            box.show(`PLAYER is\nplaying the SNES!\n...Okay!\nIt's time to go!`)
            done();
        },
        BOOKCASE_TEXT(ctx, done) {
            const box = new TextBox();
            box.show(`Crammed full of POKeMON books!`)
            done();
        },
        TOWNMAP_TEXT(ctx, done) {
            const box1 = new TextBox();
            const box2 = new TextBox();
            box2.show(`(TODO: Show\n TOWN MAP screen.)`)
            box1.show(`A TOWN MAP.`)
            done();
        },
        TV_TEXT(ctx, done) {
            const box1 = new TextBox();
            const box2 = new TextBox();
            box2.show(`I better go too.`)
            box1.show(`There's a movie\non TV. Four boys are walking on railroad tracks.`)
            done();
        },
        POSTERL_TEXT(ctx, done) {
            const box = new TextBox();
            box.show(`Push START to open the MENU!`)
            done();
        },
        POSTERR_TEXT(ctx, done) {
            const box = new TextBox();
            box.show(`All POKeMON types have strong and weak points against others.`)
            done();
        },
        PC_OAK(ctx, done) {
            const box1 = new TextBox();
            const box2 = new TextBox();
            const box3 = new TextBox();
            const box4 = new TextBox();
            const box5 = new TextBox();
            const box6 = new TextBox();
            const box7 = new TextBox();
            box7.show(`PS: PROF.OAK, please visit us!\n...`)
            box6.show(`POKeMON LEAGUE HQ INDIGO PLATEAU`)
            box5.show(`Bring your best POKeMON and see how you rate as a trainer!`)
            box4.show(`The elite trainers of POKeMON LEAGUE are ready to take om all comers!`)
            box3.show(`Calling all POKeMON trainers!`)
            box2.show(`...`)
            box1.show(`There's an e-mail message here!`)
            done();
        },

        SIGN_ROUTE1(ctx, done) {
            const box = new TextBox();
            box.show(`ROUTE 1\nPALLET TOWN - VIRIDIAN CITY`);
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