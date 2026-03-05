import { Router } from "express";
import {
    createBanner,
    getBanners,
    updateBanner,
    deleteBanner
} from "../../controllers/admin/bannerController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.post("/", protectAdmin, createBanner);
router.get("/", protectAdmin, getBanners);
router.get("/:id", protectAdmin, getBanners);
router.put("/:id", protectAdmin, updateBanner);
router.delete("/:id", protectAdmin, deleteBanner);

export default router;
