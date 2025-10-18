# GUIA DEL PROYECTO - API Node.js (OOP) con SQLite

## Resumen rapido

Proyecto: API en Node.js usando programacion orientada a objetos. Base de datos: SQLite.

## Pasos

1. Preparacion

- Instalar Node.js LTS
- Verificar con `node -v` y `npm -v`

2. Inicializar proyecto

- Simplemente ejecuta: `npm install`
- Esto instala todas las dependencias declaradas en package.json

3. Estructura

- src/
  - config/
  - db/
  - modelos/
  - repositorios/
  - servicios/
  - controllers/
  - routes/
  - middlewares/
  - index.js

## Resumen del dominio

Entidades principales:

- Alumno:

  - id: integer
  - dni: integer
  - nombre: string
  - apellido: string
  - email: string
  - fechaNacimiento: date
  - telefono: string
  - direccion: string
  - localidad: string
  - activo: boolean
  - carreras: list<Carrera>
  - inscripciones: list<Inscripcion>
  - materiasAprobadas: list<MateriaAprobada>

- Carrera:

  - id: integer
  - nombre: string
  - materias: list<Materia>

- Materia:

  - id: integer
  - nombre: string
  - anio: integer
  - materiasCorrelativas: list<Materia> (referencias recursivas)

- Inscripcion:

  - id: integer
  - fechaInscripcion: date
  - alumnoInscripto: Alumno (id)
  - materiasInscriptas: list<Materia> (ids)
  - periodo: PeriodoInscripcion (id)

- MateriaAprobada:

  - id: integer
  - alumno: Alumno (id)
  - materia: Materia (id)
  - estado: enum (APROBADA, INSCRIPTO, REGULAR, CURSANDO, LIBRE)
    - APROBADA: alumno aprobo la materia (no puede inscribirse nuevamente)
    - INSCRIPTO: alumno inscripto actualmente (no puede inscribirse nuevamente)
    - REGULAR: alumno es regular en la materia (no puede inscribirse nuevamente)
    - CURSANDO: alumno esta cursando (no puede inscribirse nuevamente)
    - LIBRE: alumno esta libre (puede inscribirse nuevamente si cumple correlativas)
  - nota: float
  - fechaUltimoEstado: date
  - profesor: Profesor (id)
  - periodo: PeriodoInscripcion (id)

- PeriodoInscripcion:

  - id: integer
  - fechaInicio: date
  - fechaFin: date
  - activo: boolean
  - cupoLimite: integer

- Profesor:
  - id: integer
  - nombre: string
  - apellido: string

## Flujo completo de inscripcion (logica detallada)

### Paso 1: Buscar alumno por DNI
El alumno ingresa su DNI en el frontend. El frontend envia el DNI al endpoint:
- **POST /api/alumnos/buscar-dni** con body: `{ dni: 12345678 }`
- Backend busca en la base de datos si existe el alumno
- Si existe, devuelve el alumno completo con:
  - Datos personales (nombre, apellido, email, etc)
  - Lista de carreras a las que pertenece
  - Lista de materias aprobadas (con estados: APROBADA, INSCRIPTO, REGULAR, CURSANDO, LIBRE)
  - Lista de inscripciones previas
- Si no existe, devuelve error 404

### Paso 2: Seleccionar carrera y verificar periodo
El alumno selecciona una carrera de las que tiene disponibles. El frontend:
- Envia el **idCarrera** al endpoint **GET /api/periodos/activo** para verificar si hay periodo vigente
- Backend verifica:
  - Que exista un periodo con `activo = 1`
  - Que la fecha actual este entre `fechaInicio` y `fechaFin`
- Si NO hay periodo activo o la fecha esta fuera de rango, se muestra mensaje: "No hay periodo de inscripcion actualmente"
- Si hay periodo valido, el frontend solicita las materias de esa carrera:
  - **GET /api/carreras/:id/materias**
  - Backend devuelve todas las materias de la carrera con sus correlativas
  - Frontend muestra todas las materias en estado "Disabled" (deshabilitadas)

