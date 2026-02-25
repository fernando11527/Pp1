const BaseRepositorio = require('./BaseRepositorio');
const { getDB } = require('../config/db');

class CorrelativaRepositorio extends BaseRepositorio {
  listar() {
    return this.obtenerTodos(`SELECT * FROM correlativas`);
  }

  crear(materiaId, correlativaId) {
    return this.ejecutar(
      `INSERT OR IGNORE INTO correlativas (materia_id, correlativa_id) VALUES (?,?)`,
      [materiaId, correlativaId]
    );
  }

  eliminar(materiaId, correlativaId) {
    return this.ejecutar(
      `DELETE FROM correlativas WHERE materia_id = ? AND correlativa_id = ?`,
      [materiaId, correlativaId]
    );
  }
}

module.exports = CorrelativaRepositorio;
