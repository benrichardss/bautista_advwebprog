const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

const registerValidation = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 2 })
        .withMessage("First name must be at least 2 characters long"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 2 })
        .withMessage("Last name must be at least 2 characters long"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("confirmPassword")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }

            return true;
        }),

    body("contactNumber")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("Contact number must be a string"),

    body("address")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("Address must be a string"),

    body("role")
        .optional()
        .isIn(["buyer", "seller", "admin"])
        .withMessage("Invalid user role"),

    handleValidationErrors
];

const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string"),

    handleValidationErrors
];

const updateUserValidation = [
    body("firstName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("First name must be at least 2 characters long"),

    body("lastName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Last name must be at least 2 characters long"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("contactNumber")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("Contact number must be a string"),

    body("address")
        .optional({ checkFalsy: true })
        .isString()
        .withMessage("Address must be a string"),

    body("role")
        .optional()
        .isIn(["buyer", "seller", "admin"])
        .withMessage("Invalid user role"),

    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be true or false")
        .toBoolean(),

    body("password")
        .optional()
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    handleValidationErrors
];

const changePasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long"),

    body("confirmNewPassword")
        .notEmpty()
        .withMessage("Password confirmation is required")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("New passwords do not match");
            }

            return true;
        }),

    handleValidationErrors
];

const userIdValidation = [
    require("express-validator")
        .param("id")
        .isMongoId()
        .withMessage("Invalid user ID"),

    handleValidationErrors
];

module.exports = {
    registerValidation,
    loginValidation,
    updateUserValidation,
    changePasswordValidation,
    userIdValidation
};