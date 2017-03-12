/*Abrir el server
=================================================================*/
var express = require('express');
var app = express();
var width = 3000;
var height = 3000;
app.use(express.static(__dirname));
var server = app.listen(process.env.PORT || 8082, function () {
	var puerto = server.address().port;
	console.log('Servidor abierto en el puerto %s', puerto);
});
var io = require('socket.io')(server);
/*==============================================================*/

var b = require('./bicho');
var Bicho = b.Bicho;
var p = require('./plantas');
var Planta = p.Planta;
var plantasMundo = [];

players = [];
ids = [];
for(var i=0;i<=1000;i++) ids[i]=false;
/* Nueva conexion
====================================================================================*/
io.on('connection', function(client) {
    console.log('Nueva conexión.');
    var playerid;
    client.on('crearJugadorServer', function(player){
        var nombre = player.nombre;
        var initX = Math.random()*width;
        var initY = Math.random()*height;
        /*Crear al cliente su jugador*/
        playerid = 0;
        var id = false;
        while(!id) {
            if(ids[playerid]) {
                playerid++
            } else {
                ids[playerid] = true;
                id = true;
            }
        }
        console.log(nombre + ' se ha conectado Id: '+playerid);
        /*Enviarle al nuevo player los jugadores existentes.*/
        players.forEach(function(player){
            client.emit('crearPlayerCliente', {id: player.id, local: false, nombre: player.nombre});
        });
        client.emit('crearPlayerCliente', { id: playerid, local: true,nombre: nombre,width:width,height:height, plantas: plantasMundo});
        /*Enviar a todos los clientes "broadcast" la información del nuevo juegador*/
        client.broadcast.emit('crearPlayerCliente', { id: playerid, local: false,nombre: nombre})
        new Player(playerid,initX,initY,nombre);
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
        for(var i=0;i<players.length;i++){
            if(players[i].id === playerid){
                console.log(players[i].nombre+" desconectado.")
                client.broadcast.emit("playerDesconectadoCliente",{id: players[i].id})
                players.splice(i, 1);
            }
        }
    });

    /*Al evolucionar*/
    client.on('evolucionar', function(info) {
        if(info.player != undefined){
            /*Actualizar la dirección según lo que ha enviado el cliente*/
            players.forEach( function(player){
                if(player.id == info.player.id){
                    player.bicho.evolucionar();
                }
            });
		}
    });
    /*Al involucionar*/
    client.on('involucionar', function(info) {
        if(info.player != undefined){
            /*Actualizar la dirección según lo que ha enviado el cliente*/
            players.forEach( function(player){
                if(player.id == info.player.id){
                    if(player.bicho.contFase>=1) {
                        var ang = player.bicho.nodoCentral.anguloActual;
                        player.bicho.nodos = [];
                        player.bicho.involucionar(player.bicho.contFase-1,ang);
                    }
                }
            });
		}
    });
});
/*==============================================================================*/
/*Coger la información para mandarsela al cliente
==================================================*/
function getInfo(){
    var info = []
    info[0] = [];
    for(i=0;i<players.length;i++) info[0][i] = [];
    var num = 0;
    players.forEach( function(player){
        var num2 = 0;
        info[0][num][0] = [];
        player.bicho.nodos.forEach( function(nodo){
            info[0][num][0].push(player.bicho.crearNodoMin(num2, nodo));
            num2++;
        });
        info[0][num][1] = player.bicho.hitbox;
        num++;
    });
    return info;
}
/*================================================*/
/*Constructor de los player
===============================*/

function Player(id, x, y,nombre){
    this.nombre = nombre;
	this.id = id;
    this.bicho = new Bicho(x,y,width,height);
    //this.bicho.evolucionar();
    players.push(this);
}
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
setInterval(function() {
    calcularHitbox();
    regenerarMapa();
}, 350);
function calcularHitbox() {
    players.forEach(function(player) {
        player.bicho.calcularHitbox();
    });
}
function regenerarMapa() {

}
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
/* GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS */
function generarPlantas() {
    for(var i=0; i<20; i++) {
        var x = Math.random()*2800+100;
        var y = Math.random()*2800+100;
        var planta = new p.Planta(x, y, 0);
        var nodosPlanta = [];
        planta.nodos.forEach(function(nodo) {
            nodosPlanta.push(planta.crearNodoMin(nodo));
        });
        plantasMundo.push(nodosPlanta);
    }
}
generarPlantas();
/* GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS */
