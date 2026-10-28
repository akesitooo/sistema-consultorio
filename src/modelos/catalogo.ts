/** Catálogo local compartido por caja y reportes. Los identificadores históricos se conservan. */
export interface ServicioCatalogo {
    id: number;
    precio: number;
    nombre: string;
}

export const catalogoEstudios: ServicioCatalogo[] = [
    { id: 1, precio: 500, nombre: "CONSULTA GENERAL" },
    { id: 2, precio: 800, nombre: "CONSULTA CON ESPECIALISTA" },
    { id: 3, precio: 350, nombre: "RADIOGRAFÍA DE TÓRAX" },
    { id: 4, precio: 1200, nombre: "ULTRASONIDO ABDOMINAL" },
    { id: 5, precio: 250, nombre: "EXAMEN GENERAL DE ORINA" },
    { id: 6, precio: 450, nombre: "QUÍMICA SANGUÍNEA (6 ELEMENTOS)" },
    { id: 7, precio: 1500, nombre: "TOMOGRAFÍA SIMPLE" },
    { id: 8, precio: 600, nombre: "ELECTROCARDIOGRAMA" },
    { id: 9, precio: 200, nombre: "CERTIFICADO MÉDICO" },
    { id: 10, precio: 850, nombre: "PERFIL DE LÍPIDOS" }
];
