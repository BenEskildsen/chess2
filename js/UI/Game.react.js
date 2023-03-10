const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet,
  CheckerBackground,
} = require('bens_ui_components');
const TopBar = require('./TopBar.react');
const {
  getPieceByID, getPieceAtPosition,
} = require('../selectors/selectors');
const {
  getLegalMoves, isMoveInLegalMoves,
} = require('../selectors/moves');
const {dispatchToServer, setupSocket} = require('../clientToServer');
const {config} = require('../config');
const {deployPawns} = require('../thunks/deployPieces');
import postVisit from '../postVisit';
const {useState, useMemo, useEffect, useReducer} = React;

function Game(props) {
  const {state, dispatch, getState} = props;
  const game = state.game;

  useEffect(() => {
    postVisit('/game', 'GET');
  }, []);

  const [isRotated, setIsRotated] = useState(false);
  // HACK: I can't figure out how to get the eventHandlers in Board to know about isRotated
  window.isRotated = isRotated;

  const background = useMemo(() => {
    return game.boardType == 'deployment' ? <DeploymentBoard game={game} /> : null;
  }, [game.boardType, game.legalMoves.length, game.moveHistory.length, isRotated]);

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'lightgrey',
        flexDirection: 'column',
      }}
    >
      <TopBar isRotated={isRotated} setIsRotated={setIsRotated} {...props} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Board
          background={background}
          pixelSize={config.pixelSize}
          gridSize={game.gridSize}
          onPieceMove={(id, pos) => {
            const game = getState().game;
            const position = rotateCoord(pos, game.gridSize);
            dispatch({type: 'MOVE_PIECE', id, position});
            dispatch({type: 'SET_LEGAL_MOVES', legalMoves: []});
          }}
          onMoveCancel={(id) => {
            setTimeout(() => dispatch({type: 'SET_LEGAL_MOVES', legalMoves: []}));
          }}
          onPiecePickup={(id, pos) => {
            const game = getState().game;
            const position = rotateCoord(pos, game.gridSize);
            const piece = getPieceByID(game, id);
            dispatch({type: 'SET_LEGAL_MOVES', legalMoves: getLegalMoves(game, piece)});
          }}
          isMoveAllowed={(id, pos) => {
            const game = getState().game;
            const position = rotateCoord(pos, game.gridSize);
            const piece = getPieceByID(game, id);
            const pieceAtPosition = getPieceAtPosition(game, position);

            if (pieceAtPosition != null && pieceAtPosition.color == piece.color) {
              return false;
            }

            if (!game.useMoveRules) return true;

            return isMoveInLegalMoves(getLegalMoves(game, piece), position);
          }}
          pieces={game.pieces.map((p) => makePiece(game, p))}
        />
      </div>
    </div>
  );
}

const rotateCoord = (pos, size) => {
  if (!pos) return pos;
  if (!window.isRotated) return pos;
  return {
    x: size.width - pos.x - 1,
    y: size.height - pos.y - 1
  };
};

const DeploymentBoard = (props) => {
  const {game} = props;
  const {legalMoves, boardSize, gridSize, moveHistory} = game;

  const pixelSize = {
    width: 2 * config.pixelSize.width / 3,
    height: 2 * config.pixelSize.height / 3,
  }

  const moveIndicators = [];
  const squareHeight = config.pixelSize.height / gridSize.height;
  const squareWidth = config.pixelSize.width / gridSize.width;
  for (const m of legalMoves) {
    const move = rotateCoord(m, gridSize);
    moveIndicators.push(<div
      key={'move_' + move.x + ',' + move.y}
      style={{
        position: 'absolute', backgroundColor: 'gold',
        borderRadius: '50%',
        top: squareHeight * move.y + squareHeight / 4,
        left: squareWidth * move.x + squareWidth / 4,
        width: squareWidth / 2,
        height: squareHeight / 2,
        opacity: 0.75,
      }}
    />)
  }

  const move = rotateCoord(moveHistory[moveHistory.length - 1]?.position, gridSize);
  const prevPos = rotateCoord(game.prevPiecePosition, gridSize);

  return (
    <div
      style={{

      }}
    >
      <CheckerBackground
        style={{
          marginTop: 1, marginLeft: 1,
          top: config.pixelSize.height / 6,
          left: config.pixelSize.width / 6,
        }}
        color1="#6B8E23" color2="#FFFAF0"
        pixelSize={pixelSize} gridSize={boardSize}
      />
      {move ? (
        <div
          key={'move_' + move.x + ',' + move.y}
          style={{
            position: 'absolute', backgroundColor: 'red',
            top: squareHeight * move.y + 1,
            left: squareWidth * move.x + 1,
            width: squareWidth,
            height: squareHeight,
            opacity: 0.5,
          }}
        /> ) : null}
      {prevPos ? (
        <div
          key={'prevPos_' + prevPos.x + ',' + prevPos.y}
          style={{
            position: 'absolute', backgroundColor: 'red',
            top: squareHeight * prevPos.y + 1,
            left: squareWidth * prevPos.x + 1,
            width: squareWidth,
            height: squareHeight,
            opacity: 0.5,
          }}
        /> ) : null}
      {game.useMoveRules ? moveIndicators : null}
    </div>
  );
}

const makePiece = (game, piece) => {
  const pxWidth = config.pixelSize.width / game.gridSize.width;
  const pxHeight = config.pixelSize.height / game.gridSize.height;
  const spriteSheet = {pxWidth, pxHeight, imagesAcross: 10, imagesDown: 2};
  return {...piece, position: rotateCoord(piece.position, game.gridSize), sprite: (
    <SpriteSheet src={config.spriteSheet}
      offset={config.pieceToOffset[piece.color + "_" + piece.type]}
      spriteSheet={spriteSheet}
    />
  )};
}

function registerHotkeys(dispatch) {
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyDown',
    key: 'space',
    fn: (s) => {
      const game = s.getState().game;
      if (game.policy == null) {
        s.dispatch({type: 'TICK'});
      }
    }
  });
}

module.exports = Game;
