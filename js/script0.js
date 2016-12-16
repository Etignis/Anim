$(document).ready(function(){

// --------------------------- ОБЪЯВЛЕНИЯ ----------------------------

var c_bg, context_bg, c_act, context_act, c_int, context_int;
var fps=1, spf=1, deltaTime=0,  max_deltaTime=0,  min_deltaTime=9999, lastFpsUpdateTime=0, last_time=0, startTime=0,now;
var game_on=0;
var f_show_collider=0;
var cloud_max=10, cloud_num=0, cloud_space_x=120, cloud_space_y= 100, cloud=[],cloud_max_x=0, cloud_max_y=0, cloud_min_x=0, cloud_min_y=0;
var arrow_max=10, arrow_num=0, arrow_space_x=45, arrow_space_y= 210, arrow=[], arrow_max_x=0, arrow_max_y=0, arrow_min_x=0, arrow_min_y=0;
var lightning_max=2, lightning_num=0, lightning=[];
var boom_max=10, boom_num=0, boom=[];
var coin_max=10, coin_num=0, coin=[], coin_space_x=30, coin_space_y=30, coin_max_x=0, coin_max_y=0, coin_min_x=0, coin_min_y=0;
var common_speed=0, common_distance=0;

var lastAnimationFrameTime = 0,
    fpsElement = document.getElementById('fps');


// Константы............................................................

	TILE_HEIGHT        = 100;
	TILE_WIDTH         = 100;

	HERO_HEIGHT        = 59;
	HERO_WIDTH         = 81;
	HERO_START_TOP     = 30;
	HERO_START_LEFT    = 380;
	HERO_START_SPEED   = 450;

	CLOUD_HEIGHT       = 50;
	CLOUD_WIDTH        = 90;

	ARROW_HEIGHT       = 71;
	ARROW_WIDTH        = 22;

	BOOM_HEIGHT       = 100;
	BOOM_WIDTH        = 100;

	SKY_COLOR          = '#1197d6';

	GRAVITATION        = -0.5;

	START_SPEED        = 150;

	STANDART_ANIMATION = 100;

// Очень глобальные переменые

	Canvas_Height      = $('#c_bg').height();
	Canvas_Width       = $('#c_bg').width();

	Window_Height      = document.body.offsetHeight-1;
	Window_Width       = document.body.offsetWidth;

	//alert(Window_Width+'x'+Window_Height);


   // Изображения

   background  = new Image();
   knightImage = new Image();
   cloudImage  = new Image();
   enemyImage  = new Image();
   itemImage  = new Image();

   // Герой
    //class
	function Hero()
	{
	this.speed_x=      0,
    this.speed_y=      0,
	this.pos_x=        0,
	this.pos_y=        0,
	this.hp=           100,
	this.hp_max=       100,
	this.mp=           100,
	this.view=         0,
	this.rx=           3,
	this.ry=           3,
	this.dt_img=       0,
	this.img=          0,
	this.img_shift=    0,
	this.f_lght=       0
	}
	Hero.prototype.hp_down = function(hp_down)
	{
		this.hp-=hp_down;
		if(this.hp<0)
			this.hp=0;
		show_info("HP: "+this.hp);
	}
	Hero.prototype.hp_up = function(hp_up)
	{
		this.hp+=hp_up;
		if(this.hp>hp_max)
			this.hp=hp_max;
		show_info("HP: "+this.hp);
	}
   // Облака
    // class
	function Cloud(type)
	{

		this.l_chance=7;

		this.type=type;
		this.h=CLOUD_HEIGHT;
		this.w=CLOUD_WIDTH;
		this.x=-this.w*2;
		this.y=-this.h*2;
		this.speed_x=0;
		this.speed_y=0;
		this.rx=45;
		this.ry=18;

		this.f_clash=0;

		this.dt_img=0;

		this.lightning=0;
		this.f_l_clash=0;

		//this.zero();
	}
	Cloud.prototype.pos = function(x, y)
	{
		this.x=x;
		this.y=y;
	}
	Cloud.prototype.boom = function()
	{this.speed = 0;}
	Cloud.prototype.speed=0;
	Cloud.prototype.zero = function()
	{
		type=int_rand(0,3);
		this.type=type;
		x=int_rand(cloud_min_x, cloud_max_x-1)*cloud_space_x;
		y=int_rand(cloud_min_y, cloud_max_y+1)*cloud_space_y+Canvas_Height;
		this.x=x;
		this.y=y;

		this.speed_x=0;
		this.speed_y=0;

		this.lightning=0;
		if(int_rand(0,this.l_chance)==1)
		{
			this.lightning=1;
			//show_info('l='+1);
		}

		this.f_clash=0;

		this.dt_img=0;

		this.f_l_clash=0;
		this.l_chance=3;
	}
	//

// arrows
    // class
	function Arrow()
	{
		this.x=0;
		this.y=0;
		this.speed_x=0;
		this.speed_y=0;
		this.hp=1;
		this.damage=10;
		this.img=0;
		this.rx=35;
		this.ry=18;
		this.f_clash=0;
		this.dt_img=0;
	}
	Arrow.prototype.move = function(speed_y)
	{this.speed_y = speed_y;}
	Arrow.prototype.pos = function(x, y)
	{
		this.x=x;
		this.y=y;
	}
	Arrow.prototype.boom = function()
	{this.speed = 0;}
	Arrow.prototype.speed=0;
	Arrow.prototype.zero = function()
	 {
		x=int_rand(arrow_min_x, arrow_max_x-1)*arrow_space_x;
		y=int_rand(arrow_min_y, arrow_max_y+5)*arrow_space_y+Canvas_Height*3;
		this.x=x;
		this.y=y;
		this.speed_x=0;
		this.speed_y=0;
		this.img=0;
		this.f_clash=0;
		this.dt_img=0;
	 }

	//

// boom
    // class
	function Boom()
	{
		this.x=0;
		this.y=0;
		this.speed_x=0;
		this.speed_y=0;
		this.img=0;
		this.rx=0;
		this.ry=0;
		this.f_clash=0;
		this.dt_img=0;
	}
	Boom.prototype.move = function(speed_y)
	{this.speed_y = speed_y;}
	Boom.prototype.pos = function(x, y)
	{
		this.x=x;
		this.y=y;
	}
	Boom.prototype.boom = function()
	{
		this.speed = 0;
		this.x=-BOOM_WIDTH;
		this.y=-BOOM_HEIGHT;
		this.img=0;
	}
	Boom.prototype.speed=0;
	//

// lightning
    // class
	function Lightning()
	{
		this.x=-56;
		this.y=0;
		this.h=56;
		this.w=19;
		this.img=0;
		this.damage=10;
		this.dt_img=0;
		this.f_vis=0;
	}
	Lightning.prototype.move = function(speed_y)
	{this.speed_y = speed_y;}
	Lightning.prototype.pos = function(x, y)
	{
		this.x=x;
		this.y=y;
	}
	Lightning.prototype.boom = function()
	{
		this.speed = 0;
		this.x=-this.w;
		this.y=-this.h;
		this.img=0;
	}
	Lightning.prototype.speed=0;
	//


// coin
    // class
	function Coin()
	{
		this.h=25;
		this.w=25;
		this.x=-this.w*2;
		this.y=-this.h*2;
		this.img=0;
		this.dt_img=0;
		this.f_vis=0;
		this.coast=1;
	}
	Coin.prototype.pos = function(x, y)
	{
		this.x=x;
		this.y=y;
	}
	Coin.prototype.zero = function()
	{
		x=int_rand(coin_min_x, coin_max_x-1)*coin_space_x;
		y=int_rand(coin_min_y, coin_max_y+5)*coin_space_y+Canvas_Height;
		this.x=x;
		this.y=y;
		this.img=0;
		this.dt_img=0;
	}
	//


function int_rand(min,max)
{
  //return Math.floor(Math.random() * max + min);
	return Math.floor(Math.random() * (max - min + 1)) + min;

}
// ------------------------- ИНИЦИАЛИЗАЦИЯ ----------------------------

function initializeImages() {
	//alert('initializeImages()');
   resize_canvas();
   background.src  = 'imgs/source/sky_background.jpg';
   knightImage.src = 'imgs/source/Hero-sprite_pixel_2_anim.png';
   cloudImage.src  = 'imgs/source/Clouds-sprite_4.png';
   enemyImage.src  = 'imgs/source/enemy.png';
   itemImage.src  = 'imgs/source/item.png';

	$.when(background.onload, knightImage.onload, cloudImage.onload, enemyImage.onload, itemImage.onload).done(function() { startGame();});

}

function drawBackground() {
		//alert(Canvas_Width+"x"+Canvas_Height);
   context_bg.drawImage(background, 0, 0, Canvas_Width, Canvas_Height);
}

function start_hero(){
	hero = new Hero();
}
function drawHero() {
	//context_act.fillStyle = "rgba(255,255,255,0)";
	//context_act.clearRect(hero.pos_x, hero.pos_y, HERO_WIDTH, HERO_HEIGHT);

	//f_lgh=0;

	hero.pos_x+=hero.speed_x*deltaTime/*deltaTime*/;
	if(hero.pos_x<0)
		hero.pos_x=0;
	if(hero.pos_x>Canvas_Width-HERO_WIDTH)
		hero.pos_x=Canvas_Width-HERO_WIDTH;
	hero.pos_y+=hero.speed_y*deltaTime/*deltaTime*/;
	if(hero.pos_y<0)
		hero.pos_y=0;
	if(hero.pos_y>Canvas_Height-HERO_HEIGHT)
		hero.pos_y=Canvas_Height-HERO_HEIGHT;

	hero.pos_x=Math.floor(hero.pos_x);
	hero.pos_y=Math.floor(hero.pos_y);

	// big collider
	if(f_show_collider==1)
	{
		context_act.fillStyle = "rgba(255,0,0,0.3)";
		context_act.fillRect(hero.pos_x, hero.pos_y, HERO_WIDTH, HERO_HEIGHT);
	}
	/**/
	// anim
	if((now - hero.dt_img)>STANDART_ANIMATION)
	{
		if(hero.img==1)
			hero.img=0;
		else
			hero.img=1;
		switch(hero.f_lght)
		{
			case 1: hero.f_lght=2;
					hero.img_shift=2;
					hero.img=0;
					break;
			case 2: hero.f_lght=3;
					hero.img_shift=0;
					hero.img=0;
					break;
			case 3: hero.f_lght=4;
					hero.img_shift=2;
					hero.img=0;
					break;
			case 4: hero.f_lght=0;
					hero.img_shift=0;
					hero.img=0;
					break;
		}
		hero.dt_img=now;
		//show_info(hero.img);
	}
	/**/
   context_act.drawImage(knightImage,
					 TILE_WIDTH*hero.img,
					 TILE_HEIGHT*(hero.view+hero.img_shift),
					 HERO_WIDTH,
					 HERO_HEIGHT,
					 hero.pos_x,
					 hero.pos_y,
					 HERO_WIDTH,
					 HERO_HEIGHT
					 );
	/**/
	if(f_show_collider==1)
	{
		x_num1=(HERO_WIDTH-hero.rx*2)/2;
		y_num1=(HERO_HEIGHT-hero.ry*2)/2;

		cx11=hero.pos_x+0+x_num1;
		cx12=hero.pos_x+HERO_WIDTH-x_num1;
		cy11=hero.pos_y+0+y_num1;
		cy12=hero.pos_y+HERO_HEIGHT-y_num1;

		context_act.fillStyle = "rgba(0,0,0,0.6)";
		context_act.fillRect(cx11, cy11, cx12-cx11, cy12-cy11);
	}
	/**/
	hero.speed_x=0;
	hero.speed_y=0;
	/**/
}

function start_cloud()
{
	cloud_max_x=Math.floor(Canvas_Width/cloud_space_x); // max x position
	cloud_min_x=0;
	cloud_max_y=Math.floor(Canvas_Height/cloud_space_y); // max y position
	cloud_min_y=0;

	//alert('max_x='+cloud_max_x+" max_y="+cloud_max_y);

	for(i=0;i<cloud_max;i++) // create all clouds
	{
		type=int_rand(0,3);
		cloud[i]= new Cloud(type);
		cloud[i].zero();
		//show_info('create: ' +cloud[i].x+' '+cloud[i].y);
	}
}
function draw_cloud(){
	for(i=0;i<cloud_max;i++)
	{
		//context_act.clearRect(cloud[i].x, cloud[i].y, CLOUD_WIDTH, CLOUD_HEIGHT);  // clear old img
		//show_info('draw: '+cloud[i].x+' '+cloud[i].y);
		cloud[i].y-=common_speed*deltaTime;                                                   // move cloud
		if(cloud[i].y < 0-CLOUD_HEIGHT*2)
		{
			cloud[i].zero();
		}
//show_info(cloud[i].y);
		// clash
		f_clash=0;
		if(cloud[i].f_clash==0)
		 f_clash=clash(cloud[i].x, cloud[i].y,
					   cloud[i].x+CLOUD_WIDTH, cloud[i].y+CLOUD_HEIGHT,
					   hero.pos_x+HERO_WIDTH/2, hero.pos_y+HERO_HEIGHT/2);

		if(f_clash==1)
		{
			cloud[i].f_clash=1;
			if(common_speed>120)
				common_speed-=2
			console.log("cloud CLASH");
		}
		//big collider
		if(f_show_collider==1)
		{
			context_act.fillStyle = "rgba(0,0,255,0.4)";
			context_act.fillRect(cloud[i].x, cloud[i].y, CLOUD_WIDTH, CLOUD_HEIGHT);
		}

		/**/
		context_act.drawImage(cloudImage,
					 TILE_WIDTH*0,
					 TILE_HEIGHT*cloud[i].type,
					 CLOUD_WIDTH,
					 CLOUD_HEIGHT,
					 cloud[i].x,
					 cloud[i].y,
					 CLOUD_WIDTH,
					 CLOUD_HEIGHT
					 );
		/**/
			lg_x=cloud[i].x+CLOUD_WIDTH/2-20;
			lg_y=cloud[i].y+CLOUD_HEIGHT*2;
			lg_w=40;
			lg_h=20;
		if(f_show_collider==1)
		{

			context_act.fillStyle = "rgba(240,240,0,0.6)";
			context_act.fillRect(lg_x, lg_y, lg_w, lg_h);
		}
		//show_info("lg_x: "+lg_x.toFixed(0)+" lg_y:"+lg_y.toFixed(0)+" lg_w:"+lg_w.toFixed(0)+" lg_h:"+lg_h.toFixed(0));
		// lightning
		//show_info('lightning: '+cloud[i].lightning);
		if(cloud[i].lightning==1)
		{
			f_l_clash=0;
			if(cloud[i].f_l_clash==0)
			 f_l_clash=clash(lg_x, lg_y,
						   lg_x+lg_w, lg_y+lg_h,
						   hero.pos_x+HERO_WIDTH/2, hero.pos_y+HERO_HEIGHT/2);
			if(f_l_clash==1)
			{
				cloud[i].f_l_clash=1;
				show_info("lightning CLASH");
				for(n=0;n<lightning_max;n++)
				{
					//show_info('lightning cicle '+lightning[n].f_vis);
					if(lightning[n].f_vis==0)
					{
					lightning[n].f_vis=1;
					lightning[n].dt_img=now;
					lightning[n].x=hero.pos_x+HERO_WIDTH/2-lightning[n].w/2;
					lightning[n].y=hero.pos_y-lightning[n].h+20;
					//show_info('creating lightning');
					hero.f_lght=1;
					//alert(lightning[n].damage);
					hero.hp_down(lightning[n].damage);
					break;
					}
				}
			}

		}



		/**/
	}
}

function start_arrow()
{
	arrow_max_x=Math.floor(Canvas_Width/arrow_space_x); // max x position
	arrow_min_x=0;
	arrow_max_y=Math.floor(Canvas_Height/arrow_space_y); // max y position
	arrow_min_y=0;

	//alert('max_x='+max_x+" max_y="+max_y);

	for(i=0;i<arrow_max;i++) // create all arrows
	{
		//type=int_rand(0,3);
		arrow[i]= new Arrow();
		arrow[i].zero();
		/*
		x=int_rand(arrow_min_x, arrow_max_x-1)*arrow_space_x;
		y=int_rand(arrow_min_y, arrow_max_y+5)*arrow_space_y+Canvas_Height*3;
		//alert(x+" "+y);
		arrow[i].pos(x,y); //random /x y/
		//alert(arrow[i].x);
		*/
	}
}
function draw_arrow(){
	for(i=0;i<arrow_max;i++)
	{
		//context_act.clearRect(arrow[i].x, arrow[i].y, ARROW_WIDTH, ARROW_HEIGHT);  // clear old img

		arrow[i].y-=common_speed*1.4*deltaTime;                                                   // move arrow
		if(arrow[i].y < 0-ARROW_HEIGHT*2)
		{
			arrow[i].x = int_rand(arrow_min_x, arrow_max_x-1)*arrow_space_x;
			arrow[i].y = Canvas_Height+int_rand(arrow_min_y, arrow_max_y+1)*arrow_space_y;
			arrow[i].f_clash=0;
		}

		if((now - arrow[i].dt_img)>STANDART_ANIMATION)
		{
			switch(arrow[i].img)
			{
				case 0: arrow[i].img=1;
				break;
				case 1: arrow[i].img=2;
				break;
				case 2: arrow[i].img=3;
				break;
				case 3: arrow[i].img=4;
				break;
				case 4: arrow[i].img=5;
				break;
				case 5: arrow[i].img=0;
				break;
			}
			//show_info(arrow[i].img);
			arrow[i].dt_img=now;
		}

		x_num1=(ARROW_WIDTH-arrow[i].rx*2)/2;
		y_num1=(ARROW_HEIGHT-arrow[i].ry*2)/2;
		cx11=arrow[i].x+0+x_num1;
		cx12=arrow[i].x+ARROW_WIDTH-x_num1;
		cy11=arrow[i].y+0+y_num1;
		cy12=arrow[i].y+ARROW_HEIGHT-y_num1;

		f_clash=0;
		if(arrow[i].f_clash==0)
		 f_clash=clash(arrow[i].x-5, arrow[i].y-5,
					   arrow[i].x+ARROW_WIDTH+10, arrow[i].y+ARROW_HEIGHT-40,
					   hero.pos_x+HERO_WIDTH/2, hero.pos_y+HERO_HEIGHT/2);
		if(f_clash==1)
		{
			arrow[i].f_clash=1;
			console.log("arrow CLASH<br>"+(arrow[i].x-5)+' '+(hero.pos_x+HERO_WIDTH/2)+' '+(arrow[i].x+ARROW_WIDTH+10)+'<br>'+(arrow[i].y-5)+' '+(hero.pos_y+HERO_HEIGHT/2)+' '+(arrow[i].y+ARROW_HEIGHT-40));
			//debugger;
			for(j=0;j<boom_max;j++)
			{
				if(boom[j].img==0)
				{
				boom[j].x=arrow[i].x+10-BOOM_WIDTH/2;
				boom[j].y=arrow[i].y+10-BOOM_HEIGHT/2;
				break;
				}
			}
			//boom[0].x=arrow[i].x+10-BOOM_WIDTH/2;
			//boom[0].y=arrow[i].y+10-BOOM_HEIGHT/2;

			arrow[i].x = int_rand(arrow_min_x, arrow_max_x-1)*arrow_space_x;
			arrow[i].y = Canvas_Height;
			arrow[i].f_clash=0;

			hero.hp_down(arrow[i].damage);
		}

		if(f_show_collider==1)
		{
			//alert(arrow[i].img);
			context_act.fillStyle = "rgba(0,255,0,0.4)";
			context_act.fillRect(arrow[i].x, arrow[i].y, ARROW_WIDTH, ARROW_HEIGHT);
		}
		/**/
		context_act.drawImage(enemyImage,
					 TILE_WIDTH*arrow[i].img,
					 TILE_HEIGHT*1,
					 ARROW_WIDTH,
					 ARROW_HEIGHT,
					 arrow[i].x,
					 arrow[i].y,
					 ARROW_WIDTH,
					 ARROW_HEIGHT
					 );
		/**/
		if(f_show_collider==1)
		{
			context_act.fillStyle = "rgba(0,0,0,0.6)";
			context_act.fillRect(arrow[i].x-5, arrow[i].y-5, ARROW_WIDTH+10, ARROW_HEIGHT-40);
		}
	}
}

function start_boom()
{
	for(i=0;i<boom_max;i++) // create all booms
	{
		//type=int_rand(0,3);
		boom[i]= new Boom();
		x=-BOOM_WIDTH;
		y=-BOOM_HEIGHT;
		//alert(x+" "+y);
		boom[i].pos(x,y); //random /x y/
		//alert(boom[i].x);
	}
}
function draw_boom(){
	for(i=0;i<boom_max;i++)
	{
		//context_act.clearRect(boom[i].x, boom[i].y, boom_WIDTH, boom_HEIGHT);  // clear old img

		//boom[i].y-=common_speed*1.4/*deltaTime*/;                                                 // move boom

	if(boom[i].x>-BOOM_WIDTH)
	{
		if((now - boom[i].dt_img)>STANDART_ANIMATION*0.8)
		{
			switch(boom[i].img)
			{
				case 0: boom[i].img=1;
				break;
				case 1: boom[i].img=2;
				break;
				case 2: boom[i].img=3;
				break;
				case 3: boom[i].img=4;
				break;
				case 4: boom[i].img=5;
				break;
				case 5: boom[i].x=-200;
						boom[i].y=-200;
						boom[i].img=0;
				break;

			}
		boom[i].dt_img=now;
		}
	}


		//ale
		/**/
		context_act.drawImage(enemyImage,
					 TILE_WIDTH*boom[i].img,
					 TILE_HEIGHT*0,
					 BOOM_WIDTH,
					 BOOM_HEIGHT,
					 boom[i].x,
					 boom[i].y,
					 BOOM_WIDTH,
					 BOOM_HEIGHT
					 );

	}
}
function start_lightning()
{
	for(i=0;i<lightning_max;i++) // create all lightnins
	{

		lightning[i]= new Lightning();
		//lightning[i].f_vis=0;
	}
}
function draw_lightning(){
	for(i=0;i<lightning_max;i++)
	{
		if(lightning[i].f_vis==1)
		{
			//move
			lightning[i].y-=common_speed*deltaTime;
			if(lightning[i].y < 0-lightning[i].h*2)
			{
				lightning[i].x = -lightning[i].w*2;
				lightning[i].y = -lightning[i].h*2;

			}
			// collider
			if(f_show_collider==1)
			{
				context_act.fillStyle = "rgba(0,0,255,0.4)";
				context_act.fillRect(lightning[i].x, lightning[i].y, lightning[i].w, lightning[i].h);
			}
			// anim
			if((now - lightning[i].dt_img)>STANDART_ANIMATION)
			{
				lightning[i].f_vis=0;
			}
			context_act.drawImage(enemyImage,
						 TILE_WIDTH*0,
						 TILE_HEIGHT*3, // !
						 lightning[i].w,
						 lightning[i].h,
						 lightning[i].x,
						 lightning[i].y,
						 lightning[i].w,
						 lightning[i].h
						 );
						 //game_pause();
		}
	}
}

function start_coin()
{
	//debugger;
	coin_max_x=Math.floor(Canvas_Width/coin_space_x); // max x position
	coin_min_x=0;
	coin_max_y=Math.floor(Canvas_Height/coin_space_y); // max y position
	coin_min_y=0;
	for(i=0;i<coin_max;i++) // create all coins
	{
		coin[i]= new Coin();
		coin[i].zero();
		show_info('new coin '+coin[i].x+' '+coin[i].y);
	}
}
function draw_coin(){
	for(i=0;i<coin_max;i++)
	{

			//move
			coin[i].y-=common_speed*deltaTime*0.9;
			if(coin[i].y < 0-coin[i].h*2)
			{
				coin[i].zero();
			}

			// collider
			if(f_show_collider==1)
			{
				context_act.fillStyle = "rgba(240,240,0,0.4)";
				context_act.fillRect(coin[i].x-15, coin[i].y-15, coin[i].w+30, coin[i].h+30);
			}
			// anim
			if((now - coin[0].dt_img)>STANDART_ANIMATION)
			{
				switch(coin[0].img)
				{
					case 0: coin[0].img=1;
					break;
					case 1: coin[0].img=2;
					break;
					case 2: coin[0].img=3;
					break;
					case 3: coin[0].img=4;
					break;
					case 4: coin[0].img=5;
					break;
					case 5: coin[0].img=0;
					break;

				}
			coin[0].dt_img=now;

			}
			context_act.drawImage(itemImage,
						 TILE_WIDTH*coin[0].img,
						 TILE_HEIGHT*0, // !
						 coin[i].w,
						 coin[i].h,
						 coin[i].x,
						 coin[i].y,
						 coin[i].w,
						 coin[i].h
						 );
			show_info(' coin '+coin[i].x.toFixed(0)+' '+coin[i].y.toFixed(0) +' '+ coin[i].img);
	}
}


//             xy1, h1, l1, rh1, rh21, xy2, h2, l2, rh2, rh2,
function clash(x1, y1, x2, y2, x3, y3)
{
	ret=0;
	x1=parseInt(x1.toFixed(0), 10);
	y1=parseInt(y1.toFixed(0), 10);
	x2=parseInt(x2.toFixed(0), 10);
	y2=parseInt(y2.toFixed(0), 10);
	x3=parseInt(x3.toFixed(0), 10);
	y3=parseInt(y3.toFixed(0), 10);
	string=x1+'<'+x3+'<'+x2+'  '+y1+'<'+y3+'<'+y2;
	//show_info(string);
	if(x1<x3&&x3<x2)//if((cx11<cx21&&cx12>cx22)||(cx11>cx21&&cx12<cx22))
	{
		if(y1<y3&&y3<y2)//if((cy11<cy21&&cy12>cy22)||(cy11>cy21&&cy12<cy22))
		{
			ret=1;
			console.log(string);
			//debugger;
		}
	}



	return ret;
}
function draw(now) {
	context_act.clearRect(0, 0, Canvas_Width, Canvas_Height);
	//alert('draw');
   drawBackground();
   //drawPlatforms();
   drawHero();
   draw_arrow();
   draw_cloud();
   draw_lightning();
   draw_coin();
   draw_boom();
}

function startGame() {
	//alert('startGame()');
	common_speed=START_SPEED;
	draw();
}

function resize_canvas(){
	/*Window_Height      = document.body.offsetHeight;
	Window_Width       = document.body.offsetWidth;
	alert(Window_Width+'x'+Window_Height);

	$('#game-canvas').height(Window_Height);
	$('#game-canvas').width(Window_Width);

	Canvas_Height      = $('#game-canvas').height();
	Canvas_Width       = $('#game-canvas').width();
	*/
	context_bg = c_bg.getContext('2d');
	context_act = c_act.getContext('2d');
	context_int = c_int.getContext('2d');


}
function create_canvas(){
	//alert(Window_Width+'x'+Window_Height);
	$('#game_zone').append("<canvas id='c_bg' width='"+Window_Width+"' height='"+Window_Height+"'>Your browser does not support HTML5 Canvas.</canvas>");
	$('#game_zone').append("<canvas id='c_act' width='"+Window_Width+"' height='"+Window_Height+"'></canvas>");
	$('#game_zone').append("<canvas id='c_int' width='"+Window_Width+"' height='"+Window_Height+"'>Y</canvas>");
	c_bg = document.getElementById('c_bg');
	c_act = document.getElementById('c_act');
	c_int = document.getElementById('c_int');
	Canvas_Height      = $('#c_bg').height();
	Canvas_Width       = $('#c_bg').width();

	cloud_max1=Math.floor((Canvas_Height*Canvas_Width)/(CLOUD_HEIGHT*CLOUD_WIDTH*9));
	if(cloud_max>cloud_max1)
		cloud_max=cloud_max1;
	show_info("cloud_max: "+cloud_max);
	//show_info("cloud_max1: "+cloud_max1);

	arrow_max1=Math.floor((Canvas_Height*Canvas_Width)/(ARROW_HEIGHT*ARROW_WIDTH*9));
	if(arrow_max>arrow_max1)
		arrow_max=arrow_max1;
	show_info("arrow_max: "+arrow_max);
	//show_info("arrow_max1: "+arrow_max1);
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
		show_vars();
	}

	last_time = now;
	return fps;
}
function show_vars()
{
	$('#vars').html("<br>fps: "+fps.toFixed(0)+"<br>deltaTime: "+deltaTime+" "+min_deltaTime+" "+max_deltaTime+"<br>speed: "+common_speed.toFixed(2)+"<br> dist: <b>"+Math.floor(common_distance)+"</b>"+"<br> HP: <b>"+Math.floor(hero.hp)+"</b>");
}
function act()
{
	if(game_on==1)
	{
		requestAnimationFrame(act);    // Запуск анимации
	}
	now = new Date();
	calculateFps(now);
	common_speed+=0.005;
	common_distance=common_speed*(now-startTime)/(60*60*30);
	draw();
	/*/
	for(i=0;i<99999999;i++)
	{
		a=i*3;
	}
    /**/
}
function show_info(string)
{
		$('#info_panel').prepend(string+"<br>");
}
// Запуск игры
$('button#start').click(function(){
	//debugger;
	$('#game_menu').hide();
	$('button#start').hide();
	$("#loading").show();
	lastFpsUpdateTime = (new Date());
	create_canvas();
	start_hero();
	start_cloud();
	start_arrow();
	start_boom();
	start_lightning();
	start_coin();
	hero.pos_x=Canvas_Width/2-HERO_WIDTH/2;
	hero.pos_y=HERO_START_TOP;
	initializeImages();
	game_on=1;
	act();
	startTime = new Date();
	$("#loading").hide();
	$('button#pause').show();
});

$('body').keydown(function(e){
	//alert(e.which);
	switch(e.which){
		case 83:				//down
			hero.speed_y=HERO_START_SPEED;
			//show_info("DOWN  Hero speed Y: "+hero.speed_y);
			break;
		case 87:				//up
			hero.speed_y=-HERO_START_SPEED;
			//show_info("  UP  Hero speed Y: "+hero.speed_y);
			break;
		case 65:				//left
			hero.speed_x=-HERO_START_SPEED;
			hero.view=1;
			//show_info("LEFT  Hero speed X: "+hero.speed_x);
			break;
		case 68:				//right
			hero.speed_x=HERO_START_SPEED;
			hero.view=0;
			//show_info("RIGHT Hero speed X: "+hero.speed_x);

			break;
		case 27:               // ESC
			if(game_on==1)
			 game_pause();
			else
			 game_continue();
		default:
			hero.speed_x=0;
			hero.speed_y=0;
			//show_info("Hero speed X: "+hero.speed_x+"<br>"+"Hero speed Y: "+hero.speed_y);
	}
	/*//down
	if(e.which==83)
		hero.speed_y+=1;
	else
		hero.speed_y=0;
	//up
	if(e.which==87)
		hero.speed_y-=1;
	else
	//left
	if(e.which==56)
		hero.speed_x-=1;
	else
		hero.speed_x=0;
	//right
	if(e.which==68)
		hero.speed_x+=1;
	else
		hero.speed_x=0;*/
	//draw();
 });

 function game_pause()
 {
	game_on=0;
	$('#game_menu').show();
 }
 function game_continue()
 {
	$('#game_menu').hide();
	now = new Date();
	//lastAnimationFrameTime = now;
	//lastFpsUpdateTime = now;
	last_time = now;
	game_on=1;
	act();
 }
 // add
 $("#info").click(function(){
	 $('#game_menu').hide();
	 $('#about').show();

 });
 $("#pause").click(function(){
	 game_continue();
 });
 $('.close').click(function(){
	 $('#game_menu').show();
	 $('#about').hide();

 });
$('#test').click(function(){
	alert(clash(45,26,82,62,48,284));
});
$('#test2').click(function(){
	alert(clash(45,26,82,62,55,55));
});
 });
