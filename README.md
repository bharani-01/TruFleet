# TruFleet - Product Requirements Document
## Confidence in Every Mile

---

## 📋 Document Control

**Version:** 1.0  
**Last Updated:** February 27, 2026  
**Classification:** Premium Product Specification  
**Prepared By:** Chief Product Officer & Chief Technology Officer  

---

## 🎯 Executive Summary

TruFleet represents a paradigm shift in fleet management systems—transcending traditional enterprise software to deliver a **cinematic, ultra-premium digital experience** that combines operational excellence with emotional resonance. This is not merely a fleet management tool; it is a **digital ecosystem** that elevates every interaction into a moment of confidence, clarity, and control.

**Target Valuation:** $100 Billion  
**Market Position:** Premium Enterprise SaaS  
**Core Promise:** Confidence in Every Mile

---

## 🌟 Product Vision & Philosophy

### Vision Statement
To create the world's most sophisticated, emotionally intelligent fleet management platform that doesn't just manage vehicles—it orchestrates trust, ensures compliance, and transforms operational complexity into intuitive clarity.

### Design Philosophy: "Cinematic Realism"

**Core Principles:**

1. **Emotional Design First**
   - Every pixel serves a purpose
   - Every animation tells a story
   - Every transition creates anticipation
   - Every interaction builds confidence

2. **Premium Experience Standards**
   - No loading spinners—only elegant progress indicators
   - No harsh transitions—only fluid, physics-based motion
   - No static screens—only living, breathing interfaces
   - No compromises—only excellence

3. **Confidence Through Clarity**
   - Information hierarchy that guides the eye
   - Color psychology that communicates status instantly
   - Typography that conveys authority and precision
   - Whitespace that creates breathing room for decision-making

---

## 🏗️ System Architecture Overview

### Multi-Portal Ecosystem

```
TruFleet Platform
│
├── 🌐 Landing Experience (Public)
│   ├── Hero Section (Video Background)
│   ├── Brand Story
│   ├── Value Proposition
│   ├── Social Proof
│   └── Authentication Gateway
│
├── 🏢 Fleet Admin Dashboard (Port 3000)
│   ├── Command Center
│   ├── Vehicle Fleet Management
│   ├── Compliance Monitoring
│   ├── Insurance Tracking
│   ├── Dispatch Authorization
│   └── Audit & Analytics
│
├── 🚚 Truck Owner Portal (Port 3001)
│   ├── My Fleet View
│   ├── Vehicle Details
│   ├── Insurance Status
│   ├── Compliance Dashboard
│   └── Notifications Center
│
├── 🚦 Dispatch Control System (Port 3002)
│   ├── Authorization Request
│   ├── Real-time Validation
│   ├── Decision Engine Display
│   └── Audit Trail Viewer
│
└── 📝 Vehicle Onboarding (Port 3003/Integrated)
    ├── Registration Wizard
    ├── Document Upload
    ├── Insurance Integration
    └── Secret Key Generation
```

---

## 🎨 UI/UX Design System

### Color Palette: Authority & Trust

**Primary Colors:**
```css
--trufleet-navy: #0A1628        /* Deep Authority */
--trufleet-blue: #1E3A8A         /* Primary Trust */
--trufleet-cyan: #06B6D4         /* Active Status */
--trufleet-gold: #F59E0B         /* Premium Accent */
```

**Semantic Colors:**
```css
--status-authorized: #10B981     /* Success Green */
--status-denied: #EF4444         /* Critical Red */
--status-warning: #F59E0B        /* Warning Amber */
--status-pending: #8B5CF6        /* Processing Purple */
--status-expired: #6B7280        /* Inactive Gray */
```

**Neutral Palette:**
```css
--background-dark: #0F172A       /* Dark Mode Primary */
--background-light: #F8FAFC      /* Light Mode Primary */
--surface-elevated: #1E293B      /* Cards & Panels */
--text-primary: #F1F5F9          /* High Contrast */
--text-secondary: #94A3B8        /* Secondary Info */
--border-subtle: #334155         /* Dividers */
```

### Typography System

**Font Stack:**
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Archivo', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Type Scale:**
```css
--text-xs: 0.75rem;      /* 12px - Labels */
--text-sm: 0.875rem;     /* 14px - Body Small */
--text-base: 1rem;       /* 16px - Body */
--text-lg: 1.125rem;     /* 18px - Large Body */
--text-xl: 1.25rem;      /* 20px - Subheading */
--text-2xl: 1.5rem;      /* 24px - Heading 3 */
--text-3xl: 1.875rem;    /* 30px - Heading 2 */
--text-4xl: 2.25rem;     /* 36px - Heading 1 */
--text-5xl: 3rem;        /* 48px - Display */
--text-6xl: 3.75rem;     /* 60px - Hero */
```

**Font Weights:**
```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing System (8px Base Grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius System

```css
--radius-sm: 0.375rem;    /* 6px - Buttons, Inputs */
--radius-md: 0.5rem;      /* 8px - Cards */
--radius-lg: 0.75rem;     /* 12px - Modals */
--radius-xl: 1rem;        /* 16px - Large Cards */
--radius-2xl: 1.5rem;     /* 24px - Hero Sections */
--radius-full: 9999px;    /* Circular */
```

### Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.06);
--shadow-glow: 0 0 20px rgb(6 182 212 / 0.5);
```

---

## 🎬 Animation & Motion Design

### Core Animation Principles

1. **Natural Motion**
   - All animations use easing functions that mimic real-world physics
   - No linear transitions—only natural acceleration and deceleration
   - Animations should feel like they have weight and momentum

2. **Purposeful Movement**
   - Every animation guides user attention
   - Motion reveals hierarchy and relationships
   - Animations provide feedback for user actions

3. **Performance First**
   - All animations use GPU-accelerated properties (transform, opacity)
   - 60fps minimum on all devices
   - Respect user's motion preferences (prefers-reduced-motion)

### Animation Timing

```css
--duration-instant: 100ms;    /* Hover states */
--duration-fast: 200ms;       /* Button clicks */
--duration-normal: 300ms;     /* Standard transitions */
--duration-slow: 500ms;       /* Page transitions */
--duration-slower: 700ms;     /* Modal appearances */
--duration-slowest: 1000ms;   /* Hero animations */
```

### Easing Functions

```css
--ease-smooth: cubic-bezier(0.4, 0.0, 0.2, 1);          /* Material Design */
--ease-swift: cubic-bezier(0.4, 0.0, 0.6, 1);           /* Sharp entrance */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Playful */
--ease-elastic: cubic-bezier(0.68, -0.4, 0.265, 1.4);   /* Elastic bounce */
--ease-expo: cubic-bezier(0.87, 0, 0.13, 1);            /* Exponential */
```

