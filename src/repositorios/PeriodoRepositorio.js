// Este archivo se encarga de guardar y buscar periodos de inscripcion en la base de datos
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
const BaseRepositorio = require("./BaseRepositorio");

class PeriodoRepositorio extends BaseRepositorio {
  // Crea la tabla de periodos si no existe
  crearTabla() {
    const sql = `
      CREATE TABLE IF NOT EXISTS periodos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        carrera_id INTEGER NOT NULL,
        fechaInicio TEXT,
        fechaFin TEXT,
        activo INTEGER DEFAULT 0,
        cupoLimite INTEGER
      )
    `;
    return this.ejecutar(sql);
  }

  // Busca el periodo que esta activo para una carrera
  obtenerActivoPorCarrera(carreraId) {
    const sql = `SELECT * FROM periodos WHERE activo = 1 AND carrera_id = ? LIMIT 1`;
    return this.obtenerUno(sql, [carreraId]);
  }

  // Busca un periodo por su ID
  obtenerPorId(id) {
    const sql = `SELECT * FROM periodos WHERE id = ?`;
    return this.obtenerUno(sql, [id]);
  }

  // Devuelve todos los periodos
  listar() {
    const sql = `SELECT * FROM periodos`;
    return this.obtenerTodos(sql);
  }
}

module.exports = PeriodoRepositorio;
