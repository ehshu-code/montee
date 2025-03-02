import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes"; // Import routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", router); // Use routes from routes.ts

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
