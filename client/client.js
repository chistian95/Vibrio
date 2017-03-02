var canvas = document.getElementById('canvasBicho');
var ctx = canvas.getContext("2d");
var alto;
reescalar();
test();

function reescalar() {
    alto = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = alto;
}

function pintarCuadrado(x, y, w, h) {
    var xp = alto * x / 100;
    var yp = alto * y / 100;
    var wp = alto * w / 100;
    var hp = alto * h / 100;
    ctx.fillRect(xp, yp, wp, hp);
}

setInterval(function() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pintarCuadrado(10, 10, 20, 20);
}, 20);
