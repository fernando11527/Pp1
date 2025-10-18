// Este archivo guarda configuraciones generales de la aplicacion
// Por ejemplo, el email institucional que se usa para enviar avisos
// Si no se define la variable de entorno EMAIL_INSTITUCIONAL, queda en null
module.exports = {
  emailInstitucional: process.env.EMAIL_INSTITUCIONAL || null,
};
