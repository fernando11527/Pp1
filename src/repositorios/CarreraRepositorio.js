// Este archivo se encarga de guardar y buscar carreras en la base de datos
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
const BaseRepositorio = require("./BaseRepositorio");

class CarreraRepositorio extends BaseRepositorio {
  // Crea la tabla de carreras si no existe
  crearTabla() {
    const sql = `
      CREATE TABLE IF NOT EXISTS carreras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
      )
    `;
    return this.ejecutar(sql);
  }

  // Devuelve la lista de todas las carreras
  listar() {
    const sql = `SELECT * FROM carreras`;
    return this.obtenerTodos(sql);
  }

  // Busca una carrera por su ID
  obtenerPorId(id) {
    const sql = `SELECT * FROM carreras WHERE id = ?`;
    return this.obtenerUno(sql, [id]);
  }
}

module.exports = CarreraRepositorio;
