const BaseRepositorio = require('./BaseRepositorio');

class ProfesorRepositorio extends BaseRepositorio {
  listar() {
    return this.obtenerTodos(`SELECT * FROM profesores`);
  }

  obtenerPorId(id) {
    return this.obtenerUno(`SELECT * FROM profesores WHERE id = ?`, [id]);
  }

  crear(data) {
    return this.ejecutar(
      `INSERT INTO profesores (nombre, apellido) VALUES (?,?)`,
      [data.nombre, data.apellido]
    );
  }

  actualizar(id, data) {
    return this.actualizarPorId('profesores', id, data);
  }

  eliminar(id) {
    return this.eliminarPorId('profesores', id);
  }
}

module.exports = ProfesorRepositorio;
