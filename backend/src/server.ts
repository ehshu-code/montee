import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import { initializeWebSocketServer } from "./socket";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", router);

// Create an HTTP server
const server = createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Start the server (HTTP and WebSocket)
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
