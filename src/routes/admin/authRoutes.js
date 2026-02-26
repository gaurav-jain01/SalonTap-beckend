import express from "express";
import { login, register } from "../../controllers/admin/authController.js";
import { protectAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);



export default router;
