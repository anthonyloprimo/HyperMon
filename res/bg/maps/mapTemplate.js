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
                "solid": true,
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
                "solid": true,
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
                "solid": false,
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
                "solid": false,
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
                "solid": false,
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
                "solid": false,
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
                "solid": false,
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
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": ["water"]
            }
        },
        {
            "tiles": ["0x27", "0x2C", "0x27", "0x2C"],
            "collision": {
                "solid": true,
                "ledge": "W",
                "surface": "ledge",
                "talkOver": false
            },
            "attributes": {
                "tags": ["ledgeWest"]
            }
        },
        {
            "tiles": ["0x27", "0x2C", "0x36", "0x37"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "ledge",
                "talkOver": false
            },
            "attributes": {
                "tags": ["ledgeSouthWest"]
            }
        },
        {
            "tiles": ["0x2C", "0x2C", "0x37", "0x37"],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "ledge",
                "talkOver": false
            },
            "attributes": {
                "tags": ["ledgeSouth"]
            }
        },
        {
            "tiles": ["0x2C", "0x24", "0x37", "0x34"],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "ledge",
                "talkOver": false
            },
            "attributes": {
                "tags": ["ledgeSouthEast"]
            }
        },
        {
            "tiles": ["0x2C", "0x24", "0x2C", "0x24"],
            "collision": {
                "solid": true,
                "ledge": "E",
                "surface": "ledge",
                "talkOver": false
            },
            "attributes": {
                "tags": ["ledgeEast"]
            }
        },
        {
            "tiles": ["0x52", "0x52", "0x52", "0x52"],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "grass",
                "talkOver": false
            },
            "attributes": {
                "tags": ["tallGrass"]
            }
        }
    ],

    "map": {
        "width": 20,
        "height": 18,

        "ids": [
            0, 0, 0, 2, 0, 0, 0, 0, 0, 2,30,30, 2, 0, 0, 0, 0, 0, 2, 0,
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2,30,30, 2, 2, 2, 2, 2, 2, 2, 2,
            2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 0, 2,
            2, 0, 5, 4, 6, 8, 8, 9, 5, 4, 5, 4, 6, 8, 8, 9, 5, 4, 0, 2,
            2, 0, 3, 3, 7,11,12,10, 4, 5, 3, 3, 7,11,12,10, 4, 5, 0, 2,
            2, 0, 3,17,13,14,15,16, 5, 4, 3,17,13,14,15,16, 5, 4, 0, 2,
            2, 0, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 0, 2,
            2, 0, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 0, 2,
            2, 0, 4, 5, 3, 3, 3, 3, 4, 5,25, 0, 0, 0, 0,29, 4, 5, 0, 2,
            2, 0, 5, 4,18,18,18,17, 5, 4,25, 0, 0, 0, 0,29, 5, 4, 0, 2,
            2, 0, 4, 5, 0, 0, 0, 0, 4, 5,26,27, 0, 0,27,28, 4, 5, 0, 2,
            2, 0, 5, 4, 0, 0, 0, 0, 5, 4, 0, 0, 0, 0, 0, 0, 5, 4, 0, 2,
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
        "name": "AnyIdentifier",
        "kind": "warp",

        // placement (grid coords; can be outside bounds if you want bump-only edge warps)
        "x": 10,
        "y": 5,

        // optional sprite for the warp tile (static or sheet-driven)
        "sprite": {
            // EITHER a static atlas index in staticSprites.png…
            "staticIndex": 9,                // optional

            // …OR a sheet-driven sprite (for animated/posed objects/NPCs)
            // "spriteSheet": {
            //     "image": "res/spr/doorAnim.png",
            //     "mode": 0,                     // 0 = CLASSIC (2 cols per row), 1 = FULL (4 cols)
            //     "frameW": 16,                  // (16)
            //     "frameH": 16,                  // (16)
            //     "cols": 4,                     // (4)
            //     "idleFacing": "down",          // ("down")
            //     "returnFacing": "down"         // optional: after interact, face back this way
            // },
            // "voff": -4,                      // visual y-offset for draw (optional)
            // "zBias": 0                       // z-index bias relative to base (optional)
        },

        // how it triggers
        "trigger": {
            "onStep": true,                  // stepping onto the tile triggers (false)
            "onBump": false,                 // bumping from adjacent tile triggers (false)
            "directions": ["N","S","E","W"]  // optional: restrict approach dirs; omit for any
        },

        // collision override if needed (door rugs/ladder tiles, etc.)
        "walkThrough": true,               // (false) if true, player can occupy this tile

        // destination
        "to": {
            "mapId": "Interior_HouseA",
            "x": 4,                          // destination tile X
            "y": 7,                          // destination tile Y
            "facing": "down",                // optional; default: keep current facing
            "autoWalk": true                 // optional; if true, auto-walk 1 tile out after spawn
        },

        // transitions and sfx (names your transition/audio code will resolve)
        "transition": {
            "out": "gen1ToBlack",            // (optional)
            "in":  "gen1FromBlack"           // (optional)
        },
        "sfx": "doorEnter"                 // (optional) play on trigger

        // (later) flags/conditions could live here if needed
        // "flags": { "require": ["OAK_DONE"], "forbid": ["HAS_BIKE"] }
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