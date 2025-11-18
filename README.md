# 🎓 Sistema de Inscripciones - Terciario Urquiza

API REST para gestión de inscripciones de alumnos del Instituto Terciario Urquiza.

## 🚀 Deploy en Render

Este proyecto está optimizado para deployar en **Render.com** (plan gratuito).

### Características del Deploy:
- ✅ Base de datos SQLite **volátil** (se recrea en cada deploy)
- ✅ Datos iniciales cargados automáticamente
- ✅ Envío real de emails con Gmail
- ✅ Sin configuración adicional necesaria

### 📖 Guía Completa
Ver [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) para instrucciones detalladas.

### ⚡ Quick Start

1. **Fork/Clone** este repositorio
2. **Crear Web Service** en Render conectando el repo
3. **Configurar variables de entorno** (ver `.env.example`)
4. **Deploy automático** ✨

---

## 💻 Desarrollo Local

### Requisitos:
- Node.js 16+
- npm

### Instalación:
```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm start
```

El servidor arrancará en `http://localhost:3000`

### Probar configuración:
```bash
node test-deploy.js
```

---

## 📚 Estructura del Proyecto

```
Pp1/
├── src/
│   ├── index.js              # Punto de entrada
│   ├── config/
│   │   └── db.js             # Configuración de SQLite
│   ├── controllers/          # Controladores HTTP
│   ├── servicios/            # Lógica de negocio
│   │   ├── InscripcionServicio.js
│   │   ├── EmailService.js
│   │   └── ResumenDiarioServicio.js
│   ├── repositorios/         # Acceso a datos
│   ├── routes/               # Definición de rutas
│   └── modelos/              # Modelos de datos
├── .env.example              # Variables de entorno template
├── DEPLOY_RENDER.md          # Guía de deploy
└── package.json
```

---

## 🔌 API Endpoints

### Públicos:
- `GET /api/alumnos/dni/:dni` - Buscar alumno por DNI
- `GET /api/carreras` - Listar carreras
- `GET /api/periodos` - Listar periodos activos
- `POST /api/inscripciones` - Crear inscripción
- `GET /api/inscripciones/verificar` - Verificar inscripción existente

### Admin:
- `/api/admin/alumnos` - CRUD alumnos
- `/api/admin/materias` - CRUD materias
- `/api/admin/periodos` - CRUD periodos
- `/api/admin/inscripciones` - Ver inscripciones
- `/api/admin/resumen` - Estadísticas

---

## 📧 Sistema de Emails

Utiliza **Nodemailer** con dos modos:

- **Ethereal** (testing): Emails simulados con preview link
- **Gmail** (producción): Envío real con cuenta institucional

Configurar en `.env`:
```
EMAIL_MODE=gmail
GMAIL_USER=tu_email@terciariourquiza.edu.ar
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🎯 Características

- ✅ Inscripción única por periodo (no duplicados)
- ✅ Validación de correlativas automática
- ✅ Email de confirmación instantáneo
- ✅ Resumen diario automático (23:00 hs)
- ✅ Base de datos con datos de prueba
- ✅ Frontend separado (HTML/CSS/JS)

---

## 📝 Datos Iniciales (SEED)

El sistema carga automáticamente:
- 3 Carreras (ITI, DS, AF)
- 76 Materias
- 10 Profesores
- 6 Alumnos de prueba
- 1 Periodo activo

### Alumno de prueba:
- DNI: `41342897`
- Nombre: Fernando Virgilio
- Carrera: Desarrollo de Software
- Materias aprobadas: 11

---

## 🔒 Seguridad

- Variables sensibles en `.env` (no versionadas)
- CORS habilitado para frontend
- Validación de datos en backend
- Manejo de errores centralizado

---

## 📄 Licencia

ISC

---

## 👨‍💻 Autor

Proyecto del Instituto Terciario Urquiza

---

## 🆘 Soporte

Ver [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) para troubleshooting y problemas comunes.
