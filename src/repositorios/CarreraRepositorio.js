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

  // Agrega una carrera nueva
  crear(nombre) {
    return this.ejecutar(`INSERT INTO carreras (nombre) VALUES (?)`, [nombre]);
  }

  // Actualiza los campos de una carrera por id
  actualizar(id, data) {
    return this.actualizarPorId('carreras', id, data);
  }

  // Elimina la relación carrera-materia y luego la carrera
  async eliminar(id) {
    await this.ejecutar(`DELETE FROM carrera_materia WHERE carrera_id = ?`, [id]);
    return this.ejecutar(`DELETE FROM carreras WHERE id = ?`, [id]);
  }

  // Asigna materias a una carrera (INSERT OR IGNORE en lote)
  asignarMaterias(carreraId, materiasIds) {
    const { getDB } = require('../config/db');
    const db = getDB();
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT OR IGNORE INTO carrera_materia (carrera_id, materia_id) VALUES (?,?)`
      );
      for (const m of materiasIds) stmt.run(carreraId, m);
      stmt.finalize(err => {
        db.close();
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = CarreraRepositorio;
