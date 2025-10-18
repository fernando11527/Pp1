// Este archivo se encarga de guardar y buscar materias en la base de datos
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
const BaseRepositorio = require("./BaseRepositorio");

class MateriaRepositorio extends BaseRepositorio {
  // Crea la tabla de materias si no existe
  crearTabla() {
    const sql = `
      CREATE TABLE IF NOT EXISTS materias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        anio INTEGER NOT NULL
      )
    `;
    return this.ejecutar(sql);
  }

  // Devuelve la lista de materias de una carrera
  listarPorCarrera(carreraId) {
    // Usa una tabla intermedia para relacionar carreras y materias
    const sql = `
      SELECT m.* FROM materias m
      JOIN carrera_materia cm ON cm.materia_id = m.id
      WHERE cm.carrera_id = ?
    `;
    return this.obtenerTodos(sql, [carreraId]);
  }

  // Busca una materia por su ID
  obtenerPorId(id) {
    const sql = `SELECT * FROM materias WHERE id = ?`;
    return this.obtenerUno(sql, [id]);
  }

  // Agrega una materia nueva a la base de datos
  crear(materia) {
    const sql = `INSERT INTO materias (nombre, anio) VALUES (?,?)`;
    return this.ejecutar(sql, [materia.nombre, materia.anio]);
  }

  // Devuelve la lista de todas las materias
  listarTodos() {
    const sql = `SELECT * FROM materias`;
    return this.obtenerTodos(sql);
  }
}

module.exports = MateriaRepositorio;