### Paso 3: Calcular materias habilitadas para el alumno
El frontend envia el **idAlumno** y el **idCarrera** al endpoint:
- **GET /api/alumnos/:alumnoId/materias-posibles?carreraId=xx**
- Backend realiza las siguientes validaciones para cada materia:

  **a) Verificar si NO esta aprobada:**
  - Si el alumno tiene la materia con estado "APROBADA", NO puede anotarse nuevamente
  
  **b) Verificar si NO esta cursando/inscripto/regular:**
  - Si el alumno tiene la materia con estado "INSCRIPTO", "REGULAR" o "CURSANDO", NO puede anotarse
  - Si el alumno tiene la materia con estado "LIBRE", SI puede anotarse nuevamente
  
  **c) Verificar correlativas:**
  - Si la materia tiene correlativas, verifica que el alumno tenga TODAS aprobadas
  - Si la materia NO tiene correlativas, puede anotarse (cumpliendo a y b)

- Backend devuelve la lista de materias en las que el alumno SI puede inscribirse
- Frontend habilita solo esas materias (cambian de "Disabled" a "Enabled")

### Paso 4: Crear inscripcion
El alumno selecciona las materias habilitadas y confirma. El frontend envia:
- **POST /api/inscripciones** con body: `{ alumnoId, carreraId, materiasIds: [1,2,3], periodoId }`
- Backend vuelve a validar TODO (por seguridad):
  - Periodo activo y fechas validas
  - Materias posibles para el alumno (mismo calculo del paso 3)
  - Si alguna materia NO es valida, devuelve error 400
- Si todo es correcto:
  - Crea el registro de Inscripcion en la base de datos
  - Asocia las materias a la inscripcion (tabla intermedia)
  - Crea registros en MateriaAprobada con estado "INSCRIPTO" para cada materia
  - Devuelve la inscripcion creada con todos los datos

### Paso 5: Enviar email de confirmacion
Despues de crear la inscripcion exitosamente:
- Backend envia email al correo del alumno con los detalles de la inscripcion
- Backend envia copia al correo institucional (configurable via variable EMAIL_INSTITUCIONAL)
- Si el envio de email falla, solo se registra el error pero NO se cancela la inscripcion
- Frontend muestra mensaje de exito al alumno

**Nota:** Por ahora el EmailService es un mock (simula el envio). Mas adelante se puede integrar con nodemailer o un servicio real de correos.

### Paso 6: Resumen diario automatico
Al finalizar cada dia (23:00 hs), el sistema:
- Cuenta automaticamente las inscripciones realizadas en el dia
- Genera un resumen con:
  - Cantidad de inscriptos del dia
  - Cantidad acumulada total desde apertura del periodo
  - Desglose por carrera (si aplica)
- Envia email al correo institucional con el resumen
- Permite al equipo directivo evaluar si continua o cierra la inscripcion

**Implementacion tecnica:**
- Usa `node-cron` para programar tarea diaria a las 23:00
- Servicio: `ResumenDiarioServicio.js`
- Se inicia automaticamente al arrancar el servidor

## Reglas de negocio importantes

- **Periodo activo:** No se puede inscribir fuera de un PeriodoInscripcion activo y dentro de las fechas (fechaInicio y fechaFin).
- **Alumno existente:** Validar que el alumno exista por DNI antes de continuar.
- **Materias ya aprobadas:** No se puede inscribir a una materia que el alumno ya tiene APROBADA.
- **Materias en curso:** No se puede inscribir a una materia donde el alumno este INSCRIPTO, REGULAR o CURSANDO actualmente.
- **Materias libres:** Si el alumno esta LIBRE en una materia, puede inscribirse nuevamente (si cumple las correlativas).
- **Correlativas:** No se puede inscribir si falta alguna correlativa aprobada (a menos que la materia no tenga correlativas).
- **Cupo limite:** No se puede superar el cupoLimit del periodo para una materia si se aplica (funcionalidad pendiente).
- **Transaccionalidad:** Validar todo antes de persistir para mantener consistencia en la base de datos.

## Endpoints propuestos (REST)

- POST /api/alumnos/buscar-dni

  - body: { dni }
  - devuelve: Alumno completo (incluye carreras, materiasAprobadas, inscripciones)

- GET /api/carreras

  - devuelve: lista de Carreras

- GET /api/carreras/:id/materias

  - devuelve: lista de Materias de la carrera (incluye correlativas como ids)

