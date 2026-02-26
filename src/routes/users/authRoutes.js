import express from 'express';
import { sendOtp, verifyOtp, profile, getProfile } from '../../controllers/authController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp); //after this profile will be created 
router.put('/profile', protect, profile); //for update profile
router.get('/profile', protect, getProfile); //for get profile

export default router;