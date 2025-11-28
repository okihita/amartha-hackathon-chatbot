const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const { getGeminiResponse } = require('./src/aiEngine');
const { sendMessage } = require('./src/whatsapp');

// Route imports
const userRoutes = require('./src/routes/userRoutes');
const majelisRoutes = require('./src/routes/majelisRoutes');
const superadminRoutes = require('./src/routes/superadminRoutes');
const ragRoutes = require('./src/routes/ragRoutes');

const app = express();
const PORT = process.env.PORT || 8080;
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// --- HEALTH CHECK ---
app.get('/health', (req, res) => res.status(200).send('🤖 Akademi-AI (Modular) is Online!'));

// --- SERVE STATIC ASSETS (CSS, JS, images) ---
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// --- SERVE FRONTEND (SPA) ---
// Serve the Vite-built frontend for all dashboard routes
const dashboardRoutes = ['/', '/majelis', '/business-types', '/financial-literacy', '/user-profile/:phone'];
dashboardRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
});

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
      } else if (message.type === 'image') {
        console.log(`📷 Image received from ${senderPhone}`);
        const imageId = message.image.id;
        const caption = message.image.caption || '';
        
        // Process image with AI
        const { analyzeImage } = require('./src/imageAnalyzer');
        const aiReply = await analyzeImage(imageId, caption, senderPhone);
        
        await sendMessage(senderPhone, aiReply);
      } else if (message.type === 'audio' || message.type === 'voice') {
        console.log(`🎤 Audio received from ${senderPhone} (not supported)`);
        await sendMessage(
          senderPhone, 
          "Maaf Bu, saat ini saya belum bisa memproses pesan suara. Silakan kirim pesan teks untuk pertanyaan Ibu. 😊"
        );
      } else {
        console.log(`📎 ${message.type} received from ${senderPhone} (not supported)`);
        await sendMessage(
          senderPhone, 
          "Maaf Bu, saya hanya bisa memproses pesan teks. Silakan kirim pertanyaan Ibu dalam bentuk teks. 😊"
        );
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// --- ADMIN DASHBOARD APIs ---
app.use('/api/users', userRoutes);
app.use('/api/majelis', majelisRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api', ragRoutes);

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));