import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
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
