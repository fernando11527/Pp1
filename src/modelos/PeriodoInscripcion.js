// modelo PeriodoInscripcion
class PeriodoInscripcion {
  constructor({ id, fechaInicio, fechaFin, activo, cupoLimite }) {
    this.id = id || null;
    this.fechaInicio = fechaInicio || null;
    this.fechaFin = fechaFin || null;
    this.activo = !!activo;
    this.cupoLimite = cupoLimite || null;
  }
}

module.exports = PeriodoInscripcion;