- GET /api/alumnos/:alumnoId/materias-posibles?carreraId=xx

  - calcula y devuelve lista de Materias a las que el alumno puede anotarse ahora

- POST /api/inscripciones

  - body: { alumnoId, carreraId, materiasIds: [1,2,3], periodoId }
  - valida, crea Inscripcion y devuelve la Inscripcion creada

- GET /api/periodos/activo

  - devuelve: PeriodoInscripcion activo (si existe)

- POST /api/materias-aprobadas
  - body: { alumnoId, materiaId, estado, nota?, profesorId?, periodoId? }
  - para registrar historial de materias aprobadas o cambios de estado

## Contrato tecnico rapido

- Backend en Node.js con Express.
- Estructura por capas: modelos, repositorios (DB), servicios (logica), controllers (HTTP), routes.
- Base de datos: SQLite (archivos .sqlite en `src/db/`).
- Usar consultas SQL simples; evitar ORMs para que sea didactico.

## Casos borde y validaciones

- DNI no encontrado -> 404 o respuesta vacia segun UX.
- Materias con correlativas recursivas -> hacer recorrido y evitar bucles (marcar visitados).
- Periodo no activo o fuera de fecha -> 400 con mensaje.
- Cupo completo -> 400 con mensaje.

## Variables de configuracion

- EMAIL_INSTITUCIONAL (env) -> correo donde enviar copia de inscripcion

## Como probar la API (ejecutar comandos)

Para probar los endpoints de la API, tenes varias opciones:

### Opcion 1: Usar curl desde la terminal (Windows PowerShell, CMD, Git Bash)
```bash
# Ejemplo basico
curl http://localhost:3000/api/carreras
```

### Opcion 2: Usar Postman 
- Descargar Postman: https://www.postman.com/downloads/
- Crear una nueva request
- Seleccionar el metodo (GET, POST, PUT, DELETE)
- Poner la URL del endpoint
- En el caso de POST/PUT, agregar el body en formato JSON

**Importante:** El servidor debe estar corriendo antes de probar (`npm start`)

---

## Ejemplos completos de ABM (Crear, Leer, Actualizar, Eliminar)

### ABM de Alumnos

- Listar todos los alumnos:

```bash
curl http://localhost:3000/api/admin/alumnos
```

- Crear un alumno:

```bash
curl -X POST http://localhost:3000/api/admin/alumnos -H "Content-Type: application/json" -d "{\"dni\":12345678,\"nombre\":\"Juan\",\"apellido\":\"Perez\",\"email\":\"juan@mail.com\",\"fechaNacimiento\":\"2000-05-15\",\"telefono\":\"1234567890\",\"direccion\":\"Calle Falsa 123\",\"localidad\":\"Buenos Aires\",\"activo\":1}"
```

- Obtener un alumno por ID:

```bash
curl http://localhost:3000/api/admin/alumnos/1
```

- Actualizar un alumno:

```bash
curl -X PUT http://localhost:3000/api/admin/alumnos/1 -H "Content-Type: application/json" -d "{\"telefono\":\"9876543210\",\"email\":\"juan.perez@mail.com\"}"
```

- Eliminar un alumno:

```bash
curl -X DELETE http://localhost:3000/api/admin/alumnos/1
```

---

### ABM de Carreras

- Listar todas las carreras:

```bash
curl http://localhost:3000/api/carreras
```

- Crear una carrera:

```bash
curl -X POST http://localhost:3000/api/admin/carreras -H "Content-Type: application/json" -d "{\"nombre\":\"Desarrollo de Software\"}"
```

- Obtener una carrera por ID:

```bash
curl http://localhost:3000/api/admin/carreras/1
```

- Actualizar una carrera:

```bash
curl -X PUT http://localhost:3000/api/admin/carreras/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Tec. Desarrollo de Software\"}"
```

- Eliminar una carrera:

```bash
curl -X DELETE http://localhost:3000/api/admin/carreras/1
```

- Asignar materias a una carrera:

```bash
curl -X POST http://localhost:3000/api/admin/carreras/1/materias -H "Content-Type: application/json" -d "{\"materiasIds\":[1,2,3]}"
```

