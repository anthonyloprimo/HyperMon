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
    - Maps are rendered solely within `<div>` elements!

3. Sprites
    - Sprites utilize sprite sheets, one sheet per specific object and state (item balls, player sprite, flying sprite, NPCs, all separate files)
    - Animation system utilizes traditional logic (one side, up/down, flip sprites for additional 'frames' or alternate facing), a more modernized approach similar to RPG Maker, and more.
    - Player sprites (and most all others) are drawn with a -4px offset just like in the original game
    - Call sprites on-the-fly (i.e. the shadow that appears underneath when ledge hopping)

## Known Bugs:
- The app is written in JS, HTML, CSS.  This bug cannot be fixed.
- In the map editor, object placement functionality isn't implemented yet.
- In the map editor, blocks aren't able to be created; the map currently only works with squaress (the 4x4 tile squares, not the 8x8 tile blocks).
- In the map editor, resizing the map will clear everything without warning.
- In the map editor, encounter tables cannot yet be defined (just placeholder and html scaffolding).
- When loading maps and crossing into a new map, there's a momentary hitch that resets movement.  It looks similar to the few-frame lag that happens in the original game, but due to a different reason - it's to circumvent a softlock situation where if holding the movement button during a map poll, the player will continue moving in the held direction even after releasing said direction until walking into a void square.  Until a more accurate fix is discovered, this will remain, as the gameplay feels solid enough as-is.
- There are no NPCs
- The PC in the player's house functions as a sign as no other object type is available for interactive objects like PCs.
- Music transitions, specifically the fade-out part of it is too fast.
- The textbox should not play a sound when dismissing a textbox, only when advancing text.
- A command needs to be added to clear the text box and start writing new text, as if calling a new textbox.
- In rare edge cases, if changing maps rapidly when different BGMs are specified, the next time the BGM changes, the music won't fade.  It'll work correctly again, afterwards.

## Changelog:
### v0.0.48
- Added grass overlay effect when the player is in tall grass.
- Fixed a bug where locations were determined by applying 'floor' to the pixel coordinates, which caused the origin of each check to lock to the top-left of each unit (mainly 16x16px squares).  As a result, moving right or down updates *after* a player finishes moving, while moving up or left updates the moment they move, causing certain things to happen too early.  This was fixed by adding half the size of the square after applying floor, and now all directions behave exactly as expected.  This fix improves the grass overlay effect as well as coordinate updates at the same time.

### v0.0.46
- Doubled the fade out duration from 500ms to 1000ms so it's more accurate to the original game.
- Fixed a glitch with audio where rapidly switching between two maps with different BGMs defined would start playing multiple times instead of fading out.  Behavior more closely matches the original games, now.
- Added debug pane which will allow various actions when testing the game
- Added master volume control function (for debug and gameplay options later)
- Added debug function for muting audio
- Added walk through walls debug function to easily move around maps when testing.
- Added map select/coordinate warp.

### v0.0.39
- Added objects to test interacting in-world, ensured a delay happens just after closing a message box to prevent interaction loop.  (Previously, pressing "A" to close a textbox immediately re-opened it).
- Added seamless map loading!  You can now walk from Pallet Town into Route 1, and back!
- Fixed a bug where walk-over triggers could be toggled with a press of the "A" button.
- Fixed a bug where triggers that should only fire on "A" press could be triggered by bumping against it.
- Added map-defined BGM playback.  The fade-out and BGM transition code has been already there
- Added signs to various maps
- Added Pallet Town, Player's House, Rival's House, Oak's Lab, Route 1 maps

### v0.0.32
- Adjusted the starting map the the player's room to align with the original game.
- Updated collision detection to account for movement state (walk, surf, bike).  Water squares behave like walls when not in surf mode)

### v0.0.30
- Added warp objects and flags to map handling.  So far just warps are working properly.
- When autowalk is enabled for a warp, the player will move one square in the direction they are facing, and the player input is locked to prevent interrupting the auto-walk sequence.

### v0.0.28
- Fixed a bug where the player didn't animate when walking correctly.
- Fixed a bug where the player wouldn't animate when bumping against a solid object or square.
- Addded the ability to save and create animated tiles to the map editor.
- Saving maps are possible.
- Fixed a bug where file paths weren't displaying and the file name displays correctly.
- Added the ability to click and drag when painting tiles on a square.
- Added the ability to clone a square in the square palette.
- Tweaked the map editor output so the map ID array looks pretty for readability.
- Music preview for the map editor.
- Added file loading.

### v0.0.17
- Added initial collision logic for player.
- Added ledge hopping.
- Created the map editor

### v0.0.14
- Fixed a bug where background tiles (possibly other visual assets as well) would sometimes appear with interpolation despite it being disabled.  Conflicting CSS rules appear to have been causing a race condition that sometimes triggered it.  Should be resolved.
- Added player object that moves around in a manner that's more Gen II-esque.
- Added camera system.  Refined the CSS which prevented the full visible area from being displayed in the viewport.
- Made - and fixed - a bug where the player sprite jumps all over the place.  That doesn't happen now.

### v0.0.10
- Added mapLoader.global.js for loading and parsing maps.
- Modified tilesets to account for fitting multiple backgrounds in a single div
- Added map rendering system
- Testing proper map display with a real tileset
- Added animated tile support

### v0.0.5
- Text system refined and behaves more or less like it does in Generation I.
- Added basic inline commands - wait (for 30 frames or specified amount), pause (wait until a called script executes and continues), automated elipsis handling (10 frame pause for each dot printed), audio playback, sfx playback, auto-advancing of text, and more.

### v0.0.1
- Text system started