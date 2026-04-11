import { Router } from "express";
import { getServices } from "../../controllers/users/serviceController.js";

const router = Router();

// 🔹 Public routes
router.get("/", getServices);
router.get("/:id", getServices);

export default router;
