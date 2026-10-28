# Consultorio POS · by akesitooo

Prototipo de escritorio para cobrar consultas y estudios, registrar pacientes y consultar movimientos diarios. Electron, TypeScript y SQLite local.

## Estado actual

La caja utiliza una identidad editorial cobalto: fondo papel, logo original, ficha de paciente, catálogo con búsqueda y resumen del ticket. El panel de retiros incluye recorrido por teclado y las transiciones respetan la preferencia de reducir movimiento.

Actualmente funciona con una base local. Las sucursales conectadas, la sincronización sin internet, los usuarios autenticados y el panel de administración forman parte del trabajo pendiente; no están implementados en esta versión. Consulta [el alcance y la validación](docs/estado-del-proyecto.md).

## Desarrollo

Requisitos: Node.js con npm, un entorno de escritorio compatible con Electron y las herramientas de compilación que SQLite pueda requerir en el sistema operativo elegido. Las pruebas usan `node:test`; utilizar Node.js 20 o posterior para ejecutarlas.

```sh
git clone https://github.com/akesitooo/sistema-consultorio.git
cd sistema-consultorio
npm ci
npm start
```

`npm start` compila TypeScript y abre Electron. Ejecutar desde la carpeta del proyecto: actualmente `consultorio.db` se resuelve respecto al directorio de trabajo. La base de datos está excluida de Git.

```sh
npm run build
npm test
```

`npm test` compila y ejecuta las pruebas de búsqueda, selección y accesibilidad del panel con un adaptador DOM en memoria. No modifica SQLite. No sustituye las pruebas de impresión ni la inspección visual de Electron.

## Organización

```text
src/
  main.ts                    Arranque de Electron
  base_de_datos/conexion.ts  Conexión y esquema local existentes
  modelos/
    catalogo.ts              Catálogo compartido por caja y reportes
    tipos.ts                 Tipos del dominio existentes
  vistas/
    index.html               Estructura y formularios
    interfaz.ts              Integración con la lógica existente
    presentacion.ts          Búsqueda, catálogo, mensajes y foco del panel
    estilos.css              Entrada de estilos
    estilos/
      base.css               Tokens, tipografía y controles
      componentes.css        Tablas, botones, panel y movimiento
      pantallas.css          Caja, corte y adaptación por ancho
      impresion.css          Ticket térmico y reporte
 tests/
  catalogo.test.cjs
```

Los archivos `.js` junto al TypeScript son la salida de compilación y se mantienen versionados según la estructura existente. Editar `.ts` y ejecutar `npm run build`.

## Impresión

La venta abre el diálogo de impresión después de guardarse. Hay estilos de ticket con ancho imprimible de 75 mm para rollo de 80 mm y reporte de corte para hoja. La impresora, márgenes, paginación y cancelación de impresión necesitan verificarse en el equipo destino. Esta versión no implementa reimpresión desde el historial.
