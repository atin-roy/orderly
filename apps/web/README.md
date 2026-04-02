# Orderly Demo Notes

## Quick Start

Run the API and web app in separate terminals:

```bash
cd apps/api
./mvnw spring-boot:run
```

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo Behavior

- On a fresh Postgres database, the backend seeds:
  - 24 Kolkata-focused restaurants
  - dense menus for each restaurant
  - demo customer, owner, delivery, and admin accounts
  - saved Kolkata addresses for the customer
  - seeded active and historical orders
- If you destroy the Postgres container and start a new one, the demo catalog is recreated on boot.
- If the database already contains restaurants, the seeder does not wipe them, so owner edits and newly added restaurants remain editable and persistent.

## Demo Accounts

All seeded accounts use password `orderly-demo`.

- Customer: `demo.customer@orderly.local`
- Owner: `demo.owner@orderly.local`
- Delivery: `demo.delivery@orderly.local`
- Admin: `demo.admin@orderly.local`

## What To Explore

- `/explore` now searches live backend data by restaurant name, cuisine, locality, and dish name.
- `/restaurants/[id]` shows a live menu and adds items to the real cart.
- `/cart`, `/checkout`, and `/orders` now use backend cart/order APIs.
- Checkout uses a fake Razorpay-style payment sheet and persists believable payment metadata.
- `/owner/dashboard` and `/owner/menu` allow adding and editing restaurants and menu items from the UI.
