const {getPieceAtPosition, getPieceByID} = require('./selectors');
const {getLegalMoves, insideBoard} = require('./moves');
const {deepCopy} = require('bens_utils').helpers;
const {gameReducer} = require('../reducers/gameReducer');

function minimax(game, moveHistory, depth, alpha, beta, isMaximizingPlayer) {
    // base case: reach the leaf node or maximum depth
    if (depth === 0 || isGameOver(game, moveHistory)) {
        return {score: evaluate(game, moveHistory), move: moveHistory[0]};
    }

    if (isMaximizingPlayer) {
      let bestValue = -Infinity;
      let bestMove = null;
      for (let move of possibleMoves(game, moveHistory)) {
        const result = minimax(game, [...moveHistory, move], depth - 1, alpha, beta, false);
        if (result.score > bestValue) {
          bestValue = result.score;
          bestMove = result.move;
        } else if (result.score == bestValue && Math.random() < 0.6) {
          bestValue = result.score;
          bestMove = result.move;
        }
        alpha = Math.max(alpha, bestValue);
        if (beta <= alpha) {
          break;
        }
      }
      return {score: bestValue, move: bestMove};
    } else {
      let bestValue = Infinity;
      let bestMove = null;
      for (let move of possibleMoves(game, moveHistory)) {
        const result = minimax(game, [...moveHistory, move], depth - 1, alpha, beta, true);
        if (result.score < bestValue) {
          bestValue = result.score;
          bestMove = result.move;
        } else if (result.score == bestValue && Math.random() < 0.6) {
          bestValue = result.score;
          bestMove = result.move;
        }
        beta = Math.min(beta, bestValue);
        if (beta <= alpha) {
          break;
        }
      }
      return {score: bestValue, move: bestMove};
    }
}

const evaluate = (game, moveHistory) => {
  const gameCopy = applyMoves(game, moveHistory);
  let score = 0;
  // lost:

  // material:
  score += gameCopy.colorValues.white - gameCopy.colorValues.black;

  // activity:

  return score;
};

const isGameOver = (game, moveHistory) => {
  return false;
};

const possibleMoves = (game, moveHistory) => {
  // which color is moving
  let color = 'white';
  let gameCopy = game;
  if (moveHistory.length > 0) {
    const lastMovedPiece = getPieceByID(game, moveHistory[moveHistory.length - 1].id);
    if (lastMovedPiece.color == 'white') {
      color = 'black';
    }
    gameCopy = applyMoves(game, moveHistory);
  } else if (game.moveHistory.length > 0) {
    const lastMovedPiece = getPieceByID(game, game.moveHistory[game.moveHistory.length - 1].id);
    if (lastMovedPiece.color == 'white') {
      color = 'black';
    }
  }

  let allPossibleMoves = [];
  for (const piece of gameCopy.pieces) {
    if (piece.color != color) continue;
    if (!insideBoard(gameCopy, piece.position)) continue;
    allPossibleMoves = allPossibleMoves.concat(
      getLegalMoves(gameCopy, piece).map(position => {
        return {type: 'MOVE_PIECE', id: piece.id, position, fromServer: true};
      })
    );
  }
  return allPossibleMoves;
};

const applyMoves = (game, moveHistory) => {
  let gameCopy = deepCopy(game);
  for (const move of moveHistory) {
    gameCopy = gameReducer(gameCopy, move);
  }
  return gameCopy;
};

const getColorOfNextMove = (game, moveHistory) => {
  // which color is moving
  let color = 'white';
  let gameCopy = game;
  if (moveHistory.length > 0) {
    const lastMovedPiece = getPieceByID(game, moveHistory[moveHistory.length - 1].id);
    if (lastMovedPiece.color == 'white') {
      color = 'black';
    }
  } else if (game.moveHistory.length > 0) {
    const lastMovedPiece = getPieceByID(game, game.moveHistory[game.moveHistory.length - 1].id);
    if (lastMovedPiece.color == 'white') {
      color = 'black';
    }
  }
  return color;
}



module.exports = {
  minimax,
  possibleMoves,
  getColorOfNextMove,
};
