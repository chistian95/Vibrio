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
                    //player.x = info.player.x;
                    //player.y = info.player.y;
                    player.dir = info.player.dir;
                }
            });
		}
        /*Enviarle al cliente el arraylist de players y de playersDesconectados (y mas cosas, pero por ahora solo eso)*/
		client.emit('sync', getInfo());
        /*Enviarle a todos los clientes el arraylist de players y de playersDesconectadosd (y mas cosas, pero por ahora solo eso)*/
		client.broadcast.emit('sync', getInfo());
	});

    /*Al desconecarse el cliente*/
    client.on('disconnect', function(){
        //playersDesc.push(playerid);
        //players.slice(playerid, 1);
        for(var i=0;i<players.length;i++){
            if(players[i].id === playerid){
                playersDesc.push(players[i]);
                players.splice(i, 1);
            }

        }
        //onDisconnect(client);
    });
});
/*==============================================================================*/

/*Coger la información para mandarsela al cliente
==================================================*/
function getInfo(){
    var info = {};
    info.players = players;
    if(playersDesc.length>0){
        info.playersDesc = playersDesc;//Enviarle a cada cliente los clientes que se han desconectado
        playersDesc = [] //Como el cliente ya sabe quienes son, no los necesitamos más
    }
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
    this.bicho = new Bicho();
    players.push(this);
    var num = players.indexOf(this);
    //Aquí va la manteca
    this.bicho.evolucionar();
    this.bicho.update();
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
        player.bicho.update(); //Aquí va la manteca
    });
}
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/

