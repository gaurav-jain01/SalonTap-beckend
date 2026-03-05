import { Router } from "express";
import {
    createServiceProvider,
    getServiceProviders,
    updateServiceProvider,
    deleteServiceProvider
} from "../../controllers/admin/serviceProviderController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.post("/", protectAdmin, createServiceProvider);
router.get("/", protectAdmin, getServiceProviders);
router.get("/:id", protectAdmin, getServiceProviders);
router.put("/:id", protectAdmin, updateServiceProvider);
router.delete("/:id", protectAdmin, deleteServiceProvider);

export default router;
