# Android程序的构建

## 安装依赖项

现在，在项目根目录打开终端，输入：

```shell
npm install
```

即可安装项目所需的所有依赖。

## 初始化

在项目根目录下的终端运行：

```shell
npm run android:setup
```

即可初始化android项目，生成android文件夹。
> 如果 `android` 目录已存在，先手动删除，再运行 `npm run android:setup`。

## 同步并构建

在项目根目录下的终端运行：

```shell
npm run android:sync
```

即可构建 Web 资源，同步到 Android 项目。

## 导出APK

现在，android文件夹内是一个完整的Android工程，熟悉Android工程的可自行构建。\
当然，也可以使用gradle构建。

### Windows

在有Android SDK的前提下，在项目根目录下的终端运行：

```shell
npm run android:build
```

即可导出apk，在`android/app/build/outputs/apk/community/release`目录下。
>（`community` 是默认构建变体名）

### Linux / macOS

在有Android SDK的前提下，直接在android目录下的终端运行：

```shell
sh gradlew assembleCommunityRelease
```

但本人未在 Linux 实测，如有问题请 issue。

## 从零配置Android SDK

以下是本人从零配置Android SDK的心得。本人的主力开发机是win7，所以资源也是可适用于win7的资源。\
[本人的蓝奏云链接，密码0000](https://wwaos.lanzoum.com/b0sz088ch)\
[sdk来源(菜鸟教程)](https://www.runoob.com/w3cnote/android-tutorial-eclipse-adt-sdk-app.html)\
[sdk来源(百度网盘)](https://pan.baidu.com/s/1kTokluR)\
[cmdline-tools下载链接](https://dl.google.com/android/repository/commandlinetools-win-9123335_latest.zip)
>如果链接失效，请在 issue 中反馈，或从官方渠道下载。

Android SDK 需要 JDK。本文档以 **JDK 8** 为例，与旧版 SDK 兼容性最好。\
安装配置如以下教程所示，不再赘述：\
[开发环境搭建(菜鸟教程)](https://www.runoob.com/w3cnote/android-tutorial-development-environment-build.html)

### 配置环境变量：确保 `JAVA_HOME` 和 `ANDROID_HOME` 已正确设置。
*   `JAVA_HOME`：指向 JDK 安装目录（如 `C:\Program Files\Java\jdk1.8.0_xxx`）。
*   `ANDROID_HOME`：指向解压后的 SDK 目录（如 `D:\Android\android-sdk-windows`）。
*   将 `%JAVA_HOME%\bin` 和 `%ANDROID_HOME%\platform-tools` 添加到系统的 `PATH` 变量中。

### 安装 Command line tools only 包
下载该包，解压后，将文件夹重命名为 8.0，放到`android-sdk-windows/cmdline-tools`下。
>（如果 `cmdline-tools` 目录不存在，手动创建。）

### 接受SDK许可协议
来到`android-sdk-windows\cmdline-tools\8.0\bin`下，打开终端，输入：

```shell
sdkmanager.bat --licenses
```

之后一路"y"下去即可。之后`npm run android:build`即可导出 APK。

### 补充
Gradle 需要知道 SDK 路径。如果 `ANDROID_HOME` 没生效，需要在 `android/local.properties` 里写 SDK 路径：

```properties
sdk.dir=D\:\\Android\\android-sdk-windows
```

## 关于密钥
本项目密钥分为两种，公开的社区密钥`community.keystore`和私有的`official.keystore`。`official.keystore`由项目维护者私有持有，不公开。\
项目以使用前者为主，后者仅作为重视安全的用户的选择。\
社区密钥apk（后称“标准版”）和官方密钥apk（后称“offi版”）包名不同，不能互相覆盖。\
设计双密钥的目的：标准版使用公开密钥，任何开发者构建的标准版 APK （包括我的）都能互相覆盖更新，无需卸载重装，增强自由性和灵活度；official 版使用私有密钥，更新链可由维护者控制，安全性强。

## 关于包名
默认标准版包名：`com.ankangpig.pvzpurple`\
默认offi版包名：`com.ankangpig.pvzpurple.official`\
若要修改包名，请先修改`capacitor.config.json`的`appId`条目，再运行`npm run android:setup`。\
若要实现更细致包名修改，或是 `android` 文件夹被单独拿走，脱离了工程，请启用并修改`gradle.properties`中的"包名"条目。