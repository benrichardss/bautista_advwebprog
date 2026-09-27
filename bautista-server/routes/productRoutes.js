const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const { upload, validateImageContent } = require("../middleware/uploadImageMiddleware");

// Get all products with filters
router.get("/", productController.getAllProducts);

// Get products by category
router.get("/category/:categoryId", productController.getProductsByCategory);

// Get products by seller
router.get("/seller/:sellerId", productController.getProductsBySeller);

// Get single product
router.get("/:id", productController.getProductById);

//Create new product
router.post("/", authentication, authorization("seller", "admin"),
    upload.single("image"), validateImageContent, productController.createProduct);

//Update product
router.patch("/:id", authentication, authorization("seller", "admin"),
    upload.single("image"), validateImageContent, productController.updateProduct);

// Delete product
router.delete("/:id", authentication, authorization("seller", "admin"), productController.deleteProduct);


module.exports = router;
