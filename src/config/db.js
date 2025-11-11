// Este archivo se encarga de la configuracion de la base de datos SQLite
// Define como abrir la base y como crear las tablas principales del sistema
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

// Ruta donde se guarda el archivo de la base de datos
const DB_DIR = path.join(__dirname, "..", "db");
const DB_PATH = path.join(DB_DIR, "base_de_datos.sqlite");

// Funcion para abrir la base de datos
function getDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
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
       CREATE TABLE IF NOT EXISTS alumno_carrera (
          alumno_id INTEGER,
          carrera_id INTEGER,
         PRIMARY KEY (alumno_id, carrera_id)
       )
     `);

      db.run(`
        CREATE TABLE IF NOT EXISTS periodos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
           carreraId INTEGER NOT NULL,
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


// ---------------------------------------------------------------------------
// SEED DE DATOS INICIALES - Terciario Urquiza
// ---------------------------------------------------------------------------
const SEED_SQL = `
-- ===========================================
-- CARRERAS
-- ===========================================
INSERT INTO carreras (id, nombre) VALUES
(1, 'Técnico Superior en Infraestructura de Tecnología de la Información'),
(2, 'Técnico Superior en Desarrollo de Software'),
(3, 'Técnico Superior en Análisis Funcional de Sistemas Informáticos');

-- ===========================================
-- MATERIAS
-- ===========================================
-- ITI
INSERT INTO materias (id, nombre, anio) VALUES
(1,'Comunicación',1),
(2,'UDI 1',1),
(3,'Matemática',1),
(4,'Física Aplicada a las Tecnologías de la Información',1),
(5,'Administración',1),
(6,'Inglés Técnico',1),
(7,'Arquitectura de las Computadoras',1),
(8,'Lógica y Programación',1),
(9,'Infraestructura de Redes I',1),
(10,'Problemáticas Socio Contemporáneas',2),
(11,'UDI 2',2),
(12,'Estadística',2),
(13,'Innovación y Desarrollo Emprendedor',2),
(14,'Sistemas Operativos',2),
(15,'Algoritmos y Estructura de Datos',2),
(16,'Bases de Datos',2),
(17,'Infraestructura de Redes II',2),
(18,'Práctica Profesionalizante I',2),
(19,'Ética y Responsabilidad Social',3),
(20,'Derecho y Legislación Laboral',3),
(21,'Administración de Bases de Datos',3),
(22,'Seguridad de los Sistemas',3),
(23,'Integridad y Migración de Datos',3),
(24,'Administración de Sistemas Operativos y Red',3),
(25,'Práctica Profesionalizante II',3);

-- DS
INSERT INTO materias (id, nombre, anio) VALUES
(26,'Comunicación',1),
(27,'UDI 1',1),
(28,'Matemática',1),
(29,'Inglés Técnico I',1),
(30,'Administración',1),
(31,'Tecnología de la Información',1),
(32,'Lógica y Estructura de Datos',1),
(33,'Ingeniería de Software I',1),
(34,'Sistemas Operativos',1),
(35,'Problemáticas Socio Contemporáneas',2),
(36,'UDI 2',2),
(37,'Inglés Técnico II',2),
(38,'Innovación y Desarrollo Emprendedor',2),
(39,'Estadística',2),
(40,'Programación I',2),
(41,'Ingeniería de Software II',2),
(42,'Bases de Datos I',2),
(43,'Práctica Profesionalizante I',2),
(44,'Ética y Responsabilidad Social',3),
(45,'Derecho y Legislación Laboral',3),
(46,'Redes y Comunicación',3),
(47,'Programación II',3),
(48,'Gestión de Proyectos de Software',3),
(49,'Bases de Datos II',3),
(50,'Práctica Profesionalizante II',3);

-- AF
INSERT INTO materias (id, nombre, anio) VALUES
(51,'Comunicación',1),
(52,'UDI 1',1),
(53,'Matemática',1),
(54,'Inglés Técnico I',1),
(55,'Psicosociología de las Organizaciones',1),
(56,'Modelos de Negocios',1),
(57,'Arquitectura de las Computadoras',1),
(58,'Gestión de Software I',1),
(59,'Análisis de Sistemas Organizacionales',1),
(60,'Problemáticas Socio Contemporáneas',2),
(61,'UDI 2',2),
(62,'Inglés Técnico II',2),
(63,'Estadística',2),
(64,'Innovación y Desarrollo Emprendedor',2),
(65,'Gestión de Software II',2),
(66,'Estrategias de Negocios',2),
(67,'Desarrollo de Sistemas',2),
(68,'Práctica Profesionalizante I',2),
(69,'Ética y Responsabilidad Social',3),
(70,'Derecho y Legislación Laboral',3),
(71,'Redes y Comunicaciones',3),
(72,'Seguridad de los Sistemas',3),
(73,'Bases de Datos',3),
(74,'Sistemas de Información Organizacional',3),
(75,'Desarrollo de Sistemas Web',3),
(76,'Práctica Profesionalizante II',3);

-- ===========================================
-- RELACION CARRERA-MATERIAS
-- ===========================================
-- ITI
INSERT INTO carrera_materia (carrera_id, materia_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),
(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(1,16),(1,17),(1,18),
(1,19),(1,20),(1,21),(1,22),(1,23),(1,24),(1,25);

-- DS
INSERT INTO carrera_materia (carrera_id, materia_id) VALUES
(2,26),(2,27),(2,28),(2,29),(2,30),(2,31),(2,32),(2,33),(2,34),
(2,35),(2,36),(2,37),(2,38),(2,39),(2,40),(2,41),(2,42),(2,43),
(2,44),(2,45),(2,46),(2,47),(2,48),(2,49),(2,50);

-- AF
INSERT INTO carrera_materia (carrera_id, materia_id) VALUES
(3,51),(3,52),(3,53),(3,54),(3,55),(3,56),(3,57),(3,58),(3,59),
(3,60),(3,61),(3,62),(3,63),(3,64),(3,65),(3,66),(3,67),(3,68),
(3,69),(3,70),(3,71),(3,72),(3,73),(3,74),(3,75),(3,76);

-- ===========================================
-- CORRELATIVAS OFICIALES
-- ===========================================
-- ITI
INSERT INTO correlativas (materia_id, correlativa_id) VALUES
(15,3),(15,8),
(16,8),
(14,7),
(17,9),
(21,16),
(24,17),(24,14),
(22,14),
(23,17),(23,5),
(25,18),(25,13);

-- DS
INSERT INTO correlativas (materia_id, correlativa_id) VALUES
(37,29),
(40,32),
(41,33),
(46,31),(46,34),
(47,40),
(49,42),(49,34),
(48,41),
(50,43),(50,30),(50,38);

-- AF
INSERT INTO correlativas (materia_id, correlativa_id) VALUES
(62,54),
(65,58),
(67,59),
(75,67),
(66,56),
(74,56),
(76,68),(76,64);

-- ===========================================
-- PROFESORES (SEED)
-- ===========================================
INSERT INTO profesores (id, nombre, apellido) VALUES
(1,'Marcelo','Plá'),
(2,'Dante','Roselli'),
(3,'Lucía','Fernández'),
(4,'Gabriel','Torres'),
(5,'Sofía','Márquez'),
(6,'Matías','Gómez'),
(7,'Valentina','Ríos'),
(8,'Federico','Luna'),
(9,'Mariana','Duarte'),
(10,'Tomás','Beltrán');

-- ===========================================
-- PERIODOS (SEED) - periodo de inscripcion solicitado
-- ===========================================
INSERT INTO periodos (id, carreraId, fechaInicio, fechaFin, activo, cupoLimite) VALUES
(1, 2, '2025-11-01', '2026-04-30', 1, 200); -- Ejemplo para Desarrollo de Software

-- ===========================================
-- ALUMNOS (SEED)
-- ===========================================
INSERT INTO alumnos (id, dni, nombre, apellido, email, fechaNacimiento, telefono, direccion, localidad, activo) VALUES
(1,41342897,'Fernando','Virgilio','41342897@terciariourquiza.edu.ar','1998-07-10','3416848050','Amenabar 1105','Rosario',1),
(2,21044866,'Sergio','Machado','21044866@terciariourquiza.edu.ar','1997-03-12','3416001122','Cordoba 123','Rosario',1),
(3,38136139,'Cristian','Marchetti','38136139@terciariourquiza.edu.ar','1999-11-05','3416112233','Pueyrredon 456','Rosario',1),
(4,40114865,'Lucio','Medina','40114865@terciariourquiza.edu.ar','2000-02-20','3416223344','Balcarce 789','Rosario',1),
(5,46495431,'Mateo','Merli','46495431@terciariourquiza.edu.ar','1998-09-15','3416334455','España 321','Rosario',1),
(6,36004831,'Joel','Montiel','36004831@terciariourquiza.edu.ar','1996-12-01','3416445566','Laprida 222','Rosario',1);

-- ===========================================
-- MATERIAS APROBADAS (SEED) - Desarrollo de Software (ids 26-50)
-- ===========================================
-- Fernando (id=1) -> primer año aprobado excepto UDI(27) y Matemática(28); segundo año: 40,41,42,43
INSERT INTO materias_aprobadas (id, alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES
(1,1,26,'APROBADA',8.5,'2023-06-20',2,1),
(2,1,29,'APROBADA',7.0,'2023-06-21',3,1),
(3,1,30,'APROBADA',8.0,'2023-06-22',4,1),
(4,1,31,'APROBADA',7.5,'2023-06-23',5,1),
(5,1,32,'APROBADA',8.0,'2023-06-24',6,1),
(6,1,33,'APROBADA',8.5,'2023-06-25',7,1),
(7,1,34,'APROBADA',7.0,'2023-06-26',8,1),
(8,1,40,'APROBADA',6.5,'2024-11-15',1,1),
(9,1,41,'APROBADA',7.5,'2024-11-16',2,1),
(10,1,42,'APROBADA',8.0,'2024-11-17',3,1),
(11,1,43,'APROBADA',7.0,'2024-11-18',4,1);

-- Sergio (id=2) - inventado
INSERT INTO materias_aprobadas (id, alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES
(12,2,26,'APROBADA',7.0,'2022-05-10',5,1),
(13,2,27,'APROBADA',6.5,'2022-05-11',6,1),
(14,2,29,'APROBADA',7.5,'2023-07-01',7,1),
(15,2,31,'APROBADA',8.0,'2023-07-02',8,1),
(16,2,40,'APROBADA',6.0,'2024-10-05',9,1);

-- Cristian (id=3) - inventado
INSERT INTO materias_aprobadas (id, alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES
(17,3,26,'APROBADA',6.5,'2021-12-12',3,1),
(18,3,28,'APROBADA',7.0,'2021-12-13',4,1),
(19,3,32,'APROBADA',7.8,'2022-08-20',5,1),
(20,3,33,'APROBADA',6.9,'2022-08-21',6,1);

-- Lucio (id=4) - inventado
INSERT INTO materias_aprobadas (id, alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES
(21,4,26,'APROBADA',7.2,'2023-03-03',7,1),
(22,4,29,'APROBADA',6.8,'2023-03-04',8,1);

-- Mateo (id=5) - inventado
INSERT INTO materias_aprobadas (id, alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES
(23,5,26,'APROBADA',8.1,'2022-06-10',2,1),
(24,5,30,'APROBADA',7.4,'2022-06-11',3,1),
(25,5,31,'APROBADA',7.9,'2022-06-12',4,1),
(26,5,34,'APROBADA',6.7,'2023-02-02',5,1),
(27,5,42,'APROBADA',7.0,'2024-04-04',6,1);

-- Joel (id=6) - inventado
INSERT INTO materias_aprobadas (id, alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES
(28,6,26,'APROBADA',6.5,'2021-09-09',1,1),
(29,6,27,'APROBADA',6.0,'2021-09-10',2,1),
(30,6,32,'APROBADA',7.3,'2022-11-11',3,1),
(31,6,40,'APROBADA',6.8,'2024-01-20',4,1),
(32,6,43,'APROBADA',7.1,'2024-01-21',5,1);

-- ===========================================
-- INSCRIPCIONES E INSCRIPCION_MATERIA (ejemplos históricos)
-- ===========================================
INSERT INTO inscripciones (id, fechaInscripcion, alumnoId, periodoId) VALUES
(1,'2025-11-05',1,1),
(2,'2025-11-06',2,1),
(3,'2025-11-07',3,1),
(4,'2025-11-08',4,1),
(5,'2025-11-09',5,1),
(6,'2025-11-10',6,1);

INSERT INTO inscripcion_materia (inscripcion_id, materia_id) VALUES
(1,40),(1,41),
(2,29),(2,31),
(3,32),(3,33),
(4,29),
(5,30),(5,31),
(6,40),(6,43);

-- ===========================================
-- ALUMNO - CARRERA (ASIGNACIONES)
-- ===========================================
INSERT INTO alumno_carrera (alumno_id, carrera_id) VALUES
(1,2),(2,2),(3,2),(4,2),(5,2),(6,2);
`;

function seedDB() {
  const db = getDB();
  db.get("SELECT COUNT(*) as count FROM carreras", (err, row) => {
    if (err) {
      console.error("❌ Error comprobando datos iniciales:", err);
      db.close();
      return;
    }
    if (row && row.count === 0) {
      db.exec(SEED_SQL, (err2) => {
        if (err2) console.error("❌ Error al cargar datos iniciales:", err2);
        else console.log("✅ Datos iniciales del Terciario Urquiza cargados correctamente.");
        db.close();
      });
    } else {
      db.close();
    }
  });
}

// Ejecutar la semilla tras crear tablas
inicializarDB().then(seedDB).catch(console.error);

