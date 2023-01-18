const config = {

  spriteSheet: '../chess2/chess2.png',

  URL: "https://benhub.io",
  path: "/chess2/socket.io",

  pixelSize: {
    width: Math.min(700, window.innerWidth),
    height: Math.min(700, window.innerWidth),
  },

  pieceToOffset: {
    'white_king': {x: 0, y: 0},
    'white_queen': {x: 1, y: 0},
    'white_bishop': {x: 2, y: 0},
    'white_knight': {x: 3, y: 0},
    'white_rook': {x: 4, y: 0},
    'white_pawn': {x: 5, y: 0},
    'white_knook': {x: 6, y: 0},
    'white_knishop': {x: 7, y: 0},
    'white_camel': {x: 8, y: 0},

    'black_king': {x: 0, y: 1},
    'black_queen': {x: 1, y: 1},
    'black_bishop': {x: 2, y: 1},
    'black_knight': {x: 3, y: 1},
    'black_rook': {x: 4, y: 1},
    'black_pawn': {x: 5, y: 1},
    'black_knook': {x: 6, y: 1},
    'black_knishop': {x: 7, y: 1},
    'black_camel': {x: 8, y: 1},
  },

  pieceToValue: (pieceType, isMinimax) => {
    const vals = {
      pawn: 1,
      camel: 2,
      knight: 3,
      bishop: 3,
      king: 4,
      rook: 5,
      knook: 8,
      knishop: 8,
      queen: 9,
    };
    if (isMinimax && pieceType == 'king') return 1000;
    return vals[pieceType];
  },
}

module.exports = {
  config,
};
