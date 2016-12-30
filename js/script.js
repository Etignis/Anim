"use strict";
// CONSTANT
var NULL = null;
var G_SQ = 64; // global square size
var MaxAccessCoast = 4;
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
var dirt02 = new Image();
var carrot01 = new Image();
var select01 = new Image();
var highlight = new Image();
var step = new Image();
var dark01 = new Image();
var dark02 = new Image();
var dark03 = new Image();
var c_bg;

var maxCarrots = 4;
var pers, tr01, tr02;
var ter = [];

var GAME_ON = true;
var lastAnimationFrameTime,
		deltaTime,
		last_time,
		spf,
		fps,
		max_deltaTime,
		min_deltaTime,
		lastFpsUpdateTime=0;

function inRad(num) {
	return num * Math.PI / 180;
}
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

		this.defaultSpeed = p.defaultSpeed?p.defaultSpeed:300;

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
  coordToPos(v){
  	return v * G_SQ + G_SQ/2;
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
							var k = (Math.abs(deltaX) > 20)? 1: 0.5;
							that.pos.x = +that.pos.x + +getSign(deltaX)*that.defaultSpeed * deltaTime*k;
						}
						if (Math.abs(deltaY) > 5) {
							var k = (Math.abs(deltaY)> 20)? 1: 0.5;
							that.pos.y = +that.pos.y + +getSign(deltaY)*that.defaultSpeed * deltaTime*k;
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
  }

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
					if(p && p.rotate>0) {
							ctx.translate(x+w/2, y+h/2);
							ctx.rotate(inRad(p.rotate));
							this.ctx.drawImage(IMG, -w/2, -h/2, w, h);
							ctx.rotate(inRad(-p.rotate));
							ctx.translate(-(x+w/2),-(y+h/2));
					} else{
						/**/
						ctx.translate(0, 0);
						ctx.rotate(inRad(0));
						this.ctx.drawImage(IMG, x + w*i, y + h*j, w, h);
						/**/
						/*/
						ctx.translate(x, y);
						ctx.rotate(inRad(90));
						this.ctx.drawImage(IMG, 0, 0, w, h);
						ctx.rotate(inRad(-90));
						ctx.translate(-x,-y);
						/**/
					}
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
			this.visible = true;
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
			if(Math.abs(delta_x) < this.defaultSpeed) {
				this.pos.x = this.aim_x;
				this.aim_x = null;
			} else {
				var k = (delta_x > this.defaultSpeed*2)? 1: 0.5;
				this.pos.x = delta_x>0? this.pos.x - this.defaultSpeed * deltaTime*k: +this.pos.x+ +this.defaultSpeed * deltaTime*k;
			}
		}
		if(this.aim_y) {
			var delta_y = this.pos.y - this.aim_y;
			if(Math.abs(delta_y) < this.defaultSpeed) {
				this.pos.y = this.aim_y;
				this.aim_y = null;
			} else {
				var k = (delta_x > this.defaultSpeed*2)? 1: 0.5;
				this.pos.y = delta_y>0? this.pos.y - this.defaultSpeed * deltaTime*k : +this.pos.y+ +this.defaultSpeed * deltaTime*k;
			}
		}
	}

	calculateAccessability(p1, array) {
		//var NULL = "null";
		var that = this;
		/**/
		function setCoast(i,j,accessCoast) {
			var ret = false;
			var passable=0;
			try {

				if(array[j][i].fPassability && array[j][i].accessCoast != NULL){
					var accessCoast = array[j][i].accessCoast;
					//console.log("try p "+x+" "+y +" "+accessCoast);
					accessCoast++;

					try { // TOP
						var tx=i;
						var ty=j-1;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = (array[ty][tx].fPassability<1)? accessCoast+1: accessCoast;
							that.highlightAccessableField(array[ty][tx], ty, tx);
						//console.log("top "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

					try { // BOTTOM
						var tx=i;
						var ty=+j+ +1;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = (array[ty][tx].fPassability<1)? accessCoast+1: accessCoast;
							that.highlightAccessableField(array[ty][tx], ty, tx);
						//console.log("bot "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

					try { // LEFT
						var tx=i-1;
						var ty=j;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = (array[ty][tx].fPassability<1)? accessCoast+1: accessCoast;
							that.highlightAccessableField(array[ty][tx], ty, tx);
						//console.log("left "+tx+" "+ty+" "+accessCoast);
						//printA();
						if (array[ty][tx].accessStat=="end")
							ret = true;
						}
					} catch(err) {}

					try { //RIGHT
						var tx=+i+ +1;
						var ty=j;
						if (array[ty][tx].accessCoast==NULL && array[ty][tx].fPassability>passable) {
							array[ty][tx].accessCoast = (array[ty][tx].fPassability<1)? accessCoast+1: accessCoast;
							that.highlightAccessableField(array[ty][tx], ty, tx);
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
		/**/
		/**/
		function setCoast2(i, j, accessCoast) {
			var ret = false;
			var passable=0;
			try {
				// if cell empty
				if(array[j][i].fPassability && array[j][i].accessCoast == NULL){
					var tmp_coast = 99;
					try { // TOP
						var tx=i;
						var ty=j-1;
						if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
							tmp_coast = array[ty][tx].accessCoast + 1;
							array[j][i].accessCoast = tmp_coast;
							that.highlightAccessableField(array[j][i], j, i);
							if (array[i][j].accessStat=="end")
								ret = true;
						}
					} catch(err) {}

					try { // BOTTOM
						var tx=i;
						var ty=+j+ +1;
						if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
							tmp_coast = array[ty][tx].accessCoast + 1;
							array[j][i].accessCoast = tmp_coast;
							that.highlightAccessableField(array[j][i], j, i);
							if (array[i][j].accessStat=="end")
								ret = true;
						}
					} catch(err) {}

					try { // LEFT
						var tx=i-1;
						var ty=j;
						if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
							tmp_coast = array[ty][tx].accessCoast + 1;
							array[j][i].accessCoast = tmp_coast;
							that.highlightAccessableField(array[j][i], j, i);
							if (array[i][j].accessStat=="end")
								ret = true;
						}
					} catch(err) {}

					try { //RIGHT
						var tx=+i+ +1;
						var ty=j;
						if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
							tmp_coast = array[ty][tx].accessCoast + 1;
							array[j][i].accessCoast = tmp_coast;
							that.highlightAccessableField(array[j][i], j, i);
							if (array[i][j].accessStat=="end")
								ret = true;
						}
					} catch(err) {}

				}
			} catch(err) {}
			print_arr();
			return ret;
		}
		/**/
		//var a = []; // create empty aray for coasts
		/**/
		for (var i=0; i<array.length; i++) {
			//a[i] = []
			for (var j=0; j<array[0].length; j++) {
				array[i][j].fHighlight = false;
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

		  var tail = coordinates.splice(0, radius);
		  coordinates = coordinates.concat(tail);
		  return coordinates;
		}
		for (var t=0; t<4 && fCont; t++) {
			var ring = gatherCoordinatesFromPerimeter({x: p1.x, y:p1.y}, t);
			/**/
			if(t==0)
				ring = [{x:p1.x, y:p1.y}];
			/**/
			for (var i=0; i<ring.length && fCont; i++) {
				if (setCoast(ring[i].x, ring[i].y)){
							fCont=false;
							console.log("Coasts for field set");
						}
			}
			for (var i=0; i<ring.length && fCont; i++) {
				if (setCoast(ring[i].x, ring[i].y)){
							fCont=false;
							console.log("Coasts for field set");
						}
			}
		}

		/**/
		function print_arr() {
			console.log("-");
			for (var i=0; i<array.length; i++) {
				var str = "";
				//a[i] = []
				for (var j=0; j<array[0].length; j++) {
					//array[i][j].accessCoast = NULL;
					str = str+" "+((array[i][j].accessCoast==NULL)?0:array[i][j].accessCoast);
				}
				console.log(str);
			}
		}
		/**/
		//this.accessableField = a;
	} /// calculateAccessability

	highlightAccessableField(o, i, j) {/**/
		if (o.fPassability>0 && o.accessCoast != NULL && o.accessCoast <= MaxAccessCoast) {
			o.fHighlight = true;
			//console.log("highlight "+i+" "+j);
		} else {
			o.fHighlight = false;
		}/**/
	}
};

class terrSq extends o {
	constructor(p) {
		super(p);
		//console.log(p.type);
		this.fPassability = (p.fPassability!=undefined)?p.fPassability:1;
		this.accessCoast = p.accessCoast?p.accessCoast:NULL;
		this.type = p.type?p.type:0;
		this.images = p.images?p.images:[];
		this.shade = p.shade? p.shade : 0;
	}

	showNeighbor (j,i) {
		var n,m;
		var that = this;
		function toggle(a,b) {
			try {
				if(ter[a][b].opacity == 0){
					ter[a][b].fadeIn();

					//ter[a][b].visible = true;
					//ter[a][b].opacity = 1;
				}
			} catch (err) {}
		}
		n = i-1;
		m = j-1;
		toggle(n,m)
		n = i-1;
		m = j;
		toggle(n,m)
		n = i-1;
		m = j+1;
		toggle(n,m)
		n = i;
		m = j-1;
		toggle(n,m)
		n = i;
		m = j+1;
		toggle(n,m)
		n = i+1;
		m = j-1;
		toggle(n,m)
		n = i+1;
		m = j;
		toggle(n,m)
		n = i+1;
		m = j+1;
		toggle(n,m)
	}

	dark (j,i) {
		var n,m;
		function toggle(a,b) {
			try {
				if (ter[a][b].visible != true || ter[a][b].opacity==0)
					//ter[i][j].shade = 1;
					return 1;
				else
					//ter[i][j].shade = 0;
				return 0;
			} catch (err) {
				//ter[i][j].shade = 1;
				return 1;
			}
		}
		var sum =0;
		n = i-1;
		m = j;
		sum+=toggle(n,m)
		n = i;
		m = j-1;
		sum+=toggle(n,m)
		n = i;
		m = j+1;
		sum+=toggle(n,m)
		n = i+1;
		m = j;
		sum+=toggle(n,m)
		if(sum>0){
			ter[i][j].shade = 1;
		} else {
			ter[i][j].shade = 0;
		}
	}

	draw(p) {
		super.draw({img: this.images[this.type].img});
		//

		if (this.fHighlight && this.fPassability != NULL) {
			this.showNeighbor(this.coord.x, this.coord.y);
			super.draw({img: highlight});
		}
		if (this.coord.x == terSelected.X && this.coord.y == terSelected.Y) {
			super.draw({img: select01});
		}
		for (var i in pers.path){ // show path
			if (this.coord.x == pers.path[i].x && this.coord.y == pers.path[i].y) {
				super.draw({img: step});
			}
		}
		if(this.visible == true || this.opacity>0) {
			this.dark(this.coord.x, this.coord.y);
		}

		if (this.shade==1) {
			super.draw({img: dark01, rotate: this.images.shade01.rotate});
		}
	}
}
class actor extends o {
	constructor(p) {
		super(p);
		this.carrots = (p.carrots!=undefined)? p.carrots : 0;
	}

	findAccessability() {
		this.calculateAccessability({x: this.coord.x, y: this.coord.y}, ter);
	}
	findPath(p2, array) {
		//accessCoast
		var path = [{x: p2.x, y: p2.y}];
		var i = p2.y;
		var j = p2.x;
		var tmp_coast = array[i][j].accessCoast;
		while (tmp_coast>1) {
			try { // TOP
				var tx=j;
				var ty=i-1;
				if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
					tmp_coast = array[ty][tx].accessCoast;
					path.push({x: tx, y: ty});
					j = tx;
					i = ty;
					continue;
				}
			} catch(err) {}

			try { // BOTTOM
				var tx=j;
				var ty=+i+ +1;
				if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
					tmp_coast = array[ty][tx].accessCoast;
					path.push({x: tx, y: ty});
					j = tx;
					i = ty;
					continue;
				}
			} catch(err) {}

			try { // LEFT
				var tx=j-1;
				var ty=i;
				if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
					tmp_coast = array[ty][tx].accessCoast;
					path.push({x: tx, y: ty});
					j = tx;
					i = ty;
					continue;
				}
			} catch(err) {}

			try { //RIGHT
				var tx=+j+ +1;
				var ty=i;
				if (array[ty][tx].accessCoast != NULL && array[ty][tx].accessCoast < tmp_coast){
					tmp_coast = array[ty][tx].accessCoast;
					path.push({x: tx, y: ty});
					j = tx;
					i = ty;
					continue;
				}
			} catch(err) {}
			tmp_coast--;
		}
		console.log("path: " + path);
		this.path = path;
	}

	followPath(array) {
		var that = this;
		function reStep() {
			var point = that.path.pop();
			that.moveToCoord(point);

			that.setMoveToCoordEnd(() => {
				if(array[point.y][point.x].type == "carrot"){
					array[point.y][point.x].type = "dirt";
					that.carrots++;
					if(that.carrots == maxCarrots)
						{
							console.log("win");
							alert("win");
						}
				}
				if(that.path.length>0) {
					reStep();
				}
			})
		}
		if(that.path.length>0) {
			reStep();
		}
	}
	calculateState() {

	}
}
// FUNCTIONS
function randd(min, max) {
  var rnd = Math.floor(arguments.length > 1 ? (max - min + 1) * Math.random() + min : (min + 1) * Math.random());

  return rnd;
};
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
	default_image.src='img/defaut.png';
	tr_img01.src='img/tr01.jpg';
	tr_img02.src='img/tr02.jpg';

	grass01.src='img/grass01.jpg';
	stone01.src='img/stone01.jpg';
	dirt01.src='img/dirt01.jpg';
	dirt02.src='img/dirt02.jpg';
	carrot01.src='img/carrot01.jpg';
	select01.src='img/select01.png';
	highlight.src='img/highlight.png';
	step.src='img/step_point.png';
	dark01.src =  'img/dark_01.png';
	dark02.src =  'img/dark_02.png';
	dark03.src =  'img/dark_03.png';

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

