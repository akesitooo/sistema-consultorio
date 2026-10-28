const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filtrarServicios, iniciarCatalogo, abrirPanelEgreso, cerrarPanelEgreso, iniciarPanelEgreso } = require('../src/vistas/presentacion.js');
const { catalogoEstudios } = require('../src/modelos/catalogo.js');

test('la búsqueda encuentra servicios aunque se omitan acentos o cambien mayúsculas', () => {
    assert.deepEqual(filtrarServicios(catalogoEstudios, '  TORAX ').map(s => s.id), [3]);
    assert.deepEqual(filtrarServicios(catalogoEstudios, 'quimica').map(s => s.id), [6]);
});

test('buscar un código distingue el servicio y una consulta desconocida queda vacía', () => {
    assert.deepEqual(filtrarServicios(catalogoEstudios, '10').map(s => s.id), [10]);
    assert.deepEqual(filtrarServicios(catalogoEstudios, 'servicio inexistente'), []);
    assert.equal(filtrarServicios(catalogoEstudios, '').length, catalogoEstudios.length);
});

// Adaptador de DOM mínimo: prueba eventos y foco, no sustituye revisión visual en Electron.
class Elemento {
    constructor() { this.children = []; this.listeners = {}; this.attributes = {}; this.style = {}; this.value = ''; }
    appendChild(nodo) { this.children.push(nodo); return nodo; }
    replaceChildren() { this.children = []; }
    setAttribute(nombre, valor) { this.attributes[nombre] = valor; }
    removeAttribute(nombre) { delete this.attributes[nombre]; }
    hasAttribute(nombre) { return nombre in this.attributes; }
    addEventListener(nombre, fn) { this.listeners[nombre] = fn; }
    focus() { global.document.activeElement = this; }
    querySelector() { return this.children.flatMap(c => c.children).find(c => c.type === 'button'); }
    querySelectorAll() { return this.children; }
}
function prepararDOM() {
    const nodos = new Map();
    global.document = {
        getElementById(id) { if (!nodos.has(id)) nodos.set(id, new Elemento()); return nodos.get(id); },
        createElement() { return new Elemento(); },
        querySelector() { return this.getElementById('app'); },
        addEventListener() {},
        body: new Elemento(),
        activeElement: new Elemento(),
    };
    return id => document.getElementById(id);
}

test('al buscar se actualizan las filas y se muestra el estado sin coincidencias', () => {
    const nodo = prepararDOM();
    iniciarCatalogo(catalogoEstudios, () => {});
    const buscador = nodo('c_estudio_buscador');
    buscador.value = 'torax'; buscador.listeners.input();
    assert.equal(nodo('catalogo-filas').children.length, 1);
    assert.equal(nodo('catalogo-filas').children[0].children[1].textContent, 'RADIOGRAFÍA DE TÓRAX');
    buscador.value = 'inexistente'; buscador.listeners.input();
    assert.equal(nodo('catalogo-filas').children.length, 0);
    assert.equal(nodo('catalogo-vacio').hidden, false);
});

test('Enter agrega una coincidencia sin acentos y evita enviar el formulario de cobro', () => {
    const nodo = prepararDOM();
    let agregado = null, prevenido = false;
    iniciarCatalogo(catalogoEstudios, () => { agregado = nodo('c_estudio_buscador').value; });
    nodo('c_estudio_buscador').value = 'torax';
    nodo('c_estudio_buscador').listeners.keydown({ key: 'Enter', preventDefault() { prevenido = true; } });
    assert.equal(agregado, 'RADIOGRAFÍA DE TÓRAX');
    assert.equal(prevenido, true);
});

test('el botón de una fila agrega exactamente ese servicio', () => {
    const nodo = prepararDOM();
    let agregado;
    iniciarCatalogo(catalogoEstudios, () => { agregado = nodo('c_estudio_buscador').value; });
    const fila = nodo('catalogo-filas').children[3];
    fila.children[3].children[0].listeners.click();
    assert.equal(agregado, 'ULTRASONIDO ABDOMINAL');
});

test('el panel mueve el foco, aísla el fondo y al cerrar devuelve el foco', () => {
    const nodo = prepararDOM();
    const origen = document.activeElement;
    abrirPanelEgreso();
    assert.equal(document.activeElement, nodo('e_monto'));
    assert.equal(nodo('app').hasAttribute('inert'), true);
    cerrarPanelEgreso();
    assert.equal(document.activeElement, origen);
    assert.equal(nodo('app').hasAttribute('inert'), false);
});

test('Escape cierra el panel sin enviar el formulario ni descartar la captura', () => {
    const nodo = prepararDOM();
    iniciarPanelEgreso();
    abrirPanelEgreso();
    nodo('e_monto').value = '100';
    let prevenido = false;
    nodo('modal-egreso').listeners.keydown({ key: 'Escape', preventDefault() { prevenido = true; } });
    assert.equal(nodo('modal-egreso').style.display, 'none');
    assert.equal(nodo('e_monto').value, '100');
    assert.equal(prevenido, true);
});

test('Tab y Shift+Tab mantienen el recorrido de teclado dentro del panel', () => {
    const nodo = prepararDOM();
    const primero = new Elemento(), ultimo = new Elemento();
    nodo('modal-egreso').children = [primero, ultimo];
    iniciarPanelEgreso();
    ultimo.focus();
    let prevenido = false;
    nodo('modal-egreso').listeners.keydown({ key: 'Tab', shiftKey: false, preventDefault() { prevenido = true; } });
    assert.equal(document.activeElement, primero);
    assert.equal(prevenido, true);
    nodo('modal-egreso').listeners.keydown({ key: 'Tab', shiftKey: true, preventDefault() {} });
    assert.equal(document.activeElement, ultimo);
});
