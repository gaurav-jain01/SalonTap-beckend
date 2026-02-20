import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

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

const specs = swaggerJsdoc(options);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
    }
};

startServer();
