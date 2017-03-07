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

var b = require('./bicho');
var Bicho = b.Bicho;

players = [];
playersDesc = [];

/* Nueva conexion
====================================================================================*/
io.on('connection', function(client) {
    console.log('Nueva conexión.');
    var playerid;
    client.on('crearJugadorServer', function(player){
        playerid = player.id;
        console.log(playerid + ' se ha conectado');
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
                    player.bicho.arriba = info.player.arriba;
                    player.bicho.abajo = info.player.abajo;
                    player.bicho.izquierda = info.player.izquierda;
                    player.bicho.derecha = info.player.derecha;
                }
            });
		}
	});

    /*Al desconecarse el cliente*/
    client.on('disconnect', function(){
        console.log("Player desconectado.")
        for(var i=0;i<players.length;i++){
            if(players[i].id === playerid){
                playersDesc.push(players[i]);
                players.splice(i, 1);
            }
        }
    });
});
/*==============================================================================*/
/*Coger la información para mandarsela al cliente
==================================================*/
function getInfo(){
    var info = [];
    for(i=0;i<players.length+1;i++) {
        info[i] = [];
        for(x=0;x<3;x++) info[i][x] = [];
    }
    var num = 0;
    players.forEach( function(player){
        var num2 = 0;
        player.bicho.nodos.forEach( function(nodo){
            info[num][num2].push(nodo.x,nodo.y,player.id);
            num2++;
        });
        num++;
    });
    if(playersDesc.length>0){
        info.playersDesc = playersDesc;//Enviarle a cada cliente los clientes que se han desconectado
        playersDesc = [] //Como el cliente ya sabe quienes son, no los necesitamos más
    }
    return info;
}
/*================================================*/
/*Constructor de los player
===============================*/

function Player(id, x, y){
	this.id = id;
    this.bicho = new Bicho(x,y);
    //this.bicho.evolucionar();
    players.push(this);
}
/*===========================*/
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
setInterval(function(){
    moverPlayers();
    var clients = io.sockets.clients(); // This returns an array with all connected clients
    /*Enviarle a todos los clientes el arraylist de players y de playersDesconectadosd (y mas cosas, pero por ahora solo eso)*/
    io.sockets.emit('sync', getInfo());
}, 20);
function moverPlayers() {
    players.forEach( function(player){
        player.bicho.update();
    });
}
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
