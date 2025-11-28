const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Validate required environment variables
const requiredEnvVars = ['MY_VERIFY_TOKEN', 'WHATSAPP_TOKEN', 'PHONE_NUMBER_ID', 'GEMINI_API_KEY', 'GCP_PROJECT_ID'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const webhookRoutes = require('./src/routes/webhookRoutes');
const userRoutes = require('./src/routes/userRoutes');
const majelisRoutes = require('./src/routes/majelisRoutes');
const superadminRoutes = require('./src/routes/superadminRoutes');
const ragRoutes = require('./src/routes/ragRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => res.status(200).send('🤖 Akademi-AI (Modular) is Online!'));

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Frontend SPA routes
const dashboardRoutes = ['/', '/majelis', '/business-types', '/financial-literacy', '/user-profile/:phone'];
dashboardRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
});

// API routes
app.use('/webhook', webhookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/majelis', majelisRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api', ragRoutes);

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));