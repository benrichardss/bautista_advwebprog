const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

// Get all reviews (admin dashboard)
router.get("/", authentication, authorization("admin"), reviewController.getAllReviews);

// Get all reviews for a seller's products (seller dashboard)
router.get(
    "/seller/:sellerId",
    authentication,
    authorization("seller", "admin"),
    reviewController.getReviewsBySeller
);

// Create new review for a product
router.post(
    "/product/:productId",
    authentication,
    authorization("buyer"),
    reviewController.createReview
);

// Get all reviews for a product
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Get all reviews by a reviewer
router.get(
    "/reviewer/:reviewerId",
    authentication,
    reviewController.getReviewsByReviewer
);

// Get all products to review
router.get(
  "/reviewer/:reviewerId/to-review",
  authentication,
  reviewController.getProductsToReview
);

// Get single review
router.get("/:reviewId", reviewController.getReviewById);

// Update review
router.put(
    "/:reviewId",
    authentication,
    reviewController.updateReview
);


// Delete review
router.delete(
    "/:reviewId",
    authentication,
    reviewController.deleteReview
);

module.exports = router;