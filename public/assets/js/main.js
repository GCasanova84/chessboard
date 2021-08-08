$(() => {
  var socket = io();

  class Position {
    constructor(y, x) {
      this._y = y; //number
      this._x = x; //number
    }
    get y() {
      return this._y;
    }
    set y(y) {
      this._y = y;
    }
    get x() {
      return this._x;
    }
    set x(x) {
      this._x = x;
    }
    setPositionTo(y, x) {
      this.y = y
      this.x = x
    }
  }
  class Piece {
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
  class MultipleRangePiece extends Piece {
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

  class SingleRangePiece extends Piece {
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

  class Pawn extends Piece {
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

  class King extends SingleRangePiece {
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
    getPossibleMoves() {
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
  const moves ={
    king:   [{y:1, x:1},{y:1, x:0},{y:1, x:-1},{y:0, x:-1},{y:-1, x:-1},{y:-1, x:0},{y:-1, x:1},{y:0, x:1}],
    queen:  [{y:1, x:1},{y:1, x:0},{y:1, x:-1},{y:0, x:-1},{y:-1, x:-1},{y:-1, x:0},{y:-1, x:1},{y:0, x:1}],
    rook:   [{y:1, x:0},{y:0, x:-1},{y:-1, x:0},{y:0, x:1}],
    bishop: [{y:1, x:1},{y:1, x:-1},{y:-1, x:-1},{y:-1, x:1}],
    knight: [{y:1, x:2},{y:1, x:-2},{y:-1, x:-2},{y:-1, x:2},{y:2, x:1},{y:2, x:-1},{y:-2, x:-1},{y:-2, x:1}],
    pawn_A:  [{y:1, x:0},{y:1, x:-1},{y:1, x:1}],
    pawn_B:  [{y:-1, x:0},{y:-1, x:-1},{y:-1, x:1}]
  }

  var piecesInitialPosition = [
    [['rook_1','knight_1','bishop_1','queen','king','bishop_2','knight_2','rook_2'],['pawn_A1','pawn_A2','pawn_A3','pawn_A4','pawn_A5','pawn_A6','pawn_A7','pawn_A8']],
    [['pawn_B1','pawn_B2','pawn_B3','pawn_B4','pawn_B5','pawn_B6','pawn_B7','pawn_B8'],['rook_1','knight_1','bishop_1','queen','king','bishop_2','knight_2','rook_2']]
  ]
  //const pieceColor = ['white','black']
  var turn = 'white'
  var checkingPieceId = ''
  var takenPiecesA = new Array()
  var takenPiecesB = new Array()
  function createAllPieces(piecesInitialPosition,randomColor,moves) {
    //let randomColor = pieceColor[Math.round(Math.random()*1)]
    for (var i = 0; i < 2; i++) {
      let l = 0
      if (i == 1) {
        l =  6
        if (randomColor == 'white') {
          randomColor = 'black'
        } else {
          randomColor = 'white'
        }
      }
      for (var j = 0; j < 2; j++) {
        for (var k = 0; k < 8; k++) {
          if (i==0) {
            var team = 'A'
          } else {
            var team = 'B'
          }
          let m = j + l
          let position = new Position(m,k)
          let piece = piecesInitialPosition[i][j][k]
          let pieceMoves = moves[piece.match(/[a-z]+_[A-Z]|[a-z]+/)[0]]
          let pieceName = piece.match(/[a-z]+_[A-Z]|[a-z]+/)[0]
          if (pieceName === 'queen' || pieceName === 'bishop' || pieceName === 'rook') {
            piecesInitialPosition[i][j][k] = new MultipleRangePiece(piecesInitialPosition[i][j][k],randomColor,position,pieceMoves,true,team);
          } else if (pieceName === 'knight') {
            piecesInitialPosition[i][j][k] = new SingleRangePiece(piecesInitialPosition[i][j][k],randomColor,position,pieceMoves,true,team);
          } else if (pieceName === 'king') {
            piecesInitialPosition[i][j][k] = new King(piecesInitialPosition[i][j][k],randomColor,position,pieceMoves,true,team);
          } else {
            piecesInitialPosition[i][j][k] = new Pawn(piecesInitialPosition[i][j][k],randomColor,position,pieceMoves,true,team);
          }
          piecesInitialPosition[i][j][k].showPiece()
        }
      }
    }
  }

  function getAllPossibleMoves() {
    let multipleRangePieces = pieces.filter(piece => piece instanceof MultipleRangePiece)
    for (var piece of multipleRangePieces) {
      piece.nextCheckedSquares = piece.getNextCheckedSquares()
    }
    for (var piece of pieces) {
      piece.checkedSquares = piece.getCheckedSquares()
    }
    for (var piece of pieces) {
      piece.possibleMoves = piece.getPossibleMoves()
    }
  }




  function createNewPiece(y,x,color,moves,team) {
    let position = new Position(y,x)
    let newPiece = new Object()
    let piece = prompt('ingresa nueva pieza')
    let pieceMoves = moves[piece.match(/[a-z]+_[A-Z]|[a-z]+/)[0]]
    let pieceName = piece.match(/[a-z]+_[A-Z]|[a-z]+/)[0]
    if (pieceName === 'queen' || pieceName === 'bishop' || pieceName === 'rook') {
      newPiece = new MultipleRangePiece(piece,color,position,pieceMoves,false,team);
    } else if (pieceName === 'knight') {
      newPiece = new SingleRangePiece(piece,color,position,pieceMoves,false,team);
    }
    pieces.push(newPiece)
    newPiece.showPiece()
  }

  function retrievePieceForPawn(piece) {
    if (piece.id().match(/pawn/)) {
      if (piece.hasReacheadTheEnd()) {
        createNewPiece(piece.position.y,piece.position.x,piece.color,moves,piece.team)
      }
    }
  }

  function kingNext() {
    let kings = pieces.filter(piece => piece.id().match(/king/))
    for (var king of kings) {
      let kingNext = king.isNextToBeChecked()
      let allies = pieces.filter(piece => piece.color === king.color)
      if (kingNext.nextChecked) { //if king is threatened
        let opponents = kingNext.nextCheckingOpponents //opponents that are possibly threatening
        for (var opponent of opponents) {
          let blockingPieces = new Array()
          let moves = new Array()
          for (var piece of allies) {
            let blockingPiece = piece.blocksNextCheck(opponent, king) //pieces that block the attack and shouldn't move
            let takingPiece = piece.takesNextCheck(opponent)
            if (blockingPiece.blocks && !takingPiece.takes) {
              blockingPieces.push(blockingPiece.piece)
              moves = blockingPiece.moves
            } else if (blockingPiece.blocks && takingPiece.takes) {
              moves.push(takingPiece.move)
              moves = moves.concat(blockingPiece.moves)
              blockingPieces.push(blockingPiece.piece)
            }
          }
          if (blockingPieces.length === 1) {
            for (var piece of blockingPieces) {
              if (!piece.id().match(/king/)) {
                piece.possibleMoves = moves
              }
            }
          }
        }
      }
    }
  }

  function enPassantSet(piece) {
    if (/pawn/.test(piece.name)) {
      piece.lookForEnPassant()
    }
  }

  function enPassant(event) {
    event.data.piece.enPassantAllowed = false
    let y = new Number()
    if (event.data.piece.team === 'A') {
      y = -1
    } else {
      y = 1
    }
    let taken = pieces.find(p => (p.position.y === parseInt(this.id.match(/\d(?=\d)/)) + y && p.position.x === parseInt(this.id.match(/(?<=\d)\d/))))
    taken.hidePiece()
    if (taken.team === 'A') {
      takenPiecesA.push(taken)
      let indexTaken = takenPiecesA.findIndex(piece => piece === taken)
      taken.showOnSide(indexTaken, taken.team)
    } else {
      takenPiecesB.push(taken)
      let indexTaken = takenPiecesB.findIndex(piece => piece === taken)
      taken.showOnSide(indexTaken, taken.team)
    }
  }

  function draw(piece) {
    let draw = true
    let opponents = pieces.filter(p => p.color !== piece.color)
    for (var opponent of opponents) {
      if (opponent.possibleMoves.length !== 0) {
        draw = false
      }
    }
    if (draw) {
      alert('Draw!')
    }
  }

  function checkMate(king, blockingPieces) {
    if (king.possibleMoves.length === 0 && blockingPieces === 0) {
      alert('check mate')
    }
  }

  function kingChecked() {
    let king = pieces.find(piece => piece.id() === `${turn}_king`)
    let kingChecked = king.isChecked()
    let allies = pieces.filter(piece => piece.color === king.color && piece.name !== king.name)
    let notBlockingPieces = new Array()
    let blockingPieces = 0
    if (kingChecked.checked) {
      let opponent = pieces.find(piece => piece.id() === kingChecked.id)
      console.log(`${king.id()} is checked by ${kingChecked.id}`);
      for (var piece of allies) {
        let blockingMoves = new Array()
        let blockingPiece = piece.blocksCheck(opponent, king)
        let takingPiece = piece.takesCheck(opponent)
        if (blockingPiece.blocks || takingPiece.takes) {
          let blockingMove = blockingPiece.moves
          let takingMove = takingPiece.move
          if (blockingMove !== undefined) {
            blockingMoves = blockingMoves.concat(blockingMove)
          }
          if (takingMove !== undefined) {
            blockingMoves = blockingMoves.concat(takingMove)
          }
          blockingPiece.piece.possibleMoves = blockingMoves
          blockingPieces += 1
        } else {
          let notBlockingPiece = blockingPiece.piece
          notBlockingPieces.push(notBlockingPiece)
        }
      }
      for (var piece of notBlockingPieces) {
        if (!piece.id().match(/king/)) {
          $(`#${piece.id()}`).off()
        }
      }
      checkMate(king, blockingPieces)
    }
  }

  function allowTurn() {
    $(`.${turn}`).on('click', showPossibleMoves)
    kingNext()
    kingChecked()
    if (turn === 'white') {
      turn = 'black'
    } else {
      turn = 'white'
    }
    $(`.${turn}`).off()
  }

  function isTaken() {
    let thisTurnPieces = pieces.filter(piece => piece.color === turn)
    let otherTurnPieces = pieces.filter(piece => piece.color !== turn)
    for (var piece of thisTurnPieces) {
      for (var otherPiece of otherTurnPieces) {
        if (piece.position.y === otherPiece.position.y && piece.position.x === otherPiece.position.x) {
          let index = pieces.findIndex(p => p === piece)
          let taken = pieces.splice(index, 1)[0]
          if (taken.team === 'A') {
            takenPiecesA.push(taken)
            let indexTaken = takenPiecesA.findIndex(piece => piece === taken)
            taken.showOnSide(indexTaken, taken.team)
          } else {
            takenPiecesB.push(taken)
            let indexTaken = takenPiecesB.findIndex(piece => piece === taken)
            taken.showOnSide(indexTaken, taken.team)
          }
        }
      }
    }
  }

  function checkKing() {
    let kings = pieces.filter(piece => piece.id().match(/king/))
    let kingCheck = new Object()
    let id = new String()
    for (var king of kings) {
      kingCheck = king.isChecked()
      if (kingCheck.checked) {
        $(`#${king.id()}`).parent().css({"opacity":".6","box-shadow":"inset 0 0 8px red"})
        id = kingCheck.id
      } else {
        $(`#${king.id()}`).parent().css({"opacity":"1","box-shadow":"none"})
      }
    }
    clearEmptySquares()
    checkingPieceId = id
  }

  function clearEmptySquares() {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if ($(`#square${i}${j}`).html() === "") {
          $(`#square${i}${j}`).css({"opacity":"1","box-shadow":"none"})
        }
      }
    }
  }

  function castle (event) {
    let clickedKingPositionX = parseInt(this.id.match(/(?<=\d)\d/))
    let rook = event.data.piece.getRook(clickedKingPositionX)
    rook.hidePiece()
    rook.moved = false;
    if (rook.id() === `${rook.color}_rook_1`) {
      rook.position.x = 3
    } else {
      rook.position.x = 5
    }
    rook.showPiece()
  }



  function showPossibleMoves() {
    let clickedPieceId = $(this).attr('id')
    let piece = pieces.find(piece => piece.id() === clickedPieceId)
    if (piece.possibleMoves.length !== 0) {
      $('i').off()
    }
    enPassantSet(piece)
    for (var move of piece.possibleMoves) {
      $(`#square${piece.position.y + move.y}${piece.position.x + move.x}`).css({"opacity":".6","box-shadow":"inset 0 0 8px #17b9ff"})
      $(`#square${piece.position.y + move.y}${piece.position.x + move.x}`).on('click',{piece: piece},makeTheMove)
      $(`#square${piece.position.y + move.y}${piece.position.x + move.x}`).on('click',allowTurn)
    }
  }

  function putPiecesIntoArray() {
    pieces = piecesInitialPosition[0][0].concat(piecesInitialPosition[0][1],piecesInitialPosition[1][0],piecesInitialPosition[1][1])
  }
  //createAllPieces(piecesInitialPosition,pieceColor,moves);
  //var pieces = piecesInitialPosition[0][0].concat(piecesInitialPosition[0][1],piecesInitialPosition[1][0],piecesInitialPosition[1][1])
  //getAllPossibleMoves()
  //allowTurn()

  let pieces = new Array();

  function makeTheMove(event) {
    event.data.piece.hidePiece()
    event.data.piece.clearPossibleMoves()
    event.data.piece.moved = false
    event.data.piece.position.setPositionTo(parseInt(this.id.match(/\d(?=\d)/)), parseInt(this.id.match(/(?<=\d)\d/)))
    event.data.piece.showPiece()
    retrievePieceForPawn(event.data.piece)
    getAllPossibleMoves()
    isTaken()
    checkKing()
    draw(event.data.piece)
    socket.emit('move', {id: event.data.piece.id(), y: event.data.piece.position.y, x: event.data.piece.position.x, turn: turn});
  }

  socket.on('connect', () => {
    console.log(socket.id);
    socket.emit('url', window.location.href);
  });

  socket.on('new url', data => {
    $('#url').val(data);
  });

  socket.on('start game', data => {
    $('#URL-form').hide();
    $('.board').addClass('board--guest');
    createAllPieces(piecesInitialPosition,data,moves)
    putPiecesIntoArray()
    getAllPossibleMoves()
    allowTurn()
    $('#game').show();
  });

  $('#URL-form').on('submit', e => {
    e.preventDefault();
    socket.emit('ready to start');
    socket.on('color', data => {
      $('#URL-form').hide();
      createAllPieces(piecesInitialPosition,data,moves);
      putPiecesIntoArray()
      getAllPossibleMoves()
      allowTurn()
      $('#game').show();
    });

  });

  socket.on('update positions', data => {
    let piece = pieces.find(piece => piece.id() == data.id);
    piece.hidePiece();
    piece.position.setPositionTo(data.y, data.x);
    piece.showPiece();
    turn = data.turn;
    allowTurn();
  });

});
