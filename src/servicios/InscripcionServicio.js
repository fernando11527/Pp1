// Este archivo se encarga de la logica para las inscripciones
// "Servicio" significa que hace el trabajo de validar y crear inscripciones, y calcular materias posibles

const InscripcionRepositorio = require("../repositorios/InscripcionRepositorio"); // para guardar y buscar inscripciones
const PeriodoRepositorio = require("../repositorios/PeriodoRepositorio"); // para buscar periodos
const MateriaRepositorio = require("../repositorios/MateriaRepositorio"); // para buscar materias
const MateriaAprobadaRepo = require("../repositorios/MateriaAprobadaRepositorio"); // para guardar materias aprobadas
const EmailService = require("./EmailService"); // para enviar emails

const inscripcionRepo = new InscripcionRepositorio();
const periodoRepo = new PeriodoRepositorio();
const materiaRepo = new MateriaRepositorio();
const materiaAprobadaRepo = new MateriaAprobadaRepo();

class InscripcionServicio {
  constructor() {
    this.emailService = new EmailService({}); // Prepara el servicio de email
  }

  // Calcula las materias a las que el alumno se puede anotar
  async materiasPosiblesParaAlumno(alumnoId, carreraId) {

    if (!/^\d+$/.test(String(alumnoId))) {
      throw { status: 400, message: "ID de alumno inválido. Debe ser numérico." };
    }
    if (!/^\d+$/.test(String(carreraId))) {
      throw { status: 400, message: "ID de carrera inválido. Debe ser numérico." };
    }
    // Trae las materias de la carrera
    const materias = await materiaRepo.listarPorCarrera(carreraId);

    // Trae todas las materias aprobadas del alumno (con sus estados)
    const materiasAlumno = await materiaAprobadaRepo.listarPorAlumno(alumnoId);

    // Separa las materias por estado
    const aprobadasIds = new Set(); // Materias que el alumno ya aprobo
    const noPuedeInscribirseIds = new Set(); // Materias donde NO puede inscribirse

    materiasAlumno.forEach((ma) => {
      if (ma.estado === "APROBADA") {
        // Si esta aprobada, no se puede anotar nuevamente
        aprobadasIds.add(ma.materiaId);
        noPuedeInscribirseIds.add(ma.materiaId);
      } else if (ma.estado === "INSCRIPTO" || ma.estado === "REGULAR" || ma.estado === "CURSANDO") {
        // Si esta inscripto, regular o cursando, tampoco puede inscribirse
        noPuedeInscribirseIds.add(ma.materiaId);
      }
      // Si esta LIBRE, puede inscribirse nuevamente
    });

    // Para cada materia de la carrera, revisa si el alumno puede anotarse
    const posibles = [];
    for (const m of materias) {
      // Verifica si NO esta aprobada ni cursando/regular/inscripto
      if (noPuedeInscribirseIds.has(m.id)) {
        continue; // No puede anotarse, sigue con la siguiente
      }

      // Verifica si cumple con las correlativas
      const correlativas = await this.obtenerCorrelativasRecursivas(m.id);
      const cumpleCorrelativas = correlativas.every((c) => aprobadasIds.has(c));

      if (cumpleCorrelativas) {
        posibles.push(m); // Si cumple todo, la agrega a la lista
      }
    }
    return posibles; // Devuelve la lista de materias posibles
  }

  // Busca todas las correlativas de una materia (recursivo, para evitar bucles)
  async obtenerCorrelativasRecursivas(materiaId, visitados = new Set()) {
    if (visitados.has(materiaId)) return []; // Si ya la reviso, no repite
    visitados.add(materiaId);
    const db = require("../config/db").getDB();
    const sql = `SELECT correlativa_id FROM correlativas WHERE materia_id = ?`;
    const filas = await new Promise((resolve, reject) => {
      db.all(sql, [materiaId], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
    let resultado = [];
    for (const f of filas) {
      const id = f.correlativa_id;
      resultado.push(id);
      const sub = await this.obtenerCorrelativasRecursivas(id, visitados);
      resultado = resultado.concat(sub); // Agrega las correlativas de las correlativas
    }
    return resultado;
  }

  // Crea una inscripcion para un alumno en una carrera y materias
  async crearInscripcion({ alumnoId, carreraId, materiasIds, periodoId }) {
    // Valida que el periodo exista y este activo
    const periodo = periodoId
      ? await periodoRepo.obtenerPorId(periodoId)
      : await periodoRepo.obtenerActivo();
    if (!periodo || periodo.activo !== 1)
      throw { status: 400, message: "No existe periodo activo" };

    // Valida que la fecha sea correcta
    const ahora = new Date();
    const inicio = new Date(periodo.fechaInicio);
    const fin = new Date(periodo.fechaFin);
    if (ahora < inicio || ahora > fin)
      throw { status: 400, message: "Fuera de fechas del periodo" };

    // Valida que las materias sean posibles para el alumno
    const posibles = await this.materiasPosiblesParaAlumno(alumnoId, carreraId);
    const posiblesIds = new Set(posibles.map((p) => p.id));
    for (const id of materiasIds) {
      if (!posiblesIds.has(id))
        throw {
          status: 400,
          message: `Materia ${id} no valida para inscripcion`,
        };
    }

    // Crea la inscripcion en la base de datos
    const inscripcion = {
      fechaInscripcion: new Date().toISOString(),
      alumnoInscriptoId: alumnoId,
      periodoId,
    };
    const inscripcionId = await inscripcionRepo.crear(inscripcion);

    // Agrega las materias a la inscripcion
    const db = require("../config/db").getDB();
    await new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO inscripcion_materia (inscripcion_id, materia_id) VALUES (?,?)`
      );
      for (const mid of materiasIds) stmt.run(inscripcionId, mid);
      stmt.finalize((err) => {
        db.close();
        if (err) return reject(err);
        resolve();
      });
    });

    // Crea el registro de MateriaAprobada con estado INSCRIPTO para cada materia
    for (const mid of materiasIds) {
      await materiaAprobadaRepo.crear({
        alumnoId,
        materiaId: mid,
        estado: "INSCRIPTO",
        fechaUltimoEstado: new Date().toISOString(),
      });
    }

    // Envia un email avisando la inscripcion (no bloquea si falla)
    try {
      const AlumnoRepositorio = require("../repositorios/AlumnoRepositorio");
      const alumnoRepoInstance = new AlumnoRepositorio();
      const alumno = await alumnoRepoInstance.obtenerPorId(alumnoId);
      await this.emailService.enviarEmailInscripcion({
        alumno: alumno || { email: null },
        inscripcion: { id: inscripcionId },
        materias: materiasIds,
      });
    } catch (e) {
      console.error("Error al enviar email de inscripcion:", e);
    }

    // Devuelve la inscripcion completa con materias, alumno y periodo
    const inscripcionCompleta = await inscripcionRepo.obtenerConMaterias(
      inscripcionId
    );
    const AlumnoRepositorio = require("../repositorios/AlumnoRepositorio");
    const alumnoObj = await new AlumnoRepositorio().obtenerPorId(alumnoId);
    const periodoObj = await periodoRepo.obtenerPorId(
      periodoId || inscripcionCompleta.periodoId
    );

    return {
      inscripcion: inscripcionCompleta,
      alumno: alumnoObj,
      periodo: periodoObj,
    };
  }
}

module.exports = InscripcionServicio;
