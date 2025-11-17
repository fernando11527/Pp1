# 🔒 Sistema de Inscripción Única por Periodo

## 📋 Resumen de Cambios Implementados

Se implementó un sistema de **inscripción única por periodo** que previene que un alumno pueda inscribirse más de una vez al mismo periodo académico.

---

## ✅ Cambios en el Backend

### 1. **Nuevo método de verificación** (`InscripcionServicio.js`)

```javascript
async verificarInscripcionEnPeriodo(alumnoId, periodoId)
```

- Consulta si existe una inscripción previa del alumno en el periodo
- Devuelve el registro si existe, o `null` si no

### 2. **Validación automática al crear inscripción**

Antes de crear una inscripción, el sistema verifica automáticamente:
- ✅ Periodo activo
- ✅ **NUEVO:** Si el alumno ya está inscripto
- ✅ Fechas válidas
- ✅ Materias permitidas según correlativas

Si el alumno ya está inscripto, se lanza un error:
```
"Ya tienes una inscripción registrada en este período. No puedes inscribirte nuevamente."
```

### 3. **Nuevo endpoint de verificación**

**Ruta:** `GET /api/inscripciones/verificar`

**Parámetros:**
- `alumnoId` (query)
- `periodoId` (query)

**Respuesta:**
```json
{
  "yaInscripto": true/false,
  "inscripcionId": 123 // o null
}
```

**Ejemplo de uso:**
```bash
curl "http://localhost:3000/api/inscripciones/verificar?alumnoId=1&periodoId=1"
```

---

## ✅ Cambios en el Frontend

### 1. **Verificación previa al mostrar materias**

Cuando el alumno intenta acceder a "Inscripción a cursado":
1. Se hace una llamada a `/api/inscripciones/verificar`
2. Si ya está inscripto → Muestra alerta y vuelve al menú
3. Si NO está inscripto → Permite continuar con la selección

### 2. **Mensaje de advertencia visual**

Se agregó un cuadro amarillo de advertencia en la pantalla de selección de materias:

```
⚠️ IMPORTANTE: Una vez confirmada la inscripción, NO podrás 
modificarla ni cancelarla. Asegúrate de seleccionar correctamente 
todas las materias antes de confirmar.
```

### 3. **Confirmación doble al enviar**

Antes de enviar la inscripción, aparece un diálogo de confirmación:

```
⚠️ ATENCIÓN: Una vez confirmada la inscripción, NO podrás 
modificarla ni cancelarla.

Por favor, verifica que hayas seleccionado correctamente todas 
las materias.

¿Deseas confirmar la inscripción?
```

El usuario debe hacer clic en **OK** para continuar o **Cancelar** para volver.

---

## 🎯 Flujo Completo de Inscripción

### Antes (sin protección):
1. Alumno selecciona materias
2. Confirma inscripción
3. ✅ Se crea inscripción (incluso si ya tenía una)

### Ahora (con protección):
1. Alumno intenta entrar a "Inscripción a cursado"
2. **Sistema verifica si ya está inscripto**
   - ❌ Si ya está inscripto → Alerta y vuelve al menú
   - ✅ Si NO está inscripto → Continúa
3. Alumno selecciona materias
4. **Ve advertencia visual en pantalla**
5. Hace clic en "Confirmar inscripción"
6. **Aparece diálogo de confirmación**
   - Cancela → Vuelve a la pantalla
   - Confirma → Continúa
7. **Backend valida nuevamente**
   - ❌ Si entre tanto ya se inscribió → Error
   - ✅ Si todo OK → Crea inscripción
8. ✅ Inscripción exitosa

---

## 🔒 Validaciones Implementadas

### En el Frontend:
1. ✅ Verificación previa al cargar materias
2. ✅ Advertencia visual en pantalla
3. ✅ Confirmación con diálogo

### En el Backend:
1. ✅ Verificación antes de crear inscripción
2. ✅ Mensaje de error claro si ya existe
3. ✅ Endpoint para consultar estado

---

## 📂 Archivos Modificados

### Backend:
- ✅ `src/servicios/InscripcionServicio.js` - Método de verificación y validación
- ✅ `src/controllers/InscripcionController.js` - Controlador de verificación
- ✅ `src/routes/inscripciones.js` - Nueva ruta GET /verificar

### Frontend:
- ✅ `index.html` - Mensaje de advertencia visual
- ✅ `script.js` - Verificación previa y confirmación
- ✅ `style.css` - Estilos para la advertencia

---

## 🧪 Cómo Probar

### Caso 1: Primera inscripción (debe funcionar)
1. Ingresar con DNI: `41342897`
2. Seleccionar carrera
3. Ir a "Inscripción a cursado"
4. Seleccionar materias
5. Confirmar
6. ✅ Debe inscribirse correctamente

### Caso 2: Intentar inscribirse de nuevo (debe bloquearse)
1. Ingresar con el mismo DNI
2. Seleccionar la misma carrera
3. Ir a "Inscripción a cursado"
4. ❌ Debe mostrar: "Ya tienes una inscripción registrada en este período"
5. Vuelve automáticamente al menú

### Caso 3: Verificación desde backend
```bash
# Primera verificación (no inscripto)
curl "http://localhost:3000/api/inscripciones/verificar?alumnoId=1&periodoId=1"
# Respuesta: {"yaInscripto":false,"inscripcionId":null}

# Después de inscribirse
curl "http://localhost:3000/api/inscripciones/verificar?alumnoId=1&periodoId=1"
# Respuesta: {"yaInscripto":true,"inscripcionId":7}
```

---

## 💡 Beneficios

1. **Previene inscripciones duplicadas** - Un alumno solo puede inscribirse una vez
2. **Mensajes claros** - El alumno sabe por qué no puede inscribirse
3. **Validación en múltiples capas** - Frontend y backend
4. **Advertencias visibles** - Antes de confirmar, el alumno es advertido
5. **Confirmación explícita** - Diálogo de confirmación evita errores

---

## 📞 Mensajes de Error

### Frontend:
- "Ya tienes una inscripción registrada en este período. No puedes inscribirte nuevamente."
- "Error: datos no encontrados. Vuelva a ingresar."
- "Error al verificar tu inscripción. Intenta nuevamente."

### Backend:
- "Ya tienes una inscripción registrada en este período. No puedes inscribirte nuevamente."
- "No existe periodo activo"
- "Fuera de fechas del periodo"
- "Materia X no valida para inscripcion"

---

## 🎓 Para la Presentación

### Demostración sugerida:

1. **Mostrar el código:**
   - Método `verificarInscripcionEnPeriodo()`
   - Endpoint `/api/inscripciones/verificar`
   - Validación en `crearInscripcion()`

2. **Probar en vivo:**
   - Inscribir un alumno por primera vez (funciona)
   - Intentar inscribir al mismo alumno de nuevo (bloqueado)
   - Mostrar el mensaje de advertencia visual
   - Mostrar el diálogo de confirmación

3. **Explicar la lógica:**
   - Validación en frontend (UX)
   - Validación en backend (seguridad)
   - Base de datos garantiza unicidad

---

¡El sistema de inscripción única está completo y funcionando! 🎉
