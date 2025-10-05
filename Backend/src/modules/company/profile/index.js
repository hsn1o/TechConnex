import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.js";
import { getMe, upsertMe, getByUserId } from "./controller.js";

const router = Router();

// All company/profile routes require auth
router.use(requireAuth);

// GET my profile
router.get("/me", getMe);

// PUT upsert my profile
router.put("/", upsertMe);

// (Optional) GET profile by user id (admin/dev)
router.get("/:userId", getByUserId);

export default router;
