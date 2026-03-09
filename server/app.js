const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes     = require('./routes/auth');
const childRoutes    = require('./routes/child');
const programRoutes  = require('./routes/program');
const sessionRoutes  = require('./routes/session');
const analyticsRoutes = require('./routes/analytics');

const inputSanitizer = require('./middleware/inputSanitizer');

// Initialise in-process queue worker on startup
require('./queues/programQueue');

const app = express();

// --- Core middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// --- Security: prompt-injection / XSS guard on every state-mutating request ---
app.use(inputSanitizer);

// --- Routes ---
app.use('/api/auth',      authRoutes);
app.use('/api/children',  childRoutes);
app.use('/api/programs',  programRoutes);
app.use('/api/sessions',  sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Health check ---
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// --- 404 ---
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
