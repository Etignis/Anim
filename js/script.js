"use strict";
// CONSTANT
var NULL = null;
var G_SQ = 64; // global square size
var map;

var ter_n_h = 10, ter_n_v = 10;
var Canvas_Height = ter_n_v*G_SQ, Canvas_Width = ter_n_h*G_SQ;
var ctx;
var terSelected = {
	X: -1,
	Y: -1
}
var terEnabled = true;

var default_image = new Image();
var tr_img01 = new Image();
var tr_img02 = new Image();

var grass01 = new Image();
var stone01 = new Image();
var dirt01 = new Image();
var select01 = new Image();
var highlight = new Image();
var c_bg;


var pers, tr01, tr02;
var ter = [];

var GAME_ON = true;
var lastAnimationFrameTime,deltaTime, last_time, spf, max_deltaTime, min_deltaTime,lastFpsUpdateTime=0, fps;


// Objects
class o {
	constructor(p) {
		this.id = p.id?p.id:null;
		this.w = p.w?p.w:G_SQ;
		this.h = p.h?p.h:G_SQ;
		this.img=p.img? p.img:null;
		this.ctx=p.ctx? p.ctx:null;
		this.stat = p.stat? p.stat : "normal";

		this.aim_x=p.aim_x?p.aim_x:null;
		this.aim_y=p.aim_y?p.aim_y:null;

		this.defaultSpeed = p.defaultSpeed?p.defaultSpeed:10;

		this.coord = {
			x: p.coord?p.coord.x?p.coord.x:0:0,
			y: p.coord?p.coord.y?p.coord.y:0:0,
			z: p.coord?p.coord.z?p.coord.z:0:0
		}
		this.pos = {
			x: p.pos?p.pos.x?p.pos.x:0: this.coord.x*this.w + this.w/2,
			y: p.pos?p.pos.y?p.pos.y:0: this.coord.y*this.h + this.h/2,
			z: p.pos?p.pos.z?p.pos.z:0:0
		}

		if(p.visible != undefined){
			this.visible=p.visible;
		} else {
			this.visible = true;
		}
		if(p.opasity >=0 || p.opacity<=1){
			this.opacity=p.opacity;
		} else {
			this.opacity = 1;
		}

		this._moveToCoordEnd = Function.prototype;
  } /// constructor

