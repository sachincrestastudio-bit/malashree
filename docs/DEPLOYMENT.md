# Deployment Guide

The application is optimized for containerized environments (Docker/Kubernetes).

## 1. Environment Preparation

Ensure your production environment has the following variables securely injected (see `.env.example`).
**Critical**: Generate a strong cryptographic string for `JWT_SECRET` and NEVER expose it.

## 2. Docker Deployment

We provide a multi-stage `Dockerfile` tailored for Next.js standalone mode.

```bash
# Build the image
docker build -t malashree-app .

# Run the container
docker run -p 3000:3000 --env-file .env.production malashree-app
```

## 3. Graceful Shutdown

The custom `server.js` is equipped with `SIGTERM` and `SIGINT` handlers.
When Kubernetes scales down a pod, the server will stop accepting new HTTP/WebSocket connections, finish processing active requests, safely close the MongoDB connection pool, and exit.

## 4. Health Checks

Configure your Load Balancer or Kubernetes Liveness Probe to hit `GET /api/health`.
This endpoint verifies that both the HTTP server is alive and the database connection is healthy.