### Key Animation Patterns

**1. Fade & Scale In (Card Entrance)**
```css
@keyframes fadeScaleIn {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

**2. Slide In (Side Navigation)**
```css
@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
```

**3. Shimmer Effect (Loading States)**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

**4. Pulse (Status Indicators)**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
```

**5. Progress Bar (Not Loading)**
```css
@keyframes progressFlow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
```

### Micro-Interactions

**Button Hover:**
- Scale: 1.02
- Shadow: Elevation increase
- Color: Subtle lightening
- Duration: 150ms

**Input Focus:**
- Border color change
- Subtle glow effect
- Label animation
- Duration: 200ms

**Card Hover:**
- Elevation increase (shadow)
- Subtle scale (1.01)
- Border highlight
- Duration: 300ms

---

## 🌐 Landing Page Specification

### Section 1: Hero Section (Above the Fold)

**Visual Treatment:**
- Full-screen viewport height (100vh)
- Background: Video (`fleet.mp4`) with subtle overlay
- Video settings: Autoplay, loop, muted, object-fit: cover
- Overlay: Linear gradient (rgba(10, 22, 40, 0.4) to rgba(10, 22, 40, 0.7))

**Content Hierarchy:**

```
┌─────────────────────────────────────────┐
│  [Logo]              [Login] [Register] │
│                                          │
│                                          │
│         TRUFLEET                         │
│    Confidence in Every Mile             │
│                                          │
│    Revolutionizing fleet management     │
│    with intelligence, compliance,       │
│    and unmatched reliability            │
│                                          │
│         [Get Started →]                  │
│                                          │
│         ↓ Scroll to Explore              │
└─────────────────────────────────────────┘
```

**Typography:**
- Brand Name: 72px, Bold, Letter-spacing: -0.02em
- Tagline: 24px, Medium, Letter-spacing: 0.01em
- Description: 18px, Regular, Line-height: 1.6
- CTA Button: 18px, Semibold

**Animations:**
- Hero text: Fade in + Slide up (staggered, 100ms delay between elements)
- CTA button: Scale pulse every 3 seconds
- Scroll indicator: Subtle bounce animation
- Video: Ken Burns effect (slow zoom)

### Section 2: Brand Story & Value Proposition

**Layout:** 2-column alternating content blocks

**Content Blocks:**

**Block 1: "Why TruFleet?"**
```
[Icon] Real-time Compliance
Monitor insurance, registration, and operational status
across your entire fleet—in real-time.

[Icon] Intelligent Dispatch
Smart authorization system that prevents compliance
violations before they happen.

[Icon] Complete Visibility
Comprehensive audit trails, analytics, and reporting
that give you total control.
```

**Block 2: "Built for Scale"**
- Enterprise-grade security
- Multi-tenant architecture
- Role-based access control
- Automated workflows

**Block 3: "Trust Through Technology"**
- AI-powered risk assessment
- Predictive maintenance alerts
- Compliance forecasting
- Smart notifications

**Visual Treatment:**
- Each block has custom icon with gradient treatment
- Background: Alternating dark/light panels
- On scroll: Parallax effect (content moves slower than scroll)
- On enter viewport: Fade in + Slide from left/right (alternating)

### Section 3: Feature Showcase

**3D Card Grid Layout:**

```
┌──────────┬──────────┬──────────┐
│  Fleet   │  Owner   │ Dispatch │
│  Admin   │  Portal  │ Control  │
│  [Icon]  │  [Icon]  │  [Icon]  │
└──────────┴──────────┴──────────┘
```

**Card Interactions:**
- Hover: 3D tilt effect (CSS transform: perspective + rotate)
- Hover: Reveal "Learn More" overlay
- Click: Smooth scroll to detailed feature section
- Background: Gradient mesh animation

### Section 4: Interest Capture & CTA

**Layout:** Centered, full-width section

**Content:**
```
┌─────────────────────────────────────────┐
│                                          │
│     Ready to Transform Your Fleet?      │
│                                          │
│  Are you interested in TruFleet?        │
│                                          │
│  ◯ Yes, I'm Interested                   │
│  ◯ Not Right Now                         │
│                                          │
│  [Email Input Field]                     │
│                                          │
│  [Get Early Access]                      │
│                                          │
└─────────────────────────────────────────┘
```

**Interaction Flow:**
1. User selects interest level
2. If "Yes" → Email field appears with smooth slide-down
3. If "Not Right Now" → Show "Stay Updated" alternative CTA
4. Form submission: Loading animation → Success message → Auto-redirect

**Animations:**
- Radio buttons: Ripple effect on selection
- Email field: Slide down + fade in (400ms)
- Submit button: Loading state with progress bar animation
- Success: Confetti animation + check mark

---

## 🔐 Authentication System

### Registration Flow

**Step 1: User Type Selection**
```
Who are you?
◯ Fleet Administrator
◯ Truck Owner
◯ Dispatch Manager
```

**Step 2: Account Details**
- Full Name
- Email Address
- Phone Number (with country code picker)
- Company Name (if admin)
- Password (with strength indicator)
- Confirm Password

**Step 3: Verification**
- Email verification code (6-digit OTP)
- SMS verification (optional)
- Terms & Conditions acceptance

**Step 4: Profile Setup**
- Upload profile photo (optional)
- Set preferences
- Quick tour option

**Visual Design:**
- Multi-step form with progress indicator
- Each step: Slide transition
- Form validation: Real-time, inline messages
- Password strength: Color-coded meter
- Success: Animated checkmark → Auto-redirect to dashboard

### Login Flow

**Layout:**
```
┌─────────────────────────────────────────┐
│                                          │
│           Welcome Back to                │
│              TRUFLEET                    │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Email Address                       │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Password              [👁]          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ☑ Remember me    [Forgot Password?]   │
│                                          │
│  [Sign In]                               │
│                                          │
│  ─────────── or ───────────             │
│                                          │
│  [Continue with Google]                  │
│  [Continue with Microsoft]               │
│                                          │
│  Don't have an account? [Sign Up]       │
│                                          │
└─────────────────────────────────────────┘
```

**Features:**
- Social login integration (Google, Microsoft)
- "Remember me" functionality
- Password visibility toggle
- Biometric login option (if available)
- Session management
- Auto-logout after inactivity

**Error Handling:**
- Invalid credentials: Shake animation + clear message
- Account locked: Info modal with support contact
- Network error: Retry mechanism with visual feedback

---

## 🏢 Fleet Admin Dashboard (Port 3000)

### Dashboard Philosophy
The admin dashboard is the **command center**—a place where clarity meets control. Every element communicates operational status at a glance while providing deep-dive capabilities for detailed analysis.

### Layout Architecture

