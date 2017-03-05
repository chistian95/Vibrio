//Conectarse
var socket = io.connect('http://127.0.0.1:8082');
//Inicializar el juego
var game = new Game(socket);

/*Eventos para recibir del servidor
==========================================================================*/
socket.on('crearPlayerCliente', function(player){
	game.crearPlayerCliente(player.id, player.local, player.x, player.y);
});

socket.on('sync', function(info){
    //alert(info.playersDesc);
	game.recibirInfo(info);
});
/*========================================================================*/

/*Eventos para enviarle al servidor
==========================================================================*/
crearJugadorServer(''+(Math.random()*9999), socket);
function crearJugadorServer(playerName, socket){
    socket.emit('crearJugadorServer', {id: playerName});
}
/*========================================================================*/
