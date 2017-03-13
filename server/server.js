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
idPlantas = [];

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

    client.on('chocar', function(info){
        var atacante = "Null";
        var atacado = "Null";
        var numPlayerAtacante = 0;
        var numPlayerAtacado = 0;
        var num = 0;
        players.forEach(function(playeros) {
            if(info.idAtacante == playeros.id) {
                atacante = playeros.nombre;
                numPlayerAtacante = num;
            } else if(info.idAtacado == playeros.id) {
                atacado = playeros.nombre;
                playerAtacado = playeros;
                numPlayerAtacado = num;
            }
            num++;
        });
        try {
            try {
                var distanciaX = players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].x - players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].x;
                var distanciaY = players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].y - players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].y;
             } catch(err) {
                 console.log("Error en xy");
             }
            try {
                var sumaRadios = players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].radio +  players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].radio;
            } catch(err) {
                console.log("Error en radio");
            }
            if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                matarNodos(players[numPlayerAtacado].bicho, players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado]);
                console.log("COLISION: "+atacante+" con el nodo nº"+info.numNodoAtacante+" ha atacando a "+atacado+" en el nodo nº"+info.numNodoAtacado);
            }
        } catch(err) {
            console.log("=======================================")
            console.log("Error: "+players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante]);
            console.log("Error: "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado]);
            console.log("Error: "+players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].radio);
            console.log("Error: "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].radio);
            console.log(players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].x+" "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].x)
            console.log(players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].y+" "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].y)
            console.log("=======================================")
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
}, 500);
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
    for(var i=0; i<15; i++) {
        var tipoPlanta = Math.round(Math.random() * 4);
        var x = Math.random()*(width-200)+100;
        var y = Math.random()*(width-200)+100;
        var planta = new p.Planta(x, y, tipoPlanta);
        var nodosPlanta = [];
        planta.nodos.forEach(function(nodo) {
            nodosPlanta.push(planta.crearNodoMin(nodo));
        });
        plantasMundo.push(nodosPlanta);
    }
}
generarPlantas();
for(var i=0;i<10;i++) {
    var p = new Player(i,Math.random()*width,Math.random()*height,"bot");
    var derechizqr = Math.round(Math.random()*1);
    if(derechizqr==0)p.bicho.derecha = true;
    else p.bicho.izquierda = true;
    var arribabajo = Math.round(Math.random()*1);
    if(arribabajo==0)p.bicho.arriba = true;
    else p.bicho.atras = true;
    var evolucion = Math.round(Math.random()*3);
    if(evolucion!=0) for(var x=evolucion;x>0;x--) p.bicho.evolucionar();
    ids[i] = true;
}
/* GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS */
