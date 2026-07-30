# Developer Onboarding Guide

Welcome to the Malashree Engineering Team!

## Core Principles

1. **Frontend is Locked**: The UI design, Tailwind classes, and component structures are strictly finalized. Do not modify the visual presentation.
2. **Backend Services**: Business logic belongs in `src/services/`. Do not write complex logic directly inside Server Actions or API routes.
3. **Optimistic Concurrency**: When mutating critical documents (like `Order`), Mongoose's built-in `__v` version key prevents race conditions. Handle `VersionError` gracefully.
4. **Never Trust the Client**: Financial calculations (taxes, totals, discounts) must always be recalculated strictly on the server before interacting with Razorpay.

## Development Workflow

1. Use `npm run dev` to start the local environment. This uses `server.js` to ensure WebSockets function correctly locally.
2. Always run `npm run lint` and `npm run format` before committing.
3. Database seeding scripts (if any) are located in standard locations. For testing Admin features, manually change a registered user's `role` to `admin` in your local MongoDB instance.
