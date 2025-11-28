const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const EventEmitter = require('events');

// Global event emitter for real-time updates
const dataEvents = new EventEmitter();
dataEvents.setMaxListeners(100);
global.dataEvents = dataEvents;

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

// Trust proxy for Cloud Run
app.set('trust proxy', 1);

// Rate limiting for webhook (100 requests per minute per IP)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => res.status(200).send('🤖 Akademi-AI (Modular) is Online!'));

// SSE endpoint for real-time updates
app.get('/api/events/:phone', (req, res) => {
  const { phone } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onUpdate = (data) => {
    // Match specific phone OR 'demo' channel for all demo user updates
    if (data.phone === phone || (phone === 'demo' && data.data?.is_demo)) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  dataEvents.on('update', onUpdate);
  req.on('close', () => dataEvents.off('update', onUpdate));
});

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Frontend SPA routes
const dashboardRoutes = ['/', '/majelis', '/majelis/:id', '/business-types', '/financial-literacy', '/how-it-works', '/demo', '/secret', '/user-profile/:phone'];
dashboardRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
});

// API routes
app.use('/webhook', webhookLimiter, webhookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/majelis', majelisRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api', ragRoutes);

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));