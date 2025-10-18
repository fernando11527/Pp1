// Este archivo es un "middleware" (ayudante) para manejar los errores que ocurren en el servidor
// Un middleware es una funcion que se ejecuta antes o despues de la logica principal, y puede servir para mostrar mensajes, validar datos, etc
// En este caso, si ocurre un error, lo muestra en consola y devuelve un mensaje al usuario
module.exports = function (err, req, res, next) {
  console.error(err); // Muestra el error en consola
  const status = err.status || 500; // Usa el estado que viene o 500 si es error interno
  res.status(status).json({ error: err.message || "Error interno" }); // Devuelve el mensaje de error
};
