import express from "express";
import { imageUploadController } from "./controllers";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Server is running");
});

export default router;
