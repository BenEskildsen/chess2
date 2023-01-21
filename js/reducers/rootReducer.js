
const {gameReducer} = require('./gameReducer');
const {modalReducer} = require('./modalReducer');
const {config} = require('../config');
const {getSession} = require('../selectors/sessions');
const {deepCopy} = require('bens_utils').helpers;

const rootReducer = (state, action) => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'CREATE_SESSION': {
      const {clientID, session} = action;
      if (clientID != state.clientID) {
        return {
          ...state,
          sessions: {...state.sessions, [session.id]: {...session}},
        };
      }
      return {
        ...state,
        sessions: {...state.sessions, [session.id]: session},
        screen: "GAME",
        game: {
          ...initGameState(),
        }
      };
    }
    case 'JOIN_SESSION': {
      const {sessionID, clientID} = action;
      const session = state.sessions[sessionID];
      session.clients.push(clientID);
      if (clientID != state.clientID) {
        return {
          ...state,
          sessions: {...state.sessions, [sessionID]: {...session}},
        };
      }
      return {
        ...state,
        sessions: {...state.sessions, [sessionID]: {...session}},
        screen: 'GAME',
        game: {
          ...initGameState(),
        }
      };
    }
    case 'UPDATE_SESSION': {
      const {session} = action;
      return {
        ...state,
        sessions: {...state.sessions, [session.id]: {...session}},
      };
    }
    case 'END_SESSION': {
      const {sessionID} = action;
      if (getSession(state)?.id == sessionID) {
        state.screen = 'LOBBY';
        state.game = null;
        state.modal = null;
      }
      delete state.sessions[sessionID];
      return {...state};
    }
    case 'START': {
      const {screen} = action;
      const useMoveRules = state?.game?.useMoveRules;
      return {
        ...state,
        screen,
        game: {
          ...initGameState(),
          useMoveRules: useMoveRules != null ? useMoveRules : true,
        }
      };
    }
    case 'SET_SCREEN': {
      const {screen} = action;
      const nextState = {...state, screen};
      if (screen == 'LOBBY') {
        nextState.game = null;
      }
      return nextState;
    }
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'UNDO':
    case 'SET':
    case 'SET_LEGAL_MOVES':
    case 'SET_USE_MOVE_RULES':
    case 'CREATE_PIECE':
    case 'MOVE_PIECE': {
      if (!state.game) return state;
      return {
        ...state,
        game: gameReducer(state.game, action),
      };
    }
  }
  return state;
};


//////////////////////////////////////
// Initializations
const initState = () => {
  return {
    screen: 'LOBBY',
    game: null,
  };
}

const initGameState = () => {
  const game = {
    ...deploymentBoard(),
    // ...regularBoard(),
    legalMoves: [],
    moveHistory: [],
    prevPiecePosition: null, // location of the piece that just moved
    colorValues: {black: 0, white: 0},
    useMoveRules: true,
    aiDepth: 4,
    aiUseActivity: true,
    aiFuzzing: 0,
    automaticallyPlayAs: null,
  };

  return game;
}

