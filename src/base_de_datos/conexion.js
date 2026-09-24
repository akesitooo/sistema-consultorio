"use strict";
// src/base_de_datos/conexion.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseDeDatos = void 0;
exports.inicializarTablas = inicializarTablas;
const sqlite3_1 = __importDefault(require("sqlite3"));
exports.baseDeDatos = new sqlite3_1.default.Database('consultorio.db', (error) => {
    if (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
    }
    else {
        console.log('✅ Base de datos conectada con éxito.');
        inicializarTablas();
    }
});
function inicializarTablas() {
    exports.baseDeDatos.serialize(() => {
        exports.baseDeDatos.run(`CREATE TABLE IF NOT EXISTS pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_completo TEXT NOT NULL,
            edad INTEGER,
            sexo TEXT,
            telefono TEXT,
            email TEXT,
            historial TEXT
        )`);
        exports.baseDeDatos.run(`CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio TEXT,
            fecha_hora TEXT,
            paciente_id INTEGER,
            estudio_id TEXT,
            nombre_doctor TEXT,
            vendedor TEXT,
            subtotal REAL,
            descuento REAL,
            abono_1 REAL,
            abono_2 REAL,
            adeudo REAL,
            monto_pagado REAL,
            cambio REAL,
            metodo_pago TEXT,
            usuario_resultados TEXT,
            password_resultados TEXT
        )`);
        exports.baseDeDatos.run(`CREATE TABLE IF NOT EXISTS egresos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_hora TEXT,
            monto REAL,
            justificacion TEXT,
            usuario TEXT
        )`);
    });
}
