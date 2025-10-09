import express from "express";
import { uploadResume, upload } from "./controller.js";

const router = express.Router();

router.post("/upload", upload.single("resume"), uploadResume);

export default router;
