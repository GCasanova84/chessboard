//mport Piece from './Piece.js';
import SingleRangePiece from './SingleRangePiece.js';
//import Position from './Position.js';

export default class King extends SingleRangePiece {
  constructor(name, color, position, moves, moved, team) {
    super(name, color, position, moves, moved, team)
  }
  findsCheckedSquare(y, x) {
    let checked = false
    let opponents = pieces.filter(opponent => opponent.color !== this._color)
    for (var opponent of opponents) {
      for (var move of opponent.checkedSquares) {
        if (opponent.position.y + move.y == this._position.y + y && opponent.position.x + move.x == this._position.x + x) {
          checked = true
        }
      }
    }
    return checked
  }
  isNextToBeChecked() {
    let nextChecked = false
    let nextCheckingOpponents = new Array()
    let opponents = pieces.filter(opponent => opponent.color !== this._color)
    let multipleRangeOpponents = opponents.filter(opponent => opponent instanceof MultipleRangePiece)
    for (var opponent of multipleRangeOpponents) {
      for (var move of opponent.nextCheckedSquares) {
        if (opponent.position.y + move.y == this._position.y && opponent.position.x + move.x == this._position.x) {
          nextChecked = true
          nextCheckingOpponents.push(opponent)
        }
      }
    }
    return {nextChecked: nextChecked, nextCheckingOpponents: nextCheckingOpponents}
  }
  isAllowedToCastle(rook) {
    let allowed = false
    let x = new Number()
    check:
    if (this._moved && rook.moved) {
      if (rook.position.x < this._position.x) {
        x = -2
        for (var i = rook.position.x + 1; i < this._position.x; i++) {
          if (!this.findsEmptySquare(0, i - this._position.x)) {
            break check
          }
        }
        for (var i = this._position.x-2; i < this._position.x+1; i++) {
          if (this.findsCheckedSquare(0, i - this._position.x)) {
            break check
          }
        }
        allowed = true
      } else {
        x = 2
        for (var i = this._position.x+1; i < rook.position.x; i++) {
          if (!this.findsEmptySquare(0, i - this._position.x)) {
            break check
          }
        }
        for (var i = this._position.x; i < this._position.x+3; i++) {
          if (this.findsCheckedSquare(0, i - this._position.x)) {
            break check
          }
        }
        allowed = true
      }
    }
    return {allowed: allowed, x: x}
  }
  allowCastling(x) {
    $(`#square${this._position.y}${this._position.x + x}`).on('click',{piece: this},castle)
    return {y: 0, x: x}
  }
  unallowCastling(x) {
    $(`#square${this._position.y}${this._position.x + x}`).off('click',castle)
  }
  getPossibleMoves(pieces) {
    let moves = new Array()
    let rookId = `${this._color}_rook`
    let rooks = pieces.filter(piece => piece.id().match(rookId))
    for (var move of this._moves) {
      if ((this.findsEmptySquare(move.y, move.x) || (this.findsOpponent(move.y, move.x) && this.squareIsNotUndefined(move.y, move.x))) && !this.findsCheckedSquare(move.y, move.x)) {
        moves.push(move)
      }
    }
    for (var rook of rooks) {
      let castle = this.isAllowedToCastle(rook)
      let x = castle.x
      if (castle.allowed) {
        let move = this.allowCastling(x)
        moves.push(move)
      } else {
        this.unallowCastling(x)
      }
    }
    return moves
  }
  isChecked() {
    let checked = false
    let id = ''
    let opponents = pieces.filter(opponent => opponent.color !== this._color)
    check:
    for (var opponent of opponents) {
      for (var move of opponent.possibleMoves) {
        if (opponent.position.y + move.y == this._position.y && opponent.position.x + move.x == this._position.x) {
          checked = true
          id = opponent.id()
          break check
        } else {
          id = ''
        }
      }
    }
    return {checked: checked, id: id}
  }
  getRook(x) {
    if (this._position.x > x) {
      return pieces.find(rook => rook.id() === `${this._color}_rook_1`)
    } else {
      return pieces.find(rook => rook.id() === `${this._color}_rook_2`)
    }
  }
}

//module.exports = {King: King};
