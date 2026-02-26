import { Router } from "express";
import { getAllUsers } from "../../controllers/admin/userController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.get("/", protectAdmin, getAllUsers);



export default router;
