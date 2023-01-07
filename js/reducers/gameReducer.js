// @flow

const {config} = require('../config');
const {clamp, subtractWithDeficit} = require('bens_utils').math;
const {
  getPieceByID, getPieceAtPosition,
} = require('../selectors');
const {randomIn, normalIn, oneOf, weightedOneOf} = require('bens_utils').stochastic;
const {dispatchToServer} = require('../clientToServer');


const gameReducer = (game, action) => {
  switch (action.type) {
    case 'MOVE_PIECE': {
      const {local, id, position} = action;
      if (local) {
        dispatchToServer({...action, local: false})
      }

      // check for capture
      const pieceAtPosition = getPieceAtPosition(game, position);
      if (pieceAtPosition && pieceAtPosition.id != id) {
        game = removePiece(game, pieceAtPosition);
      }

      const pieceToMove = getPieceByID(game, id);

      // check for deployment
      if (game.boardType == 'deployment') {
        if (
          pieceToMove.color == 'white' && pieceToMove.position.y == 11 ||
          pieceToMove.color == 'black' && pieceToMove.position.y == 0
        ) {
          addPiece(game, pieceToMove.color, pieceToMove.type, pieceToMove.position);
        }
      }

      pieceToMove.position = position;


      return game;
    }
  }
  return game;
}

const addPiece = (game, color, type, position) => {
  game.pieces = [...game.pieces, {id: game.nextPieceID, color, type, position: {...position}}];
  game.nextPieceID++;
}

const removePiece = (game, piece) => {
  const nextPieces = [];
  for (const p of game.pieces) {
    if (piece.id == p.id) continue;
    nextPieces.push(p);
  }
  // game.pieces = nextPieces;
  return {...game,
    pieces: [...nextPieces],
  };
}


module.exports = {gameReducer}
