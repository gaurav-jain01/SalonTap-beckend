import { Router } from "express";
import { getAllUser, getUserById, updateUser } from "../../controllers/admin/userController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = Router();

router.get("/", protectAdmin, getAllUser); // for get all and search 
router.get("/:id", protectAdmin, getUserById); // for get user by id 
router.put("/:id", protectAdmin, updateUser); // for update user 



export default router;
