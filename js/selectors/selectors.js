
const {equals} = require('bens_utils').vectors;

const getPieceByID = (game, id) => {
  for (const piece of game.pieces) {
    if (piece.id == id) return piece;
  }
  return null;
}

const getPieceAtPosition = (game, position) => {
  for (const piece of game.pieces) {
    if (equals(piece.position, position)) return piece;
  }
  return null;
}


module.exports = {
  getPieceByID,
  getPieceAtPosition,
}
