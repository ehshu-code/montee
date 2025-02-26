import express from "express";
import { imageUpload } from "./controllers";

const router = express.Router();

router.post("/imageUpload", imageUpload);

export default router;
