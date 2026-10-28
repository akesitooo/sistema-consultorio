"use strict";
// src/vistas/interfaz.ts
Object.defineProperty(exports, "__esModule", { value: true });
const conexion_1 = require("../base_de_datos/conexion");
const catalogo_1 = require("../modelos/catalogo");
const presentacion_1 = require("./presentacion");
let pacientesMemoria = [];
let carritoEstudios = [];
// ==========================================
// 1. FUNCIONES BÁSICAS DE VENTANAS Y FECHA
// ==========================================
function obtenerFechaEstandar() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const hora = String(hoy.getHours()).padStart(2, '0');
    const minutos = String(hoy.getMinutes()).padStart(2, '0');
    return `${año}-${mes}-${dia} ${hora}:${minutos}`;
}
function cambiarVista(idVista, idBoton) {
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    document.querySelectorAll('.btn-menu').forEach(b => b.classList.remove('activo'));
    document.getElementById(idVista)?.classList.add('activa');
    document.getElementById(idBoton)?.classList.add('activo');
    document.querySelectorAll('.btn-menu').forEach(b => b.removeAttribute('aria-current'));
    document.getElementById(idBoton)?.setAttribute('aria-current', 'page');
    const titulo = document.querySelector(`#${idVista} h1`);
    if (titulo) {
        titulo.tabIndex = -1;
        titulo.focus({ preventScroll: true });
    }
    document.title = idVista === 'vista-cortes' ? 'Consultorio POS · Corte diario' : 'Consultorio POS · Caja';
}
function abrirModalEgreso() {
    (0, presentacion_1.abrirPanelEgreso)();
}
function cerrarModalEgreso() {
    (0, presentacion_1.cerrarPanelEgreso)();
}
function mandarImprimir(tipoTicket) {
    const appPrincipal = document.querySelector('.contenedor-app');
    if (appPrincipal)
        appPrincipal.style.display = 'none';
    const zonaImpresion = document.getElementById('zona-impresion');
    if (zonaImpresion)
        zonaImpresion.style.display = 'block';
    document.getElementById('ticket-venta').style.display = tipoTicket === 'venta' ? 'block' : 'none';
    document.getElementById('ticket-egreso').style.display = tipoTicket === 'egreso' ? 'block' : 'none';
    document.getElementById('reporte-corte').style.display = tipoTicket === 'corte' ? 'block' : 'none';
    setTimeout(() => {
        window.print();
        if (zonaImpresion)
            zonaImpresion.style.display = 'none';
        if (appPrincipal)
            appPrincipal.style.display = '';
    }, 100);
}
// ==========================================
// 2. PACIENTES
// ==========================================
function inicializarListas() {
    const datalistPacientes = document.getElementById('lista-pacientes');
    if (datalistPacientes) {
        conexion_1.baseDeDatos.all(`SELECT * FROM pacientes ORDER BY nombre_completo ASC`, [], (err, filas) => {
            if (err)
                return console.error(err);
            pacientesMemoria = filas;
            datalistPacientes.innerHTML = filas.map((p) => `<option value="${p.nombre_completo}"></option>`).join('');
        });
    }
}
function buscarPacienteAuto() {
    const inputNombre = document.getElementById('c_paciente_nombre').value.trim().toLowerCase();
    const inputId = document.getElementById('c_paciente_id_real');
    const inputEdad = document.getElementById('c_paciente_edad');
    const inputSexo = document.getElementById('c_paciente_sexo');
    const inputTel = document.getElementById('c_paciente_tel');
    const inputEmail = document.getElementById('c_paciente_email');
    const inputNotas = document.getElementById('c_paciente_notas');
    const pacienteEncontrado = pacientesMemoria.find(p => p.nombre_completo.toLowerCase() === inputNombre);
    if (pacienteEncontrado) {
        inputId.value = pacienteEncontrado.id.toString();
        inputEdad.value = pacienteEncontrado.edad;
        inputSexo.value = pacienteEncontrado.sexo;
        inputTel.value = pacienteEncontrado.telefono;
        inputEmail.value = pacienteEncontrado.email || '';
        inputNotas.value = pacienteEncontrado.historial || '';
    }
    else {
        inputId.value = '';
    }
}
// ==========================================
// 3. CARRITO DE ESTUDIOS
// ==========================================
function agregarEstudioCarrito() {
    const input = document.getElementById('c_estudio_buscador');
    const nombreBuscado = input.value.trim().toUpperCase();
    if (!nombreBuscado) {
        alert("⚠️ Escribe o selecciona un estudio primero.");
        return;
    }
    let estudioEncontrado = catalogo_1.catalogoEstudios.find(e => e.nombre.toUpperCase() === nombreBuscado);
    if (!estudioEncontrado) {
        const posibles = catalogo_1.catalogoEstudios.filter(e => e.nombre.toUpperCase().includes(nombreBuscado));
        if (posibles.length === 1) {
            estudioEncontrado = posibles[0];
        }
        else if (posibles.length > 1) {
            alert(`⚠️ Se encontraron varios estudios con "${nombreBuscado}".\nPor favor, selecciona uno de la lista desplegable.`);
            return;
        }
    }
    if (estudioEncontrado) {
        carritoEstudios.push({ ...estudioEncontrado });
        input.value = '';
        renderizarCarrito();
        calcularVenta();
        (0, presentacion_1.anunciar)(`${estudioEncontrado.nombre} agregado al ticket.`);
        document.dispatchEvent(new Event('catalogo:restablecer'));
    }
    else {
        alert(`⚠️ Estudio no encontrado: "${nombreBuscado}"\nVerifica la lista desplegable.`);
    }
}
function eliminarDelCarrito(index) {
    const eliminado = carritoEstudios[index];
    carritoEstudios.splice(index, 1);
    renderizarCarrito();
    (0, presentacion_1.anunciar)(`${eliminado.nombre} eliminado del ticket.`);
    const botones = document.querySelectorAll('.btn-eliminar-carrito');
    (botones[Math.min(index, botones.length - 1)] || document.getElementById('c_estudio_buscador'))?.focus();
}
function renderizarCarrito() {
    const listaHTML = document.getElementById('lista-carrito');
    const subtotalInput = document.getElementById('c_subtotal');
    const cantidad = carritoEstudios.length;
    document.getElementById('cantidad-servicios').textContent = `${cantidad} ${cantidad === 1 ? 'servicio' : 'servicios'}`;
    listaHTML.replaceChildren();
    if (cantidad === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'carrito-vacio';
        vacio.textContent = 'Tu ticket está vacío. Agrega una consulta o estudio para comenzar.';
        listaHTML.appendChild(vacio);
        subtotalInput.value = '0';
        calcularVenta();
        return;
    }
    let sumaSubtotal = 0;
    carritoEstudios.forEach((est, index) => {
        sumaSubtotal += est.precio;
        const li = document.createElement('li');
        const nombre = document.createElement('span');
        nombre.className = 'nombre-servicio';
        nombre.textContent = est.nombre;
        const acciones = document.createElement('div');
        acciones.className = 'acciones-renglon';
        const precio = document.createElement('strong');
        precio.textContent = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(est.precio);
        const quitar = document.createElement('button');
        quitar.type = 'button';
        quitar.className = 'btn-eliminar-carrito';
        quitar.textContent = 'Quitar';
        quitar.setAttribute('aria-label', `Quitar ${est.nombre}`);
        quitar.addEventListener('click', () => eliminarDelCarrito(index));
        acciones.append(precio, quitar);
        li.append(nombre, acciones);
        listaHTML.appendChild(li);
    });
    subtotalInput.value = sumaSubtotal.toFixed(2);
    calcularVenta();
}
function calcularVenta() {
    const subtotalCrudo = document.getElementById('c_subtotal').value;
    const precioBase = parseFloat(subtotalCrudo) || 0;
    const tipoDesc = document.getElementById('c_tipo_desc').value;
    const descuentoIngresado = parseFloat(document.getElementById('c_descuento').value) || 0;
    let descuentoReal = tipoDesc === 'Porcentaje' ? precioBase * (descuentoIngresado / 100) : descuentoIngresado;
    if (descuentoReal > precioBase)
        descuentoReal = precioBase;
    const recibido = parseFloat(document.getElementById('c_recibido').value) || 0;
    const totalConDescuento = Math.max(0, precioBase - descuentoReal);
    document.getElementById('c_total_cobrar').value = totalConDescuento.toFixed(2);
    const cambio = Math.max(0, recibido - totalConDescuento);
    document.getElementById('c_cambio').value = cambio.toFixed(2);
    const botonCobrar = document.getElementById('boton-cobrar');
    if (botonCobrar)
        botonCobrar.disabled = carritoEstudios.length === 0;
}
function cambiarMetodoPago() {
    const metodo = document.getElementById('c_metodo').value;
    const cajaRef = document.getElementById('caja_referencia');
    if (metodo === 'Tarjeta' || metodo === 'Transferencia') {
        cajaRef.style.display = 'flex';
    }
    else {
        cajaRef.style.display = 'none';
        document.getElementById('c_referencia').value = '';
    }
}
// ==========================================
// 4. CORTES DIARIOS (CON TABLA DE ESTUDIOS AGRUPADOS)
// ==========================================
function cargarCorteDiario() {
    const inputFecha = document.getElementById('fecha_corte');
    let fecha = inputFecha.value;
    if (!fecha) {
        const h = new Date();
        fecha = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
        inputFecha.value = fecha;
    }
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const partesFecha = fecha.split('-');
    const fechaBonita = `${parseInt(partesFecha[2], 10)} de ${meses[parseInt(partesFecha[1], 10) - 1]} de ${partesFecha[0]}`;
    const cajaFechaReporte = document.getElementById('rep_fecha');
    if (cajaFechaReporte)
        cajaFechaReporte.innerText = fechaBonita;
    let ingresos = 0, efe = 0, tar = 0, tra = 0, egresosTot = 0;
    let numTickets = 0, totalDescuentos = 0;
    // Aquí vamos a ir metiendo los estudios y contando cuántos son
    const estudiosAgrupados = {};
    conexion_1.baseDeDatos.all(`SELECT * FROM ventas WHERE fecha_hora LIKE ?`, [`${fecha}%`], (err, ventas) => {
        if (err)
            return;
        let listaVentasHTML = '';
        let listaVentasPDF = `
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
            <tr style="background-color: #f8fbfd; border-bottom: 2px solid #ccc;">
                <th style="padding: 6px;">Hora</th>
                <th style="padding: 6px;">Folio</th>
                <th style="padding: 6px;">Estudios Realizados</th>
                <th style="padding: 6px;">Total Pagado</th>
            </tr>
        `;
        ventas.forEach((v) => {
            ingresos += v.monto_pagado;
            totalDescuentos += v.descuento || 0;
            numTickets++;
            if (v.metodo_pago.startsWith('Efectivo'))
                efe += v.monto_pagado;
            if (v.metodo_pago.startsWith('Tarjeta'))
                tar += v.monto_pagado;
            if (v.metodo_pago.startsWith('Transferencia'))
                tra += v.monto_pagado;
            // Lógica para separar cada estudio, contarlo y anotar en qué folio está
            const idsStr = v.estudio_id ? v.estudio_id.toString().split(',') : [];
            const nombresEstudiosArreglo = [];
            idsStr.forEach((idDelEstudio) => {
                const idLimpio = idDelEstudio.trim();
                const objEstudio = catalogo_1.catalogoEstudios.find(e => e.id.toString() === idLimpio);
                const nombreDelEstudio = objEstudio ? objEstudio.nombre : 'Estudio Desconocido';
                nombresEstudiosArreglo.push(nombreDelEstudio);
                // Lo metemos al grupo para sumarlo
                if (!estudiosAgrupados[idLimpio]) {
                    estudiosAgrupados[idLimpio] = { nombre: nombreDelEstudio, cantidad: 0, folios: [] };
                }
                estudiosAgrupados[idLimpio].cantidad++;
                // Anotamos el folio para saber en qué ticket se hizo
                if (!estudiosAgrupados[idLimpio].folios.includes(v.folio)) {
                    estudiosAgrupados[idLimpio].folios.push(v.folio);
                }
            });
            const nombresUnidosParaTicket = nombresEstudiosArreglo.join('<br>• ');
            listaVentasHTML += `
            <div style="border-bottom: 1px dashed #ccc; margin-bottom: 10px; padding-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <strong style="color: #0078d4;">${v.folio}</strong>
                    <span style="color: #7f8c8d;">Hora: ${v.fecha_hora.split(' ')[1]}</span>
                </div>
                <div style="margin: 5px 0; font-size: 13px;">
                    <strong>Estudios:</strong><br>• ${nombresUnidosParaTicket}
                </div>
                <div style="margin-top: 5px;">
                    Total Pagado: <strong style="color: #27ae60;">$${v.monto_pagado.toFixed(2)}</strong> (${v.metodo_pago})
                </div>
            </div>`;
            listaVentasPDF += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px; vertical-align: top;">${v.fecha_hora.split(' ')[1]}</td>
                <td style="padding: 6px; vertical-align: top; font-weight: bold;">${v.folio}</td>
                <td style="padding: 6px; vertical-align: top;">• ${nombresUnidosParaTicket}</td>
                <td style="padding: 6px; vertical-align: top; color: #27ae60; font-weight: bold;">$${v.monto_pagado.toFixed(2)}<br><span style="font-size: 10px; color:#7f8c8d;">${v.metodo_pago}</span></td>
            </tr>`;
        });
        listaVentasPDF += `</table>`;
        // 👇 CREACIÓN DE LA TABLA DE AGRUPACIÓN (ESTUDIOS SUMADOS Y FOLIOS) 👇
        let tablaAgrupadaHTML = `
        <h4 style="margin-top: 15px; margin-bottom: 5px; color: #2c3e50; font-size: 16px;">Total de Estudios del Día</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; margin-bottom: 25px;">
            <tr style="background-color: #e8f4f8; border-bottom: 2px solid #0078d4;">
                <th style="padding: 8px; border: 1px solid #ddd;">Nombre del Estudio</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Folios / Tickets Asociados</th>
            </tr>
        `;
        let existenEstudios = false;
        Object.values(estudiosAgrupados).forEach((agrupado) => {
            existenEstudios = true;
            tablaAgrupadaHTML += `
            <tr>
                <td style="padding: 6px; border: 1px solid #ddd; font-weight: 500;">${agrupado.nombre}</td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: bold; font-size: 14px;">${agrupado.cantidad}</td>
                <td style="padding: 6px; border: 1px solid #ddd; color: #555;">${agrupado.folios.join(', ')}</td>
            </tr>
            `;
        });
        tablaAgrupadaHTML += `</table>`;
        if (!existenEstudios)
            tablaAgrupadaHTML = ''; // Si no hay estudios, no mostramos la tabla
        // 👆 FIN DE LA MAGIA DE LA TABLA 👆
        conexion_1.baseDeDatos.all(`SELECT monto, justificacion, usuario FROM egresos WHERE fecha_hora LIKE ?`, [`${fecha}%`], (err, egresos) => {
            if (err)
                return;
            let list = '';
            egresos.forEach((e) => {
                egresosTot += e.monto;
                list += `<p style="margin: 3px 0;">-$${e.monto.toFixed(2)} | ${e.justificacion} (Por: ${e.usuario})</p>`;
            });
            const caja = efe - egresosTot;
            // Actualización de la PANTALLA de la compu
            document.getElementById('res_ingresos').innerText = `$${ingresos.toFixed(2)}`;
            document.getElementById('res_egresos').innerText = `$${egresosTot.toFixed(2)}`;
            document.getElementById('res_caja').innerText = `$${caja.toFixed(2)}`;
            document.getElementById('res_efectivo').innerText = efe.toFixed(2);
            document.getElementById('res_tarjeta').innerText = tar.toFixed(2);
            document.getElementById('res_transferencia').innerText = tra.toFixed(2);
            document.getElementById('lista_egresos').innerHTML = list || 'No hay egresos.';
            const divVentas = document.getElementById('lista_ventas_corte');
            if (divVentas) {
                const resumenHTML = `<div style="background: #f8fbfd; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #d1d8dd;">
                    <strong>Total de Tickets:</strong> ${numTickets} <span style="margin: 0 10px;">|</span> 
                    <strong>Descuentos Otorgados:</strong> $${totalDescuentos.toFixed(2)}
                </div>`;
                // Inyectamos todo en la pantalla: El resumen + La tabla agrupada + La lista de tickets
                divVentas.innerHTML = resumenHTML + tablaAgrupadaHTML + `<h4 style="margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Desglose Histórico por Ticket</h4>` + (listaVentasHTML || '<p>No hay ventas registradas hoy.</p>');
            }
            // Actualización del PDF OCULTO
            const repIngresos = document.getElementById('rep_ingresos');
            if (repIngresos) {
                repIngresos.innerText = ingresos.toFixed(2);
                document.getElementById('rep_egresos').innerText = egresosTot.toFixed(2);
                document.getElementById('rep_caja').innerText = caja.toFixed(2);
                document.getElementById('rep_efectivo').innerText = efe.toFixed(2);
                document.getElementById('rep_tarjeta').innerText = tar.toFixed(2);
                document.getElementById('rep_transferencia').innerText = tra.toFixed(2);
                document.getElementById('rep_lista_egresos').innerHTML = list || 'No hay egresos.';
                // Buscamos si existen los huecos de tickets y descuentos (si los pusiste en index.html)
                const huecoTickets = document.getElementById('rep_tickets');
                if (huecoTickets)
                    huecoTickets.innerText = numTickets.toString();
                const huecoDescuentos = document.getElementById('rep_descuentos');
                if (huecoDescuentos)
                    huecoDescuentos.innerText = totalDescuentos.toFixed(2);
                const repListaVentas = document.getElementById('rep_lista_ventas');
                if (repListaVentas) {
                    // Inyectamos todo en el PDF: La tabla agrupada + La lista de tickets
                    repListaVentas.innerHTML = numTickets > 0 ? (tablaAgrupadaHTML + `<h4 style="margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Desglose Histórico por Ticket</h4>` + listaVentasPDF) : '<p style="color:#7f8c8d; font-style:italic;">Sin ventas registradas.</p>';
                }
            }
        });
    });
}
// ==========================================
// 5. PROCESAMIENTO A BASE DE DATOS
// ==========================================
function guardarEgreso(evento) {
    evento.preventDefault();
    const monto = parseFloat(document.getElementById('e_monto').value);
    const textoCaja = document.getElementById('res_caja').innerText.replace('$', '');
    const efectivoEnCaja = parseFloat(textoCaja) || 0;
    if (monto > efectivoEnCaja) {
        setTimeout(() => {
            alert(`⚠️ ¡No hay suficiente efectivo físico!\n\nTienes ingresos en tarjeta/transferencia, pero en CAJA FÍSICA solo tienes $${efectivoEnCaja.toFixed(2)}.`);
            const inputMonto = document.getElementById('e_monto');
            inputMonto.value = '';
            inputMonto.focus();
        }, 10);
        return;
    }
    const justificacion = document.getElementById('e_justificacion').value.trim();
    const usuario = document.getElementById('e_usuario').value.trim();
    const fechaHora = obtenerFechaEstandar();
    conexion_1.baseDeDatos.run(`INSERT INTO egresos (fecha_hora, monto, justificacion, usuario) VALUES (?, ?, ?, ?)`, [fechaHora, monto, justificacion, usuario], function (error) {
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        document.getElementById('te_fecha').innerText = new Date().toLocaleString('es-MX');
        document.getElementById('te_monto').innerText = monto.toFixed(2);
        document.getElementById('te_justificacion').innerText = justificacion;
        document.getElementById('te_usuario').innerText = usuario;
        cerrarModalEgreso();
        mandarImprimir('egreso');
        document.getElementById('formulario-egreso').reset();
        cargarCorteDiario();
    });
}
function procesarCobro(evento) {
    evento.preventDefault();
    if (carritoEstudios.length === 0) {
        alert('⚠️ Agrega al menos un estudio al carrito.');
        return;
    }
    const nombrePac = document.getElementById('c_paciente_nombre').value.trim();
    const edadPac = document.getElementById('c_paciente_edad').value;
    const sexoPac = document.getElementById('c_paciente_sexo').value;
    const telPac = document.getElementById('c_paciente_tel').value;
    const emailPac = document.getElementById('c_paciente_email').value.trim();
    const notasPac = document.getElementById('c_paciente_notas').value.trim();
    let idPacienteReal = document.getElementById('c_paciente_id_real').value;
    if (!idPacienteReal) {
        const sqlInsert = `INSERT INTO pacientes (nombre_completo, edad, sexo, telefono, email, historial) VALUES (?, ?, ?, ?, ?, ?)`;
        conexion_1.baseDeDatos.run(sqlInsert, [nombrePac, edadPac, sexoPac, telPac, emailPac, notasPac], function (err) {
            if (err) {
                alert('Error creando paciente: ' + err.message);
                return;
            }
            idPacienteReal = this.lastID.toString();
            inicializarListas();
            ejecutarInsercionVenta(idPacienteReal, nombrePac);
        });
    }
    else {
        const sqlUpdate = `UPDATE pacientes SET edad = ?, sexo = ?, telefono = ?, email = ?, historial = ? WHERE id = ?`;
        conexion_1.baseDeDatos.run(sqlUpdate, [edadPac, sexoPac, telPac, emailPac, notasPac, idPacienteReal], function (err) {
            if (err)
                console.error(err);
            inicializarListas();
            ejecutarInsercionVenta(idPacienteReal, nombrePac);
        });
    }
}
function ejecutarInsercionVenta(pacienteId, pacienteNombre) {
    conexion_1.baseDeDatos.get(`SELECT usuario_resultados, password_resultados FROM ventas WHERE paciente_id = ? LIMIT 1`, [pacienteId], (err, fila) => {
        let usuarioRes = '';
        let passRes = '';
        if (fila && fila.usuario_resultados) {
            usuarioRes = fila.usuario_resultados;
            passRes = fila.password_resultados;
        }
        else {
            usuarioRes = 'PAC' + Math.floor(Math.random() * 9000 + 1000);
            passRes = Math.random().toString(36).substring(2, 8).toUpperCase();
        }
        const folioUnico = 'FOL-' + Date.now().toString().slice(-6);
        const fechaHora = obtenerFechaEstandar();
        const doctor = document.getElementById('c_doctor').value.trim();
        const vendedor = document.getElementById('c_vendedor').value.trim() || 'Recepción';
        const metodo = document.getElementById('c_metodo').value;
        const referencia = document.getElementById('c_referencia').value.trim();
        const subtotal = parseFloat(document.getElementById('c_subtotal').value) || 0;
        const totalPagado = parseFloat(document.getElementById('c_total_cobrar').value) || 0;
        const recibido = parseFloat(document.getElementById('c_recibido').value) || 0;
        const cambio = parseFloat(document.getElementById('c_cambio').value) || 0;
        if (recibido < totalPagado) {
            setTimeout(() => {
                alert("⚠️ ¡Falta dinero! El pago recibido no puede ser menor al total a cobrar.");
                const inputRecibido = document.getElementById('c_recibido');
                inputRecibido.value = '';
                inputRecibido.focus();
            }, 10);
            return;
        }
        const descuentoGuardar = subtotal - totalPagado;
        const idsConcatenados = carritoEstudios.map(e => e.id).join(',');
        const nombresConcatenados = carritoEstudios.map(e => `- ${e.nombre}`).join('<br>');
        const sqlVenta = `INSERT INTO ventas (folio, fecha_hora, paciente_id, estudio_id, nombre_doctor, vendedor, subtotal, descuento, abono_1, abono_2, adeudo, monto_pagado, cambio, metodo_pago, usuario_resultados, password_resultados) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?)`;
        const metodoDB = referencia ? `${metodo} (Ref: ${referencia})` : metodo;
        conexion_1.baseDeDatos.run(sqlVenta, [folioUnico, fechaHora, pacienteId, idsConcatenados, doctor, vendedor, subtotal, descuentoGuardar, totalPagado, cambio, metodoDB, usuarioRes, passRes], function (error) {
            if (error) {
                alert('Error BD: ' + error.message);
                return;
            }
            document.getElementById('t_folio').innerText = folioUnico;
            document.getElementById('t_fecha').innerText = new Date().toLocaleString('es-MX');
            document.getElementById('t_paciente').innerText = pacienteNombre;
            document.getElementById('t_doctor').innerText = doctor;
            document.getElementById('t_usuario').innerText = usuarioRes;
            document.getElementById('t_pass').innerText = passRes;
            document.getElementById('t_estudio_lista').innerHTML = nombresConcatenados;
            document.getElementById('t_subtotal').innerText = subtotal.toFixed(2);
            document.getElementById('t_descuento').innerText = descuentoGuardar.toFixed(2);
            document.getElementById('t_pagado').innerText = totalPagado.toFixed(2);
            document.getElementById('t_recibido').innerText = recibido.toFixed(2);
            document.getElementById('t_cambio').innerText = cambio.toFixed(2);
            document.getElementById('t_metodo').innerText = metodo;
            document.getElementById('t_vendedor').innerText = vendedor;
            const cajaRefTicket = document.getElementById('t_linea_ref');
            if (referencia && cajaRefTicket) {
                cajaRefTicket.style.display = 'block';
                document.getElementById('t_referencia').innerText = referencia;
            }
            else if (cajaRefTicket) {
                cajaRefTicket.style.display = 'none';
            }
            mandarImprimir('venta');
            document.getElementById('formulario-cobro').reset();
            document.getElementById('c_paciente_id_real').value = '';
            carritoEstudios = [];
            renderizarCarrito();
            cambiarMetodoPago();
            cargarCorteDiario();
            (0, presentacion_1.anunciar)('Venta guardada. Preparando la impresión del ticket.');
        });
    });
}
// ==========================================
// 6. EXPOSICIÓN GLOBAL DE FUNCIONES 
// ==========================================
window.cambiarVista = cambiarVista;
window.abrirModalEgreso = abrirModalEgreso;
window.cerrarModalEgreso = cerrarModalEgreso;
window.mandarImprimir = mandarImprimir;
window.buscarPacienteAuto = buscarPacienteAuto;
window.agregarEstudioCarrito = agregarEstudioCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.calcularVenta = calcularVenta;
window.cambiarMetodoPago = cambiarMetodoPago;
window.cargarCorteDiario = cargarCorteDiario;
window.guardarEgreso = guardarEgreso;
window.procesarCobro = procesarCobro;
// ==========================================
// 7. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarListas();
    (0, presentacion_1.iniciarCatalogo)(catalogo_1.catalogoEstudios, agregarEstudioCarrito);
    (0, presentacion_1.iniciarPanelEgreso)();
    carritoEstudios = [];
    renderizarCarrito();
    const fechaInput = document.getElementById('fecha_corte');
    if (fechaInput) {
        const hoy = new Date();
        fechaInput.value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    }
});
