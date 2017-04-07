/*Constructor de los player
=======================================*/
function Player(id, game, local,nombrev){
    this.nombre = nombrev;
	this.id = id;
    this.ratonX = 0;
    this.ratonY = 0;
	this.local = local;
    if(local) this.idsCercanas = [];
    this.bicho = new Bicho(this.id,nombrev);
}

/*====================================================================================*/
/*Render - Pixi
======================================================================================*/
function renderPixi(){

    /*Declarar contenedores de imágenes
    =====================================*/
    this.world = new PIXI.Container();
    this.world.displayList = new PIXI.DisplayList();
    this.general = new PIXI.DisplayGroup(1, function (sprite) {
        sprite.zOrder = -sprite.z;
    });
    this.back = new PIXI.Container();
    this.exp = new PIXI.Container();
    this.borde = new PIXI.Container();
    /*==================================*/
    /*Declarar renderer de imágenes
    =================================================================================================*/
    this.renderer = new PIXI.CanvasRenderer(window.innerWidth, window.innerHeight, {antialias: false, transparent: true, resolution: 1});
    //this.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {antialias: true, transparent: true, resolution: 1});
    this.backrenderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight,null,true,true,false,true,1,false,true,false);
    this.expRenderer = new PIXI.autoDetectRenderer(window.innerWidth/2, window.innerHeight/4, {antialias: false, transparent: true, resolution: 1});
    //Añadirlos al body para que se vean
    document.body.appendChild(this.renderer.view);
    /*===============================================================================================*/
    /*Preparar los renderer (Estilos)
    ==============================================================================*/
    this.backrenderer.view.style.position = "absolute";
    this.backrenderer.view.style.display = "block";

    this.renderer.view.style.position = "absolute";
    this.renderer.view.style.display = "block";

    this.backrenderer.view.style.zIndex = -1;

    document.body.appendChild(this.backrenderer.view);
    document.body.appendChild(this.expRenderer.view);

    this.expRenderer.view.style.position = "absolute";
    this.expRenderer.view.style.display = "block";
    this.expRenderer.view.style.zIndex = 1;
    this.expRenderer.view.style.left = "25%";

    this.background = new PIXI.Sprite(backgroundFijo);
    this.background.width = window.innerWidth;
    this.background.height = window.innerHeight;

    this.background.position.x = 0;
    this.background.position.y = 0;
    this.back.addChild(this.background);
    this.backrenderer.render(this.back);

    this.barraExp = new PIXI.Sprite(barraExp);
    this.barraExp.position.x = 0;
    this.barraExp.position.y = 0;
    this.exp.addChild(this.barraExp);
    this.expSpr = new PIXI.Sprite(exp);
    this.expSpr.position.x = 90;
    this.expSpr.position.y = this.expRenderer.height/1.55;
    this.expSpr.width = this.expRenderer.width/1000;
    this.expSpr.height = this.expRenderer.height/3;
    this.exp.addChild(this.expSpr);

    var x = this.expRenderer.width/6;
    var y = 100;

    this.spr_uiOjo = declararSpriteDesdeTextura(uiOjo,this.exp,x,y,1,null,this.general);
    this.spr_uiPincho = declararSpriteDesdeTextura(uiPincho,this.exp,x*2,y,1,null,this.general);
    this.spr_uiZise = declararSpriteDesdeTextura(uiZise,this.exp,x*3,y,1,null,this.general);
    this.spr_uiTentaculo =  declararSpriteDesdeTextura(uiTentaculo,this.exp,x*4,y,1,null,this.general);
    this.spr_uiNodos =  declararSpriteDesdeTextura(uiNodos,this.exp,x*5,y,1);
    this.spr_uiCoraza =  declararSpriteDesdeTextura(uiCoraza,this.exp,x*6,y,1,null,this.general);

    //texto,father, x = 0, y = 0 , anchor = 0.5, font= 'Comic Sans MS', size = '20px', color = "#ffff00", z = 0
    var ynum = -this.spr_uiCoraza.height/4.5;
    var xnum = -this.spr_uiCoraza.width/5;
    addChildrenText("Error",this.spr_uiOjo,xnum,ynum); //Exp Ojo
    addChildrenText("Error",this.spr_uiPincho,xnum,ynum); //Exp Picho
    addChildrenText("Error",this.spr_uiZise,xnum,ynum); //Exp Zise
    addChildrenText("Error",this.spr_uiNodos,xnum,ynum); //Exp Nodos
    addChildrenText("Error",this.spr_uiTentaculo,xnum,ynum); //Exp Tentaculos
    addChildrenText("Error",this.spr_uiCoraza,xnum,ynum); //Exp Coraza

    var zoomUI = .4;
    this.spr_uiOjo.scale.set(zoomUI);
    this.spr_uiPincho.scale.set(zoomUI);
    this.spr_uiZise.scale.set(zoomUI);
    this.spr_uiTentaculo.scale.set(zoomUI);
    this.spr_uiNodos.scale.set(zoomUI);
    this.spr_uiCoraza.scale.set(zoomUI);

    var mascara = new PIXI.Graphics();
    mascara.beginFill(0x000000);
    mascara.drawRect(0, 0, 1000, 1000);
    mascara.endFill();
    this.expSpr.mask = mascara;
    this.expSpr.mask.x =  0;
    this.expSpr.mask.y =  0;
    this.expSpr.addChild(mascara);

    this.expSpr.width =this.expRenderer.width-90;
    this.barraExp.width =this.expRenderer.width;
    this.barraExp.height =this.expRenderer.height;

    this.parallax1 = new PIXI.extras.TilingSprite(parallax1, window.innerWidth,window.innerHeight);
    this.parallax1.tilePosition.x = 0;
    this.parallax1.tilePosition.y = 0;
    this.back.addChild(this.parallax1);

    this.parallax2 = new PIXI.extras.TilingSprite(parallax2, window.innerWidth,window.innerHeight);
    this.parallax2.tilePosition.x = 0;
    this.parallax2.tilePosition.y = 0;
    this.back.addChild(this.parallax2);

    var x = this.expRenderer.width/7;

    this.barraExp.width =965; //INICIAL
    this.barraExp.height =this.barraExp.width*0.1875;
    this.expSpr.width =this.barraExp.width*.81;
    this.expSpr.height =this.expSpr.width*.045;
    this.expSpr.position.y =this.barraExp.height*0.63;
    this.expSpr.position.x =this.barraExp.width*0.165;
    var initX = 275;
    var finalX = 790;
    var dif = (finalX-initX)/4;
    this.spr_uiOjo.position.x = initX;
    this.spr_uiPincho.position.x = initX+dif;
    this.spr_uiZise.position.x = initX+dif*2;
    this.spr_uiTentaculo.position.x = initX+dif*3;
    this.spr_uiNodos.position.x = initX+dif*4;
    this.spr_uiCoraza.position.x = initX+dif*5;
    var y = this.barraExp.height*.6;
    this.spr_uiOjo.position.y = y;
    this.spr_uiPincho.position.y = y;
    this.spr_uiZise.position.y = y;
    this.spr_uiTentaculo.position.y = y;
    this.spr_uiNodos.position.y = y;
    this.spr_uiCoraza.position.y = y;

    addChildrenText("1",this.barraExp,this.barraExp.width*.08,this.barraExp.height*.45,0.5,null,75,"#00f5ff"); //Exp General

    this.expRenderer.view.style.top = window.innerHeight-this.expRenderer.height*.78+"px";

    this.expPorc = new PIXI.Text("Null", {font : 'Arial', fontSize:"25px", fill:"#919191"});
    this.expPorc.position.x = this.barraExp.width*.55;
    this.expPorc.position.y = this.barraExp.height*.72;
    this.expPorc.anchor.set(.5);
    this.exp.addChild(this.expPorc);
}

/*===================================================================*/
/*Debug
=====================================================================*/
function debugo(){
    this.gui = new dat.GUI();
    this.gui.add(game, 'mXtentaculos',0,10);
    this.gui.add(game, 'mYtentaculos',0,10);
    this.gui.add(game, 'vTentaculos',0,2);
    this.gui.add(game, 'movimiento');
    this.gui.add(game, 'evoZise');
    this.gui.add(game, 'evoPinchus');
    this.gui.add(game, 'evoTientaculos');
    this.gui.add(game, 'evoEie');
    this.gui.add(game, 'evoCorza');
    this.gui.add(game, 'evoNodos');
    this.gui.add(game, 'meMato');
    this.gui.add(game, 'pintarHitboxPlanta0');
    return this;
}
/*====================================*/
