
const React = require('react');
const {oneOf} = require('bens_utils').stochastic;
const {deepCopy} = require('bens_utils').helpers;
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet,
  CheckerBackground, Slider,
} = require('bens_ui_components');
const {
  getPieceByID, getPieceAtPosition,
} = require('../selectors/selectors');
const {
  getLegalMoves, isMoveInLegalMoves,
} = require('../selectors/moves');
const {dispatchToServer, setupSocket} = require('../clientToServer');
const {config} = require('../config');
const {
  deployPawns,
  randomDeployment,
  mirrorDeployment,
  standardDeployment,
} = require('../thunks/deployPieces');
const {
  possibleMoves, minimax, getColorOfNextMove,
} = require('../selectors/minimax');
const {useState, useMemo, useEffect, useReducer} = React;

const TopBar = (props) => {
  const {state, getState, dispatch} = props;
  const {game} = getState();

  return (
    <div
      style={{
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          label="Restart"
          style={{height: 50}}
          onClick={() => {
            const action = {type: 'START', screen: 'GAME'};
            dispatch(action);
            dispatchToServer(action);
          }}
        />
        <Button
          label="Undo Move"
          style={{height: 50}}
          onClick={() => {
            const action = {type: 'UNDO'};
            dispatch(action);
            dispatchToServer(action);
          }}
        />
        <Button
          label={game.useMoveRules ? "Turn Off Rules" : "Turn On Rules"}
          style={{height: 50}}
          onClick={() => {
            const action = {type: 'SET_USE_MOVE_RULES', useMoveRules: !game.useMoveRules};
            dispatch(action);
            dispatchToServer(action);
          }}
        />
        <Button
          label="AI Move"
          style={{height: 50}}
          onClick={() => {
            // random move:
            // const moves = possibleMoves(game, []);
            // dispatch(oneOf(moves));

            const startTime = Date.now();
            const {score, move} = minimax(deepCopy(game), 4, -Infinity, Infinity,
              getColorOfNextMove(game) == 'white',
            );
            // console.log(score, move);
            const totalTime = Date.now() - startTime;
            console.log(
              "positions evaluated", window.positionsEvaluated,
              "in " + (totalTime / 1000).toFixed(3) + " seconds"
            );
            window.positionsEvaluated = 0;
            dispatch({...move, isMinimax: false});
          }}
        />
        <div>
          &nbsp; White Score: {game.colorValues['white']}
        </div><div>
          &nbsp; Black Score: {game.colorValues['black']}
        </div>
      </div>
      <DeploymentBar {...props} />
    </div>
  );
}

const DeploymentBar = (props) => {
  const {state, getState, dispatch} = props;
  const {game} = state;

  const [showDeployment, setShowDeployment] = useState(false);
  const [value, setValue] = useState(43);

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Button
        label={showDeployment ? '<' : '>'}
        style={{height: 50}}
        onClick={() => setShowDeployment(!showDeployment)}
      />
      <div
        style={{
          display: showDeployment ? 'inline-block' : 'none',
        }}
      >
      <Button
        label="Pawns"
        style={{height: 50}}
        onClick={() => {
          deployPawns(dispatch, game, 'white');
          deployPawns(dispatch, game, 'black');
        }}
      />
      <Button
        label="Standard"
        style={{height: 50}}
        onClick={() => {
          deployPawns(dispatch, game, 'white');
          deployPawns(dispatch, game, 'black');
          standardDeployment(dispatch, game, 'white');
          standardDeployment(dispatch, game, 'black');
        }}
      />
      <Button
        label="Mirror White"
        style={{height: 50}}
        onClick={() => {
          mirrorDeployment(dispatch, game, 'white');
        }}
      />
      <Button
        label="Random White"
        style={{height: 50}}
        onClick={() => {
          randomDeployment(dispatch, game, value, 'white');
        }}
      />
      <Button
        label="Random Black"
        style={{height: 50}}
        onClick={() => {
          randomDeployment(dispatch, game, value, 'black');
        }}
      />
      <Slider
        min={1} max={100}
        value={value} onChange={setValue}
        label="Total Allowed Piece Value Per Side"
      />
      </div>
    </div>
  );
}

module.exports = TopBar;
