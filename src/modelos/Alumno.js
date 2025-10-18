// modelo Alumno (POJO simple)
class Alumno {
  constructor({
    id,
    dni,
    nombre,
    apellido,
    email,
    fechaNacimiento,
    telefono,
    direccion,
    localidad,
    activo,
  }) {
    this.id = id || null;
    this.dni = dni || null;
    this.nombre = nombre || null;
    this.apellido = apellido || null;
    this.email = email || null;
    this.fechaNacimiento = fechaNacimiento || null;
    this.telefono = telefono || null;
    this.direccion = direccion || null;
    this.localidad = localidad || null;
    this.activo = activo === undefined ? true : !!activo;
    this.carreras = [];
    this.inscripciones = [];
    this.materiasAprobadas = [];
  }
}

module.exports = Alumno;
