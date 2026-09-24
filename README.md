# ConsultorioPOS by akesitooo 🩺💻

Sistema de Punto de Venta (POS) y gestión clínica de escritorio diseñado para optimizar el flujo de trabajo en consultorios médicos. Desarrollado para el control de cobros, administración de pacientes y generación de reportes diarios, asegurando precisión en los cortes de caja y un historial detallado por paciente.

## 🚀 Características Principales

*   **Gestión de Pacientes:** Registro automatizado e historial de pacientes. Asignación automática de usuarios y contraseñas para consulta de resultados.
*   **Punto de Venta Clínico:** Catálogo interactivo de estudios médicos. Cálculo automático de subtotales, descuentos y cambios.
*   **Validaciones de Caja:** Sistema de bloqueo de transacciones si el monto recibido es menor al total o si se intenta retirar más efectivo físico del disponible.
*   **Corte Diario Avanzado:** Generación de reportes detallados en PDF con desglose por folio, hora, métodos de pago, estudios realizados, egresos justificados y efectivo en caja.
*   **Soporte Térmico:** Configuración de estilos CSS `@media print` optimizada para imprimir tickets en formato de 80mm (ej. Tech Zone XP-80C) y reportes en tamaño A4.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript.
*   **Backend / Framework:** Electron.js, Node.js, TypeScript.
*   **Base de Datos:** SQLite3 (Local, embebida y sin dependencias externas pesadas).

## ⚙️ Instalación y Uso

1. Clona este repositorio:
   ```bash
   git clone [https://github.com/akesitooo/consultorio-pos.git](https://github.com/akesitooo/consultorio-pos.git)