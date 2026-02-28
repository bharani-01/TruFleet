# TruFleet Backend Extension Guide

This guide shows how to add custom endpoints and extend the backend.

---

## 📁 Project Structure

```
server/
├── index.js              # Express app entry point
├── supabase.js          # Supabase client singleton
├── db/
│   └── schema.sql       # Database schema & seed data
└── routes/
    ├── vehicles.js      # Vehicle CRUD & operations
    ├── logs.js          # Audit logs
    ├── auth.js          # Authentication
    ├── analytics.js     # Fleet analytics
    └── notifications.js # Notification service
```

---

## 🔧 Adding a New Endpoint

### Example: Driver Management

#### 1. Create Route File

Create `server/routes/drivers.js`:

```javascript
/**
 * TruFleet — /api/drivers
 * Driver management operations
 */

'use strict';

const express  = require('express');
const supabase = require('../supabase');

const router = express.Router();
const TABLE  = 'drivers';

/* ── GET /api/drivers ── */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = supabase
      .from(TABLE)
      .select('*')
      .order('name', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    let results = data;
    
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.license_no || '').toLowerCase().includes(q)
      );
    }
    
    res.json(results);
  } catch (err) {
    console.error('[GET /api/drivers]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/drivers ── */
router.post('/', async (req, res) => {
  try {
    const { name, license_no, phone, status } = req.body;
    
    if (!name || !license_no) {
      return res.status(400).json({ 
        error: 'name and license_no are required' 
      });
    }
    
    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        name,
        license_no,
        phone: phone || null,
        status: status || 'Active',
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Log the creation
    await supabase.from('audit_logs').insert([{
      id: `EVT_${Date.now()}`,
      type: 'ADMIN',
      entity_id: data.id,
      description: `Driver ${name} added`,
      status: 'SUCCESS',
      detail: `License: ${license_no}`,
      json_data: data,
      timestamp: new Date().toISOString(),
    }]);
    
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/drivers]', err.message);
    if (err.message.includes('duplicate')) {
      return res.status(409).json({ 
        error: 'Driver with this license number already exists' 
      });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/drivers/:id ── */
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Driver not found' });
    
    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/drivers/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

#### 2. Register Route in Server

Edit `server/index.js`:

```javascript
// Add at top with other imports
const driversRouter = require('./routes/drivers');

// Add with other route registrations
app.use('/api/drivers', driversRouter);
```

#### 3. Add Database Table

Add to `server/db/schema.sql`:

```sql
-- ── DRIVERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drivers (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT      NOT NULL,
  license_no TEXT      NOT NULL UNIQUE,
  phone      TEXT,
  status     TEXT      NOT NULL DEFAULT 'Active'
               CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on drivers" ON drivers 
  FOR ALL USING (true) WITH CHECK (true);

-- Seed data
INSERT INTO drivers (name, license_no, phone, status)
VALUES 
  ('Rajesh Kumar', 'DL-2019-001234', '+91-9876543210', 'Active'),
  ('Amit Singh', 'MH-2020-005678', '+91-9876543211', 'Active')
ON CONFLICT (license_no) DO NOTHING;
```

#### 4. Add Frontend API Methods

Add to `trufleet-api.js`:

```javascript
// Add with other functions
async function getDrivers(opts = {}) {
  const params = new URLSearchParams();
  if (opts.status) params.set('status', opts.status);
  if (opts.search) params.set('search', opts.search);
  const qs = params.toString();
  return get('/drivers' + (qs ? '?' + qs : ''));
}

async function addDriver(driver) {
  return post('/drivers', driver);
}

async function updateDriver(id, updates) {
  return patch('/drivers/' + encodeURIComponent(id), updates);
}

// Add to window.TruFleet object
window.TruFleet = {
  // ... existing methods
  getDrivers,
  addDriver,
  updateDriver,
};
```

#### 5. Use in Frontend

```javascript
// Get all drivers
const drivers = await TruFleet.getDrivers();

// Search drivers
const active = await TruFleet.getDrivers({ status: 'Active', search: 'kumar' });

// Add driver
await TruFleet.addDriver({
  name: 'John Doe',
  license_no: 'DL-2024-999999',
  phone: '+91-9999999999',
  status: 'Active'
});

// Update driver
await TruFleet.updateDriver('driver-id', { status: 'Inactive' });
```

---

## 🔐 Adding Authentication Middleware

Protect endpoints with JWT authentication:

#### 1. Install JWT Package

```bash
npm install jsonwebtoken
```

#### 2. Create Auth Middleware

Create `server/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET };
```

#### 3. Update Login to Return JWT

Edit `server/routes/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  // ... existing validation code ...
  
  // Generate JWT
  const token = jwt.sign(
    { id: data.id, email: data.email, role: data.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    token,
    user: { /* user data */ }
  });
});
```

#### 4. Protect Endpoints

```javascript
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all vehicle routes
router.use(authenticateToken);

