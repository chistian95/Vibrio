/*Abrir el server
=================================================================*/
var express = require('express');
var app = express();
app.use(express.static(__dirname));
var server = app.listen(process.env.PORT || 8082, function () {
	var puerto = server.address().port;
	console.log('Servidor abierto en el puerto %s', puerto);
});
var io = require('socket.io')(server);
/*==============================================================*/

players = [];

/* Nueva conexion
====================================================================================*/
io.on('connection', function(client) {
    console.log('Nueva conexión.');
    client.on('crearJugadorServer', function(player){
        console.log(player.id + ' se ha conectado');
        var initX = Math.random()*500;
        var initY = Math.random()*500;
        /*Crear al cliente su jugador*/
        client.emit('crearPlayerCliente', { id: player.id, local: true, x: initX, y: initY});
        /*Enviarle al nuevo player los jugadores existentes.*/
        players.forEach(function(player){
            client.emit('crearPlayerCliente', {id: player.id, local: false, x: player.x, y: player.y});
        });
        /*Enviar a todos los clientes "broadcast" la información del nuevo juegador*/
        client.broadcast.emit('crearPlayerCliente', { id: player.id, local: false, x: initX, y: initY} );
        new Player(player.id,initX,initY,1);
    });
    /*Función para recibir información del cliente, en este caso la dirección si ha cambiado*/
    client.on('sync', function(info){
		if(info.player != undefined){
            /*Actualizar la dirección según lo que ha enviado el cliente*/
            players.forEach( function(player){
                if(player.id == info.player.id){
                    //player.x = info.player.x;
                    //player.y = info.player.y;
                    player.dir = info.player.dir;
                }
            });
		}
        /*Enviarle al cliente el arraylist de players (y mas cosas, pero por ahora solo eso)*/
		client.emit('sync', getInfo());
        /*Enviarle a todos los clientes el arraylist de players (y mas cosas, pero por ahora solo eso)*/
		client.broadcast.emit('sync', getInfo());
	});
});
/*==============================================================================*/

/*Coger la información para mandarsela al cliente
==================================================*/
function getInfo(){
    var info = {};
    info.players = players;
    return info;
}
/*================================================*/
/*Constructor de los player
===============================*/
function Player(id, x, y,dir){
	this.id = id;
	this.x = x;
	this.y = y;
    this.dir = dir;
    players.push(this);
}
/*===========================*/

/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
setInterval(function(){
    moverPlayers();
}, 20);

function moverPlayers() {
    players.forEach( function(player){
        switch(player.dir) {
            case 0: player.y -= 1;break;
            case 1: player.y += 1;break;
            case 2: player.x -= 1;break;
            case 3: player.x += 1;break;
        }
    });

}
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
