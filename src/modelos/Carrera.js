// modelo Carrera
class Carrera {
  constructor({ id, nombre }) {
    this.id = id || null;
    this.nombre = nombre || null;
    this.materias = [];
  }
}

module.exports = Carrera;
