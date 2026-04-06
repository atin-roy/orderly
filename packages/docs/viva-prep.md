# Orderly — Viva Preparation Guide

This document covers the architecture, design decisions, and technical details of Orderly in a Q&A format. It's organized by topic so you can quickly find what you need.

---

## 1. Project Overview

**Q: What is Orderly?**
A food delivery platform — like Swiggy or Zomato. It has four user roles: customers who order food, restaurant owners who manage menus, delivery partners who handle fulfillment, and admins who manage the whole platform.

**Q: What's the tech stack?**
- Frontend: Next.js 16 with React 19, TypeScript, Tailwind CSS 4
- Backend: Spring Boot 4 with Java 25, Spring Security, Spring Data JPA
- Database: PostgreSQL 17
- Auth: JWT tokens using the JJWT library
- Monorepo: Turborepo with npm workspaces
- Deployment: Docker Compose with three services (web, api, postgres)

**Q: Why a monorepo?**
Keeps the frontend, backend, and shared types in one repository. The `@orderly/types` package defines TypeScript interfaces that match the backend DTOs, so the frontend always knows the exact shape of API responses. Turborepo handles build orchestration and caching across packages.

**Q: Why separate backend instead of Next.js API routes?**
Spring Boot gives us a mature ecosystem for things like JPA/Hibernate for database access, Spring Security for auth, and well-established patterns for layered architecture. It also means the backend can be developed, tested, and scaled independently of the frontend.

---

## 2. Architecture

**Q: Describe the overall architecture.**
It's a three-tier architecture:
1. **Presentation layer** — Next.js app that renders the UI and proxies API calls
2. **Application layer** — Spring Boot REST API that handles business logic
3. **Data layer** — PostgreSQL database accessed through Spring Data JPA

The frontend never talks to the database directly. All data flows through the REST API.

**Q: How does the backend code organization work?**
It follows a layered architecture organized by domain module:
- **Controller** — handles HTTP requests, validates input, returns responses
- **Service** — contains business logic, handles transactions
- **Repository** — Spring Data JPA interfaces for database queries
- **Entity** — JPA-annotated domain objects that map to database tables
- **DTO** — Data Transfer Objects for API request/response payloads
- **Mapper** — converts between entities and DTOs

Modules: `auth`, `restaurant`, `order`, `cart`, `coupon`, `user`, `media`, `common`.

**Q: How does the frontend architecture work?**
Next.js App Router with route groups for each user role:
- `(auth)` — login, registration pages
- `(customer)` — browse, cart, checkout, orders
- `(owner)` — restaurant and menu management
- `(delivery)` — delivery dashboard
- `(admin)` — platform management

Protected routes use a proxy middleware (`proxy.ts`) that checks JWT tokens and roles before allowing access.

**Q: What's the role of the `packages/types` package?**
It's a shared TypeScript package that defines all the API types — `User`, `Restaurant`, `Order`, `Cart`, `Coupon`, etc. The web app imports these as `@orderly/types`. This keeps the frontend in sync with backend API contracts without manual duplication.

**Q: Why proxy API calls through Next.js instead of calling the backend directly?**
Three reasons:
1. The backend runs on a different port/container — proxying avoids CORS issues in production
2. Server-side rendering needs to call the API from the server, not the browser. The proxy uses `INTERNAL_API_URL` (container-to-container) for server requests and `/api` (browser-relative) for client requests
3. It centralizes auth token forwarding — the proxy attaches the JWT from cookies/headers automatically

---

## 3. Authentication & Authorization

**Q: How does authentication work?**
JWT-based. When a user logs in or registers, the backend generates a JWT token signed with HS256 (HMAC-SHA256) using a secret key. The token contains the user's email, role, and expiration time (24 hours).

The frontend stores the token in both localStorage and a cookie (`orderly_token`). Every API request includes the token in the `Authorization: Bearer <token>` header.

**Q: Walk through the login flow.**
1. User submits email + password to `POST /api/auth/login`
2. Backend loads user by email, verifies password with BCrypt
3. If valid, generates JWT with claims: subject (email), role, issuedAt, expiration
4. Returns token + user info to frontend
5. Frontend stores token in localStorage and cookie, updates session context
6. Subsequent requests include the token in the Authorization header

**Q: How is the JWT validated on each request?**
There's a `JwtAuthenticationFilter` in the Spring Security filter chain. On every request:
1. Extract the Authorization header
2. Parse and validate the JWT (checks signature, expiration)
3. Extract user email and role from claims
4. Load the user from the database
5. Set the authentication in Spring's SecurityContext
6. The request proceeds to the controller

