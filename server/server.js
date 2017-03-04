players = [];
var express = require('express');
var app = express();
app.use(express.static(__dirname));

var server = app.listen(process.env.PORT || 8082, function () {
	var puerto = server.address().port;
	console.log('Servidor abierto en el puerto %s', puerto);
});

var io = require('socket.io')(server);

io.on('connection', function(client) {
    console.log('Nueva conexión.');

    client.on('crearJugadorServer', function(player){
        console.log(player.id + ' se ha conectado');
        var initX = Math.random()*500;
        var initY = Math.random()*500;
        client.emit('crearPlayerCliente', { id: player.id, local: true, x: initX, y: initY});
        players.forEach( function(player){client.emit('crearPlayerCliente', { id: player.id, local: false, x: player.x, y: player.y});});
        client.broadcast.emit('crearPlayerCliente', { id: player.id, local: false, x: initX, y: initY} );
        new Player(player.id,initX,initY,1);
    });

    client.on('sync', function(info){
		if(info.player != undefined){
			syncPlayer(info.player);
		}
		client.emit('sync', getInfo());
		client.broadcast.emit('sync', getInfo());
	});
});

function syncPlayer(infoPlayer){
    players.forEach( function(player){
        if(player.id == infoPlayer.id){
            //player.x = infoPlayer.x;
            //player.y = infoPlayer.y;
            player.dir = infoPlayer.dir;
        }
    });
}

function getInfo(){
    var gameData = {};
    gameData.players = players;
    return gameData;
}

function Player(id, x, y,dir){
	this.id = id;
	this.x = x;
	this.y = y;
    this.dir = dir;
    players.push(this);
}

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

setInterval(function(){
    moverPlayers();
}, 20);
