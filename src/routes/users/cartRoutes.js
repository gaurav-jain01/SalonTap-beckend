import { Router } from "express";
import { addToCart, getCart, removeFromCart, clearCart } from "../../controllers/cartController.js";
import { protect } from "../../middleware/auth.js";

const router = Router();

// 🔹 All cart routes require user authentication
router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/remove/:serviceId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;