**Top Navigation Bar:**
```
[Logo] [Dashboard] [Fleet] [Compliance] [Reports] [Settings]     [Notifications 🔔] [Profile 👤]
```

**Sidebar (Collapsible):**
```
📊 Overview
🚛 Vehicle Fleet
   → All Vehicles
   → Active Fleet
   → Blocked Vehicles
   → Add Vehicle
🛡️ Insurance Management
   → Active Policies
   → Expiring Soon
   → Expired Policies
   → Add Policy
🚦 Dispatch Control
   → Authorization Logs
   → Pending Requests
   → Denied Attempts
📈 Analytics
   → Fleet Performance
   → Compliance Trends
   → Cost Analysis
👥 User Management
⚙️ Settings
📋 Audit Logs
```

### Overview Panel (Dashboard Home)

**KPI Cards (Top Row):**

```
┌──────────┬──────────┬──────────┬──────────┐
│  Total   │  Active  │ Blocked  │ Expiring │
│ Vehicles │ Vehicles │ Vehicles │Insurance │
│   ━━━    │   ━━━    │   ━━━    │   ━━━    │
│   250    │   238    │    12    │    15    │
│  +5%     │  +2%     │  -20%    │  +3      │
└──────────┴──────────┴──────────┴──────────┘
```

**Card Design:**
- Gradient background (subtle)
- Large number: 48px, Bold
- Label: 14px, Medium
- Trend indicator: Arrow + percentage
- Icon: Top-right corner, 32px
- Hover: Lift effect + tooltip with more details

**Middle Section: Real-time Activity Feed**

```
┌─────────────────────────────────────────┐
│  📍 Recent Activity                      │
│                                          │
│  ✅ Vehicle #TN-45-AB-1234 authorized   │
│     2 minutes ago                        │
│                                          │
│  ⚠️  Insurance expiring for 3 vehicles   │
│     15 minutes ago                       │
│                                          │
│  ❌ Dispatch denied: #KA-05-CD-5678      │
│     32 minutes ago                       │
│                                          │
│  [View All Activity →]                   │
└─────────────────────────────────────────┘
```

**Right Section: Quick Actions**

```
┌─────────────────────────────────────────┐
│  ⚡ Quick Actions                         │
│                                          │
│  [+ Add New Vehicle]                     │
│  [📋 Generate Report]                    │
│  [🔍 Search Vehicle]                     │
│  [🚨 Block Vehicle]                      │
│                                          │
└─────────────────────────────────────────┘
```

**Bottom Section: Charts & Analytics**

```
┌──────────────────┬──────────────────────┐
│  Fleet Status    │  Dispatch Attempts   │
│  [Pie Chart]     │  [Line Chart]        │
│                  │  (Last 30 Days)      │
└──────────────────┴──────────────────────┘
```

**Chart Specifications:**
- Library: Chart.js with custom styling
- Colors: Match brand palette
- Interactive tooltips
- Smooth animations on load
- Responsive design

### Vehicle Fleet Management

**Vehicle List View:**

**Filters (Top Bar):**
```
[Search: Reg No./Chassis]  [Type ▼]  [Status ▼]  [Insurance ▼]  [+ Add Vehicle]
```

**Table Design:**

```
╔════════════╦══════════╦═══════════╦═══════════╦═══════════╦═════════╗
║ REG NUMBER ║  TYPE    ║   OWNER   ║ INSURANCE ║  STATUS   ║ ACTIONS ║
╠════════════╬══════════╬═══════════╬═══════════╬═══════════╬═════════╣
║ TN-45-AB-  ║ Heavy    ║ John Doe  ║ ✅ Valid  ║ 🟢 Active ║ [•••]   ║
║ 1234       ║ Truck    ║           ║ 45 days   ║           ║         ║
╠════════════╬══════════╬═══════════╬═══════════╬═══════════╬═════════╣
║ KA-05-CD-  ║ Light    ║ Jane Smith║ ⚠️ Expiring║ 🟢 Active ║ [•••]   ║
║ 5678       ║ Truck    ║           ║ 5 days    ║           ║         ║
╠════════════╬══════════╬═══════════╬═══════════╬═══════════╬═════════╣
║ MH-12-EF-  ║ Heavy    ║ Bob Wilson║ ❌ Expired║ 🔴 Blocked║ [•••]   ║
║ 9012       ║ Truck    ║           ║ 12 days   ║           ║         ║
╚════════════╩══════════╩═══════════╩═══════════╩═══════════╩═════════╝
```

**Table Features:**
- Sortable columns (click header)
- Row hover: Subtle highlight
- Status badges: Color-coded pills
- Action menu: Dropdown with contextual options
  - View Details
  - Edit Vehicle
  - Update Insurance
  - Block/Unblock
  - View History
  - Generate QR Code
- Pagination: Bottom of table
- Bulk actions: Select multiple rows

**Vehicle Detail Modal:**

When clicking on a vehicle:

