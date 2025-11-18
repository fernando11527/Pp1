// Este archivo es el servicio para enviar emails
// Usa nodemailer con soporte para Gmail (producción) y Ethereal (testing)

const nodemailer = require("nodemailer");

class EmailService {
  constructor({ fromAddress, institutionalAddress }) {
    this.fromAddress = fromAddress || "no-reply@terciariourquiza.edu.ar";
    this.institutionalAddress =
      institutionalAddress || process.env.EMAIL_INSTITUCIONAL || null;
    this.transporter = null;
    this.mode = process.env.EMAIL_MODE || "ethereal"; // 'ethereal' o 'gmail'
  }

  // Crea el transporter (configuración de envío) según el modo
  async getTransporter() {
    if (this.transporter) return this.transporter;

    if (this.mode === "gmail") {
      // Modo Gmail - Configuración optimizada para Render
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // SSL directo
        secure: true, // true para 465, false para otros puertos
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        // Configuración optimizada para hostings
        pool: false, // No usar pool en Render
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2'
        },
        // Timeouts más cortos
        connectionTimeout: 10000, // 10 segundos
        greetingTimeout: 5000,    // 5 segundos
        socketTimeout: 15000       // 15 segundos
      });
      console.log("📧 EmailService configurado en modo GMAIL (Puerto 465/SSL)");
    } else {
      // Modo Ethereal - Testing (crea cuenta temporal automáticamente)
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("📧 EmailService configurado en modo ETHEREAL (testing)");
      console.log("📧 Los emails no se envían realmente, solo se simulan");
    }

    return this.transporter;
  }

  // Envia email de confirmacion de inscripcion
  async enviarEmailInscripcion({ alumno, inscripcion, materias }) {
    try {
      const transporter = await this.getTransporter();

      // Si no hay email del alumno, solo registrar y no enviar
      if (!alumno.email) {
        console.log("⚠️ No se puede enviar email: alumno sin email");
        return false;
      }

      // Construir lista de materias
      const listaMaterias = materias
        .map((m) => `  - ${m.nombre || `Materia ID ${m.id || m}`}`)
        .join("\n");

      // Formatear fecha correctamente
      const fechaInscripcion = inscripcion.fechaInscripcion 
        ? new Date(inscripcion.fechaInscripcion) 
        : new Date();
      const fechaFormateada = fechaInscripcion.toLocaleDateString("es-AR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: `"Terciario Urquiza" <${this.fromAddress}>`,
        to: alumno.email,
        subject: "✅ Confirmación de Inscripción - Terciario Urquiza",
        text: `
Hola ${alumno.nombre} ${alumno.apellido},

Tu inscripción ha sido registrada exitosamente.

📋 DETALLES DE LA INSCRIPCIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fecha: ${fechaFormateada}
Número de inscripción: ${inscripcion.id}

📚 MATERIAS INSCRIPTAS:
${listaMaterias}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recordá:
• El inicio de clases será informado próximamente
• Verificá los horarios en la cartelera del instituto
• Ante cualquier consulta, acercate a la secretaría

📍 Bv. Oroño 690 - Rosario
📞 Teléfono: (341) XXX-XXXX

Saludos,
Instituto Terciario Urquiza
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0056b3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
    .materias { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #0056b3; }
    .materias li { margin: 8px 0; }
    .highlight { background: #e8f5e9; padding: 10px; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Inscripción Confirmada</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${alumno.nombre} ${alumno.apellido}</strong>,</p>
      <p>Tu inscripción ha sido registrada exitosamente.</p>
      
      <div class="highlight">
        <strong>📋 Detalles de la inscripción:</strong><br>
        Fecha: ${fechaFormateada}<br>
        Número: ${inscripcion.id}
      </div>

      <div class="materias">
        <strong>📚 Materias inscriptas:</strong>
        <ul>
          ${materias.map((m) => `<li>${m.nombre || `Materia ID ${m.id || m}`}</li>`).join("")}
        </ul>
      </div>

      <p><strong>Recordá:</strong></p>
      <ul>
        <li>El inicio de clases será informado próximamente</li>
        <li>Verificá los horarios en la cartelera del instituto</li>
        <li>Ante cualquier consulta, acercate a la secretaría</li>
      </ul>
    </div>
    <div class="footer">
      <p>📍 Bv. Oroño 690 - Rosario | 📞 (341) XXX-XXXX</p>
      <p>&copy; ${new Date().getFullYear()} Instituto Terciario Urquiza</p>
    </div>
  </div>
</body>
</html>
        `,
      };

      // Si hay email institucional, agregar CC
      if (this.institutionalAddress) {
        mailOptions.cc = this.institutionalAddress;
      }

      const info = await transporter.sendMail(mailOptions);

      // En modo Ethereal, mostrar link para ver el email
      if (this.mode === "ethereal") {
        console.log("📧 Email de inscripción (TEST) enviado");
        console.log("🔗 Ver email en: " + nodemailer.getTestMessageUrl(info));
      } else {
        console.log("📧 Email de inscripción enviado a:", alumno.email);
      }

      return true;
    } catch (error) {
      console.error("❌ Error al enviar email de inscripción:", error);
      return false;
    }
  }

  // Envia resumen diario de inscripciones al instituto
  async enviarResumenDiario(resumen) {
    try {
      if (!this.institutionalAddress) {
        console.log("⚠️ No hay email institucional configurado para enviar resumen");
        return false;
      }

      const transporter = await this.getTransporter();

      // Construir tabla de carreras
      const tablaCarreras = Object.entries(resumen.porCarrera)
        .map(([carrera, cantidad]) => `  • ${carrera}: ${cantidad} inscriptos`)
        .join("\n");

      const mailOptions = {
        from: `"Sistema Inscripciones" <${this.fromAddress}>`,
        to: this.institutionalAddress,
        subject: `📊 Resumen Diario de Inscripciones - ${resumen.fecha}`,
        text: `
RESUMEN DIARIO DE INSCRIPCIONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fecha: ${resumen.fecha}

📈 ESTADÍSTICAS:
• Inscripciones del día: ${resumen.inscriptosHoy}
• Total acumulado: ${resumen.acumuladoTotal}

📚 INSCRIPTOS POR CARRERA:
${tablaCarreras}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este es un resumen automático generado por el sistema.

Instituto Terciario Urquiza
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0056b3; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .stats { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .stats-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
    .number { font-size: 24px; font-weight: bold; color: #0056b3; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Resumen Diario de Inscripciones</h1>
      <p>${resumen.fecha}</p>
    </div>
    <div class="content">
      <div class="stats">
        <h3>📈 Estadísticas del Día</h3>
        <div class="stats-item">
          <span>Inscripciones del día:</span>
          <span class="number">${resumen.inscriptosHoy}</span>
        </div>
        <div class="stats-item">
          <span>Total acumulado:</span>
          <span class="number">${resumen.acumuladoTotal}</span>
        </div>
      </div>

      <div class="stats">
        <h3>📚 Inscriptos por Carrera</h3>
        ${Object.entries(resumen.porCarrera)
          .map(
            ([carrera, cantidad]) =>
              `<div class="stats-item"><span>${carrera}</span><span class="number">${cantidad}</span></div>`
          )
          .join("")}
      </div>

      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Este es un resumen automático generado por el sistema de inscripciones.
      </p>
    </div>
  </div>
</body>
</html>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      if (this.mode === "ethereal") {
        console.log("📧 Resumen diario (TEST) enviado");
        console.log("🔗 Ver email en: " + nodemailer.getTestMessageUrl(info));
      } else {
        console.log("📧 Resumen diario enviado a:", this.institutionalAddress);
      }

      return true;
    } catch (error) {
      console.error("❌ Error al enviar resumen diario:", error);
      return false;
    }
  }
}

module.exports = EmailService;
