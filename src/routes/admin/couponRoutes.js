import { Router } from "express";
import {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon
} from "../../controllers/admin/couponController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.post("/", protectAdmin, createCoupon);
router.get("/", protectAdmin, getCoupons);
router.get("/:id", protectAdmin, getCoupons);
router.put("/:id", protectAdmin, updateCoupon);
router.delete("/:id", protectAdmin, deleteCoupon);

export default router;
