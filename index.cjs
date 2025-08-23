const { app, BrowserWindow, Menu } = require("electron");

const createWindow = () => {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 1200,
    height: 600,
    useContentSize: true,
  });

  // win.on("will-resize", (event, newBounds, _) => {
  //   event.preventDefault();
  //   const widthFactor = newBounds.width / 800;
  //   const heightFactor = newBounds.height / 600;
  //   const factor = Math.min(widthFactor, heightFactor);
  //   win.setContentSize(Math.ceil(800 * factor), Math.ceil(600 * factor));
  // });
  win.loadFile("index.html");
  win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
