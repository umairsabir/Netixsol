const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("../src/config/db");
const specs = require("../src/docs/swagger");
const authRoutes = require("../src/routes/authRoutes");
const taskRoutes = require("../src/routes/taskRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => res.json({ message: "API is running..." }));
app.use("/api/users", authRoutes);
app.use("/api/tasks", taskRoutes);

// Swagger Documentation
const customCss = `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #2c3e50; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .swagger-ui .scheme-container { background: #f8f9fa; box-shadow: none; border-top: 1px solid #e9ecef; }
    .swagger-ui .opblock-tag { font-family: 'Segoe UI', sans-serif; font-size: 18px; border-bottom: 1px solid #dee2e6; }
    .swagger-ui .btn.authorize { background-color: #28a745; color: white; border-color: #28a745; }
    .swagger-ui .btn.authorize svg { fill: white; }
`;

const swaggerOptions = {
    customCss: customCss,
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js",
    ],
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : {}
    });
});

module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
};