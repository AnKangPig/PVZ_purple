本项目尚处于萌芽状态，已经实现了除了木牌（存档）和墓碑（开始游戏）以外的所有部分。

## 使用的项目

YingFengTingYu大佬的PopStudio_Old（不包含，但animation的json是该工具提供的定义）

ckcz123大佬的mota-js-server（一个本地HTTP服务器程序，即“开始游戏.exe”）

## 使用的库

PIXI.js

GSAP

fs.js（来自mota-js）

## 部署

### web（浏览器）

直接使用“开始游戏.exe”即可。

### exe（electron）

目前 Electron 构建已同时支持 **Windows 7** 和 **Windows 10**。 \
由于 Electron 官方已放弃 Windows 7，本项目锁定了特定依赖版本，并在 `overrides.js` 中加入了兼容性补丁。\
参考：[Electron及其win7兼容](./docs/Electron.md)

### apk（capacitor）

参考：[android的构建](./docs/Capacitor.md)

