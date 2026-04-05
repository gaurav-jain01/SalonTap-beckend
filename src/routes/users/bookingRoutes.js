import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { checkout, getMyBookings, cancelBooking } from "../../controllers/users/bookingController.js";

const router = Router();

router.post("/checkout", protect, checkout);
router.get("/my-bookings", protect, getMyBookings);
router.patch("/cancel/:id", protect, cancelBooking);

export default router;
