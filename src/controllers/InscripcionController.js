// Este archivo se encarga de manejar los pedidos para crear inscripciones
// "Controller" significa que recibe los pedidos del usuario y decide que hacer
// Usa el "servicio" para la logica de inscripciones
const InscripcionServicio = require("../servicios/InscripcionServicio"); // logica para inscripciones
const inscripcionServicio = new InscripcionServicio();

module.exports = {
  // Crea una inscripcion para un alumno en una carrera y materias
  async crear(req, res, next) {
    try {
      // El usuario manda los datos en el pedido
      const { alumnoId, carreraId, materiasIds, periodoId } = req.body;
      // Si falta algun dato importante, se avisa
      if (!alumnoId || !carreraId || !materiasIds)
        return res.status(400).json({ error: "Datos incompletos" });
      // Se crea la inscripcion usando el servicio
      const result = await inscripcionServicio.crearInscripcion({
        alumnoId,
        carreraId,
        materiasIds,
        periodoId,
      });
      // Se devuelve el resultado (inscripcion creada)
      res.json(result);
    } catch (err) {
      next(err); // Si algo sale mal, se pasa el error al ayudante de errores
    }
  },

  // Verifica si un alumno ya tiene inscripcion en un periodo
  async verificarInscripcion(req, res, next) {
    try {
      const { alumnoId, periodoId } = req.query;
      
      // Validar parametros
      if (!alumnoId || !periodoId) {
        return res.status(400).json({ error: "Faltan parámetros: alumnoId y periodoId" });
      }

      // Verificar si existe inscripcion
      const inscripcion = await inscripcionServicio.verificarInscripcionEnPeriodo(
        alumnoId, 
        periodoId
      );

      res.json({ 
        yaInscripto: !!inscripcion,
        inscripcionId: inscripcion ? inscripcion.id : null
      });
    } catch (err) {
      next(err);
    }
  },
};
