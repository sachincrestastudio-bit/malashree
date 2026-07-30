# Database Schema Documentation

The system uses MongoDB. Below is a high-level overview of the relationships.

## Users & Roles

- **User**: Represents all human entities. Distinguished by the `role` field (`customer`, `admin`, `kitchen_manager`, `delivery_partner`).

## Catalog & Operations

- **Kitchen**: Represents a physical restaurant branch. Contains location coordinates for auto-assignment.
- **Category**: Broad classification (e.g., Starters, Main Course).
- **MenuItem**: A specific dish. Linked to a specific Kitchen. Contains a boolean `isAvailable`.
- **Ingredient**: Physical stock maintained independently per Kitchen.
- **Recipe**: Links a `MenuItem` to multiple `Ingredient`s, enabling automated stock deduction.

## Order Lifecycle

- **Order**: The central transaction record. Stores snapshots of prices, items, and a robust `timeline` array of state changes.
- **Transaction**: Records the payment attempt, gateway ID, and cryptographic verification status.
- **Invoice**: Immutable financial record generated post-payment.

## Auditing & Analytics

- **InventoryMovement**: Permanent, append-only log of every addition or deduction of stock.
- **OrderAuditLog**: Immutable ledger of every status transition for security and dispute resolution.
