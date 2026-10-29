import { ServicioCatalogo } from '../modelos/catalogo';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** Búsqueda sin acentos para que no sea necesario escribir el nombre exacto. */
export function filtrarServicios(servicios: ServicioCatalogo[], consulta: string): ServicioCatalogo[] {
    const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const filtro = normalizar(consulta);
    return servicios.filter(servicio => normalizar(`${String(servicio.id).padStart(3, '0')} ${servicio.id} ${servicio.nombre}`).includes(filtro));
}

/** Combobox local: el foco permanece en el buscador y el listado conserva su altura acotada. */
export function iniciarCatalogo(servicios: ServicioCatalogo[], agregar: () => void): void {
    const buscador = document.getElementById('c_estudio_buscador') as HTMLInputElement;
    const contenedor = document.getElementById('selector-servicios')!;
    const panel = document.getElementById('catalogo-panel')!;
    const lista = document.getElementById('catalogo-opciones')!;
    const alternar = document.getElementById('alternar-catalogo')!;
    const resultados = document.getElementById('catalogo-resultados')!;
    let visibles: ServicioCatalogo[] = [];
    let abierto = false;
    let activo = -1;

    const seleccionarActivo = (indice: number, desplazar = false) => {
        activo = indice;
        Array.from(lista.children).forEach((opcion, posicion) => {
            opcion.setAttribute('aria-selected', String(posicion === activo));
        });
        const opcion = lista.children[activo] as HTMLElement | undefined;
        if (opcion && abierto) {
            buscador.setAttribute('aria-activedescendant', opcion.id);
            if (desplazar) opcion.scrollIntoView({ block: 'nearest' });
        } else {
            buscador.removeAttribute('aria-activedescendant');
        }
    };
    const mostrar = (valor: boolean) => {
        abierto = valor;
        contenedor.classList.toggle('abierto', valor);
        buscador.setAttribute('aria-expanded', String(valor));
        alternar.setAttribute('aria-expanded', String(valor));
        alternar.setAttribute('aria-label', valor ? 'Cerrar catálogo de servicios' : 'Mostrar catálogo de servicios');
        panel.setAttribute('aria-hidden', String(!valor));
        if (valor) panel.removeAttribute('inert');
        else panel.setAttribute('inert', '');
        seleccionarActivo(valor ? activo : -1);
    };
    const elegir = (servicio: ServicioCatalogo) => {
        buscador.value = servicio.nombre;
        agregar();
        // La integración existente limpia la búsqueda y anuncia el servicio agregado.
        buscador.focus();
        // focus puede abrir la lista; la selección siempre termina cerrándola.
        mostrar(false);
    };
    const renderizar = () => {
        visibles = filtrarServicios(servicios, buscador.value);
        lista.replaceChildren();
        document.getElementById('catalogo-vacio')!.hidden = visibles.length > 0;
        resultados.textContent = `${visibles.length} ${visibles.length === 1 ? 'servicio disponible' : 'servicios disponibles'}`;
        for (const servicio of visibles) {
            const opcion = document.createElement('div');
            opcion.id = `servicio-opcion-${servicio.id}`;
            opcion.className = 'opcion-servicio';
            opcion.setAttribute('role', 'option');
            opcion.setAttribute('aria-selected', 'false');
            const codigo = document.createElement('span');
            codigo.className = 'codigo-servicio';
            codigo.textContent = String(servicio.id).padStart(3, '0');
            const nombre = document.createElement('span');
            nombre.className = 'nombre-opcion';
            nombre.textContent = servicio.nombre;
            const precio = document.createElement('strong');
            precio.className = 'precio-opcion';
            precio.textContent = moneda.format(servicio.precio);
            opcion.append(codigo, nombre, precio);
            opcion.addEventListener('pointerdown', evento => evento.preventDefault());
            opcion.addEventListener('click', () => elegir(servicio));
            lista.appendChild(opcion);
        }
        seleccionarActivo(buscador.value.trim() && visibles.length ? 0 : -1);
    };
    buscador.addEventListener('focus', () => mostrar(true));
    buscador.addEventListener('click', () => mostrar(true));
    buscador.addEventListener('input', () => { renderizar(); mostrar(true); });
    buscador.addEventListener('keydown', evento => {
        if (evento.isComposing) return;
        if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
            evento.preventDefault();
            if (!abierto) mostrar(true);
            if (!visibles.length) return;
            const siguiente = evento.key === 'ArrowDown'
                ? Math.min(activo + 1, visibles.length - 1)
                : activo < 0 ? visibles.length - 1 : Math.max(0, activo - 1);
            seleccionarActivo(siguiente, true);
        } else if (evento.key === 'Enter') {
            evento.preventDefault();
            if (abierto && visibles[activo]) elegir(visibles[activo]);
        } else if (evento.key === 'Escape') {
            evento.preventDefault(); mostrar(false);
        } else if (evento.key === 'Tab') mostrar(false);
    });
    alternar.addEventListener('pointerdown', evento => evento.preventDefault());
    alternar.addEventListener('click', () => {
        const abrir = !abierto;
        if (abrir) buscador.focus();
        mostrar(abrir);
    });
    contenedor.addEventListener('focusout', evento => {
        if (!contenedor.contains(evento.relatedTarget as Node | null)) mostrar(false);
    });
    document.addEventListener('pointerdown', evento => {
        if (!contenedor.contains(evento.target as Node)) mostrar(false);
    });
    document.getElementById('formulario-cobro')!.addEventListener('reset', () => {
        queueMicrotask(() => { renderizar(); mostrar(false); });
    });
    document.addEventListener('catalogo:restablecer', () => { renderizar(); mostrar(false); });
    renderizar();
    mostrar(false);
}

/** Énfasis breve del total; no mueve cifras ni ignora la preferencia del equipo. */
export function resaltarTotal(): void {
    const total = document.querySelector('.total') as HTMLElement;
    if (!total || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    total.classList.remove('actualizada');
    void total.offsetWidth;
    total.classList.add('actualizada');
}

export function anunciar(mensaje: string): void {
    const aviso = document.getElementById('aviso-interfaz');
    if (aviso) aviso.textContent = mensaje;
}

let focoAnterior: HTMLElement | null = null;

export function abrirPanelEgreso(): void {
    focoAnterior = document.activeElement as HTMLElement;
    const panel = document.getElementById('modal-egreso')!;
    panel.style.display = 'flex';
    document.querySelector('.contenedor-app')!.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    document.getElementById('e_monto')!.focus();
}

export function cerrarPanelEgreso(): void {
    document.getElementById('modal-egreso')!.style.display = 'none';
    document.querySelector('.contenedor-app')!.removeAttribute('inert');
    document.body.style.overflow = '';
    focoAnterior?.focus();
}

export function iniciarPanelEgreso(): void {
    const panel = document.getElementById('modal-egreso')!;
    panel.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            evento.preventDefault();
            cerrarPanelEgreso();
        }
        if (evento.key === 'Tab') {
            const controles = Array.from(panel.querySelectorAll<HTMLElement>('input, textarea, button, select, a[href]')).filter(control => !control.hasAttribute('disabled'));
            const primero = controles[0], ultimo = controles[controles.length - 1];
            if (evento.shiftKey && document.activeElement === primero) {
                evento.preventDefault(); ultimo.focus();
            } else if (!evento.shiftKey && document.activeElement === ultimo) {
                evento.preventDefault(); primero.focus();
            }
        }
    });
}
