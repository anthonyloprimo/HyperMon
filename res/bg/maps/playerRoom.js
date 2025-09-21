var playerRoom = {
    "mapName": "playerRoom",
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
            "tiles": [ "0x0E", "0x0F", "0x1E", "0x1F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "snes"
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
            "tiles": [ "0x00", "0x00", "0x26", "0x27" ],
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
            "tiles": [ "0x00", "0x00", "0x27", "0x29" ],
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
                    "deskBL"
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
                    "deskBR"
                ]
            }
        },
        {
            "tiles": [ "0x40", "0x41", "0x20", "0x21" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "pcTop"
                ]
            }
        },
        {
            "tiles": [ "0x42", "0x43", "0x32", "0x33" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "pcBottom"
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
            "tiles": [ "0x2D", "0x2E", "0x3D", "0x3E" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "bedTop"
                ]
            }
        },
        {
            "tiles": [ "0x3D", "0x3E", "0x3F", "0x2F" ],
            "collision": {
                "solid": true,
                "ledge": null,
                "surface": "wall",
                "talkOver": false
            },
            "attributes": {
                "tags": [
                    "bedBottom"
                ]
            }
        },
        {
            "tiles": [ "0x44", "0x45", "0x08", "0x09" ],
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
            "tiles": [ "0x46", "0x47", "0x18", "0x19" ],
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
        10, 6, 7, 2, 2, 4, 2, 4,
        11, 8, 9, 1, 1, 1, 1, 12,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 5, 1, 1, 1, 1,
        1, 1, 1, 3, 1, 1, 1, 1,
        13, 1, 1, 1, 1, 1, 15, 1,
        14, 1, 1, 1, 1, 1, 16, 1
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
