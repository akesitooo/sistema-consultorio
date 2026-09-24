export interface Paciente {
    id?: number;
    nombre_completo: string;
    edad: number;
    sexo: string;
    telefono: string;
    email: string;
    historial: string;
}
export interface Estudio {
    id?: number;
    nombre_estudio: string;
    categoria: 'Rayos X' | 'Ultrasonido' | 'Tomografia' | string;
    precio: number;
}
export interface Venta {
    id?: number;
    folio: string;
    fecha_hora: string;
    paciente_id: number;
    estudio_id: number;
    nombre_doctor: string;
    vendedor: string;
    subtotal: number;
    descuento: number;
    abono_1: number;
    abono_2: number;
    adeudo: number;
    monto_pagado: number;
    cambio: number;
    metodo_pago: string;
    usuario_resultados: string;
    password_resultados: string;
}
export interface Egreso {
    id?: number;
    fecha_hora: string;
    monto: number;
    justificacion: string;
    usuario: string;
}
//# sourceMappingURL=tipos.d.ts.map