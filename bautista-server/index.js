
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

connectDB();

app.use(express.json());

app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const corsOptions = {
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: HttpStatus.NO_CONTENT,
};
app.options("", cors(corsOptions));
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error" });
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