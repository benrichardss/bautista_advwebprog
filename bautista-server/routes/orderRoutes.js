const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

// Create new order
router.post("/:userId", orderController.createOrder);

// Get all orders for a buyer
router.get("/user/:userId", orderController.getOrdersByBuyer);

// Get all orders for a seller
router.get("/dashboard", authentication, authorization("seller", "admin"), orderController.getOrdersForDashboard);

router.get("/count", orderController.getOrderCount);
// Get order by ID
router.get("/:orderId", orderController.getOrderById);

// Get all orders (admin)
router.get("/", authentication, authorization("admin"), orderController.getAllOrders);

// Update order status
router.patch("/:orderId", authentication, authorization("seller", "admin"), orderController.updateOrderStatus);

// Cancel order
router.delete("/:orderId", orderController.cancelOrder);

module.exports = router;
