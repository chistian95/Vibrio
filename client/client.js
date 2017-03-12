var game;
var socket = io.connect('http://127.0.0.1:8082');
function empezarJuego(){
    //Conectarse
    //Inicializar el juego
    game = new Game(socket);
    /*Eventos para enviarle al servidor
    ==========================================================================*/
    crearJugadorServer(socket);
    function crearJugadorServer(socket){
        socket.emit('crearJugadorServer', {nombre: nombre});
    }
    /*========================================================================*/

    /*Eventos para recibir del servidor
    ==========================================================================*/
    socket.on('crearPlayerCliente', function(player){
        if(!player.local) game.crearPlayerCliente(player.id, false, player.nombre);
        else {
            game.crearPlayerCliente(player.id, true, player.nombre);
            game.width = player.width;
            game.height = player.height;
        }
    });

    socket.on('sync', function(info){
        game.recibirInfo(info);
    });

    socket.on('playerDesconectadoCliente', function(info){
        game.playerDesconectadoCliente(info);
    });
    /*========================================================================*/
}
