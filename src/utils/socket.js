import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || '';
const socket = io(API_BASE, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

export const connectSocket = (token) => {
  if (socket.connected) return;
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export const joinUserRoom = (userId) => {
  if (socket.connected) {
    socket.emit('join', userId);
  } else {
    socket.once('connect', () => {
      socket.emit('join', userId);
    });
  }
};

export default socket;
