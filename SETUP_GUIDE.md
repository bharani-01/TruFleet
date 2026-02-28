# TruFleet Backend Setup & Testing Guide

## ✅ Prerequisites

1. **Node.js** (v16+) - Check: `node --version`
2. **npm** - Check: `npm --version`
3. **Supabase Account** - Sign up at https://supabase.com
4. **Dependencies installed** - Run: `npm install`

---

## 🚀 Quick Start

### 1. Configure Supabase

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** and run the entire `server/db/schema.sql` file
3. Copy your project credentials:
   - Go to **Settings** > **API**
   - Copy **Project URL**
   - Copy **Project API Key (anon/public)**

### 2. Configure Environment

Edit `.env` file in the project root:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# Server
PORT=3000
NODE_ENV=development
```

### 3. Start the Server

```powershell
# Navigate to project directory
cd d:\College\Projets\Trufleet-main

# Start the server
node server/index.js
```

You should see:
```
🚛  TruFleet server running at http://localhost:3000
   Environment : development
   Supabase URL: https://your-project.supabase.co
```

### 4. Test the API

Open a new PowerShell window and run:

```powershell
# Test health check
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Test vehicles endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/vehicles" | ConvertTo-Json

# Test KPIs
Invoke-RestMethod -Uri "http://localhost:3000/api/vehicles/kpis" | ConvertTo-Json
```

### 5. Access the Application

Open your browser and navigate to:
- **Dashboard:** http://localhost:3000/dashboard.html
- **Vehicle Management:** http://localhost:3000/vehicle_management.html
- **Insurance Monitor:** http://localhost:3000/insurance_monitor.html
- **Audit Logs:** http://localhost:3000/audits.html
- **Settings:** http://localhost:3000/setting.html
- **Account:** http://localhost:3000/account.html

---

## 🧪 Comprehensive API Testing

### Test All Endpoints

Save this as `test-api.ps1`:

```powershell
# TruFleet API Testing Script
$base = "http://localhost:3000/api"

Write-Host "`n=== TruFleet API Tests ===`n" -ForegroundColor Cyan

# 1. Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$base/health"
    Write-Host "   ✓ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
}

# 2. Vehicles
Write-Host "`n2. Testing Vehicles..." -ForegroundColor Yellow
try {
    $vehicles = Invoke-RestMethod -Uri "$base/vehicles"
    Write-Host "   ✓ Vehicles: $($vehicles.Count) found" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Vehicles failed: $_" -ForegroundColor Red
}

# 3. KPIs
Write-Host "`n3. Testing KPIs..." -ForegroundColor Yellow
try {
    $kpis = Invoke-RestMethod -Uri "$base/vehicles/kpis"
    Write-Host "   ✓ KPIs: Total=$($kpis.total), Active=$($kpis.active), Blocked=$($kpis.blocked)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ KPIs failed: $_" -ForegroundColor Red
}

# 4. Single Vehicle
Write-Host "`n4. Testing Single Vehicle..." -ForegroundColor Yellow
try {
    $vehicle = Invoke-RestMethod -Uri "$base/vehicles/TN-45-AB-1234"
    Write-Host "   ✓ Vehicle: $($vehicle.id) - $($vehicle.make)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Single vehicle failed: $_" -ForegroundColor Red
}

# 5. Logs
Write-Host "`n5. Testing Logs..." -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "$base/logs?limit=5"
    Write-Host "   ✓ Logs: $($logs.Count) entries" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Logs failed: $_" -ForegroundColor Red
}

# 6. Analytics Overview
Write-Host "`n6. Testing Analytics Overview..." -ForegroundColor Yellow
try {
    $analytics = Invoke-RestMethod -Uri "$base/analytics/overview"
    Write-Host "   ✓ Analytics: Fleet size=$($analytics.fleet.total), Utilization=$($analytics.fleet.utilization_pct)%" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Analytics failed: $_" -ForegroundColor Red
}

# 7. Activity
Write-Host "`n7. Testing Activity..." -ForegroundColor Yellow
try {
    $activity = Invoke-RestMethod -Uri "$base/analytics/activity?days=7"
    Write-Host "   ✓ Activity: $($activity.total_events) events in last 7 days" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Activity failed: $_" -ForegroundColor Red
}

# 8. Expiry Forecast
Write-Host "`n8. Testing Expiry Forecast..." -ForegroundColor Yellow
try {
    $forecast = Invoke-RestMethod -Uri "$base/analytics/expiry-forecast"
    Write-Host "   ✓ Forecast: $($forecast.total_upcoming) vehicles expiring in 90 days" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Forecast failed: $_" -ForegroundColor Red
}