var Bicho = function() {

    console.log("nuevo")
    this.x = 0;
    this.y = 0;
    this.velocidadGiro = 0;
    this.contFase = 0;
    this.nodos = [];
    this.nodoCentral = null;
    this.arriba = false;
    this.abajo = false;
    this.izquierda = false;
    this.derecha = false;

    this.update = function() {
        var anguloRad = nodoCentral.anguloActual * Math.PI / 180.0;
        if(this.arriba) {
            x -= Math.cos(anguloRad) * 2;
            y -= Math.sin(anguloRad) * 2;
        }
        if(this.abajo) {
            x += Math.cos(anguloRad) * 2;
            y += Math.sin(anguloRad) * 2;
        }

        var angulo = nodoCentral.anguloActual;
        if(this.izquierda) {
            angulo = angulo - velocidadGiro < 0 ? 360 : angulo - velocidadGiro;
        }
        if(this.derecha) {
            angulo = angulo + velocidadGiro > 360 ? 0 : angulo + velocidadGiro;
        }
        nodoCentral.anguloActual = angulo;

        this.mover(nodoCentral);
    }

    this.reiniciarNodos = function() {
        this.x = 350;
        this.y = 350;
        this.velocidadGiro = 1.0;
        this.nodos = [];
        this.contFase = 0;
        this.evolucionar();
        console.log("evo_fin")
    }

    this.evolucionar = function() {
        console.log(this.contFase)
        if(this.contFase === 0) {
            nodos = [];
            var cuerpo = new Nodo(TipoNodo.ESTATICO, null, 0, 50);
            new Nodo(TipoNodo.OJO, cuerpo, 120, 15); //Ojo1
            new Nodo(TipoNodo.OJO, cuerpo, 240, 15); //Ojo2
            nodoCentral = cuerpo;
        } else if(this.contFase === 1) {
            var cola1 = new Nodo(TipoNodo.MOTOR, nodoCentral, 0, 35);
            var cola2 = new Nodo(TipoNodo.FLEXIBLE, cola1, 0, 25);
            var cola3 = new Nodo(TipoNodo.FLEXIBLE, cola2, 0, 20);
            new Nodo(TipoNodo.MOTOR, cola3, 0, 18); //Cola4
        } else if(this.contFase === 2) {
            var cola1 = nodos[3];
            cola1.tipoNodo = TipoNodo.ESTATICO;
            cola1.anguloActual = 0;
            cola1.anguloGiro = 0;

            var cola2 = nodos[4];
            cola2.tipoNodo = TipoNodo.ESTATICO;
            cola2.anguloActual = 0;
            cola2.anguloGiro = 0;

            var cola3 = nodos[5];
            cola3.tipoNodo = TipoNodo.ESTATICO;
            cola3.anguloActual = 0;
            cola3.anguloGiro = 0;

            var cola4 = nodos[6];
            new Nodo(TipoNodo.PINCHO, cola4, 30, 7); //Pincho1
            new Nodo(TipoNodo.PINCHO, cola4, -30, 7);//Pincho2

            var pataIzq1 = new Nodo(TipoNodo.MOTOR, cola1, 90, 7);
            var pataDrc1 = new Nodo(TipoNodo.MOTOR, cola1, -90, 7);
            new Nodo(TipoNodo.FLEXIBLE, pataIzq1, 0, 7);
            new Nodo(TipoNodo.FLEXIBLE, pataDrc1, 0, 7);

            var pataIzq2 = new Nodo(TipoNodo.MOTOR, cola2, 90, 7);
            var pataDrc2 = new Nodo(TipoNodo.MOTOR, cola2, -90, 7);
            new Nodo(TipoNodo.FLEXIBLE, pataIzq2, 0, 7);
            new Nodo(TipoNodo.FLEXIBLE, pataDrc2, 0, 7);

            var pataIzq3 = new Nodo(TipoNodo.MOTOR, cola3, 90, 7);
            var pataDrc3 = new Nodo(TipoNodo.MOTOR, cola3, -90, 7);
            new Nodo(TipoNodo.FLEXIBLE, pataIzq3, 0, 7);
            new Nodo(TipoNodo.FLEXIBLE, pataDrc3, 0, 7);
        } else if(this.contFase === 3) {
            new Nodo(TipoNodo.OJO, nodoCentral, 100, 15);//Ojo3
            new Nodo(TipoNodo.OJO, nodoCentral, 260, 15);//Ojo4
            new Nodo(TipoNodo.PINCHO, nodoCentral, 200, 7);//Pincho3
            new Nodo(TipoNodo.PINCHO, nodoCentral, 160, 7);//Pincho4

            var pataIzq1_1 = nodos[11];
            var pataDrc1_1 = nodos[12];
            pataIzq1_1.tipoNodo = TipoNodo.ESTATICO;
            pataIzq1_1.anguloActual = 0;
            pataIzq1_1.anguloGiro = 0;
            pataDrc1_1.tipoNodo = TipoNodo.ESTATICO;
            pataDrc1_1.anguloActual = 0;
            pataDrc1_1.anguloGiro = 0;

            var pataIzq2_1 = nodos[15];
            var pataDrc2_1 = nodos[16];
            pataIzq2_1.tipoNodo = TipoNodo.ESTATICO;
            pataIzq2_1.anguloActual = 0;
            pataIzq2_1.anguloGiro = 0;
            pataDrc2_1.tipoNodo = TipoNodo.ESTATICO;
            pataDrc2_1.anguloActual = 0;
            pataDrc2_1.anguloGiro = 0;

            var pataIzq3_1 = nodos[19];
            var pataDrc3_1 = nodos[20];
            pataIzq3_1.tipoNodo = TipoNodo.ESTATICO;
            pataIzq3_1.anguloActual = 0;
            pataIzq3_1.anguloGiro = 0;
            pataDrc3_1.tipoNodo = TipoNodo.ESTATICO;
            pataDrc3_1.anguloActual = 0;
            pataDrc3_1.anguloGiro = 0;

            var pataIzq1_2 = new Nodo(TipoNodo.FLEXIBLE, pataIzq1_1, 0, 7);
            var pataIzq1_3 = new Nodo(TipoNodo.MOTOR, pataIzq1_2, 0, 7);
            var pataIzq1_4 = new Nodo(TipoNodo.FLEXIBLE, pataIzq1_3, 0, 7);
            new Nodo(TipoNodo.ESTATICO, pataIzq1_4, 0, 7);
            var pataDrc1_2 = new Nodo(TipoNodo.FLEXIBLE, pataDrc1_1, 0, 7);
            var pataDrc1_3 = new Nodo(TipoNodo.MOTOR, pataDrc1_2, 0, 7);
            var pataDrc1_4 = new Nodo(TipoNodo.FLEXIBLE, pataDrc1_3, 0, 7);
            new Nodo(TipoNodo.ESTATICO, pataDrc1_4, 0, 7);

            var pataIzq2_2 = new Nodo(TipoNodo.FLEXIBLE, pataIzq2_1, 0, 7);
            var pataIzq2_3 = new Nodo(TipoNodo.MOTOR, pataIzq2_2, 0, 7);
            var pataIzq2_4 = new Nodo(TipoNodo.FLEXIBLE, pataIzq2_3, 0, 7);
            new Nodo(TipoNodo.ESTATICO, pataIzq2_4, 0, 7);
            var pataDrc2_2 = new Nodo(TipoNodo.FLEXIBLE, pataDrc2_1, 0, 7);
            var pataDrc2_3 = new Nodo(TipoNodo.MOTOR, pataDrc2_2, 0, 7);
            var pataDrc2_4 = new Nodo(TipoNodo.FLEXIBLE, pataDrc2_3, 0, 7);
            new Nodo(TipoNodo.ESTATICO, pataDrc2_4, 0, 7);

            var pataIzq3_2 = new Nodo(TipoNodo.FLEXIBLE, pataIzq3_1, 0, 7);
            var pataIzq3_3 = new Nodo(TipoNodo.MOTOR, pataIzq3_2, 0, 7);
            var pataIzq3_4 = new Nodo(TipoNodo.FLEXIBLE, pataIzq3_3, 0, 7);
            new Nodo(TipoNodo.ESTATICO, pataIzq3_4, 0, 7);
            var pataDrc3_2 = new Nodo(TipoNodo.FLEXIBLE, pataDrc3_1, 0, 7);
            var pataDrc3_3 = new Nodo(TipoNodo.MOTOR, pataDrc3_2, 0, 7);
            var pataDrc3_4 = new Nodo(TipoNodo.FLEXIBLE, pataDrc3_3, 0, 7);
            new Nodo(TipoNodo.ESTATICO, pataDrc3_4, 0, 7);
        }
        this.contFase++;
    }

    this.pintar = function(ctx) {
        this.nodos.forEach(function(nodo) {
            nodo.pintar(ctx);
        });
    }


    var Nodo = function(tipoNodo, nodoPadre, anguloInicio, radio){
        console.log("nodo")
        this.x = 0;
        this.y = 0;
        this.anguloActual = 0;
        this.anguloGiro = 0;
        this.anguloBajar = 0;
        this.visible = false;
        this.tipoNodo = tipoNodo;
        this.nodoPadre = nodoPadre;
        this.anguloInicio = anguloInicio;
        this.radio = radio;
        this.anguloTope = 15;
        this.nodos = [];
        nodos.push(this);
        if(this.nodoPadre !== null) {
            nodoPadre.nodos.push(this);
        }
        this.visible = true;


        this.pintar = function(ctx) {
            if(!this.visible) {
                return;
            }
            var xAbs = this.x - this.radio;
            var yAbs = this.y - this.radio;
            var radioAbs = this.radio * 2.0;

            ctx.fillRect(xAbs, yAbs, radioAbs, radioAbs);

            var xSel = this.x -this. radio / 8.0;
            var ySel = this.y - this.radio / 8.0;
            var radioSel = this.radio / 4.0;

            ctx.fillRect(xSel, ySel, radioSel, radioSel);
        }
    }

    this.mover = function(nodo) { //No sé si está bien del todo*
        if(nodo.tipoNodo === TipoNodo.MOTOR) {
            if(nodo.anguloBajar) {
                nodo.anguloGiro = nodo.anguloGiro - this.velocidadGiro() <= -nodo.anguloTope ? -nodo.anguloTope : nodo.anguloGiro - this.velocidadGiro();
                nodo.anguloBajar = nodo.anguloGiro > -nodo.anguloTope;
            } else {
                nodo.anguloGiro = nodo.anguloGiro + this.velocidadGiro() >= nodo.anguloTope ? nodo.anguloTope : nodo.anguloGiro + this.velocidadGiro();
            }
        } else if(nodo.tipoNodo === TipoNodo.FLEXIBLE) {
            if(nodo.nodoPadre.anguloBajar) {
                nodo.anguloGiro = nodo.nodoPadre.anguloGiro - this.velocidadGiro();
            } else {
                nodo.anguloGiro = nodo.nodoPadre.anguloGiro + this.velocidadGiro();
            }
        }

        if(this.nodoPadre == null) {
            nodo.x = this.x;
            nodo.y = this.y;
        } else {
            var centroX = nodo.nodoPadre.x;
            var centroY = nodo.nodoPadre.y;
            nodo.anguloActual = nodo.nodoPadre.anguloActual + nodo.nodoPadre.anguloGiro + nodo.anguloInicio;
            var angulo = nodo.anguloActual * Math.PI / 180.0;
            var radioPadre = nodo.nodoPadre.radio;
            nodo.x = Math.cos(angulo) * radioPadre + centroX;
            nodo.y = Math.sin(angulo) * radioPadre + centroY;
        }
        this.nodos.forEach(function(nodo) {
           this.mover(nodo);
        });
    }
}



var TipoNodo = function(color){
    var color;
    this.color = color;
}

TipoNodo.ESTATICO = new TipoNodo([0, 255, 0, 64]);
TipoNodo.MOTOR = new TipoNodo([255, 0, 0, 64]);
TipoNodo.FLEXIBLE = new TipoNodo([0, 255, 255, 64]);
TipoNodo.PINCHO = new TipoNodo([0, 0, 255, 64]);
TipoNodo.OJO = new TipoNodo([255, 255, 0, 64]);
