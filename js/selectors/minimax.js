const {getPieceAtPosition, getPieceByID} = require('./selectors');
const {getLegalMoves, insideBoard} = require('./moves');
const {deepCopy} = require('bens_utils').helpers;
const {config} = require('../config');
const {gameReducer} = require('../reducers/gameReducer');

window.positionsEvaluated = 0;
function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
  // base case: reach the leaf node or maximum depth
  if (depth === 0 || isGameOver(game)) {
    window.positionsEvaluated++;
    return {
      score: evaluate(game),
      move: game.moveHistory[game.moveHistory.length - 1],
      continuation: null,
      // continuation: game.moveHistory.slice(
      //   game.moveHistory.length - game.aiDepth, game.moveHistory.length,
      // ).map(m => (deepCopy({...m, ...getPieceByID(game, m.id)}))),
    };
  }
  // let tabs = "\t".repeat(4-depth);

  if (isMaximizingPlayer) {
    let bestValue = -Infinity;
    let bestMove = null;
    let continuation = null;
    for (let move of possibleMoves(game)) {
      // let gameCopy = applyMoves(game, [move]);
      game = gameReducer(game, move);
      const result = minimax(game, depth - 1, alpha, beta, false);
      // console.log(tabs + move.id + " " + move.position.x + "," + move.position.y + " " +  result.score);
      if (result.score > bestValue) {
        bestValue = result.score;
        bestMove = move;
        continuation = result.continuation;
      } else if (result.score == bestValue && Math.random() < 0.1) {
        bestMove = move;
        continuation = result.continuation;
      }
      alpha = Math.max(alpha, bestValue);
      game = gameReducer(game, {type: 'UNDO', isMinimax: true});
      if (beta < alpha) {
        // console.log(tabs + alpha + " " + beta);
        break;
      }
    }
    return {score: bestValue, move: bestMove, continuation};
  } else {
    let bestValue = Infinity;
    let bestMove = null;
    let continuation = null;
    for (let move of possibleMoves(game)) {
      // let gameCopy = applyMoves(game, [move]);
      game = gameReducer(game, move);
      const result = minimax(game, depth - 1, alpha, beta, true);
      // console.log(tabs + move.id + " " + move.position.x + "," + move.position.y + " " +  result.score);
      if (result.score < bestValue) {
        bestValue = result.score;
        bestMove = move;
        continuation = result.continuation;
      } else if (result.score == bestValue && Math.random() < 0.1) {
        bestMove = move;
        continuation = result.continuation;
      }
      beta = Math.min(beta, bestValue);
      game = gameReducer(game, {type: 'UNDO', isMinimax: true});
      if (beta < alpha) {
        // console.log(tabs + alpha + " " + beta);
        break;
      }
    }
    return {score: bestValue, move: bestMove, continuation};
  }
}

const evaluate = (game) => {
  const color = getColorOfNextMove(game);
  let score = 0;
  // lost:

  // material:
  score += game.colorValues.white - game.colorValues.black;

  // activity:
  if (game.aiUseActivity) {
    let whiteActivity = 0;
    let blackActivity = 0;
    for (const piece of game.pieces) {
      if (!insideBoard(game, piece.position)) continue;
      if (piece.color != color) continue;
      if (piece.color == 'white') {
        whiteActivity += config.pieceToLocationValue(piece) / 100;
      }
      if (piece.color == 'black') {
        blackActivity += config.pieceToLocationValue(piece) / 100;
      }
    }

    score += whiteActivity - blackActivity;
  }

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


window.evaluate = evaluate;
window.possibleMoves = possibleMoves;


module.exports = {
  minimax,
  possibleMoves,
  getColorOfNextMove,
};
