const WebSocket = require("ws");

// Render asigna el puerto en process.env.PORT
const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

server.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.send("Bienvenido al WebSocket!");

  socket.on("message", (msg) => {
    console.log("Mensaje recibido:", msg.toString());

    // Reenviar (broadcast) a todos los clientes conectados
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });

  socket.on("close", () => console.log("Cliente desconectado"));
});

console.log(`Servidor WebSocket escuchando en puerto ${PORT}`);
