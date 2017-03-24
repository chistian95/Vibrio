function actualizarExp() {
    //0=size, 1=pinchos, 2=tentaculos, 3=coraza, 4=nodos, 5=ojos
    var alturaRectangulo = 46;
    var expTotal = expActual.nodos+expActual.ojos+expActual.tentaculos+expActual.size+expActual.pinchos+expActual.coraza;
    app.expSprite.clear();
    app.expSprite.lineStyle(5, 0x000000, 5);
    app.expSprite.beginFill(0x2c3e50, 1);
    app.expSprite.drawRoundedRect(0, alturaRectangulo, window.innerWidth/2, window.innerHeight/20, 15);
    app.expSprite.lineStyle(0);
    var TempExp = (expTotal/((nivel+1)*100))*window.innerWidth/2;
    if(!TempExp) TempExp = 2;
    app.expSprite.beginFill(0x16a085, 0.75);
    if(TempExp>2)app.expSprite.drawRect(0, alturaRectangulo, TempExp, window.innerHeight/20);
    app.expSprite.endFill();

    app.expSprite.children[0].text = Math.floor((expTotal/((nivel+1)*100))*100)+'%';
    app.spr_uiZise.children[0].text = Math.floor((expActual.size/((nivel+1)*100))*100)+'%';
    app.spr_uiOjo.children[0].text = Math.floor((expActual.ojos/((nivel+1)*100))*100)+'%';
    app.spr_uiPincho.children[0].text = Math.floor((expActual.pinchos/((nivel+1)*100))*100)+'%';
    app.spr_uiTentaculo.children[0].text = Math.floor((expActual.tentaculos/((nivel+1)*100))*100)+'%';
    app.spr_uiNodos.children[0].text = Math.floor((expActual.nodos/((nivel+1)*100))*100)+'%';
    app.spr_uiCoraza.children[0].text = Math.floor((expActual.coraza/((nivel+1)*100))*100)+'%';

    app.expRenderer.render(app.exp);
}

function declararSpriteDesdeTextura(textura,container, x = 0,y = 0,anchor = 0.5, z = 0) {
    var spriteTemp = new PIXI.Sprite(textura);
    spriteTemp.position.x = x;
    spriteTemp.position.y = y;
    spriteTemp.anchor.set(anchor);
    spriteTemp.zOrder = z;
    container.addChild(spriteTemp);
    return spriteTemp;
}

function addChildrenText(texto,father, x = 0, y = 0 , anchor = 0.5, font= 'Comic Sans MS', size = '20px', color = "#ffff00", z = 0) {
    var tempText = new PIXI.Text(texto, {fontFamily: font, fontSize:size, fill:color});
    tempText.position.x = x;
    tempText.position.y = y;
    tempText.anchor.set(anchor);
    father.addChild(tempText);
}


function init(servPlantas, pHitbox,t,ancho,alto) {
    game.localPlayer = t;
    if(players.length==1) game.debugInit();
    var nodosSprites = [];
    servPlantas.forEach(function(p) {
        nodosSprites = [];
        ndSprites = [];
        p.forEach(function(nodoPlanta) {
            //nodo.x, nodo.y, nodo.visible, nodo.tipoNodo, nodo.radio
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(0);
            graphics.beginFill(nodoPlanta[3].colorHex, 0.75);
            graphics.drawCircle(nodoPlanta[4], nodoPlanta[4], nodoPlanta[4]);
            graphics.endFill();
            var sprite = new PIXI.Sprite(graphics.generateCanvasTexture());

            sprite.anchor.set(0.5);
            sprite.position.x = nodoPlanta[0];
            sprite.position.y = nodoPlanta[1];
            sprite.interactive = true;
            app.world.addChild(sprite);

            ndSprites.push(sprite);

            var datos = {
                x: nodoPlanta[0],
                y: nodoPlanta[1],
                radio: nodoPlanta[4],
            }
            nodosSprites.push(datos);
        });
        plantas.push(nodosSprites);
        plantas[plantas.length-1].tipo = p[0][3].tipo;
        plantas[plantas.length-1].hitbox = pHitbox[plantas.length-1];
        plantasSprites.push(ndSprites);
    });

    app.bordeGraphics = new PIXI.Graphics();
    app.bordeGraphics.lineStyle(30, 0x8d8dc9, 30);
    app.bordeGraphics.drawRect(0, 0, ancho, alto);
    app.bordeSprite = new PIXI.Sprite(app.bordeGraphics.generateCanvasTexture());
    app.bordeSprite.interactive = true;
    app.bordeSprite.zOrder =5;
    app.bordeSprite.x = 0;
    app.bordeSprite.y = 0;
    app.world.addChild(app.bordeSprite);

    game.debugInit();
}
function crearBorde(ancho,alto) { //Se llama desde client.js al crear el player local.

}
/*======================================================================================*/
/*Funciones comunes entre nodos y bicho
========================================================================================*/
function matarNodos(nodo){
    if(nodo === undefined){
        return;
    }
    if(nodo.vida <= 0){
        if(nodo.nodoPadre === null){
            //MATAR BICHO
        }else{
            nodo.nodoPadre = null;
        }
    }else{
        nodo.vida = 0;
    }
    nodo.nodos.forEach(function(nodoHijo) {
        matarNodos(nodoHijo);
    });
}