```
┌─────────────────────────────────────────────────────┐
│  [X]                 Vehicle Details                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📸 [Vehicle Photo]                                  │
│                                                      │
│  🚛 Registration Number: TN-45-AB-1234              │
│  🔢 Chassis Number: MAT123456789ABCD                │
│  ⚙️  Engine Number: ENG987654321XYZ                 │
│  📋 Vehicle Type: Heavy Truck                        │
│  👤 Owner: John Doe                                  │
│  📅 Registration Date: Jan 15, 2024                  │
│  🛡️  Insurance Status: ✅ Valid (45 days left)      │
│  🔐 Secret Key: ████████████  [Show] [Regenerate]   │
│  🚦 Dispatch Status: ✅ Authorized                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📜 Document History                           │  │
│  │                                               │  │
│  │ [List of documents with timestamps]          │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  [Edit Vehicle] [Update Insurance] [Block Vehicle]  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Insurance Management Module

**Dashboard View:**

```
┌──────────────┬──────────────┬──────────────┐
│   Active     │  Expiring    │   Expired    │
│   Policies   │   (7 Days)   │   Policies   │
│     ━━━      │     ━━━      │     ━━━      │
│     235      │      15      │      8       │
└──────────────┴──────────────┴──────────────┘
```

**Policy List:**

```
╔════════════╦═════════════╦══════════╦══════════╦═══════════╦═════════╗
║  VEHICLE   ║   PROVIDER  ║  POLICY  ║  EXPIRY  ║   STATUS  ║ ACTIONS ║
║    REG     ║             ║  NUMBER  ║   DATE   ║           ║         ║
╠════════════╬═════════════╬══════════╬══════════╬═══════════╬═════════╣
║ TN-45-AB-  ║ HDFC ERGO   ║ POL12345 ║ Apr 15,  ║ ⚠️ Expiring║ [•••]   ║
║ 1234       ║             ║          ║ 2026     ║ 5 days    ║         ║
╠════════════╬═════════════╬══════════╬══════════╬═══════════╬═════════╣
║ KA-05-CD-  ║ ICICI       ║ POL67890 ║ Jan 10,  ║ ❌ Expired║ [•••]   ║
║ 5678       ║ Lombard     ║          ║ 2026     ║ 47 days   ║         ║
╚════════════╩═════════════╩══════════╩══════════╩═══════════╩═════════╝
```

**Features:**
- Auto-notifications 30/15/7/1 day before expiry
- Bulk renewal option
- Document upload
- Policy verification status
- Provider contact integration

### Dispatch Control & Authorization

**Live Monitor View:**

```
┌─────────────────────────────────────────────────────┐
│  🚦 Dispatch Authorization Monitor                   │
│                                                      │
│  Today's Stats:                                      │
│  ✅ Authorized: 142   ❌ Denied: 8   ⏳ Pending: 2  │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Real-time Log (Auto-refresh every 5s)      │    │
│  │                                             │    │
│  │ 14:32:15  TN-45-AB-1234  ✅ AUTHORIZED     │    │
│  │           Valid insurance • Active status  │    │
│  │                                             │    │
│  │ 14:31:47  KA-05-CD-5678  ❌ DENIED         │    │
│  │           Insurance expired 12 days ago    │    │
│  │                                             │    │
│  │ 14:30:22  MH-12-EF-9012  ✅ AUTHORIZED     │    │
│  │           All checks passed                │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  [Export Log] [Filter] [Refresh]                    │
└─────────────────────────────────────────────────────┘
```

**Visual Indicators:**
- Green pulse: Active authorization
- Red flash: Denied attempt
- Yellow pulse: Warning/expiring soon
- Sound effects (optional, toggleable)

### Audit Logs Module

**Log Viewer:**

```
╔════════════╦═══════════╦════════════╦══════════════╦═════════════╗
║ TIMESTAMP  ║  VEHICLE  ║   ACTION   ║    RESULT    ║  PERFORMED  ║
║            ║    REG    ║            ║              ║     BY      ║
╠════════════╬═══════════╬════════════╬══════════════╬═════════════╣
║ 2026-02-27 ║ TN-45-AB- ║ Dispatch   ║ ✅ AUTHORIZED║ System      ║
║ 14:32:15   ║ 1234      ║ Request    ║              ║             ║
╠════════════╬═══════════╬════════════╬══════════════╬═════════════╣
║ 2026-02-27 ║ KA-05-CD- ║ Dispatch   ║ ❌ DENIED    ║ System      ║
║ 14:31:47   ║ 5678      ║ Request    ║ Ins. Expired ║             ║
╠════════════╬═══════════╬════════════╬══════════════╬═════════════╣
║ 2026-02-27 ║ MH-12-EF- ║ Block      ║ ✅ SUCCESS   ║ Admin       ║
║ 12:15:30   ║ 9012      ║ Vehicle    ║              ║ (John Doe)  ║
╚════════════╩═══════════╩════════════╩══════════════╩═════════════╝
```

**Features:**
- Advanced filtering (date range, action type, result)
- Export to CSV/PDF
- Search functionality
- Expandable rows for detailed info
- Tamper-proof timestamping
- Compliance reporting

---

## 🚚 Truck Owner Dashboard (Port 3001)

### Design Philosophy
The truck owner portal provides **transparency and control** without overwhelming complexity. It's designed for quick status checks and essential information access.

### Dashboard Layout

**Header:**
```
[TruFleet Logo]                           👤 Welcome, John Doe  [Logout]
```

**Main View:**

```
┌─────────────────────────────────────────────────────┐
│  My Fleet Overview                                   │
│                                                      │
│  ┌──────────┬──────────┬──────────┐                │
│  │   My     │ Insurance│ Dispatch  │                │
│  │ Vehicles │  Status  │ Eligible  │                │
│  │   ━━━    │   ━━━    │   ━━━     │                │
│  │    5     │   4 OK   │    4      │                │
│  │          │   1 ⚠️   │           │                │
│  └──────────┴──────────┴──────────┘                │
│                                                      │
│  📋 My Vehicles                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ TN-45-AB-1234         Heavy Truck          │    │
│  │ Insurance: ✅ Valid (45 days)              │    │
│  │ Status: 🟢 Active • Dispatch Ready         │    │
│  │ [View Details]                              │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ KA-05-CD-5678         Light Truck          │    │
│  │ Insurance: ⚠️ Expiring in 5 days           │    │
│  │ Status: 🟢 Active • Dispatch Limited       │    │
│  │ [Renew Insurance] [View Details]           │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ MH-12-EF-9012         Heavy Truck          │    │
│  │ Insurance: ❌ Expired 12 days ago          │    │
│  │ Status: 🔴 Blocked • Cannot Dispatch       │    │
│  │ [Urgent: Update Insurance]                 │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Vehicle Detail View

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  ← Back to My Fleet                                  │
│                                                      │
│  🚛 TN-45-AB-1234                                    │
│  Heavy Truck                                         │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📋 Vehicle Information                        │  │
│  │                                               │  │
│  │ Registration Number: TN-45-AB-1234           │  │
│  │ Chassis Number: MAT123456789ABCD             │  │
│  │ Engine Number: ENG987654321XYZ               │  │
│  │ Vehicle Type: Heavy Truck                     │  │
│  │ Registration Date: Jan 15, 2024               │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🛡️ Insurance Details                          │  │
│  │                                               │  │
│  │ Provider: HDFC ERGO                          │  │
│  │ Policy Number: POL123456789                  │  │
│  │ Valid From: Apr 15, 2025                     │  │
│  │ Valid Until: Apr 15, 2026                    │  │
│  │ Status: ✅ Active (45 days remaining)        │  │
│  │                                               │  │
│  │ [Upload New Policy]                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🚦 Compliance Status                          │  │
│  │                                               │  │
│  │ Dispatch Eligibility: ✅ AUTHORIZED          │  │
│  │                                               │  │
│  │ ✅ Insurance: Active                          │  │
│  │ ✅ Registration: Valid                        │  │
│  │ ✅ Vehicle Status: Active                     │  │
│  │ ✅ System Status: Operational                 │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📊 Recent Activity                            │  │
│  │                                               │  │
│  │ Today:        3 successful dispatches        │  │
│  │ This Week:    18 successful dispatches       │  │
│  │ This Month:   67 successful dispatches       │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Notifications Center

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│  🔔 Notifications                  [Mark All Read]   │
│                                                      │
│  ⚠️ HIGH PRIORITY                                    │
│  ┌────────────────────────────────────────────┐    │
│  │ Insurance Expiring Soon                     │    │
│  │ Vehicle KA-05-CD-5678                       │    │
│  │ Insurance expires in 5 days                 │    │
│  │ 2 hours ago                 [Take Action →] │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ✅ RESOLVED                                         │
│  ┌────────────────────────────────────────────┐    │
│  │ Dispatch Authorized                         │    │
│  │ Vehicle TN-45-AB-1234                       │    │
│  │ Successfully authorized at 14:32            │    │
│  │ 3 hours ago                     [View Log]  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ❌ CRITICAL                                         │
│  ┌────────────────────────────────────────────┐    │
│  │ Vehicle Blocked                             │    │
│  │ Vehicle MH-12-EF-9012                       │    │
│  │ Insurance expired - immediate action needed │    │
│  │ Yesterday              [Update Insurance →] │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Notification Types:**
- Insurance expiring (30/15/7/3/1 days)
- Insurance expired
- Vehicle blocked
- Dispatch authorized
- Dispatch denied
- System maintenance
- Document update required

