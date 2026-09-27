const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const {
    registerValidation,
    loginValidation,
    updateUserValidation,
    changePasswordValidation,
    userIdValidation
} = require("../middleware/validationMiddleware");
const {
    loginLimiter,
    registerLimiter,
    passwordChangeLimiter,
    userApiLimiter
} = require("../middleware/rateLimiterMiddleware");

router.post(
    "/register",
    registerLimiter,
    registerValidation,
    userController.registerUser
);

router.post(
    "/login",
    loginLimiter,
    loginValidation,
    userController.loginUser
);

router.get(
    "/:id",
    authentication,
    userApiLimiter,
    userIdValidation,
    userController.getUserProfile
);

router.put(
    "/:id",
    authentication,
    userApiLimiter,
    userIdValidation,
    updateUserValidation,
    userController.updateUserProfile
);

router.put(
    "/:id/change-password",
    authentication,
    passwordChangeLimiter,
    userIdValidation,
    changePasswordValidation,
    userController.changePassword
);

router.get(
    "/",
    authentication,
    userApiLimiter,
    authorization("admin"),
    userController.getAllUsers
);

router.delete(
    "/:id",
    authentication,
    userApiLimiter,
    authorization("admin"),
    userIdValidation,
    userController.deleteUser
);

module.exports = router;