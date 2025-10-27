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
    const alumno = await alumnoRepo.buscarPorDni(dni); // Busca el alumno en la base
    if (!alumno) return null; // Si no existe, devuelve nada

    // Trae las materias que el alumno aprobo
   const sql = `
      SELECT ma.*, 
             m.nombre AS materiaNombre, 
             p.nombre AS profesorNombre, 
             p.apellido AS profesorApellido
      FROM materias_aprobadas ma
      JOIN materias m ON ma.materiaId = m.id
      LEFT JOIN profesores p ON ma.profesorId = p.id
      WHERE ma.alumnoId = ?
    `;
    const db = require("../config/db").getDB();
    const materiasAprobadas = await new Promise((resolve, reject) => {
      db.all(sql, [alumno.id], (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
    alumno.materiasAprobadas = materiasAprobadas.map(ma => ({
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

    // Trae las inscripciones del alumno
    const sql2 = `SELECT * FROM inscripciones WHERE alumnoId = ?`;
    const db2 = require("../config/db").getDB();
    const inscripciones = await new Promise((resolve, reject) => {
      db2.all(sql2, [alumno.id], (err, rows) => {
        db2.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
    alumno.inscripciones = inscripciones;

     // Trae solo las carreras en las que el alumno está inscripto
    const sql3 = `
      SELECT c.id, c.nombre
      FROM alumno_carrera ac
      JOIN carreras c ON ac.carrera_id = c.id
      WHERE ac.alumno_id = ?
    `;
    const db3 = require("../config/db").getDB();
    const carreras = await new Promise((resolve, reject) => {
      db3.all(sql3, [alumno.id], (err, rows) => {
        db3.close();
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
    alumno.carreras = carreras;

    return alumno; // Devuelve el alumno con toda la info
  }
}

module.exports = AlumnoServicio;
