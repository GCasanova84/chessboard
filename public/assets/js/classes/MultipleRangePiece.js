//const piece = require('Piece');
//const position = require('Position');
import Piece from './Piece.js';
//import Position from './Position.js';

export default class MultipleRangePiece extends Piece {
  constructor(name, color, position, moves, moved, team) {
    super(name, color, position, moves, moved, team)
    this._nextCheckedSquares = new Array();
  }
  get nextCheckedSquares() {
    return this._nextCheckedSquares;
  }
  set nextCheckedSquares(squares) {
    this._nextCheckedSquares = squares;
  }
  getPossibleMoves() {
    let moves = new Array()
    for (var move of this._moves) {
      for (var k = 1; k <= 7; k++) {
        let y = move.y*k
        let x = move.x*k
        let z = {y:y, x:x}
        if (this.findsEmptySquare(y, x)) {
          moves.push(z)
        } else if (this.findsFriendly(y, x)) {
          break
        } else if (this.squareIsNotUndefined(y, x)) {
          moves.push(z)
          break
        }
      }
    }
    return moves
  }
  getCheckedSquares() {
    let moves = new Array()
    for (var move of this._moves) {
      for (var k = 1; k <= 7; k++) {
        let y = move.y*k
        let x = move.x*k
        let z = {y:y, x:x}
        if (this.findsEmptySquare(y, x) || (this.findsOpponent(y, x) && this.findsKing(y, x))) {
          moves.push(z)
        } else if (this.findsFriendly(y, x) || (this.findsOpponent(y, x) && this.squareIsNotUndefined(y, x))) {
          moves.push(z)
          break
        } else if (!this.squareIsNotUndefined(y, x)) {
          break
        }
      }
    }
    return moves
  }
  getNextCheckedSquares() {
    let moves = new Array()
    for (var move of this._moves) {
      for (var k = 1; k <= 7; k++) {
        let y = move.y*k
        let x = move.x*k
        let z = {y:y, x:x}
        if (this.findsKing(y, x) && this.findsOpponent(y, x)) {
          moves.push(z)
          break
        } else if (this.findsEmptySquare(y, x) || (this.findsOpponent(y, x) && this.squareIsNotUndefined(y, x))) {
          moves.push(z)
        } else if (this.findsFriendly(y, x) || !this.squareIsNotUndefined(y, x)) {
          break
        }
      }
    }
    return moves
  }
}

//module.exports = {MultipleRangePiece: MultipleRangePiece};
