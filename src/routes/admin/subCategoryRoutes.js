import { Router } from "express";
import { protectAdmin } from "../../middleware/auth.js";
import { createSubCategory, getSubCategories, updateSubCategory, toggleSubCategoryStatus, deleteSubCategory } from "../../controllers/admin/subCategoryController.js";

const router = Router();

router.post("/", protectAdmin, createSubCategory);
router.get("/", protectAdmin, getSubCategories);
router.get("/:id", protectAdmin, getSubCategories);
router.put("/:id", protectAdmin, updateSubCategory);
router.delete("/:id", protectAdmin, deleteSubCategory);
router.patch("/:id/toggle", protectAdmin, toggleSubCategoryStatus);

export default router;