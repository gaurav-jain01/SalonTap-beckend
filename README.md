# SalonTap Backend

This is the backend boilerplate for the SalonTap project, built with Node.js, Express, and MongoDB.

## Features
- **ES Modules**: Modern JavaScript syntax.
- **Express**: Fast, unopinionated web framework.
- **Mongoose**: Elegant mongodb object modeling.
- **Security**: Helmet for security headers and CORS enabled.
- **Logging**: Morgan for request logging.
- **Environment Variables**: Dotenv for configuration.

## Getting Started

### Prerequisites
- Node.js installed.
- MongoDB running locally or a remote URI.

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGO_URI` in `.env`

### Running the App
- **Development mode**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

## Project Structure
```text
src/
├── config/       # Database and other configurations
├── controllers/  # Route handlers
├── middleware/   # Custom middlewares
├── models/       # Mongoose models
├── routes/       # API routes
├── utils/        # Utility functions
├── app.js        # Express app setup
└── index.js      # Server entry point
```
