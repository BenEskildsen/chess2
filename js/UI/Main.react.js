const React = require('react');
const {Button, Modal} = require('bens_ui_components');
const Game = require('./Game.react');
const {useEnhancedReducer} = require('bens_ui_components');
const {rootReducer} = require('../reducers/rootReducer');
const {setupSocket} = require('../clientToServer');
const {useEffect, useState, useMemo} = React;
// const Lobby = require('./Lobby.react');


function Main(props) {
  const [state, dispatch, getState] = useEnhancedReducer(
    rootReducer, {screen: 'LOBBY'},
  );
  window.getState = getState;

  // mutliplayer
  useEffect(() => {
    setupSocket(dispatch);
  }, []);

  let content = null;
  if (state.screen === 'LOBBY') {
    content = <Lobby dispatch={dispatch} />
  } else if (state.screen === 'GAME') {
    content = <Game dispatch={dispatch} state={state} getState={getState} />
  }

  return (
    <React.Fragment>
      {content}
      {state.modal}
    </React.Fragment>
  )
}

function Lobby(props) {
  const {dispatch} = props;
  return (
    <div
      style={{
        width: 300,
        margin: 'auto',
        marginTop: 150,
      }}
    >
      <Button
        label="Play"
        style={{
          width: 300,
          height: 30,
        }}
        onClick={() => {
          dispatch({type: 'START', screen: 'GAME'});
        }}
      />
    </div>
  );
}


module.exports = Main;
