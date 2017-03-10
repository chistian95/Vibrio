
var circulo = function(graphics,x,y,radio,tipoNodo) {
    alert("circulo")

}

var Bicho = function(stage) {
    this.x = 0;
    this.y = 0;
    this.stage = stage
    this.debug = false;
    this.velocidadGiro = 0;
    this.contFase = 0;
    this.nodos = [];
    this.arriba = false;
    this.abajo = false;
    this.izquierda = false;
    this.derecha = false;
    this.pintar = function(ctx,nodoDebugNum) {
        this.nodos.forEach(function(nodo) {
            nodo.pintar(ctx);
        });
        if(this.debug) {
            if(this.nodos[nodoDebugNum]) this.nodos[nodoDebugNum].debug(ctx);
        }
    }

    this.parsearNodo = function(nodoMin) {
        var pos = nodoMin[0];
        if(pos === undefined) return;
        if(this.nodos.length > pos) {
            var nodo = this.nodos[pos];
            nodo.x = nodoMin[1];
            nodo.y = nodoMin[2];
            nodo.sprite.x = nodo.x;
            nodo.sprite.y = nodo.y;
            nodo.visible = nodoMin[3];
            nodo.tipoNodo = nodoMin[4];
            nodo.radio = nodoMin[5];
            nodo.anguloActual = nodoMin[6];
        } else {
            var nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5], nodoMin[6],this.stage);
            this.nodos.push(nodo);
        }
    }
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "0x" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

var Nodo = function(x, y, visible, tipoNodo, radio, anguloActual,stage){
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(0);
    graphics.beginFill(rgb2hex('rgba(' + tipoNodo.color[0] + ', ' + tipoNodo.color[1] + ', ' + tipoNodo.color[2] + ', 0.25)'));
    graphics.drawCircle(10000, 202002,radio);
    graphics.endFill();
    this.sprite = new PIXI.Sprite(graphics.generateCanvasTexture());
    this.sprite.anchor.set(0.5)
    stage.addChild(this.sprite);
    this.x = x;
    this.y = y;
    this.visible = visible;
    this.tipoNodo = tipoNodo;
    this.radio = radio;
    this.anguloActual = anguloActual;

    this.debug = function(ctx) {
        ctx.font = "12px Comic Sans MS";
        ctx.fillText("X: "+this.x,80,10);
        ctx.fillText("Y: "+this.y,80,30);
        var tipo = "Error"
        var colores = []
        colores.push(TipoNodo.ESTATICO.color);
        colores.push(TipoNodo.OJO.color);
        colores.push(TipoNodo.MOTOR.color);
        colores.push(TipoNodo.FLEXIBLE.color);
        for(var i=0;i<=3;i++) { //No sé por qué no me cogía this.nodo === TipoNodo.OJO o ESTATICO ._.
            if(this.tipoNodo.color[0] === colores[i][0] &&
               this.tipoNodo.color[1] === colores[i][1] &&
               this.tipoNodo.color[2] === colores[i][2] &&
               this.tipoNodo.color[3] === colores[i][3])
                    switch(i) {
                        case 0: tipo="Estatico";break;
                        case 1: tipo="Ojo";break;
                        case 2: tipo="Motor";break;
                        case 3: tipo="Flexible";break;
                    }
        }
        ctx.fillText("Tipo: "+tipo,230,10);
        ctx.fillText("Radio: "+this.radio,230,30);
        ctx.fillText("Invisible: "+this.visible,330,10);
        var xAbs = this.x - this.radio;
        var yAbs = this.y - this.radio;
        var radioAbs = this.radio * 2;
        ctx.beginPath();
        ctx.arc(xAbs+radioAbs/2, yAbs+radioAbs/2, radioAbs, 0, 2 * Math.PI, false);
        var c1 = Math.max(this.tipoNodo.color[0]-100,0);
        var c2 = Math.max(this.tipoNodo.color[1]-100,0);
        var c3 = Math.max(this.tipoNodo.color[2]-100,0);
        ctx.fillStyle = 'rgba(' + c1 + ', ' + c2 + ', ' + c3 + ', 0.7)';
        ctx.fill();

        var xSel = this.x -this. radio / 8.0;
        var ySel = this.y - this.radio / 8.0;
        var radioSel = this.radio / 4.0;
        ctx.beginPath();
        ctx.arc(xSel+radioSel/2, ySel+radioSel/2, radioSel, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

var TipoNodo = function(color){
    this.color = color;
}

TipoNodo.ESTATICO = new TipoNodo([0, 255, 0, 64]);
TipoNodo.MOTOR = new TipoNodo([255, 0, 0, 64]);
TipoNodo.FLEXIBLE = new TipoNodo([0, 255, 255, 64]);
TipoNodo.PINCHO = new TipoNodo([0, 0, 255, 64]);
TipoNodo.OJO = new TipoNodo([255, 255, 0, 64]);
