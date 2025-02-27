import express from "express";
import { imageUploadController } from "./controllers";

const router = express.Router();

router.post("/imageUpload", imageUploadController);

export default router;
