// modelo PeriodoInscripcion
class PeriodoInscripcion {
  constructor({ id, carrera_id, fechaInicio, fechaFin, activo, cupoLimite }) {
    this.id = id || null;
    this.carreraId = carrera_id || null; // Mapea carrera_id de la BD a carreraId del objeto
    this.fechaInicio = fechaInicio || null;
    this.fechaFin = fechaFin || null;
    this.activo = !!activo;
    this.cupoLimite = cupoLimite || null;
  }
}

module.exports = PeriodoInscripcion;
