
const {equals} = require('bens_utils').vectors;
const {getPieceAtPosition} = require('./selectors');
const {pieceToValue} = require('../config').config;

const isMoveInLegalMoves = (legalMoves, position) => {
  for (const pos of legalMoves) {
    if (equals(pos, position)) return true;
  }
  return false;
}

const isCapture = (game, position) => {
  const pieceAtPosition = getPieceAtPosition(game, position);
  if (!pieceAtPosition) return 0;
  return pieceToValue(pieceAtPosition.type, true);
}

function getLegalMoves(game, piece) {
  const {boardSize, gridSize} = game;
  const {color, type, position} = piece;
  let legalMoves = [];
  // handling deploying pieces
  if (!insideBoard(game, position)) {
    for (let x = 2; x < boardSize.width + 2; x++) {
      if (color == 'black') {
        legalMoves.push({x, y: type != 'pawn' ? 2 : 3});
        // legalMoves.push({x, y: 2});
        // legalMoves.push({x, y: 3});
      } else if (color == 'white') {
        legalMoves.push({x, y: type != 'pawn' ? 9 : 8});
        // legalMoves.push({x, y: 9});
        // legalMoves.push({x, y: 10});
      }
    }
    return legalMoves
      .filter(pos => getPieceAtPosition(game, pos)?.color != color);
  }
  const {x, y} = position;
  switch (type) {
    case 'pawn':
      if (y === 3 && color == 'black') {
        // Black pawn on its starting rank
        legalMoves = [{x, y: y + 1}, {x, y: y + 2}];
        if (getPieceAtPosition(game, legalMoves[0]) != null) {
          legalMoves = [];
        } else if (getPieceAtPosition(game, legalMoves[1]) != null) {
          legalMoves = [legalMoves[0]];
        }
      } else if (y === 8 && color == 'white') {
        // White pawn on its starting rank
        legalMoves = [{x, y: y - 1}, {x, y: y - 2}];
        if (getPieceAtPosition(game, legalMoves[0]) != null) {
          legalMoves = [];
        } else if (getPieceAtPosition(game, legalMoves[1]) != null) {
          legalMoves = [legalMoves[0]];
        }
      } else {
        // Pawn not on its starting rank
        legalMoves = [{x, y: y + (color == 'white' ? -1 : 1)}];
        if (getPieceAtPosition(game, legalMoves[0]) != null) legalMoves = [];
      }

      // captures
      if (color == 'white') {
        if (getPieceAtPosition(game, {x: x - 1, y: y - 1})?.color == 'black') {
          legalMoves.push({x: x - 1, y: y - 1});
        }
        if (getPieceAtPosition(game, {x: x + 1, y: y - 1})?.color == 'black') {
          legalMoves.push({x: x + 1, y: y - 1});
        }
      }

      if (color == 'black') {
        if (getPieceAtPosition(game, {x: x - 1, y: y + 1})?.color == 'white') {
          legalMoves.push({x: x - 1, y: y + 1});
        }
        if (getPieceAtPosition(game, {x: x + 1, y: y + 1})?.color == 'white') {
          legalMoves.push({x: x + 1, y: y + 1});
        }
      }
      break;
    case 'knight':
      legalMoves = getKnightMoves(game, x, y);
      break;
    case 'bishop':
      legalMoves = getBishopMoves(game, x, y);
      break;
    case 'rook':
      legalMoves = getRookMoves(game, x, y);
      break;
    case 'queen':
      legalMoves = getRookMoves(game, x, y)
        .concat(getBishopMoves(game, x, y));
      break;
    case 'knook':
      legalMoves = getRookMoves(game, x, y)
        .concat(getKnightMoves(game, x, y));
      break;
    case 'knishop':
      legalMoves = getBishopMoves(game, x, y)
        .concat(getKnightMoves(game, x, y));
      break;
    case 'king':
      legalMoves = [
        {x: x - 1, y: y - 1}, {x: x, y: y - 1}, {x: x + 1, y: y - 1}, {x: x - 1, y: y},
        {x: x + 1, y: y}, {x: x - 1, y: y + 1}, {x: x, y: y + 1}, {x: x + 1, y: y + 1},
      ];
      break;
    default:
      legalMoves = [];
  }
  return legalMoves
    .filter(pos => insideBoard(game, pos))
    .filter(pos => getPieceAtPosition(game, pos)?.color != color)
    // sort in descending order of move capture score
    .sort((moveA, moveB) => {
      return isCapture(game, moveB) - isCapture(game, moveA);
    });
}

const getBishopMoves = (game, x, y) => {
  return getMovesInDir(game, x, y, 1, 1)
    .concat(getMovesInDir(game, x, y, -1, -1))
    .concat(getMovesInDir(game, x, y, 1, -1))
    .concat(getMovesInDir(game, x, y, -1, 1));
};

const getKnightMoves = (game, x, y) => {
  return [
    {x: x - 1, y: y - 2}, {x: x + 1, y: y - 2}, {x: x - 2, y: y - 1}, {x: x + 2, y: y - 1},
    {x: x - 2, y: y + 1}, {x: x + 2, y: y + 1}, {x: x - 1, y: y + 2}, {x: x + 1, y: y + 2},
  ];
}

const getRookMoves = (game, x, y) => {
  return getMovesInDir(game, x, y, 0, 1)
    .concat(getMovesInDir(game, x, y, 0, -1))
    .concat(getMovesInDir(game, x, y, 1, 0))
    .concat(getMovesInDir(game, x, y, -1, 0));
}

const insideBoard = (game, position) => {
  const {boardSize} = game;
  const {x, y} = game.gridToBoard(position);
  const {width, height} = boardSize;
  return x >= 0 && x < width && y >= 0 && y < height;
}

// Returns an array of positions (in the form of [x, y] pairs) i
// that the piece could move to in a given direction
function getMovesInDir(game, x, y, dx, dy) {
  const {boardSize} = game;
  const {width, height} = boardSize;
  const moves = [];
  const position = {
    x: x + dx,
    y: y + dy,
  }
  while (insideBoard(game, position)) {
    let shouldBreak = false;
    if (getPieceAtPosition(game, position) != null) {
      shouldBreak = true;
    }
    moves.push({...position});
    position.x += dx;
    position.y += dy;
    if (shouldBreak) break;
  }
  return moves;
}


module.exports = {
  isMoveInLegalMoves,
  getLegalMoves,
  insideBoard,
}
