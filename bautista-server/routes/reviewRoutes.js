const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all reviews (admin dashboard)
router.get("/", authMiddleware, reviewController.getAllReviews);

// Get all reviews for a seller's products (seller dashboard)
router.get(
    "/seller/:sellerId",
    authMiddleware,
    reviewController.getReviewsBySeller
);

// Create new review for a product
router.post(
    "/product/:productId",
    authMiddleware,
    reviewController.createReview
);

// Get all reviews for a product
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Get all reviews by a reviewer
router.get(
    "/reviewer/:reviewerId",
    authMiddleware,
    reviewController.getReviewsByReviewer
);

// Get all products to review
router.get(
  "/reviewer/:reviewerId/to-review",
  authMiddleware,
  reviewController.getProductsToReview
);

// Get single review
router.get("/:reviewId", reviewController.getReviewById);

// Update review
router.put(
    "/:reviewId",
    authMiddleware,
    reviewController.updateReview
);


// Delete review
router.delete(
    "/:reviewId",
    authMiddleware,
    reviewController.deleteReview
);

module.exports = router;