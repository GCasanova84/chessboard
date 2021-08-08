let randomColor = () => pieceColor[Math.round(Math.random()*1)];
var games = new Array();
var id = new String();
let randomId = () => {
  let id = new String();
  for (var i = 0; i < 6; i++) {
    let random = Math.random()*9;
    let randomToInteger = Math.round(random);
    let randomToString = randomToInteger.toString();
    id = id.concat(randomToString);
  }
  return id;
}
let matchId = data => data.match(/(?<=\/\?game\/)[0-9]+/)[0];
let matchColor = data => data.match(/(?<=\/\?game\/[0-9]+\/)[a-z]+/)[0]
const pieceColor = ['white','black']

module.exports = (io) => {
  io.on('connection', socket => {

    console.log(`new user connected. id ${socket.id}`);

    let color = new String();

    socket.on('url', data => {
        if (/\?/.test(data)) {
          let id = matchId(data);
          color = matchColor(data);
          for (var game of games) {
            if (game.id == id) {
              if (game.players.length < 2) {
                socket.emit('start game', color);
                game.players.push(socket.id);
                socket.join('room');
                console.log(games);
              } else {
                data = "inProgess"
              }
            } else {
              data = "error"
            }
          }
        } else {
          let id = randomId();
          color = randomColor();
          if (games.length > 0) {
            for (var game of games) {
              while (game.id == id) {
                id = randomId();
              }
              data = data.concat(`?game/${id}/${color}`)
              games.push({id: `${id}`, players: [socket.id]});
              socket.join('room');
            }
          } else {
            data = data.concat(`?game/${id}/${color}`)
            games.push({id: `${id}`, players: [socket.id]});
            socket.join('room');
          }
        }
        socket.emit('new url', data);
      });

      socket.on('ready to start', () => {
        socket.emit('color', color);
      });

      socket.on('move', data => {
        console.log(data);
        //console.log(socket.id);
        socket.to('room').emit('update positions', data);
      });

  });
}


/*

  */