If the token is invalid or expired, the filter returns a 401.

**Q: How does role-based access control work?**
Two layers:
1. **Frontend** — the proxy middleware (`proxy.ts`) maps URL patterns to required roles. `/orders/*` requires USER, `/owner/*` requires BUSINESS, `/admin/*` requires ADMIN, etc. If the role doesn't match, it redirects to login.
2. **Backend** — services check the authenticated user's role before performing operations. For example, only BUSINESS users can create restaurants, only ADMIN can approve them.

**Q: What's BCrypt and why use it for passwords?**
BCrypt is a password hashing algorithm that's intentionally slow and includes a built-in salt. Unlike SHA-256 or MD5, it's designed specifically for passwords — the slowness makes brute-force attacks impractical, and the salt prevents rainbow table attacks. Spring Security provides `BCryptPasswordEncoder` out of the box.

**Q: What's inside the JWT token?**
Three parts (base64-encoded, separated by dots):
1. **Header** — algorithm (HS256) and token type (JWT)
2. **Payload** — claims: `sub` (email), `role` (USER/BUSINESS/etc.), `iat` (issued at), `exp` (expiration)
3. **Signature** — HMAC-SHA256 of header + payload using the secret key

The signature ensures the token hasn't been tampered with. If anyone modifies the payload, the signature won't match.

**Q: Why store the token in both localStorage and cookies?**
localStorage is accessible from JavaScript for client-side API calls. Cookies are sent automatically with requests, which the Next.js server-side proxy uses to forward auth when doing server-side rendering. It's a pragmatic approach for SSR + SPA auth.

---

## 4. Database Design

**Q: How many tables are there? Describe the schema.**
14 tables. The core ones:

- **users** — stores all users regardless of role. Fields: id, email (unique), password (bcrypt hash), name, phone (unique), role (enum: USER/BUSINESS/DELIVERY_PARTNER/ADMIN), timestamps
- **business_profiles** — one-to-one extension for BUSINESS users (business name, city, service area, cuisine focus)
- **delivery_partner_profiles** — one-to-one extension for DELIVERY_PARTNER users (vehicle type, shift, zones, experience)
- **user_addresses** — one-to-many from users. Customers can have multiple delivery addresses with one marked as default
- **restaurants** — owned by BUSINESS users. Has approval/active flags, cuisine type, city, locality, delivery time, fee, rating
- **menu_items** — belong to a restaurant. Price, category, veg status, availability, sort order
- **carts** — one per user (unique index on user_id), linked to a restaurant
- **cart_items** — items in a cart with quantity and optional notes
- **orders** — full order record with pricing breakdown (subtotal, delivery fee, platform fee, taxes, discount, total)
- **order_items** — snapshot of items at time of order (stores name and price to preserve history even if menu changes)
- **order_timeline** — status history entries with timestamps
- **coupons** — discount codes with minimum order requirement and enabled flag

**Q: Why is there a separate order_items table instead of referencing menu_items directly?**
Order items store a snapshot of the item name and price at the time of ordering. If a restaurant later changes a menu item's price or name, existing order records should still show what the customer actually paid. It's a standard pattern in e-commerce — you never want order history to change retroactively.

**Q: Why a single `users` table for all roles instead of separate tables?**
Simpler auth — one login endpoint, one JWT generation path, one user lookup. The role-specific data (business profile, delivery profile) is in separate tables linked by one-to-one relationships. This avoids duplicating common fields (email, password, phone) across multiple tables.

**Q: How does the cart constraint work?**
The `carts` table has a unique index on `user_id`, so each user can only have one cart. The cart also references a `restaurant_id`. When a customer adds an item from a different restaurant, the service checks if the cart's restaurant matches — if not, it clears the existing cart items and updates the restaurant reference. This prevents mixed-restaurant orders.

**Q: What indexes are defined?**
- `users.email` — unique, for login lookups
- `users.phone` — unique
- `restaurants.slug` — unique, for URL-friendly lookups
- `restaurants.owner_id` — for fetching owner's restaurants
- `restaurants` on (is_approved, is_active) — for filtering public listings
- `restaurants` on (city, locality) — for location-based search
- `orders` on (user_id, created_date) — for customer order history
- `orders.restaurant_id` — for restaurant order views
- `orders.status` — for dashboard filtering
- `carts.user_id` — unique, enforces one cart per user

