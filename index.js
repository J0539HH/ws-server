const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const server = new WebSocket.Server({ port: PORT });

// Aquí puedes tener tu "token válido" quemado o traerlo de tu base de datos
const TOKEN_VALIDO = "123456";

// Mapa para guardar clientes conectados con sus datos
// Estructura: socket -> { token, perfil, idempresario }
const clientes = new Map();

server.on("connection", (socket, req) => {
  // Obtener parámetros de la URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");
  const perfil = url.searchParams.get("perfil");
  const idempresario = url.searchParams.get("idempresario");

  console.log(
    `🔗 Cliente conectado: token=${token}, perfil=${perfil}, idempresario=${idempresario}`
  );

  // Validar token
  if (token !== TOKEN_VALIDO) {
    console.log("❌ Token inválido, desconectando cliente...");
    socket.close();
    return;
  }

  // Guardar cliente con sus datos
  clientes.set(socket, { token, perfil, idempresario });

  // Enviar bienvenida
  socket.send(
    JSON.stringify({
      type: "welcome",
      message: `Conectado como perfil: ${perfil}, empresario: ${idempresario}`,
    })
  );

  // Manejar mensajes del cliente
  socket.on("message", (msg) => {
    console.log("📩 Mensaje recibido:", msg.toString());

    let data;
    try {
      data = JSON.parse(msg);
    } catch {
      return;
    }

    // Ejemplo: recibir notificación y enviarla solo a los que correspondan
    if (data.tipo === "notificacion") {
      enviarNotificacion(
        data.idempresario,
        data.perfil,
        data.mensaje,
        data.data
      );
    }
  });

  socket.on("close", () => {
    console.log(`🔌 Cliente desconectado: ${idempresario}`);
    clientes.delete(socket);
  });
});

console.log(`✅ Servidor WebSocket escuchando en puerto ${PORT}`);

// Función para enviar notificaciones filtradas
function enviarNotificacion(idempresario, perfil, mensaje, data) {
  clientes.forEach((info, clientSocket) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      if (
        String(info.idempresario) === String(idempresario) &&
        info.perfil === perfil
      ) {
        clientSocket.send(
          JSON.stringify({
            tipo: "notificacion",
            mensaje,
            idempresario,
            perfil,
            data,
          })
        );
      }
    }
  });
}