**Nota:** Esto crea la relacion entre una carrera y sus materias. Por ejemplo, si creas la carrera "Desarrollo de Software" (id=1) y las materias "Matematica" (id=1), "Programacion" (id=2), "Base de Datos" (id=3), este comando vincula esas materias a la carrera.

---

### ABM de Materias

- Listar todas las materias:

```bash
curl http://localhost:3000/api/admin/materias
```

- Crear una materia:

```bash
curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Programacion I\",\"anio\":1}"
```

- Obtener una materia por ID:

```bash
curl http://localhost:3000/api/admin/materias/1
```

- Actualizar una materia:

```bash
curl -X PUT http://localhost:3000/api/admin/materias/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Programacion Orientada a Objetos\",\"anio\":2}"
```

- Eliminar una materia:

```bash
curl -X DELETE http://localhost:3000/api/admin/materias/1
```

---

### ABM de Profesores

- Listar todos los profesores:

```bash
curl http://localhost:3000/api/admin/profesores
```

- Crear un profesor:

```bash
curl -X POST http://localhost:3000/api/admin/profesores -H "Content-Type: application/json" -d "{\"nombre\":\"Carlos\",\"apellido\":\"Rodriguez\"}"
```

- Obtener un profesor por ID:

```bash
curl http://localhost:3000/api/admin/profesores/1
```

- Actualizar un profesor:

```bash
curl -X PUT http://localhost:3000/api/admin/profesores/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Carlos Alberto\",\"apellido\":\"Rodriguez\"}"
```

- Eliminar un profesor:

```bash
curl -X DELETE http://localhost:3000/api/admin/profesores/1
```

**Ejemplo de uso:** Primero creas los profesores, luego cuando registras una materia aprobada, podes asignar el ID del profesor que dicto la materia.

---

### ABM de Correlativas

Las correlativas definen que materias son requisito previo para otras materias.

- Listar todas las correlativas:

```bash
curl http://localhost:3000/api/admin/correlativas
```

- Crear una correlativa (ejemplo: "Programacion II" requiere "Programacion I"):

```bash
curl -X POST http://localhost:3000/api/admin/correlativas -H "Content-Type: application/json" -d "{\"materiaId\":2,\"correlativaId\":1}"
```

**Explicacion:** Si "Programacion I" tiene id=1 y "Programacion II" tiene id=2, este comando indica que para cursar "Programacion II" (materiaId=2) primero hay que aprobar "Programacion I" (correlativaId=1).

- Eliminar una correlativa:

```bash
curl -X DELETE http://localhost:3000/api/admin/correlativas -H "Content-Type: application/json" -d "{\"materiaId\":2,\"correlativaId\":1}"
```

**Ejemplo completo de setup:**
```bash
# 1. Crear materias
curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Matematica I\",\"anio\":1}"
# Respuesta: {"id":1}

curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Programacion I\",\"anio\":1}"
# Respuesta: {"id":2}

curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Programacion II\",\"anio\":2}"
# Respuesta: {"id":3}

# 2. Crear correlativa: Programacion II requiere Programacion I
curl -X POST http://localhost:3000/api/admin/correlativas -H "Content-Type: application/json" -d "{\"materiaId\":3,\"correlativaId\":2}"
```

---

### ABM de Inscripciones

- Listar todas las inscripciones:

```bash
curl http://localhost:3000/api/admin/inscripciones
```

- Crear una inscripcion manualmente (admin):

```bash
curl -X POST http://localhost:3000/api/admin/inscripciones -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"periodoId\":1,\"materiasIds\":[1,2]}"
```

- Obtener una inscripcion con sus materias:

```bash
curl http://localhost:3000/api/admin/inscripciones/1
```

- Eliminar una inscripcion:

```bash
curl -X DELETE http://localhost:3000/api/admin/inscripciones/1
```

**Nota:** La creacion de inscripciones normalmente se hace por el endpoint publico `/api/inscripciones` que valida todo automaticamente. Este endpoint de admin es para casos especiales donde se necesita crear una inscripcion manualmente.

### ABM de Periodos de Inscripcion

- Listar todos los periodos:

```bash
curl http://localhost:3000/api/admin/periodos
```

- Crear un periodo:

