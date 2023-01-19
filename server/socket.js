const http = require('http');
const {Server} = require("socket.io");

// ------------------------------------------------------------------------------
// Socket initialization
// ------------------------------------------------------------------------------

// Use like:
// const server = initSocketServer(app);
// server.listen(PORT);
const initSocketServer = (expressApp) => {
  const server = http.createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: "https://www.benhub.io",
      methods: ["GET", "POST"],
    },
  });
  initIO(io);
  return server;
}

// ------------------------------------------------------------------------------
// Socket functions
// ------------------------------------------------------------------------------
const initIO = (io) => {
  const state = {
    sessions: {}, // SessionID -> {id: SessionID, clients: Array<ClientID>, }
    socketClients: {}, // clientID -> socket
    clientToSession: {}, // clientID -> SessionID
  };
  let nextClientID = 1;
  io.on('connection', (socket) => {
    const {sessions, socketClients, clientToSession} = state;
    // TODO: client should be able to store ID in localStorage and
    // update server with it
    const clientID = nextClientID;
    console.log("client connect", clientID);

    // on client connect
    socketClients[clientID] = socket;
    socket.emit('receiveAction', {clientID}); // NOTE: must use enhancedReducer
    // tell the client what sessions exist
    socket.emit('receiveAction', {sessions});


    socket.on('dispatch', (action) => {
      if (action == null) {
        return;
      }
      // console.log('client: ' + clientID + ' dispatches ' + action.type);
      switch (action.type) {

        // SESSION
        case 'CREATE_SESSION': {
          const {name} = action;
          let session = newSession(clientID);
          if (name) {
            session.name = name;
          }
          sessions[session.id] = session;
          clientToSession[clientID] = session.id;
          emitToAllClients(socketClients,
            {...action, session, clientID}, clientID, true /* includeSelf */
          );
          break;
        }
        case 'JOIN_SESSION': {
          const {sessionID} = action;
          const session = sessions[sessionID];

          session.clients.push(clientID);
          clientToSession[clientID] = session.id;

          socket.emit('receiveAction', {...action, clientID});
          // update the just-connected client with game data that may exist
          socket.emit('receiveAction',
            {type: 'SET_USE_MOVE_RULES', useMoveRules: session.useMoveRules},
          );
          for (const action of session.moveHistory) {
            socket.emit('receiveAction', action);
          }

          // tell the rest of the clients this one joined the session
          emitToAllClients(socketClients, {...action, clientID}, clientID);
          break;
        }
        case 'LEAVE_SESSION': {
          leaveSession(state, clientID);
          break;
        }
        case 'END_SESSION': {
          const {sessionID} = action;
          delete sessions[sessionID];
          for (const id in clientToSession) {
            if (clientToSession[id] == sessionID) {
              delete clientToSession[id];
            }
          }
          emitToAllClients(socketClients, action, clientID, true /* include self */);
          break;
        }

        // GAME
        case 'START': {
          const session = sessions[clientToSession[clientID]];
          session.moveHistory = [];
          emitToSession(session, socketClients, action, clientID);
          break;
        }
        case 'CREATE_PIECE':
        case 'MOVE_PIECE': {
          const session = sessions[clientToSession[clientID]];
          session.moveHistory.push(action);
          emitToSession(session, socketClients, action, clientID);
          break;
        }
        case 'UNDO': {
          const session = sessions[clientToSession[clientID]];
          session.moveHistory.pop();
          emitToSession(session, socketClients, action, clientID);
          break;
        }
        case 'SET_USE_MOVE_RULES': {
          const session = sessions[clientToSession[clientID]];
          const {useMoveRules} = action;
          session.useMoveRules = useMoveRules;
          emitToSession(session, socketClients, action, clientID);
          break;
        }
        default:
          const session = sessions[clientToSession[clientID]];
          emitToSession(session, socketClients, action, clientID);
      }
    });

    socket.on('disconnect', () => {
      console.log("user disconnected");
      leaveSession(state, clientID);
    });

    nextClientID++;
  });
}

const leaveSession = (state, clientID) => {
  const {sessions, socketClients, clientToSession} = state;
  const session = sessions[clientToSession[clientID]];
  if (!session) return;
  session.clients = session.clients.filter(id => id != clientID);
  emitToAllClients(socketClients,
    {type: 'UPDATE_SESSION', session}, clientID, true /* includeSelf */
  );
}

let nextSessionID = 1;
const newSession = (clientID) => {
  const id = nextSessionID++;
  return {
    id,
    name: "Game #" + id,
    clients: [clientID],
    moveHistory: [],
    useMoveRules: true,
  };
}

const emitToAllClients = (
  socketClients, action, clientID, includeSelf,
) => {
  for (const id in socketClients) {
    if (id == clientID && !includeSelf) continue;
    const socket = socketClients[id];
    socket.emit('receiveAction', action);
  }
};

const emitToSession = (
  session, socketClients,
  action, clientID, includeSelf,
) => {
  for (const id of session.clients) {
    if (id == clientID && !includeSelf) continue;
    const socket = socketClients[id];
    socket.emit('receiveAction', action);
  }
}

module.exports = {initSocketServer};
