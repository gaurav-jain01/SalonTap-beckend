import { Router } from "express";
import {
    createServiceProvider,
    getServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
    addServiceProviderAddress,
    addServiceProviderSlots
} from "../../controllers/admin/serviceProviderController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.post("/", protectAdmin, createServiceProvider);
router.get("/", protectAdmin, getServiceProviders);
router.get("/:id", protectAdmin, getServiceProviders);
router.put("/:id", protectAdmin, updateServiceProvider);
router.delete("/:id", protectAdmin, deleteServiceProvider);

router.post("/address", protectAdmin, addServiceProviderAddress);
router.post("/slots", protectAdmin, addServiceProviderSlots);

export default router;
