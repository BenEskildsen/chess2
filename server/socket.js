const http = require('http');
const {Server} = require("socket.io");

// ------------------------------------------------------------------------------
// Socket initialization
// ------------------------------------------------------------------------------

// Use like:
// const server = initSocketServer(app);
// server.listen(PORT);
const SESSION_ID = 0; // placeholder until we start handling multiple sessions
const initSocketServer = (expressApp) => {
  // SessionID -> {id: SessionID, clients: Array<ClientID>, }
  const sessions = {
    [SESSION_ID]: {
      id: SESSION_ID,
      clients: [],
      moveHistory: [],
      useMoveRules: true,
    }
  };
  const socketClients = {};
  const clientToSession = {};

  const server = http.createServer(expressApp);
  const io = new Server(server);
  initIO(io, sessions, socketClients, clientToSession);
  return server;
}

// ------------------------------------------------------------------------------
// Socket functions
// ------------------------------------------------------------------------------
const initIO = (io, sessions, socketClients, clientToSession) => {
  let nextClientID = 1;
  io.on('connection', (socket) => {
    const clientID = nextClientID;
    console.log("client connect", clientID);

    // on client connect
    socketClients[clientID] = socket;
    clientToSession[clientID] = SESSION_ID; // TODO: how to assign
                                            // clients to sessions
    // tell the client what its id is NOTE: must be using enhancedReducer
    socket.emit('receiveAction', {clientID});

    // create the session if it doesn't exist
    const sessionID = clientToSession[clientID];
    if (!sessions[sessionID]) {
      sessions[sessionID] = {id: sessionID, clients: []};
    }
    const session = sessions[sessionID];
    session.clients.push(clientID);

    // update the just-connected client with session data that may exist
    socket.emit('receiveAction', {type: 'SET_USE_MOVE_RULES', useMoveRules: session.useMoveRules});
    for (const action of session.moveHistory) {
      socket.emit('receiveAction', action);
    }

    socket.on('dispatch', (action) => {
      if (action == null) {
        return;
      }
      // console.log('client: ' + clientID + ' dispatches ' + action.type);
      switch (action.type) {
        case 'CREATE_PIECE':
        case 'MOVE_PIECE': {
          session.moveHistory.push(action);
          emitToSession(sessions, socketClients, action, session.id, clientID);
          break;
        }
        case 'START': {
          session.moveHistory = [];
          emitToSession(sessions, socketClients, action, session.id, clientID);
          break;
        }
        case 'UNDO': {
          session.moveHistory.pop();
          emitToSession(sessions, socketClients, action, session.id, clientID);
          break;
        }
        case 'SET_USE_MOVE_RULES': {
          const {useMoveRules} = action;
          session.useMoveRules = useMoveRules;
          emitToSession(sessions, socketClients, action, session.id, clientID);
          break;
        }
        default:
          emitToSession(sessions, socketClients, action, session.id, clientID);
      }
    });

    socket.on('disconnect', () => {
      console.log("user disconnected");
    });

    nextClientID++;
  });
}


const emitToSession = (
  sessions, socketClients,
  action, sessionID, clientID, includeSelf,
) => {
  const session = sessions[sessionID];
  for (const id of session.clients) {
    if (id == clientID && !includeSelf) continue;
    const socket = socketClients[id];
    socket.emit('receiveAction', action);
  }
}

module.exports = {initSocketServer};
