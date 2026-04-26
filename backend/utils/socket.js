import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room user:${userId}`);
    });

    socket.on('joinAdmins', () => {
      socket.join('admins');
      console.log(`Socket ${socket.id} joined room admins`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Emit to one or many rooms. Pass null/undefined to broadcast (avoid for sensitive payloads).
export const emitEvent = (event, data, rooms = null) => {
  if (!io) {
    console.warn('Socket.io NOT initialized, cannot emit:', event);
    return;
  }
  if (rooms) {
    const targets = Array.isArray(rooms) ? rooms.filter(Boolean) : [rooms];
    if (targets.length === 0) return;
    const unique = [...new Set(targets)];
    console.log(`Emitting ${event} to rooms ${unique.join(', ')}`);
    io.to(unique).emit(event, data);
  } else {
    console.log(`Broadcasting ${event}`);
    io.emit(event, data);
  }
};
