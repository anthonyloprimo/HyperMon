var route1 = {
    "mapName": "route1",
    "schema": 1,

    "bgm": "",

    "tileset": {
    "image": "res/bg/tilesOutdoorA.png",
    "tileWidth": 8,
    "tileHeight": 8,
    "columns": 16,
    "animations": {
    }
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
                    "grassNone"
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
            "tiles": [ "0x39", "0x39", "0x36", "0x37" ],
            "collision": {
                "solid": true,
                "ledge": "S",
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "ledgeSouthL"
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
                    "ledgeSouth"
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
                    "ledgeSouthR"
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
                    "ledgeSouthLGrassy"
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
                    "ledgeSouthGrassy"
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
                    "ledgeSouthRGrassy"
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
                    "bollard"
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
    "height": 36,

    "ids": [
        0, 0, 0, 14, 0, 0, 0, 0, 0, 14, 3, 3, 14, 0, 0, 0, 0, 0, 14, 0,
        0, 0, 0, 14, 14, 14, 14, 14, 14, 14, 3, 3, 14, 14, 14, 14, 14, 14, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1, 1, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 2, 2, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 0, 13, 3, 3, 3, 3, 3, 3, 3, 3, 14, 0,
        0, 0, 0, 14, 11, 11, 11, 11, 11, 13, 8, 8, 8, 9, 3, 3, 3, 3, 14, 0,
        0, 0, 0, 13, 1, 1, 1, 1, 0, 13, 6, 6, 6, 6, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 2, 2, 2, 2, 0, 13, 6, 6, 6, 6, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 0, 0, 0, 0, 0, 13, 6, 6, 6, 6, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 11, 11, 11, 11, 11, 13, 6, 6, 6, 6, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 0, 0, 1, 1, 1, 1, 0, 0, 3, 3, 3, 3, 3, 3, 13, 0,
        0, 0, 0, 13, 0, 0, 2, 2, 2, 2, 0, 0, 3, 3, 3, 3, 3, 3, 13, 0,
        0, 0, 0, 13, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 13, 13, 11, 11, 11, 11, 13, 13, 13, 13, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 1, 1, 1, 1, 3, 3, 6, 6, 6, 6, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 6, 6, 6, 6, 14, 0,
        0, 0, 0, 14, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 14, 0,
        0, 0, 0, 14, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 14, 0,
        0, 0, 0, 14, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0,
        0, 0, 0, 14, 12, 15, 7, 8, 12, 15, 10, 11, 11, 11, 11, 11, 11, 11, 14, 0,
        0, 0, 0, 14, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 14, 0,
        0, 0, 0, 14, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 3, 3, 14, 0,
        0, 0, 0, 14, 13, 13, 13, 13, 13, 13, 13, 13, 6, 6, 6, 6, 7, 8, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 1, 1, 1, 1, 6, 6, 6, 6, 3, 3, 14, 0,
        0, 0, 0, 14, 0, 0, 0, 0, 2, 2, 2, 2, 6, 6, 6, 6, 3, 3, 14, 0,
        0, 0, 0, 14, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 14, 0,
        0, 0, 0, 14, 8, 9, 3, 3, 3, 16, 7, 8, 8, 8, 8, 8, 8, 8, 14, 0,
        0, 0, 0, 13, 0, 0, 6, 6, 6, 6, 3, 3, 0, 0, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 0, 0, 6, 6, 6, 6, 3, 3, 0, 0, 6, 6, 6, 6, 13, 0,
        0, 0, 0, 13, 6, 6, 6, 6, 1, 1, 3, 3, 6, 6, 6, 6, 1, 1, 13, 0,
        0, 0, 0, 13, 6, 6, 6, 6, 2, 2, 3, 3, 6, 6, 6, 6, 2, 2, 13, 0,
        0, 0, 0, 13, 14, 14, 14, 14, 14, 14, 6, 6, 14, 14, 14, 14, 14, 14, 13, 0,
        0, 0, 0, 13, 0, 0, 0, 0, 0, 14, 6, 6, 14, 0, 0, 0, 0, 0, 13, 0,
        0, 0, 0, 13, 0, 0, 0, 0, 0, 14, 6, 6, 14, 0, 0, 0, 0, 0, 13, 0,
        0, 0, 0, 13, 0, 0, 0, 0, 0, 14, 6, 6, 14, 0, 0, 0, 0, 0, 13, 0
    ]
,

    "voidSquare": 0,

    "connections": {
    "north": {
        "mapId": "viridianCity",
        "offset": 5
    },
    "east": null,
    "south": {
        "mapId": "palletTown",
        "offset": 0
    },
    "west": null
}
},

"objects": [],

"encounters": {
    "land": [],
    "water": [],
    "rodOld": [],
    "rodGood": [],
    "rodSuper": [],
    "zones": []
}
};