---

## 🚦 Dispatch Simulation Dashboard (Port 3002)

### Design Philosophy
This dashboard demonstrates the **real-time decision engine** in action. It's designed to be visually impressive and immediately understandable.

### Main Interface

```
┌─────────────────────────────────────────────────────┐
│  🚦 TruFleet Dispatch Authorization System          │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Request Dispatch Authorization              │    │
│  │                                             │    │
│  │ Vehicle Registration Number                 │    │
│  │ ┌─────────────────────────────────────┐    │    │
│  │ │ TN-45-AB-1234                       │    │    │
│  │ └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  │ Secret Authorization Key                    │    │
│  │ ┌─────────────────────────────────────┐    │    │
│  │ │ ••••••••••••••••                    │    │    │
│  │ └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  │        [🚀 Request Authorization]           │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Authorization Result                        │    │
│  │                                             │    │
│  │ [Result appears here after request]         │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ 📋 Recent Authorization Attempts            │    │
│  │                                             │    │
│  │ [Live log of recent attempts]               │    │
│  │                                             │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Authorization Flow Animation

**Step 1: Request Submitted**
```
⏳ Processing Authorization Request...

Checking:
→ Vehicle Registration... ⏳
```

**Step 2: Validation Sequence**
```
✅ Vehicle Found
→ Validating Secret Key... ⏳
```

**Step 3: Compliance Checks**
```
✅ Vehicle Found
✅ Secret Key Verified
→ Checking Insurance Status... ⏳
```

**Step 4: Final Decision**

**AUTHORIZED:**
```
┌────────────────────────────────────────────┐
│                                            │
│         ✅ DISPATCH AUTHORIZED             │
│                                            │
│  Vehicle: TN-45-AB-1234                   │
│  Timestamp: 2026-02-27 14:32:15           │
│  Authorization Code: AUTH-2024-000142     │
│                                            │
│  All compliance checks passed:            │
│  ✅ Insurance: Valid (45 days)            │
│  ✅ Vehicle Status: Active                │
│  ✅ Secret Key: Verified                  │
│  ✅ System Status: Operational            │
│                                            │
│  Valid for next 24 hours                  │
│                                            │
│  [Download Authorization Certificate]     │
│                                            │
└────────────────────────────────────────────┘
```

**DENIED:**
```
┌────────────────────────────────────────────┐
│                                            │
│         ❌ DISPATCH DENIED                 │
│                                            │
│  Vehicle: MH-12-EF-9012                   │
│  Timestamp: 2026-02-27 14:31:47           │
│  Denial Code: DENY-2024-000008            │
│                                            │
│  ⚠️ Reason for Denial:                     │
│  Insurance policy expired 12 days ago     │
│                                            │
│  Required Actions:                         │
│  1. Update vehicle insurance policy       │
│  2. Upload proof of insurance             │
│  3. Wait for admin verification           │
│                                            │
│  Contact Support: support@trufleet.com    │
│                                            │
└────────────────────────────────────────────┘
```

### Visual Feedback

**During Processing:**
- Progress bar with smooth animation
- Checkmarks appear sequentially
- Each check has 300-500ms delay for dramatic effect
- Subtle background shimmer effect

**Success State:**
- Green pulse animation
- Confetti effect
- Success sound (optional)
- Certificate slide-in animation

**Denial State:**
- Red flash border
- Shake animation
- Alert sound (optional)
- Clear action items

### Live Activity Monitor

```
╔════════════╦══════════════╦═══════════╦═════════════════╗
║ TIMESTAMP  ║   VEHICLE    ║  RESULT   ║     REASON      ║
╠════════════╬══════════════╬═══════════╬═════════════════╣
║ 14:32:15   ║ TN-45-AB-    ║ ✅ AUTH   ║ All checks pass ║
║            ║ 1234         ║           ║                 ║
╠════════════╬══════════════╬═══════════╬═════════════════╣
║ 14:31:47   ║ KA-05-CD-    ║ ❌ DENIED ║ Ins. expired    ║
║            ║ 5678         ║           ║                 ║
╠════════════╬══════════════╬═══════════╬═════════════════╣
║ 14:30:22   ║ MH-12-EF-    ║ ✅ AUTH   ║ All checks pass ║
║            ║ 9012         ║           ║                 ║
╚════════════╩══════════════╩═══════════╩═════════════════╝
```

**Features:**
- Auto-refresh every 5 seconds
- Color-coded rows
- Expandable for details
- Export capability

---

## 📝 Vehicle Onboarding Module (Port 3003)

### Multi-Step Registration Wizard

**Progress Indicator:**
```
① Vehicle Info → ② Documents → ③ Insurance → ④ Review → ⑤ Complete
```

### Step 1: Vehicle Information

```
┌─────────────────────────────────────────────────────┐
│  📝 Register New Vehicle                   Step 1/4  │
│                                                      │
│  Basic Vehicle Information                           │
│                                                      │
│  Vehicle Type*                                       │
│  ◯ Heavy Truck    ◯ Light Truck    ◯ Private       │
│                                                      │
│  Registration Number*                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ TN-45-AB-1234                               │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Chassis Number*                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ MAT123456789ABCD                            │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Engine Number*                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ ENG987654321XYZ                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Registration Date*                                  │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📅 Select Date                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  [← Back]                          [Next Step →]    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Step 2: Document Upload

