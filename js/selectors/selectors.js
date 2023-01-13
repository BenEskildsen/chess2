
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

const getDeploymentPiece = (game, color, type) => {
  let y = color == 'black' ? 0 : game.gridSize.height - 1;
  for (let x = 0; x < game.gridSize.width; x++) {
    const piece = getPieceAtPosition(game, {x, y});
    console.log(piece, piece.id);
    if (piece?.type == type) {
      return piece;
    }
  }
  return null;
}


module.exports = {
  getPieceByID,
  getPieceAtPosition,
  getDeploymentPiece,
}
