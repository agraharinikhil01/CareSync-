import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return import.meta.env.VITE_SOCKET_URL || null;
  }
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const socketUrl = getSocketUrl();
const shouldConnect = isLocalhost || Boolean(import.meta.env.VITE_SOCKET_URL);

// Mock socket for when no socket server is available (e.g., Vercel static deployment)
const createMockSocket = () => ({
  on: () => {},
  off: () => {},
  emit: () => {},
  connected: false,
  disconnect: () => {},
});

let socket;
try {
  if (socketUrl) {
    socket = io(socketUrl, {
      autoConnect: shouldConnect,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      transports: ['websocket', 'polling'],
    });
  } else {
    // No socket URL configured for production — use mock to prevent crashes
    socket = createMockSocket();
  }
} catch (err) {
  console.warn('Socket.IO initialization failed, using mock socket:', err.message);
  socket = createMockSocket();
}

export const joinHospitalRoom = (hospitalId) => {
  if (hospitalId && socket.emit) {
    socket.emit('join_hospital', hospitalId);
  }
};

export const leaveHospitalRoom = (hospitalId) => {
  if (hospitalId && socket.emit) {
    socket.emit('leave_hospital', hospitalId);
  }
};

export { socket };
export default socket;

