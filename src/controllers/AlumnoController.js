// Este archivo se encarga de manejar los pedidos relacionados con los alumnos
// "Controller" significa que recibe los pedidos del usuario y decide que hacer
// Usa los "servicios" para pedir datos y devolver respuestas

const AlumnoRepositorio = require("../repositorios/AlumnoRepositorio"); // para buscar alumnos en la base de datos
const CarreraRepositorio = require("../repositorios/CarreraRepositorio"); // para buscar carreras
const AlumnoServicio = require("../servicios/AlumnoServicio"); // logica para alumnos

const alumnoRepo = new AlumnoRepositorio();
const carreraRepo = new CarreraRepositorio();
const alumnoServicio = new AlumnoServicio();
const InscripcionServicio = require("../servicios/InscripcionServicio"); // logica para inscripciones
const inscripcionServicio = new InscripcionServicio();

module.exports = {
  // Busca un alumno por su DNI y devuelve todos sus datos relacionados
  async buscarPorDni(req, res, next) {
    try {
      const { dni } = req.body; // El usuario manda el DNI en el pedido
      if (!dni) return res.status(400).json({ error: "Falta dni" }); // Si no manda DNI, se avisa
      const alumno = await alumnoServicio.buscarPorDniConRelacionados(dni); // Se busca el alumno y sus datos
      if (!alumno)
        return res.status(404).json({ error: "Alumno no encontrado" }); // Si no existe, se avisa
      res.json(alumno); // Se devuelve el alumno encontrado
    } catch (err) {
      next(err); // Si algo sale mal, se pasa el error al ayudante de errores
    }
  },

  // Devuelve la lista de materias a las que el alumno se puede anotar
  async materiasPosibles(req, res, next) {
    try {
      const { alumnoId } = req.params; // El id del alumno viene en la direccion del pedido
      const { carreraId } = req.query; // El id de la carrera viene como pregunta
      if (!carreraId) return res.status(400).json({ error: "Falta carreraId" }); // Si falta, se avisa
      const lista = await inscripcionServicio.materiasPosiblesParaAlumno(
        Number(alumnoId),
        Number(carreraId)
      ); // Se calcula la lista de materias posibles
      res.json(lista); // Se devuelve la lista
    } catch (err) {
      next(err); // Si algo sale mal, se pasa el error al ayudante de errores
    }
  },
};
