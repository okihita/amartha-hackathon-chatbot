require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const EventEmitter = require('events');

// Global event emitter for real-time updates
const dataEvents = new EventEmitter();
dataEvents.setMaxListeners(500); // Increased for multiple concurrent SSE connections
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
const analyticsRoutes = require('./src/routes/analyticsRoutes');

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

// Rate limiting for analytics (200 requests per minute - more lenient for dashboard)
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: 'Too many analytics requests',
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(bodyParser.json());

// CORS configuration - allow Vercel frontend, localhost, and Cloud Run
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      // Local development
      'http://localhost:5173',
      'http://localhost:8080',
      // Vercel deployments
      /\.vercel\.app$/,
      // Allow requests with no origin (mobile apps, Postman, etc.)
    ];

    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = allowedOrigins.some(allowed =>
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      // Still allow for development, but log warning
      console.warn(`CORS warning: origin ${origin} not in allowlist`);
      callback(null, true);
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Health check
app.get('/health', (req, res) => res.status(200).send('🤖 UMKM Assistant API is Online!'));

// SSE endpoint for real-time updates
app.get('/api/events/:phone', (req, res) => {
  const { phone } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx/Cloud Run buffering
  res.flushHeaders();

  // Send initial ping
  res.write(': ping\n\n');

  // Keep-alive every 30s to prevent timeout
  const keepAlive = setInterval(() => res.write(': ping\n\n'), 30000);

  const onUpdate = (data) => {
    if (data.phone === phone || (phone === 'demo' && data.data?.is_demo) || phone === 'users') {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  dataEvents.on('update', onUpdate);
  req.on('close', () => {
    clearInterval(keepAlive);
    dataEvents.off('update', onUpdate);
  });
});

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Frontend SPA routes
const dashboardRoutes = ['/', '/majelis', '/majelis/:id', '/business-types', '/financial-literacy', '/how-it-works', '/demo', '/secret', '/user-profile/:phone', '/analytics'];
dashboardRoutes.forEach(route => {
  app.get(route, (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https: blob:; frame-src https://www.google.com https://maps.google.com;");
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
});

// API routes
app.use('/webhook', webhookLimiter, webhookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/majelis', majelisRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api', ragRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);

app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));