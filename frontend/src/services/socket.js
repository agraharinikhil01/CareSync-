import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return import.meta.env.VITE_SOCKET_URL || window.location.origin;
  }
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const socket = io(getSocketUrl(), {
  autoConnect: isLocalhost || Boolean(import.meta.env.VITE_SOCKET_URL),
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  transports: ['websocket', 'polling'],
});

export const joinHospitalRoom = (hospitalId) => {
  if (hospitalId) {
    socket.emit('join_hospital', hospitalId);
  }
};

export const leaveHospitalRoom = (hospitalId) => {
  if (hospitalId) {
    socket.emit('leave_hospital', hospitalId);
  }
};

export default socket;
