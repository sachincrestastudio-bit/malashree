# Architecture Overview

Malashree utilizes a **Monolithic Full-Stack Architecture** designed for horizontal scaling and rapid internal communication.

## Core Components

### 1. Custom Next.js Server (`server.js`)

Instead of standard `next start`, the application runs on a custom Node.js server. This allows us to share the same HTTP server instance between Next.js and `Socket.IO`.

- **Benefits**: Real-time events (new orders, delivery tracking) happen on the exact same port and domain, bypassing CORS issues and simplifying load balancing.

### 2. Service Layer Pattern (`src/services/`)

Business logic is decoupled from API Routes and Next.js Server Actions.

- Example: `PaymentService.ts` handles gateway logic, `OrderLifecycleService.ts` handles status transitions, and `InventoryService.ts` handles stock deduction.
- API Routes (`src/app/api/...`) merely validate HTTP requests and call the appropriate Service.

### 3. Real-Time Event Bus (`src/services/realtime/`)

The `EventBusService` acts as an internal pub/sub system.

- When `OrderLifecycleService` transitions an order to `ready`, it publishes an event.
- The `SocketService` listens to the Event Bus and broadcasts the event to specific Socket.IO rooms (e.g., notifying the assigned driver).

### 4. Database Layer (`src/models/`)

Mongoose models enforce schema validation.

- We rely heavily on MongoDB's embedded documents (e.g., `Order.items`, `Order.timeline`) to reduce joins and improve read performance.
- Aggregation pipelines are utilized heavily in the Analytics module.

## Directory Structure

- `src/app/`: Next.js App Router (Pages & API Routes).
- `src/components/`: Reusable React components.
- `src/services/`: Core backend business logic.
- `src/models/`: Mongoose Database Schemas.
- `src/actions/`: Next.js Server Actions (Frontend to Backend mutations).
- `src/store/`: Zustand client-side state management.
