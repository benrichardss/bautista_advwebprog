const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/:id", authentication, userController.getUserProfile);
router.put("/:id", authentication, userController.updateUserProfile);
router.put(
    "/:id/change-password",
    authentication,
    userController.changePassword
);

router.get("/", authentication, authorization("admin"), userController.getAllUsers);
router.delete("/:id", authentication, authorization("admin"), userController.deleteUser);

module.exports = router;