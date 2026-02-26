import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import adminModel from '../models/adminModel.js';

const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in 'jwt' cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
        console.log("Token found in cookie");
    }
    // 2. Check for token in Authorization header (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("Token found in Authorization header");
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        console.log("No token found in headers or cookies");
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const protectAdmin = async (req, res, next) => {
    let token;

    // 1. Check for token in 'jwt' cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
        console.log("Token found in cookie");
    }
    // 2. Check for token in Authorization header (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("Token found in Authorization header");
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = await adminModel.findById(decoded.userId).select('-password');

            if (!req.admin) {
                return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
            }

            next();
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        console.log("No token found in headers or cookies");
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

export { protect, protectAdmin };
