const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User authentication routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// User profile routes
router.get("/:id", userController.getUserProfile);
router.put("/:id", userController.updateUserProfile);
router.put("/:id/change-password", userController.changePassword);

// Admin routes
router.get("/", userController.getAllUsers);
router.delete("/:id", userController.deleteUser);

module.exports = router;
