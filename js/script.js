"use strict";
// CONSTANT
var G_SQ = 64; // global square size

var ter_n_h = 10, ter_n_v = 10;
var Canvas_Height = ter_n_v*G_SQ, Canvas_Width = ter_n_h*G_SQ;
var ctx;
var default_image = new Image();
var tr_img01 = new Image();
var tr_img02 = new Image();

var grass01 = new Image();
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
		this.pos = {
			x: p.pos?p.pos.x?p.pos.x:0:0,
			y: p.pos?p.pos.y?p.pos.y:0:0,
			z: p.pos?p.pos.z?p.pos.z:0:0
		}

		this.coord = {
			x: p.coord?p.coord.x?p.coord.x:0:0,
			y: p.coord?p.coord.y?p.coord.y:0:0,
			z: p.coord?p.coord.z?p.coord.z:0:0
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
					if (this.stat == "highlight") {
						this.ctx.drawImage(highlight, x + w*i, y + h*j, w, h);						
					}
				}
			}
		}
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
};

class terrSq extends o {
	constructor(p) {
		super(p);
		//console.log(p.type);
		this.type = p.type?p.type:0;
		this.images = p.images?p.images:{};
	}
	set type(value) {
		//console.log(value);
		try{
			this.img = this.images[value];
		}
		catch (err) {}
	}
	draw(p) {
		//super(p);
		super.draw(p);
	}
}
// FUNCTIONS

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

// load game resources // images
function load_resources () {
	default_image.src='img/defaut.jpg';
	tr_img01.src='img/tr01.jpg';
	tr_img02.src='img/tr02.jpg';
	
	grass01.src='img/grass01.jpg';
	select01.src='img/select01.jpg';
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
	pers = new o({
		img: default_image,
		ctx: ctx,
		w: G_SQ,
		h: G_SQ,
		pos:{
			x: 25,
			y: 25,
			z: 0
		},
		id: "pers"
	});
	/*
	tr01 = new terrSq({
		img: tr_img01,
		ctx: ctx,
		w: G_SQ,
		h: G_SQ
	});
	*/
	for (var i=0; i<ter_n_h; i++) {
		ter[i] = [];
		for(var j=0; j<ter_n_v; j++) {
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
					x: G_SQ*i + 25,
					y: G_SQ*j + 25
				},
				coord:{
					x: i,
					y: j
				},
				stat: "normal",
				images: {
					normal: grass01,
					highlight: highlight
				}
			});
		}
	}
	//pers.img = default_image;
	//pers.ctx = ctx;
}
function start () {
	create_gamezone();
	create_canvas();
	init();
	draw();
}
function draw() {
	ctx.clearRect(0, 0, Canvas_Width, Canvas_Height);
	for (var i=0; i<ter_n_h; i++) {
		for(var j=0; j<ter_n_v; j++) {
			if(
				/*/
				Math.abs(pers.pos.x-ter[i][j].aim_x) < 61 &&
				Math.abs(pers.pos.y-ter[i][j].aim_y) < 61
				/**/
				Math.abs(pers.coord.x-ter[i][j].coord.x) <= 1 &&
				Math.abs(pers.coord.y-ter[i][j].coord.y) <= 1
				) {

				//ter[i][j].moveToAim();
				ter[i][j].fadeIn();
				ter[i][j].stat = "highlight";
				//ter[i][j].visible = true;
				} else {
					ter[i][j].stat = "normal";
				}
		ter[i][j].draw();
		}
	}
	//tr01.draw({repeat_x:5, repeat_y:5});
	pers.draw();
	drawFPS(fps);
}

function act() {
	if(GAME_ON) {
		requestAnimationFrame(act);
	}
	var now = new Date();
	console.log(calculateFps(now));
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
	  console.log("X: " + X + "  Y: " + Y);
	});


});
