import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] } // ajustar origen en producción
  });

  io.on('connection', (socket) => {
    console.log('Cliente socket conectado', socket.id);
    socket.on('disconnect', () => {
      console.log('Cliente socket desconectado', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}