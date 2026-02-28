# TruFleet Backend API Reference

**Base URL:** `http://localhost:3000/api`

## Authentication
All endpoints are currently open (demo mode). In production, add JWT authentication middleware.

---

## 🚛 Vehicles API

### `GET /api/vehicles`
Get all vehicles with optional filtering.

**Query Parameters:**
- `status` - Filter by status: `Active` | `Blocked`
- `risk` - Filter by risk: `expiring` (0-7 days)
- `search` - Search across plate, owner, make, VIN

**Response:**
```json
[
  {
    "id": "TN-45-AB-1234",
    "make": "Volvo FH16",
    "type": "Heavy Commercial",
    "vin": "MAT-894723-XJ9",
    "engine_no": "ENG-84738292",
    "year": 2023,
    "owner": "John Doe",
    "owner_initials": "JD",
    "owner_color": "#3B82F6",
    "status": "Active",
    "photo": "https://...",
    "insurance_provider": "TATA AIG",
    "policy_number": "POL-TATA-112233",
    "insurance_expiry": "2026-11-12",
    "insurance_health_pct": 95,
    "days_until_expiry": 257,
    "risk_class": "safe"
  }
]
```

---

### `GET /api/vehicles/kpis`
Get dashboard KPI summary.

**Response:**
```json
{
  "total": 10,
  "active": 9,
  "blocked": 1,
  "expiring": 3,
  "compliant": 5,
  "nonComp": 2,
  "utilPct": 90,
  "compPct": 50
}
```

---

### `GET /api/vehicles/:id`
Get a single vehicle by plate ID.

**Parameters:**
- `id` - Vehicle plate number (URL encoded)

**Response:** Single vehicle object (same as GET /vehicles)

---

### `POST /api/vehicles`
Create a new vehicle.

**Request Body:**
```json
{
  "id": "TN-45-AB-1234",
  "make": "Volvo FH16",
  "type": "Heavy Commercial",
  "vin": "MAT-894723-XJ9",
  "engine_no": "ENG-84738292",
  "year": 2023,
  "owner": "John Doe",
  "owner_initials": "JD",
  "owner_color": "#3B82F6",
  "status": "Active",
  "photo": "https://...",
  "insurance_provider": "TATA AIG",
  "policy_number": "POL-TATA-112233",
  "insurance_expiry": "2026-11-12"
}
```

**Response:** Created vehicle object with computed fields

---

### `PATCH /api/vehicles/:id`
Update vehicle fields.

**Request Body:** Any vehicle fields to update
```json
{
  "status": "Blocked",
  "insurance_expiry": "2027-01-01",
  "photo": "https://new-photo-url.com/image.jpg"
}
```

**Response:** Updated vehicle object

---

### `DELETE /api/vehicles/:id`
Delete a vehicle permanently.

**Response:**
```json
{
  "success": true,
  "deleted": { /* vehicle object */ }
}
```

---

### `POST /api/vehicles/bulk-delete`
Delete multiple vehicles at once.

**Request Body:**
```json
{
  "ids": ["TN-45-AB-1234", "KA-05-CD-5678"]
}
```

**Response:**
```json
{
  "success": true,
  "deleted": 2,
  "vehicles": [ /* array of deleted vehicles */ ]
}
```

---

### `POST /api/vehicles/bulk-status`
Update status for multiple vehicles.

**Request Body:**
```json
{
  "ids": ["TN-45-AB-1234", "KA-05-CD-5678"],
  "status": "Blocked"
}
```

**Response:**
```json
{
  "success": true,
  "updated": 2,
  "vehicles": [ /* array of updated vehicles */ ]
}
```

---

### `GET /api/vehicles/:id/history`
Get audit log history for a vehicle.

**Response:** Array of audit log entries

---

## 📊 Analytics API

### `GET /api/analytics/overview`
Get comprehensive fleet analytics.

**Response:**
```json
{
  "fleet": {
    "total": 10,
    "active": 9,
    "blocked": 1,
    "utilization_pct": 90
  },
  "insurance": {
    "compliant": 5,
    "expiring_soon": 3,
    "expired": 2,
    "compliance_pct": 50
  },
  "risk": {
    "critical": 2,
    "warning": 3,
    "safe": 5
  },
  "providers": [
    { "provider": "HDFC ERGO", "count": 4, "pct": 40 }
  ],
  "makes": [
    { "make": "Volvo", "count": 3, "pct": 30 }
  ],
  "types": [
    { "type": "Heavy Commercial", "count": 6, "pct": 60 }
  ],
  "years": [
    { "year": 2023, "count": 3 }
  ],
  "avg_fleet_age": 3.2
}
```

---

### `GET /api/analytics/activity`
Get recent activity summary.

**Query Parameters:**
- `days` - Number of days to retrieve (default: 30)