// Admin-only endpoint
router.delete('/:id', requireRole('Fleet Admin'), async (req, res) => {
  // ... delete logic
});
```

#### 5. Update Frontend Client

```javascript
// Store token after login
async function login(creds) {
  const result = await post('/auth/login', creds);
  if (result.token) {
    localStorage.setItem('trufleet_token', result.token);
    setCurrentUser(result.user);
  }
  return result;
}

// Include token in requests
async function request(method, path, body) {
  const token = localStorage.getItem('trufleet_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  };
  // ... rest of request logic
}
```

---

## 📨 Adding Email Notifications

Send emails for critical events:

#### 1. Install Nodemailer

```bash
npm install nodemailer
```

#### 2. Create Email Service

Create `server/services/email.js`:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: '"TruFleet" <noreply@trufleet.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

async function sendExpiryAlert(vehicle, daysLeft) {
  const subject = `⚠️ Insurance Expiring: ${vehicle.id}`;
  const html = `
    <h2>Insurance Expiry Alert</h2>
    <p>Vehicle <strong>${vehicle.id}</strong> (${vehicle.make} ${vehicle.type}) 
       has insurance expiring in <strong>${daysLeft} days</strong>.</p>
    <p><strong>Owner:</strong> ${vehicle.owner}</p>
    <p><strong>Provider:</strong> ${vehicle.insurance_provider}</p>
    <p><strong>Policy:</strong> ${vehicle.policy_number}</p>
    <p><strong>Expiry Date:</strong> ${vehicle.insurance_expiry}</p>
  `;
  await sendEmail({ to: 'admin@trufleet.com', subject, html });
}

module.exports = { sendEmail, sendExpiryAlert };
```

#### 3. Use in Routes

```javascript
const { sendExpiryAlert } = require('../services/email');

// In notifications route
router.get('/', async (req, res) => {
  // ... existing notification logic ...
  
  // Send email for critical alerts
  const critical = alerts.filter(a => a.severity === 'critical');
  for (const alert of critical) {
    const vehicle = alert.json_data.vehicle;
    const days = alert.json_data.days_remaining;
    await sendExpiryAlert(vehicle, days);
  }
  
  // ... return response
});
```

---

## 📊 Adding Webhook Support

Allow external systems to receive real-time updates:

#### 1. Create Webhook Service

Create `server/services/webhooks.js`:

```javascript
const fetch = require('node-fetch');

const webhookUrls = [
  process.env.WEBHOOK_URL_1,
  process.env.WEBHOOK_URL_2,
].filter(Boolean);

async function triggerWebhook(event, data) {
  if (webhookUrls.length === 0) return;
  
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };
  
  for (const url of webhookUrls) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(`Webhook sent: ${event} -> ${url}`);
    } catch (err) {
      console.error(`Webhook failed for ${url}:`, err.message);
    }
  }
}

module.exports = { triggerWebhook };
```

#### 2. Trigger on Events

```javascript
const { triggerWebhook } = require('../services/webhooks');

// After creating a vehicle
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('vehicles').insert(...);
  
  // Trigger webhook
  await triggerWebhook('vehicle.created', data);
  
  res.status(201).json(data);
});
```

---

## 🧪 Adding Unit Tests

Test your endpoints:

#### 1. Install Testing Tools

```bash
npm install --save-dev jest supertest
```

#### 2. Create Test File

Create `server/routes/__tests__/vehicles.test.js`:

```javascript
const request = require('supertest');
const app = require('../../index'); // Export app from index.js

describe('Vehicles API', () => {
  it('GET /api/vehicles should return array', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  it('GET /api/vehicles/kpis should return KPIs', async () => {
    const res = await request(app).get('/api/vehicles/kpis');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('active');
  });
  
  it('POST /api/vehicles should create vehicle', async () => {
    const vehicle = {
      id: 'TEST-123',
      make: 'Test Make',
      type: 'Test Type',
      vin: 'TEST-VIN-123',
      year: 2024,
      owner: 'Test Owner',
      insurance_provider: 'Test Provider',
      policy_number: 'TEST-POL-123',
      insurance_expiry: '2025-12-31',
    };
    
    const res = await request(app).post('/api/vehicles').send(vehicle);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 'TEST-123');
  });
});
```

#### 3. Add Test Script

Edit `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

#### 4. Run Tests

```bash
npm test
```

---

## 📈 Adding Logging

Structured logging for production:

```bash
npm install winston
```

Create `server/utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

Use in routes:

```javascript
const logger = require('../utils/logger');

router.get('/', async (req, res) => {
  logger.info('Fetching vehicles', { query: req.query });
  // ... route logic
});
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` in environment
- [ ] Configure proper Supabase RLS policies
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Add health check endpoint monitoring
- [ ] Set up CI/CD pipeline
- [ ] Review and tighten CORS policy
- [ ] Add request logging
- [ ] Configure production database
- [ ] Test with production data volume
- [ ] Document API for external users
- [ ] Set up API versioning

---

Your TruFleet backend is now fully extensible! 🎉
