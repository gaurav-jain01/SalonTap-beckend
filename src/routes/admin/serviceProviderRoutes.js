import { Router } from "express";
import {
    createServiceProvider,
    getServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
    addServiceProviderAddress,
    addServiceProviderSlots,
    toggleServiceProviderStatus,
    getServiceProviderAddress,
    updateServiceProviderAddress,
    deleteServiceProviderAddress,
    getServiceProviderSlots,
    updateServiceProviderSlots,
    deleteServiceProviderSlots,
    addServiceProviderDocument,
    getServiceProviderDocuments,
    addServiceProviderService,
    getServiceProviderService,
    deleteServiceProviderService
} from "../../controllers/admin/serviceProviderController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.post("/", protectAdmin, createServiceProvider);
router.get("/", protectAdmin, getServiceProviders);
router.get("/:id", protectAdmin, getServiceProviders);
router.put("/:id", protectAdmin, updateServiceProvider);
router.delete("/:id", protectAdmin, deleteServiceProvider);
router.patch("/:id/toggle", protectAdmin, toggleServiceProviderStatus);

router.post("/address", protectAdmin, addServiceProviderAddress);
router.get("/address/:id", protectAdmin, getServiceProviderAddress);
router.put("/address/:id", protectAdmin, updateServiceProviderAddress);
router.delete("/address/:id", protectAdmin, deleteServiceProviderAddress);

router.post("/slots", protectAdmin, addServiceProviderSlots);
router.get("/slots/:id", protectAdmin, getServiceProviderSlots);
router.put("/slots/:id", protectAdmin, updateServiceProviderSlots);
router.delete("/slots/:id", protectAdmin, deleteServiceProviderSlots);

router.post("/document", protectAdmin, addServiceProviderDocument);
router.get("/documents/:id", protectAdmin, getServiceProviderDocuments);

router.post("/service", protectAdmin, addServiceProviderService);
router.get("/service/:id", protectAdmin, getServiceProviderService);
router.delete("/service/:id", protectAdmin, deleteServiceProviderService);

export default router;
