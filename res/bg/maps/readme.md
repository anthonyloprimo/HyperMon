# Map System Overview
This is how we handle maps for this engine.  Eventually, there will be a map editor to make this visual, but for now, we're just stuck doing it the old fashioned way.  By typing.  A *lot*.

## Files
The map system utilizes one of two files - ideally both will be included in the base game to allow the game to be played in any environment:
- mapName.json
- mapName.js

The contents are *nearly* identical; the only exception is that we store the object inside of a variable in the js file:
```
mapName.json:
{
    "mapName": "PalletTown",
    "schema": 1,
    "bgm": "res/bgm/palletTown.mp3",
    ...
}

mapName.js:
var mapName = {
    "mapName": "PalletTown",
    "schema": 1,
    "bgm": "res/bgm/palletTown.mp3",
    ...
}
```
## But why two files?
Because of the icky, stinky CORS rules, which in reality are really powerful safeguards against mallicious code, it's not always possible to immediately access and handle json files - at least locally.  Local files fail same-origin checks by design, so therefore the browser assumes that two pieces of data from `file:///` comes from two different places, and as such the file is blocked.

This game is explicitly designed to be run from a website, from a local file, or eventually in a wrapper (i.e. electron).  Since we can store objects in a variable and work with them normally, instead of disabling web security and having to configure a custom shortcut to do this, we have two files - one that works as originally intended, and one that functions as a workaround.  Makes it easier for my lazy butt to test things, anyway.

## Get off your butt and make a local server and stop being lazy.
No.



## Map Structure
The map contains a series of values that define it's name, version number, default background music to play when entering the area, it's tileset (8px squares), animated tiles, squares (the 4x4 tile blocks resulting in 16px squares) and optionally, blocks (4x4 square blocks resulting in 32px squares, which is how the original game does it).

Why allow for squares and blocks?  In designing these maps, I'm expanding on the capabilities of not-so-limited hardware.  Taking inspiration from RPG Maker, I'm parsing the map based on single "tiles" (squares in this case), which afford creators more flexibility when designing maps.  If we're directly translating the original maps into this game, allowing for blocks or squares allows the user to more simply create the map.  Or if you're a purist that wants to build a map more or less the way it was done on the original hardware... there you go.

For simplicity, I suggest foregoing blocks and just build the maps in squares; it runs plenty fast, anyway.

### Metadata
`mapName` is the map's internal name when referencing it. String value.
`schema` is the version of the map data.  If updates hit the map system after it's final release, we'll increment this to reduce conflicts.  Integer value.
`bgm` contains a string with the path to the audio file being used.  mp3, ogg, midi, etc can be used.  For MIDI, if the browser supports it - a later version of this game may support custom MIDI handling via a custom synthisizer.

### Tileset information
#### Normal Tiles
For those coming from engines like RPGMaker, they might be familiar with the term "tileset" or "chipset", however when we refer to tilesets for this engine, we're talking about an image atlas that contains the hardware tiles used by the Game Boy, which are 8px square graphics.
`tileset` is the object holding the data to define the tileset being used...
`image` is a string that contains the path to the tileset.
`tileWidth` and `tileHeight` are integer values that are by default 8, but can be changed if a creator chooses to modify the engine.
`columns` is an integer value that is by default 16.  For ease of referencing, we will use hex values to select a specific tile.