```bash
curl -X POST http://localhost:3000/api/admin/periodos -H "Content-Type: application/json" -d "{\"fechaInicio\":\"2025-11-01\",\"fechaFin\":\"2025-12-01\",\"activo\":1,\"cupoLimite\":100}"
```

**Explicacion de campos:**
- `fechaInicio`: fecha de apertura de inscripciones (formato: YYYY-MM-DD)
- `fechaFin`: fecha de cierre de inscripciones
- `activo`: 1 = periodo activo, 0 = periodo inactivo
- `cupoLimite`: cantidad maxima de inscriptos permitidos

- Actualizar un periodo (ejemplo: desactivar):

```bash
curl -X PUT http://localhost:3000/api/admin/periodos/1 -H "Content-Type: application/json" -d "{\"activo\":0}"
```

- Eliminar un periodo:

```bash
curl -X DELETE http://localhost:3000/api/admin/periodos/1
```

**Importante:** Solo puede haber un periodo activo a la vez. Si creas un nuevo periodo activo, deberias desactivar el anterior primero.

### ABM de Materias Aprobadas

- Listar materias aprobadas de un alumno:

```bash
curl "http://localhost:3000/api/admin/materias_aprobadas?alumnoId=1"
```

- Crear un registro de materia aprobada:

```bash
curl -X POST http://localhost:3000/api/admin/materias_aprobadas -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"materiaId\":2,\"estado\":\"APROBADA\",\"nota\":8.5,\"fechaUltimoEstado\":\"2025-06-15\",\"profesorId\":1,\"periodoId\":1}"
```

**Explicacion de campos:**
- `alumnoId`: ID del alumno
- `materiaId`: ID de la materia
- `estado`: puede ser "APROBADA", "INSCRIPTO", "REGULAR", "CURSANDO", "LIBRE"
- `nota`: nota obtenida (opcional, solo si esta aprobada)
- `fechaUltimoEstado`: fecha del ultimo cambio de estado
- `profesorId`: ID del profesor que dicto la materia (opcional)
- `periodoId`: ID del periodo en que curso/aprobo (opcional)

- Actualizar un registro (ejemplo: cambiar a LIBRE):

```bash
curl -X PUT http://localhost:3000/api/admin/materias_aprobadas/1 -H "Content-Type: application/json" -d "{\"estado\":\"LIBRE\"}"
```

- Eliminar un registro:

```bash
curl -X DELETE http://localhost:3000/api/admin/materias_aprobadas/1
```

**Ejemplo completo:** Registrar que un alumno aprobo una materia con un profesor especifico:

```bash
# 1. Primero asegurarse de tener creado al alumno (id=1), materia (id=5), profesor (id=2) y periodo (id=1)

# 2. Registrar que el alumno aprobo la materia
curl -X POST http://localhost:3000/api/admin/materias_aprobadas -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"materiaId\":5,\"estado\":\"APROBADA\",\"nota\":9.0,\"fechaUltimoEstado\":\"2025-10-15\",\"profesorId\":2,\"periodoId\":1}"
```

### Resumen Diario

- Generar resumen diario manualmente (para probar):

```bash
curl http://localhost:3000/api/admin/resumen
```

**Nota:** El resumen diario se envia automaticamente todos los dias a las 23:00 hs al correo institucional configurado en la variable EMAIL_INSTITUCIONAL.

---

## Flujo de trabajo completo: Configurar el sistema desde cero

A continuacion se muestra el orden recomendado para configurar todo el sistema de inscripciones:

### Paso 1: Arrancar el servidor

```bash
# Instalar dependencias
npm install

# Arrancar el servidor
npm start

# El servidor deberia mostrar:
# "Servidor arrancado en http://localhost:3000"
# "Tarea programada configurada para las 23:00 hs"
```

### Paso 2: Crear las carreras

```bash
curl -X POST http://localhost:3000/api/admin/carreras -H "Content-Type: application/json" -d "{\"nombre\":\"Analista Funcional\"}"
# Respuesta: {"id":1}

curl -X POST http://localhost:3000/api/admin/carreras -H "Content-Type: application/json" -d "{\"nombre\":\"Desarrollo de Software\"}"
# Respuesta: {"id":2}

curl -X POST http://localhost:3000/api/admin/carreras -H "Content-Type: application/json" -d "{\"nombre\":\"Infraestructura de TI\"}"
# Respuesta: {"id":3}
```

