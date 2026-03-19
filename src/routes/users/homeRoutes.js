import { Router } from "express";
import { getHomeData, getSubCategoriesByCategoryId, getServicesBySubCategoryId } from "../../controllers/users/homeController.js";

const router = Router();

router.get("/", getHomeData);
router.get("/sub-categories/:categoryId", getSubCategoriesByCategoryId);
router.get("/services/:subCategoryId", getServicesBySubCategoryId);




export default router;