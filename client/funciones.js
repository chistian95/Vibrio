function actualizarExp() {
    if(expActual) {
        //0=size, 1=pinchos, 2=tentaculos, 3=coraza, 4=nodos, 5=ojos
        var anchoBordeExp = app.expRenderer.height/30;
        var widthRect = window.innerWidth/2-anchoBordeExp*2;
        var heightRect = window.innerHeight/20-anchoBordeExp*2;
        var expTotal = expActual.nodos+expActual.ojos+expActual.tentaculos+expActual.size+expActual.pinchos+expActual.coraza;
        var TempExp = (expTotal/((nivel+1)*100))*window.innerWidth/2;
        app.expSpr.mask.width = Math.min(TempExp,widthRect-anchoBordeExp);
        app.expSpr.mask.height = heightRect-anchoBordeExp;
        app.expSpr.children[0].text = Math.floor((expTotal/((nivel+1)*100))*100)+'%';
        app.spr_uiZise.children[0].text = Math.floor((expActual.size/((nivel+1)*100))*100)+'%';
        app.spr_uiOjo.children[0].text = Math.floor((expActual.ojos/((nivel+1)*100))*100)+'%';
        app.spr_uiPincho.children[0].text = Math.floor((expActual.pinchos/((nivel+1)*100))*100)+'%';
        app.spr_uiTentaculo.children[0].text = Math.floor((expActual.tentaculos/((nivel+1)*100))*100)+'%';
        app.spr_uiNodos.children[0].text = Math.floor((expActual.nodos/((nivel+1)*100))*100)+'%';
        app.spr_uiCoraza.children[0].text = Math.floor((expActual.coraza/((nivel+1)*100))*100)+'%';
        app.expRenderer.render(app.exp);
    }
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
    var tempText = new PIXI.Text(texto, {font : '24px Arial', fontSize:size, fill:color});
    tempText.position.x = x;
    tempText.position.y = y;
    tempText.anchor.set(anchor);
    father.addChild(tempText);
}
function init(servPlantas, pHitbox,t,ancho,alto) {
    plantas = [];
    plantasHitbox = [];
    plantasSprites = [];
    game.localPlayer = t;
    var nodosSprites = [];
    servPlantas.forEach(function(p) {
        nodosSprites = [];
        ndSprites = [];
        p.forEach(function(nodoPlanta) {
            //nodo.x, nodo.y, nodo.visible, nodo.tipoNodo, nodo.radio
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(0);
            graphics.beginFill(nodoPlanta[3].colorHex, 0.8);
            graphics.drawCircle(nodoPlanta[4], nodoPlanta[4], nodoPlanta[4]);
            graphics.endFill();
            var sprite = new PIXI.Sprite(graphics.generateCanvasTexture());

            sprite.anchor.set(0.5);
            sprite.position.x = nodoPlanta[0];
            sprite.position.y = nodoPlanta[1];
            sprite.zOrder = zPlantas;
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
        if(p[0]) plantas[plantas.length-1].tipo = p[0][3].tipo;
        else {
            console.log("p[0] no existe.");
            console.log(p);
        }
        plantas[plantas.length-1].hitbox = pHitbox[plantas.length-1];
        plantasSprites.push(ndSprites);
        actualizarZ();
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
}
/*=================================================*/
/*Inputs
==================================================*/
function teclitas(e) {
    if(e.keyCode === 27) game.meMato();
    if(e.keyCode === 13) game.evoZise();
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
        var relX = game.localPlayer.ratonX - window.innerWidth/2;
        var relY = game.localPlayer.ratonY - window.innerHeight/2;
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
        if(distancia > diametro*zoom) {
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

function generarDibujoCircular(radio,color,tiponodoColor,alpha,z,x,y,anchor) {
    var colorTemp = []; //"rgba(199, 64, 64, 0.93)"
    if(tiponodoColor) {
        colorTemp = rgb2hex(color);
    } else {
        colorTemp = color;
    }
    var grap = new PIXI.Graphics();
    grap.beginFill(colorTemp);
    grap.drawCircle(radio, radio,radio);
    grap.endFill();
    var sprite = new PIXI.Sprite(grap.generateCanvasTexture());
    if(x)sprite.position.x = x;
    if(y)sprite.position.y = y;
    if(z)sprite.zOrder = z;
    sprite.anchor.set(anchor || 0.5);
    app.world.addChild(sprite);
    return sprite;
}

function actualizarUi() {
    var x = app.expRenderer.width/7;
    app.spr_uiOjo.position.x = x*2;
    app.spr_uiPincho.position.x = x*3;
    app.spr_uiZise.position.x = x*4;
    app.spr_uiTentaculo.position.x = x*5;
    app.spr_uiNodos.position.x = x*6;
    app.spr_uiCoraza.position.x = x*7;

    var y = Math.min(app.expRenderer.height/3.5,26);
    /*app.spr_uiOjo.position.y = y;
    app.spr_uiPincho.position.y = y;
    app.spr_uiZise.position.y = y;
    app.spr_uiTentaculo.position.y = y;
    app.spr_uiNodos.position.y = y;
    app.spr_uiCoraza.position.y = y;*/

    app.expSpr.children[0].position.x = app.expRenderer.width/2;
    app.expSpr.children[0].position.y = app.expRenderer.height/2.3+app.expRenderer.height/12+window.innerHeight/40-app.expRenderer.height/30;

    var zoomUI = Math.max(zoom,0.3)* 0.15;
    //app.expSprite.children[0].scale.set(zoomUI);
    app.spr_uiOjo.scale.set(zoomUI);
    app.spr_uiPincho.scale.set(zoomUI);
    app.spr_uiZise.scale.set(zoomUI);
    app.spr_uiTentaculo.scale.set(zoomUI);
    app.spr_uiNodos.scale.set(zoomUI);
    app.spr_uiCoraza.scale.set(zoomUI);
    //app.expSprite.children[0].scale.set(zoomUI);

    app.barraExp.width =app.expRenderer.width;
    app.barraExp.height =app.expRenderer.height;
}

function calcularPuntoEnCirculo(x = 0,y = 0,r,a){
    if(!r && r != 0|| !a && a != 0) {
        console.log("Faltan atributos obligatorios: ")
        if(!a)console.log("Ángulo: "+a);
        if(!r)console.log("Radio: "+r);
        return;
    }
    var coord = [];
    //console.log("Ángulo: "+a+" grados: "+(a*180/Math.PI));
    coord.push(x + r * Math.cos(a));
    coord.push(y + r * Math.sin(a));
    return coord;
}

function actualizarZ(){
    app.world.children.sort(function(a,b) {
      if (a.zOrder > b.zOrder) return 1;
      if (a.zOrder < b.zOrder) return -1;
      return 0;
    });
}