**Q: Why use JPA auto-update (ddl-auto: update) instead of migrations?**
It's simpler for development — JPA automatically creates/alters tables to match entity definitions. For a production system you'd want proper migrations (Flyway or Liquibase) for reproducible, version-controlled schema changes. But for a class project, auto-update keeps the development cycle fast.

**Q: Explain the BaseEntity pattern.**
All entities extend `BaseEntity`, which provides:
- `id` — auto-generated primary key (Long)
- `createdDate` — automatically set on insert via JPA auditing (`@CreatedDate`)
- `updatedDate` — automatically updated on modification (`@LastModifiedDate`)

This avoids repeating these fields in every entity class. JPA auditing is enabled with `@EnableJpaAuditing` on the application config.

---

## 5. Order Flow & Pricing

**Q: Walk through the complete order placement flow.**
1. Customer adds items to cart → `POST /api/cart/items`
2. Customer views cart → `GET /api/cart` (shows items, subtotal)
3. Customer optionally applies coupon → `POST /api/coupons/validate` (checks code validity and minimum order amount)
4. Customer selects delivery address and payment method
5. Customer places order → `POST /api/orders`
6. Backend creates the Order entity with pricing breakdown:
   - Subtotal = sum of (item price × quantity)
   - Delivery fee = from restaurant config
   - Platform fee = ₹12 (flat)
   - Taxes = 10% of subtotal
   - Discount = coupon discount amount (if valid)
   - Total = subtotal + delivery fee + platform fee + taxes - discount
7. Backend creates OrderItem records (snapshots of menu items)
8. Backend creates initial OrderTimeline entry with status PLACED
9. Backend clears the customer's cart
10. Returns order details to frontend

**Q: What are the order statuses?**
`PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → DELIVERED`

An order can also be `CANCELLED` at any point. Each transition creates a new `OrderTimeline` entry with a timestamp.

**Q: How is pricing calculated?**
There's a `PricingUtils` utility class that handles the calculation:
- Prices are stored as integers (representing the smallest currency unit)
- Platform fee is a constant (₹12)
- Tax rate is 10% of subtotal
- The frontend displays the breakdown at checkout, and the backend recalculates independently when the order is placed (never trust the client)

**Q: Why recalculate pricing on the backend?**
Security. If the frontend sends the total amount, a user could modify the request and pay less. The backend always recalculates from the cart items' actual prices. The frontend calculation is just for display purposes.

---

## 6. Frontend Details

**Q: How does the cart UI stay in sync across components?**
Custom browser events. When any component modifies the cart (add/remove/update), it dispatches a `orderly:cart-updated` event on the window. Other components (like the cart icon in the header) listen for this event and re-fetch the cart data. No state management library needed — just native browser events.

**Q: Why no Redux or Zustand?**
The app doesn't have complex cross-component state that would justify a state management library. Auth state lives in a React context provider. Cart updates use the custom event pattern. Everything else is fetched on demand when a page loads. Adding Redux would be overengineering for this use case.

**Q: How does the API client work?**
There's a central `lib/api.ts` file (~700 lines) that defines functions for every API endpoint — `getRestaurants()`, `addToCart()`, `placeOrder()`, etc. Each function:
1. Constructs the URL
2. Attaches the JWT token from session
3. Makes a fetch request
4. Returns typed data (using `@orderly/types`)

This keeps API calls organized in one place instead of scattered across components.

**Q: How does route protection work on the frontend?**
The `proxy.ts` module maps URL patterns to required roles:
- `/orders/*`, `/cart/*`, `/checkout/*` → USER
- `/owner/*` → BUSINESS
- `/delivery/*` → DELIVERY_PARTNER
- `/admin/*` → ADMIN

When a request comes in, the proxy reads the JWT from cookies, decodes the role, and checks if it matches. If not, it redirects to the login page. This runs on the server side (Next.js middleware), so unauthorized pages never even render.

**Q: What's the `resolveAssetUrl()` function for?**
It handles image URL resolution. Images can come from two sources:
1. External URLs (full http/https) — returned as-is
2. Local uploads (paths like `/uploads/image.jpg`) — prepended with the API base URL

This abstraction means components don't need to care where an image is stored.

**Q: How does server-side rendering interact with the API?**
Next.js can render pages on the server before sending HTML to the browser. For server-rendered pages that need data, the Next.js server calls the Spring Boot API using `INTERNAL_API_URL` (a container-to-container URL like `http://orderly-api:8080/api`). For browser-side requests, it uses the relative `/api` path which gets proxied. The `lib/api.ts` client handles this distinction automatically.

