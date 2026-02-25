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

  // Agrega una materia a una inscripción (INSERT OR IGNORE)
  agregarMateria(inscripcionId, materiaId) {
    return this.ejecutar(
      `INSERT OR IGNORE INTO inscripcion_materia (inscripcion_id, materia_id) VALUES (?,?)`,
      [inscripcionId, materiaId]
    );
  }

  // Quita una materia de una inscripción
  quitarMateria(inscripcionId, materiaId) {
    return this.ejecutar(
      `DELETE FROM inscripcion_materia WHERE inscripcion_id = ? AND materia_id = ?`,
      [inscripcionId, materiaId]
    );
  }

  // Elimina una inscripción y sus materias asociadas
  async eliminar(id) {
    await this.ejecutar(`DELETE FROM inscripcion_materia WHERE inscripcion_id = ?`, [id]);
    return this.ejecutar(`DELETE FROM inscripciones WHERE id = ?`, [id]);
  }

  // Verifica si ya existe una inscripción para el alumno en el periodo
  buscarPorAlumnoYPeriodo(alumnoId, periodoId) {
    const sql = `SELECT id FROM inscripciones WHERE alumnoId = ? AND periodoId = ? LIMIT 1`;
    return this.obtenerUno(sql, [alumnoId, periodoId]);
  }

  // Inserta las materias de una inscripción en la tabla intermedia
  agregarMaterias(inscripcionId, materiasIds) {
    const db = require('../config/db').getDB();
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO inscripcion_materia (inscripcion_id, materia_id) VALUES (?,?)`
      );
      for (const mid of materiasIds) stmt.run(inscripcionId, mid);
      stmt.finalize((err) => {
        db.close();
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = InscripcionRepositorio;
