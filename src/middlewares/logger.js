// Este archivo es un "middleware" (ayudante) para mostrar en consola los pedidos que llegan al servidor
// Un middleware es una funcion que se ejecuta antes de llegar a la logica principal, y puede servir para mostrar mensajes, validar datos, etc
// En este caso, muestra la fecha, el tipo de pedido (GET, POST, etc) y la direccion
module.exports = function (req, res, next) {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next(); // Llama al siguiente middleware o a la logica principal
};
