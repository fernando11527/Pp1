# 🚀 Guía de Deploy en Render.com

## 📋 Requisitos Previos
- Cuenta en [Render.com](https://render.com) (plan gratuito)
- Repositorio de GitHub con el proyecto
- Configuración de Gmail para envío de emails

---

## 🔧 Configuración en Render

### 1. Crear el Web Service

1. **Ir a Dashboard de Render** → "New" → "Web Service"
2. **Conectar el repositorio de GitHub**
3. **Configurar el servicio:**
   - **Name:** `terciario-urquiza-api` (o el nombre que prefieras)
   - **Region:** Oregon (Free)
   - **Branch:** `main` o `master`
   - **Root Directory:** (dejar vacío)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 2. Configurar Variables de Entorno

En la sección **Environment Variables**, agregar:

```
NODE_ENV = production
RENDER = true
EMAIL_MODE = gmail
GMAIL_USER = 41342897@terciariourquiza.edu.ar
GMAIL_APP_PASSWORD = tu_contraseña_de_aplicacion_gmail
EMAIL_INSTITUCIONAL = direccion@terciariourquiza.edu.ar
```

⚠️ **IMPORTANTE:** 
- `PORT` NO se configura manualmente, Render lo asigna automáticamente
- `GMAIL_APP_PASSWORD` debe ser una "Contraseña de Aplicación" de Gmail (no tu contraseña normal)

### 3. Deploy Automático

Una vez guardada la configuración:
- Render iniciará el build automáticamente
- La base de datos SQLite se creará en `/tmp` (volátil)
- Los datos se inicializarán con el SEED automáticamente
- La aplicación estará disponible en: `https://tu-servicio.onrender.com`

---

## 💾 Comportamiento de la Base de Datos

### En Render (Producción):
- ✅ La DB se crea automáticamente al iniciar
- ✅ Los datos persisten mientras el servidor esté activo
- ✅ Se pueden hacer inscripciones, modificar datos, etc.
- ⚠️ Los datos se borran al reiniciar o hacer redeploy
- ⚠️ Render puede "suspender" el servicio tras 15 min de inactividad (plan free)
- 🔄 Al reactivarse, la DB se recrea con datos iniciales

### En Local (Desarrollo):
- ✅ La DB se guarda en `src/db/base_de_datos.sqlite`
- ✅ Los datos persisten entre reinicios
- ✅ Puedes eliminar el archivo para reiniciar

---

## 🧪 Probar el Deploy

### 1. Verificar el health check:
```bash
curl https://tu-servicio.onrender.com/api/carreras
```

Deberías recibir las 3 carreras del Terciario Urquiza.

### 2. Probar inscripción completa:
- Abre el frontend y apunta a la URL de Render
- Ingresa con DNI: `41342897`
- Selecciona carrera y materias
- Confirma inscripción
- Verifica que llegue el email

---

## 🔍 Logs y Debugging

### Ver logs en tiempo real:
1. Ir al Dashboard de Render
2. Seleccionar tu servicio
3. Click en la pestaña **"Logs"**
4. Buscar:
   - `✅ Datos iniciales del Terciario Urquiza cargados correctamente.`
   - `Servidor arrancado en http://...`
   - `📧 EmailService configurado en modo GMAIL`

### Comandos útiles en logs:
```
Servidor arrancado en http://localhost:XXXX
✅ Datos iniciales del Terciario Urquiza cargados correctamente.
📧 Email de inscripción enviado a: alumno@email.com
```

---

## ⚡ Optimizaciones para Plan Free

### 1. Keep-Alive (opcional)
Para evitar que el servicio se suspenda, puedes usar un servicio como:
- [Uptime Robot](https://uptimerobot.com) (ping cada 5 minutos)
- [Cron-job.org](https://cron-job.org)

### 2. Warm-up endpoint
Ya tienes `/api/carreras` que es perfecto para hacer ping.

---

## 🎯 Conectar el Frontend

### Actualizar la URL base en el frontend:
```javascript
// En script.js
const API_BASE_URL = 'https://tu-servicio.onrender.com/api';

// Ejemplo de fetch
fetch(`${API_BASE_URL}/alumnos/dni/${dni}`)
```

### CORS está habilitado:
El backend ya tiene `cors()` configurado, así que el frontend puede hacer llamadas desde cualquier dominio.

---

## 📝 Checklist de Deploy

- [ ] Variables de entorno configuradas en Render
- [ ] Gmail App Password generada
- [ ] Build exitoso (ver logs)
- [ ] Servidor arrancado correctamente
- [ ] Datos iniciales cargados
- [ ] Endpoint `/api/carreras` responde
- [ ] Frontend apunta a la URL de Render
- [ ] Prueba de inscripción completa funciona
- [ ] Email llega correctamente

---

## 🚨 Problemas Comunes

### "Application failed to respond"
- Verificar que `PORT` no esté hardcodeado
- Debe usar: `process.env.PORT || 3000`

### "Cannot create database"
- Verificar que `RENDER=true` esté configurado
- La DB debe crearse en `/tmp` en producción

### "Emails no llegan"
- Verificar `GMAIL_APP_PASSWORD` en variables de entorno
- Revisar logs: `📧 Email de inscripción enviado...`
- Verificar que el email del alumno sea válido

### "Service suspended"
- Normal en plan free tras 15 min sin uso
- Se reactiva automáticamente al recibir una petición
- Los datos se pierden (se recrea la DB)

---

## 🎓 Presentación del Proyecto

### Demo en vivo:
1. Mostrar la URL de Render funcionando
2. Hacer una inscripción completa
3. Mostrar el email recibido
4. Mostrar logs en Render (opcional)

### Mencionar:
- "Deploy automático en Render con plan gratuito"
- "Base de datos SQLite en memoria volátil"
- "Envío real de emails con Gmail"
- "Frontend y backend separados"

---

¡Listo para deploy! 🚀
