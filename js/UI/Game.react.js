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
} = require('../selectors');
const {config} = require('../config');
const {useState, useMemo, useEffect, useReducer} = React;

function Game(props) {
  const {state, dispatch, getState} = props;
  const game = state.game;


  // initializations
  // useEffect(() => {
  // }, []);


  return (
    <div
      style={{
        backgroundColor: 'lightgrey',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Board
        background={game.boardType == 'deployment' ? <DeploymentBoard game={game} /> : null}
        pixelSize={config.pixelSize}
        gridSize={game.gridSize}
        onPieceMove={(id, position) => {
          dispatch({type: 'MOVE_PIECE', local: true, id, position});
        }}
        isMoveAllowed={(id, position) => {
          const game = getState().game;
          const piece = getPieceByID(game, id);
          const pieceAtPosition = getPieceAtPosition(game, position);

          if (pieceAtPosition != null && pieceAtPosition.color == piece.color) {
            return false;
          }
          return true;
        }}
        pieces={game.pieces.map((p) => makePiece(game, p))}
      />
    </div>
  );
}

const DeploymentBoard = (props) => {
  const {game} = props;

  const pixelSize = {
    width: 2 * config.pixelSize.width / 3,
    height: 2 * config.pixelSize.height / 3,
  }
  const gridSize = {width: 8, height: 8};

  return (
    <div
      style={{

      }}
    >
        <CheckerBackground
          style={{
            marginTop: 1, marginLeft: 1,
            top: config.pixelSize.width / 6,
            left: config.pixelSize.height / 6,
          }}
          color1="#6B8E23" color2="#FFFAF0"
          pixelSize={pixelSize} gridSize={gridSize}
        />
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
