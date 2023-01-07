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
    // TODO: update the just-connected client with session data that may exist
    // eg:
    // socket.emit('receiveAction', {
    //   type: 'ADD_LINES',
    //   lines: session.lines,
    // });

    socket.on('dispatch', (action) => {
      if (action == null) {
        return;
      }
      // console.log('client: ' + clientID + ' dispatches ' + action.type);
      // TODO: implement pass-through actions from one client to the rest in the session
      switch (action.type) {
        case 'ADD_LINES': {
          const {lines} = action;
          session.lines.push(...lines); // for actions that need to save state to the server
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
