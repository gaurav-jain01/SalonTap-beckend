import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// User app
import authRoutes from './routes/users/authRoutes.js';
import addressRoutes from './routes/users/addressRoutes.js';
import uploadRoutes from './routes/users/uploadRoutes.js';
import walletRoutes from './routes/users/walletRoutes.js';
import userServiceRoutes from './routes/users/serviceRoutes.js';
import userCartRoutes from './routes/users/cartRoutes.js';
import homeRoutes from './routes/users/homeRoutes.js';


// Admin app
import adminAuthRoutes from './routes/admin/authRoutes.js';
import userRoutes from './routes/admin/userRoutes.js';
import categoryRoutes from './routes/admin/categoryRoutes.js';
import subCategoryRoutes from './routes/admin/subCategoryRoutes.js';
import serviceRoutes from './routes/admin/serviceRoutes.js';
import bannerRoutes from './routes/admin/bannerRoutes.js';
import serviceProviderRoutes from './routes/admin/serviceProviderRoutes.js';
import couponRoutes from './routes/admin/couponRoutes.js';
import adminUploadRoutes from './routes/admin/uploadRoutes.js';


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Salontap API",
            version: "1.0.0",
            description: "API documentation for Salontap backend"
        },
        servers: [
            {
                url: "http://localhost:5001"
            }
        ]
    },
    apis: ["./src/routes/*.js"],
};


const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Content-Type: ${req.get('Content-Type')}`);
    next();
});

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Routes
// V1 = app side routes
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/home',homeRoutes);
app.use('/api/v1/address', addressRoutes);
app.use('/api/v1/wallet', walletRoutes);
// app.use('/api/v1/services', userServiceRoutes);
// app.use('/api/v1/cart', userCartRoutes);

// Routes 
// V3 = admin side routes 

app.use('/api/v3/upload', adminUploadRoutes);
app.use('/api/v3/auth', adminAuthRoutes);
app.use('/api/v3/users', userRoutes);
app.use('/api/v3/categories', categoryRoutes);
app.use('/api/v3/sub-categories', subCategoryRoutes);
app.use('/api/v3/services', serviceRoutes);
app.use('/api/v3/banners', bannerRoutes);
app.use('/api/v3/sp', serviceProviderRoutes);
app.use('/api/v3/coupons', couponRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SalonTap API' });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Basic Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
