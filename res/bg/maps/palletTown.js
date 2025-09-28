var palletTown = {
    "mapName": "palletTown",
    "schema": 1,

    "bgm": "",

    "tileset": {
    "image": "res/bg/tilesOutdoorA.png",
    "tileWidth": 8,
    "tileHeight": 8,
    "columns": 16,
    "animations": {
        "0x14": {
            "image": "res/bg/animSea.png",
            "totalFrames": 8,
            "frameWidth": 8,
            "frameHeight": 8
        }
    }
}
,

    "squares": [
        {
            "tiles": [ "0x2A", "0x2B", "0x3A", "0x3B" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": []
            }
        },
        {
            "tiles": [ "0x2C", "0x2C", "0x2C", "0x2C" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "grass"
                ]
            }
        },
        {
            "tiles": [ "0x2C", "0x2C", "0x2C", "0x03" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "grassFlower1"
                ]
            }
        },
        {
            "tiles": [ "0x03", "0x2C", "0x2C", "0x2C" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "grassFlower2"
                ]
            }
        },
        {
            "tiles": [ "0x39", "0x39", "0x39", "0x39" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "grassLight"
                ]
            }
        },
        {
            "tiles": [ "0x00", "0x00", "0x39", "0x00" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "grassTiny"
                ]
            }
        },
        {
            "tiles": [ "0x00", "0x00", "0x00", "0x00" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "noGrass"
                ]
            }
        },
        {
            "tiles": [ "0x52", "0x52", "0x52", "0x52" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tallGrass"
                ]
            }
        },
        {
            "tiles": [ "0x14", "0x14", "0x14", "0x14" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "sea"
                ]
            }
        },
        {
            "tiles": [ "0x32", "0x14", "0x32", "0x14" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "seaCoastW"
                ]
            }
        },
        {
            "tiles": [ "0x14", "0x54", "0x14", "0x54" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "seaCoastE"
                ]
            }
        },
        {
            "tiles": [ "0x33", "0x33", "0x32", "0x14" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "seaCoastNW"
                ]
            }
        },
        {
            "tiles": [ "0x33", "0x33", "0x14", "0x14" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "seaCoastN"
                ]
            }
        },
        {
            "tiles": [ "0x33", "0x33", "0x14", "0x54" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "water",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "seaCoastNE"
                ]
            }
        },
        {
            "tiles": [ "0x05", "0x06", "0x15", "0x16" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseRoof1"
                ]
            }
        },
        {
            "tiles": [ "0x07", "0x07", "0x17", "0x17" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseRoof2"
                ]
            }
        },
        {
            "tiles": [ "0x08", "0x09", "0x18", "0x19" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseRoof3"
                ]
            }
        },
        {
            "tiles": [ "0x25", "0x26", "0x5C", "0x17" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseLeftTop"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x22", "0x17", "0x17" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseWallWindow1"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x0A", "0x17", "0x17" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseWallWindow2Top"
                ]
            }
        },
        {
            "tiles": [ "0x28", "0x29", "0x17", "0x5D" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseRightTop"
                ]
            }
        },
        {
            "tiles": [ "0x0F", "0x22", "0x4E", "0x1A" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseLeftBottom"
                ]
            }
        },
        {
            "tiles": [ "0x0B", "0x0C", "0x1B", "0x1C" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseDoor"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x0A", "0x1A", "0x1A" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseWallWindow2Bottom"
                ]
            }
        },
        {
            "tiles": [ "0x22", "0x1F", "0x1A", "0x4F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "houseRightBottom"
                ]
            }
        },
        {
            "tiles": [ "0x05", "0x06", "0x15", "0x38" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRoof1Top"
                ]
            }
        },
        {
            "tiles": [ "0x53", "0x53", "0x12", "0x12" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRoof2Top"
                ]
            }
        },
        {
            "tiles": [ "0x08", "0x09", "0x38", "0x19" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRoof3Top"
                ]
            }
        },
        {
            "tiles": [ "0x15", "0x38", "0x15", "0x16" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRoof1Bottom"
                ]
            }
        },
        {
            "tiles": [ "0x12", "0x12", "0x17", "0x17" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRoof2Bottom"
                ]
            }
        },
        {
            "tiles": [ "0x38", "0x19", "0x18", "0x19" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRoof3Bottom"
                ]
            }
        },
        {
            "tiles": [ "0x25", "0x26", "0x0F", "0x22" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labLeftTop"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x0A", "0x22", "0x22" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labWallWindow1"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x4B", "0x4B", "0x4B" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labWallWindow2"
                ]
            }
        },
        {
            "tiles": [ "0x4B", "0x0A", "0x4B", "0x4B" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labWallWindow3"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x0A", "0x4B", "0x4B" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labWallWindow4"
                ]
            }
        },
        {
            "tiles": [ "0x28", "0x29", "0x4B", "0x1F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRightTop"
                ]
            }
        },
        {
            "tiles": [ "0x0F", "0x0A", "0x4E", "0x1A" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labLeftBottom"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x0A", "0x1A", "0x1A" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labWallWindow5"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x1F", "0x1A", "0x4F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "labRightBottom"
                ]
            }
        },
        {
            "tiles": [ "0x0E", "0x0E", "0x55", "0x55" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "fence"
                ]
            }
        },
        {
            "tiles": [ "0x46", "0x47", "0x56", "0x57" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "sign"
                ]
            }
        }
    ]
