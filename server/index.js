/**
 * TruFleet — Express Entry Point
 */

'use strict';

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');

const vehiclesRouter        = require('./routes/vehicles');
const logsRouter            = require('./routes/logs');
const authRouter            = require('./routes/auth');
const analyticsRouter       = require('./routes/analytics');
const notificationsRouter   = require('./routes/notifications');
const fleetVehiclesRouter   = require('./routes/fleet_vehicles');
const emailRecipientsRouter = require('./routes/email_recipients');
const dispatchRouter        = require('./routes/dispatch');
const ownersRouter          = require('./routes/owners');
const insuranceRouter       = require('./routes/insurance');
const identityRouter        = require('./routes/identity');
const rolesRouter           = require('./routes/roles');

const { startScheduler } = require('./services/scheduler');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(cors());
app.use(bodyParser.json());

/* ── Static files — serve HTML pages from project root ── */
app.use(express.static(path.join(__dirname, '..')));

/* ── Block direct URL access to private server-side views ── */
app.use((req, res, next) => {
  if (/^\/server\//i.test(req.path)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

/* ── Redirect old static path → canonical endpoint ── */
app.get('/fleet_register.html', (_req, res) => {
  res.redirect(301, '/fleet-register');
});

/* ── Dedicated page route — fleet-register is accessible ONLY via this endpoint ── */
app.get('/fleet-register', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'fleet_register.html'));
});

/* ── API Routes ── */
app.use('/api/vehicles',          vehiclesRouter);
app.use('/api/logs',              logsRouter);
app.use('/api/auth',              authRouter);
app.use('/api/analytics',         analyticsRouter);
app.use('/api/notifications',     notificationsRouter);
app.use('/api/fleet-vehicles',    fleetVehiclesRouter);
app.use('/api/email-recipients',  emailRecipientsRouter);
app.use('/api/dispatch',          dispatchRouter);
app.use('/api/owners',            ownersRouter);
app.use('/api/insurance',         insuranceRouter);
app.use('/api/identity',          identityRouter);
app.use('/api/roles',             rolesRouter);

/* ── Health check ── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ── Catch-all: serve index (dashboard) for any unmatched route ── */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

/* ── Global error handler ── */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[TruFleet Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚛  TruFleet server running at http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL}\n`);
  startScheduler();
});
