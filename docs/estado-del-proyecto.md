# Estado del proyecto y siguiente etapa

## Entrega de interfaz cobalto

- Se conserva sin modificación el archivo original `src/vistas/akesitooo.png`.
- Caja organizada en ficha de paciente, catálogo y resumen. La navegación solo muestra destinos existentes: caja y corte diario.
- Catálogo único para pantalla y reportes, conservando precios e identificadores existentes.
- Búsqueda sin acentos, estado sin coincidencias, selección por botón y Enter sin enviar accidentalmente el cobro.
- Campos asociados a sus etiquetas, foco visible, nombre accesible de las acciones y mensajes de confirmación para tecnologías de asistencia.
- Retiro en panel lateral con Escape, recorrido Tab/Shift+Tab, aislamiento del fondo y devolución del foco al cerrar.
- Transiciones de 160–200 ms y preferencia de movimiento reducido. El catálogo y los movimientos no requieren conexión a recursos visuales externos.
- Corte diario con el mismo lenguaje visual. Impresión separada en su propia hoja de estilos.
- Ajustes de composición declarados para pantallas amplias y estrechas. La revisión renderizada sigue pendiente.

## Validación realizada

- Compilación TypeScript correcta.
- Ocho pruebas automáticas aprobadas mediante `npm test`: búsqueda sin acentos, códigos y ausencia de resultados, filtrado de filas, Enter, selección exacta, apertura/cierre del panel, Escape y recorrido de teclado.
- Inspección estructural del HTML: identificadores únicos, campos referidos por los dos módulos presentes, etiquetas asociadas y tipos explícitos de botón.
- `git diff --check` sin errores.
- El hash SHA-256 de la base local se mantuvo sin cambios durante el trabajo. No se crearon ventas ni pacientes para verificar la interfaz.
- El logo y los módulos de arranque y base de datos no se modificaron.

### Limitaciones de la verificación

El navegador disponible rechazó abrir archivos locales. Al intentar iniciar el proyecto con el ejecutable instalado, Electron terminó con SIGABRT. La apertura por el lanzador del sistema también falló con `kLSNoExecutableErr`; la apertura auxiliar de Electron no inició el proyecto. No se completaron capturas, interacción renderizada ni verificación visual de contraste/desbordamiento.

Las pruebas DOM son simulaciones de eventos, no pruebas completas de Electron. No se verificaron ventas reales, impresión térmica ni instaladores en Windows, macOS o Linux. No afirmar compatibilidad verificada de distribución hasta hacer esas pruebas.

## Revisar en el equipo de uso

1. Iniciar con `npm start` desde la carpeta del proyecto y comprobar caja en una ventana amplia y otra estrecha.
2. Buscar “torax”, agregar un servicio, quitarlo y comprobar total, foco y mensajes. No es necesario guardar una venta para estas comprobaciones.
3. Abrir retiro, recorrer los campos con teclado, cerrar con Escape y comprobar que se conserva la captura.
4. Consultar corte y probar impresión con datos ficticios en una copia de prueba de la base.
5. Comprobar preferencia de movimiento reducido, zoom, nombres largos y listas extensas.

## Mejoras internas identificadas, todavía pendientes

Esta entrega reorganiza la presentación y centraliza el catálogo; la lógica de datos y cobro aún debe separarse por responsabilidad. Los riesgos encontrados en la auditoría inicial no quedan resueltos por el rediseño:

- Identificación inequívoca de pacientes y limpieza controlada al cambiar de persona.
- Cobro indivisible, validación antes de escribir, prevención de solicitudes repetidas y folios únicos.
- Saldo operativo consultado desde datos, separado de reportes históricos; retiros seguros y cierre persistido.
- Aislamiento de Electron, entradas tratadas como texto y operaciones de datos mediante interfaces limitadas.
- Ruta estable de datos, respaldos y restauración verificada.
- Renglones históricos de venta que conserven nombre, precio y cantidad.

## Producto acordado como objetivo

POS para consultas y estudios, con varias sucursales de un mismo cliente y separación entre clientes. Pacientes e historial de compras compartidos dentro del cliente; caja y cierres separados por sucursal; catálogo común con precios por sucursal. Debe poder cobrar sin internet y sincronizar después.

Se busca contar con catálogo editable, historial con reimpresión, administración y respaldos. El usuario prefiere permitir descuentos y revisarlos posteriormente en el historial.

### Decisiones antes de modificar arquitectura y datos

- Confirmar identificación individual de empleados: registrar un nombre libre no autentica quién aplicó un descuento.
- Definir servicio central, alojamiento y quién lo opera; no se contrató infraestructura.
- Definir conflictos de sincronización, propiedad de datos y reglas para precios cuando una sucursal trabaja sin conexión.
- Acordar fondo inicial, turnos, cierres y devoluciones/cancelaciones.
- Acordar instalación y actualización en cada sistema operativo, y pruebas de impresoras.

Esas decisiones requieren una propuesta concreta y aprobación según el modo grill-me solicitado. Este documento describe pendientes, no funciones implementadas.
