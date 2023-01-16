const {getPieceAtPosition, getPieceByID} = require('./selectors');
const {getLegalMoves, insideBoard} = require('./moves');
const {deepCopy} = require('bens_utils').helpers;
const {gameReducer} = require('../reducers/gameReducer');

window.positionsEvaluated = 0;
function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
    // base case: reach the leaf node or maximum depth
    if (depth === 0 || isGameOver(game)) {
      window.positionsEvaluated++;
      return {score: evaluate(game), move: game.moveHistory[game.moveHistory.length - 1]};
    }
    // let tabs = "\t".repeat(4-depth);

    if (isMaximizingPlayer) {
      let bestValue = -Infinity;
      let bestMove = null;
      for (let move of possibleMoves(game)) {
        // let gameCopy = applyMoves(game, [move]);
        game = gameReducer(game, move);
        const result = minimax(game, depth - 1, alpha, beta, false);
        // console.log(tabs + move.id + " " + move.position.x + "," + move.position.y + " " +  result.score);
        if (result.score > bestValue) {
          bestValue = result.score;
          bestMove = move;
        } else if (result.score == bestValue && Math.random() < 0.1) {
          bestMove = move;
        }
        alpha = Math.max(alpha, bestValue);
        game = gameReducer(game, {type: 'UNDO', isMinimax: true});
        if (beta < alpha) {
          // console.log(tabs + alpha + " " + beta);
          break;
        }
      }
      return {score: bestValue, move: bestMove};
    } else {
      let bestValue = Infinity;
      let bestMove = null;
      for (let move of possibleMoves(game)) {
        // let gameCopy = applyMoves(game, [move]);
        game = gameReducer(game, move);
        const result = minimax(game, depth - 1, alpha, beta, true);
        // console.log(tabs + move.id + " " + move.position.x + "," + move.position.y + " " +  result.score);
        if (result.score < bestValue) {
          bestValue = result.score;
          bestMove = move;
        } else if (result.score == bestValue && Math.random() < 0.1) {
          bestMove = move;
        }
        beta = Math.min(beta, bestValue);
        game = gameReducer(game, {type: 'UNDO', isMinimax: true});
        if (beta < alpha) {
          // console.log(tabs + alpha + " " + beta);
          break;
        }
      }
      return {score: bestValue, move: bestMove};
    }
}

const evaluate = (game) => {
  let score = 0;
  // lost:

  // material:
  score += game.colorValues.white - game.colorValues.black;

  // activity:

  return score;
};

const isGameOver = (game) => {
  return false;
};

const possibleMoves = (game) => {
  // which color is moving
  const color = getColorOfNextMove(game);

  let allPossibleMoves = [];
  for (const piece of game.pieces) {
    if (piece.color != color) continue;
    if (!insideBoard(game, piece.position)) continue;
    allPossibleMoves = allPossibleMoves.concat(
      getLegalMoves(game, piece).map(position => {
        return {type: 'MOVE_PIECE', id: piece.id, position, isMinimax: true};
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

const getColorOfNextMove = (game) => {
  // which color is moving
  let color = 'white';
  if (game.moveHistory.length > 0) {
    const lastMovedPiece = getPieceByID(game, game.moveHistory[game.moveHistory.length - 1].id);
    if (lastMovedPiece?.color == 'white') {
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
