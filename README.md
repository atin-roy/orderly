# Orderly

A full-stack food delivery platform built as a class project. Think Swiggy/Zomato — customers browse restaurants and order food, restaurant owners manage their menus, delivery partners handle fulfillment, and admins oversee the whole thing.

Built with a **Next.js** frontend, **Spring Boot** backend, and **PostgreSQL** — all containerized with Docker Compose and managed as a Turborepo monorepo.

---

## What it does

**Four distinct user roles**, each with their own dashboard and workflows:

### Customers
- Search and browse restaurants by city, locality, cuisine, or keyword
- View restaurant menus with item details, images, veg/non-veg tags
- Add items to cart with quantity controls and special instructions
- Apply discount coupons at checkout
- Choose from saved delivery addresses (or add new ones)
- Place orders and track status through a live timeline — from *Placed* all the way to *Delivered*
- View full order history with pagination

### Restaurant Owners
- Register with a business profile (name, city, service area, cuisine focus)
- Create and manage restaurants — set delivery time, fee, description, images
- Full menu management — add/edit/remove items, toggle availability, set categories and sort order
- Live orders dashboard showing active order count and incoming orders

### Delivery Partners
- Register with vehicle type, preferred shift, service zones
- Dashboard with active deliveries and recent order history

### Admins
- Master dashboard with real-time stats — active orders, active riders, deliveries today, total restaurants
- Restaurant management — create, approve, activate/deactivate
- Delivery partner management — full CRUD
- Coupon management — create, enable/disable, set minimum order requirements

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | **Next.js 16** (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | **Spring Boot 4** (Java 25), Spring Security, Spring Data JPA |
| Database | **PostgreSQL 17** |
| Auth | JWT (HS256) via JJWT, role-based route protection |
| Monorepo | **Turborepo** with npm workspaces |
| Shared Types | Dedicated `@orderly/types` TypeScript package |
| Containerization | **Docker Compose** — web, api, postgres (+ pgAdmin in debug profile) |
| Images | GitHub Container Registry (ghcr.io) |

---

## Project Structure

```
orderly/
├── apps/
│   ├── api/          # Spring Boot backend (Maven)
│   └── web/          # Next.js frontend
├── packages/
│   ├── types/        # Shared TypeScript type definitions
│   ├── docs/         # Project documentation
│   └── favicons/     # Favicon assets
├── docker-compose.yml
├── turbo.json
└── Makefile
```

**Backend** follows a standard layered architecture — controllers, services, repositories, entities — organized by domain module (`auth`, `restaurant`, `order`, `cart`, `coupon`, `user`, `media`).

**Frontend** uses Next.js App Router with route groups for role-based layouts: `(auth)`, `(customer)`, `(owner)`, `(delivery)`, `(admin)`. Protected routes are enforced through a proxy middleware that checks JWT tokens and roles before allowing access.

**Shared types** live in `packages/types` and are imported by the web app as `@orderly/types`, keeping API contracts in sync across the stack.

---

## How It Works (Key Flows)

### Authentication
- Users register with email/password/phone. Business and delivery signups collect additional profile info.
- Login returns a JWT (24h expiry) stored in both localStorage and cookies.
- Every API request from the frontend attaches the token as a Bearer header.
- The backend validates tokens through a Spring Security filter chain.
- Route protection happens on both sides — the Next.js proxy checks roles before forwarding requests, and the backend validates independently.

### Ordering
1. Customer adds items to cart (one restaurant at a time — switching restaurants clears the cart)
2. At checkout, pricing is calculated: `subtotal + delivery fee + platform fee (₹12) + taxes (10%) - coupon discount`
3. Order is placed, cart is cleared, and the order enters the status pipeline:
   `PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → DELIVERED`
4. Each status change creates a timeline entry with a timestamp
5. Customers see estimated delivery time and a visual timeline on the order detail page

### Image Uploads
- Restaurants and menu items support image uploads (up to 5MB)
- Files are stored in a Docker volume (`orderly-uploads`)
- The frontend resolves image URLs through a helper that handles both external URLs and local uploads

---

## Running Locally

### Prerequisites
- Docker and Docker Compose

### Quick Start

```bash
# Clone and set up environment
cp .env.example .env

# Start everything
make up

# Or with pgAdmin for database inspection
make debug-up
```

The app will be available at `http://localhost:3000`.

### Other Commands

```bash
make down       # Stop services
make rebuild    # Rebuild and restart
make reset-db   # Wipe database and restart fresh
make logs       # Tail all service logs
make ps         # Show running containers
```

---

## Database

14 tables managed by JPA (Hibernate auto-update mode — no separate migrations):

- **users** — single table for all roles, differentiated by role enum
- **business_profiles** / **delivery_partner_profiles** — role-specific profile extensions (OneToOne with users)
- **user_addresses** — multiple saved addresses per customer
- **restaurants** — with approval/active flags, owned by business users
- **menu_items** — belong to restaurants, with category, price, veg status, availability
- **carts** / **cart_items** — one cart per user, cleared on order placement
- **orders** / **order_items** — full order records with pricing breakdown
- **order_timeline** — status history with timestamps
- **coupons** — discount codes with minimum order requirements

---

## API

45+ REST endpoints under `/api`, organized by domain:

- `/auth/*` — register (customer/business/delivery), login
- `/profile/*` — user profile, addresses
- `/restaurants/*` — browse, search, CRUD, menu management
- `/cart/*` — add/update/remove items, clear
- `/orders/*` — place, track, dashboards (admin/owner/delivery)
- `/coupons/*` — list, validate, admin CRUD
- `/uploads/*` — image upload

All responses follow a consistent `ApiResponse<T>` wrapper. Paginated endpoints return `PaginatedResponse<T>` with page/size/totalElements/totalPages.

---

## Notable Design Decisions

- **Single cart constraint** — one cart per user tied to one restaurant, enforced at the database level with a unique index. Prevents mixed-restaurant orders.
- **Event-driven cart UI** — cart modifications dispatch a custom browser event (`orderly:cart-updated`) so all components stay in sync without polling or a state management library.
- **Proxy-based API routing** — the Next.js app proxies all `/api` calls to the Spring backend through an explicit route handler, handling auth token forwarding and server-side rendering.
- **IST timezone everywhere** — the JVM, Spring Clock bean, and display layer are all pinned to Asia/Kolkata.
- **Platform fee + tax model** — flat ₹12 platform fee and 10% tax on subtotal, calculated in a shared utility.
- **No state management library** — auth lives in localStorage/cookies with a React context provider; everything else is fetched on demand.

---

## Current Limitations

- Payment gateway is stubbed out — fields exist for Razorpay/Stripe integration but orders default to offline/pending
- Delivery partner assignment is manual (admin-assigned, no auto-matching algorithm)
- No real-time push — order status updates require page refresh
- Rating field exists on restaurants but there's no review submission flow yet
- No email/SMS notifications
