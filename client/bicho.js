var Bicho = function() {
    this.x = 0;
    this.y = 0;
    this.debug = false;
    this.velocidadGiro = 0;
    this.contFase = 0;
    this.nodos = [];
    this.nodoCentral = null;
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
            nodo.visible = nodoMin[3];
            nodo.tipoNodo = nodoMin[4];
            nodo.radio = nodoMin[5]/2.0;
        } else {
            var nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5]/2.0);
            this.nodos.push(nodo);
        }
    }
}

var Nodo = function(x, y, visible, tipoNodo, radio){
    this.x = x;
    this.y = y;
    this.visible = visible;
    this.tipoNodo = tipoNodo;
    this.radio = radio;

    this.pintar = function(ctx) {
        if(!this.visible) return;
        var xAbs = this.x - this.radio;
        var yAbs = this.y - this.radio;
        var radioAbs = this.radio * 2;
        ctx.beginPath();
        ctx.arc(xAbs+radioAbs/2, yAbs+radioAbs/2, radioAbs, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(' + this.tipoNodo.color[0] + ', ' + this.tipoNodo.color[1] + ', ' + this.tipoNodo.color[2] + ', 0.25)';
        ctx.fill();

        var xSel = this.x -this. radio / 8.0;
        var ySel = this.y - this.radio / 8.0;
        var radioSel = this.radio / 4.0;
        ctx.beginPath();
        ctx.arc(xSel+radioSel/2, ySel+radioSel/2, radioSel, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'black';
        ctx.fill();
    }

    this.debug = function(ctx) {
        ctx.fillText("X: "+this.nodo.x,10,10);
        ctx.fillText("Y: "+this.nodo.y,10,30);
        ctx.fillText("Tipo: "+this.nodo.tipoNodo,30,10);
        ctx.fillText("Radio: "+this.nodo.radio,30,30);
        if(!this.visible) {
            ctx.fillText("Invisible: "+this.nodo,30,30);
            var xAbs = this.x - this.radio;
            var yAbs = this.y - this.radio;
            var radioAbs = this.radio * 2;
            ctx.beginPath();
            ctx.arc(xAbs+radioAbs/2, yAbs+radioAbs/2, radioAbs, 0, 2 * Math.PI, false);
            var c1 = Math.max(this.tipoNodo.color[0]-100,0);
            var c2 = Math.max(this.tipoNodo.color[1]-100,0);
            var c3 = Math.max(this.tipoNodo.color[2]-100,0);
            ctx.fillStyle = 'rgba(' + c1 + ', ' + c2 + ', ' + c3 + ', 0.20)';
            ctx.fill();

            var xSel = this.x -this. radio / 8.0;
            var ySel = this.y - this.radio / 8.0;
            var radioSel = this.radio / 4.0;
            ctx.beginPath();
            ctx.arc(xSel+radioSel/2, ySel+radioSel/2, radioSel, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(' + 50 + ', ' + 50 + ', ' + 50 + ', 0.5)';
            ctx.fill();
        }
    }
}

var TipoNodo = function(color){
    this.color = color;
}

TipoNodo.ESTATICO = new TipoNodo([0, 255, 0, 0.25]);
TipoNodo.MOTOR = new TipoNodo([255, 0, 0, 0.25]);
TipoNodo.FLEXIBLE = new TipoNodo([0, 255, 255, 0.25]);
TipoNodo.PINCHO = new TipoNodo([0, 0, 255, 0.25]);
TipoNodo.OJO = new TipoNodo([255, 255, 0, 0.25]);
