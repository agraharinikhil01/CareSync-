let Server = null;
try {
  Server = require('socket.io').Server;
} catch (e) {
  Server = null;
}

let io = null;

const initSocket = (httpServer) => {
  if (!Server || !httpServer) return null;
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins in dev, frontend client
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join a hospital room if requested
    socket.on('join_hospital', (hospitalId) => {
      if (hospitalId) {
        socket.join(`hospital_${hospitalId}`);
      }
    });

    socket.on('leave_hospital', (hospitalId) => {
      if (hospitalId) {
        socket.leave(`hospital_${hospitalId}`);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Broadcast live bed/capacity changes to all connected patient maps & hospital dashboards
const broadcastHospitalUpdate = (hospitalId, data) => {
  if (!io) return;
  io.emit('hospital:availability_updated', {
    hospitalId,
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

// Send emergency notification to specific hospital room and system admins
const emitEmergencyAlert = (hospitalId, data) => {
  if (!io) return;
  io.to(`hospital_${hospitalId}`).emit('emergency:new_request', data);
  io.emit('emergency:network_alert', data);
};

// Send transfer notification to sending and receiving hospitals
const emitTransferUpdate = (transfer) => {
  if (!io) return;
  if (transfer.fromHospital) {
    io.to(`hospital_${transfer.fromHospital}`).emit('transfer:status_changed', transfer);
  }
  if (transfer.toHospital) {
    io.to(`hospital_${transfer.toHospital}`).emit('transfer:status_changed', transfer);
  }
  io.emit('transfer:network_update', transfer);
};

module.exports = {
  initSocket,
  getIO,
  broadcastHospitalUpdate,
  emitEmergencyAlert,
  emitTransferUpdate,
};
