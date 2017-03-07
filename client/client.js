var game;
var socket = io.connect('http://127.0.0.1:8082');

function empezarJuego(){
    //Conectarse
    //Inicializar el juego
    game = new Game(socket);
    /*Eventos para enviarle al servidor
    ==========================================================================*/
    crearJugadorServer(''+(Math.random()*9999), socket);
    function crearJugadorServer(playerName, socket){
        socket.emit('crearJugadorServer', {id: playerName});
    }
    /*========================================================================*/

    /*Eventos para recibir del servidor
    ==========================================================================*/
    socket.on('crearPlayerCliente', function(player){
        game.crearPlayerCliente(player.id, player.local, player.x, player.y);
    });

    socket.on('sync', function(info){
        game.recibirInfo(info);
    });
    /*========================================================================*/
}







