
const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet, TextField,
  CheckerBackground,
} = require('bens_ui_components');
const {dispatchToServer} = require('../clientToServer');
const {useEffect, useState, useMemo} = React;

const Lobby = (props) => {
  const {dispatch, state, getState} = props;

  const sessionCards = [];
  for (const sessionID in state.sessions) {
    sessionCards.push(<SessionCard
      key={"sessionCard_" + sessionID}
      session={state.sessions[sessionID]}
    />);
  }

  return (
    <div
      style={{
        width: 300,
        margin: 'auto',
        marginTop: 100,
      }}
    >
      <CreateGameCard />
      {sessionCards}
    </div>
  );
};

const CreateGameCard = (props) => {
  const [name, setName] = useState('');
  return (
    <InfoCard
      style={{
        width: 300,
      }}
    >
      Game Name:&nbsp;
      <TextField
        value={name}
        onChange={setName}
      />
      <Button
        label="Create Game"
        style={{
          width: 300,
          height: 30,
          marginTop: 8,
        }}
        onClick={() => {
          dispatchToServer({type: 'CREATE_SESSION', name: name != '' ? name : null});
        }}
      />
    </InfoCard>
  );
}

const SessionCard = (props) => {
  const {session} = props;
  const {id, name, clients} = session;
  return (
    <InfoCard
      style={{
        width: 300,
      }}
    >
      <div style={{textAlign: 'center'}}><b>{name}</b></div>
      Players: {clients.length}
      <Button
        style={{
          width: 300,
          height: 30,
        }}
        label={"Join Game"}
        onClick={() => {
          dispatchToServer({type: 'JOIN_SESSION', sessionID: id});
        }}
      />
    </InfoCard>
  );
};

module.exports = Lobby;