### Paso 3: Crear las materias

```bash
# Materias de 1er año
curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Matematica I\",\"anio\":1}"
# Respuesta: {"id":1}

curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Programacion I\",\"anio\":1}"
# Respuesta: {"id":2}

curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Base de Datos I\",\"anio\":1}"
# Respuesta: {"id":3}

# Materias de 2do año
curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Matematica II\",\"anio\":2}"
# Respuesta: {"id":4}

curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Programacion II\",\"anio\":2}"
# Respuesta: {"id":5}

curl -X POST http://localhost:3000/api/admin/materias -H "Content-Type: application/json" -d "{\"nombre\":\"Base de Datos II\",\"anio\":2}"
# Respuesta: {"id":6}
```

### Paso 4: Asignar materias a carreras

```bash
# Asignar materias a "Desarrollo de Software" (carrera id=2)
curl -X POST http://localhost:3000/api/admin/carreras/2/materias -H "Content-Type: application/json" -d "{\"materiasIds\":[1,2,3,4,5,6]}"
```

### Paso 5: Crear correlativas

```bash
# Matematica II requiere Matematica I
curl -X POST http://localhost:3000/api/admin/correlativas -H "Content-Type: application/json" -d "{\"materiaId\":4,\"correlativaId\":1}"

# Programacion II requiere Programacion I
curl -X POST http://localhost:3000/api/admin/correlativas -H "Content-Type: application/json" -d "{\"materiaId\":5,\"correlativaId\":2}"

# Base de Datos II requiere Base de Datos I
curl -X POST http://localhost:3000/api/admin/correlativas -H "Content-Type: application/json" -d "{\"materiaId\":6,\"correlativaId\":3}"
```

### Paso 6: Crear profesores

```bash
curl -X POST http://localhost:3000/api/admin/profesores -H "Content-Type: application/json" -d "{\"nombre\":\"Maria\",\"apellido\":\"Gonzalez\"}"
# Respuesta: {"id":1}

curl -X POST http://localhost:3000/api/admin/profesores -H "Content-Type: application/json" -d "{\"nombre\":\"Carlos\",\"apellido\":\"Rodriguez\"}"
# Respuesta: {"id":2}
```

### Paso 7: Crear un periodo de inscripcion

```bash
curl -X POST http://localhost:3000/api/admin/periodos -H "Content-Type: application/json" -d "{\"fechaInicio\":\"2025-11-01\",\"fechaFin\":\"2025-11-30\",\"activo\":1,\"cupoLimite\":100}"
# Respuesta: {"id":1}
```

### Paso 8: Crear un alumno

```bash
curl -X POST http://localhost:3000/api/admin/alumnos -H "Content-Type: application/json" -d "{\"dni\":12345678,\"nombre\":\"Juan\",\"apellido\":\"Perez\",\"email\":\"juan@mail.com\",\"fechaNacimiento\":\"2000-05-15\",\"telefono\":\"1234567890\",\"direccion\":\"Calle Falsa 123\",\"localidad\":\"Buenos Aires\",\"activo\":1}"
# Respuesta: {"id":1}
```

### Paso 9: Registrar materias aprobadas del alumno

```bash
# Juan aprobo Matematica I
curl -X POST http://localhost:3000/api/admin/materias_aprobadas -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"materiaId\":1,\"estado\":\"APROBADA\",\"nota\":8.0,\"fechaUltimoEstado\":\"2025-06-15\",\"profesorId\":1,\"periodoId\":1}"

# Juan aprobo Programacion I
curl -X POST http://localhost:3000/api/admin/materias_aprobadas -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"materiaId\":2,\"estado\":\"APROBADA\",\"nota\":9.0,\"fechaUltimoEstado\":\"2025-06-20\",\"profesorId\":2,\"periodoId\":1}"
```

### Paso 10: Probar el flujo de inscripcion