```
┌─────────────────────────────────────────────────────┐
│  📝 Register New Vehicle                   Step 2/4  │
│                                                      │
│  Upload Vehicle Documents                            │
│                                                      │
│  Registration Certificate (RC)*                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  📄 Drag & drop or click to upload          │   │
│  │     Supported: PDF, JPG, PNG (Max 5MB)      │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Vehicle Photos (Optional)                           │
│  ┌─────────────────────────────────────────────┐   │
│  │  📸 Upload up to 5 photos                   │   │
│  │     Front, Back, Left, Right, Dashboard     │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  PUC Certificate (Optional)                          │
│  ┌─────────────────────────────────────────────┐   │
│  │  📄 Drag & drop or click to upload          │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  [← Back]                          [Next Step →]    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Step 3: Insurance Information

```
┌─────────────────────────────────────────────────────┐
│  📝 Register New Vehicle                   Step 3/4  │
│                                                      │
│  Insurance Details                                   │
│                                                      │
│  Insurance Provider*                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ Select Provider            ▼                │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Policy Number*                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ POL123456789                                │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Valid From*                  Valid Until*           │
│  ┌────────────────────┐      ┌────────────────┐    │
│  │ 📅 Apr 15, 2025   │      │ 📅 Apr 15, 2026│    │
│  └────────────────────┘      └────────────────┘    │
│                                                      │
│  Policy Type*                                        │
│  ◯ Comprehensive    ◯ Third Party    ◯ Other       │
│                                                      │
│  Upload Policy Document*                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  📄 Drag & drop or click to upload          │   │
│  │     Supported: PDF, JPG, PNG (Max 5MB)      │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  [← Back]                          [Next Step →]    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Step 4: Review & Confirm

```
┌─────────────────────────────────────────────────────┐
│  📝 Register New Vehicle                   Step 4/4  │
│                                                      │
│  Review Vehicle Information                          │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🚛 Vehicle Details                          │   │
│  │                                             │   │
│  │ Type: Heavy Truck                           │   │
│  │ Registration: TN-45-AB-1234                 │   │
│  │ Chassis: MAT123456789ABCD                   │   │
│  │ Engine: ENG987654321XYZ                     │   │
│  │ Reg. Date: Jan 15, 2024                     │   │
│  │                                             │   │
│  │ [Edit]                                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🛡️ Insurance Details                        │   │
│  │                                             │   │
│  │ Provider: HDFC ERGO                         │   │
│  │ Policy: POL123456789                        │   │
│  │ Valid: Apr 15, 2025 - Apr 15, 2026         │   │
│  │ Type: Comprehensive                         │   │
│  │                                             │   │
│  │ [Edit]                                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔐 Security                                  │   │
│  │                                             │   │
│  │ Secret authorization key will be generated  │   │
│  │ automatically and sent to vehicle owner.    │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  [← Back]            [✓ Register Vehicle]           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Step 5: Success & Key Generation

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│              ✅ Vehicle Registered!                  │
│                                                      │
│  Vehicle TN-45-AB-1234 has been successfully        │
│  registered in the TruFleet system.                 │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔐 Secret Authorization Key                  │   │
│  │                                             │   │
│  │ ┌─────────────────────────────────────┐    │   │
│  │ │  TFL-a8f3-9d2c-4b7e-8f1a-3c5d9e2f   │    │   │
│  │ └─────────────────────────────────────┘    │   │
│  │                                             │   │
│  │ [📋 Copy]  [✉️ Email to Owner]  [💾 Save]   │   │
│  │                                             │   │
│  │ ⚠️ Keep this key secure! It's required for  │   │
│  │    all dispatch authorization requests.     │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  [View Vehicle Details]  [Register Another Vehicle] │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Success Animation:**
- Confetti burst
- Success checkmark scale-in
- Key reveal with shimmer effect
- Celebratory micro-interaction

---

## 🔒 Security & Data Protection

### Authentication Security

**Password Requirements:**
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Not in common password list

**Session Management:**
- JWT tokens with 24-hour expiry
- Refresh token rotation
- Automatic logout after 30 minutes of inactivity
- Multi-device session tracking
- Force logout capability

### Role-Based Access Control (RBAC)

**Admin Permissions:**
- Full vehicle management
- Insurance updates
- Block/unblock vehicles
- User management
- System settings
- Audit log access
- Report generation

**Truck Owner Permissions:**
- View own vehicles only
- Update insurance documents
- View compliance status
- Receive notifications
- NO admin functions

**Dispatch Manager Permissions:**
- Request authorization
- View authorization logs
- Generate reports
- NO vehicle modifications

### Data Encryption

**In Transit:**
- TLS 1.3 for all API calls
- Certificate pinning
- Secure WebSocket connections

**At Rest:**
- Database encryption (AES-256)
- Encrypted file storage
- Secure key management (Supabase Vault)

### Secret Key Management

**Key Generation:**
```javascript
// Cryptographically secure random key
const secretKey = `TFL-${uuid()}-${timestamp()}-${hash(vehicleData)}`;
```

**Key Storage:**
- Hashed in database (bcrypt, 12 rounds)
- Never exposed in logs
- Encrypted in transit
- Owner-only access

**Key Rotation:**
- Manual regeneration available
- Automatic rotation after security incident
- Old keys invalidated immediately

---

## 📊 Analytics & Reporting

### Dashboard Analytics

**Fleet Overview Metrics:**
- Total vehicles vs. active vehicles (percentage)
- Insurance compliance rate
- Average insurance renewal lead time
- Dispatch authorization success rate
- Peak dispatch request times
- Vehicle utilization rates

**Trend Analysis:**
- Monthly vehicle additions
- Insurance renewal patterns
- Dispatch denial reasons (pie chart)
- Compliance improvements over time

**Predictive Insights:**
- Vehicles likely to have expired insurance (7/15/30 days)
- Seasonal dispatch patterns
- Maintenance prediction based on usage

### Report Generation

**Available Reports:**

1. **Fleet Status Report**
   - All vehicles with current status
   - Insurance validity
   - Dispatch eligibility
   - PDF/CSV export

2. **Compliance Report**
   - Vehicles by compliance status
   - Expiring policies
   - Action items
   - Deadline tracking

3. **Dispatch Analytics Report**
   - Authorization vs. denial ratio
   - Denial reasons breakdown
   - Peak usage times
   - Vehicle-wise dispatch frequency

4. **Insurance Report**
   - Active policies by provider
   - Renewal due dates
   - Cost analysis
   - Provider performance

5. **Audit Trail Report**
   - All system activities
   - User actions
   - Timestamp logs
   - Compliance documentation

**Report Features:**
- Customizable date ranges
- Multiple export formats (PDF, Excel, CSV)
- Scheduled automated reports (daily/weekly/monthly)
- Email delivery
- Branded templates

---

## 🔔 Notification System

### Notification Channels

1. **In-App Notifications**
   - Real-time badge counter
   - Notification center
   - Priority-based ordering
   - Read/unread status

2. **Email Notifications**
   - Professional HTML templates
   - Branded design
   - Mobile-responsive
   - Unsubscribe option

3. **SMS Alerts** (Critical Only)
   - Insurance expired
   - Vehicle blocked
   - Security alerts

4. **Push Notifications** (Mobile App Future)
   - Real-time alerts
   - Action buttons
   - Rich media support

### Notification Types & Timing

**Insurance-Related:**
- 30 days before expiry: "Renewal reminder"
- 15 days before expiry: "Action needed"
- 7 days before expiry: "Urgent renewal"
- 3 days before expiry: "Critical - Renew now"
- 1 day before expiry: "Last chance"
- Day of expiry: "Expired - Vehicle blocked"

**Dispatch-Related:**
- Immediate: Authorization granted
- Immediate: Authorization denied
- Daily summary: Dispatch activity

**System-Related:**
- Vehicle status changes
- User role changes
- Security alerts
- System maintenance

### Notification Design

**In-App Notification Card:**
```
┌────────────────────────────────────────┐
│ ⚠️  Insurance Expiring Soon            │
│                                        │
│ Vehicle KA-05-CD-5678                 │
│ Insurance expires in 5 days           │
│                                        │
│ 2 hours ago         [Take Action →]   │
└────────────────────────────────────────┘
```

**Priority Levels:**
- 🔴 Critical (Red): Immediate action required
- 🟡 High (Amber): Action needed soon
- 🔵 Medium (Blue): Informational
- 🟢 Low (Green): Success/confirmation

---

## ⚡ Performance Requirements

### Loading Time Targets

**Landing Page:**
- First Contentful Paint: < 1.2s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

**Dashboard Pages:**
- Initial Load: < 2.0s
- Subsequent Navigation: < 500ms
- API Response: < 300ms
- Search Results: < 200ms

### Optimization Strategies

**Frontend:**
- Lazy loading for images and components
- Code splitting by route
- Minified and compressed assets (Gzip/Brotli)
- CDN delivery for static assets
- Service worker for offline capability
- Debounced search inputs
- Virtual scrolling for large lists

**Backend:**
- Database query optimization
- Redis caching for frequent queries
- Connection pooling
- Rate limiting
- Pagination for large datasets
- Background job processing

**Assets:**
- WebP format for images with fallbacks
- Responsive images (srcset)
- Video compression and adaptive bitrate
- Icon sprites or inline SVG
- Font subsetting

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Tablets */
--breakpoint-md: 768px;   /* Landscape tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Mobile Adaptations

**Navigation:**
- Desktop: Horizontal nav + sidebar
- Mobile: Hamburger menu + bottom nav bar

**Tables:**
- Desktop: Full table view
- Mobile: Card-based layout with expandable rows

**Forms:**
- Desktop: Multi-column layouts
- Mobile: Single column, larger touch targets

**Dashboards:**
- Desktop: Multi-widget grid
- Mobile: Stacked cards, swipeable sections

**Touch Targets:**
- Minimum 44x44px (Apple HIG)
- 48x48px preferred (Material Design)

---

## 🎯 User Experience Principles

### Microinteractions

**Button Press:**
1. Hover: Scale 1.02 + shadow increase
2. Active: Scale 0.98
3. Release: Ripple effect from click point
4. Success: Checkmark animation

**Form Input:**
1. Focus: Border glow + label animation
2. Typing: Character count update
3. Validation: Real-time feedback
4. Error: Shake animation + error message
5. Success: Green checkmark

**Card Interaction:**
1. Hover: Lift (shadow + translate Y)
2. Click: Press effect
3. Load: Skeleton shimmer
4. Update: Highlight flash

### Error Handling

**User-Facing Errors:**
- Clear, non-technical language
- Actionable next steps
- Visual hierarchy (icon + message + action)
- Inline validation where possible

**Error Message Template:**
```
❌ [What went wrong]

