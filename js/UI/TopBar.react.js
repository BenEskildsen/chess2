
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
const {isHost, getSession} = require('../selectors/sessions');
const {useState, useMemo, useEffect, useReducer} = React;

const TopBar = (props) => {
  const {state, getState, dispatch, isRotated, setIsRotated} = props;
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
          style={{height: 50}}
          label="Options"
          onClick={() => dispatch({
            type: 'SET_MODAL',
            modal: <OptionsModal {...props} isRotated={isRotated} setIsRotated={setIsRotated} />
          })}
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

const OptionsModal = (props) => {
  const {state, getState, dispatch, isRotated, setIsRotated} = props;
  const {game} = state;

  let deleteGameButton = null;
  if (isHost(state)) {
    deleteGameButton = (
      <Button
        label="End (Delete) Game"
        style={{height: 50, width: '85%', marginBottom: 4}}
        onClick={() => {
          dispatch({type: 'DISMISS_MODAL'});
          dispatchToServer({type: 'END_SESSION', sessionID: getSession(state).id});
        }}
      />
    );
  }

  return <Modal
    title=""
    body={
      <div
        style={{textAlign: 'center'}}
      >
        <div style={{fontSize: 30}}><b>Options</b></div>
        <Button
          label="Rotate"
          style={{height: 50, width: '85%', marginBottom: 4}}
          onClick={() => {
            dispatch({type: 'DISMISS_MODAL'});
            setIsRotated(!isRotated);
          }}
        />
        <Button
          label={game.useMoveRules ? "Turn Off Rules" : "Turn On Rules"}
          style={{height: 50, width: '85%', marginBottom: 4}}
          onClick={() => {
            dispatch({type: 'DISMISS_MODAL'});
            const action = {type: 'SET_USE_MOVE_RULES', useMoveRules: !game.useMoveRules};
            dispatch(action);
            dispatchToServer(action);
          }}
        />
        <Button
          label="Restart"
          style={{height: 50, width: '85%', marginBottom: 4}}
          onClick={() => {
            dispatch({type: 'DISMISS_MODAL'});
            setIsRotated(false)
            const action = {type: 'START', screen: 'GAME'};
            dispatch(action);
            dispatchToServer(action);
          }}
        />
        {deleteGameButton}
        <Button
          label="Leave Game"
          style={{height: 50, width: '85%', marginBottom: 4}}
          onClick={() => {
            dispatch({type: 'DISMISS_MODAL'});
            dispatch({screen: 'LOBBY'});
            dispatchToServer({type: 'LEAVE_SESSION'});
          }}
        />
        <Button
          label="Back to Game"
          style={{height: 50, width: '85%', marginTop: 8}}
          onClick={() => {
            dispatch({type: 'DISMISS_MODAL'});
          }}
        />
      </div>
    }
    buttons={[]}
  />;
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
