var route1 = {
    "mapName": "route1",
    "schema": 1,

    "bgm": "res/bgm/13 Route 1.mp3",

    "tileset": {
    "image": "res/bg/tilesOutdoorA.png",
    "tileWidth": 8,
    "tileHeight": 8,
    "columns": 16,
    "animations": {}
}
,

    "squares": [
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
                    "grassFlowerA"
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
                    "grassFlowerB"
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
            "tiles": [ "0x39", "0x39", "0x39", "0x39" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "shortGrass"
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
                    "lightGrass"
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
            "tiles": [ "0x2C", "0x2C", "0x36", "0x37" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeA"
                ]
            }
        },
        {
            "tiles": [ "0x2C", "0x2C", "0x37", "0x37" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeB"
                ]
            }
        },
        {
            "tiles": [ "0x2C", "0x2C", "0x3C", "0x3C" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeStairs"
                ]
            }
        },
        {
            "tiles": [ "0x2C", "0x2C", "0x37", "0x34" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeC"
                ]
            }
        },
        {
            "tiles": [ "0x40", "0x41", "0x50", "0x51" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tree"
                ]
            }
        },
        {
            "tiles": [ "0x2A", "0x2B", "0x3A", "0x3B" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tree"
                ]
            }
        },
        {
            "tiles": [ "0x39", "0x39", "0x36", "0x37" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeA"
                ]
            }
        },
        {
            "tiles": [ "0x39", "0x39", "0x37", "0x37" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeB"
                ]
            }
        },
        {
            "tiles": [ "0x39", "0x39", "0x37", "0x34" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeC"
                ]
            }
        },
        {
            "tiles": [ "0x46", "0x47", "0x56", "0x57" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "solid",
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
    "height": 36,

    "ids": [
        0, 0, 0,12, 0, 0, 0, 0, 0,12, 4, 4,12, 0, 0, 0, 0, 0,12, 0,
        0, 0, 0,12,12,12,12,12,12,12, 4, 4,12,12,12,12,12,12,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 1, 1,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 2, 2,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 0,11, 4, 4, 4, 4, 4, 4, 4, 4,12, 0,
        0, 0, 0,12, 8, 8, 8, 8, 8,11,14,14,14,15, 4, 4, 4, 4,12, 0,
        0, 0, 0,11, 1, 1, 1, 1, 0,11, 3, 3, 3, 3, 3, 3, 3, 3,11, 0,
        0, 0, 0,11, 2, 2, 2, 2, 0,11, 3, 3, 3, 3, 3, 3, 3, 3,11, 0,
        0, 0, 0,11, 0, 0, 0, 0, 0,11, 3, 3, 3, 3, 3, 3, 3, 3,11, 0,
        0, 0, 0,11, 8, 8, 8, 8, 8,11, 3, 3, 3, 3, 3, 3, 3, 3,11, 0,
        0, 0, 0,11, 0, 0, 1, 1, 1, 1, 0, 0, 4, 4, 4, 4, 4, 4,11, 0,
        0, 0, 0,11, 0, 0, 2, 2, 2, 2, 0, 0, 4, 4, 4, 4, 4, 4,11, 0,
        0, 0, 0,11, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 3, 3, 3, 3,11, 0,
        0, 0, 0,11,11,11, 8, 8, 8, 8,11,11,11,11, 3, 3, 3, 3,11, 0,
        0, 0, 0,12, 0, 0, 0, 0, 1, 1, 1, 1, 4, 4, 3, 3, 3, 3,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 2, 2, 2, 2, 4, 4, 3, 3, 3, 3,12, 0,
        0, 0, 0,12, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1,12, 0,
        0, 0, 0,12, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2,12, 0,
        0, 0, 0,12, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,12, 0,
        0, 0, 0,12,10, 9,13,14,10, 9, 7, 8, 8, 8, 8, 8, 8, 8,12, 0,
        0, 0, 0,12, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,12, 0,
        0, 0, 0,12, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 4, 4,12, 0,
        0, 0, 0,12,11,11,11,11,11,11,11,11, 3, 3, 3, 3,13,14,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 1, 1, 1, 1, 3, 3, 3, 3, 4, 4,12, 0,
        0, 0, 0,12, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4,12, 0,
        0, 0, 0,12, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,12, 0,
        0, 0, 0,12,14,15, 4, 4, 4,16,13,14,14,14,14,14,14,14,12, 0,
        0, 0, 0,11, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3,11, 0,
        0, 0, 0,11, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 3, 3, 3, 3,11, 0,
        0, 0, 0,11, 3, 3, 3, 3, 1, 1, 0, 0, 3, 3, 3, 3, 1, 1,11, 0,
        0, 0, 0,11, 3, 3, 3, 3, 2, 2, 0, 0, 3, 3, 3, 3, 2, 2,11, 0,
        0, 0, 0,11,12,12,12,12,12,12, 3, 3,12,12,12,12,12,12,11, 0,
        0, 0, 0,11, 0, 0, 0, 0, 0,12, 3, 3,12, 0, 0, 0, 0, 0,11, 0,
        0, 0, 0,11, 0, 0, 0, 0, 0,12, 3, 3,12, 0, 0, 0, 0, 0,11, 0,
        0, 0, 0,11, 0, 0, 0, 0, 0,12, 3, 3,12, 0, 0, 0, 0, 0,11, 0
    ]
,

    "voidSquare": 0,

    "connections": {
    "north": null,
    "east": null,
    "south": {
        "mapId": "palletTown",
        "offset": 0
    },
    "west": null
}
},

"objects": [
    {
        "name": "route1Sign",
        "kind": "sign",
        "x": 9, "y": 27,
        "script": "SIGN_ROUTE1"
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