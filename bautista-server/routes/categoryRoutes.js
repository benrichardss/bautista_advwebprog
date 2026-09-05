const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

// Get all categories
router.get("/", categoryController.getAllCategories);

// Get single category
router.get("/:id", categoryController.getCategoryById);

// Create new category
router.post("/", authentication, authorization("admin"), categoryController.createCategory);

// Update category
router.put("/:id", authentication, authorization("admin"), categoryController.updateCategory);

// Delete category
router.delete("/:id", authentication, authorization("admin"), categoryController.deleteCategory);

module.exports = router;
