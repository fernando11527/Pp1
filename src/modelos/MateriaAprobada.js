// Este archivo es el modelo de MateriaAprobada
// Representa el historial y estado de un alumno en una materia
// Los estados posibles son:
// - APROBADA: el alumno aprobo la materia (no puede inscribirse nuevamente)
// - INSCRIPTO: el alumno esta inscripto actualmente (no puede inscribirse nuevamente)
// - REGULAR: el alumno esta cursando o es regular (no puede inscribirse nuevamente)
// - CURSANDO: el alumno esta cursando actualmente (no puede inscribirse nuevamente)
// - LIBRE: el alumno esta libre en la materia (puede inscribirse nuevamente)

class MateriaAprobada {
  constructor({
    id,
    alumnoId,
    materiaId,
    estado,
    nota,
    fechaUltimoEstado,
    profesorId,
    periodoId,
  }) {
    this.id = id || null;
    this.alumnoId = alumnoId || null;
    this.materiaId = materiaId || null;
    this.estado = estado || null; // APROBADA, INSCRIPTO, REGULAR, CURSANDO, LIBRE
    this.nota = nota || null;
    this.fechaUltimoEstado = fechaUltimoEstado || null;
    this.profesorId = profesorId || null;
    this.periodoId = periodoId || null;
  }
}

module.exports = MateriaAprobada;
