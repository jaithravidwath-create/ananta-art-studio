# Ananta implementation plan

## Scope and approach

Build on the initialized React + Express + tRPC + Drizzle + managed MySQL starter. Preserve the supplied seed data exactly: 12 paintings (10 available, 2 sold), five pottery items, six glazes, INR currency, the INR 150/sq ft mural rate, and the supplied studio admin account. Because the seed includes an admin account but no customer, add one clearly documented demo customer account only where needed for a complete recording flow.

Use a small application-owned signed session cookie for the assignment’s demo login. The server resolves the session to a row in `users` on every tRPC request. Protected procedures enforce authentication and admin procedures enforce the Studio Admin role server-side. Cookies are `SameSite=None; Secure` for embedded HTTPS Preview, with an explicit `APP_COOKIE_SECURE=false` override for plain local HTTP.

Use MySQL tables for paintings, painting orders, wall bookings, pottery items, glazes, pottery requests, and studio settings. Seed insertion is idempotent and never overwrites existing transactional records. Painting purchase uses an atomic availability update inside a transaction before creating an order. Wall booking uses a unique booking-date constraint plus a transaction. Status mutations allow only the documented transitions.

## Data and server structure

- `drizzle/schema.ts`: users extension plus catalog, transactional, and settings tables.
- `server/seed.ts`: idempotent seed loader from `server/seed/seed.json`.
- `server/auth.ts`: demo credential verification and signed session cookie helpers.
- `server/_core/context.ts`: resolve the app session on every request.
- `server/routers.ts`: public catalog procedures, customer procedures, and admin procedures with zod validation.
- `client/src/App.tsx`: route shell, navigation, auth-aware access gates, and page routing.
- `client/src/pages/*`: home, login, gallery, painting detail, customer dashboard, wall booking, pottery request, admin dashboard, and not-found states.
- `client/src/index.css`: old-money art salon visual system and responsive layout.
- `public/manus-routes.json`: complete page route manifest.

## Design direction

Three possible directions sampled for the brief: **private art salon / editorial gallery** (0.06), **craft atelier / tactile workshop** (0.08), **heritage hotel / quiet luxury** (0.04). Choose private art salon / editorial gallery.

- **Design movement:** quiet luxury editorial gallery, inspired by a historic mansion entrance hall and private salon.
- **Core principles:** curated not crowded; warm materials over effects; hierarchy through type and rules; action clarity over ornament.
- **Color philosophy:** soft cream and linen beige make the paintings feel collected in daylight; espresso and charcoal provide mansion-like depth; muted brass is reserved for the occasional rule, label, and selected state.
- **Layout paradigm:** an asymmetric gallery rail: a dark left brand rail and narrow editorial bands lead into wide, breathable catalog surfaces instead of a centered SaaS grid.
- **Signature elements:** brass hairline rules, framed gallery labels, and small uppercase catalog metadata paired with oversized serif titles.
- **Interaction philosophy:** forms feel like a studio register—clear, calm, and reversible where business rules permit; conflicts are described plainly instead of hidden.
- **Animation:** no decorative motion; use brief opacity/translate transitions only for page entry and success feedback, respecting reduced motion.
- **Typography system:** Georgia/Times-like serif for major headings and card titles; system sans for controls, metadata, and body copy. Uppercase letter-spaced labels establish the catalog voice.
- **Brand essence:** a private art salon for buying, commissioning, and booking made-to-measure craft; composed, discerning, human.
- **Brand voice:** headlines are poised and specific; CTAs are direct and warm. Example lines: “Works with a singular point of view.” / “Reserve a date for the wall.”
- **Wordmark & logo:** a stacked `A / S` monogram in a thin brass square frame beside the Ananta wordmark.
- **Signature brand color:** muted brass `#A58B61`, used sparingly as the studio’s identifying thread.

## Build workflow

Create migrations and run the idempotent seed against the managed database, copy the supplied painting images into the app’s public assets, run diagnostics/typecheck/tests/build, start Preview, verify the route manifest and health endpoint, and checkpoint the finished project. Document any deliberately omitted scope in `DESIGN.md`.
