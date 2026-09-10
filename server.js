import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store rooms and users data
const rooms = new Map();
const users = new Map();

// Socket.IO events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new study room
  socket.on('create_room', (data) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      code: roomCode,
      admin: socket.id,
      adminName: data.name,
      subject: data.subject,
      group1: { members: [], admin: socket.id },
      group2: { members: [] },
      joinRequests: [],
      timerDuration: 25,
      timerRunning: false,
      createdAt: new Date()
    };
    
    rooms.set(roomCode, room);
    users.set(socket.id, { name: data.name, subject: data.subject, room: roomCode, group: null });
    socket.join(`room_${roomCode}`);
    socket.emit('room_created', { roomCode, userId: socket.id });
    console.log('Room created:', roomCode);
  });

  // Join a room
  socket.on('join_room', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    const joinRequest = {
      userId: socket.id,
      userName: data.name,
      subject: data.subject,
      timestamp: new Date()
    };

    room.joinRequests.push(joinRequest);
    users.set(socket.id, { name: data.name, subject: data.subject, room: data.roomCode, group: null });
    
    io.to(`room_${data.roomCode}`).emit('join_request', joinRequest);
    socket.emit('join_pending', { message: 'Your request is pending admin approval' });
    console.log('Join request sent for room:', data.roomCode);
  });

  // Admin approve join request
  socket.on('approve_join', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;

    const request = room.joinRequests.find(r => r.userId === data.userId);
    if (!request) return;

    // Assign to group based on subject matching
    const group1Subjects = room.group1.members.map(id => users.get(id)?.subject);
    const group2Subjects = room.group2.members.map(id => users.get(id)?.subject);

    let assignedGroup = 'group1';
    if (group1Subjects.length >= group2Subjects.length) {
      assignedGroup = 'group2';
    }

    room[assignedGroup].members.push(data.userId);
    const userSocket = io.sockets.sockets.get(data.userId);
    if (userSocket) {
      userSocket.join(`room_${data.roomCode}`);
      userSocket.join(`${data.roomCode}_${assignedGroup}`);
      users.get(data.userId).group = assignedGroup;
      userSocket.emit('join_approved', { roomCode: data.roomCode, group: assignedGroup });
    }

    room.joinRequests = room.joinRequests.filter(r => r.userId !== data.userId);
    io.to(`room_${data.roomCode}`).emit('user_joined', { userId: data.userId, userName: request.userName, group: assignedGroup });
    console.log('User approved for room:', data.roomCode, 'Group:', assignedGroup);
  });

  // Admin reject join request
  socket.on('reject_join', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;

    room.joinRequests = room.joinRequests.filter(r => r.userId !== data.userId);
    const userSocket = io.sockets.sockets.get(data.userId);
    if (userSocket) {
      userSocket.emit('join_rejected', { message: 'Your join request was rejected' });
    }
  });

  // Set timer duration
  socket.on('set_timer', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.admin !== socket.id) return;

    room.timerDuration = Math.max(25, data.duration);
    room.timerRunning = true;
    io.to(`room_${data.roomCode}`).emit('timer_start', { duration: room.timerDuration });
  });

  // Voice message
  socket.on('voice_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(user.room);
    const group = user.group;
    
    io.to(`${user.room}_${group}`).emit('voice_message', {
      userId: socket.id,
      userName: user.name,
      message: data.message,
      timestamp: new Date()
    });
  });

  // AI Study Assistant
  socket.on('ask_assistant', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const responses = {
      'demand': 'Demand is the quantity of goods or services that consumers are willing and able to purchase at various price levels.',
      'differentiation': 'Differentiation is a calculus concept where we find the rate of change of a function. It helps us understand how a function changes at any point.',
      'calculus': 'Calculus is a branch of mathematics that studies change and motion through derivatives and integrals.',
      'help': 'I\'m here to help! Ask me about your study subject and I\'ll do my best to explain it clearly.',
      'default': 'That\'s a great question! This concept is important in your studies. Try breaking it down into smaller parts and practice with examples.'
    };

    const answer = responses[data.question.toLowerCase()] || responses['default'];
    socket.emit('assistant_response', { answer });
  });

  // Doubt pulse signals
  socket.on('doubt_signal', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    io.to(`${user.room}_${user.group}`).emit('doubt_signal', {
      userId: socket.id,
      userName: user.name,
      signal: data.signal,
      timestamp: new Date()
    });
  });

  // Get room info
  socket.on('get_room_info', (data) => {
    const room = rooms.get(data.roomCode);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    socket.emit('room_info', {
      code: room.code,
      admin: room.adminName,
      subject: room.subject,
      group1Count: room.group1.members.length,
      group2Count: room.group2.members.length,
      joinRequests: room.joinRequests.length
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const room = rooms.get(user.room);
      if (room) {
        if (user.group === 'group1') {
          room.group1.members = room.group1.members.filter(id => id !== socket.id);
        } else if (user.group === 'group2') {
          room.group2.members = room.group2.members.filter(id => id !== socket.id);
        }
      }
    }
    users.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Study Circle server running on http://localhost:${PORT}`);
});