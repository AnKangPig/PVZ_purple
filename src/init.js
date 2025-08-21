(()=>{

	const {Sprite} = PIXI;

	core.init=async function(){

		//初始的bgm
		const bgm="CrazyDave.ogg";
		//开头是否强制点击后才开始
		//因为浏览器策略限制，即使是false也不能保证开头一定不用点击
		const forceclickbegin=true;

		//////////////////////////////////////////////////////////////////

		gsap.registerPlugin(PixiPlugin);
		const loading=document.getElementById("loading");
		const bgmd=document.getElementById("bgm");
		bgmd.src="./music/"+bgm;
		const clickbegin=()=>{
			return new Promise(resolve=>{
				document.documentElement.style.setProperty("--load","''");
				loading.innerHTML="&emsp;加载完成<br>请点击以开始";
				const fun=core.once(function(){
					core.bgm.play(bgm);resolve();
				});
				const body=document.getElementsByTagName("body")[0];
				//用mousedown才能触发interact,pointerdown不行
				body.addEventListener("mousedown",fun,{once:true});
				body.addEventListener("keydown",fun,{once:true});
			});
		}
		await bgmd.play().catch(e=>{
			if(e.name==="NotAllowedError"&&(!forceclickbegin))return clickbegin();
		}).finally(()=>{
			if(forceclickbegin){
				bgmd.pause();
				return clickbegin();
			}
		});
		loading.remove();
		//将鼠标指针设置为core.cursor（游戏默认指针）
		Cursor=core.cursor;
		
		const app = new PIXI.Application();
		//游戏一定为800*600，在此基础上拉伸
		await app.init({width:800,height:600});
		core.app=app;core.gdom.appendChild(app.canvas);
		//取消右键菜单
		app.view.addEventListener('contextmenu', (e) => {
			e.preventDefault();
		});

		//调整大小函数
		core.resize=()=>{
			//全屏模式或屏幕过小就拉满，否则维持800*600
			const full=localStorage.getItem('full')==="true";
			let adapt=document.fullscreenElement||(window.innerWidth<800)||(window.innerHeight<600)||full;
			let width=adapt?Math.min(window.innerWidth,window.innerHeight*4/3):800;
			document.documentElement.style.setProperty("--width",width+"px");
		};
		window.addEventListener('resize',core.resize);
		document.addEventListener('fullscreenchange',core.resize);
		core.resize();
		//none为线性缓动
		gsap.defaults({ease:"none"});

		
		let bgmvolume=localStorage.getItem("BGM_Volume");
		if(bgmvolume===null){localStorage.setItem("BGM_Volume",1);bgmvolume=1;}
		core.bgm.audio.volume=Number(bgmvolume)*core.soundlist.factor;
		let soundvolume=localStorage.getItem("Sound_Volume");
		if(soundvolume===null){localStorage.setItem("Sound_Volume",1);soundvolume=1;}
		core.soundlist.volume=Number(soundvolume)*core.soundlist.factor;

		const tl = gsap.timeline({onComplete:()=>{
			core.killTimelines();
			pop.destroy();
			core.startscreen();
		}});
		core.timelines.push(tl);
		const pop = core.set(
			new Sprite(img["PopCap_Logo"]),
			{
				parent:app.stage,
				anchor:0.5,alpha:0,
				pos:[400,300]
			}
		);
		tl.to(pop,{alpha:1, duration: 0.33},0.67);
		tl.to(pop,{alpha:0, duration: 0.5},2);

	}
	
})();

