// Este archivo se encarga de enviar un resumen diario de inscripciones al instituto
// Se ejecuta automaticamente todos los dias a las 23:00 hs
// Cuenta cuantos alumnos se inscribieron por carrera en el dia

const InscripcionRepositorio = require("../repositorios/InscripcionRepositorio");
const CarreraRepositorio = require("../repositorios/CarreraRepositorio");
const PeriodoRepositorio = require("../repositorios/PeriodoRepositorio");
const EmailService = require("./EmailService");

const inscripcionRepo = new InscripcionRepositorio();
const carreraRepo = new CarreraRepositorio();
const periodoRepo = new PeriodoRepositorio();

class ResumenDiarioServicio {
  constructor() {
    this.emailService = new EmailService({});
  }

  // Obtiene las inscripciones realizadas en el dia de hoy
  async obtenerInscripcionesDelDia() {
    const todasLasInscripciones = await inscripcionRepo.listarTodos();
    
    // Filtra solo las inscripciones de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del dia
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1); // Inicio del dia siguiente
    
    const inscripcionesHoy = todasLasInscripciones.filter((ins) => {
      const fechaInscripcion = new Date(ins.fechaInscripcion);
      return fechaInscripcion >= hoy && fechaInscripcion < manana;
    });
    
    return inscripcionesHoy;
  }

  // Cuenta cuantas inscripciones hay por carrera en el dia
  async contarInscripcionesPorCarrera(inscripciones) {
    const carreras = await carreraRepo.listar();
    const periodos = await periodoRepo.listar();

    // Mapa periodoId -> carrera_id
    const periodoACarrera = {};
    periodos.forEach((p) => {
      periodoACarrera[p.id] = p.carrera_id;
    });

    // Mapa carreraId -> nombre, inicializa conteo en 0
    const carreraNombre = {};
    const conteo = {};
    carreras.forEach((c) => {
      carreraNombre[c.id] = c.nombre;
      conteo[c.nombre] = 0;
    });

    // Cuenta inscripciones por carrera via periodoId -> carrera_id
    inscripciones.forEach((ins) => {
      const carreraId = periodoACarrera[ins.periodoId];
      const nombre = carreraNombre[carreraId];
      if (nombre !== undefined) {
        conteo[nombre]++;
      }
    });

    return {
      total: inscripciones.length,
      carreras: conteo,
    };
  }

  // Calcula el acumulado de inscripciones desde que abrio el periodo
  async obtenerAcumuladoDesdeInicio() {
    const todasLasInscripciones = await inscripcionRepo.listarTodos();
    return todasLasInscripciones.length;
  }

  // Genera y envia el resumen diario al instituto
  async enviarResumenDiario() {
    try {
      console.log("[ResumenDiarioServicio] Generando resumen diario...");
      
      // Obtiene las inscripciones del dia
      const inscripcionesHoy = await this.obtenerInscripcionesDelDia();
      
      // Cuenta por carrera
      const conteo = await this.contarInscripcionesPorCarrera(inscripcionesHoy);
      
      // Obtiene acumulado total
      const acumulado = await this.obtenerAcumuladoDesdeInicio();
      
      // Arma el resumen
      const resumen = {
        fecha: new Date().toLocaleDateString("es-AR"),
        inscriptosHoy: conteo.total,
        acumuladoTotal: acumulado,
        porCarrera: conteo.carreras,
      };
      
      // Envia el email al instituto
      await this.emailService.enviarResumenDiario(resumen);
      
      console.log("[ResumenDiarioServicio] Resumen enviado correctamente");
      return resumen;
    } catch (error) {
      console.error("[ResumenDiarioServicio] Error al enviar resumen:", error);
      throw error;
    }
  }

  // Inicia el cron job para enviar el resumen todos los dias a las 21:00
  iniciarCronJob() {
    const cron = require("node-cron");
    
    // Ejecuta todos los dias a las 21:00 hs
    cron.schedule("0 21 * * *", async () => {
      console.log("[ResumenDiarioServicio] Ejecutando tarea programada...");
      await this.enviarResumenDiario();
    });
    
    console.log("[ResumenDiarioServicio] Tarea programada configurada para las 21:00 hs");
  }
}

module.exports = ResumenDiarioServicio;