function dañarNodo(bicho, nodo) {
    nodo.vida -= bicho.calcularDaño();
    if(nodo.vida <= 0) {
        matarNodos(nodo);
    }
}

function mover(bicho, nodo) { //No sé si está bien del todo*
    if(nodo === undefined || (nodo.nodoPadre === null && bicho.nodoCentral!==nodo)) {
        return;
    }
    if(nodo.tipoNodo === TipoNodo.MOTOR) {
        if(nodo.anguloBajar) {
            nodo.anguloGiro = nodo.anguloGiro - (bicho.velocidadGiro / 2) <= -nodo.anguloTope ? -nodo.anguloTope : nodo.anguloGiro - (bicho.velocidadGiro / 2);
            nodo.anguloBajar = nodo.anguloGiro > -nodo.anguloTope;
        } else {
            nodo.anguloGiro = nodo.anguloGiro + (bicho.velocidadGiro / 2) >= nodo.anguloTope ? nodo.anguloTope : nodo.anguloGiro + (bicho.velocidadGiro / 2);
            nodo.anguloBajar = nodo.anguloGiro >= nodo.anguloTope;
        }
    } else if(nodo.tipoNodo === TipoNodo.FLEXIBLE) {
        if(nodo.nodoPadre.anguloBajar) {
            nodo.anguloGiro = nodo.nodoPadre.anguloGiro - (bicho.velocidadGiro / 2);
        } else {
            nodo.anguloGiro = nodo.nodoPadre.anguloGiro + (bicho.velocidadGiro / 2);
        }
    }

    if(nodo.nodoPadre === null) {
        nodo.x = bicho.x;
        nodo.y = bicho.y;
    } else {
        var centroX = nodo.nodoPadre.x;
        var centroY = nodo.nodoPadre.y;
        nodo.anguloActual = nodo.nodoPadre.anguloActual + nodo.nodoPadre.anguloGiro + nodo.anguloInicio;
        var angulo = nodo.anguloActual * Math.PI / 180.0;
        var radioPadre = nodo.nodoPadre.radio;
        nodo.x = Math.cos(angulo) * radioPadre + centroX;
        nodo.y = Math.sin(angulo) * radioPadre + centroY;
    }

    nodo.nodos.forEach(function(nodoHijo) {
        mover(bicho, nodoHijo);
    });
}
/*=================================================*/
/*Inputs
==================================================*/
function teclitas(e) {
    if(e.keyCode === 87) game.localPlayer.arriba = true;
    if(e.keyCode === 83) game.localPlayer.abajo = true;
    if(e.keyCode === 65) game.localPlayer.izquierda = true;
    if(e.keyCode === 68) game.localPlayer.derecha = true;
}
function teclitasUp(e) {
    if(e.keyCode === 87) game.localPlayer.arriba = false;
    if(e.keyCode === 83) game.localPlayer.abajo = false;
    if(e.keyCode === 65) game.localPlayer.izquierda = false;
    if(e.keyCode === 68) game.localPlayer.derecha = false;
}
function actualizarRaton(e) {
    if(game.localPlayer) {
        game.localPlayer.ratonX = e.clientX;
        game.localPlayer.ratonY = e.clientY;
    }
}
function actualizarTouch(e) {
    if(game.localPlayer) {
        game.localPlayer.ratonX = e.touches[0].clientX;
        game.localPlayer.ratonY = e.touches[0].clientY;
    }
}
function posicionRaton() {
    if(game.movimiento) {
        var relX = game.localPlayer.ratonX - game.localPlayer.bicho.nodos[0].sprite.position.x+app.world.pivot.x;
        var relY = game.localPlayer.ratonY - game.localPlayer.bicho.nodos[0].sprite.position.y+app.world.pivot.y;
        var anguloBicho = game.localPlayer.bicho.nodos[0].anguloActual;
        var relAngulo = Math.atan2(relY, relX) * 180 / Math.PI + 180;
        var difAngulo = relAngulo - anguloBicho;
        if(difAngulo > -170 && (difAngulo < -10 || difAngulo > 190)) {
            game.localPlayer.derecha =  false;
            game.localPlayer.izquierda = true;
        } else if(difAngulo > 10 || difAngulo < -190) {
            game.localPlayer.derecha = true;
            game.localPlayer.izquierda = false;
        } else {
            game.localPlayer.derecha = false;
            game.localPlayer.izquierda = false;
        }
        var distancia = Math.sqrt(Math.pow(relX, 2) + Math.pow(relY, 2));
        var diametro = game.localPlayer.bicho.nodos[0].radio;
        if(distancia > diametro) {
            game.localPlayer.arriba = true;
        } else {
            game.localPlayer.arriba = false;
        }
    }else {
        game.localPlayer.derecha = false;
        game.localPlayer.izquierda = false;
        game.localPlayer.arriba = false;
    }
}
/*===============================================*/
function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "0x" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}
