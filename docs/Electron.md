# Electron 迁移与 Windows 7 兼容记录

> 本文整理自 [PR #2](https://github.com/AnKangPig/PVZ_purple/pull/2) 和 [Issue #4](https://github.com/AnKangPig/PVZ_purple/issues/4)。前半部分介绍用 Electron 替代 `开始游戏.exe`，后半部分记录为兼容 Windows 7 / Windows 10 所做的调整。（2026-10-03 合并）

## 一、用 Electron 替代 `开始游戏.exe`

### 目的

现有的 `开始游戏.exe` 首先在本地架设服务器，然后再使用系统浏览器访问相应端口以开始游戏。这一方法有如下缺点：

1. 使用了二进制文件，不具有跨平台性；
2. 一些原生功能无法在浏览器中运行（如“退出”按钮无法关闭浏览器）。

该 PR 的主要内容是引入了 NPM 和 Electron 来替代原有的 `开始游戏.exe`。

### 开发流程变更

#### (I) 安装依赖项

此 PR 引入了 Node.js 的官方包管理器 NPM。现在，在项目根目录打开终端，输入：

```shell
npm install
```

即可安装项目所需的所有依赖。未来也可通过 NPM 来安装其他现有的 JavaScript / TypeScript 依赖。

#### (II) 开发内容

由于 Electron 实现了浏览器相关的 API，开发新内容时无需做出重大更改。

#### (III) 使用 Electron 运行

此 PR 在 `package.json` 中配置好了运行命令。只需要在项目根目录下的终端运行：

```shell
npm start
```

即可打开 Electron 窗口运行 PVZ。

<img width="2199" height="1293" alt="image" src="https://github.com/user-attachments/assets/c4126721-035f-4dcc-8273-982ffeeacb3a" />

#### (IV) 打包发布

打包 Electron 所需的工具也已经配置好。只需要在根目录下运行：

```shell
npm run make
```

即可自动打包为可执行文件。打包后会在项目根目录下创建 `out` 文件夹，其结构如下：

<img width="450" height="722" alt="image" src="https://github.com/user-attachments/assets/2497dc57-d12a-42b5-bc3d-753d0710b18a" />

由于此 PR 在 Microsoft Windows 下开发，`out` 文件夹下生成了两个目录：

##### `make\squirrel.windows\x64`

此文件夹下是适用于 Windows 的安装包，用户可以双击将本项目安装到本机。

<img width="1457" height="1117" alt="image" src="https://github.com/user-attachments/assets/eab3cbf8-7a78-49b5-bf1b-b8b2145deac2" />

##### `pvz-purple-win32-x64`

此目录下为**非安装包形式**的程序。此文件夹已包含运行所需的所有资源文件，可直接将其压缩为压缩包然后分发。

> **资源文件**
>
> Electron 会将资源文件打包至 `resources/app.asar` 文件中。由于目前未使用混淆算法，此文件实际上为压缩包，可以被解压缩程序打开。

双击打开该文件夹下的 `pvz-purple.exe` 即可启动游戏。

<img width="2218" height="1065" alt="image" src="https://github.com/user-attachments/assets/3848ec3a-78bb-4a71-b424-cd8adceb23b9" />

### 额外内容

由于使用了 Electron，目前退出按钮已经可以正常工作，不会弹出“请手动关闭”的弹窗。

---

以上改动解决了跨平台与浏览器原生功能的问题，但默认 Electron 版本主要面向较新的 Windows。若还要覆盖 Windows 7，就需要进一步锁定 Electron、Forge 与相关依赖的版本，并处理旧版 Node/npm 带来的安装与构建问题。下面记录这部分兼容性工作。

## 二、Windows 7 / Windows 10 双环境兼容

此次更新后，构建可以同时在 **Windows 7** 和 **Windows 10** 环境下运行。

### 主要调整

| 组件 | 版本 |
|---|---|
| `electron` | `22.3.27` |
| `@electron-forge` | `6.0.0-beta.34` |
| `node-abi` | `3.96.0` |

### `overrides.js` 中的两个 patch

1. **node-abi 嵌套依赖替换**
   用 `node_modules/node-abi` 替换掉 `node_modules/electron-rebuild/node_modules/node-abi`。
   *（仅在 `package.json` 中 `overrides` 字段无效时运行，即 npm 6 环境）*

2. **Forge git 检查绕过**
   将 `node_modules/@electron-forge/cli/dist/util/check-system.js` 中的 `"git --version"` 改为 `"node --version"`，从而解决旧版 Forge 对 git 的强依赖。

---

### 心路历程

#### 缘起

我向 AI 提出建议：能不能支持到 XP。

AI 建议我不要建议。所以我还是支持 Win7 吧。

#### 第一步：回退版本

Electron 锁定 `22.3.27`。

安装过程卡在 `electron-v22.3.27-win32-x64.zip` 下载不完。照着 AI 建议，提前下载，解压到 `node_modules/electron/dist/`，然后创建 `node_modules/electron/path.txt`，内容是 `electron.exe`。这一步算是过去了。

#### 第一难：Node 13 太老

Win7 正常情况能使用的 Node：`v13.14.0`，npm：`6.14.4`。

Node 13 太老，导致库里用新语法就开始崩。保留 Forge 7 已然不行，哪怕 6.4.2 也是不行。继续降，AI 推荐 6.2.1，但 6.2.1 仍然不支持 Node 13。继续降。

于是 AI 给了我一个极老的版本号：`6.0.0-beta.34`。

但是，没有 `plugin-fuses`，全部移除。然后 `plugin-auto-unpack-natives` 崩了。或许是 `forge.config.js` 里对象写法不行了，换成 `new AutoUnpackNativesPlugin({})` 试试。也不行。看来 6.0.0 版本太老，根本没有修的办法，直接删掉这个插件。
>`plugin-auto-unpack-natives`已加回，使用`['@electron-forge/plugin-auto-unpack-natives', {}]`即可。（2026/10/3）

#### 第二难：node-abi 不认识 Electron 22

Forge 引用的 `node-abi` 太老，不认识 Electron 22.3.27。试了很多种方法，都无效。

直到我使用根目录的 `node-abi` 替换掉 `electron-rebuild/node_modules/node-abi`，成功了。

但是也不能每次安装都手动替换啊。本来新版 npm 有 `overrides`，但是旧版 npm 没有。如果使用 `npm-force-resolutions`，Win10 开发者将受到无情伤害，所以，我不用。

于是，第一个覆盖性 patch 开始了。一开始试图把它放在 `forge.config.js`，但发现这样会导致第一次 `npm start` 失败，然后第二次成功——这不对。还是要独立文件，然后用 `postinstall` 执行一遍替换工作。这个文件名我叫 `overrides.js`。如果旧版 npm 就工作，新版就不工作。

然后是一点小问题：`npm run make` 太慢。简单，`.npmrc` 来一个镜像库 `electron_mirror`。虽然 Win10 的新版 npm 会稍作抗议，但我们不必管他。

#### 第三难：Forge 硬查 git

Win7 工作结束，回到 Win10。

出问题了。是 Forge 新旧版的差异：旧版强依赖 git，新版不是。我不想强依赖 git。

幸好，Electron 没有真使用 git（至少 `npm start` 和 `npm run make` 都没有），只是检测 git。

但是跳过检测的方式非常少，只能在用户主目录下创建一个名为 `.skip-forge-system-check` 的空文件。但是这属于污染用户文件。

如果用 `patch-package`，那 Win10 开发者又为兼容性付出代价了。

于是，第二个覆盖性 patch 开始了。只需要破坏对 git 的检测就好了，不需要导什么包。逻辑，还是写在 `overrides.js` 那里，自动把检测脚本的 `"git --version"` 改成 `"node --version"`，这样定能执行。

这样，Win7 和 Win10 的最大公因数就完成了。