import Piece from './Piece.js';
//import Position from './Position.js';

export default class SingleRangePiece extends Piece {
  constructor(name, color, position, moves, moved, team) {
    super(name, color, position, moves, moved, team)
  }
  getPossibleMoves() {
    let moves = new Array()
    for (var move of this._moves) {
      if (this.findsEmptySquare(move.y, move.x) || (this.findsOpponent(move.y, move.x) && this.squareIsNotUndefined(move.y, move.x))) {
        moves.push(move)
      }
    }
    return moves
  }
  getCheckedSquares() {
    let moves = new Array()
    for (var move of this._moves) {
      if (this.squareIsNotUndefined(move.y, move.x)) {
        moves.push(move)
      }
    }
    return moves
  }
}

//module.exports = {SingleRangePiece: SingleRangePiece};
