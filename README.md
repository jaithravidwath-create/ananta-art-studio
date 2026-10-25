# Art Studio

Art Studio is a small full-stack application for a refined Indian art studio. It demonstrates three carefully bounded workflows: reserving a one-of-a-kind painting, requesting a wall-painting date, and commissioning custom pottery.

The application is built with React, TypeScript, Express, tRPC, Drizzle ORM, and managed MySQL. The interface follows a quiet private-salon direction: cream and warm beige surfaces, espresso navigation, muted brass details, serif editorial headings, and clear register-like forms.

## Seed data preserved

The provided `seedData.zip` was inspected and copied into `server/seed/seed.json`. The database seed preserves all 12 supplied painting IDs and catalog fields, the original 10 available / 2 sold painting statuses, the 5 pottery item IDs, the 6 glaze IDs, the `INR` currency, the mural rate of `₹150` per square foot, and the supplied Studio Admin credentials. Four additional original salon works were added as available catalogue records (`p-013` through `p-016`) using managed image storage; supplied painting images remain copied into `client/public/images/`.

The seed is idempotent. It updates catalog descriptions and settings, but it does not reset transactional orders, bookings, pottery requests, or a painting’s current availability after the initial insert.

## Demo credentials

The seed includes the Studio Admin account:

- Studio Admin: `studio@artstudio.in` / `Studio@123`

The seed data did not include a customer account, so the project adds one clearly documented demo customer for the assignment flow:

- Customer: `customer@artstudio.in` / `Customer@123`

This app uses a signed application session cookie. For embedded HTTPS Preview it uses `SameSite=None; Secure`, as required for a cross-site iframe. For plain HTTP local development, set `APP_COOKIE_SECURE=false` in a local `.env` file.

## Setup

Requirements: Node 20+, pnpm 10.18+, and a MySQL-compatible `DATABASE_URL`. The managed Webdev project provides the database environment automatically.

```bash
pnpm install
cp .env.example .env
# For plain local HTTP only, set APP_COOKIE_SECURE=false in .env.
pnpm db:migrate
pnpm seed
pnpm dev
```

The development server listens on port `3000` unless `PORT` is set. Open the local URL shown by the dev server. In addition to the assignment flows, the public site includes About the House and Studio Journal editorial pages. The production build is:

```bash
pnpm check
pnpm test
pnpm build
pnpm start
```

## Environment variables

`.env.example` contains variable names only. `DATABASE_URL` is required for migrations, seed, and server-backed workflows. `APP_SESSION_SECRET` should be set to a long random value outside the managed preview if a deployment-specific secret is available. `APP_COOKIE_SECURE` defaults to secure Preview behavior; set it to `false` only for plain HTTP local testing. `PORT` is optional.

## Database and authorization model

Drizzle migrations are in `drizzle/`. `drizzle/schema.ts` defines the users table extension, paintings, painting orders, wall bookings, pottery catalogs, pottery requests, and studio settings. `server/seed.ts` performs the provided-data seed. Every protected tRPC procedure resolves the signed session to a database user. `adminProcedure` checks the database role on the server; UI visibility is not treated as authorization.

Painting purchase is an atomic `available -> sold` update inside a transaction before an order is written. A failed update returns a conflict rather than creating a second order. Cancelling an active order returns the painting to available. Wall booking dates have a database unique constraint and validation for the 7–90 day window. Pottery mutations validate catalog IDs, quantity, needed-by date, ownership, and requested-only transitions on the server.

## Five-minute demo flow

Sign in as the customer, open The Collection, choose an available work, and reserve it. Visit Wall Painting, select a date 7–90 days away, enter a wall size and address, and show the live `wall size × ₹150` calculation. Visit Custom Pottery, choose an item and glaze, pick a quantity and a date at least 14 days away, then submit. Open My Studio to show the three customer registers and the ability to cancel or edit where allowed. Sign out and use the Studio Admin account. Open Studio Desk to show inventory, all orders, wall requests, and pottery requests; confirm or decline a wall request, accept or decline a pottery request, and edit an available painting.

## Scope intentionally left out

There is no real payment processing, account sign-up, password reset, email verification, social login, customer email/SMS, reviews, coupons, delivery tracking, upload workflow, or native mobile app. Those are outside the assignment MVP and are described with next steps in `DESIGN.md`.
