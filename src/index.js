(async () => {
	const setting = {
		LoadingFont: "Font3",
		/*显示加载所用字体，请务必在loadfont最先加载它。
		在LoadingFont字体未加载时，会显示"./assets/image/loading.png"作为代替项。
		可使用"default"表示使用浏览器默认字体*/
	};
	//加载的js
	let loadjs = [
		"thirdparty/fs.js",
		"thirdparty/pixi.min.js",
		"thirdparty/unsafe-eval.min.js",
		"thirdparty/speet.min.js",
		"thirdparty/gsap.min.js",
		"thirdparty/PixiPlugin.min.js",
		"core.js",
		"init.js",
		"scenes/startscreen.js",
		"scenes/selectorscreen.js",
		"scenes/zombienote.js",
		"scenes/gamescreen.js",
		"widgets/dialog.js",
		"widgets/optionsmenu.js",
	];
	//加载的英文字体
	let loadEnFont = [
		["Brianneshand.ttf", "Brianneshand"]//文件名，引用名
	];

	//加载的动画文件
	let loadanimate = [
		["LoadBar_sprout.json", "sprout"],
		["LoadBar_Zombiehead.json", "zomhead"],
		["Zombie_hand.json", "zomhand"],
		["WoodSign.json", "WoodSign"],
		["SelectorScreen.json", "ss"],
		["SunFlower.json", "sunflower"],
		["Wallnut.json", "wnut"],
		["Wallnut_Twitch.json","wntwitch"],
		["Wallnut_Blink.json","wnblink"]
	];


	//////////////////////////////////////////////////////////////////

	//处理手机端退出按钮
	if(window.Capacitor){
		const App = window.Capacitor.Plugins.App;
		const Toast = window.Capacitor.Plugins.Toast;
		let lastBackTime = 0;
		App.addListener('backButton', function (info) {
			    let now = Date.now();
				if (now - lastBackTime < 2000) {
					App.exitApp();
				} else {
					lastBackTime = now;
					Toast.show({ text: '再按一次退出' });
				}
		});
	}

	//加载的图片文件（使用core.importImage生成image.ison）
	const loadimage = await (await fetch('./assets/image/image.json')).json();

	//加载的中文字体（有版权争议，须声明以免责）
	const cnfont = await (await fetch('./assets/font/zh-cn/font.json')).json();
	if (cnfont.statement !== "用户自行下载、使用或分发本字体包的行为，均视为完全" +
		"理解并自愿承担由此产生的一切法律责任与潜在风险。项目方及作者不对用户因使用本字体包引发的任何" +
		"版权纠纷、侵权指控、经济损失或法律后果承担连带责任。用户有义务自行核实字体许可协议，并确保使" +
		"用方式符合相关法律法规及授权条款。本声明自用户获取字体包之日起生效，且不因项目后续更新而失效。") throw "未进行统一声明";

	window.core = {};
	//可以用"_"代替"core"
	window._ = core;
	core.loadlist = { loadjs, setting, loadEnFont, loadimage, cnfont };
	core.img = {};
	//可以直接使用img
	window.img = core.img;

	//加载动画JSON文件的函数
	core.aniJSON = async function (name) {
		const response = await fetch('./assets/animation/' + name );
		return await response.json();
	}
		/**
	 * 将animate中的默认格式转为正常名称
	 * @param {string} inp 输入字符串
	 * @returns {string} 输出正常名称
	 * @example core.REMstring("IMAGE_REANIM_POTATOMINE_ROCK3") //输出"PotatoMine_rock3"
	 */
	core.REMstring = function (inp) {
		let str = inp.replace("IMAGE_REANIM_", "");
		//从导入的图片列表中查找，若有，则输出
		for (let name of core.loadlist.loadimage.items) {
			if (name.toUpperCase() === str) return name;
		}
		//若无，则全部小写（运行到这里可以视为异常）
		console.log("REMstring发生错误");
		return str.toLowerCase();
	}
	core.aniCollect = function (data) {
		const list={};
		for (const t of data.tracks) {
		  for (const trans of t.transforms) {
			if (trans.i !== undefined && trans.i !== null) {
				let name=core.REMstring(trans.i);
				list[name]="./assets/image/"+name+".png";
			}
		  }
		}
		return list;
	};
	core.dbPromise = null;
	core.openDB=function(){
		if (core.dbPromise)return core.dbPromise;
		core.dbPromise=new Promise((resolve, reject)=>{
		  	const req = indexedDB.open('pvz-cache', 1);
		  	req.onupgradeneeded = () => {
				const db = req.result;
				if (!db.objectStoreNames.contains('sheets')) {
				  db.createObjectStore('sheets');
				}
		  	};
		  	req.onsuccess = () => resolve(req.result);
		  	req.onerror = () => reject(req.error);
		});
		return core.dbPromise;
	};
	core.cachePut=async function(store,key,value){
		const db = await core.openDB();
		return new Promise((resolve, reject) => {
		  	const tx = db.transaction(store, 'readwrite');
		  	tx.objectStore(store).put(value, key);
		  	tx.oncomplete = resolve;
		  	tx.onerror = () => reject(tx.error);
		});
	};
	core.cacheGet=async function(store,key){
		const db = await core.openDB();
		return new Promise((resolve) => {
			const tx = db.transaction(store, 'readonly');
			const req = tx.objectStore(store).get(key);
		  	req.onsuccess = () => resolve(req.result || null);
		  	req.onerror = () => resolve(null);
		});
	};
	core.canvasToBlob=function(canvas){
		return new Promise((resolve, reject) => {
		  	canvas.toBlob((blob) => blob?resolve(blob):reject(new Error('toBlob failed')),'image/png');
		});
	};
	core.handleSheet=async function(data,ani){
		let list=core.aniCollect(data);
		let sheetdata=null;
		let cache=await core.cacheGet("sheets",ani[0]);
		if(cache){
			try{
				sheetdata={
					image:await createImageBitmap(cache.image),
					data:cache.data,
				};
			} catch (err) {
				console.warn(`[cache] sheet "${ani[0]}" 损坏，重新生成`, err);
				cache=null;
			}
		}
		if(!cache){
			sheetdata = await speet.generate(list, {
				padding: 2,        // 零件之间留2px间隙，防止采样时边缘渗色
				forcePOT: true,    // 强制大图尺寸为2的幂，优化GPU内存
			});
			await core.cachePut("sheets",ani[0],{
				image:await core.canvasToBlob(sheetdata.image),
				data:sheetdata.data
			});
		}
		const sheet = new PIXI.Spritesheet(PIXI.Texture.from(sheetdata.image),sheetdata.data);
		await sheet.parse();
		core.ani[ani[1]] = [data,sheet];
		for (const key of Object.keys(list)) {
			const texture=sheet.textures[key];
			//预加载一些图片文件
			if (!core.img[key]) {core.img[key]=texture;}
		}
	};
	//加载界面的文字
	let loadtext = t => {
		document.documentElement.style.setProperty("--load", "'" + t + "'");
	};
	//加载js文件
	let ljs = (js, resolve) => {
		let script = document.createElement('script');
		let src = "./src/" + js;
		if (js.startsWith("lib:")) {
			src = js.replace(/^lib:/, "");
		}
		script.src = src;
		script.onload = resolve;
		document.head.appendChild(script);
	}
	//加载字体
	let lf = (name, ff, resolve) => {
		ff.load().then(font => {
			document.fonts.add(font);
			if (name === setting.LoadingFont) {
				//遇到“加载字体"就将图片撤去
				document.documentElement.style.setProperty("--ldimg", "none");
				loadtext("正在加载字体");
			} resolve();
		});
	}

	//加载英文字体
	let lef = (fo, r) => {
		const Font = new FontFace(fo[1], `url(./assets/font/en-us/${fo[0]})`);
		lf(fo[1], Font, r);
	}
	//加载中文字体
	let lcf = (fp, resolve) => {
		if (fp.url === "default") { resolve(); return; }
		const Font = new FontFace(fp.name, `url(./assets/font/zh-cn/${fp.url})`);
		lf(fp.name, Font, resolve);
	}
	
	//加载动画文件
	let la = (ani, resolve) => {
		core.aniJSON(ani[0]).then(async data => {
			await core.handleSheet(data,ani);
			resolve();
		});
	}

	//任务列表
	let tasks = { f: [], im: [], si: []};


	//在“加载字体”加载前用图片显示“正在加载字体”
	//无“加载字体”或遇到“加载字体"就将图片撤去
	if (setting.LoadingFont === "default") {
		document.documentElement.style.setProperty("--ldimg", "none");
		loadtext("正在加载字体");
	} else {
		document.documentElement.style.setProperty("--useFont", setting.LoadingFont);
		document.documentElement.style.setProperty("--ldimg", "block");
	}


	for (let i = 0; i < loadEnFont.length; i++) {
		let f = loadEnFont[i];
		tasks.f.push(new Promise(resolve => { lef(f, resolve); }));
	}
	for (let i = 0; i < cnfont.items.length; i++) {
		let f = cnfont.items[i];
		tasks.f.push(new Promise(resolve => { lcf(f, resolve); }));
	}
	//同时加载字体文件
	await Promise.all(tasks.f);

	for (let i = 0; i < loadjs.length; i++) {
		let j = loadjs[i];
		//先后加载js文件（有顺序）
		await new Promise(r => {
			loadtext("正在加载脚本("+(i+1)+"/"+loadjs.length+")");
			ljs(j, r);
		});
	}

	let aniCount=0;
	core.ani = {};
	for (let i = 0; i < loadanimate.length; i++) {
		let ani = loadanimate[i];
		//加载动画文件（不并发）
		await new Promise(resolve => { la(ani, resolve); }).then(()=>{
			aniCount++;
			loadtext("正在加载动画文件("+aniCount+"/"+loadanimate.length+")");
		})
	}

	let imgCount=0;
	const imagelength=loadimage.items.length-Object.keys(core.img).length;
	for (let im of loadimage.items) {
		if (!core.img[im]) {
			tasks.im.push(PIXI.Assets.load("./assets/image/" + im + ".png").then(timg => {
				core.img[im] = timg;
				imgCount++;
				loadtext("正在加载图片("+imgCount+"/"+imagelength+")");
			}));
		}
	}
	//同时加载图片文件
	await Promise.all(tasks.im);

	//执行初始化函数
	core.init();

})();