---

## 7. Backend Details

**Q: How does Spring Security work in this project?**
The security config does the following:
1. Disables CSRF (not needed for JWT-based auth — tokens aren't sent automatically like cookies)
2. Sets session management to STATELESS (no server-side sessions, everything is in the JWT)
3. Registers the `JwtAuthenticationFilter` before Spring's default username/password filter
4. Configures CORS to allow requests from the frontend origin
5. Permits public access to auth endpoints and static resources
6. Requires authentication for everything else

**Q: What is Spring Data JPA and how is it used here?**
Spring Data JPA lets you define database queries by just writing repository interfaces. For example:
```java
List<Restaurant> findByCityAndIsApprovedTrueAndIsActiveTrue(String city);
```
Spring automatically generates the SQL query from the method name. For complex queries, we use `@Query` annotations with JPQL. Repositories extend `JpaRepository` which provides standard CRUD operations plus pagination support.

**Q: How does pagination work?**
Backend uses Spring's `Pageable` interface. Controllers accept `page` and `size` query parameters, create a `PageRequest`, and pass it to the repository. The repository returns a `Page<T>` object containing the data plus metadata (total elements, total pages). This gets mapped to a `PaginatedResponse<T>` DTO that the frontend understands.

**Q: Explain the entity relationship mapping.**
JPA annotations define relationships between entities:
- `@ManyToOne` — many orders belong to one restaurant (`Order.restaurant`)
- `@OneToMany` — one restaurant has many menu items (`Restaurant.menuItems`)
- `@OneToOne` — one user has one business profile (`User ↔ BusinessProfile`)
- `@JoinColumn` — specifies the foreign key column
- Lazy loading (`FetchType.LAZY`) is used to avoid loading related entities until they're actually accessed

**Q: How are exceptions handled?**
There's a `GlobalExceptionHandler` annotated with `@RestControllerAdvice`. It catches specific exceptions and returns consistent error responses:
- `EntityNotFoundException` → 404
- `IllegalArgumentException` → 400
- General exceptions → 500

All error responses use the `ApiResponse` wrapper with a success=false flag and error message.

**Q: What's the `@Transactional` annotation doing?**
It wraps a method in a database transaction. If any operation within the method fails, all database changes are rolled back. Order placement is a good example — it creates the order, order items, timeline entry, and clears the cart. If any of those fail, none of them should persist. `@Transactional` ensures atomicity.

---

## 8. Docker & Deployment

**Q: How is the project deployed?**
Docker Compose runs three services:
1. **orderly-web** — Next.js frontend (port 3000)
2. **orderly-api** — Spring Boot backend (port 8080, not exposed externally)
3. **orderly-postgres** — PostgreSQL 17 (port 5432, bound to localhost)

A fourth service, **orderly-pgadmin**, is available under the `debug` profile for database inspection.

**Q: Explain the Docker Compose configuration.**
- Services have restart policies (`unless-stopped`)
- The API service depends on postgres being healthy (healthcheck with `pg_isready`)
- The web service depends on the API being started
- Two named volumes: `orderly-pgdata` for database persistence and `orderly-uploads` for uploaded images
- All ports are bound to `127.0.0.1` (localhost only, not exposed to the network)
- Environment variables are loaded from `.env` with sensible defaults

**Q: How do the containers communicate?**
Docker Compose creates a shared network. Services refer to each other by container name:
- Web → API: `http://orderly-api:8080/api` (set via `INTERNAL_API_URL`)
- API → Postgres: `jdbc:postgresql://orderly-postgres:5432/orderly` (set via `SPRING_DATASOURCE_URL`)

The browser never talks to the API directly — all requests go through the Next.js proxy.

**Q: How are Docker images built?**
Both apps use multi-stage Dockerfiles:
- **API**: First stage compiles Java with Maven, second stage copies the JAR into a slim JRE image
- **Web**: First stage installs dependencies and builds Next.js (standalone output), second stage copies only the production artifacts

Multi-stage builds keep the final images small by excluding build tools and source code.

**Q: What's the standalone output mode in Next.js?**
`output: "standalone"` in `next.config.ts` tells Next.js to produce a self-contained Node.js server. Instead of needing the full `node_modules` directory, it bundles only the files needed to run. This makes the Docker image much smaller and faster to start.

---

## 9. Design Decisions & Trade-offs

**Q: Why Spring Boot instead of Express/Fastify/another Node.js framework?**
Spring Boot provides a batteries-included framework for enterprise patterns — JPA for database access, Spring Security for auth, built-in validation, transaction management. It's also what was taught in the course, and having a separate backend language from the frontend demonstrates proper separation of concerns.

**Q: Why Tailwind CSS instead of a component library?**
Tailwind gives full control over the design without fighting a component library's opinions. It also means no extra bundle size from unused components. For a project where the UI needs to look custom and not like every other Material UI or Bootstrap app, utility classes are the faster path.

**Q: Why PostgreSQL?**
Relational data with complex relationships (users → orders → items, restaurants → menus) maps naturally to a relational database. PostgreSQL is production-grade, has excellent JPA support, and runs easily in Docker. For a food delivery platform, ACID transactions are important — you don't want an order to be partially created.

**Q: What would you improve if you had more time?**
- **Payment integration** — fields exist for Razorpay/Stripe but no actual gateway. Would add webhook handling for payment confirmation
- **Real-time updates** — WebSocket support for live order tracking instead of requiring page refresh
- **Auto-assignment** — algorithm to assign delivery partners based on proximity and availability
- **Database migrations** — switch from JPA auto-update to Flyway for proper version-controlled schema changes
- **Email/SMS notifications** — order confirmations, status updates
- **Review system** — customers rating restaurants and writing reviews
- **Caching** — Redis for frequently accessed data like restaurant listings
- **Testing** — unit tests for services, integration tests for API endpoints

**Q: What are the security considerations?**
- Passwords are hashed with BCrypt (never stored in plaintext)
- JWT tokens are signed with HS256 — can't be forged without the secret key
- CORS is configured to only accept requests from the frontend origin
- Role-based access control on both frontend (route protection) and backend (service-level checks)
- All pricing is recalculated server-side — the client's numbers are only for display
- Database ports are bound to localhost only (not network-exposed)
- File uploads are limited to 5MB

**Q: What are potential scalability concerns?**
- File storage is local (Docker volume) — would need S3 or similar for multiple API instances
- No caching layer — database gets hit on every request
- No message queue — order processing is synchronous
- Single database instance — would need read replicas for high read load
- JWT is stateless which is good for horizontal scaling, but token revocation requires extra infrastructure (like a Redis blacklist)

---

## 10. Concepts You Should Be Able to Explain

These are terms and concepts that might come up. Make sure you can explain them in your own words.

**REST API** — Architectural style for web services. Resources are identified by URLs, operations use HTTP methods (GET/POST/PUT/DELETE), and data is transferred as JSON. Stateless — each request contains all the information needed to process it.

**JWT (JSON Web Token)** — A compact, self-contained token for securely transmitting information between parties. Three parts: header, payload, signature. The server doesn't need to store session data — the token itself contains the user's identity and role.

**JPA (Java Persistence API)** — A specification for mapping Java objects to database tables (Object-Relational Mapping). Hibernate is the implementation. You annotate Java classes with `@Entity`, `@Table`, `@Column`, etc., and JPA handles the SQL.

**Spring Security Filter Chain** — A series of filters that process every HTTP request. Each filter can inspect, modify, or reject the request. Our JWT filter sits in this chain and validates tokens before the request reaches the controller.

**CORS (Cross-Origin Resource Sharing)** — A browser security mechanism that blocks requests to a different domain/port. The backend must explicitly allow the frontend's origin. We configure this in Spring Security.

**Docker Compose** — A tool for defining and running multi-container applications. The `docker-compose.yml` file describes all services, their dependencies, networks, and volumes. One command (`docker compose up`) starts everything.

**Turborepo** — A build system for JavaScript/TypeScript monorepos. It understands the dependency graph between packages, caches build outputs, and runs tasks in parallel when possible. Our `turbo.json` defines build, dev, and lint tasks.

**App Router (Next.js)** — The routing system in Next.js 13+. Files in the `app/` directory define routes. `page.tsx` renders at that path, `layout.tsx` wraps child routes. Route groups (parenthesized folders like `(admin)`) organize routes without affecting URLs.

**Layered Architecture** — Separation of concerns where each layer has a specific responsibility: presentation (controllers), business logic (services), data access (repositories). Each layer only communicates with the layer directly below it.

**Database Transactions** — A sequence of operations treated as a single unit. Either all operations succeed (commit) or all are rolled back. Ensures data consistency — like making sure an order and its items are either both created or neither is.
