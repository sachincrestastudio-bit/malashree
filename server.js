import { createServer } from "http";
import { parse } from "url";
import next from "next";
import mongoose from "mongoose";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Assign to global so our Next.js backend services can import and emit
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Basic Authentication & Room Joining
    socket.on("authenticate", (data) => {
      const { role, id, kitchenId } = data;

      if (role === "admin") {
        socket.join("admin");
        console.log(`[Socket] Admin joined`);
      } else if (role === "customer" && id) {
        socket.join(`customer:${id}`);
        console.log(`[Socket] Customer ${id} joined`);
      } else if ((role === "kitchen_manager" || role === "kitchen_staff") && kitchenId) {
        socket.join(`kitchen:${kitchenId}`);
        console.log(`[Socket] Kitchen ${kitchenId} joined`);
      } else if (role === "driver" && id) {
        socket.join(`driver:${id}`);
        console.log(`[Socket] Driver ${id} joined`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO Server initialized and attached.`);
  });

  // Graceful Shutdown Handler for Docker/Kubernetes
  const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    server.close(() => {
      console.log("HTTP server closed.");
    });

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    }

    console.log("Graceful shutdown complete. Exiting process.");
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
});
