var playerHouse = {
    "mapName": "playerHouse",
    "schema": 1,

    "bgm": "",

    "tileset": {
    "image": "res/bg/tilesIndoorsA.png",
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
            "tiles": [ "0x24", "0x25", "0x34", "0x35" ],
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
            "tiles": [ "0x06", "0x07", "0x16", "0x17" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "tv"
                ]
            }
        },
        {
            "tiles": [ "0x26", "0x27", "0x36", "0x37" ],
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
            "tiles": [ "0x28", "0x29", "0x38", "0x39" ],
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
            "tiles": [ "0x2C", "0x2A", "0x3C", "0x3A" ],
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
            "tiles": [ "0x2A", "0x2B", "0x3A", "0x3B" ],
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
                    "shelfTop"
                ]
            }
        },
        {
            "tiles": [ "0x22", "0x23", "0x32", "0x33" ],
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
            "tiles": [ "0x0C", "0x0D", "0x1C", "0x1D" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "stairsUp"
                ]
            }
        },
        {
            "tiles": [ "0x0A", "0x0B", "0x1A", "0x1B" ],
            "collision": {
                "solid": false,
                "ledge": null,
                "surface": "normal",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "stairsDown"
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
                    "exitRug"
                ]
            }
        }
    ]
,

"map": {
    "width": 8,
    "height": 8,

    "ids": [
        10, 10, 2, 4, 2, 4, 2, 4,
        11, 11, 1, 5, 1, 1, 1, 12,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 3, 6, 7, 3, 1, 1,
        1, 1, 3, 8, 9, 3, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 14, 14, 1, 1, 1, 1
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
