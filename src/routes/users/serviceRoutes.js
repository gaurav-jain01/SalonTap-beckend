import { Router } from "express";
import { getServices } from "../../controllers/admin/serviceController.js";

const router = Router();

// 🔹 Public routes (or could be protected by 'protect' if login is required)
router.get("/", getServices);
router.get("/:id", getServices);

export default router;
