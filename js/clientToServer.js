
/**
 * Socket.io functions
 */
let socket = null;
const setupSocket = (dispatch) => {
  socket = io();
  socket.on('receiveAction', (action) => {
    // console.log("received", action);
    dispatch(action);
  });
  return socket;
}

const dispatchToServer = (action) => {
  try {
    socket.emit('dispatch', action);
  } catch (e) {
    console.log(e);
  }
};


module.exports = {
  dispatchToServer,
  setupSocket,
};