const deploymentBoard = () => {
  let pieceID = 1;
  return {
    boardType: 'deployment',
    boardSize: {width: 8, height: 8},
    gridToBoard: (gridPos) => {return ({x: gridPos.x - 2, y: gridPos.y - 2})},
    boardToGrid: (boardPos) => {return ({x: boardPos.x + 2, y: boardPos.y + 2})},
    gridSize: {width: 12, height: 12},
    pieces: [
      {color: 'white', type: 'rook', position: {x: 0, y: 11}, id: pieceID++},
      {color: 'white', type: 'knight', position: {x: 1, y: 11}, id: pieceID++},
      {color: 'white', type: 'bishop', position: {x: 2, y: 11}, id: pieceID++},
      {color: 'white', type: 'queen', position: {x: 3, y: 11}, id: pieceID++},
      {color: 'white', type: 'king', position: {x: 4, y: 11}, id: pieceID++},
      {color: 'white', type: 'knook', position: {x: 5, y: 11}, id: pieceID++},
      {color: 'white', type: 'knishop', position: {x: 6, y: 11}, id: pieceID++},
      {color: 'white', type: 'camel', position: {x: 7, y: 11}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 8, y: 11}, id: pieceID++},
      {color: 'white', type: 'amazon', position: {x: 9, y: 11}, id: pieceID++},

      {color: 'black', type: 'rook', position: {x: 0, y: 0}, id: pieceID++},
      {color: 'black', type: 'knight', position: {x: 1, y: 0}, id: pieceID++},
      {color: 'black', type: 'bishop', position: {x: 2, y: 0}, id: pieceID++},
      {color: 'black', type: 'queen', position: {x: 3, y: 0}, id: pieceID++},
      {color: 'black', type: 'king', position: {x: 4, y: 0}, id: pieceID++},
      {color: 'black', type: 'knook', position: {x: 5, y: 0}, id: pieceID++},
      {color: 'black', type: 'knishop', position: {x: 6, y: 0}, id: pieceID++},
      {color: 'black', type: 'camel', position: {x: 7, y: 0}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 8, y: 0}, id: pieceID++},
      {color: 'black', type: 'amazon', position: {x: 9, y: 0}, id: pieceID++},

      // {color: 'white', type: 'pawn', position: {x: 2, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 3, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 4, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 5, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 6, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 7, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 8, y: 8}, id: pieceID++},
      // {color: 'white', type: 'pawn', position: {x: 9, y: 8}, id: pieceID++},

      // {color: 'black', type: 'pawn', position: {x: 2, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 3, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 4, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 5, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 6, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 7, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 8, y: 3}, id: pieceID++},
      // {color: 'black', type: 'pawn', position: {x: 9, y: 3}, id: pieceID++},
    ],
    nextPieceID: pieceID,
  }
}

const regularBoard = () => {
  let pieceID = 1;
  return {
    boardType: 'regular',
    gridSize: {width: 8, height: 8},
    boardSize: {width: 8, height: 8},
    gridToBoard: (gridPos) => gridPos,
    boardToGrid: (boardPos) => boardPos,
    pieces: [
      {color: 'white', type: 'rook', position: {x: 0, y: 7}, id: pieceID++},
      {color: 'white', type: 'knight', position: {x: 1, y: 7}, id: pieceID++},
      {color: 'white', type: 'bishop', position: {x: 2, y: 7}, id: pieceID++},
      {color: 'white', type: 'queen', position: {x: 3, y: 7}, id: pieceID++},
      {color: 'white', type: 'king', position: {x: 4, y: 7}, id: pieceID++},
      {color: 'white', type: 'bishop', position: {x: 5, y: 7}, id: pieceID++},
      {color: 'white', type: 'knight', position: {x: 6, y: 7}, id: pieceID++},
      {color: 'white', type: 'rook', position: {x: 7, y: 7}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 0, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 1, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 2, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 3, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 4, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 5, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 6, y: 6}, id: pieceID++},
      {color: 'white', type: 'pawn', position: {x: 7, y: 6}, id: pieceID++},

      {color: 'black', type: 'rook', position: {x: 0, y: 0}, id: pieceID++},
      {color: 'black', type: 'knight', position: {x: 1, y: 0}, id: pieceID++},
      {color: 'black', type: 'bishop', position: {x: 2, y: 0}, id: pieceID++},
      {color: 'black', type: 'queen', position: {x: 3, y: 0}, id: pieceID++},
      {color: 'black', type: 'king', position: {x: 4, y: 0}, id: pieceID++},
      {color: 'black', type: 'bishop', position: {x: 5, y: 0}, id: pieceID++},
      {color: 'black', type: 'knight', position: {x: 6, y: 0}, id: pieceID++},
      {color: 'black', type: 'rook', position: {x: 7, y: 0}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 0, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 1, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 2, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 3, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 4, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 5, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 6, y: 1}, id: pieceID++},
      {color: 'black', type: 'pawn', position: {x: 7, y: 1}, id: pieceID++},
    ],
    nextPieceID: pieceID,
  }
}

module.exports = {rootReducer};
