// modelo Profesor
class Profesor {
  constructor({ id, nombre, apellido }) {
    this.id = id || null;
    this.nombre = nombre || null;
    this.apellido = apellido || null;
  }
}

module.exports = Profesor;
