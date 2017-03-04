var socket = io.connect('http://127.0.0.1:8082');
var game = new Game(socket);

socket.on('crearPlayerCliente', function(player){
	game.crearPlayerCliente(player.id, player.local, player.x, player.y);
});

socket.on('sync', function(info){
	game.recibirInfo(info);
});

crearJugadorServer(''+(Math.random()*9999), socket);
function crearJugadorServer(playerName, socket){
    socket.emit('crearJugadorServer', {id: playerName});
}
