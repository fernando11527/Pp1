// Este archivo es el servicio para enviar emails
// Por ahora es un MOCK (simulacion), solo muestra mensajes en consola
// Mas adelante se puede conectar con nodemailer o un servicio real de correos

class EmailService {
  constructor({ fromAddress, institutionalAddress }) {
    this.fromAddress = fromAddress || "no-reply@institucion.local";
    this.institutionalAddress =
      institutionalAddress || process.env.EMAIL_INSTITUCIONAL || null;
  }

  // Envia email de confirmacion de inscripcion (por ahora solo muestra en consola)
  async enviarEmailInscripcion({ alumno, inscripcion, materias }) {
    // Aqui se puede integrar nodemailer. Por ahora solo logueamos el intento y devolvemos ok
    console.log(
      "[EmailService] enviarEmailInscripcion -> desde:",
      this.fromAddress
    );
    console.log("Alumno:", alumno.email, alumno.nombre, alumno.apellido);
    console.log("Inscripcion:", inscripcion);
    console.log("Materias:", materias);
    if (this.institutionalAddress) {
      console.log("Copia a institucional:", this.institutionalAddress);
    }
    return Promise.resolve(true); // Simula envio exitoso
  }

  // Envia resumen diario de inscripciones al instituto (por ahora solo muestra en consola)
  async enviarResumenDiario(resumen) {
    console.log("\n========================================");
    console.log("[EmailService] RESUMEN DIARIO DE INSCRIPCIONES");
    console.log("========================================");
    console.log("Fecha:", resumen.fecha);
    console.log("Inscriptos del dia:", resumen.inscriptosHoy);
    console.log("Acumulado total:", resumen.acumuladoTotal);
    console.log("\nInscriptos por carrera:");
    Object.entries(resumen.porCarrera).forEach(([carrera, cantidad]) => {
      console.log(`  - ${carrera}: ${cantidad}`);
    });
    console.log("\nDestinatario:", this.institutionalAddress || "no configurado");
    console.log("========================================\n");
    
    // Simula envio exitoso
    return Promise.resolve(true);
  }
}

module.exports = EmailService;
