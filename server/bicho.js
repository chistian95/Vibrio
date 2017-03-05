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
    }

    this.evolucionar = function() {
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
                nodo.anguloGiro = nodo.anguloGiro - this.velocidadGiro <= -nodo.anguloTope ? -nodo.anguloTope : nodo.anguloGiro - this.velocidadGiro;
                nodo.anguloBajar = nodo.anguloGiro > -nodo.anguloTope;
            } else {
                nodo.anguloGiro = nodo.anguloGiro + this.velocidadGiro >= nodo.anguloTope ? nodo.anguloTope : nodo.anguloGiro + this.velocidadGiro;
            }
        } else if(nodo.tipoNodo === TipoNodo.FLEXIBLE) {
            if(nodo.nodoPadre.anguloBajar) {
                nodo.anguloGiro = nodo.nodoPadre.anguloGiro - this.velocidadGiro;
            } else {
                nodo.anguloGiro = nodo.nodoPadre.anguloGiro + this.velocidadGiro;
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

module.exports = {
    Bicho: Bicho,
    TipoNodo: TipoNodo,
};