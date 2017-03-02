var Bicho = {
    var x, y;
    var velocidadGiro;
    var contFase;
    var nodos;
    var nodoCentral;
    var arriba, abajo, izquierda, derecha;

    reiniciarNodos();
}

Bicho.update() {
    if(nodoCentral == null) {
        return;
    }
    double anguloRad = Math.toRadians(nodoCentral.getAnguloActual());
    if(arriba) {
        x -= Math.cos(anguloRad) * 2;
        y -= Math.sin(anguloRad) * 2;
    }
    if(abajo) {
        x += Math.cos(anguloRad) * 2;
        y += Math.sin(anguloRad) * 2;
    }

    double angulo = nodoCentral.getAnguloActual();
    if(izquierda) {
        angulo = angulo - velocidadGiro < 0 ? 360 : angulo - velocidadGiro;
    }
    if(derecha) {
        angulo = angulo + velocidadGiro > 360 ? 0 : angulo + velocidadGiro;
    }
    nodoCentral.setAnguloActual(angulo);

    nodoCentral.mover();
}

Bicho.reiniciarNodos() {
    x = 350;
    y = 350;
    velocidadGiro = 1.0;
    nodos = [];
    contFase = 0;
    evolucionar();
}

Bicho.evolucionar() {
    ConstructorBichos.gusano(this, contFase);
    contFase++;
}

Bicho.pintar(ctx) {
    for(nodo in nodos) {
        if(nodo === null) {
            continue;
        }
        nodo.pintar(ctx);
    }
}

var Nodo = function(bicho, tipoNodo, nodoPadre, anguloInicio, radio){
    var x, y, radio;
    var anguloInicio, anguloActual, anguloGiro, anguloTope, anguloBajar;
    var visible;
    var tipoNodo;
    var nodoPadre;
    var bicho;
    var nodos;

    this.bicho = bicho;
    this.tipoNodo = tipoNodo;
    this.nodoPadre = nodoPadre;
    this.aguloInicio = anguloInicio;
    this.radio = radio;
    anguloTope = 15;
    nodos = [];
    bicho.nodos.push(this);
    if(nodoPadre !== null) {
        nodoPadre.nodos.push(this);
    }
    visible = true;
}

Nodo.mover() {
    if(tipoNodo === TipoNodo.MOTOR) {
        if(anguloBajar) {
            anguloGiro = anguloGiro - bicho.getVelocidadGiro() <= -anguloTope ? -anguloTope : anguloGiro - bicho.getVelocidadGiro();
            anguloBajar = anguloGiro > -anguloTope;
        } else {
            anguloGiro = anguloGiro + bicho.getVelocidadGiro() >= anguloTope ? anguloTope : anguloGiro + bicho.getVelocidadGiro();
        }
    } else if(tipoNodo === TipoNodo.FLEXIBLE) {
        if(nodoPadre.anguloBajar) {
            anguloGiro = nodoPadre.anguloGiro - bicho.getVelocidadGiro();
        } else {
            anguloGiro = nodoPadre.anguloGiro + bicho.getVelocidadGiro();
        }
    }

    if(nodoPadre === null) {
        x = bicho.x;
        y = bicho.y;
    } else {
        var centroX = nodoPadre.x;
        var centroY = nodoPadre.y;
        anguloActual = nodoPadre.getAnguloActual() + nodoPadre.getAnguloGiro() + anguloInicio;
        var angulo = Math.toRadians(anguloActual);
        var radioPadre = nodoPadre.getRadio();
        x = Math.cos(angulo) * radioPadre + centroX;
        y = Math.sin(angulo) * radioPadre + centroY;
    }
    for(nodo in nodos) {
        nodo.mover();
    }
}

Nodo.pintar(ctx) {
    if(!visible) {
        return;
    }
    var xAbs = x - radio;
    var yAbs = y - radio;
    var radioAbs = radio * 2.0;
    /*
    ctx.setColor(tipoNodo.color);
    ctx.fillOval(xAbs, yAbs, radioAbs, radioAbs);
    */

    var xSel = x - radio / 8.0;
    var ySel = y - radio / 8.0;
    var radiOSel = radio / 4.0;
    /*
    ctx.setColor(Color.BLACK);
    ctx.fillOval(xSel, ySel, radioSel, radioSel);
    */
}
