
const {getDeploymentPiece} = require('../selectors/selectors');

const deployPawns = (dispatch, getState, color) => {
  let game = getState().game;
  let y = color == 'black' ? 1 : 6;
  for (let x = 0; x < game.boardSize.width; x++) {
    game = getState().game;
    const deploymentPawn = getDeploymentPiece(game, color, 'pawn');
    dispatch({
      type: 'MOVE_PIECE', local: true,
      id: deploymentPawn.id,
      position: game.boardToGrid({x, y}),
    });
  }
}


module.exports = {
  deployPawns,
};
