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

  // Devuelve todas las materias aprobadas
  listarTodos() {
    return this.obtenerTodos(`SELECT * FROM materias_aprobadas`);
  }

  // Busca una materia aprobada por id
  obtenerPorId(id) {
    return this.obtenerUno(`SELECT * FROM materias_aprobadas WHERE id = ?`, [id]);
  }

  // Actualiza los campos de una materia aprobada por id
  actualizar(id, data) {
    return this.actualizarPorId('materias_aprobadas', id, data);
  }

  // Elimina una materia aprobada por id
  eliminar(id) {
    return this.eliminarPorId('materias_aprobadas', id);
  }
}

module.exports = MateriaAprobadaRepositorio;
