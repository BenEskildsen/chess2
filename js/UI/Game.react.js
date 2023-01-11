const React = require('react');
const {
  Button, InfoCard, Divider,
  Plot, plotReducer,
  Modal, Indicator,
  Board, SpriteSheet,
  CheckerBackground,
} = require('bens_ui_components');
const {
  getPieceByID, getPieceAtPosition,
} = require('../selectors/selectors');
const {
  getLegalMoves, isMoveInLegalMoves,
} = require('../selectors/moves');
const {dispatchToServer, setupSocket} = require('../clientToServer');
const {config} = require('../config');
const {useState, useMemo, useEffect, useReducer} = React;

function Game(props) {
  const {state, dispatch, getState} = props;
  const game = state.game;

  // mutliplayer
  useEffect(() => {
    setupSocket(dispatch);
  }, []);


  const background = useMemo(() => {
    return game.boardType == 'deployment' ? <DeploymentBoard game={game} /> : null;
  }, [game.boardType, game.legalMoves.length]);

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
      <div
        style={{
          display: 'flex',
        }}
      >
        <div>
          <Button
            label="Restart"
            style={{height: 50}}
            onClick={() => {
              const action = {type: 'START', screen: 'GAME'};
              dispatch(action);
              dispatchToServer(action);
            }}
          />
        </div>
        <div>
          <Button
            label="Undo"
            style={{height: 50, width: '100%'}}
            onClick={() => {
              const action = {type: 'UNDO'};
              dispatch(action);
              dispatchToServer(action);
            }}
          />
        </div>
      </div>
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
          onPieceMove={(id, position) => {
            dispatch({type: 'MOVE_PIECE', local: true, id, position});
            dispatch({type: 'SET_LEGAL_MOVES', legalMoves: []});
          }}
          onMoveCancel={(id) => {
            setTimeout(() => dispatch({type: 'SET_LEGAL_MOVES', legalMoves: []}));
          }}
          onPiecePickup={(id, position) => {
            const game = getState().game;
            const piece = getPieceByID(game, id);
            dispatch({type: 'SET_LEGAL_MOVES', legalMoves: getLegalMoves(game, piece)});
          }}
          isMoveAllowed={(id, position) => {
            const game = getState().game;
            const piece = getPieceByID(game, id);
            const pieceAtPosition = getPieceAtPosition(game, position);

            if (pieceAtPosition != null && pieceAtPosition.color == piece.color) {
              return false;
            }

            return isMoveInLegalMoves(getLegalMoves(game, piece), position);
          }}
          pieces={game.pieces.map((p) => makePiece(game, p))}
        />
      </div>
    </div>
  );
}

const DeploymentBoard = (props) => {
  const {game} = props;
  const {legalMoves, boardSize, gridSize} = game;

  const pixelSize = {
    width: 2 * config.pixelSize.width / 3,
    height: 2 * config.pixelSize.height / 3,
  }

  const moveIndicators = [];
  const squareHeight = config.pixelSize.height / gridSize.height;
  const squareWidth = config.pixelSize.width / gridSize.width;
  for (const move of legalMoves) {
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
      {moveIndicators}
    </div>
  );
}

const makePiece = (game, piece) => {
  const pxWidth = config.pixelSize.width / game.gridSize.width;
  const pxHeight = config.pixelSize.height / game.gridSize.height;
  const spriteSheet = {pxWidth, pxHeight, imagesAcross: 8, imagesDown: 2};
  // const sprite = useMemo(() => {
  //   return (
  //     <SpriteSheet src={'../chess2.png'}
  //       offset={config.pieceToOffset[piece.color + "_" + piece.type]}
  //       spriteSheet={spriteSheet}
  //     />
  //   );
  // }, []);
  return {...piece, sprite: (
    <SpriteSheet src={'../chess2.png'}
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
