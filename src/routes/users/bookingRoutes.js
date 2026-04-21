import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { checkout, getMyBookings, getBookingDetails, cancelBooking, applyCoupon, getAvailableCoupons } from "../../controllers/users/bookingController.js";

const router = Router();

router.post("/", protect, checkout);
router.get("/", protect, getMyBookings);
router.get("/:id", protect, getBookingDetails);
router.patch("/cancel/:id", protect, cancelBooking);

router.post("/apply-coupon", protect, applyCoupon);
router.get("/available-coupons", protect, getAvailableCoupons);


export default router;
