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
    assert.deepEqual(filtrarServicios(catalogoEstudios, '003').map(s => s.id), [3]);
    assert.deepEqual(filtrarServicios(catalogoEstudios, 'servicio inexistente'), []);
    assert.equal(filtrarServicios(catalogoEstudios, '').length, catalogoEstudios.length);
});

// Adaptador de DOM mínimo: prueba eventos y foco, no sustituye revisión visual en Electron.
class Elemento {
    constructor() {
        this.children = []; this.listeners = {}; this.attributes = {}; this.style = {}; this.value = '';
        const clases = new Set();
        this.classList = { toggle(c, on) { if (on) clases.add(c); else clases.delete(c); }, contains(c) { return clases.has(c); } };
    }
    appendChild(nodo) { this.children.push(nodo); return nodo; }
    append(...nodos) { this.children.push(...nodos); }
    replaceChildren() { this.children = []; }
    setAttribute(nombre, valor) { this.attributes[nombre] = valor; }
    removeAttribute(nombre) { delete this.attributes[nombre]; }
    hasAttribute(nombre) { return nombre in this.attributes; }
    addEventListener(nombre, fn) { this.listeners[nombre] = fn; }
    focus() { global.document.activeElement = this; }
    scrollIntoView() { this.desplazado = true; }
    contains(nodo) { return nodo === this || this.children.some(hijo => hijo.contains(nodo)); }
    querySelectorAll() { return this.children; }
}
function prepararDOM() {
    const nodos = new Map();
    global.document = {
        getElementById(id) { if (!nodos.has(id)) nodos.set(id, new Elemento()); return nodos.get(id); },
        createElement() { return new Elemento(); },
        querySelector() { return this.getElementById('app'); },
        listeners: {},
        addEventListener(nombre, fn) { this.listeners[nombre] = fn; },
        body: new Elemento(),
        activeElement: new Elemento(),
    };
    const nodo = id => document.getElementById(id);
    nodo('selector-servicios').append(nodo('c_estudio_buscador'), nodo('alternar-catalogo'), nodo('catalogo-panel'));
    return nodo;
}
function tecla(nodo, key, extras = {}) {
    let prevenido = false;
    nodo('c_estudio_buscador').listeners.keydown({ key, preventDefault() { prevenido = true; }, ...extras });
    return prevenido;
}
function buscar(nodo, valor) {
    nodo('c_estudio_buscador').value = valor;
    nodo('c_estudio_buscador').listeners.input();
}

test('el catálogo empieza cerrado y al enfocarlo anuncia que está desplegado', () => {
    const nodo = prepararDOM(); iniciarCatalogo(catalogoEstudios, () => {});
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'false');
    assert.equal(nodo('catalogo-panel').hasAttribute('inert'), true);
    nodo('c_estudio_buscador').listeners.focus();
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'true');
    assert.equal(nodo('catalogo-panel').hasAttribute('inert'), false);
});

test('buscar filtra opciones y comunica la ausencia de coincidencias', () => {
    const nodo = prepararDOM(); iniciarCatalogo(catalogoEstudios, () => {});
    buscar(nodo, 'torax');
    assert.equal(nodo('catalogo-opciones').children.length, 1);
    assert.equal(nodo('catalogo-opciones').children[0].children[1].textContent, 'RADIOGRAFÍA DE TÓRAX');
    buscar(nodo, 'inexistente');
    assert.equal(nodo('catalogo-opciones').children.length, 0);
    assert.equal(nodo('catalogo-vacio').hidden, false);
    assert.equal(nodo('catalogo-resultados').textContent, '0 servicios disponibles');
});

test('Enter agrega la coincidencia y cierra sin enviar el cobro', () => {
    const nodo = prepararDOM(); let agregado;
    iniciarCatalogo(catalogoEstudios, () => { agregado = nodo('c_estudio_buscador').value; });
    buscar(nodo, 'torax');
    assert.equal(tecla(nodo, 'Enter'), true);
    assert.equal(agregado, 'RADIOGRAFÍA DE TÓRAX');
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'false');
});

test('un clic agrega exactamente el servicio elegido y conserva el foco', () => {
    const nodo = prepararDOM(); let agregado;
    iniciarCatalogo(catalogoEstudios, () => { agregado = nodo('c_estudio_buscador').value; });
    nodo('catalogo-opciones').children[3].listeners.click();
    assert.equal(agregado, 'ULTRASONIDO ABDOMINAL');
    assert.equal(document.activeElement, nodo('c_estudio_buscador'));
});

test('200 servicios se recorren con flechas y la opción activa se desplaza a la vista', () => {
    const servicios = Array.from({ length: 200 }, (_, i) => ({ id: i + 1, nombre: `SERVICIO ${i + 1}`, precio: 100 }));
    const nodo = prepararDOM(); let agregado;
    iniciarCatalogo(servicios, () => { agregado = nodo('c_estudio_buscador').value; });
    assert.equal(nodo('catalogo-opciones').children.length, 200);
    tecla(nodo, 'ArrowUp');
    assert.equal(nodo('c_estudio_buscador').attributes['aria-activedescendant'], 'servicio-opcion-200');
    assert.equal(nodo('catalogo-opciones').children[199].desplazado, true);
    tecla(nodo, 'ArrowDown');
    tecla(nodo, 'Enter');
    assert.equal(agregado, 'SERVICIO 200');
});

test('Escape y Tab cierran sin borrar lo escrito ni agregar un servicio', () => {
    const nodo = prepararDOM(); let agregados = 0;
    iniciarCatalogo(catalogoEstudios, () => agregados++);
    buscar(nodo, 'consulta'); tecla(nodo, 'Escape');
    assert.equal(nodo('c_estudio_buscador').value, 'consulta');
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'false');
    assert.equal(nodo('c_estudio_buscador').hasAttribute('aria-activedescendant'), false);
    nodo('c_estudio_buscador').listeners.focus(); tecla(nodo, 'Tab');
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'false');
    assert.equal(agregados, 0);
});

test('Enter sin selección o sin coincidencias nunca agrega ni envía el formulario', () => {
    const nodo = prepararDOM(); let agregados = 0;
    iniciarCatalogo(catalogoEstudios, () => agregados++);
    assert.equal(tecla(nodo, 'Enter'), true);
    buscar(nodo, 'inexistente'); tecla(nodo, 'ArrowDown'); tecla(nodo, 'Enter');
    assert.equal(agregados, 0);
});

test('el control de despliegue alterna y pulsar fuera lo cierra', () => {
    const nodo = prepararDOM(); iniciarCatalogo(catalogoEstudios, () => {});
    nodo('alternar-catalogo').listeners.click();
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'true');
    nodo('alternar-catalogo').listeners.click();
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'false');
    nodo('alternar-catalogo').listeners.click();
    document.listeners.pointerdown({ target: new Elemento() });
    assert.equal(nodo('c_estudio_buscador').attributes['aria-expanded'], 'false');
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
