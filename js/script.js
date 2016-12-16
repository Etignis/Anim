// CONSTANT

var Canvas_Height, Canvas_Width;
var ctx;
var default_image = new Image();
var tr_img01 = new Image();

var pers;

var GAME_ON = true;
var lastAnimationFrameTime,deltaTime, last_time, spf, max_deltaTime, min_deltaTime,lastFpsUpdateTime;


// Objects
function obj (p) {
	this.w = 0; // width
	this.h = 0; // height
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

	if(p) {
		if(p.img){
			this.img=p.img;
		}
		if(p.ctx){
			this.ctx=p.ctx;
		}
	}
};
obj.prototype.draw = function(p) {
	/*
	p.ctx
	p.repeat_x
	p.repeat_y
	*/

	var w = this.img.width;
	var h = this.img.height;
	var x = this.pos.x;
	var y = this.pos.y;
	var r_x = 1;
	var r_y = 1;

	if(p) {
		this.ctx = p.ctx? p.ctx: this.ctx;
		if(p.repeat_x != undefined)
			r_x = p.repeat_x;
		if(p.repeat_y != undefined)
			r_y = p.repeat_y;
	}
	if(this.ctx && this.img) {

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
	$('#game_zone').append("<canvas id='c_bg' width='"+300+"' height='"+300+"'>Your browser does not support HTML5 Canvas.</canvas>");
	c_bg = document.getElementById('c_bg');
	Canvas_Height      = $('#c_bg').height();
	Canvas_Width       = $('#c_bg').width();
	ctx = c_bg.getContext('2d');
}

// load game resources // images
function load_resources () {
	default_image.src='img/defaut.jpg';
	tr_img01.src='img/tr01.jpg';

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
		ctx: ctx
	});
	tr01 = new obj({
		img: tr_img01,
		ctx: ctx
	});
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
	//draw_el(pers);
	tr01.draw({repeat_x:5, repeat_y:5});
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

//
$(document).ready(function(){
	load_resources();
	act();

	$('body').keydown(function(e){
	//alert(e.which);
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
		case 27:           // ESC
			if(GAME_ON)
			 GAME_ON=false;
			else
			 GAME_ON=true;
		default:
			pers.speed.x=0;
			pers.speed.y=0;
	}
 });
});
