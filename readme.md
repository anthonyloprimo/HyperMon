# HyperMon
Pokemon Gen 1-inspired (Red, Blue, Yellow) engine re-creation using HTML, CSS, and JavaScript.  May slowly incorporate features from newer titles (Gen 2, Gen 3, etc...)

This is a challenge to see if I can do everything using HTML, CSS, and JavaScript, and I've no promises on the amount of completion this engine will be.

Oh, because I hate myself a lot, I'm challenging myself to see if I can't make it all work within the DOM.  Like, no `<canvas>`.  Just the DOM.



I'm not insane.  *You're* insane.


## Features:
1. Text system that behaves as close to the original system as possible (`TextBox.show();`)
    - The system is smarter though - auto detects and inserts new lines where and when appropriate
        - Gen 1 and 2 textboxes have 18 characters per line.  Gen 1 has the caret (down arrow) appear in position 18 of line 2 when more than one page exists, and it appropriately accounts for this, reducing additional lines that need a caret to 17 characters.
        - New lines can be inserted manually
    - "Types" out text cleanly, word-wrapping as expected.
    - Inline commands are capable like so: `*CMD:`, where "CMD" is the command name (all caps).  String literals are ideal here to allow for templates (`${data}`) as you can add things like ```box.show(`${opponentName}\nWants to battle!`)```, and so on.
        - Commands include *WAIT: (and *WAIT,nn:) to pause textbox execution for set amounts of frames, pausing execution with *PAUSE,SCRIPT: to run a script mid-textbox (i.e. saving the game) *BGM: and *SFX: to play music and sound effects (i.e. item get sfx), and so on.  Many more features are included.

2. Mapping system
    - Maps are stored as JSON files, and are currently designed to be similar to how the Game Boy handles maps - 8x8 px tiles are composed into squares, or "meta tiles", that are further composed into blocks (2x2 squares).  The latter is optional, and one can compose maps purely of squares instead of blocks - they will be parsed down to the same thing.
    - The raw tile data consists an atlas of the 8x8 hardware tiles, however with one key difference - they are separated by 8px gaps to the right and bottom of each tile.  Originally, they would be together, however in order to utilize CSS sprites to accomplish the DOM-only goal, this would require four smaller <div> elements inside of a larger container - 5 elements per square (a total of 660 elements alone).  That's no good since we'll be manipulating multiple doms to pan the map around.  There will be 1 gutter of tiles around the screen to maintain what looks like smooth scrolling - using a transparent spacing around the tiles lets us use 4 backgrounds per <div> and they won't overlap (16x16 px <div>, so there's always 8px of space around each tile - force transparency and no one tile covers the other)!
    - Animated tiles follow the same rule, but are separate files.  We link animated tiles to their representation in the tileset inside of the map data.
    - Sprites are generally 16x16 px images and are separate files
    - To be determined: the core challenge is to do this all with HTML and the DOM - so we're going to attempt to handle graphics solely with `<div>` elements!  This might be scrapped if performance suffers too much, but we will see what happens.

## Changelog:
### v0.0.7
- Added mapLoader.global.js for loading and parsing maps.
- Modified tilesets to account for fitting multiple backgrounds in a single div
- Added map rendering system

### v0.0.5
- Text system refined and behaves more or less like it does in Generation I.
- Added basic inline commands - wait (for 30 frames or specified amount), pause (wait until a called script executes and continues), automated elipsis handling (10 frame pause for each dot printed), audio playback, sfx playback, auto-advancing of text, and more.

### v0.0.1
- Text system started