**Response:**
```json
{
  "total_events": 156,
  "by_type": {
    "AUTH": 89,
    "ADMIN": 45,
    "SYSTEM": 22
  },
  "daily": [
    { "date": "2026-02-01", "count": 12 },
    { "date": "2026-02-02", "count": 8 }
  ]
}
```

---

### `GET /api/analytics/expiry-forecast`
Get 90-day insurance expiry forecast.

**Response:**
```json
{
  "total_upcoming": 7,
  "forecast": [
    {
      "week_start": "2026-03-02",
      "count": 2,
      "vehicles": [ /* vehicle objects */ ]
    }
  ]
}
```

---

## 🔔 Notifications API

### `GET /api/notifications`
Get all notifications (auto-generated + manual).

**Query Parameters:**
- `read` - Filter by read status: `true` | `false`
- `limit` - Max notifications to return (default: 50)

**Response:**
```json
{
  "total": 15,
  "unread": 8,
  "critical": 3,
  "notifications": [
    {
      "id": "ALERT_TN-45-AB-1234_EXP",
      "type": "NOTIFICATION",
      "entity_id": "TN-45-AB-1234",
      "description": "URGENT: TN-45-AB-1234 insurance expires in 2 days",
      "status": "UNREAD",
      "detail": "Volvo FH16 Heavy Commercial — TATA AIG",
      "severity": "warning",
      "auto_generated": true,
      "timestamp": "2026-11-12",
      "json_data": {
        "vehicle": { /* vehicle object */ },
        "days_remaining": 2
      }
    }
  ]
}
```

---

### `POST /api/notifications`
Create a custom notification.

**Request Body:**
```json
{
  "entity_id": "SYSTEM",
  "description": "System maintenance scheduled",
  "severity": "info",
  "detail": "Downtime: 2AM-4AM"
}
```

**Response:** Created notification object

---

### `PATCH /api/notifications/:id/read`
Mark notification as read.

**Response:** Updated notification object

---

### `POST /api/notifications/mark-all-read`
Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "marked": 8
}
```

---

### `DELETE /api/notifications/:id`
Delete a notification.

**Response:**
```json
{
  "success": true
}
```

---

## 📝 Logs API

### `GET /api/logs`
Get audit logs.

**Query Parameters:**
- `limit` - Max logs to return (default: 100)
- `type` - Filter by type: `AUTH` | `ADMIN` | `SYSTEM` | `DISPATCH`
- `search` - Search in entity_id, description, detail

**Response:**
```json
[
  {
    "id": "EVT_1772292305619",
    "type": "ADMIN",
    "entity_id": "MH-12-EF-9012",
    "description": "Vehicle Unblocked by Admin",
    "status": "SUCCESS",
    "detail": "Status changed to Active",
    "json_data": null,
    "timestamp": "2026-02-28T15:25:05.619Z"
  }
]
```

---

### `POST /api/logs`
Create an audit log entry.

**Request Body:**
```json
{
  "id": "EVT_12345",
  "type": "ADMIN",
  "entity_id": "TN-45-AB-1234",
  "description": "Insurance policy renewed",
  "status": "SUCCESS",
  "detail": "Extended until 2027-12-01",
  "json_data": { "policy": "POL-TATA-112233" }
}
```

**Response:** Created log entry

---

## 🔐 Auth API

### `POST /api/auth/login`
User login.

**Request Body:**
```json
{
  "email": "admin@trufleet.com",
  "password": "password123",
  "role": "Fleet Admin"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "Chief Officer",
    "email": "admin@trufleet.com",
    "role": "Fleet Admin",
    "initials": "CO"
  }
}
```

---

### `POST /api/auth/register`
User registration.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "securepass123",
  "role": "Fleet Admin",
  "company": "ABC Logistics"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* user object */ }
}
```

---

## 🏥 Health Check

### `GET /api/health`
Server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T15:45:10.809Z"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## Frontend API Client

Use the `TruFleet` global object in any HTML page:

```javascript
// Get all vehicles
const vehicles = await TruFleet.getVehicles();

// Get filtered vehicles
const active = await TruFleet.getVehicles({ status: 'Active' });

// Create vehicle
await TruFleet.addVehicle({ id: 'TN-45-AB-1234', ... });

// Update vehicle
await TruFleet.updateVehicle('TN-45-AB-1234', { status: 'Blocked' });

// Get KPIs
const kpis = await TruFleet.getKPIs();

// Get analytics
const overview = await TruFleet.getAnalyticsOverview();

// Get notifications
const notifs = await TruFleet.getNotifications({ read: false });

// Mark notification read
await TruFleet.markNotificationRead('ALERT_ABC_EXP');
```

---

## Database Schema

See `server/db/schema.sql` for the complete Supabase schema including:
- `vehicles` table
- `audit_logs` table
- `users` table
- Triggers, indexes, and RLS policies

Run the schema in Supabase SQL Editor to initialize the database.
