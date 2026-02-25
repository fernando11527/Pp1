// Archivo principal del servidor Express
// Este archivo inicializa la aplicacion, configura "middlewares" (ayudantes que procesan los pedidos), rutas y arranca el servidor
// Proyecto: API Node.js para gestion de inscripciones y materias (Instituto)
// Para mas detalles ver GUIA.md

// Cargar variables de entorno desde .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { inicializarDB } = require("./config/db");
// Importamos las rutas principales y de administracion
const alumnoRoutes = require("./routes/alumnos");
const carreraRoutes = require("./routes/carreras");
const inscripcionRoutes = require("./routes/inscripciones");
const adminAlumnos = require("./routes/admin/alumnos");
const adminMaterias = require("./routes/admin/materias");
const adminProfesores = require("./routes/admin/profesores");
const adminInscripciones = require("./routes/admin/inscripciones");
const adminPeriodos = require("./routes/admin/periodos");
const adminMateriasAprobadas = require("./routes/admin/materias_aprobadas");
const adminCarreras = require("./routes/admin/carreras");
const adminCorrelativas = require("./routes/admin/correlativas");
const adminResumen = require("./routes/admin/resumen");
// Ayudantes (middlewares): funciones que se ejecutan antes de llegar a la logica principal, por ejemplo para mostrar mensajes en consola (logger) o para manejar errores (errorHandler)
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const ResumenDiarioServicio = require("./servicios/ResumenDiarioServicio");

const app = express();
const PUERTO = process.env.PORT || 3000;

// Configuracion de ayudantes globales (middlewares)
// cors: permite que la aplicacion se pueda usar desde otros lugares (por ejemplo, desde el navegador)
app.use(cors());
// express.json: convierte los datos que llegan en formato JSON para que sea mas facil trabajar con ellos
app.use(express.json());
// logger: muestra mensajes en consola cada vez que alguien hace un pedido al servidor
app.use(logger);

// Rutas publicas (acceso general): aca se definen los caminos por donde llegan los pedidos de los usuarios
app.use("/api/alumnos", alumnoRoutes);
app.use("/api/carreras", carreraRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
// Rutas de administracion (solo para usuarios con permisos): aca se definen los caminos para tareas especiales, como agregar o modificar datos
app.use("/api/admin/alumnos", adminAlumnos);
app.use("/api/admin/materias", adminMaterias);
app.use("/api/admin/profesores", adminProfesores);
app.use("/api/admin/inscripciones", adminInscripciones);
app.use("/api/admin/periodos", adminPeriodos);
app.use("/api/admin/materias_aprobadas", adminMateriasAprobadas);
app.use("/api/admin/carreras", adminCarreras);
app.use("/api/admin/correlativas", adminCorrelativas);
app.use("/api/admin/resumen", adminResumen);

// Rutas publicas adicionales: mas caminos para consultar periodos y materias aprobadas
const periodosPublic = require("./routes/periodosPublic");
app.use("/api/periodos", periodosPublic);

const materiasAprobadasPublic = require("./routes/materias_aprobadas_public");
app.use("/api/materias_aprobadas", materiasAprobadasPublic);

// Ayudante para manejar errores (debe ir al final de las rutas): si algo sale mal, muestra un mensaje y no rompe todo
app.use(errorHandler);

// Handlers globales: evitan que el proceso muera ante errores no capturados
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException] El servidor siguió corriendo:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection] El servidor siguió corriendo:', reason);
});

// Inicializa la base de datos y arranca el servidor: primero prepara la base de datos y despues empieza a escuchar pedidos
inicializarDB()
  .then(() => {
    app.listen(PUERTO, () => {
      // Mensaje en consola cuando el servidor arranca correctamente
      console.log(`Servidor arrancado en http://localhost:${PUERTO}`);
      
      // Inicia el servicio de resumen diario (envia email a las 23:00 hs)
      const resumenServicio = new ResumenDiarioServicio();
      resumenServicio.iniciarCronJob();
    });
  })
  .catch((err) => {
    // Si falla la inicializacion de la DB, muestra error y termina el proceso
    console.error("No se pudo inicializar la DB", err);
    process.exit(1);
  });
