// Este archivo se encarga de guardar y buscar materias aprobadas en la base de datos
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
const BaseRepositorio = require("./BaseRepositorio");

class MateriaAprobadaRepositorio extends BaseRepositorio {
  // Crea la tabla de materias aprobadas si no existe
  crearTabla() {
    const sql = `
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
    `;
    return this.ejecutar(sql);
  }

  // Agrega un registro de materia aprobada
  crear(reg) {
    const sql = `INSERT INTO materias_aprobadas (alumnoId, materiaId, estado, nota, fechaUltimoEstado, profesorId, periodoId) VALUES (?,?,?,?,?,?,?)`;
    const params = [
      reg.alumnoId,
      reg.materiaId,
      reg.estado,
      reg.nota || null,
      reg.fechaUltimoEstado || null,
      reg.profesorId || null,
      reg.periodoId || null,
    ];
    return this.ejecutar(sql, params);
  }

  // Devuelve la lista de materias aprobadas de un alumno
  listarPorAlumno(alumnoId) {
    const sql = `SELECT * FROM materias_aprobadas WHERE alumnoId = ?`;
    return this.obtenerTodos(sql, [alumnoId]);
  }
}

module.exports = MateriaAprobadaRepositorio;
