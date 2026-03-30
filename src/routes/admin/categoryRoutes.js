import { Router } from "express";
import { createCategory, getCategories, deleteCategory, updateCategory, toggleCategoryStatus } from "../../controllers/admin/categoryController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();


router.post("/", protectAdmin, createCategory);
router.get("/", protectAdmin, getCategories);
router.get("/:id", protectAdmin, getCategories);
router.delete("/:id", protectAdmin, deleteCategory);
router.put("/:id", protectAdmin, updateCategory);
router.patch("/:id/toggle", protectAdmin, toggleCategoryStatus);

export default router;