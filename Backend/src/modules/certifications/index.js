import express from "express";
import { uploadCertifications, getCertifications } from "./controller.js";

const router = express.Router();

router.post("/upload", uploadCertifications);
router.get("/:userId", getCertifications);

export default router;
