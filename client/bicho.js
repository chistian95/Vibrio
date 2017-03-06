var Bicho = function() {
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

    this.pintar = function(ctx) {
        this.nodos.forEach(function(nodo) {
            nodo.pintar(ctx);
        });
    }


    this.reiniciarNodos = function() {
        this.x = 350;
        this.y = 350;
        this.velocidadGiro = 1.0;
        this.nodos = [];
        this.contFase = 0;
        this.evolucionar();
    }

    this.evolucionar = function() {
        gusano(this, this.contFase);
        this.contFase++;
    }

    this.reiniciarNodos();
}

var Nodo = function(bicho, tipoNodo, nodoPadre, anguloInicio, radio){
    this.x = 0;
    this.y = 0;
    this.visible = false;

    this.bicho = bicho;
    this.tipoNodo = tipoNodo;
    this.nodoPadre = nodoPadre;
    this.radio = radio/2;
    this.nodos = [];
    this.bicho.nodos.push(this);
    if(this.nodoPadre !== null) {
        this.nodoPadre.nodos.push(this);
    }
    this.visible = true;

    this.pintar = function(ctx) {
        if(!this.visible) {
            return;
        }
        var xAbs = this.x - this.radio;
        var yAbs = this.y - this.radio;
        var radioAbs = this.radio * 2;
        /*
        ctx.setColor(tipoNodo.color);
        ctx.fillOval(xAbs, yAbs, radioAbs, radioAbs);
        */
        ctx.beginPath();
        ctx.arc(xAbs+radioAbs/2, yAbs+radioAbs/2, radioAbs, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();

        var xSel = this.x -this. radio / 8.0;
        var ySel = this.y - this.radio / 8.0;
        var radioSel = this.radio / 4.0;
        /*
        ctx.setColor(Color.BLACK);
        ctx.fillOval(xSel, ySel, radioSel, radioSel);
        */
        //ctx.fillRect(xSel, ySel, radioSel, radioSel);
        ctx.beginPath();
        ctx.arc(xSel, ySel, radioSel, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();


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

function gusano(bicho, fase) {
    if(fase === 0) {
        gusanoFase0(bicho);
    } else if(fase === 1) {
        gusanoFase1(bicho);
    } else if(fase === 2) {
        gusanoFase2(bicho);
    } else if(fase === 3) {
        gusanoFase3(bicho);
    }
}
function gusanoFase0(bicho) {
    bicho.nodos = [];
    var cuerpo = new Nodo(bicho, TipoNodo.ESTATICO, null, 0, 50);
    new Nodo(bicho, TipoNodo.OJO, cuerpo, 120, 15); //Ojo1
    new Nodo(bicho, TipoNodo.OJO, cuerpo, 240, 15); //Ojo2
    bicho.nodoCentral = cuerpo;
}
function gusanoFase1(bicho) {
    var cola1 = new Nodo(bicho, TipoNodo.MOTOR, bicho.nodoCentral, 0, 35);
    var cola2 = new Nodo(bicho, TipoNodo.FLEXIBLE, cola1, 0, 25);
    var cola3 = new Nodo(bicho, TipoNodo.FLEXIBLE, cola2, 0, 20);
    new Nodo(bicho, TipoNodo.MOTOR, cola3, 0, 18); //Cola4
}
function gusanoFase2(bicho) {
    var cola1 = bicho.nodos[3];
    cola1.tipoNodo = TipoNodo.ESTATICO;
    cola1.anguloActual = 0;
    cola1.anguloGiro = 0;

    var cola2 = bicho.nodos[4];
    cola2.tipoNodo = TipoNodo.ESTATICO;
    cola2.anguloActual = 0;
    cola2.anguloGiro = 0;

    var cola3 = bicho.nodos[5];
    cola3.tipoNodo = TipoNodo.ESTATICO;
    cola3.anguloActual = 0;
    cola3.anguloGiro = 0;

    var cola4 = bicho.nodos[6];
    new Nodo(bicho, TipoNodo.PINCHO, cola4, 30, 7); //Pincho1
    new Nodo(bicho, TipoNodo.PINCHO, cola4, -30, 7);//Pincho2

    var pataIzq1 = new Nodo(bicho, TipoNodo.MOTOR, cola1, 90, 7);
    var pataDrc1 = new Nodo(bicho, TipoNodo.MOTOR, cola1, -90, 7);
    new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq1, 0, 7);
    new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc1, 0, 7);

    var pataIzq2 = new Nodo(bicho, TipoNodo.MOTOR, cola2, 90, 7);
    var pataDrc2 = new Nodo(bicho, TipoNodo.MOTOR, cola2, -90, 7);
    new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq2, 0, 7);
    new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc2, 0, 7);

    var pataIzq3 = new Nodo(bicho, TipoNodo.MOTOR, cola3, 90, 7);
    var pataDrc3 = new Nodo(bicho, TipoNodo.MOTOR, cola3, -90, 7);
    new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq3, 0, 7);
    new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc3, 0, 7);
}
function gusanoFase3(bicho) {
    new Nodo(bicho, TipoNodo.OJO, bicho.nodoCentral, 100, 15);//Ojo3
    new Nodo(bicho, TipoNodo.OJO, bicho.nodoCentral, 260, 15);//Ojo4
    new Nodo(bicho, TipoNodo.PINCHO, bicho.nodoCentral, 200, 7);//Pincho3
    new Nodo(bicho, TipoNodo.PINCHO, bicho.nodoCentral, 160, 7);//Pincho4

    var pataIzq1_1 = bicho.nodos[11];
    var pataDrc1_1 = bicho.nodos[12];
    pataIzq1_1.tipoNodo = TipoNodo.ESTATICO;
    pataIzq1_1.anguloActual = 0;
    pataIzq1_1.anguloGiro = 0;
    pataDrc1_1.tipoNodo = TipoNodo.ESTATICO;
    pataDrc1_1.anguloActual = 0;
    pataDrc1_1.anguloGiro = 0;

    var pataIzq2_1 = bicho.nodos[15];
    var pataDrc2_1 = bicho.nodos[16];
    pataIzq2_1.tipoNodo = TipoNodo.ESTATICO;
    pataIzq2_1.anguloActual = 0;
    pataIzq2_1.anguloGiro = 0;
    pataDrc2_1.tipoNodo = TipoNodo.ESTATICO;
    pataDrc2_1.anguloActual = 0;
    pataDrc2_1.anguloGiro = 0;

    var pataIzq3_1 = bicho.nodos[19];
    var pataDrc3_1 = bicho.nodos[20];
    pataIzq3_1.tipoNodo = TipoNodo.ESTATICO;
    pataIzq3_1.anguloActual = 0;
    pataIzq3_1.anguloGiro = 0;
    pataDrc3_1.tipoNodo = TipoNodo.ESTATICO;
    pataDrc3_1.anguloActual = 0;
    pataDrc3_1.anguloGiro = 0;

    var pataIzq1_2 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq1_1, 0, 7);
    var pataIzq1_3 = new Nodo(bicho, TipoNodo.MOTOR, pataIzq1_2, 0, 7);
    var pataIzq1_4 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq1_3, 0, 7);
    new Nodo(bicho, TipoNodo.ESTATICO, pataIzq1_4, 0, 7);
    var pataDrc1_2 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc1_1, 0, 7);
    var pataDrc1_3 = new Nodo(bicho, TipoNodo.MOTOR, pataDrc1_2, 0, 7);
    var pataDrc1_4 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc1_3, 0, 7);
    new Nodo(bicho, TipoNodo.ESTATICO, pataDrc1_4, 0, 7);

    var pataIzq2_2 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq2_1, 0, 7);
    var pataIzq2_3 = new Nodo(bicho, TipoNodo.MOTOR, pataIzq2_2, 0, 7);
    var pataIzq2_4 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq2_3, 0, 7);
    new Nodo(bicho, TipoNodo.ESTATICO, pataIzq2_4, 0, 7);
    var pataDrc2_2 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc2_1, 0, 7);
    var pataDrc2_3 = new Nodo(bicho, TipoNodo.MOTOR, pataDrc2_2, 0, 7);
    var pataDrc2_4 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc2_3, 0, 7);
    new Nodo(bicho, TipoNodo.ESTATICO, pataDrc2_4, 0, 7);

    var pataIzq3_2 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq3_1, 0, 7);
    var pataIzq3_3 = new Nodo(bicho, TipoNodo.MOTOR, pataIzq3_2, 0, 7);
    var pataIzq3_4 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataIzq3_3, 0, 7);
    new Nodo(bicho, TipoNodo.ESTATICO, pataIzq3_4, 0, 7);
    var pataDrc3_2 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc3_1, 0, 7);
    var pataDrc3_3 = new Nodo(bicho, TipoNodo.MOTOR, pataDrc3_2, 0, 7);
    var pataDrc3_4 = new Nodo(bicho, TipoNodo.FLEXIBLE, pataDrc3_3, 0, 7);
    new Nodo(bicho, TipoNodo.ESTATICO, pataDrc3_4, 0, 7);
}
