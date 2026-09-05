const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

// Get user's cart
router.get("/:userId", authentication, cartController.getCart);

// Add product to cart
router.post("/:userId", authentication, authorization("buyer"), cartController.addToCart);

// Update product quantity in cart
router.patch("/:userId/:productId", authentication, authorization("buyer"), cartController.updateCartQuantity);

// Remove product from cart
router.delete("/:userId/:productId", authentication, authorization("buyer"), cartController.removeFromCart);

// Clear entire cart
router.delete("/:userId", authentication, authorization("buyer"), cartController.clearCart);

module.exports = router;
