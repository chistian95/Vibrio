var canvas = document.getElementById('canvasBicho');
var ctx = canvas.getContext("2d");
var alto;
var bicho = new Bicho();
reescalar();

function reescalar() {
    alto = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = alto;
}

setInterval(function() {
    bicho.update();
    bicho.pintar(ctx);
}, 20);
