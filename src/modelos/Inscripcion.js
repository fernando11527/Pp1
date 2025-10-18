// modelo Inscripcion
class Inscripcion {
  constructor({
    id,
    fechaInscripcion,
    alumnoInscriptoId,
    materiasInscriptas = [],
    periodoId,
  }) {
    this.id = id || null;
    this.fechaInscripcion = fechaInscripcion || new Date().toISOString();
    this.alumnoInscriptoId = alumnoInscriptoId || null;
    this.materiasInscriptas = materiasInscriptas; // array de ids
    this.periodoId = periodoId || null;
  }
}

module.exports = Inscripcion;
