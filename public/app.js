// Socket connection
const socket = io();

// Global state
let currentUser = {
  name: null,
  subject: null,
  room: null,
  group: null,
  isAdmin: false
};

let roomData = null;
let timerInterval = null;
let focusStreak = 0;

// Screen navigation
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function goToWelcome() {
  showScreen('welcomeScreen');
}

function goToNameEntry() {
  showScreen('nameScreen');
}

function goToSubjectSelection() {
  const name = document.getElementById('userName').value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }
  currentUser.name = name;
  showScreen('subjectScreen');
}

function selectSubject(subject) {
  currentUser.subject = subject;
  goToRoomScreen();
}

function goToRoomScreen() {
  showScreen('roomScreen');
}

function goToCreateRoom() {
  document.getElementById('displayName').textContent = currentUser.name;
  document.getElementById('displaySubject').textContent = currentUser.subject;
  showScreen('createRoomScreen');
}

function goToJoinRoom() {
  showScreen('joinRoomScreen');
}

// Create room
function createRoom() {
  socket.emit('create_room', {
    name: currentUser.name,
    subject: currentUser.subject
  });
}

socket.on('room_created', (data) => {
  currentUser.room = data.roomCode;
  currentUser.isAdmin = true;
  roomData = { code: data.roomCode };
  
  // Store room code in sessionStorage for reference
  sessionStorage.setItem('currentRoom', data.roomCode);
  sessionStorage.setItem('userId', data.userId);
  
  document.getElementById('roomCodeDisplay').textContent = data.roomCode;
  showScreen('adminScreen');
  updateRoomInfo();
});

// Join room
function joinRoom() {
  const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
  if (!roomCode) {
    alert('Please enter a room code');
    return;
  }

  currentUser.room = roomCode;
  socket.emit('join_room', {
    roomCode: roomCode,
    name: currentUser.name,
    subject: currentUser.subject
  });
}

socket.on('join_pending', (data) => {
  sessionStorage.setItem('currentRoom', currentUser.room);
  showScreen('pendingScreen');
});

socket.on('join_approved', (data) => {
  currentUser.room = data.roomCode;
  currentUser.group = data.group;
  sessionStorage.setItem('currentRoom', data.roomCode);
  
  document.getElementById('groupLabel').textContent = `Your Group: ${data.group === 'group1' ? 'Group 1' : 'Group 2'}`;
  showScreen('studyRoomScreen');
  updateStudyRoom();
});

socket.on('join_rejected', (data) => {
  alert(data.message);
  goToWelcome();
});

// Admin controls
socket.on('join_request', (request) => {
  if (!currentUser.isAdmin) return;
  
  const list = document.getElementById('joinRequestsList');
  if (list.children.length === 1 && list.children[0].textContent.includes('No join requests')) {
    list.innerHTML = '';
  }

  const item = document.createElement('div');
  item.className = 'request-item';
  item.innerHTML = `
    <div class="request-info">
      <p><strong>${request.userName}</strong></p>
      <p>Subject: ${request.subject}</p>
      <p><small>${new Date(request.timestamp).toLocaleTimeString()}</small></p>
    </div>
    <div class="request-buttons">
      <button class="btn-approve" onclick="approveJoin('${request.userId}')">✅ Approve</button>
      <button class="btn-reject" onclick="rejectJoin('${request.userId}')">❌ Reject</button>
    </div>
  `;
  list.appendChild(item);
});

function approveJoin(userId) {
  socket.emit('approve_join', {
    roomCode: currentUser.room,
    userId: userId
  });
}

function rejectJoin(userId) {
  socket.emit('reject_join', {
    roomCode: currentUser.room,
    userId: userId
  });
}

socket.on('user_joined', (data) => {
  if (!currentUser.isAdmin) return;
  
  if (data.group === 'group1') {
    const count = parseInt(document.getElementById('group1Count').textContent) + 1;
    document.getElementById('group1Count').textContent = `${count} member${count !== 1 ? 's' : ''}`;
  } else {
    const count = parseInt(document.getElementById('group2Count').textContent) + 1;
    document.getElementById('group2Count').textContent = `${count} member${count !== 1 ? 's' : ''}`;
  }
});

