// Este archivo es la base para todos los repositorios
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
// Esta clase tiene funciones para guardar y buscar datos usando sqlite
const { getDB } = require("../config/db");

class BaseRepositorio {
  // Ejecuta una consulta para guardar datos (como agregar o modificar)
  ejecutar(sql, params = []) {
    const db = getDB();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          db.close();
          return reject(err);
        }
        const lastID = this.lastID;
        db.close();
        resolve(lastID); // Devuelve el id del ultimo dato guardado
      });
    });
  }

  // Busca todos los datos que cumplen con la consulta
  obtenerTodos(sql, params = []) {
    const db = getDB();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows); // Devuelve la lista de resultados
      });
    });
  }

  // Busca un solo dato que cumple con la consulta
  obtenerUno(sql, params = []) {
    const db = getDB();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row); // Devuelve el resultado encontrado
      });
    });
  }
}

module.exports = BaseRepositorio;
