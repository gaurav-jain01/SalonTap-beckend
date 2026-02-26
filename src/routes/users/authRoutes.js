import express from 'express';
import { sendOtp, verifyOtp, profile, getProfile } from '../../controllers/authController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/profile', protect, profile);
router.get('/profile', protect, getProfile);

export default router;