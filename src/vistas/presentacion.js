"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrarServicios = filtrarServicios;
exports.iniciarCatalogo = iniciarCatalogo;
exports.anunciar = anunciar;
exports.abrirPanelEgreso = abrirPanelEgreso;
exports.cerrarPanelEgreso = cerrarPanelEgreso;
exports.iniciarPanelEgreso = iniciarPanelEgreso;
const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
/** Búsqueda sin acentos para que no sea necesario escribir el nombre exacto. */
function filtrarServicios(servicios, consulta) {
    const normalizar = (valor) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const filtro = normalizar(consulta);
    return servicios.filter(servicio => normalizar(`${servicio.id} ${servicio.nombre}`).includes(filtro));
}
/** Solo presentación: no calcula cobros ni accede a la base de datos. */
function iniciarCatalogo(servicios, agregar) {
    const buscador = document.getElementById('c_estudio_buscador');
    const filas = document.getElementById('catalogo-filas');
    const lista = document.getElementById('lista-estudios');
    for (const servicio of servicios) {
        const opcion = document.createElement('option');
        opcion.value = servicio.nombre;
        lista.appendChild(opcion);
    }
    const renderizar = () => {
        filas.replaceChildren();
        const visibles = filtrarServicios(servicios, buscador.value);
        document.getElementById('catalogo-vacio').hidden = visibles.length > 0;
        for (const servicio of visibles) {
            const fila = document.createElement('tr');
            for (const [indice, texto] of [String(servicio.id).padStart(3, '0'), servicio.nombre, moneda.format(servicio.precio)].entries()) {
                const celda = document.createElement('td');
                celda.textContent = texto;
                if (indice === 2)
                    celda.className = 'numero';
                fila.appendChild(celda);
            }
            const accion = document.createElement('td');
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'agregar-servicio';
            boton.textContent = '+';
            boton.setAttribute('aria-label', `Agregar ${servicio.nombre}`);
            boton.addEventListener('click', () => {
                buscador.value = servicio.nombre;
                agregar();
                // El botón se recrea al filtrar: conservar el foco en el mismo servicio.
                const indice = servicios.indexOf(servicio);
                filas.children[indice]?.querySelector('button')?.focus();
            });
            accion.appendChild(boton);
            fila.appendChild(accion);
            filas.appendChild(fila);
        }
    };
    buscador.addEventListener('input', renderizar);
    buscador.addEventListener('keydown', evento => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            const coincidencias = filtrarServicios(servicios, buscador.value);
            if (coincidencias.length === 1)
                buscador.value = coincidencias[0].nombre;
            agregar();
            buscador.focus();
        }
    });
    document.getElementById('formulario-cobro').addEventListener('reset', () => {
        // El reset nativo actualiza los valores después de emitir el evento.
        queueMicrotask(renderizar);
    });
    document.addEventListener('catalogo:restablecer', renderizar);
    renderizar();
}
function anunciar(mensaje) {
    const aviso = document.getElementById('aviso-interfaz');
    if (aviso)
        aviso.textContent = mensaje;
}
let focoAnterior = null;
function abrirPanelEgreso() {
    focoAnterior = document.activeElement;
    const panel = document.getElementById('modal-egreso');
    panel.style.display = 'flex';
    document.querySelector('.contenedor-app').setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    document.getElementById('e_monto').focus();
}
function cerrarPanelEgreso() {
    document.getElementById('modal-egreso').style.display = 'none';
    document.querySelector('.contenedor-app').removeAttribute('inert');
    document.body.style.overflow = '';
    focoAnterior?.focus();
}
function iniciarPanelEgreso() {
    const panel = document.getElementById('modal-egreso');
    panel.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            evento.preventDefault();
            cerrarPanelEgreso();
        }
        if (evento.key === 'Tab') {
            const controles = Array.from(panel.querySelectorAll('input, textarea, button, select, a[href]')).filter(control => !control.hasAttribute('disabled'));
            const primero = controles[0], ultimo = controles[controles.length - 1];
            if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault();
                ultimo.focus();
            }
            else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault();
                primero.focus();
            }
        }
    });
}
