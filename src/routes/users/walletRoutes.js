import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { getWallet, addMoney, deductMoney } from "../../controllers/walletController.js";

const router = Router();

router.get("/", protect, getWallet);
router.post("/add-money", protect, addMoney);
router.post("/deduct-money", protect, deductMoney);

export default router;

