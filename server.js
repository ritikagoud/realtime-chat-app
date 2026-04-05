const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/chatapp')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Models
const User = require('./models/User');
const Message = require('./models/Message');

// Routes
app.get('/', (req, res) => {
  res.send("Server running");
});

// Register
app.post('/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send(user);
});

// Login
app.post('/login', async (req, res) => {
  const user = await User.findOne(req.body);
  if (user) res.send(user);
  else res.status(404).send("User not found");
});

// Get Messages
app.get('/messages', async (req, res) => {
  const messages = await Message.find();
  res.send(messages);
});

// Socket.IO
io.on('connection', (socket) => {
  console.log("User connected");

  socket.on('sendMessage', async (data) => {
    const message = new Message(data);
    await message.save();

    io.emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});

// Start Server
server.listen(3000, () => {
  console.log("Server started on port 3000");
});
