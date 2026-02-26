import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { getWallet, addMoney } from "../../controllers/walletController.js";

const router = Router();

router.get("/", protect, getWallet);
router.post("/add-money", protect, addMoney);

export default router;

