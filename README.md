# 📚 Study Circle - Collaborative Study Rooms

A revolutionary online study platform that combines collaborative studying with private group communication and AI-powered study assistance.

## 🎯 Key Features

### Private Voice Circles 🎙️
- Multiple groups can exist in one study room
- Each group has private audio/chat channels
- Only group members can hear and communicate with each other

### Subject-Based Matching 🧠
- Students are automatically matched based on study subjects
- Supports: Medical Board Prep, Calculus, Coding, Accounting, Finance, Marketing, Business Economics, and more

### Admin Controls 👑
- Create study rooms and manage join requests
- Approve/reject student applications
- Set focus timer duration (minimum 25 minutes)
- Monitor group status

### AI Study Assistant 🤖
- Ask study-related questions directly in the app
- Get instant explanations and clarifications
- No need to leave the study room

### Doubt Pulse ❓
- Quick signals: "Need Help", "I Have a Doubt", "Ready to Discuss"
- Communicate with group members efficiently

### Focus Timer ⏱️
- Structured study sessions (minimum 25 minutes)
- Admin can set custom durations (25, 30, 45, 60, 90+ minutes)
- Encourages focused, uninterrupted study time

### Focus Streak 🔥
- Track consecutive completed study sessions
- Build motivation through consistency
- Visual feedback for achievements

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tej010101/study-circle-app.git
cd study-circle-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 📋 User Flow

1. **Enter Your Name** - Personalize your experience
2. **Select Subject** - Choose what you're studying
3. **Create or Join Room** - Start or join a study session
4. **Admin Approves** (if joining) - Admin accepts your request
5. **Join Your Group** - Automatically assigned to Group 1 or Group 2
6. **Study Together** - Use voice chat, AI assistant, and doubt pulse
7. **Complete Timer** - Finish your focused study session

## 🔧 Technology Stack

- **Backend**: Node.js + Express
- **Real-time Communication**: Socket.IO
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Architecture**: Event-driven with real-time WebSocket connections

## 📱 Features in Detail

### Study Rooms
- Create unlimited study rooms
- Share room codes with other students
- Support multiple groups within one room

### Private Groups
- Group 1 and Group 2 with separate communication channels
- Admin controls group membership
- Subject-based automatic assignment

### Video & Voice
- Group video calls (feature-ready)
- Voice chat within groups
- Text messaging to group members

### Focus Features
- Timer with minimum 25-minute sessions
- Focus streak tracking
- Session completion notifications

### AI Assistant
Built-in support for:
- "Explain demand in simple language"
- "What is differentiation?"
- "Calculus help"
- Subject-specific explanations

## 🔒 Privacy & Security

- **Private Groups**: Communication restricted by group membership
- **Admin Approval**: Students can't self-assign to groups
- **No Switching**: Students stay with assigned group for session
- **Controlled Access**: Admin controls who enters the room

## 🎮 Admin Dashboard

Admins get exclusive access to:
- View all join requests
- Approve/reject students
- Set and start focus timer
- Monitor group sizes
- Share room code

## 📊 Study Session Statistics

- Track focus streak
- Monitor study hours
- See group participation
- Identify active learners

## 🐛 Known Limitations (Hackathon Version)

- Video calling: UI ready, integration pending
- Focus streak: Basic implementation
- AI Assistant: Demo responses (expandable)
- Persistence: Data stored in-memory (needs database)

## 🔄 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication & profiles
- [ ] Study statistics and analytics
- [ ] Advanced AI with GPT integration
- [ ] Scheduled study sessions
- [ ] Leaderboards and achievements
- [ ] Mobile app versions
- [ ] Calendar integration
- [ ] Study material sharing
- [ ] Performance metrics

## 📞 Support

For issues or suggestions, please create an issue in the repository.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributors

- Tej Patil (@tej010101)

---

**Study Circle** - Making Online Collaboration Focused, Private, and Productive 📚✨