// Timer
function startTimer() {
  const duration = parseInt(document.getElementById('timerDuration').value);
  if (duration < 25) {
    alert('Minimum timer duration is 25 minutes');
    return;
  }

  socket.emit('set_timer', {
    roomCode: currentUser.room,
    duration: duration
  });
}

socket.on('timer_start', (data) => {
  let remaining = data.duration * 60; // convert to seconds
  
  const updateTimer = () => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    document.getElementById('timerValue').textContent = 
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (remaining > 0) {
      remaining--;
      timerInterval = setTimeout(updateTimer, 1000);
    } else {
      addMessageToChat('Assistant', '⏰ Study session completed! Great job!');
      focusStreak++;
    }
  };

  updateTimer();
});

// Room info
function updateRoomInfo() {
  socket.emit('get_room_info', {
    roomCode: currentUser.room
  });
}

socket.on('room_info', (data) => {
  if (currentUser.isAdmin) {
    document.getElementById('group1Count').textContent = `${data.group1Count} member${data.group1Count !== 1 ? 's' : ''}`;
    document.getElementById('group2Count').textContent = `${data.group2Count} member${data.group2Count !== 1 ? 's' : ''}`;
  }
});

// Copy room code
function copyRoomCode() {
  const code = currentUser.room;
  navigator.clipboard.writeText(code).then(() => {
    alert(`Room code copied: ${code}`);
  });
}

// Study room
function updateStudyRoom() {
  if (currentUser.group === 'group1') {
    document.getElementById('groupLabel').textContent = '👥 Group 1';
  } else {
    document.getElementById('groupLabel').textContent = '👥 Group 2';
  }
}

// Voice messages
function sendVoiceMessage() {
  const input = document.getElementById('voiceMessage');
  const message = input.value.trim();
  if (!message) return;

  socket.emit('voice_message', {
    message: message
  });
  
  addMessageToChat(currentUser.name, message);
  input.value = '';
}

socket.on('voice_message', (data) => {
  addMessageToChat(data.userName, data.message);
});

function addMessageToChat(userName, message) {
  const messagesBox = document.getElementById('voiceMessages');
  const messageItem = document.createElement('div');
  messageItem.className = 'message-item';
  messageItem.innerHTML = `
    <div class="user-name">${userName}</div>
    <div class="message-text">${message}</div>
  `;
  messagesBox.appendChild(messageItem);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// AI Study Assistant
function askAssistant() {
  const input = document.getElementById('assistantQuestion');
  const question = input.value.trim();
  if (!question) return;

  socket.emit('ask_assistant', {
    question: question
  });

  // Add user question to chat
  const chatBox = document.getElementById('assistantChat');
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.textContent = `You: ${question}`;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  input.value = '';
}

socket.on('assistant_response', (data) => {
  const chatBox = document.getElementById('assistantChat');
  const assistantMsg = document.createElement('div');
  assistantMsg.className = 'chat-message assistant';
  assistantMsg.textContent = `🤖 Assistant: ${data.answer}`;
  chatBox.appendChild(assistantMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Doubt pulse
function sendDoubtSignal(signal) {
  socket.emit('doubt_signal', {
    signal: signal
  });
  
  addDoubtSignal(currentUser.name, signal);
}

socket.on('doubt_signal', (data) => {
  addDoubtSignal(data.userName, data.signal);
});

function addDoubtSignal(userName, signal) {
  const feed = document.getElementById('doubtFeed');
  const item = document.createElement('div');
  item.className = 'doubt-item';
  item.textContent = `${userName}: ${signal}`;
  feed.appendChild(item);
  feed.scrollTop = feed.scrollHeight;
}

// Leave room
function leaveRoom() {
  if (timerInterval) clearTimeout(timerInterval);
  currentUser.room = null;
  currentUser.group = null;
  currentUser.isAdmin = false;
  sessionStorage.removeItem('currentRoom');
  goToWelcome();
}

// Error handling
socket.on('error', (data) => {
  alert(`Error: ${data}`);
});

// Allow Enter key for inputs
document.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const activeId = document.activeElement.id;
    if (activeId === 'userName') goToSubjectSelection();
    else if (activeId === 'roomCode') joinRoom();
    else if (activeId === 'assistantQuestion') askAssistant();
    else if (activeId === 'voiceMessage') sendVoiceMessage();
  }
});