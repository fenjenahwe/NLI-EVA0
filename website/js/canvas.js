//framework provided in the VCE course by javi agenjo, used as a starting point

var scene = null;
var renderer = null;
var camera = null;
var character = null;

var animations = {};
var animation = null;

function init()
{
	//create the rendering context
	var context = GL.create({width: window.innerWidth, height:window.innerHeight});

	//setup renderer
	renderer = new RD.Renderer(context);
	renderer.setDataFolder("../avatar");
	renderer.autoload_assets = true;

	//attach canvas to DOM
	const cont = document.querySelector('#canvascont');
	cont.appendChild(renderer.canvas);

	//create a scene
	scene = new RD.Scene();

	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt( [0,45,60],[0,20,0],[0,1,0] );

	//global settings
	var bg_color = [1,1,1,1];
	var avatar = "eva3";
	var avatar_scale = 0.3;

	//create material for the girl
	var mat = new RD.Material({
		textures: {
		 color: "eva3/eva3.png" }
		});
	mat.register("eva3");

	//create pivot point for the girl
	var girl_pivot = new RD.SceneNode({
		position: [5,-5,5]
	});

	//create a mesh for the girl
	var girl = new RD.SceneNode({
		scaling: avatar_scale,
		mesh: avatar + "/" + avatar +".MESH",
		material: "eva3"
	});
	girl_pivot.addChild(girl);
	girl.skeleton = new RD.Skeleton();
	scene.root.addChild( girl_pivot );

	var girl_selector = new RD.SceneNode({
		position: [0,20,0],
		mesh: "cube",
		material: "eva3",
		scaling: [8,20,8],
		name: "eva3_selector",
		layers: 0b1000
	});
	girl_pivot.addChild( girl_selector );


	character = girl;

	//load some animations
	function loadAnimation( name, url )
	{
		var anim = animations[name] = new RD.SkeletalAnimation();
		anim.load(url);
		return anim;
	}
	loadAnimation("idle","../avatar/"+avatar+"/idle.skanim");
	loadAnimation("thinking","../avatar/"+avatar+"/thinking.skanim");
	loadAnimation("waving","../avatar/"+avatar+"/waving.skanim");
	loadAnimation("headnod","../avatar/"+avatar+"/headnod.skanim");
	loadAnimation("headshake","../avatar/"+avatar+"/headshake.skanim");
	loadAnimation("talking","../avatar/"+avatar+"/talking.skanim");
	loadAnimation("pointing","../avatar/"+avatar+"/pointing.skanim");


	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		gl.canvas.width = document.body.offsetWidth;
		gl.canvas.height = document.body.offsetHeight;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );

		//clear
		renderer.clear(bg_color);
		//render scene
		renderer.render(scene, camera, null, 0b11 );

	}

	//main update
	context.onupdate = function(dt)
	{
		//not necessary but just in case...
		scene.update(dt);

		var t = getTime();
		var anim = animations.idle;
		var time_factor = 1;

		
		if(Chat.response) {
			var res = Chat.response;
			//control anim with queries
			if(res.response_transcription.includes("welcome") || res.response_transcription.includes("Bye"))
			{	
				anim = animations.waving;
			}
			// else if(res.response_transcription.includes("teaching staff"))
			// {
			// 	anim = animations.headnod;
			// }
			else if(res.response_transcription.includes("cheer") || res.response_transcription.includes("is a map") || res.response_transcription.includes("building") || res.response_transcription.includes("office"))
			{
				anim = animations.pointing;
			}
			else if(res.response_transcription.includes("found multiple"))
			{
				anim = animations.headshake;
			}
			else if (Chat.stopaudio == 1)
			{
				anim = animations.idle;
				Chat.stopaudio = 0;
			}
			else
			{
				anim = animations.talking;
			}

		}

		else anim = animations.idle;
	
		//move bones in the skeleton based on animation
		anim.assignTime( t * 0.001 * time_factor );
		//copy the skeleton in the animation to the character
		character.skeleton.copyFrom( anim.skeleton );
	}

	//user input ***********************

	context.onmouse = function(e)
	{

	}

	//detect clicks
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{

		}
	}

	context.onmousemove = function(e)
	{
		if(e.dragging)
		{

		}
	}

	context.onmousewheel = function(e)
	{

	}

	//capture mouse events
	context.captureMouse(true);
	context.captureKeys();

	//launch loop
	context.animate();

}


