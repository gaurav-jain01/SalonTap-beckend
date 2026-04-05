import { Router } from "express";
import { protectAdmin } from "../../middleware/auth.js";
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    deleteBooking
} from "../../controllers/admin/bookingController.js";

const router = Router();

router.post("/", protectAdmin, createBooking);
router.get("/", protectAdmin, getAllBookings);
router.get("/:id", protectAdmin, getBookingById);
router.patch("/:id/status", protectAdmin, updateBookingStatus);
router.delete("/:id", protectAdmin, deleteBooking);

export default router;

