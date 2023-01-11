const config = {
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

    'black_king': {x: 0, y: 1},
    'black_queen': {x: 1, y: 1},
    'black_bishop': {x: 2, y: 1},
    'black_knight': {x: 3, y: 1},
    'black_rook': {x: 4, y: 1},
    'black_pawn': {x: 5, y: 1},
    'black_knook': {x: 6, y: 1},
    'black_knishop': {x: 7, y: 1},
  },

  pieceToValue: {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    knishop: 7,
    knook: 8,
    queen: 9,
    king: 4,
  },
}

module.exports = {
  config,
};