Why this happened:
[Simple explanation]

What you can do:
• [Action 1]
• [Action 2]
• [Support contact]
```

**Network Errors:**
- Automatic retry with exponential backoff
- Offline mode indicator
- Queue actions for when online
- Clear status messages

### Empty States

**No Data:**
```
┌────────────────────────────────────────┐
│                                        │
│           📊                           │
│                                        │
│     No Vehicles Yet                    │
│                                        │
│  Start by adding your first vehicle    │
│  to the fleet management system.       │
│                                        │
│     [+ Add Your First Vehicle]         │
│                                        │
└────────────────────────────────────────┘
```

**No Search Results:**
```
┌────────────────────────────────────────┐
│           🔍                           │
│                                        │
│     No Results Found                   │
│                                        │
│  Try adjusting your search filters     │
│  or search term.                       │
│                                        │
│     [Clear Filters]                    │
└────────────────────────────────────────┘
```

### Loading States

**Never show:**
- Generic spinners
- "Loading..." text
- Blank screens

**Always show:**
- Skeleton screens (content placeholders)
- Progress indicators with context
- Smooth transitions
- Optimistic UI updates

**Loading Animation Example:**
```css
/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-elevated) 0%,
    var(--border-subtle) 50%,
    var(--surface-elevated) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 🛠️ Technical Implementation

### Tech Stack

**Frontend:**
- HTML5 (Semantic markup)
- CSS3 (Custom properties, Grid, Flexbox)
- JavaScript (ES6+)
- Bootstrap 5.3 (Grid system, utilities)
- Chart.js (Analytics visualization)
- Animate.css (Pre-built animations)

**Backend:**
- Node.js 18+ (LTS)
- Express.js (API routes)
- Supabase (Database, Auth, Storage)
- JWT (Authentication tokens)

**Database Schema (Supabase):**

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL, -- 'admin', 'owner', 'dispatcher'
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles Table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  chassis_number VARCHAR(50) UNIQUE NOT NULL,
  engine_number VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL, -- 'heavy_truck', 'light_truck', 'private'
  owner_id UUID REFERENCES users(id),
  registration_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'blocked', 'maintenance'
  secret_key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insurance Policies Table
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  provider VARCHAR(255) NOT NULL,
  policy_number VARCHAR(100) UNIQUE NOT NULL,
  policy_type VARCHAR(50) NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'expiring'
  document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dispatch Authorizations Table
CREATE TABLE dispatch_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  request_timestamp TIMESTAMP NOT NULL,
  result VARCHAR(50) NOT NULL, -- 'authorized', 'denied'
  denial_reason TEXT,
  authorization_code VARCHAR(100),
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100), -- 'vehicle', 'insurance', 'user'
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL,
  priority VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

**Authentication:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

**Vehicles:**
```
GET    /api/vehicles
GET    /api/vehicles/:id
POST   /api/vehicles
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id
PATCH  /api/vehicles/:id/block
PATCH  /api/vehicles/:id/unblock
POST   /api/vehicles/:id/regenerate-key
```

