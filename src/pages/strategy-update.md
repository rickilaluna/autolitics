# Autolitics Studio — Product & Platform Strategy
Preset: Midnight Luxe  
Objective: Expand from premium advisory into scalable digital delivery while preserving brand authority.

---

# STRATEGIC VISION

Autolitics Studio evolves from:

Premium 1:1 car-buying advisory  
→  
Premium advisory + structured digital products  
→  
Scalable advisory platform with authenticated client delivery

This is not a content play.  
This is a structured advisory platform.

---

# CORE BUSINESS MODEL

## 1️⃣ High-Touch Advisory (Premium Tier)

Core Advisory — $850  
Negotiation Support — $250 add-on  

Value:
- Bespoke strategy
- Structured deliverables
- Direct advisory access
- Higher revenue per client

Primary goal:
Authority, depth, high-margin engagement.

---

## 2️⃣ Digital Car Buyer’s Guide (Scalable Tier)

A structured, self-serve product capturing your advisory methodology.

Purpose:
- Serve lower-budget or early-stage buyers
- Build audience trust
- Generate passive revenue
- Create pipeline for Core Advisory

Pricing target range:
$49–$199

Positioning:
Not a blog post collection.  
A structured decision framework.

---

# PRODUCT ARCHITECTURE

## Tier 1 — Public Experience

- Homepage
- Method / Philosophy
- Process
- Pricing
- About
- FAQ
- Guide Sales Page
- Booking Flow

---

## Tier 2 — Authenticated Experience

User Accounts Required.

Roles:
- Guest
- Free Account
- Guide Buyer
- Advisory Client

---

# USER ROLE DEFINITIONS

## Guest
- View public pages
- View Guide sales page
- Book intro call

## Free Account
- Access limited preview content
- Download mini guide (optional)
- Receive nurture emails

## Guide Buyer
- Access full digital guide
- Download worksheets
- Access updates

## Advisory Client
- All of the above
- Access private deliverables
- Access project status
- Direct support

---

# DIGITAL GUIDE CONTENT STRUCTURE

## Core Sections

1. Mindset & Strategy Foundations  
2. Market Positioning Framework  
3. MSRP, Invoice & Market Adjustments Explained  
4. Test Drive Evaluation Framework  
5. Offer & Pricing Blueprint  
6. Dealership Playbook Decoded  
7. Ownership & Total Cost Strategy  
8. Worksheets & Practical Templates  

Deliverables:
- PDF export
- Structured HTML portal
- Printable checklists

Tone:
Measured  
Strategic  
Non-salesy  
Authority-forward  

---

# AUTHENTICATED PLATFORM FEATURES

## Authentication

- Email/password login
- Password reset
- Secure token-based sessions
- Role-based access control

---

## Dashboard Structure

Route: `/dashboard`

Sections:
- My Guides
- My Deliverables
- Downloads
- Profile
- Messages (future)

---

## Guide Delivery

After Stripe purchase:
- Associate purchase to user account
- Unlock guide access in dashboard
- Provide download link (PDF)
- Provide web-access version

---

## Advisory Deliverables Delivery

Advisory clients dashboard view:

- Discovery Status
- Strategy Brief (download)
- Shortlist Report (download)
- Test Drive Guide (download)
- Offer Framework (download)
- Negotiation Support (if purchased)

Optional:
Progress indicator showing engagement stage.

---

# PAYMENT FLOWS

## Guide

Stripe Payment Link  
→ Redirect to login/register  
→ Unlock guide in dashboard  

## Core Advisory

Stripe Payment Link  
→ `/start/success`  
→ Prompt scheduling of discovery session  
→ Dashboard access enabled

---

# NAVIGATION UPDATE

Primary Nav:

Logo | Method | Process | Pricing | Guide | About | FAQ | CTA

CTA:
Schedule Intro Strategy Session

Guide link routes to:
`/guide`

---

# ROUTE STRUCTURE

Public:
- `/`
- `/guide`
- `/about`
- `/faq`
- `/book`
- `/start`

Auth:
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/downloads`
- `/dashboard/deliverables`
- `/dashboard/profile`

---

# DESIGN PRINCIPLES

Maintain Midnight Luxe identity:
- Obsidian backgrounds
- Champagne accents
- Rounded containers
- Noise overlay
- Structured typography

Authenticated dashboard may use:
- Ivory content panels
- Obsidian frame
- Minimal icons

No clutter. No SaaS dashboard chaos.

---

# BUSINESS STRATEGY BENEFITS

1. Converts visitors who aren’t ready for $850.
2. Creates pipeline into advisory.
3. Establishes authority through structured methodology.
4. Enables recurring updates (EV incentives, market shifts).
5. Increases lifetime customer value.

---

# DEVELOPMENT MILESTONES

Phase 1:
- Auth system
- Dashboard scaffold
- Guide sales page
- Stripe guide purchase flow

Phase 2:
- Guide content upload
- PDF export
- Advisory deliverable hosting

Phase 3:
- Analytics
- Role refinement
- UX polish
- Soft launch

---

# LONG-TERM VISION

Autolitics Studio becomes:

- A boutique advisory firm
- A structured digital education platform
- A trusted authority in vehicle decision-making

Not a dealership alternative.  
A decision intelligence layer for car buyers.

---

# EXECUTION DIRECTIVE

Build this as a platform, not a content library.

Every interaction must feel:
Intentional  
Secure  
Premium  
Structured  

No generic SaaS aesthetics.
No template dashboards.
No fluff content.