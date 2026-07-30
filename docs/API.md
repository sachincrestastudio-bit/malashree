# API Documentation

Malashree uses standard RESTful conventions for its external integration points, despite heavily relying on Next.js Server Actions for internal UI mutations.

## Core Endpoints

### Authentication

- `POST /api/auth`: Handles standard login/registration.

### Payments & Finance

- `POST /api/payments/create-order`: Initializes a Razorpay order or COD authorization.
- `POST /api/payments/verify`: Cryptographically verifies Razorpay signatures and creates the database `Order`.
- `POST /api/payments/webhook`: Listens for asynchronous payment updates from the gateway.

### Inventory

- `GET /api/inventory`: Fetches stock levels for a specific kitchen.
- `POST /api/inventory/adjust`: Manually adjusts stock levels (requires `kitchen_manager` or `admin`).
- `POST /api/purchase-orders`: Submits a new PO to a supplier.
- `PATCH /api/inventory/receive`: Marks a PO as received and automatically increments stock.

### Analytics & Reports

- `GET /api/analytics/dashboard`: Aggregates top-level KPI metrics.
- `GET /api/analytics/revenue`: Retrieves time-series revenue data.
- `GET /api/reports/export`: Generates downloadable CSV exports of system data.

## Authentication

All secured endpoints expect a valid JWT in the `auth_token` HTTP-Only cookie. Permissions are strictly validated on the server side using the decoded `role` claim.