  setMoveToCoordEnd(fn) {
  	if (typeof fn === 'function') {
  		this._moveToCoordEnd = fn;
  	}
  }
  setCoord(p){
  	if(p.x!=undefined) {
  		this.coord.x=p.x;
  	}
  	if(p.y!=undefined) {
  		this.coord.y=p.y;
  	}
  	if(p.z!=undefined) {
  		this.coord.z=p.z;
  	}
  	this.replaceByCoord();
  }
  moveToCoord(p){
  	if(p.x!=undefined) {
  		this.coord.x=p.x;
  	}
  	if(p.y!=undefined) {
  		this.coord.y=p.y;
  	}
  	if(p.z!=undefined) {
  		this.coord.z=p.z;
  	}
		var that = this;
		this.timermoveToCoord =	setInterval(
				function() {
					var rX = that.pos.x;
					var rY = that.pos.y;
					var aX = that.coord.x*that.w + that.w/2;
					var aY = that.coord.y*that.h + that.h/2;
					var deltaX = aX - rX;
					var deltaY = aY - rY;
					if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
						if(Math.abs(deltaX) > 5) {
							that.pos.x = +that.pos.x + +getSign(deltaX)*that.defaultSpeed;
						}
						if (Math.abs(deltaY) > 5) {
							that.pos.y = +that.pos.y + +getSign(deltaY)*that.defaultSpeed;
						}
					} else {
						that.replaceByCoord();
						terEnabled = true;
						//res();
						clearInterval(that.timermoveToCoord);
						that._moveToCoordEnd();
					}
				},
			10
			);
		//this.timermoveToCoord.then(function(){});
  }
	/*
	set stat(value) {
		console.log(value);
		console.log(this.stat);
	}
	*/
	draw(p) {
		var w = this.w?this.w:this.img.width;
		var h = this.h?this.h:this.img.height;
		var x = this.pos.x - this.w/2;
		var y = this.pos.y - this.h/2;
		var r_x = 1;
		var r_y = 1;

		var IMG = this.img;

		if(p) {
			this.ctx = p.ctx? p.ctx: this.ctx;
			if(p.repeat_x != undefined)
				r_x = p.repeat_x;
			if(p.repeat_y != undefined)
				r_y = p.repeat_y;
			if(p.img)
				IMG = p.img;
		}
		if(this.ctx && IMG && this.visible) {
			for (var i = 0; i<r_x; i++ ) {
				for (var j = 0; j<r_y; j++ ) {
					if (this.opacity < 1) {
						ctx.globalAlpha = this.opacity;
					} else {
						ctx.globalAlpha = 1;
					}
					this.ctx.drawImage(IMG, x + w*i, y + h*j, w, h);
				}
			}
		}
	}
	replaceByCoord(){
		this.pos.x = this.coord.x*this.w + this.w/2;
		this.pos.y = this.coord.y*this.h + this.h/2;
	}
	replaceByPos(){
		this.coord.x = Math.floor(this.pos.x/this.w);
		this.coord.y = Math.floor(this.pos.y/this.h);
	}
	move(dir) {
		switch(dir) {
			case "up": this.pos.y = this.pos.y - this.defaultSpeed;
			break;
			case "right": this.pos.x = +this.pos.x + +this.defaultSpeed
			break;
			case "down": this.pos.y = +this.pos.y + +this.defaultSpeed
			break;
			case "left": this.pos.x = this.pos.x - this.defaultSpeed
			break;
		}

		this.coord.x = Math.floor(this.pos.x/this.w);
		this.coord.y = Math.floor(this.pos.y/this.h);
	}
	moveTo(gridX, gridY) {

	}
	fadeIn() {
		if(this.opacity < 1 && !this.timerFadeIn) {
			var that = this;
			this.timerFadeIn = setInterval(
				function() {
					var delta = 1 - that.opacity;
					if(Math.abs(delta) > 0) {
						that.opacity = that.opacity + 0.05;
						that.aim_x = null;
					} else {
						that.opacity = 1;
						clearInterval(that.timerFadeIn);
					}
				},
				10
				);
		}
	}
	moveToAim() {
		if(this.aim_x) {
			var delta_x = this.pos.x - this.aim_x;
			if(Math.abs(delta_x)<this.defaultSpeed) {
				this.pos.x = this.aim_x;
				this.aim_x = null;
			} else {
				this.pos.x = delta_x>0? this.pos.x-this.defaultSpeed : +this.pos.x+ +this.defaultSpeed;
			}
		}
		if(this.aim_y) {
			var delta_y = this.pos.y - this.aim_y;
			if(Math.abs(delta_y)<this.defaultSpeed) {
				this.pos.y = this.aim_y;
				this.aim_y = null;
			} else {
				this.pos.y = delta_y>0? this.pos.y-this.defaultSpeed : +this.pos.y+ +this.defaultSpeed;
			}
		}
	};

	calculateAccessability(p1, array) {
		//var NULL = "null";
		function setCoast(y,x,accessCoast) {
			var ret = false;
			var passable=0;
			try {
				if(array[x][y].fPassability && array[x][y].accessCoast!=NULL){
					var accessCoast = array[x][y].accessCoast;
					//console.log("try p "+x+" "+y +" "+accessCoast);
					accessCoast++;

					try {
						var tx=x;
						var ty=y-1;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = accessCoast;
						//console.log("top "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

					try {
						var tx=x;
						var ty=+y+ +1;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = accessCoast;
						//console.log("bot "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

					try {
						var tx=x-1;
						var ty=y;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = accessCoast;
						//console.log("left "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

					try {
						var tx=+x+ +1;
						var ty=y;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = accessCoast;
						//console.log("right "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

				}
			} catch(err) {}

			return ret;
		}

		//var a = []; // create empty aray for coasts
		/**/
		for (var i=0; i<array.length; i++) {
			//a[i] = []
			for (var j=0; j<array[0].length; j++) {
				array[i][j].accessCoast = NULL;
				array[i][j].accessStat = null;
			}
		}
		/**/
		array[p1.y][p1.x].accessStat = 'start';
		array[p1.y][p1.x].accessCoast = 0;
		//printA();

		//var coast=0;
		var fCont = true;
		var i, j;
		//array[p1.x][p1.y].accessCoast=0;

		function collectCoordinatesFromLine(start, end) {
		  var directionType = start.x === end.x ? "vertical" : "horizontal";
		  var directionIncrement = directionType === "vertical" ? (start.y > end.y ? -1 : 1) : (start.x > end.x ? -1 : 1);
		  var lineLength = directionType === "vertical" ? Math.abs(start.y - end.y) : Math.abs(start.x - end.x);
		  var coordinates = [];
		  var increment = directionIncrement;

		  for (var i = 0; i < lineLength; i++) {
		    var x = directionType === "vertical" ? start.x : start.x + increment;
		    var y = directionType === "vertical" ? start.y + increment : start.y;

		    coordinates.push({x: x, y: y});

		    increment += directionIncrement;
		  }

		  return coordinates;
		}

		function gatherCoordinatesFromPerimeter(center, radius) {
		  var currentPosition = {
		    x: center.x + radius,
		    y: center.y + radius
		  };
		  var coordinates = [];

		  for (var side = 1; side <= 4; side++) {
		    var multiplier = side <= 2 ? -1 : 1;
		    var x = currentPosition.x + multiplier * 2 * radius * (side % 2);
		    var y = currentPosition.y + multiplier * 2 * radius * ((side + 1) % 2);
		    coordinates = coordinates.concat(collectCoordinatesFromLine(currentPosition, {x: x, y: y}));
		    currentPosition = {x: x, y: y};
		  }

		  return coordinates;
		}
		for (var t=0; t<3 && fCont; t++) {
			var ring = gatherCoordinatesFromPerimeter({x: p1.x, y:p1.y}, t);
			if(t==0)
				ring = [{x:p1.x, y:p1.y}];
			for( var i=0; i<ring.length && fCont; i++) {
				if( setCoast(ring[i].x, ring[i].y) ){
							fCont=false;
							console.log("Coasts for field set");
						}
			}
		}

		/**/
		for (var i=0; i<array.length; i++) {
			var str = "";
			//a[i] = []
			for (var j=0; j<array[0].length; j++) {
				//array[i][j].accessCoast = NULL;
				str = str+" "+((array[i][j].accessCoast==NULL)?0:array[i][j].accessCoast);
			}
			console.log(str);
		}
		/**/
		//this.accessableField = a;
	} /// calculateAccessability

	highlightAccessableField(maxCoast) {

	}
};

class terrSq extends o {
	constructor(p) {
		super(p);
		//console.log(p.type);
		this.fPassability = (p.fPassability!=undefined)?p.fPassability:1;
		this.accessCoast = p.accessCoast?p.accessCoast:NULL;
		this.type = p.type?p.type:0;
		this.images = p.images?p.images:{};
	}

	draw(p) {
		//super(p);
		super.draw({img: this.images[this.type]});
		if (this.fHighlight && this.fPassability>0) {
			super.draw({img: highlight});
		}
		if (this.coord.x == terSelected.X &&  this.coord.y == terSelected.Y && this.fHighlight>0) {
			super.draw({img: select01});
		}
	}

	highlight(p) {

	}
}
class actor extends o {
	constructor(p) {
		super(p);
	}

	findAccessability() {
		this.calculateAccessability({x: this.coord.x, y: this.coord.y}, ter);
	}
	findPath(p1,p2) {
		var NULL = 9;
		function setCoast(x,y,coast) {
			var ret = false;
			var passable=-1;
			try {
				if(a[x][y].passable && a[x][y].coast!=NULL){
					var coast = a[x][y].coast;
					console.log("try p "+x+" "+y +" "+coast);
					coast++;

					try {
						var tx=x;
						var ty=y-1;
						if (a[ty][tx].coast==NULL && a[ty][tx].passable>passable) {
							a[ty][tx].coast = coast;
						console.log("top "+tx+" "+ty+" "+coast);
						//printA();
						if (a[ty][tx].stat=="end")
							ret = true;
						}
					} catch(err) {}

					try {
						var tx=x;
						var ty=+y+ +1;
						if (a[ty][tx].coast==NULL && a[ty][tx].passable>passable) {
							a[ty][tx].coast = coast;
						console.log("bot "+tx+" "+ty+" "+coast);
						//printA();
						if (a[ty][tx].stat=="end")
							ret = true;
						}
					} catch(err) {}

					try {
						var tx=x-1;
						var ty=y;
						if (a[ty][tx].coast==NULL && a[ty][tx].passable>passable) {
							a[ty][tx].coast = coast;
						console.log("left "+tx+" "+ty+" "+coast);
						//printA();
						if (a[ty][tx].stat=="end")
							ret = true;
						}
					} catch(err) {}

					try {
						var tx=+x+ +1;
						var ty=y;
						if (a[ty][tx].coast==NULL && a[ty][tx].passable>passable) {
							a[ty][tx].coast = coast;
						console.log("right "+tx+" "+ty+" "+coast);
						//printA();
						if (a[ty][tx].stat=="end")
							ret = true;
						}
					} catch(err) {}

				}
			} catch(err) {}

			return ret;
		}

		var a = []; // create empty aray for coasts
		for (var i=0; i<ter_n_h; i++) {
			a[i] = []
			for (var j=0; j<ter_n_v; j++) {
				a[i][j]= {
					passable: ter[i][j].fPassability,
					coast: NULL
				}
				if (p1.x == i && p1.y == j) {
					a[i][j].stat="start"
					a[i][j].coast=0;
				}
				if (p2.x == i && p2.y == j) {
					a[i][j].stat="end";
				}
			}
		}
		//printA();

		var coast=0;
		var fCont = true;
		var i, j;
		a[p1.x][p1.y].coast=0;

		function collectCoordinatesFromLine(start, end) {
		  var directionType = start.x === end.x ? "vertical" : "horizontal";
		  var directionIncrement = directionType === "vertical" ? (start.y > end.y ? -1 : 1) : (start.x > end.x ? -1 : 1);
		  var lineLength = directionType === "vertical" ? Math.abs(start.y - end.y) : Math.abs(start.x - end.x);
		  var coordinates = [];
		  var increment = directionIncrement;

		  for (var i = 0; i < lineLength; i++) {
		    var x = directionType === "vertical" ? start.x : start.x + increment;
		    var y = directionType === "vertical" ? start.y + increment : start.y;

		    coordinates.push({x: x, y: y});

		    increment += directionIncrement;
		  }

		  return coordinates;
		}

		function gatherCoordinatesFromPerimeter(center, radius) {
		  var currentPosition = {
		    x: center.x + radius,
		    y: center.y + radius
		  };
		  var coordinates = [];

		  for (var side = 1; side <= 4; side++) {
		    var multiplier = side <= 2 ? -1 : 1;
		    var x = currentPosition.x + multiplier * 2 * radius * (side % 2);
		    var y = currentPosition.y + multiplier * 2 * radius * ((side + 1) % 2);
		    coordinates = coordinates.concat(collectCoordinatesFromLine(currentPosition, {x: x, y: y}));
		    currentPosition = {x: x, y: y};
		  }

		  return coordinates;
		}
		for (var t=0; t<4 && fCont; t++) {
			var ring = gatherCoordinatesFromPerimeter({x: p1.x, y:p1.y}, t);
			if(t==0)
				ring = [{x:p1.x, y:p1.y}];
			for( var i=0; i<ring.length && fCont; i++) {
				if( setCoast(ring[i].x, ring[i].y) ){
							fCont=false;
							console.log("finish found");
						}
			}
		}

		function printA() {
			for(var q1=0; q1<a.length; q1++) {
				var str="";
				for(var q2=0; q2<a[0].length; q2++) {
					str+= " "+a[q1][q2].coast;
				}
				console.log(str);
			}
		}
		//printA();

		function getNextPoint(x,y, coast) {
			try{
				if(a[x][y-1].coast<coast) {
					return {x: x, y: y-1};
				}
			} catch (err) {}
			try{
				if(a[x][y+1].coast<coast) {
					return {x: x, y: +y+ +1};
				}
			} catch (err) {}
			try{
				if(a[x-1][y].coast<coast) {
					return {x: x-1, y: y};
				}
			} catch (err) {}
			try{
				if(a[x+1][y].coast<coast) {
					return {x: +x+ +1, y: y};
				}
			} catch (err) {}
			return false;
		}
		var path = [{x:p2.x, y:p2.y}]; // create path
		var p;

		coast = a[p2.x][p2.y].coast;
		var step=9;
		do{
			p = getNextPoint(path[path.length-1].x,path[path.length-1].y, coast);
			if(p) {
				path.push(p);
				coast = a[path[path.length-1].x][path[path.length-1].y].coast;
			}
			step--;
		} while (coast>0 && step>0)

		console.dir(path);

		/**/
		for(var i=0; path[i]; i++) {
			ter[path[i].x][path[i].y].type="grass";

		}
		/**/
		this.path=path;

	}
	makePath(p){
		if (p!=undefined && p.length>0) {
			this.pathPoints = p;
		}
	}
	calculateState() {

	}
}
// FUNCTIONS
function getSign(num) {
	return num>0? 1 : num<0? -1: 0;
}
function calculateFps(now) {
	fps = 1000 / (now - lastAnimationFrameTime);
	lastAnimationFrameTime = now;
	//spf= 1/fps;

	deltaTime=((now - last_time)/1000).toFixed(4);
	spf=deltaTime;
	if(deltaTime>max_deltaTime&&deltaTime<2)
		max_deltaTime=deltaTime;
	if(deltaTime<min_deltaTime||min_deltaTime==0)
		min_deltaTime=deltaTime;

	//show_info("/"+now+" / "+lastFpsUpdateTime);

	if ((now - lastFpsUpdateTime)>1000) {
		lastFpsUpdateTime = now;

		//fpsElement.innerHTML = fps.toFixed(0) + ' fps';
		//show_vars();
	}

	last_time = now;


		fps = fps.toFixed(0);
	return fps;
}
function drawFPS (fps){
		ctx.strokeStyle = "#444";
		ctx.font = "12px Arial";
		ctx.fillText("FPS: "+fps,5,10);
}
function create_gamezone() {
	$("body").html("<div id='game_zone'></div>");
}
function create_canvas() {
	//alert(Window_Width+'x'+Window_Height);
	$('#game_zone').append("<canvas id='c_bg' width='"+Canvas_Height+"' height='"+Canvas_Width+"'>Your browser does not support HTML5 Canvas.</canvas>");
	c_bg = document.getElementById('c_bg');
	Canvas_Height      = $('#c_bg').height();
	Canvas_Width       = $('#c_bg').width();
	ctx = c_bg.getContext('2d');
}
function resize_canvas() {
	$("#c_bg").attr("width", Canvas_Width);
	$("#c_bg").attr("height", Canvas_Height);
}

// load game resources // images
function load_resources () {
	default_image.src='img/defaut.jpg';
	tr_img01.src='img/tr01.jpg';
	tr_img02.src='img/tr02.jpg';

	grass01.src='img/grass01.jpg';
	stone01.src='img/stone01.jpg';
	dirt01.src='img/dirt01.jpg';
	select01.src='img/select01.png';
	highlight.src='img/highlight.png';

	$.when(
		default_image.onload,
		tr_img01.onload
		).done(function() {
			start();
		});
}

// darw element
function draw_el (el) {
	ctx.drawImage(el.img, 0, 0, 20, 20);
}

// initialise al for game
function init () {
	map = [
				"############",
				"#...###....#",
				"#....#.....#",
				"##.........#",
				"###.......##",
				"##......####",
				"#....#.....#",
				"#....#....##",
				"##...##....#",
				"##....##...#",
				"##.........#",
				"############"
				];

	ter_n_h = map[0].length;
	ter_n_v = map.length;
	Canvas_Height = ter_n_v*G_SQ, Canvas_Width = ter_n_h*G_SQ;

	var dict = {
		'#': {
			name:"stone",
			fPassability: 0},
		'.': {
			name: "dirt",
			fPassability: 1
		}
	}

	/*
	tr01 = new terrSq({
		img: tr_img01,
		ctx: ctx,
		w: G_SQ,
		h: G_SQ
	});
	*/
	var pX=0, pY=0;
	for (var i=0; i<ter_n_h; i++) {
		ter[i] = [];
		for(var j=0; j<ter_n_v; j++) {
			var type = "grass";
			var passability = -1;
			type = dict[map[i][j]].name || "grass";
			passability = (dict[map[i][j]].fPassability!=undefined)?dict[map[i][j]].fPassability:0;
			if(pX==0 && pY==0 && passability>0) {
				pX=j;
				pY=i;
			}
			ter[i][j] = new terrSq({
				img: grass01,
				ctx: ctx,
				w: G_SQ,
				h: G_SQ,
				aim_x: G_SQ*i,
				aim_y: G_SQ*j,
				visible: true,
				opacity: 0,
				pos:{
					x: G_SQ*i + G_SQ/2,
					y: G_SQ*j + G_SQ/2
				},
				coord:{
					x: i,
					y: j
				},
				stat: "normal",
				type: type,
				fPassability: passability,
				accessCoast: NULL,
				images: {
					grass: grass01,
					stone: stone01,
					dirt: dirt01
				}
			});
		}
	}

	pers = new actor({
		img: default_image,
		ctx: ctx,
		w: G_SQ,
		h: G_SQ,
		coord: {
			x: pX,
			y: pY
		},
		id: "pers"
	});

	pers.setMoveToCoordEnd(() => {
		console.log("I moved to: "+pers.coord.x+" "+pers.coord.y);
	})
	//pers.img = default_image;
	//pers.ctx = ctx;
}
function start () {
	create_gamezone();
	create_canvas();
	init();
	resize_canvas();
	draw();
}
function draw() {
	ctx.clearRect(0, 0, Canvas_Width, Canvas_Height);
	pers.calculateAccessability({x: pers.coord.x, y: pers.coord.y}, ter);
	for (var i=0; i<ter_n_h; i++) {
		for(var j=0; j<ter_n_v; j++) {
			if(
				/*/
				Math.abs(pers.pos.x-ter[i][j].aim_x) < 61 &&
				Math.abs(pers.pos.y-ter[i][j].aim_y) < 61
				/**/
				/**/
				Math.abs(pers.coord.x-ter[i][j].coord.x) <= 1 &&
				Math.abs(pers.coord.y-ter[i][j].coord.y) <= 1
				/**/

				) {

				//ter[i][j].moveToAim();
				ter[i][j].fadeIn();
				//ter[i][j].fHighlight = true;
				//ter[i][j].visible = true;
				} else {
					//ter[i][j].fHighlight = false;
				}
			if (ter[i][j].accessCoast>0 && ter[i][j].accessCoast<5) {
				ter[i][j].fHighlight = true;
				ter[i][j].fadeIn();
			} else {
				ter[i][j].fHighlight = false;
			}
		ter[2][5].type="grass";
		ter[i][j].draw();
		}
	}
	//tr01.draw({repeat_x:5, repeat_y:5});
	//pers.putState(ter);
	pers.draw();
	drawFPS(fps);
}

function act() {
	if(GAME_ON) {
		requestAnimationFrame(act);
	}
	var now = new Date();
	calculateFps(now);
	//console.log(calculateFps(now));
	draw();
}
function game_pause()
 {
	GAME_ON=false;
	ctx.filter = "grayscale(100%)";
	//$('#game_menu').show();
 }
 function game_continue()
 {
	//$('#game_menu').hide();
	var now = new Date();
	//lastAnimationFrameTime = now;
	lastFpsUpdateTime = now;
	last_time = now;
	GAME_ON=true;
	ctx.filter = "none";
	act();
 }

//
$(document).ready(function(){
	load_resources();
	act();

	// keybord
	$('body').keydown(function(e){
		//alert(e.which);
		if (GAME_ON) {
			switch(e.which){
				case 83:				//down
					pers.move("down");
					break;
				case 87:				//up
					pers.move("up");
					break;
				case 65:				//left
					pers.move("left");
					//hero.view=1;
					break;
				case 68:				//right
					pers.move("right");
					//hero.view=0;
					break;
				case 27:
				 		game_pause();
				default:
					//pers.speed.x=0;
					//pers.speed.y=0;
			}
		} else if (e.which==27) {
				 		game_continue();
		}
 });

	// click
	$("#c_bg").click(function(e) {
	  var offset = $(this).offset();
	  var relativeX = (e.pageX - offset.left);
	  var relativeY = (e.pageY - offset.top);

	  //alert("X: " + relativeX + "  Y: " + relativeY);
	  var X = Math.floor(relativeX/G_SQ);
	  var Y = Math.floor(relativeY/G_SQ);
	  //console.log("X: " + X + "  Y: " + Y);

		if (terEnabled) {
		  if (terSelected.X==X && terSelected.Y==Y) {
		  	pers.moveToCoord({x:X, y:Y});
		  	terSelected.X=-1;
			  terSelected.Y=-1;
			  terEnabled=false;
		  } else if(ter[X][Y].fPassability) {
			  terSelected.X=X;
			  terSelected.Y=Y;
			}
		}
	});


});