function create_map (w, h) {
	var arr = [];
		arr[0] = arr[h-1]= "";
	var str = [0];
	maxCarrots=0;
	for (var i=0; i<w-1; i+=1) {
		//str.push((i%2)?".":"#");
		str.push(Math.floor(i/2));
		//arr[0] = arr[0]+"#";
		//arr[h-1] = arr[h-1]+"#";
	}

	var f = 1;
	for (var i=0; i<h-1; i++) {
		if(f > 0) {
			arr[i] = [].concat(str);
			arr[i+1] = [].concat(str);
			for (var j=0; j<w-1; j+=1) {
				var rnd = randd(10,90);
				rnd = rnd%3;
				if (j%2 == 0 && rnd==0) {
					arr[i][j] = "#";
				} else {
					arr[i][j] = (arr[i][j-2]!=undefined && arr[i][j-1] != '#' && arr[i][j-2] != '#')?arr[i][j-2]:arr[i][j];
				}
				arr[i+1][j] = arr[i][j];
			}
		} else {
			var pl=0, ps=0, pe=0; // piese length/start/end
			var hs=0, he=0;       // hole start/end
			for (var j=1; j<w-1; j+=1) {
				if (arr[i][j] != "#") {
					arr[i][j]="#";
					pl++;
				} else {
					pe=ps+pl;
					hs = randd(ps, pe-1);
					he = randd(hs, pe-1);
					for (var t=hs; t<=he; t++) {
						arr[i][t]=".";
					}
					ps = pe+1;
					pl=0;
				}
			}

			arr[i-1]=arr[i-1].join("");
			arr[i]=arr[i].join("");
		}
		f*=-1;
	}

	for (var i =0; i<h; i++){
		arr[i]=arr[i].replace(/[0-9]/gi, ".");
	}

	/*/
	for (var i=1; i<h-1; i+=1) {
		arr[i] = [];//[].concat(str);
		arr[i][0] = "#";
		for (var j=1; j<w; j++) {
			if (randd(0, 2)) {
				arr[i][j+1] = ".";//arr[i][j];
			} else {
				arr[i][j+1] = "#";
			}
			if (!randd(0, 11)) {
				arr[i][j+1] = "@";//arr[i][j];
				maxCarrots++;
			}
		}
		arr[i][w-1] = "#";
		arr[i] = arr[i].join("");
	}
	/**/
	/*/
	for (var i=1; i<h-1; i+=1) {
		arr[i] = [].concat(str);
		arr[i][0] = "#";
		for (var j=1; j<w-1; j++) {
			if (!randd(0, 1)) {
				arr[i][j] = (arr[i][j]=="#")? ".": "#";
			}
		}
		arr[i][w-1] = "#";
	}
	/**/

	return arr;
}
// initialise al for game
function init () {
	var ar1 = create_map(19,19);
	map = [
				"############",
				"#.,,@#.@##.#",
				"####.#..,..#",
				"#..#.###,#.#",
				"##.#.#..,#.#",
				"##.,,,.#####",
				"###..,##.#.#",
				"#.##...#.#.#",
				"#.@#...#.@.#",
				"#..#.#.###.#",
				"#....#.,,,.#",
				"############"
				];
	//map = ar1;

	ter_n_h = map[0].length;
	ter_n_v = map.length;
	Canvas_Height = ter_n_v*G_SQ, Canvas_Width = ter_n_h*G_SQ;

	var dict = {
		'#': {
			name:"stone",
			fPassability: 0
		},
		'.': {
			name: "dirt",
			fPassability: 1
		},
		',': {
			name: "dirt2",
			fPassability: 0.5
		},
		'@': {
			name: "carrot",
			fPassability: 1
		}
	}

	var pX=0, pY=0;
	for (var i=0; i<ter_n_h; i++) {
		ter[i] = [];
		for(var j=0; j<ter_n_v; j++) {
			var type = "grass";
			var passability = -1;
			var deshifr;
			try{
				deshifr= dict[map[i][j]];
			type = deshifr.name || "grass";
			} catch(err) {
				console.log(map[i][j]);
				console.dir(deshifr);
			}
			passability = (deshifr.fPassability!=undefined)? deshifr.fPassability : 0;
			// for pers placement
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
				visible: false,
				opacity: 0,
				coord:{
					x: j,
					y: i
				},
				stat: "normal",
				type: type,
				fPassability: passability,
				accessCoast: NULL,
				images: {
						grass: {
							img: grass01,
							rotate: 0
						},
						stone: {
							img: stone01,
							rotate: 0
						},
						dirt: {
							img: dirt01,
							rotate: 0
						},
						dirt2: {
							img: dirt02,
							rotate: 0
						},
						carrot: {
							img: carrot01,
							rotate: 0
						},
						shade01: {
							img: dark01,
							rotate: 90
						}
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
		carrots: 0,
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
	for (var i=0; i<ter_n_v; i++) {
		for(var j=0; j<ter_n_h; j++) {
			if(
				Math.abs(pers.coord.x - ter[i][j].coord.x) <= 1 &&
				Math.abs(pers.coord.y - ter[i][j].coord.y) <= 1
				) {
				ter[i][j].fadeIn();
				} else {
				}
			if (ter[i][j].accessCoast>0 && ter[i][j].accessCoast<5) {
				ter[i][j].fadeIn();
			} else {
			}
		ter[i][j].draw();
		}
	}
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

		if (terEnabled && ter[Y][X].fHighlight) {
		  if (terSelected.X==X && terSelected.Y==Y) {
		  	pers.followPath(ter);
		  	//pers.moveToCoord({x:X, y:Y});
		  	terSelected.X=-1;
			  terSelected.Y=-1;
			  terEnabled=false;
		  } else if(ter[Y][X].fPassability) {
			  terSelected.X=X;
			  terSelected.Y=Y;
		  	pers.calculateAccessability({x: pers.coord.x, y: pers.coord.y}, ter);
		  	pers.findPath({x:X, y:Y}, ter);
			}
		}
	});


});