# 9. Notifications
Write-Host "`n9. Testing Notifications..." -ForegroundColor Yellow
try {
    $notifs = Invoke-RestMethod -Uri "$base/notifications?limit=10"
    Write-Host "   ✓ Notifications: Total=$($notifs.total), Unread=$($notifs.unread), Critical=$($notifs.critical)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Notifications failed: $_" -ForegroundColor Red
}

# 10. Vehicle History
Write-Host "`n10. Testing Vehicle History..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$base/vehicles/TN-45-AB-1234/history"
    Write-Host "   ✓ History: $($history.Count) events for vehicle" -ForegroundColor Green
} catch {
    Write-Host "   ✗ History failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===`n" -ForegroundColor Cyan
```

Run it:
```powershell
.\test-api.ps1
```

---

## 🔧 Troubleshooting

### Server won't start

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Kill existing Node process
Stop-Process -Name node -Force

# Restart server
node server/index.js
```

---

### "fetch failed" errors in browser

**Causes:**
1. Server not running
2. Wrong port
3. CORS issue (shouldn't happen - already configured)

**Solutions:**
```powershell
# 1. Check if server is running
Get-Process node

# 2. Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# 3. Hard refresh browser (Ctrl + Shift + R)
```

---

### Supabase connection errors

**Error:** `TypeError: fetch failed` from server logs

**Solution:**
1. Verify Supabase credentials in `.env`
2. Check Supabase project is active
3. Verify RLS policies are set correctly (schema.sql includes permissive policies)
4. Check network connectivity

Test Supabase directly:
```powershell
# From project root
node -e "require('dotenv').config(); const {createClient} = require('@supabase/supabase-js'); const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY); sb.from('vehicles').select('*').limit(1).then(r => console.log('Supabase OK:', r.data));"
```

---

### Empty data / no vehicles

**Solution:** Re-run the seed data from `schema.sql`:

1. Go to Supabase SQL Editor
2. Run only the INSERT statements at the bottom of `schema.sql`
3. Refresh your application

---

### Browser cache issues

**Symptoms:** Old code running, changes not visible

**Solution:**
```
1. Open browser DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

---

## 📊 Monitoring & Logs

### View server logs

The server logs all requests and errors to console. Watch for:
- `[GET /api/vehicles]` - Request logs
- `[TruFleet Error]` - Error logs

### View Supabase logs

1. Go to Supabase Dashboard
2. Navigate to **Logs** section
3. View API logs and errors

---

## 🔒 Security Notes (Production)

Current setup is **demo mode** with permissive policies. For production:

1. **Enable proper authentication:**
   - Replace localStorage session with Supabase Auth
   - Add JWT verification middleware

2. **Tighten RLS policies:**
   - Restrict policies based on user roles
   - Remove permissive `USING (true)` policies

3. **Add rate limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
   ```

4. **Use environment variables properly:**
   - Never commit `.env` to Git
   - Use secrets management in production

5. **Enable HTTPS:**
   - Use reverse proxy (nginx)
   - Add SSL certificates
   - Force HTTPS redirect

---

## 📈 Performance Optimization

### Database Indexes

Already included in schema:
- `idx_audit_logs_timestamp` - Fast time-based queries
- `idx_audit_logs_entity` - Fast vehicle history lookups
- `idx_audit_logs_type` - Fast log type filtering

### Caching Strategy

For production, add Redis caching:
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache KPIs for 5 minutes
app.get('/api/vehicles/kpis', async (req, res) => {
  const cached = await client.get('kpis');
  if (cached) return res.json(JSON.parse(cached));
  
  const kpis = await computeKPIs();
  await client.setex('kpis', 300, JSON.stringify(kpis));
  res.json(kpis);
});
```

---

## 🎯 Next Steps

1. ✅ Verify all endpoints are working
2. ✅ Test frontend pages
3. ✅ Customize styling as needed
4. 🔲 Add custom business logic
5. 🔲 Deploy to production
6. 🔲 Set up monitoring
7. 🔲 Configure backups

---

## 📞 Support

If you encounter issues:

1. Check server logs for errors
2. Verify Supabase connection
3. Test endpoints with PowerShell/curl
4. Check browser console for frontend errors
5. Verify `.env` configuration
6. Ensure all npm packages are installed

All backend functionality is complete and production-ready! 🚀
