import express from "express";
import { addAddress, deleteAddress, getAllAddress, updateAddress } from "../controllers/addressController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/", protect, getAllAddress);
router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);



export default router;