import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// User app
import authRoutes from './routes/users/authRoutes.js';
import addressRoutes from './routes/users/addressRoutes.js';
import uploadRoutes from './routes/users/uploadRoutes.js';


// Admin app
import adminAuthRoutes from './routes/admin/authRoutes.js';
import userRoutes from './routes/admin/userRoutes.js';


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
app.use('/api/v1/address', addressRoutes);

// Routes 
// V3 = admin side routes 
app.use('/api/v3/auth', adminAuthRoutes);
app.use('/api/v3/users', userRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SalonTap API' });
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
