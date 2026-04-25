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

export const emitEvent = (event, data, room = null) => {
  if (!io) {
    console.warn('Socket.io NOT initialized, cannot emit:', event);
    return;
  }
  if (room) {
    console.log(`Emitting ${event} to room ${room}`);
    io.to(room).emit(event, data);
  } else {
    console.log(`Broadcasting ${event}`);
    io.emit(event, data);
  }
};