,

"map": {
    "width": 20,
    "height": 18,

    "ids": [
        1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 7, 7, 0, 1, 1, 1, 1, 1, 0, 1,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 1, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 1, 0,
        0, 1, 6, 5,14,15,15,16, 6, 5, 6, 5,14,15,15,16, 6, 5, 1, 0,
        0, 1, 4, 4,17,18,19,20, 5, 6, 4, 4,17,18,19,20, 5, 6, 1, 0,
        0, 1, 4,41,21,22,23,24, 6, 5, 4,41,21,22,23,24, 6, 5, 1, 0,
        0, 1, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 1, 0,
        0, 1, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 6, 5, 1, 0,
        0, 1, 5, 6, 4, 4, 4, 4, 5, 6,25,26,26,26,26,27, 5, 6, 1, 0,
        0, 1, 6, 5,40,40,40,41, 6, 5,28,29,29,29,29,30, 6, 5, 1, 0,
        0, 1, 5, 6, 2, 2, 2, 2, 5, 6,31,32,33,34,35,36, 5, 6, 1, 0,
        0, 1, 6, 5, 3, 3, 3, 3, 6, 5,37,38,22,38,38,39, 6, 5, 1, 0,
        0, 1, 5, 6, 5, 6, 5, 6, 5, 6, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
        0, 1, 6, 5, 6, 5, 6, 5, 6, 5,40,40,40,41,40,40, 4, 4, 1, 0,
        0, 1, 1, 1,11,12,12,13, 4, 4, 2, 2, 2, 2, 1, 1, 4, 4, 1, 0,
        0, 1, 1, 1, 9, 8, 8,10, 4, 4, 3, 3, 3, 3, 1, 1, 4, 4, 1, 0,
        0, 1, 1, 1, 9, 8, 8,10, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 0,
        0, 0, 1, 1, 9, 8, 8,10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]
,

    "voidSquare": 1,

    "connections": {
    "north": {
        "mapId": "route1",
        "offset": 0
    },
    "east": null,
    "south": null,
    "west": null
}
},

"objects": [
    {
        "name": "warpPalletToPlayerHouse",
        "kind": "warp",
        "x": 5, "y": 5,
        "sprite": { },
        "trigger": { "onStep": true },
        "walkThrough": true,
        "to": { "mapId": "playerHouse", "x": 2, "y": 7 },
        "transition": { "out": "gen1ToBlack", "in": "gen1FromBlack" },
        "sfx": "SFX_GO_INSIDE"
    }
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
