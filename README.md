# Malashree

An enterprise-grade, real-time, multi-kitchen food ordering and delivery ecosystem. Built with Next.js 15, MongoDB, and Socket.IO.

## Ecosystem Overview

Malashree is a complete monolithic architecture comprising four core platforms:

1. **Customer Website**: Public-facing ordering interface with geolocation-based kitchen assignment.
2. **Admin Portal**: Master control room for global menu management, BI/Analytics, and finance.
3. **Kitchen Dashboard**: Branch-specific operations portal for receiving and preparing orders.
4. **Delivery Partner Platform**: Mobile-first interface for drivers to receive and fulfill deliveries.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB (Mongoose)
- **Real-time Engine**: Socket.IO (Custom Node server)
- **Styling**: Tailwind CSS v4, Lucide Icons, Recharts
- **State Management**: Zustand
- **Authentication**: Custom JWT with HTTP-Only Cookies
- **Payments**: Razorpay Integration

## Quick Start

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and populate variables.
4. Run `npm run dev` to start the custom server with Next.js and Socket.IO on port 3000.

For detailed documentation, refer to the `docs/` folder.