Tilesets are, by default a 256px wide by 96px tall image, containing 6 rows of 16 tiles.  This is how many online sources display them (namely The Spriter's Resource), which is where I got these graphics from.  The reason the image is so large, is because there is an 8px gap between each tile to the right and bottom (this includes the last tile).  We'll get into the why behind this in a moment.

When addressing a tile, we start at the top left (0x00) and can go all the way to the bottom right (0x5F), which we'll dig further into it.

So why an 8px gap?  Do I just love taking up useless space?  No, and it's not actually useless.  In an original concept for this system, I was going to use CSS sprites to select tiles for the map, like so:
```html
<div class="tile">
    <div class="tl"></div>
    <div class="tr"></div>
    <div class="bl"></div>
    <div class="br"></div>
</div>
```
This allows me to set one tile per child div (tl, tr, bl, br) without any issue however here's a concern - we're not doing this just once, or twice.  We've got a screen that can hold 10 of these squares across, and 9 down.  That's 90 of these squares!  And since we need at least a border of these squares just outside of the view so we can scroll without tiles visibly coming into view, that means we've got a grid of 12x11 - so from 90 squares to 132 squares!  And we've got a total of 5 elements per square (the container plus the four quadrants), which gives us 660 total elements to manage!  Now, as of writing this, I don't know just how much farther I'll need to go with HTML elements.  Maybe not much farther, but I don't want to deal with that many elements, especially in case this runs on a lower-spec device for some reason (like a phone).  Now the reason I initially thought of this?  We can't mask off the background - at least, not without masking ALL backgrounds in a CSS (as we can have multiple backgrounds).  So masking all but the top-left tile to be displayed will make it impossible to display the other 3 quadrants.  Since we can apply a CSS rule like `overflow: hidden;`, initially I was going to just use 4 child `<div>`s.  Bad.  And no way was I going to use SEPARATE image files per tile (which would technically also work but.... *no*).

But what if we can optimize this?  We can use multiple backgrounds, but can't mask them.  But.... what if we don't *care* about overlapping?  What if we utilize a little known thing called *transparency* to our advantage?  Enter the current setup.  Because there's always 8px of transparency between each tile, it doesn't matter where in our 16px `<div>` we place the tile - because there's always 8px of space around that quadrant, and we always have 8px of transparency around each tile, we can still maintain a small image atlas, not worry about overlapping background-images, because the only thing that overlaps is transparency.

This is why when you create your tilesets, you should maintain a gap between your tiles that is equal to the tile size.  Are you going to modify this engine to support 16px tiles?  Make sure there's a 16px gap to the right and bottom of each tile.  32px tiles?  32px gap.  And so on, and so forth.

#### Reference Tiles & Animated Tiles
`animations` contains objects that refrence tiles on the tileset for animated tiles.
`0x14` or any other HEX value will specify a reference tile in the main tileset.  In this example, hex 14 is a water tile.
`image` is a string with a path to the animated tile in question.
`totalFrames` is an integer value that specifies how many frames are in the animated tile.  Default is 8.
`frameWidth` and `frameHeight` are integer values that specify the total size of each animation frame.

Just like with the normal tileset, we have a gap of 8px (or the tile size) to the right and bottom of each tile, for the same reasons explained above.  This setup is inspired by RPG Maker - in many versions, there's a static tile in the main chipset, and there are additional files that contain each frame of animation, which the user sets in the tileset configuration.  At that point, when building the squares, we call the animated tile by calling it's reference tile (in the above example, we use `0x14`)

### Square definitions
Now we're moving closer to being able to map.  From here, we define the actual squares and their individual attributes.
`squares` contains a list of objects for each square.  They're indexed like normal, so you'll simply call the number for each square (base 10, starting at 0).  The object contains the following keys:
`"tiles": ["0x2C", "0x2C", "0x2C", "0x2C"]` using hex for simplicity, specify each tile for a square.  Odering is top-left, top-right, bottom-left, bottom-right.

`"collision"` is an object containing various flags for a square.  In it are the following...
`"solid": [true|false]` - specifies if the square is a solid block that the player cannot move onto (i.e. sign, bollards, trees, etc...) and is a baseline that has exceptions based on what is defined below.
`"ledge": ["n"|"e"|"s"|"w"|null]` - this overrides the "solid" flag if a direction is specified - if the player moves in the direction against the tile, they'll 'jump' over it.  Typically you'll have east, south, or west ledges to jump down.  I've not seen a north option, but it's there.
`"surface": ["normal"|"wall"|"water"|"grass"|"door"|"sign"|"ice"|etc...]` - these are for semantics and for defining custom behaviors...
- `normal` are your ususal walkable tiles that have no special attributes.
- `wall` are normal wall tiles that you cannot walk to (sides of mountains, trees, fences, bollards, etc...).
- `water` are water tiles.  They'll block normal movement, but allow movement when the player is in SURF mode
- `grass` are walkable tiles that can have encounters (i.e. tall grass tiles)
- `door` are walkable tiles that will trigger a warp or script
- `stair` behaves like a door, but has separate handling (actually plays same sfx as an exit)
- `exit` is a solid tile that, when the player bumps against it, will trigger a warp (i.e. leaving a building)
- `sign` is a solid tile that the user interacts with (like an NPC).
- `ice` is mostly in gen 2 and later, but it'sa walkable tile that if the player steps on it, they'll slide forward until hitting a solid block.
- Additional surfaces can be defined and handled by the engine.
`"talkOver": [true|false]` determines if the block can be interacted *over* i.e. a counter at a Pokemart, Pokemon Center, etc.

`"attributes"` are a freeform set of tags or metadata that can be utilized by the engine or for various effects and contain strings in a list.  For instance, it might contain `"grass"` as both a label and if we were to play SFX when moving through it, or, stemming from gen 2, one could include `"headbuttTree"` for trees that specifically could have the move Headbutt used on it.

### Block definitions
Whether the map accounts for squares or blocks is implicit; if `"block"` exists, everything after is based on blocks.  Otherwise, it only bases values on squares.  Blocks are objects that simply contain a list of squares in the same order we list tiles for squares:
```json
"block": {
    { 0, 1, 0, 1},
    { 2, 2, 2, 2},
    { 3. 3. 3. 3},
    etc...
}
```
As with squares, when specifying them for the map section (next), we specify with normal base 10 numerical indexes, starting from 0

### Creating the Map
The `"map"` object contains the information pertaining to the map and it square and object locations, as well as any linking maps, and it's void square.

`"width"` and `"height"` are integer values and pertain to the dimensions of the map.  If we're using squares, then the values pertain to the total number of squares wide and tall.  If we're using blocks, these values pertain to the amount of blocks tall and wide.  So, a map with `"width": 20, "height": 18` in squares is identical to a map with `"width": 10, "height": 9`.

`"ids"` is where we actually define what the map *looks like*.  For ease of creating the maps, you'll want to match the amount of tile IDs in a row to the total width of the map.  Each value is the numerical id of the squares (or blocks) defined above.  For instance, here's the example map, which is derived from Pallet Town:
```js
"ids": [
    0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 0, 2,
    2, 0, 5, 4, 6, 8, 8, 9, 5, 4, 5, 4, 6, 8, 8, 9, 5, 4, 0, 2,
    2, 0, 3, 3, 7,11,12,10, 4, 5, 3, 3, 7,11,12,10, 4, 5, 0, 2,
    2, 0, 3,17,13,14,15,16, 5, 4, 3,17,13,14,15,16, 5, 4, 0, 2,
    2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 0, 2,
    2, 0, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 0, 2,
    2, 0, 4, 5, 3, 3, 3, 3, 4, 5, 1, 1, 1, 1, 1, 1, 4, 5, 0, 2,
    2, 0, 5, 4,18,18,18,17, 5, 4, 1, 1, 1, 1, 1, 1, 5, 4, 0, 2,
    2, 0, 4, 5, 0, 0, 0, 0, 4, 5, 1, 1, 1, 1, 1, 1, 4, 5, 0, 2,
    2, 0, 5, 4, 0, 0, 0, 0, 5, 4, 1, 1, 1, 1, 1, 1, 5, 4, 0, 2,
    2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2,
    2, 0, 5, 4, 5, 4, 5, 4, 5, 4,18,18,18,17,18,18, 3, 3, 0, 2,
    2, 0, 0, 0,19,20,20,21, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2,
    2, 0, 0, 0,22,24,24,23, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2,
    2, 0, 0, 0,22,24,24,23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2,
    2, 2, 0, 0,22,24,24,23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
],
```
In this example, we're only building the map with squares instead of blocks.  We've got 24 total squares, each one pertaining to a square made up of 4 individual tiles.  Based on the layout of the original game, it's easy to assume that 0 is the basic short grass tile, 4 and 5 are alternating specs of grass on the ground, tile 2 are the bollards that surround the town, tiles 6 - 16 deal with houses, tile 17 is most likely the sign, and while we might not know what tile 18 is (it's the fence posts), it's some sort of other tile, and then tiles 19 - 24 are related to the coast/water tiles.  And interestingly, where Oak's lab would be is filled with tile 1 (it's a placeholder.  I got lazy, didn't want to bother piecing together oak's lab.  I got what I needed from what I made so far).

`"voidSquare"` is a specific case.  In the earlier titles, a square (well block in the original games) is defined to be repeated outside the boundaries of the map, so instead of a hard edge to the map, in the event the player is too close to a boundary, it just shows seamless tiles.  For Pallet Town, it's the marbly grass texture.  This is why people with walk through walls can go on past the map for a bit before the game crashes, but until that point, it looks like endless grassy plains.  For our engine, we only specify a square, not a block (even if blocks are being used).  Unlike the original games, though, since we don't have super tight memory restrictions, you can walk a good distance from the map and be stuck in a grassy void.  *It's almost like a nightmare...*

`"connections"` contain four keys that define what maps connect on each side: `"north"`, `"east"`, `"south"`, and `"west"`.  The value could be `null`, or it contains two additional key:value pairs:
`"mapID"` references the map name to load
`"offset"` is the amount of squares to offset the next map from the edge.  The value is an integer, and *only* counts squares.  The direction we offset in is based on which direction we're connecting maps to.  North- and south-connected maps offset from the left side.  East- and west-connected maps offset from the topmost part of the map.  The map system will parse the next map to load and display it, ensuring maps don't load too early, bogging down the system, and it ensures the world appears like one, big, seamless environment.  Except for the Safari Zone.  *Because non-euclidean world building is fun.  Seriously.  Check out the maps.  They don't fully line up.*

### Setting objects in the map.
Here's the setup for defining objects...
```json
    "objects": [
        {
            "name": "NPC_Clerk",
            "kind": "npc",
            "x": 5,
            "y": 2,
            "facing": "south",
            "script": "clerk_dialogue_01"
        },
        {
            "name": "Item_Ball_Potion",
            "kind": "item",
            "x": 8,
            "y": 4,
            "itemId": "POTION",
            "script": "pickup_once"
        },
        {
            ...
        }
```

We can set the `name`, the `kind` of object it is (which will be parsed for behaviors and interactions), as well as the position and facing on the map with `x`, `y`, and `facing`, which the last of those 3 is optional.  Additional pieces of data include the `script` that is called when interacting with the object with the "A" button, as well as things like `itemId` which is useful for item balls.

For `kind`, these carry additional attributes that further dictate map related logic, such as whether it's a solid object (npc character) or perhaps it's an invisible collision-triggered event, such as the healing platform in the Pokemon Tower, or the movable tiles in the Team Rocket hideout or Eighth Gym *(shush, don't tell anyone Giovanni is the gym leader!)*, or the teleportation tiles in the Silph Co. office building or Sabrina's Gym. *I really, really hate that gym.  Psychic?  More like PsyCHO.  Way too OP, Sabrina.*

### Encounters and Zones
In Pokemon Red and Blue, maps have defined encounter pools that any valid part of the map (water, grass, etc) pulls from.  It specifies the pokemon, a range of levels, and the rate of capturing.  In this engine, an optional section can be added to define zones that override this default behavior.  Any area with encounter data that ISN'T defined in specific zones falls back to the default encounter tables:
```json
"encounters": {
    "land": [
        { "mon": "PIDGEY",  "minLv": 3, "maxLv": 5, "rate": 20 },
        { "mon": "RATTATA", "minLv": 2, "maxLv": 4, "rate": 20 },
        { "mon": "NIDORAN_F", "minLv": 3, "maxLv": 5, "rate": 10 },
        { "mon": "NIDORAN_M", "minLv": 3, "maxLv": 5, "rate": 10 }
    ],
    "water": [
        { "mon": "GOLDEEN", "minLv": 5, "maxLv": 10, "rate": 30 }
    ],
    "rodOld": [
        { "mon": "MAGIKARP", "minLv": 5, "maxLv": 5, "rate": 70 }
    ],
    "rodGood": [
        { "mon": "GOLDEEN", "minLv": 10, "maxLv": 15, "rate": 60 },
        { "mon": "POLIWAG", "minLv": 10, "maxLv": 15, "rate": 40 }
    ],
    "rodSuper": [
        { "mon": "GYARADOS", "minLv": 15, "maxLv": 20, "rate": 40 }
    ],

    "zones": [
        {
            "region": { "tl": [2, 1], "br": [7, 3] },
            "land": [
                { "mon": "PIKACHU", "minLv": 5, "maxLv": 7, "rate": 10 }
            ],
            "water": [],
            "rodOld": [],
            "rodGood": [],
            "rodSuper": []
        }
    ]
}
```
`land` encounters are just your normal tall grass encounters.
`water` encounters correspond to anywhere that you can use surf.
`rodOld`, `rodGood`, etc... encounters are for, if it wasn't evident, encounter tables for each type of rod.  Encounters listed here are isolated, just like in the original game - so using a Good Rod or Super Rod will ONLY pull from it's respective encounter table.  Make sure you define pokemon for each type of rod!

`zones` are structured similarly, but have an additional key, `region`.  In it you define coordinates for `tl` (top left) and `br` (bottom right).  Any valid encounter tiles in this region will then pull from the encounter tables in it's zone - otherwise it falls back to the map defaults.

Why do this?  Because I can.  Imagine - a seemingly perfectly normal Pokemon game, but one tile on each map exclusively spawns.... *Mew*.  Aren't I amazing?  Nah.  Just crazy.

## mapTemplate.js example
Here's what a full map file looks like:
```js
var mapTemplate = {
    "mapName": "ExampleMap",
    "schema": 1,

    "bgm": "res/bgm/04 Pallet Town.mp3",

    "tileset": {
        "image": "res/bg/tilesOutdoorA.png",
        "tileWidth": 8,
        "tileHeight": 8,
        "columns": 16,

        "animations": {
            "0x14": {
                "image": "res/bg/animWater.png",
                "totalFrames": 8,
                "frameWidth": 8,
                "frameHeight": 8
            }
        }
    },

    "squares": [
        {
            "tiles": ["0x2C", "0x2C", "0x2C", "0x2C"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": ["grass"]
            }
        },
        {
            "tiles": ["0x40", "0x41", "0x50", "0x51"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": ["tree"]
            }
        },
        {
            "tiles": ["0x2A", "0x2B", "0x3A", "0x3B"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": ["bollard"]
            }
        },
        {
            "tiles": ["0x39", "0x39", "0x39", "0x39"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": ["shortGrassA"]
            }
        },
        {
            "tiles": ["0x00", "0x00", "0x39", "0x00"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": ["shortGrassB"]
            }
        },
        {
            "tiles": ["0x00", "0x00", "0x00", "0x00"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": ["noGrass"]
            }
        },
        {
            "tiles": ["0x05", "0x06", "0x15", "0x16"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": ["roofLeftA"]
            }
        },
        {
            "tiles": ["0x25", "0x26", "0x5C", "0x17"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": ["roofLeftB"]
            }
        },
        {
            "tiles": ["0x07", "0x07", "0x17", "0x17"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["roofTop"]
            }
        },
        {
            "tiles": ["0x08", "0x09", "0x18", "0x19"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["roofRightA"]
            }
        },
        {
            "tiles": ["0x28", "0x29", "0x17", "0x5D"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["roofRightB"]
            }
        },
        {
            "tiles": ["0x0A", "0x22", "0x17", "0x17"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["houseTopA"]
            }
        },
        {
            "tiles": ["0x0A", "0x0A", "0x17", "0x17"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["houseTopB"]
            }
        },
        {
            "tiles": ["0x0F", "0x22", "0x4E", "0x1A"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["houseBottomLeft"]
            }
        },
        {
            "tiles": ["0x0B", "0x0C", "0x1B", "0x1C"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "door",
                "talkOver": false
            },
            "attributes": {
                "tags": ["houseBottomDoor"]
            }
        },
        {
            "tiles": ["0x0A", "0x0A", "0x1A", "0x1A"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["houseBottomWindow"]
            }
        },
        {
            "tiles": ["0x22", "0x1F", "0x1A", "0x4F"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
                "talkOver": false
            },
            "attributes": {
                "tags": ["houseBottomRight"]
            }
        },
        {
            "tiles": ["0x46", "0x47", "0x56", "0x57"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "sign",
                "talkOver": false
            },
            "attributes": {
                "tags": ["signPostA"]
            }
        },
        {
            "tiles": ["0x0E", "0x0E", "0x55", "0x55"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": ["fence"]
            }
        },
        {
            "tiles": ["0x33", "0x33", "0x32", "0x14"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["coastNorthEast"]
            }
        },
        {
            "tiles": ["0x33", "0x33", "0x14", "0x14"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["coastNorth"]
            }
        },
        {
            "tiles": ["0x33", "0x33", "0x14", "0x54"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["coastNorthWest"]
            }
        },
        {
            "tiles": ["0x32", "0x14", "0x32", "0x14"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["coastEast"]
            }
        },
        {
            "tiles": ["0x14", "0x54", "0x14", "0x54"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["coastWest"]
            }
        },
        {
            "tiles": ["0x14", "0x14", "0x14", "0x14"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["water"]
            }
        }
    ],

    "map": {
        "width": 20,
        "height": 18,

        "ids": [
            0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 0, 2,
            2, 0, 5, 4, 6, 8, 8, 9, 5, 4, 5, 4, 6, 8, 8, 9, 5, 4, 0, 2,
            2, 0, 3, 3, 7,11,12,10, 4, 5, 3, 3, 7,11,12,10, 4, 5, 0, 2,
            2, 0, 3,17,13,14,15,16, 5, 4, 3,17,13,14,15,16, 5, 4, 0, 2,
            2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 0, 2,
            2, 0, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 0, 2,
            2, 0, 4, 5, 3, 3, 3, 3, 4, 5, 1, 1, 1, 1, 1, 1, 4, 5, 0, 2,
            2, 0, 5, 4,18,18,18,17, 5, 4, 1, 1, 1, 1, 1, 1, 5, 4, 0, 2,
            2, 0, 4, 5, 0, 0, 0, 0, 4, 5, 1, 1, 1, 1, 1, 1, 4, 5, 0, 2,
            2, 0, 5, 4, 0, 0, 0, 0, 5, 4, 1, 1, 1, 1, 1, 1, 5, 4, 0, 2,
            2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2,
            2, 0, 5, 4, 5, 4, 5, 4, 5, 4,18,18,18,17,18,18, 3, 3, 0, 2,
            2, 0, 0, 0,19,20,20,21, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2,
            2, 0, 0, 0,22,24,24,23, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 2,
            2, 0, 0, 0,22,24,24,23, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 2,
            2, 2, 0, 0,22,24,24,23, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
        ],

        "voidSquare": 0,

        "connections": {
            "north": { "mapId": "Route2_North", "offset": 5 },
            "east":  null,
            "south": { "mapId": "Viridian_South", "offset": 0 },
            "west":  null
        }
    },

    "objects": [
        {
            "name": "NPC_Clerk",
            "kind": "npc",
            "x": 5,
            "y": 2,
            "facing": "south",
            "script": "clerk_dialogue_01"
        },
        {
            "name": "Item_Ball_Potion",
            "kind": "item",
            "x": 8,
            "y": 4,
            "itemId": "POTION",
            "script": "pickup_once"
        },
        {
            "name": "Sign_Town",
            "kind": "sign",
            "x": 3,
            "y": 1,
            "script": "sign_town_text"
        }
    ],

    "encounters": {
        "land": [
            { "mon": "PIDGEY",  "minLv": 3, "maxLv": 5, "rate": 20 },
            { "mon": "RATTATA", "minLv": 2, "maxLv": 4, "rate": 20 },
            { "mon": "NIDORAN_F", "minLv": 3, "maxLv": 5, "rate": 10 },
            { "mon": "NIDORAN_M", "minLv": 3, "maxLv": 5, "rate": 10 }
        ],
        "water": [
            { "mon": "GOLDEEN", "minLv": 5, "maxLv": 10, "rate": 30 }
        ],
        "rodOld": [
            { "mon": "MAGIKARP", "minLv": 5, "maxLv": 5, "rate": 70 }
        ],
        "rodGood": [
            { "mon": "GOLDEEN", "minLv": 10, "maxLv": 15, "rate": 60 },
            { "mon": "POLIWAG", "minLv": 10, "maxLv": 15, "rate": 40 }
        ],
        "rodSuper": [
            { "mon": "GYARADOS", "minLv": 15, "maxLv": 20, "rate": 40 }
        ],

        "zones": [
            {
                "region": { "tl": [2, 1], "br": [7, 3] },
                "land": [
                    { "mon": "PIKACHU", "minLv": 5, "maxLv": 7, "rate": 10 }
                ],
                "water": [],
                "rodOld": [],
                "rodGood": [],
                "rodSuper": []
            }
        ]
    }
}
```