# Design notes

## How login and the two roles work

The provided seed contained one Studio Admin account but no customer account. The application therefore keeps the supplied admin credentials and adds one explicit demo customer account solely to make the requested recording flow possible. The login form calls the server, which verifies the stored password hash, signs a short application JWT, and sets an HTTP-only `artstudio_session` cookie. The server reads and verifies that cookie on every tRPC request and then reloads the user row from MySQL. It does not trust the role carried in the browser or use hidden buttons as authorization.

Customers use the collection, purchase, wall booking, pottery, and My Studio workflows. The Studio Admin role is stored as `admin` in the starter-compatible users table and is presented as `studio` in the UI. Admin procedures enforce that role server-side. A missing session produces tRPC `UNAUTHORIZED` / HTTP 401 behavior; a non-admin accessing the admin procedures produces `FORBIDDEN` / HTTP 403 behavior. Customer queries are always filtered by the authenticated customer ID, so another customer’s records are never returned; a record-specific mismatch is a not-found result.

For the embedded HTTPS Preview, the session cookie is deliberately `SameSite=None; Secure`, because Preview is hosted in a cross-site iframe. Plain local HTTP can opt into `APP_COOKIE_SECURE=false` without changing the Preview default.

## Database choice

The project uses the managed MySQL-compatible database already provisioned by the Webdev starter and accesses it through Drizzle ORM. This choice is practical for the assignment because it is cloud-compatible, typed from the TypeScript schema, easy to migrate, and already supported by the starter’s Express server. The schema is intentionally small and relational: catalog records are separated from mutable customer transactions, while user IDs scope orders, bookings, and pottery requests.

## Preventing two people from taking the same thing

A painting is unique by its provided string ID. The buy procedure runs a database transaction that updates that exact painting only when its status is `available`; it checks the affected-row count before inserting the order. Two concurrent requests cannot both change the same available row, so only one can create an active order. Cancellation changes the order to `cancelled` and returns the painting to `available` in the same transaction.

A wall-painting date is unique through a database unique index on `wall_bookings.bookingDate`, in addition to the server’s 7–90 day validation. The calculated price is written server-side from the stored mural rate and the requested wall size; the browser’s calculation is only a preview. A unique-key conflict is translated into a clear “date already reserved” message. Admin status changes and customer cancellation use conditional status updates so invalid transitions are rejected.

## What is finished

The working MVP includes the supplied painting gallery and images, four additional original salon works, painting detail and purchase flow, order cancellation, customer and admin dashboards, wall-painting date validation and rate calculation, booking cancellation and admin decisions, pottery item/glaze validation, quantity and needed-by validation, customer edit/cancel while requested, admin accept/decline, loading/empty/error/success/conflict feedback, protected routes, migrations, seed script, demo credentials, route manifest, and documentation. The public experience also includes About the House and Studio Journal pages, with a subtle paper-grain texture, warm radial light, framed image treatment, and calm reveal/hover motion that respects reduced-motion preferences.

## What is intentionally left out

The assignment explicitly excludes real payments, sign-up, password reset, email verification, social login, reviews, coupons, delivery tracking, email/SMS, native apps, Docker/CI/CD, and an image upload system. The admin painting form accepts the existing image path rather than adding upload infrastructure, which is sufficient because the seed already supplies the required images.

## What I would build next

For a production studio, the next iteration would use a stronger password hashing policy with rotation and a dedicated session table, add audit history for admin decisions, move customer notifications to an approved transactional email provider, add availability/calendar views, introduce a controlled upload pipeline for new painting photography, and add integration tests that exercise concurrent purchase and booking conflicts against a disposable database.

## Ananta information architecture

The public pages are intentionally small and easy to present: Home/About explains the studio, Browse routes to paintings or pottery, Purchase explains the order/request distinction, Genres gives context for the catalogue, and Records/Manage make the authenticated customer and admin workflows explicit. The bottom dock is navigation only; it does not replace server authorization.

The assignment scope image is treated as authoritative. There are no real payments, account extras, reviews/coupons/delivery messaging, image uploads, page-transition/opening animations, mobile-layout work, or deployment infrastructure. The admin can add and edit available paintings because that is in scope; seeded pottery items and glazes are read-only because the assignment asks for custom pottery requests, not pottery inventory management.
