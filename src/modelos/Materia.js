// modelo Materia
class Materia {
  constructor({ id, nombre, anio }) {
    this.id = id || null;
    this.nombre = nombre || null;
    this.anio = anio || null;
    this.materiasCorrelativas = []; // lista de ids o de objetos segun implementacion
  }
}

module.exports = Materia;
