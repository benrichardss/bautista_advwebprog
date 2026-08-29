const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

// Get all products with filters
router.get("/", productController.getAllProducts);

// Get products by category
router.get("/category/:categoryId", productController.getProductsByCategory);

// Get products by seller
router.get("/seller/:sellerId", productController.getProductsBySeller);

// Get single product
router.get("/:id", productController.getProductById);

// Create new product
router.post("/", productController.createProduct);

// Update product
router.patch("/:id", productController.updateProduct);

// Delete product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
