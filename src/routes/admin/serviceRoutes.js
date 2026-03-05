import { Router } from "express";
import {
    createService,
    getServices,
    updateService,
    toggleServiceStatus,
    deleteService
} from "../../controllers/admin/serviceController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.post("/", protectAdmin, createService);
router.get("/", protectAdmin, getServices);
router.get("/:id", protectAdmin, getServices);
router.put("/:id", protectAdmin, updateService);
router.patch("/:id/toggle", protectAdmin, toggleServiceStatus);
router.delete("/:id", protectAdmin, deleteService);

export default router;
