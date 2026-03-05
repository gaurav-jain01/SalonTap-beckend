import { Router } from "express";
import { getBanners } from "../../controllers/admin/bannerController.js";

const router = Router();

// 🔹 Get active banners for public display
router.get("/", (req, res) => {
    req.query.status = "active";
    getBanners(req, res);
});

export default router;
