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

  // Actualiza los campos de un alumno por id
  actualizar(id, data) {
    return this.actualizarPorId('alumnos', id, data);
  }

  // Elimina un alumno por id
  eliminar(id) {
    return this.eliminarPorId('alumnos', id);
  }

  // Busca un alumno por id y adjunta materiasAprobadas, inscripciones y carreras
  async buscarConRelacionados(id) {
    const alumno = await this.obtenerPorId(id);
    if (!alumno) return null;
    alumno.materiasAprobadas = await this.listarMateriasAprobadas(id);
    alumno.inscripciones     = await this.listarInscripciones(id);
    alumno.carreras          = await this.listarCarrerasDeAlumno(id);
    return alumno;
  }

  // Materias aprobadas con nombre de materia y profesor
  listarMateriasAprobadas(alumnoId) {
    const sql = `
      SELECT ma.*,
             m.nombre AS materiaNombre,
             p.nombre AS profesorNombre,
             p.apellido AS profesorApellido
      FROM materias_aprobadas ma
      JOIN materias m ON ma.materiaId = m.id
      LEFT JOIN profesores p ON ma.profesorId = p.id
      WHERE ma.alumnoId = ?
    `;
    return this.obtenerTodos(sql, [alumnoId]);
  }

  // Inscripciones del alumno
  listarInscripciones(alumnoId) {
    const sql = `SELECT * FROM inscripciones WHERE alumnoId = ?`;
    return this.obtenerTodos(sql, [alumnoId]);
  }

  // Carreras en las que el alumno está inscripto
  listarCarrerasDeAlumno(alumnoId) {
    const sql = `
      SELECT c.id, c.nombre
      FROM alumno_carrera ac
      JOIN carreras c ON ac.carrera_id = c.id
      WHERE ac.alumno_id = ?
    `;
    return this.obtenerTodos(sql, [alumnoId]);
  }
}

module.exports = AlumnoRepositorio;
