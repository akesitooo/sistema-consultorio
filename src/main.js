"use strict";
// src/main.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
function crearVentanaPrincipal() {
    // Configuramos la ventana de la aplicación
    const ventana = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        title: "Sistema de Cobro y Cierre",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    // Quitamos el menú por defecto (Archivo, Editar, Ver...) para un diseño súper limpio
    ventana.setMenu(null);
    // Cargamos nuestro diseño visual
    ventana.loadFile(path.join(__dirname, 'vistas', 'index.html'));
    // Si la ventana se maximiza automáticamente, se verá mejor en el consultorio
    ventana.maximize();
}
// Cuando Electron esté listo, abrimos la ventana
electron_1.app.whenReady().then(() => {
    crearVentanaPrincipal();
    // En macOS, si cierras la ventana pero la app sigue abierta, la vuelve a crear al darle clic
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            crearVentanaPrincipal();
        }
    });
});
// Cierra la aplicación por completo cuando cierras todas las ventanas (comportamiento en Windows)
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
