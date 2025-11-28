const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { getGeminiResponse } = require('./src/aiEngine');
const { sendMessage } = require('./src/whatsapp');
const { 
  getAllUsers, 
  updateUserStatus,
  getAllMajelis,
  getMajelis,
  createMajelis,
  updateMajelis,
  deleteMajelis,
  addMemberToMajelis,
  removeMemberFromMajelis
} = require('./src/db');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for Dashboard

// --- SERVE MAJELIS PAGE (before static middleware) ---
app.get('/majelis', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public/majelis.html'));
});

// --- HEALTH CHECK ---
app.get('/health', (req, res) => res.status(200).send('🤖 Akademi-AI (Modular) is Online!'));

// --- SERVE STATIC DASHBOARD ---
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

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

// Get All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get User Business Images
app.get('/api/users/:phone/images', async (req, res) => {
  try {
    const { getUserBusinessIntelligence } = require('./src/db');
    const biData = await getUserBusinessIntelligence(req.params.phone);
    
    // Filter only items with images (building and inventory)
    const imagesData = biData.filter(item => item.has_image && item.image_data);
    
    res.json(imagesData);
  } catch (error) {
    console.error('Error fetching user images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Verify User
app.post('/api/users/verify', async (req, res) => {
  const { phone, status } = req.body;
  if (!phone || typeof status !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    const updatedUser = await updateUserStatus(phone, status);
    if (updatedUser) {
      res.json({ success: true, user: updatedUser });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete User
app.delete('/api/users/:phone', async (req, res) => {
  const { phone } = req.params;
  
  try {
    const { deleteUser } = require('./src/db');
    const deleted = await deleteUser(phone);
    
    if (deleted) {
      res.json({ success: true, message: 'User deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- MAJELIS MANAGEMENT APIs ---

// Get all Majelis
app.get('/api/majelis', async (req, res) => {
  try {
    const majelis = await getAllMajelis();
    res.json(majelis);
  } catch (error) {
    console.error('Error fetching majelis:', error);
    res.status(500).json({ error: 'Failed to fetch majelis' });
  }
});

// Get single Majelis
app.get('/api/majelis/:id', async (req, res) => {
  try {
    const majelis = await getMajelis(req.params.id);
    if (majelis) {
      res.json(majelis);
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error fetching majelis:', error);
    res.status(500).json({ error: 'Failed to fetch majelis' });
  }
});

// Create Majelis
app.post('/api/majelis', async (req, res) => {
  try {
    const majelis = await createMajelis(req.body);
    if (majelis) {
      res.json({ success: true, majelis });
    } else {
      res.status(500).json({ error: 'Failed to create majelis' });
    }
  } catch (error) {
    console.error('Error creating majelis:', error);
    res.status(500).json({ error: 'Failed to create majelis' });
  }
});

// Update Majelis
app.put('/api/majelis/:id', async (req, res) => {
  try {
    const majelis = await updateMajelis(req.params.id, req.body);
    if (majelis) {
      res.json({ success: true, majelis });
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error updating majelis:', error);
    res.status(500).json({ error: 'Failed to update majelis' });
  }
});

// Delete Majelis
app.delete('/api/majelis/:id', async (req, res) => {
  try {
    const deleted = await deleteMajelis(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Majelis deleted' });
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error deleting majelis:', error);
    res.status(500).json({ error: 'Failed to delete majelis' });
  }
});

// Get all Business Types (RAG)
app.get('/api/business-types', async (req, res) => {
  try {
    const { Firestore } = require('@google-cloud/firestore');
    const db = new Firestore({
      projectId: process.env.GCP_PROJECT_ID || 'stellar-zoo-478021-v8',
    });
    
    const snapshot = await db.collection('business_classifications').get();
    const businessTypes = [];
    snapshot.forEach(doc => {
      businessTypes.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(businessTypes);
  } catch (error) {
    console.error('Error fetching business types:', error);
    res.status(500).json({ error: 'Failed to fetch business types' });
  }
});

// Add member to Majelis
app.post('/api/majelis/:id/members', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await addMemberToMajelis(req.params.id, phone);
    
    if (!result) {
      return res.status(404).json({ error: 'Majelis not found' });
    }
    
    if (result.error) {
      return res.status(400).json({ 
        error: result.error,
        currentMajelisId: result.currentMajelisId 
      });
    }
    
    res.json({ success: true, majelis: result });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from Majelis
app.delete('/api/majelis/:id/members/:phone', async (req, res) => {
  try {
    const majelis = await removeMemberFromMajelis(req.params.id, req.params.phone);
    if (majelis) {
      res.json({ success: true, majelis });
    } else {
      res.status(404).json({ error: 'Majelis not found' });
    }
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));