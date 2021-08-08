//import Position from './Position.js';

export default class Piece {
  constructor(name, color, position, moves, moved, team) {
    this._name = name; //string
    this._color = color; //string
    this._position = position; //object
    this._moves = moves; //array of objects
    this._moved = moved; //boolean
    this._possibleMoves = new Array();
    this._checkedSquares = new Array();
    this._team = team;
  }
  //getters & setters
  get name() {
    return this._name;
  }
  get color() {
    return this._color;
  }
  get position() {
    return this._position;
  }
  set position(position) {
    this._position = position;
  }
  get moves() {
    return this._moves;
  }
  get moved() {
    return this._moved;
  }
  set moved(moved) {
    this._moved = moved;
  }
  get possibleMoves() {
    return this._possibleMoves;
  }
  set possibleMoves(moves) {
    this._possibleMoves = moves;
  }
  get checkedSquares() {
    return this._checkedSquares;
  }
  set checkedSquares(squares) {
    this._checkedSquares = squares;
  }
  get team() {
    return this._team;
  }
  //methods to get Id & icon
  id() {
    return `${this._color}_${this._name}`;
  }
  icon() {
    return `<i id="${this.id()}" style="color: ${this._color}" class="${this._color} fas fa-chess-${this._name.match(/[a-z]+/)[0]}"></i>`
  }
  //methods that take a movement position as parameter and return a boolean
  findsFriendly(y, x) {
    return $(`#square${this._position.y + y}${this._position.x + x} > i`).attr('style') === `color: ${this._color}`
  }
  findsOpponent(y, x) {
    return $(`#square${this._position.y + y}${this._position.x + x} > i`).attr('style') !== `color: ${this._color}`
  }
  findsEmptySquare(y, x) {
    return $(`#square${this._position.y + y}${this._position.x + x}`).html() === ""
  }
  findsKing(y, x) {
    if ($(`#square${this._position.y + y}${this._position.x + x} > i`).attr('id') === undefined) {
      return false
    } else {
      return /king/.test($(`#square${this._position.y + y}${this._position.x + x} > i`).attr('id'))
    }
  }
  squareIsNotUndefined(y, x) {
    return $(`#square${this._position.y + y}${this._position.x + x}`).html() !== undefined
  }
  clearPossibleMoves() {
    for (var move of this.possibleMoves) {
      $(`#square${this._position.y + move.y}${this._position.x + move.x}`).css({"opacity":"1","box-shadow":"none"})
      $(`#square${this._position.y + move.y}${this._position.x + move.x}`).off()
    }
  }
  showPiece() {
    return $(`#square${this._position.y}${this._position.x}`).html(this.icon());
  }
  hidePiece() {
    return $(`#square${this._position.y}${this._position.x}`).html("");
  }
  showOnSide(index,team) {
    return $(`#side-square${index}-${team}`).html(this.icon());
  }
  movesHorizontally() {
    let moves = new Array()
    for (var move of this.possibleMoves) {
      if (move.y === 0) {
        moves.push(move)
      }
    }
    return moves
  }
  movesVertically() {
    let moves = new Array()
    for (var move of this.possibleMoves) {
      if (move.x === 0) {
        moves.push(move)
      }
    }
    return moves
  }
  movesDiagonally(opponent) {
    let moves = new Array()
    for (var move of this.possibleMoves) {
      for (var oppMove of opponent.nextCheckedSquares) {
        if ((Math.abs(move.y) === Math.abs(move.x)) && (this._position.y + move.y === opponent.position.y + oppMove.y) && (this._position.x + move.x === opponent.position.x + oppMove.x)) {
          moves.push(move)
        }
      }
    }
    return moves
  }
  blocksNextCheck(opponent, king) {
    let blocks = false
    let moves = new Array()
    for (var move of opponent.nextCheckedSquares) {
      if (((king.position.y === opponent.position.y) && (king.position.y === this._position.y)) && opponent.position.x + move.x == this._position.x && ((this._position.x > opponent.position.x && this._position.x < king.position.x) || (this._position.x < opponent.position.x && this._position.x > king.position.x))) {
        blocks = true
        moves = this.movesHorizontally()
      } else if (((king.position.x === opponent.position.x) && (king.position.x === this._position.x)) && opponent.position.y + move.y == this._position.y && ((this._position.y > opponent.position.y && this._position.y < king.position.y) || (this._position.y < opponent.position.y && this._position.y > king.position.y))) {
        blocks = true
        moves = this.movesVertically()
      } else if ((Math.abs(king.position.y - opponent.position.y) === Math.abs(king.position.x - opponent.position.x)) && (Math.abs(this._position.y - opponent.position.y) === Math.abs(this._position.x - opponent.position.x)) && (opponent.position.y + move.y == this._position.y && opponent.position.x + move.x == this._position.x) && (((this._position.y > opponent.position.y && this._position.y < king.position.y) || (this._position.y < opponent.position.y && this._position.y > king.position.y)) && ((this._position.x > opponent.position.x && this._position.x < king.position.x) || (this._position.x < opponent.position.x && this._position.x > king.position.x)))) {
        blocks = true
        moves = this.movesDiagonally(opponent)
      }
    }
    return {blocks: blocks, piece: this, moves: moves}
  }
  takesNextCheck(opponent) {
    for (var move of this._possibleMoves) {
      if (this._position.y + move.y === opponent.position.y && this._position.x + move.x === opponent.position.x) {
        return {takes: true, piece: this, move: move}
      }
    }
    return {takes: false}
  }
  blocksCheck(checkingOpponent, king) {
    let blocks = false
    let moves = new Array()
    for (var opponentMove of checkingOpponent.possibleMoves) {
      for (var move of this._possibleMoves) {
        if (((king.position.y === checkingOpponent.position.y) && (king.position.y === this._position.y + move.y)) && checkingOpponent.position.x + opponentMove.x == this._position.x + move.x && ((this._position.x + move.x > checkingOpponent.position.x && this._position.x + move.x < king.position.x) || (this._position.x + move.x < checkingOpponent.position.x && this._position.x + move.x > king.position.x))) {
          blocks = true
          moves.push(move)
        } else if (((king.position.x === checkingOpponent.position.x) && (king.position.x === this._position.x + move.x)) && checkingOpponent.position.y + opponentMove.y == this._position.y + move.y && ((this._position.y + move.y > checkingOpponent.position.y && this._position.y + move.y < king.position.y) || (this._position.y + move.y < checkingOpponent.position.y && this._position.y + move.y > king.position.y))) {
          blocks = true
          moves.push(move)
        } else if ((Math.abs(king.position.y - checkingOpponent.position.y) === Math.abs(king.position.x - checkingOpponent.position.x)) && (Math.abs(this._position.y + move.y - checkingOpponent.position.y + opponentMove.y) === Math.abs(this._position.x + move.x - checkingOpponent.position.x + opponentMove.x)) && (checkingOpponent.position.y + opponentMove.y == this._position.y + move.y && checkingOpponent.position.x + opponentMove.x == this._position.x + move.x) && (((this._position.y + move.y > checkingOpponent.position.y && this._position.y + move.y < king.position.y) || (this._position.y + move.y < checkingOpponent.position.y && this._position.y + move.y > king.position.y)) && ((this._position.x + move.x > checkingOpponent.position.x && this._position.x + move.x < king.position.x) || (this._position.x + move.x < checkingOpponent.position.x && this._position.x + move.x > king.position.x)))) {
          blocks = true
          moves.push(move)
        }
      }
    }
    return {blocks: blocks, piece: this, moves: moves}
  }
  takesCheck(checkingOpponent) {
    for (var move of this._possibleMoves) {
      if (this._position.y + move.y === checkingOpponent.position.y && this._position.x + move.x === checkingOpponent.position.x) {
        return {takes: true, piece: this, move: move}
      }
    }
    return {takes: false}
  }
}

//module.exports = {Piece: Piece};
