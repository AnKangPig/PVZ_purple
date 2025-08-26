(() => {

	const { Sprite, Container } = PIXI;

	//const DEG=Math.PI/180;

	core.gdom = document.getElementById("gameGroup");
	//在window设一个Cursor，使用相当于core.gdom.style.cursor
	Object.defineProperty(window, 'Cursor', {
		get: function () {
			return core.gdom.style.cursor;
		},
		set: function (value) {
			core.gdom.style.cursor = value;
		},
		enumerable: true,
		configurable: true
	});
	//core.cursor为常量
	core.cursor = "url(./assets/image/cursor.ico),auto";
	core.som = {};
	(() => {
		//选中bgm的audio标签，作为core.bgm.audio
		const bgm = document.getElementById("bgm");
		core.bgm = {
			audio: bgm,
			/**
			 * 播放bgm
			 * @param {string} [name] bgm名称
			 * @example core.bgm.play() //恢复播放当前bgm
			 * core.bgm.play("CrazyDave") //播放CrazyDave.ogg作为bgm
			 */
			play: function (name) {
				//没有名字则重新播放当前bgm
				if (!name) { bgm.play(); return; }
				//加后缀
				if (!name.includes(".")) name += ".ogg";
				//原来有bgm存在则停止
				if (bgm.src && bgm.src !== "") core.bgm.stop();
				if (bgm.src !== "./assets/music/" + name) bgm.src = "./assets/music/" + name;

				bgm.play();
			}, pause: () => { bgm.pause(); },
			stop: function () {
				bgm.pause();
				//清除src和时间
				bgm.currentTime = 0;
				bgm.src = "";
			}
		};
	})();
	core.soundlist = {
		sounds: [],
		cache: {},
		volume: 1,//音量（于init初始化）
		factor: 0.6//原版游戏默认音量为0.6倍
	};
	/**
	 * 加载音效并缓存
	 * @param {string} src 音频的url链接
	 */
	core._loadsound = function (src) {
		if (core.soundlist.cache[src]) return;
		let osd = new Audio(); osd.src = src;
		osd.preload = "auto"; osd.load();
		//存入缓存
		core.soundlist.cache[src] = osd;
	}
	/**
	 * 加载音效并缓存（加前后缀）
	 * @param {string} name 音频的名称
	 */
	core.loadsound = function (name) {
		if (!name.includes(".")) name += ".ogg";
		const src = "./assets/music/" + name;
		core._loadsound(src);
	}
	/**
	 * 播放音效
	 * @param {string} [name] 音频的名称
	 */
	core._real_sound = function (name) {
		if (!name.includes(".")) name += ".ogg";
		const src = "./assets/music/" + name;
		core._loadsound(src);
		let osound = core.soundlist.cache[src];
		//从缓存中复制audio节点
		let sound = osound.cloneNode(true);
		//加入列表
		core.soundlist.sounds.push(sound);
		//播放结束后从sounds列表除去自身
		sound.addEventListener("ended", function () {
			const index = core.soundlist.sounds.findIndex(s => s === sound);
			if (index !== -1) core.soundlist.sounds.splice(index, 1);
		}, { once: true });
		//能播放时播放
		sound.addEventListener("canplaythrough", function () {
			sound.volume = core.soundlist.volume * core.soundlist.factor;
			sound.play();
		}, { once: true });

	}
	/**
	 * 播放音效，可限定时间，可绑定到timeline上
	 * @param {string} name 音效名称
	 * @param {number} [time=0] 等待时间
	 * @param {Timeline} [timeline] 时间轴
	 */
	core.sound = function (name, time = 0, timeline) {
		if (!timeline) {
			//无timeline用setTimeout，time为0则直接执行
			if (time === 0) core._real_sound(name);
			window.setTimeout(() => { core._real_sound(name); }, time);
		} else timeline.add(() => { core._real_sound(name) }, time);
		//有timeline则绑timeline上
	}

	core.Ani = class {
		/**
		 * @param {PIXI.Container} cr 容器
		 * @param {object[]} elements 元素列表
		 * @param {Timeline} timeline 时间轴
		 */
		constructor(cr, elements, timeline) {
			this.cr = cr;
			this.elements = elements;
			this.timeline = timeline;
			core.timelines.push(timeline);
			this.rate = 1;//速率
			this.repeat = 0;//重复次数，无限用-1
			this._st = 0;//开始时间（负即为延后开始）
		}
		_get(name) {
			for (let e of this.elements) {
				if (name === e.name) return e;
			}
		}
		get(name) {
			return this._get(name).sp;
		}
		/**
		 * 将对应Sprite设置为第一帧初始状态
		 * @param  {...string} names 对象（Sprite）名称
		 * @example ani.frf(); //将动画中所有Sprite都设置到第一帧
		 * ani.frf("abc"); ///将动画中name为"abc"的对象（Sprite）设置到第一帧
		 */
		frf(...names) {
			if (names.length === 0) {
				for (let e of this.elements) {
					//e.frf需要浅复制，因为gsap函数会改动参数
					gsap.set(e.sp, { ...e.frf });
				}
			} else {
				for (let n of names) {
					const e = this._get(n);
					gsap.set(e.sp, { ...e.frf });
				}
			}
		}
		play() {
			this.timeline.seek(this._st);
			this.timeline.play();
		}
		set rate(value) {
			this.timeline.timeScale(value);
		}
		set repeat(value) {
			this.timeline.repeat(value);
		}
		//delay（等待时间），负着调_st
		get delay() {
			return -this._st;
		}
		set delay(value) {
			this._st = -value;
		}
		//start（开始时间），正着调_st
		get start() {
			return this._st;
		}
		set start(value) {
			this._st = value;
		}

	}
	core.animate = function (data, parent) {
		/**
		 * data一般结构如下：
		 * 	data={
		 * 		fps:…,
		 * 		tracks:[
		 * 			{
		 * 				name:"…",
		 * 				transforms:[
		 * 					……,
		 * 					……
		 * 				]
		 * 			},...
		 * 		]
		 * }
		 */
		const fps = data.fps;
		const cr = new Container();
		if (parent) parent.addChild(cr);
		const elements = [];
		//每一帧时间为1/fps，保证总时间为总帧数/fps。速率则后期通过timeScale调节
		const atl = gsap.timeline({ paused: true, defaults: { duration: 1 / fps } });
		for (let t of data.tracks) {
			let { frf, Aimg } = core.getfrf(t.transforms);
			let sp = new Sprite(Aimg), name = t.name;
			//一开始应为隐形状态，待第一帧(默认)alpha会设为1
			sp.alpha = 0;
			cr.addChild(sp);
			//根据transform在atl的时间轴上为sp设置动作
			core.anitrans(t.transforms, atl, sp);
			elements.push({ name, frf, sp })
		}
		return new core.Ani(cr, elements, atl);
	};
	core.anitrans = function (tlist, atl, sp) {
		let last = null;
		for (let i in tlist) {//i为字符串索引
			let action;
			[action, last] = core.handleframe(tlist[i], last);
			//如果alpha存在，则不缓动
			if (action.alpha!==undefined) action.ease = "steps(1,start)";
			atl.to(sp, action, ((i === "0") ? 0 : ">"));
		}
	};
	core.getfrf = function (transforms) {
		for (let trans of transforms) {
			if (trans.i) {
				return {
					frf: core.handleframe(trans, null)[0],
					Aimg: img[core.REMstring(trans.i)]
				};
			}
		}
	};
	core.handleframe = function (trans, last) {
		const options = core.parseframe(trans, last);
		return [core.actionframe(last, options), options];
	}
	core.parseframe = function (trans, last) {
		let options;
		//七种输入对应七种输出
		//输入：x,y,sx,sy,kx,ky,f
		//输出：x,y,scaleX,scaleY,skewY,skewX,alpha
		//注意：skewY对应kx，skewX对应-ky
		if (last === null) options = { x: 0, y: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, alpha: 1 };
		else options = { ...last };
		//是否不为undefined的简写形式
		const _n = v => (v !== undefined);
		//这几行或许能简略，但大概可读性不会高于当前状态
		if (_n(trans.x)) options.x = trans.x;
		if (_n(trans.y)) options.y = trans.y;
		if (_n(trans.sx)) options.scaleX = trans.sx;
		if (_n(trans.sy)) options.scaleY = trans.sy;
		if (_n(trans.kx)) options.skewY = trans.kx;
		if (_n(trans.ky)) options.skewX = -trans.ky;
		if (_n(trans.f)) {
			switch (trans.f) {
				case -1: options.alpha = 0; break;
				case 0: options.alpha = 1; break;
			}
		}
		return options;
	};
	core.actionframe = function (old, now) {
		if (old === null) old = {};
		let cnow = {};
		//作为PIXI元素特有的属性，需要设置类似sp.pixi.scaleX
		const pixilist = ["scaleX", "scaleY", "skewX", "skewY"];
		for (let n in now) {
			if (now[n] !== old[n]) {
				if (pixilist.includes(n)) {
					if (!cnow.pixi) cnow.pixi = {};
					cnow.pixi[n] = now[n];
				} else cnow[n] = now[n];
			}
		}
		return cnow;
	}

	core.timelines = [];
	core.killTimelines = function () {
		while (core.timelines.length !== 0) {
			core.timelines.shift().kill();
		}
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
		return str.toLowerCase();
	}
	core.packset = function (inp) {
		if (Array.isArray(inp)) {
			return inp;
		} else return [inp, inp];
	}
	/**
	 * 工具函数，方便一次性大量设置属性
	 * @param {*} element PIXI元素
	 * @param {*} object 属性列表
	 * @returns 该元素（即为element）
	 */
	core.set = function (element, object) {
		const special = ["pos", "position", "scale", "skew", "anchor", "pivot", "size", "parent"];
		let anchor=null;
		for (let name in object) {
			if (special.includes(name)) {
				switch (name) {
					case "pos": case "position":
						element.position.set(...core.packset(object[name]));
						break;
					case "size":
						[element.width, element.height] = core.packset(object[name]);
						break;
					case "parent":
						if (!object[name]) break;
						object[name].addChild(element);
						break;
					case "anchor":
						anchor=core.packset(object[name]);
						break;
					default:
						element[name].set(...core.packset(object[name]));
				}
			} else {
				element[name] = object[name];
			}
		}
		if(anchor)core.anchor(element,anchor);
		return element;
	}
	core.anchor=(ele,ac)=>{
		ele.pivot.set(Math.round(ac[0]*ele.width),Math.round(ac[1]*ele.height));
	};
	//保留num的小数点后pow位
	core.fixed = function (num, pow = 3) {
		return Math.round(num * (10 ** pow)) / (10 ** pow);
	};
	/**
	 * 创建一个只能执行一次的函数，类似事件的{once:true}
	 * @param {Function} fun 输入函数
	 * @returns {Function} 输出函数（只能执行一次）
	 * @example let oncefun=core.once((a)=>{ ... }); //定义一次性函数
	 * oncefun(1) //执行函数
	 * oncefun(2) //第二遍无效
	 */
	core.once = function (fun) {
		let sure = false;
		return function () {
			if (sure) return; sure = true;
			fun(...arguments);
		};
	}
	//使输出的数限定在min和max中间，过低取min，过高取max
	core.between = function (min, max, num) {
		return Math.max(min, Math.min(num, max));
	}
	core.setDrag = function (ele, layer) {
		let isDragging = false;
		let lastX, lastY;

		const exy = e => [e.data.global.x, e.data.global.y];
		const bounds = ele.getBounds();
		const [hw, hh] = [bounds.width / 2 - 8, bounds.height / 2 - 10];//修正值-8,-10

		let con = ele;
		if (layer) con = layer;
		// 鼠标按下事件（开始拖动）
		ele.on('pointerdown', (event) => {
			Cursor = "url(./assets/image/move.ico),pointer";
			isDragging = true;
			[lastX, lastY] = exy(event);
			const cancel = () => {
				isDragging = false;
				Cursor = core.cursor;
				con.off('pointerup', cancel);
				con.off('pointerupoutside', cancel);
				core.app.view.removeEventListener('blur', cancel);
				con.off('pointermove', move);
			};
			// 鼠标移动事件（拖动中）
			const move = (event) => {
				if (!isDragging) return;
				// 计算新位置
				const [ex, ey] = exy(event);
				const newX = ele.x + (ex - lastX);
				const newY = ele.y + (ey - lastY);
				[lastX, lastY] = [ex, ey];

				// 获取容器尺寸
				// 边界限制
				ele.x = core.between(hw, 800 - hw, newX);
				ele.y = core.between(hh, 600 - hh, newY);
			};
			con.on('pointerup', cancel, { once: true });
			con.on('pointerupoutside', cancel, { once: true });
			core.app.view.addEventListener('blur', cancel, { once: true });
			con.on('pointermove', move);
		});
	};

	core.importImage = function () {//开发者使用，自动导入img文件夹内的png图片并存入img.json
		let filelist;
		fs.readdir("./assets/image", (err, data) => {
			if (err) {
				throw "导入错误";
			} else {
				filelist = data;
				const imglist = filelist.filter(n => n.endsWith(".png")).map(n => n.slice(0, -4));
				fs.writeFile("./assets/image/image.json", JSON.stringify({items:imglist}, null, "	"), "utf-8", () => { console.log("导入成功"); });
			}
		});
	}

	core.afont = function (text, family, size, fill, shadowdistance) {
		return {
			text: text,
			style: {
				fontFamily: family,
				fontSize: size,
				fill: fill,
				dropShadow: {
					distance: shadowdistance
				}
			}
		};
	};

	core.BEdown = false;//是否有pointer响应事件（同时间只顾一个）
	core.pointer = function (ele, events) {
		let down = false;
		let Eve = {
			upover: events.up.over || null,//未按下状态经过
			upout: events.up.out || null,//未按下状态离开
			down: events.down.down || null,//按下
			downover: events.down.over || null,//按下状态经过
			downout: events.down.out || null,//按下状态离开
			downup: events.down.up || null,//按下然后在按钮上放开
			upup: events.up.up || null//按下然后没在按钮上放开（其实是pixi的pointerupoutside）
		}
		if (Eve.upover || Eve.downover) {
			ele.on("pointerover", e => {
				e.stopPropagation();
				if (down) {
					if (Eve.downover) Eve.downover();
				} else {
					if (core.BEdown) return;
					if (Eve.upover) Eve.upover();
				}
			});
		}
		if (Eve.upout || Eve.downout) {
			ele.on("pointerout", e => {
				e.stopPropagation();
				if (down) {
					if (Eve.downout) Eve.downout();
				} else {
					if (core.BEdown) return;
					if (Eve.upout) Eve.upout();
				}
			});
		}
		if (Eve.down) {
			ele.on("pointerdown", e => {
				e.stopPropagation();
				down = true;
				core.BEdown = true;
				Eve.down();
			});
		}
		if (Eve.down || Eve.downup) {
			ele.on("pointerup", e => {
				e.stopPropagation();
				if (down) {
					down = false;
					core.BEdown = false;
					if (Eve.downup) Eve.downup();
				}
			});
		}
		if (Eve.down || Eve.upup) {
			ele.on("pointerupoutside", e => {
				e.stopPropagation();
				if (down) {
					down = false;
					core.BEdown = false;
					if (Eve.upup) Eve.upup();
				}
			});
		}
	};
	core.debounce = function (func, wait = 0, immediate = false) {
		let timeoutId;

		return function (...args) {
			// 保存上下文和参数，确保 this 和参数正确传递
			const context = this;

			// 定义立即执行的条件
			const callNow = immediate && !timeoutId;

			clearTimeout(timeoutId);

			// 设置新的定时器
			timeoutId = setTimeout(() => {
				timeoutId = null; // 清除引用
				if (!immediate) {
					func.apply(context, args); // 非立即执行时调用原函数
				}
			}, wait);

			// 立即执行的情况
			if (callNow) {
				func.apply(context, args);
			}
		};
	};
	core.isFullscreen = () => !!document.fullscreenElement;
	core.slidePoint = function (start, end, point) {
		let [sx, sy] = start, [ex, ey] = end, [px, py] = point;
		const dx = ex - sx, dy = ey - sy;//线段向量
		const lenSq = dx * dx + dy * dy;//线段长度平方
		if (lenSq < 1e-10) return [0, [sx, sy]];//起点终点重合
		const dpx = px - sx, dpy = py - sy;//点到起点的向量
		const dot = dx * dpx + dy * dpy;//数量积
		const ratio = core.between(0, 1, dot / lenSq);
		const newpoint = [sx + ratio * dx, sy + ratio * dy];
		return [ratio, newpoint];
	};
	core.setSlide = function (ele, layer, points, actions = {}) {
		let isSliding = false;
		let { start, end } = points;

		const exy = e => {
			let { x, y } = e.getLocalPosition(ele.parent);
			return [x, y];
		};

		let con = ele;
		if (layer) con = layer;

		ele.on("pointerover", () => { Cursor = "url(./assets/image/move.ico),pointer"; });
		ele.on("pointerout", () => { if (!isSliding) Cursor = core.cursor; });
		// 鼠标按下事件（开始拖动）
		ele.on('pointerdown', (event) => {
			event.stopPropagation();
			Cursor = "url(./assets/image/move.ico),pointer";
			isSliding = true;
			const finish = () => {
				isSliding = false;
				Cursor = core.cursor;
				if (actions.finish) {
					const ratio = core.slidePoint(start, end, exy(event))[0];
					actions.finish(ratio);
				}
				con.off('pointerup', finish);
				con.off('pointerupoutside', finish);
				core.app.view.removeEventListener('blur', finish);
				con.off('pointermove', move);
			};
			// 鼠标移动事件（拖动中）
			const move = (event) => {
				if (!isSliding) return;
				const [ratio, npoint] = core.slidePoint(start, end, exy(event));
				const [newX, newY] = npoint;
				ele.x = newX, ele.y = newY;
				if (actions.move) { actions.move(ratio); }
			};
			con.on('pointerup', finish, { once: true });
			con.on('pointerupoutside', finish, { once: true });
			core.app.view.addEventListener('blur', finish, { once: true });
			con.on('pointermove', move);
		});
	};
	core.fillRect = function (color, x, y, w, h) {
		let rect = new PIXI.Graphics();
		rect.beginFill(color);
		rect.drawRect(x, y, w, h);
		rect.endFill();
		return rect;
	};
	core.random = (min, max) => {
		return Math.random() * (max - min) + min;
	}
	// 播放变调加速音频函数（比较特殊的音频播放，仅用于需要变调时）
	core.pitchedsound = function (name, rate = 1.5) {
		if (!name.includes(".")) name += ".ogg";
		let audioContext = new AudioContext();
		// 获取音频文件
		fetch("./assets/music/" + name)
			.then(response => response.arrayBuffer())
			.then(data => audioContext.decodeAudioData(data))
			.then(buffer => {
				// 创建音频源
				let sourceNode = audioContext.createBufferSource();
				sourceNode.buffer = buffer;
				// 设置播放速率（变调）
				sourceNode.playbackRate.value = rate;
				//设置音量
				let gainNode = audioContext.createGain();
				sourceNode.connect(gainNode);
				gainNode.gain.value = core.soundlist.volume;
				// 连接到输出
				gainNode.connect(audioContext.destination);
				// 播放
				sourceNode.start();
			});
	};

})();