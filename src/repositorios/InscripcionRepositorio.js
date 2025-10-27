// Este archivo se encarga de guardar y buscar inscripciones en la base de datos
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
const BaseRepositorio = require("./BaseRepositorio");

class InscripcionRepositorio extends BaseRepositorio {
  // Crea la tabla de inscripciones si no existe
  crearTabla() {
    const sql = `
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fechaInscripcion TEXT,
        alumnoId INTEGER,
        periodoId INTEGER
      )
    `;
    return this.ejecutar(sql);
  }

  // Agrega una inscripcion nueva a la base de datos
  crear(inscripcion) {
    const sql = `INSERT INTO inscripciones (fechaInscripcion, alumnoId, periodoId) VALUES (?,?,?)`;
    return this.ejecutar(sql, [
      inscripcion.fechaInscripcion,
      inscripcion.alumnoInscriptoId,
      inscripcion.periodoId,
    ]);
  }

  // Devuelve la lista de inscripciones de un alumno
  listarPorAlumno(alumnoId) {
    const sql = `SELECT * FROM inscripciones WHERE alumnoId = ?`;
    return this.obtenerTodos(sql, [alumnoId]);
  }

  // Busca una inscripcion por su ID
  obtenerPorId(id) {
    const sql = `SELECT * FROM inscripciones WHERE id = ?`;
    return this.obtenerUno(sql, [id]);
  }

  // Devuelve la lista de todas las inscripciones
  listarTodos() {
    const sql = `SELECT * FROM inscripciones`;
    return this.obtenerTodos(sql);
  }

  // Busca una inscripcion y le agrega la lista de materias
  async obtenerConMaterias(id) {
    const ins = await this.obtenerPorId(id);
    if (!ins) return null;
    const db = require("../config/db").getDB();
    const materias = await new Promise((resolve, reject) => {
     db.all(
        `SELECT m.id, m.nombre 
         FROM inscripcion_materia im
         JOIN materias m ON im.materia_id = m.id
         WHERE im.inscripcion_id = ?`,
        [id],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
    ins.materias = materias;
    return ins;
  }
}

module.exports = InscripcionRepositorio;
