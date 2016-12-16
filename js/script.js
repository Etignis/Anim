// CONSTANT

var Canvas_Height = 300, Canvas_Width = 300;
var ctx;
var default_image = new Image();
var tr_img01 = new Image();
var tr_img02 = new Image();

var pers;
var ter = [];

var GAME_ON = true;
var lastAnimationFrameTime,deltaTime, last_time, spf, max_deltaTime, min_deltaTime,lastFpsUpdateTime;


// Objects
function obj (p) {
	this.w = 50; // width
	this.h = 50; // height
	this.aim_x = null;
	this.aim_y = null;
	this.pos = {
		x: 0,
		y: 0,
		z: 0
	}
	this.defaultSpeed = 10;
	this.speed = {
		x: 0,
		y: 0,
		z: 0
	}
	this.img = new Image ();
	this.ctx;
	this.visible = true;

	if(p) {
		if(p.img){
			this.img=p.img;
		}
		if(p.ctx){
			this.ctx=p.ctx;
		}
		if(p.aim_x){
			this.aim_x=p.aim_x;
		}
		if(p.aim_y){
			this.aim_y=p.aim_y;
		}
		if(p.pos){
			this.pos.x=p.pos.x;
			this.pos.y=p.pos.y;
		}
		if(p.visible != undefined){
			this.visible=p.visible;
		}
	}
};
obj.prototype.draw = function(p) {
	/*
	p.ctx
	p.repeat_x
	p.repeat_y
	*/
	var w = this.w?this.w:this.img.width;
	var h = this.h?this.h:this.img.height;
	var x = this.pos.x - this.w/2;
	var y = this.pos.y - this.h/2;
	var r_x = 1;
	var r_y = 1;

	if(p) {
		this.ctx = p.ctx? p.ctx: this.ctx;
		if(p.repeat_x != undefined)
			r_x = p.repeat_x;
		if(p.repeat_y != undefined)
			r_y = p.repeat_y;
	}
	if(this.ctx && this.img && this.visible) {
		for (var i = 0; i<r_x; i++ ) {
			for (var j = 0; j<r_y; j++ ) {
				this.ctx.drawImage(this.img, x + w*i, y + h*j, w, h);
			}
		}
	}
};
obj.prototype.move = function(dir) {
	switch(dir) {
		case "up": this.pos.y = this.pos.y - this.defaultSpeed
		break;
		case "right": this.pos.x = +this.pos.x + +this.defaultSpeed
		break;
		case "down": this.pos.y = +this.pos.y + +this.defaultSpeed
		break;
		case "left": this.pos.x = this.pos.x - this.defaultSpeed
		break;
	}
};
obj.prototype.moveToAim = function() {
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
	return fps.toFixed(0);
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
	pers = new obj({
		img: default_image,
		ctx: ctx,
		w: 50,
		h: 50,
		pos:{
			x: 150,
			y: 150
		}
	});
	tr01 = new obj({
		img: tr_img01,
		ctx: ctx,
		w: 50,
		h: 50
	});
	for (var i=0; i<10; i++) {
		ter[i] = [];
		for(var j=0; j<10; j++) {
			ter[i][j] = new obj({
				img: tr_img01,
				ctx: ctx,
				w: 50,
				h: 50,
				aim_x: 50*i,
				aim_y: 50*j,
				visible: false,
				pos:{
					x: 50*i,
					y: 50*j
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
	for (var i=0; i<10; i++) {
		for(var j=0; j<10; j++) {
			if(
				/**/
				Math.abs(pers.pos.x-ter[i][j].aim_x) < 61 &&
				Math.abs(pers.pos.y-ter[i][j].aim_y) < 61
				/**/
				) {

				//ter[i][j].moveToAim();
				ter[i][j].visible = true;
				}
		ter[i][j].draw();
		}
	}
	//tr01.draw({repeat_x:5, repeat_y:5});
	pers.draw();
}

function act() {
	if(GAME_ON) {
		requestAnimationFrame(act);
	}
	now = new Date();
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
	now = new Date();
	//lastAnimationFrameTime = now;
	//lastFpsUpdateTime = now;
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
				pers.speed.x=0;
				pers.speed.y=0;
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
	  console.log("X: " + relativeX + "  Y: " + relativeY);
	});

});
