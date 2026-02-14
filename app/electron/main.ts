import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import readline from "node:readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

let win: BrowserWindow | null;
let coreProcess: ChildProcess | null = null;
let coreReader: readline.Interface | null = null;

function startCore() {
  const isDev = !!process.env.VITE_DEV_SERVER_URL;

  // Path to the compiled Go binary
  // In Dev: ../../core/mcclean-core (relative to app/dist-electron)
  // In Prod: resources/mcclean-core
  const corePath = isDev ? path.resolve(__dirname, "../../core/mcclean-core") : path.join(process.resourcesPath, "mcclean-core");

  console.log("Starting Core from:", corePath);

  coreProcess = spawn(corePath, ["--server"]);

  if (!coreProcess.stdout || !coreProcess.stdin) {
    console.error("Failed to spawn core process streams");
    return;
  }

  // Handle Core Output (JSON Lines)
  coreReader = readline.createInterface({
    input: coreProcess.stdout,
  });

  coreReader.on("line", (line) => {
    try {
      if (!line.trim()) return;
      const msg = JSON.parse(line);

      if (win && !win.isDestroyed()) {
        // Broadcast everything to renderer
        win.webContents.send("core-message", msg);
      }
    } catch (e) {
      console.error("Failed to parse core message:", line, e);
    }
  });

  coreProcess.stderr?.on("data", (data) => {
    console.error("CORE STDERR:", data.toString());
  });

  coreProcess.on("exit", (code) => {
    console.log("Core exited with code:", code);
    coreProcess = null;
  });
}

function sendToCore(msg: any) {
  if (coreProcess && coreProcess.stdin) {
    const data = JSON.stringify(msg) + "\n";
    coreProcess.stdin.write(data);
  } else {
    console.error("Core not running, cannot send:", msg);
  }
}

function createWindow() {
  win = new BrowserWindow({
    title: "McClean",
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 900,
    height: 600,
    vibrancy: "under-window",
    visualEffectState: "active",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 12, y: 12 },
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  startCore();

  // Thin Client IPC
  ipcMain.on("to-core", (event, msg) => {
    sendToCore(msg);
  });

  // Legacy handlers shims (to prevent crash if UI calls them)
  // These should be eventually replaced by "to-core" calls in React
  ipcMain.handle("scan-system", () => {
    sendToCore({ id: "legacy-scan", method: "scan-system" });
    return []; // Return empty, data comes via events
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    if (coreProcess) coreProcess.kill();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  if (coreProcess) coreProcess.kill();
});

app.whenReady().then(createWindow);
