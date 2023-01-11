const {getPieceAtPosition} = require('./selectors');
const {getLegalMoves} = require('./moves');

function minimax(board, depth, alpha, beta, isMaximizingPlayer, evaluate) {
    // base case: reach the leaf node or maximum depth
    if (depth === 0 || gameIsOver(board)) {
        return evaluate(board);
    }

    if (isMaximizingPlayer) {
        let bestValue = -Infinity;
        for (let move of possibleMoves(board)) {
            let newBoard = makeMove(board, move);
            bestValue = Math.max(
              bestValue, minimax(newBoard, depth - 1, alpha, beta, false, evaluate));
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) {
                break;
            }
        }
        return bestValue;
    } else {
        let bestValue = Infinity;
        for (let move of possibleMoves(board)) {
            let newBoard = makeMove(board, move);
            bestValue = Math.min(
              bestValue, minimax(newBoard, depth - 1, alpha, beta, true, evaluate));
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) {
                break;
            }
        }
        return bestValue;
    }
}

