const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Create new order
router.post("/:userId", orderController.createOrder);

// Get all orders for a buyer
router.get("/user/:userId", orderController.getOrdersByBuyer);

// Get all orders for a seller
router.get("/dashboard", orderController.getOrdersForDashboard);

// Get order by ID
router.get("/:orderId", orderController.getOrderById);

// Get all orders (admin)
router.get("/", orderController.getAllOrders);

// Update order status
router.patch("/:orderId", orderController.updateOrderStatus);

// Cancel order
router.delete("/:orderId", orderController.cancelOrder);

module.exports = router;
