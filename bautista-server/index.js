
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const productV1Routes = require("./routes/v1/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const logRoutes = require("./routes/logRoutes");
const { HttpStatus } = require("./config/constants");

const Product = require("./models/productModel");
const Category = require("./models/categoryModel");
const User = require("./models/userModel");
const Review = require("./models/reviewModel");
const Cart = require("./models/cartModel");
const Order = require("./models/orderModel");

console.log("Mongoose models loaded:");

console.log("Product:", Product.modelName);
console.log("Category:", Category.modelName);
console.log("User:", User.modelName);
console.log("Review:", Review.modelName);
console.log("Cart:", Cart.modelName);
console.log("Order:", Order.modelName);

console.log("All Mongoose schemas loaded successfully.");

const app = express();
const helmet = require("helmet");
const { auditLoggerMiddleware } = require("./middleware/auditLoggerMiddleware");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:      ["'self'"],
      scriptSrc:       ["'self'"],
      styleSrc:        ["'self'", "'unsafe-inline'"],
      imgSrc:          ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      connectSrc:      ["'self'"],
      fontSrc:         ["'self'", "data:"],
      objectSrc:       ["'none'"],
      frameAncestors:  ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  frameguard:     { action: "sameorigin" },           // X-Frame-Options: SAMEORIGIN
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }, // Referrer-Policy
}));

connectDB();

app.use(express.json());
app.use(auditLoggerMiddleware);

app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Accept", "Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.get("/health", (req, res) => {
    console.log("Health check passed");
    res.status(200).json({
        success: true,
        message: "API is running",
    });
});

app.use("/api/product", productRoutes);
app.use("/api/v1/product", productV1Routes);
app.use("/api/category", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/log", logRoutes);

app.use((err, req, res, next) => {
    if (err.name === "MulterError") {
        const tooLarge = err.code === "LIMIT_FILE_SIZE";
        return res.status(tooLarge ? 413 : HttpStatus.BAD_REQUEST).json({
            success: false,
            message: tooLarge
                ? "Image must be 5 MB or smaller."
                : err.message
        });
    }

    console.error(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    try {
        const response = await fetch(`http://localhost:${PORT}/health`);
        console.log(`Health check status: ${response.status}`);
    } catch (error) {
        console.error("Health check failed:", error.message);
    }
});