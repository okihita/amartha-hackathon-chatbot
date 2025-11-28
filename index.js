const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { getGeminiResponse } = require('./src/aiEngine');
const { sendMessage } = require('./src/whatsapp');
const { getAllUsers, updateUserStatus } = require('./src/db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for Dashboard

// --- SERVE STATIC DASHBOARD ---
app.use(express.static(path.join(__dirname, 'public')));

// --- HEALTH CHECK ---
app.get('/health', (req, res) => res.status(200).send('🤖 Akademi-AI (Modular) is Online!'));

// --- WEBHOOK VERIFICATION ---
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === MY_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// --- MESSAGE HANDLER ---
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object) {
    const changes = body.entry?.[0]?.changes?.[0]?.value;
    if (changes?.messages?.[0]) {
      const message = changes.messages[0];
      const senderPhone = message.from;

      if (message.type === 'text') {
        const incomingText = message.text.body;
        console.log(`📝 Received from ${senderPhone}: ${incomingText}`);

        // Call AI Engine
        const aiReply = await getGeminiResponse(incomingText, senderPhone);

        // Send Reply
        await sendMessage(senderPhone, aiReply);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// --- ADMIN DASHBOARD APIs ---

// Get All Users
app.get('/api/users', (req, res) => {
  const users = getAllUsers();
  res.json(users);
});

// Verify User
app.post('/api/users/verify', (req, res) => {
  const { phone, status } = req.body;
  if (!phone || typeof status !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const updatedUser = updateUserStatus(phone, status);
  if (updatedUser) {
    res.json({ success: true, user: updatedUser });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));