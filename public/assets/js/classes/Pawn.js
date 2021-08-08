import Piece from './Piece.js';
//import Position from './Position.js';

export default class Pawn extends Piece {
  constructor(name, color, position, moves, moved, team) {
    super(name, color, position, moves, moved, team)
    //this._enPassantPawns = new Array();
    this._enPassantAllowed = false;
  }
  get enPassantAllowed() {
    return this._enPassantPawns;
  }
  set enPassantAllowed(allowed) {
    this._enPassantAllowed = allowed;
  }
  getPossibleMoves() {
    let moves = new Array()
    if (this._moved && (this.findsEmptySquare(this._moves[0].y, 0))) {
      let y = this._moves[0].y
      let x = this._moves[0].x
      var possibleMoves = this._moves.concat({y:2*y, x:x})
    } else {
      var possibleMoves = this._moves
    }
    for (var move of possibleMoves) {
      if ((move.x === 0 && this.findsEmptySquare(move.y, move.x)) || (move.x !== 0 && !this.findsEmptySquare(move.y, move.x) && this.findsOpponent(move.y, move.x) && this.squareIsNotUndefined(move.y, move.x))) {
        moves.push(move)
      }
    }
    for (var move of possibleMoves) {
      if (move.x !== 0 && this._enPassantAllowed && (!this.findsEmptySquare(0, move.x) && this.findsOpponent(0, move.x) && this.squareIsNotUndefined(0, move.x))) {
        moves.push(move)
        this.allowEnPassant(move)
      }
    }
    return moves
  }
  getCheckedSquares() {
    let moves = new Array()
    for (var move of this._moves) {
      if (move.x !== 0 && this.squareIsNotUndefined(move.y, move.x)) {
        moves.push(move)
      }
    }
    return moves
  }
  hasReacheadTheEnd() {
    let reached = false
    if (this._position.y === 0 || this._position.y === 7) {
      reached = true
    }
    return reached
  }
  findsPawn(y, x) {
    if ($(`#square${this._position.y + y}${this._position.x + x} > i`).attr('id') === undefined) {
      return false
    } else {
      return /pawn/.test($(`#square${this._position.y + y}${this._position.x + x} > i`).attr('id'))
    }
  }
  lookForEnPassant() {
    let y = new Number()
    let iteration = [-1, 1]
    if (this._team === 'A') {
      y = 2
    } else {
      y = -2
    }
    for (var x of iteration) {
      if (this.findsPawn(y, x) && this.findsOpponent(y, x)) {
        let id = $(`#square${this._position.y + y}${this._position.x + x} > i`).attr('id')
        let pawn = pieces.find(piece => piece.id() === id)
        if (this._moved) {
          pawn.enPassantAllowed = true
        }
      }
    }
  }
  allowEnPassant(move) {
    $(`#square${this._position.y + move.y}${this._position.x + move.x}`).on('click',{piece: this},enPassant)
  }
}

//module.exports = {Pawn: Pawn};
