//Creation and display of every square of the board with its given id and class
(() => {
  for (var i = 0; i <8; i++) {
    for (var j = 0; j < 8; j++) {
      $('.board').append(`<div id="square${i}${j}" class="square"></div>`)
      if (i%2 == 0 && j%2 == 0 || i%2 == 1 && j%2 == 1) {
        $(`#square${i}${j}`).addClass('square--light')
      } else {
        $(`#square${i}${j}`).addClass('square--dark')
      }
    }
  }
})();
