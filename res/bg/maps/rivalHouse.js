var rivalHouse = {
    "mapName": "rivalHouse",
    "schema": 1,

    "bgm": "res/bgm/04 Pallet Town.mp3",

    "tileset": {
    "image": "res/bg/tilesIndoorsB.png",
    "tileWidth": 8,
    "tileHeight": 8,
    "columns": 16,
    "animations": {
    }
}
,

    "squares": [
        {
            "tiles": [ "0x10", "0x10", "0x10", "0x10" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "void"
                ]
            }
        },
        {
            "tiles": [ "0x01", "0x01", "0x01", "0x01" ],
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
            "tiles": [ "0x00", "0x00", "0x00", "0x00" ],
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
            "tiles": [ "0x02", "0x03", "0x12", "0x13" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "chair"
                ]
            }
        },
        {
            "tiles": [ "0x24", "0x24", "0x34", "0x34" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "window"
                ]
            }
        },
        {
            "tiles": [ "0x2D", "0x2E", "0x3D", "0x3E" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "townMap"
                ]
            }
        },
        {
            "tiles": [ "0x26", "0x27", "0x36", "0x2F" ],
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
            "tiles": [ "0x27", "0x29", "0x2F", "0x39" ],
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
            "tiles": [ "0x36", "0x2F", "0x3C", "0x3A" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableBL"
                ]
            }
        },
        {
            "tiles": [ "0x2F", "0x39", "0x3A", "0x3B" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tableBR"
                ]
            }
        },
        {
            "tiles": [ "0x26", "0x29", "0x30", "0x31" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shelf1Top"
                ]
            }
        },
        {
            "tiles": [ "0x30", "0x31", "0x1E", "0x1F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shelf1Bottom"
                ]
            }
        },
        {
            "tiles": [ "0x26", "0x29", "0x0E", "0x0F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shelf2Top"
                ]
            }
        },
        {
            "tiles": [ "0x0E", "0x0F", "0x1E", "0x1F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shelf2Bottom"
                ]
            }
        },
        {
            "tiles": [ "0x04", "0x04", "0x14", "0x14" ],
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
            "tiles": [ "0x0A", "0x0B", "0x08", "0x09" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "plantTop"
                ]
            }
        },
        {
            "tiles": [ "0x1A", "0x1B", "0x18", "0x19" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "plantBottom"
                ]
            }
        }
    ]
,

"map": {
    "width": 8,
    "height": 8,

    "ids": [
        12,12, 2, 5, 2, 4, 2,10,
        13,13, 1, 1, 1, 1, 1,11,
         1, 1, 1, 1, 1, 1, 1, 1,
         1, 1, 3, 6, 7, 3, 1, 1,
         1, 1, 3, 8, 9, 3, 1, 1,
         1, 1, 1, 1, 1, 1, 1, 1,
        15, 1, 1, 1, 1, 1, 1,15,
        16, 1,14,14, 1, 1, 1,16
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
        "name": "warpRivalHouseToPalletL",
        "kind": "warp",
        "x": 2, "y": 8,
        "sprite": { },
        "trigger": { "onBump": true },
        "walkThrough": false,
        "to": { "mapId": "palletTown", "x": 13, "y": 5, "facing": "down", "autoWalk": true },
        "transition": { "out": "gen1ToBlack", "in": "gen1FromBlack" },
        "sfx": "SFX_GO_OUTSIDE"
    },
    {
        "name": "warpRivalHouseToPalletR",
        "kind": "warp",
        "x": 3, "y": 8,
        "sprite": { },
        "trigger": { "onBump": true },
        "walkThrough": false,
        "to": { "mapId": "palletTown", "x": 13, "y": 5, "facing": "down", "autoWalk": true },
        "transition": { "out": "gen1ToBlack", "in": "gen1FromBlack" },
        "sfx": "SFX_GO_OUTSIDE"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 0, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 1, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "bookcase",
        "kind": "sign",
        "x": 7, "y": 1,
        "script": "BOOKCASE_TEXT"
    },
    {
        "name": "townMap",
        "kind": "sign",
        "x": 3, "y": 0,
        "script": "TOWNMAP_TEXT"
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