```bash
# 1. Buscar alumno por DNI
curl -X POST http://localhost:3000/api/alumnos/buscar-dni -H "Content-Type: application/json" -d "{\"dni\":12345678}"

# 2. Verificar periodo activo
curl http://localhost:3000/api/periodos/activo

# 3. Ver materias de la carrera
curl http://localhost:3000/api/carreras/2/materias

# 4. Ver materias posibles para el alumno
curl "http://localhost:3000/api/alumnos/1/materias-posibles?carreraId=2"

# 5. Crear inscripcion (el alumno puede inscribirse a Matematica II y Programacion II porque aprobo las correlativas)
curl -X POST http://localhost:3000/api/inscripciones -H "Content-Type: application/json" -d "{\"alumnoId\":1,\"carreraId\":2,\"materiasIds\":[4,5],\"periodoId\":1}"
```

### Paso 11: Verificar inscripcion

```bash
curl http://localhost:3000/api/admin/inscripciones/1
```

---

## Consejos para probar en Windows

Si estas usando PowerShell y tenes problemas con las comillas, usa esta sintaxis:

```powershell
# En PowerShell, las comillas deben escaparse diferente
curl -X POST http://localhost:3000/api/admin/carreras -H "Content-Type: application/json" -d '{\"nombre\":\"Desarrollo de Software\"}'

# O mejor aun, usa Postman o Thunder Client
```

Si estas usando CMD, las comillas simples no funcionan, usa comillas dobles escapadas:

```cmd
curl -X POST http://localhost:3000/api/admin/carreras -H "Content-Type: application/json" -d "{\"nombre\":\"Desarrollo de Software\"}"
```

---

## Troubleshooting (Solucion de problemas comunes)

### Problema 1: "curl: command not found"
**Solucion:** 
- En Windows 10/11, curl viene instalado por defecto. Asegurate de usar PowerShell o CMD.
- Si no funciona, instala Git Bash o usa Postman.

### Problema 2: "ECONNREFUSED" o "Cannot connect to localhost"
**Solucion:** 
- Verifica que el servidor este corriendo (`npm start`)
- Asegurate de que el puerto 3000 no este ocupado por otra aplicacion
- Revisa que la URL sea correcta: `http://localhost:3000`

### Problema 3: Error 404 "Cannot GET /api/..."
**Solucion:** 
- Verifica que la ruta sea correcta (distingue mayusculas y minusculas)
- Asegurate de usar el metodo HTTP correcto (GET, POST, PUT, DELETE)
- Revisa el archivo `src/index.js` para ver las rutas disponibles

### Problema 4: Error 400 "Bad Request" o datos invalidos
**Solucion:** 
- Verifica que el JSON este bien formateado
- Asegurate de enviar todos los campos requeridos
- Revisa que los tipos de datos sean correctos (numeros sin comillas, strings con comillas)

### Problema 5: La base de datos esta vacia
**Solucion:** 
- Ejecuta los pasos del "Flujo de trabajo completo" para crear los datos iniciales
- La base de datos se crea automaticamente al arrancar el servidor por primera vez
- Si queres empezar de cero, elimina el archivo `src/db/base_de_datos.sqlite` y reinicia el servidor

---

## Tips adicionales

### Ver los logs en tiempo real
Cuando el servidor esta corriendo, todos los pedidos se muestran en la consola gracias al middleware `logger`. Podes ver:
- Fecha y hora del pedido
- Metodo HTTP (GET, POST, etc)
- Ruta solicitada

### Probar el resumen diario sin esperar a las 23:00
```bash
curl http://localhost:3000/api/admin/resumen
```

### Configurar el email institucional
Crea un archivo `.env` en la raiz del proyecto:
```
EMAIL_INSTITUCIONAL=direccion@instituto.edu.ar
```

Luego instala `dotenv`:
```bash
npm install dotenv
```

Y agrega al inicio de `src/index.js`:
```javascript
require('dotenv').config();
```

### Revisar la estructura de la base de datos
Podes usar herramientas como:
- **DB Browser for SQLite** (https://sqlitebrowser.org/)
- **SQLite Viewer** (extension de VS Code)

---

## Proximos pasos a realizar (si es posible)

1. **Integrar email real:** Usar nodemailer para enviar emails de verdad
2. **Deploy:** Subir a un servidor (Heroku, Railway, Render, etc)
