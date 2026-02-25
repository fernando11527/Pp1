// Este archivo se encarga de la logica para los alumnos
// "Servicio" significa que hace el trabajo de buscar y armar los datos

const AlumnoRepositorio = require("../repositorios/AlumnoRepositorio"); // para buscar alumnos en la base de datos
const MateriaRepositorio = require("../repositorios/MateriaRepositorio"); // para buscar materias
const MateriaAprobada = require("../modelos/MateriaAprobada"); // modelo de materia aprobada

const alumnoRepo = new AlumnoRepositorio();
const materiaRepo = new MateriaRepositorio();

class AlumnoServicio {
  // Busca un alumno por DNI y le agrega toda la info relacionada
  async buscarPorDniConRelacionados(dni) {
    const alumno = await alumnoRepo.buscarPorDni(dni);
    if (!alumno) return null;

    const relacionados = await alumnoRepo.buscarConRelacionados(alumno.id);

    // Normalizar nombre completo del profesor en materiasAprobadas
    relacionados.materiasAprobadas = (relacionados.materiasAprobadas || []).map(ma => ({
      id: ma.id,
      materiaId: ma.materiaId,
      materiaNombre: ma.materiaNombre,
      estado: ma.estado,
      nota: ma.nota,
      fechaUltimoEstado: ma.fechaUltimoEstado,
      profesorId: ma.profesorId,
      profesorNombre: ma.profesorNombre ? `${ma.profesorNombre} ${ma.profesorApellido}` : null,
      periodoId: ma.periodoId
    }));

    return relacionados;
  }
}

module.exports = AlumnoServicio;
