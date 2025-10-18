// Este archivo se encarga de la configuracion de la base de datos SQLite
// Define como abrir la base y como crear las tablas principales del sistema
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Ruta donde se guarda el archivo de la base de datos
const DB_PATH = path.join(__dirname, "..", "db", "base_de_datos.sqlite");

// Funcion para abrir la base de datos
function getDB() {
  const db = new sqlite3.Database(DB_PATH);
  return db;
}

// Funcion para crear las tablas principales si no existen
function inicializarDB() {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.serialize(() => {
      // Crear tablas basicas del sistema (alumnos, carreras, materias, etc)
      db.run(`
        CREATE TABLE IF NOT EXISTS alumnos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          dni INTEGER UNIQUE NOT NULL,
          nombre TEXT,
          apellido TEXT,
          email TEXT,
          fechaNacimiento TEXT,
          telefono TEXT,
          direccion TEXT,
          localidad TEXT,
          activo INTEGER DEFAULT 1
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS carreras (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS materias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          anio INTEGER NOT NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS carrera_materia (
          carrera_id INTEGER,
          materia_id INTEGER,
          PRIMARY KEY (carrera_id, materia_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS correlativas (
          materia_id INTEGER,
          correlativa_id INTEGER,
          PRIMARY KEY (materia_id, correlativa_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS periodos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fechaInicio TEXT,
          fechaFin TEXT,
          activo INTEGER DEFAULT 0,
          cupoLimite INTEGER
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS inscripciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fechaInscripcion TEXT,
          alumnoId INTEGER,
          periodoId INTEGER
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS inscripcion_materia (
          inscripcion_id INTEGER,
          materia_id INTEGER,
          PRIMARY KEY (inscripcion_id, materia_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS materias_aprobadas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          alumnoId INTEGER,
          materiaId INTEGER,
          estado TEXT,
          nota REAL,
          fechaUltimoEstado TEXT,
          profesorId INTEGER,
          periodoId INTEGER
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS profesores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT,
          apellido TEXT
        )
      `);

      // Cuando termina de crear las tablas, cierra la base y resuelve
      db.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

module.exports = { getDB, inicializarDB };