**Insurance:**
```
GET    /api/insurance
GET    /api/insurance/:id
POST   /api/insurance
PUT    /api/insurance/:id
DELETE /api/insurance/:id
GET    /api/insurance/expiring
```

**Dispatch:**
```
POST   /api/dispatch/authorize
GET    /api/dispatch/logs
GET    /api/dispatch/logs/:id
```

**Analytics:**
```
GET    /api/analytics/dashboard
GET    /api/analytics/fleet-status
GET    /api/analytics/dispatch-trends
GET    /api/analytics/compliance-report
```

**Notifications:**
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:id
```

### File Structure

```
trufleet/
├── landing/
│   └── index.html (Landing page with all assets inline)
├── auth/
│   ├── login.html
│   └── register.html
├── admin/
│   └── index.html (Port 3000)
├── owner/
│   └── index.html (Port 3001)
├── dispatch/
│   └── index.html (Port 3002)
├── onboarding/
│   └── index.html (Port 3003)
├── assets/
│   ├── videos/
│   │   └── fleet.mp4
│   ├── images/
│   └── fonts/
└── server/
    ├── index.js
    ├── routes/
    ├── middleware/
    ├── services/
    └── config/
```

### Deployment Architecture

```
[Vercel/Netlify] → Frontend (HTML/CSS/JS)
        ↓
[Render/Railway] → Node.js API Server
        ↓
[Supabase Cloud] → PostgreSQL Database
                   Auth Service
                   Storage Service
```

---

## 🎓 Development Guidelines

### Code Quality Standards

**HTML:**
- Semantic HTML5 elements
- ARIA labels for accessibility
- Valid W3C markup
- Proper heading hierarchy
- Alt text for all images

**CSS:**
- BEM naming convention (Block__Element--Modifier)
- CSS variables for theming
- Mobile-first responsive design
- No inline styles (except dynamic JS)
- Consistent spacing using defined variables

**JavaScript:**
- ES6+ features
- Async/await for async operations
- Error handling with try-catch
- Input validation
- No console.log in production
- Meaningful variable names
- Functions under 50 lines
- Comments for complex logic

### Accessibility (WCAG 2.1 Level AA)

**Requirements:**
- Color contrast ratio minimum 4.5:1
- Keyboard navigation support
- Focus indicators visible
- Screen reader compatible
- Text scalability up to 200%
- Alternative text for images
- Captions for videos
- Form labels properly associated

**Testing:**
- Lighthouse accessibility score > 90
- axe DevTools scan with 0 issues
- Keyboard-only navigation test
- Screen reader testing (NVDA/JAWS)

### Browser Support

**Desktop:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile:**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Performance Testing

**Metrics to Monitor:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

**Tools:**
- Lighthouse CI
- WebPageTest
- Chrome DevTools Performance
- New Relic/DataDog (Production)

---

## 🚀 Launch Checklist

### Pre-Launch

**Technical:**
- [ ] All APIs tested and documented
- [ ] Database migrations complete
- [ ] Security audit passed
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Backup and recovery tested
- [ ] SSL certificates configured
- [ ] CDN configured
- [ ] Error tracking setup (Sentry)
- [ ] Analytics integration (Google Analytics/Mixpanel)

**Content:**
- [ ] All copy finalized and proofread
- [ ] Terms of Service complete
- [ ] Privacy Policy complete
- [ ] Cookie Policy complete
- [ ] Help documentation written
- [ ] FAQ section populated

**Design:**
- [ ] All pages responsive
- [ ] Cross-browser tested
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Loading states implemented
- [ ] Error states designed
- [ ] Empty states designed

**Business:**
- [ ] Support email configured
- [ ] Customer support process documented
- [ ] Pricing finalized
- [ ] Payment processing tested
- [ ] Compliance requirements met
- [ ] Insurance verified

### Post-Launch

**Monitoring:**
- [ ] Uptime monitoring active
- [ ] Error rate alerts configured
- [ ] Performance monitoring active
- [ ] User feedback collection setup
- [ ] A/B testing framework ready

**Iteration:**
- [ ] User feedback review schedule
- [ ] Weekly analytics review
- [ ] Monthly feature prioritization
- [ ] Quarterly roadmap planning

---

## 📈 Success Metrics

### KPIs to Track

**User Engagement:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Pages per session
- Bounce rate

**Business Metrics:**
- New vehicle registrations per day
- Insurance compliance rate
- Dispatch authorization success rate
- User retention rate
- Customer satisfaction score (CSAT)

**Technical Metrics:**
- API response time (p50, p95, p99)
- Error rate
- Uptime percentage
- Page load times
- Database query performance

**Feature Adoption:**
- Percentage using dispatch module
- Percentage updating insurance
- Mobile vs desktop usage
- Feature usage heatmaps

---

## 🎬 Conclusion

TruFleet is not just a fleet management system—it's a **premium digital experience** that combines operational excellence with emotional design. Every interaction, every animation, every color choice has been meticulously planned to create a product that doesn't just work—it delights.

This PRD serves as the complete blueprint for building a world-class platform worthy of a $100 billion valuation. It covers every aspect from visual design to technical architecture, from user experience to security protocols.

### Key Differentiators

1. **Cinematic Experience**: Every interaction feels like a scene from a high-budget film
2. **Intelligent Compliance**: Proactive, not reactive fleet management
3. **Premium Design**: Attention to detail that rivals Apple and Tesla
4. **Real-time Operations**: Instant feedback, zero waiting
5. **Enterprise Security**: Bank-grade security with consumer-grade UX

### Development Philosophy

**Excellence is in the details:**
- Animations that feel natural
- Colors that communicate instantly
- Typography that conveys authority
- Spacing that creates breathing room
- Interactions that provide feedback

**Never compromise:**
- On performance
- On security
- On accessibility
- On user experience
- On code quality

### Next Steps

1. **Phase 1**: Landing page + Authentication (Week 1-2)
2. **Phase 2**: Admin Dashboard (Week 3-4)
3. **Phase 3**: Owner Portal + Dispatch (Week 5-6)
4. **Phase 4**: Analytics + Onboarding (Week 7-8)
5. **Phase 5**: Polish + Testing (Week 9-10)
6. **Phase 6**: Launch 🚀

---

**Remember:** We're not building software. We're crafting experiences. We're not managing fleets. We're creating confidence in every mile.

**TruFleet - Confidence in Every Mile**

---

*This document is a living specification. As we learn from users and iterate on the product, this PRD will evolve. But the core principles—premium quality, cinematic experience, and operational excellence—remain unchanging.*

**Version History:**
- v1.0 (2026-02-27): Initial comprehensive specification

**Document Owner:** Chief Product Officer & Chief Technology Officer  
**Review Cycle:** Monthly  
**Last Updated:** February 27, 2026
"# TruFleet" 
