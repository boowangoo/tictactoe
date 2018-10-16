const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const game = require('./game');

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

io.on('connection', (socket) => {
  socket.emit('registerID', game.register(socket.id));
  io.emit('changeTurn', game.changeTurn());

  socket.on('playerMove', (role, x, y) => {
    io.emit('updateBoard', game.place(role, x, y));
    game.toggleTurn();
    io.emit('changeTurn', game.changeTurn());
  });

  socket.on('disconnect', () => {
    game.unregister(socket.id);
    io.emit('updateBoard', game.reset());
    io.emit('changeTurn', game.changeTurn());
  });
});

http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});
