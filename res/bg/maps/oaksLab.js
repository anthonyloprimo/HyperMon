var oaksLab = {
    "mapName": "oaksLab",
    "schema": 1,

    "bgm": "res/bgm/07. Pokémon Lab.mp3",

    "tileset": {
    "image": "res/bg/tilesIndoorsI.png",
    "tileWidth": 8,
    "tileHeight": 8,
    "columns": 16,
    "animations": {
    }
}
,

    "squares": [
        {
            "tiles": [ "0x0F", "0x0F", "0x0F", "0x0F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "void"
                ]
            }
        },
        {
            "tiles": [ "0x11", "0x11", "0x11", "0x11" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "floor"
                ]
            }
        },
        {
            "tiles": [ "0x05", "0x05", "0x10", "0x10" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "wall"
                ]
            }
        },
        {
            "tiles": [ "0x34", "0x43", "0x52", "0x53" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "poster"
                ]
            }
        },
        {
            "tiles": [ "0x29", "0x3B", "0x4E", "0x39" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableTL"
                ]
            }
        },
        {
            "tiles": [ "0x3B", "0x2A", "0x39", "0x4F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableTR"
                ]
            }
        },
        {
            "tiles": [ "0x58", "0x59", "0x11", "0x11" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableBL"
                ]
            }
        },
        {
            "tiles": [ "0x59", "0x5A", "0x11", "0x11" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableBR"
                ]
            }
        },
        {
            "tiles": [ "0x29", "0x2A", "0x0D", "0x0E" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shelfTop"
                ]
            }
        },
        {
            "tiles": [ "0x0D", "0x0E", "0x1D", "0x1E" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shelfBottom"
                ]
            }
        },
        {
            "tiles": [ "0x3B", "0x3B", "0x39", "0x39" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableTM"
                ]
            }
        },
        {
            "tiles": [ "0x59", "0x59", "0x11", "0x11" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableBM"
                ]
            }
        },
        {
            "tiles": [ "0x06", "0x06", "0x16", "0x16" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "rug"
                ]
            }
        },
        {
            "tiles": [ "0x5B", "0x5C", "0x36", "0x37" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "deskTL"
                ]
            }
        },
        {
            "tiles": [ "0x5D", "0x5E", "0x55", "0x5F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "deskTR"
                ]
            }
        }
    ]
,

"map": {
    "width": 10,
    "height": 13,

    "ids": [
         2, 2, 2, 2, 3, 3, 8, 8, 8, 8,
        13,14, 4, 5, 1, 1, 9, 9, 9, 9,
         6, 7, 6, 7, 1, 1, 1, 1, 1, 1,
         1, 1, 1, 1, 1, 1, 4,10, 5, 1,
         1, 1, 1, 1, 1, 1, 6,11, 7, 1,
         1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
         8, 8, 8, 8, 1, 1, 8, 8, 8, 8,
         9, 9, 9, 9, 1, 1, 9, 9, 9, 9,
         1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
         1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
         1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
         1, 1, 1, 1,12,12, 1, 1, 1, 1,
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]
,

    "voidSquare": 0,

    "connections": {
    "north": null,
    "east": null,
    "south": null,
    "west": null
}
},

"objects": [
    {
        "name": "warpOaksLabToPalletL",
        "kind": "warp",
        "x": 4, "y": 11,
        "sprite": { },
        "trigger": { "onBump": true },
        "walkThrough": false,
        "to": { "mapId": "palletTown", "x": 12, "y": 11, "facing": "down", "autoWalk": true },
        "transition": { "out": "gen1ToBlack", "in": "gen1FromBlack" },
        "sfx": "SFX_GO_OUTSIDE"
    },
    {
        "name": "warpOaksLabToPalletR",
        "kind": "warp",
        "x": 5, "y": 11,
        "sprite": { },
        "trigger": { "onBump": true },
        "walkThrough": false,
        "to": { "mapId": "palletTown", "x": 12, "y": 11, "facing": "down", "autoWalk": true },
        "transition": { "out": "gen1ToBlack", "in": "gen1FromBlack" },
        "sfx": "SFX_GO_OUTSIDE"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 6, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 7, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 8, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 9, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 0, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 1, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 2, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 3, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 6, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 7, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 8, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 9, "y": 7,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "posterL",
        "kind": "sign",
        "x": 4, "y": 0,
        "script": "POSTERL_TEXT"
    },
    {
        "name": "posterR",
        "kind": "sign",
        "x": 5, "y": 0,
        "script": "POSTERR_TEXT"
    },
    {
        "name": "oaksPC",
        "kind": "sign",
        "x": 0, "y": 1,
        "script": "PC_OAK"
    },
    {
        "name": "oaksPC",
        "kind": "sign",
        "x": 1, "y": 1,
        "script": "PC_OAK"
    },
],

"encounters": {
    "land": [],
    "water": [],
    "rodOld": [],
    "rodGood": [],
    "rodSuper": [],
    "zones": []
}
};
