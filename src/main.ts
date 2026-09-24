// src/main.ts

    import { app, BrowserWindow } from 'electron';
    import * as path from 'path';

    function crearVentanaPrincipal(): void {
      // Configuramos la ventana de la aplicación
      const ventana = new BrowserWindow({
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
    app.whenReady().then(() => {
      crearVentanaPrincipal();

      // En macOS, si cierras la ventana pero la app sigue abierta, la vuelve a crear al darle clic
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          crearVentanaPrincipal();
        }
      });
    });

    // Cierra la aplicación por completo cuando cierras todas las ventanas (comportamiento en Windows)
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });