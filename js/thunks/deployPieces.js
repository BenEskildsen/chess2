const {oneOf, weightedOneOf} = require('bens_utils').stochastic;
const {pieceToValue} = require('../config').config;
const {getPieceAtPosition} = require('../selectors/selectors');


const deployPawns = (dispatch, game, color) => {
  const y = color == 'black' ? 1 : 6;
  for (let x = 0; x < game.boardSize.width; x++) {
    game = getState().game;
    dispatch({
      type: 'CREATE_PIECE', color, pieceType: 'pawn',
      position: game.boardToGrid({x, y}),
    });
  }
};

const standardDeployment = (dispatch, game, color) => {
  const y = color == 'black' ? 0 : 7;
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'rook', position: game.boardToGrid({x: 0, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'knight', position: game.boardToGrid({x: 1, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'bishop', position: game.boardToGrid({x: 2, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'queen', position: game.boardToGrid({x: 3, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'king', position: game.boardToGrid({x: 4, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'bishop', position: game.boardToGrid({x: 5, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'knight', position: game.boardToGrid({x: 6, y})});
  dispatch({type: 'CREATE_PIECE', color, pieceType: 'rook', position: game.boardToGrid({x: 7, y})});
}

const randomDeployment = (dispatch, game, value, color) => {
  if (!color) {
    randomDeploymentByColor(dispatch, game, value, 'white');
    mirrorDeployment(dispatch, game, 'white');
  }
  randomDeploymentByColor(dispatch, game, value, color);
};

const randomDeploymentByColor = (dispatch, game, value, color) => {
  let valueRemaining = value - game.colorValues[color];

  // 2nd rank:
  let y = color == 'white' ? 6 : 1;
  for (let x = 0; x < game.boardSize.width; x++) {
    if (getPieceAtPosition(game, game.boardToGrid({x, y}))) continue;
    const pieceType = oneOf(['pawn', 'pawn', 'pawn', 'pawn', 'knight', 'bishop']);
    valueRemaining -= pieceToValue[pieceType];
    if (valueRemaining < 0) break;

    dispatch({type: 'CREATE_PIECE',
      color, pieceType, position: game.boardToGrid({x, y}),
    });
  }

  // back rank:
  y = color == 'white' ? 7 : 0;
  let placedKing = false;
  for (let x = 0; x < game.boardSize.width; x++) {
    if (getPieceAtPosition(game, game.boardToGrid({x, y}))) continue;
    const pieceType = choosePiece(valueRemaining, placedKing);
    if (pieceType == 'king') placedKing = true;
    valueRemaining -= pieceToValue[pieceType];
    if (valueRemaining < 0) break;

    dispatch({type: 'CREATE_PIECE',
      color, pieceType, position: game.boardToGrid({x, y}),
    });
  }
};

const choosePiece = (valueRemaining, placedKing) => {
  let possiblePieces = [];
  switch (valueRemaining) {
    case 1:
    case 2:
      possiblePieces.push('pawn');
      break;
    case 3:
      possiblePieces = possiblePieces.concat(['knight', 'knight', 'bishop']);
      break;
    case 4:
      possiblePieces = possiblePieces.concat(['knight', 'bishop', 'pawn', 'king']);
      break;
    case 5:
    case 6:
    case 7:
      possiblePieces = possiblePieces.concat(['knight', 'bishop', 'rook', 'king']);
      break;
    case 8:
      possiblePieces = possiblePieces.concat([
        'knight', 'bishop', 'rook', 'king',
        'knishop', 'knook',
      ]);
      break;
    default:
      possiblePieces = possiblePieces.concat([
        'knight', 'bishop', 'rook', 'king',
        'knishop', 'knook', 'queen',
      ]);
      break;
  }

  if (valueRemaining < 14 && !placedKing) {
    possiblePieces = ['king'];
  }

  possiblePieces = possiblePieces.filter(t => !placedKing || t != 'king');
  const weights = possiblePieces.map(p => pieceToValue[p]);

  return weightedOneOf(possiblePieces, weights);
}


const mirrorDeployment = (dispatch, game, color) => {
  for (const piece of game.pieces) {
    if (piece.color != color) continue;
    dispatch({
      type: 'CREATE_PIECE', color: color == 'white' ? 'black' : 'white', pieceType: piece.type,
      position: {
        x: piece.position.x,
        y: game.gridSize.height - piece.position.y - 1,
      },
    });
  }
};

module.exports = {
  deployPawns,
  randomDeployment,
  randomDeploymentByColor,
  mirrorDeployment,
  standardDeployment,
};
