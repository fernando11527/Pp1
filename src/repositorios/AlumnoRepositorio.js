// Este archivo se encarga de guardar y buscar alumnos en la base de datos
// "Repositorio" significa que hace el trabajo de hablar con la base de datos
const BaseRepositorio = require("./BaseRepositorio");

class AlumnoRepositorio extends BaseRepositorio {
  // Crea la tabla de alumnos si no existe
  crearTabla() {
    const sql = `
      CREATE TABLE IF NOT EXISTS alumnos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dni INTEGER UNIQUE NOT NULL,
        nombre TEXT,
        apellido TEXT,
        email TEXT,
        fechaNacimiento TEXT,
        telefono TEXT,
        direccion TEXT,
        localidad TEXT,
        activo INTEGER DEFAULT 1
      )
    `;
    return this.ejecutar(sql);
  }

  // Agrega un alumno nuevo a la base de datos
  crear(alumno) {
    const sql = `INSERT INTO alumnos (dni, nombre, apellido, email, fechaNacimiento, telefono, direccion, localidad, activo) VALUES (?,?,?,?,?,?,?,?,?)`;
    const params = [
      alumno.dni,
      alumno.nombre,
      alumno.apellido,
      alumno.email,
      alumno.fechaNacimiento,
      alumno.telefono,
      alumno.direccion,
      alumno.localidad,
      alumno.activo ? 1 : 0,
    ];
    return this.ejecutar(sql, params);
  }

  // Busca un alumno por su DNI
  buscarPorDni(dni) {
    const sql = `SELECT * FROM alumnos WHERE dni = ?`;
    return this.obtenerUno(sql, [dni]);
  }

  // Busca un alumno por su ID
  obtenerPorId(id) {
    const sql = `SELECT * FROM alumnos WHERE id = ?`;
    return this.obtenerUno(sql, [id]);
  }

  // Devuelve la lista de todos los alumnos
  listar() {
    const sql = `SELECT * FROM alumnos`;
    return this.obtenerTodos(sql);
  }
}

module.exports = AlumnoRepositorio;
