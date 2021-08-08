export default class Position {
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
  movesTo(y, x) {
    this.y = y
    this.x = x
  }
}

//module.exports = {Position: Position};
