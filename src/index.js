(async () => {
	const setting = {
		LoadingFont: "Font3",
		/*显示加载所用字体，请务必在loadfont最先加载它。
		在LoadingFont字体未加载时，会显示"./assets/image/loading.png"作为代替项。
		可使用"default"表示使用浏览器默认字体*/
	};
	//加载的js
	let loadjs = [
		"thirdparty/fs",
		"thirdparty/pixi.min",
		"thirdparty/gsap.min",
		"thirdparty/PixiPlugin.min",
		"core",
		"init",
		"scenes/startscreen",
		"scenes/selectorscreen",
		"scenes/zombienote",
		"scenes/gamescreen",
		"widgets/dialog",
		"widgets/optionsmenu",
	];
	//加载的英文字体
	let loadEnFont = [
		["Brianneshand.ttf", "Brianneshand"]//文件名，引用名
	];

	//加载的动画文件
	let loadanimate = [
		["LoadBar_sprout", "sprout"],
		["LoadBar_Zombiehead", "zomhead"],
		["Zombie_hand", "zomhand"],
		["WoodSign", "WoodSign"],
		["SelectorScreen_Leaves", "ssleaves"],
		["SelectorScreen_Flower1", "ssf1"],
		["SelectorScreen_Flower2", "ssf2"],
		["SelectorScreen_Flower3", "ssf3"],
		["SelectorScreen_Cloud1", "ssc1"],
		["SelectorScreen_Cloud2", "ssc2"],
		["SelectorScreen_Cloud4", "ssc4"],
		["SelectorScreen_Cloud5", "ssc5"],
		["SelectorScreen_Cloud6", "ssc6"],
		["SelectorScreen_Cloud7", "ssc7"],
		["SunFlower", "sunflower"],
		["SunFlower_Blink", "sfblink"]
	];


	//////////////////////////////////////////////////////////////////
	//加载的图片文件（使用core.importImage生成img.ison）
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

	//加载界面的文字
	let loadtext = t => {
		document.documentElement.style.setProperty("--load", "'" + t + "'");
	};
	//加载js文件
	let ljs = (js, r) => {
		let script = document.createElement('script');
		let src = "./src/" + js + ".js";
		if (js.startsWith("lib:")) {
			src = js.replace(/^lib:/, "");
		}
		script.src = src;
		script.onload = r;
		document.head.appendChild(script);
	}
	//加载字体
	let lf = (name, ff, r) => {
		ff.load().then(font => {
			document.fonts.add(font);
			if (name === setting.LoadingFont) {
				//遇到“加载字体"就将图片撤去
				document.documentElement.style.setProperty("--ldimg", "none");
				loadtext("正在加载字体");
			} r();
		});
	}

	//加载英文字体
	let lef = (fo, r) => {
		const Font = new FontFace(fo[1], `url(./assets/font/en-us/${fo[0]})`);
		lf(fo[1], Font, r);
	}
	//加载中文字体
	let lcf = (fp, r) => {
		if (fp.url === "default") { r(); return; }
		const Font = new FontFace(fp.name, `url(./assets/font/zh-cn/${fp.url})`);
		lf(fp.name, Font, r);
	}
	//加载动画JSON文件的函数
	core.aniJSON = async function (name) {
		const response = await fetch('./assets/animation/' + name + '.json');
		return await response.json();
	}
	//加载动画文件
	let la = (ani, r) => {
		core.aniJSON(ani[0]).then(data => {
			core.ani[ani[1]] = data; r();
		});
	}

	//任务列表
	let tasks = { f: [], im: [], si: [], ani: [] };


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
		tasks.f.push(new Promise(r => { lef(f, r); }));
	}
	for (let i = 0; i < cnfont.items.length; i++) {
		let f = cnfont.items[i];
		tasks.f.push(new Promise(r => { lcf(f, r); }));
	}
	//同时加载字体文件
	await Promise.all(tasks.f);

	core.ani = {};
	loadtext("正在加载动画文件");
	for (let i = 0; i < loadanimate.length; i++) {
		let ani = loadanimate[i];
		tasks.ani.push(new Promise(r => { la(ani, r); }));
	}
	//同时加载动画文件
	await Promise.all(tasks.ani);

	for (let i = 0; i < loadjs.length; i++) {
		let j = loadjs[i];
		//先后加载js文件（有顺序）
		await new Promise(r => {
			loadtext("正在加载脚本" + `(${i + 1}/${loadjs.length})` + ":" + j + ".js");
			ljs(j, r);
		});
	}


	loadtext("正在加载图片");
	for (let im of loadimage.items) {
		tasks.im.push(PIXI.Assets.load("./assets/image/" + im + ".png").then(timg => {
			core.img[im] = timg;
		}));

	}
	//同时加载图片文件
	await Promise.all(tasks.im);

	//执行初始化函数
	core.init();

})();


