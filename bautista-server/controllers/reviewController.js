const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const { HttpStatus } = require("../config/constants");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

// Create new review
exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviewer = req.user.id;
        const { rating, comment } = req.body;

        if (!reviewer || !rating) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Reviewer ID and rating are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if reviewer already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            reviewer: reviewer
        });

        if (existingReview) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        const review = new Review({
            product: productId,
            reviewer,
            rating,
            comment: comment || ""
        });

        const savedReview = await review.save();

        // Add review to product
        product.reviews.push(savedReview._id);
        await product.save();

        const populatedReview = await savedReview.populate("reviewer", "firstName lastName");

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Review created successfully",
            data: populatedReview
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get all reviews for a product
exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: productId })
            .populate("reviewer", "firstName lastName")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ product: productId });

        // Calculate average rating
        const ratingAggregate = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId)
                }
            },
            { $group: { _id: null, averageRating: { $avg: "$rating" } } }
        ]);

        const averageRating = ratingAggregate.length > 0 ? ratingAggregate[0].averageRating : 0;

        res.status(HttpStatus.OK).json({
            success: true,
            data: reviews,
            stats: {
                totalReviews: total,
                averageRating: parseFloat(averageRating.toFixed(1))
            },
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get all reviews (admin)
exports.getAllReviews = async (req, res) => {
    try {
        const { sort } = req.query;

        const sortOption =
            sort === "rating" ? { rating: 1 } :
            sort === "-rating" ? { rating: -1 } :
            { createdAt: -1 };

        const reviews = await Review.find()
            .populate("product", "productName images seller")
            .populate("reviewer", "firstName lastName")
            .sort(sortOption);

        res.status(HttpStatus.OK).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get all reviews for a seller's products
exports.getReviewsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { sort } = req.query;

        const sellerProducts = await Product.find({ seller: sellerId }).select("_id");
        const productIds = sellerProducts.map((product) => product._id);

        const sortOption =
            sort === "rating" ? { rating: 1 } :
            sort === "-rating" ? { rating: -1 } :
            { createdAt: -1 };

        const reviews = await Review.find({ product: { $in: productIds } })
            .populate("product", "productName images seller")
            .populate("reviewer", "firstName lastName")
            .sort(sortOption);

        res.status(HttpStatus.OK).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get review by ID
exports.getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId)
            .populate("product", "productName")
            .populate("reviewer", "firstName lastName email");

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get all reviews by reviewer
exports.getReviewsByReviewer = async (req, res) => {
    try {
        const { reviewerId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ reviewer: reviewerId })
            .populate("product", "productName images")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments({ reviewer: reviewerId });

        res.status(HttpStatus.OK).json({
            success: true,
            data: reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get products to review
exports.getProductsToReview = async (req, res) => {
    try {
        const { reviewerId } = req.params;

        const deliveredOrders = await Order.find({
            buyer: reviewerId,
            orderStatus: "Delivered",
        }).populate({
            path: "products.product",
            select: "productName price images",
        });

        const existingReviews = await Review.find({
            reviewer: reviewerId,
        }).select("product");

        const reviewedProductIds = new Set(
            existingReviews.map((review) => String(review.product))
        );

        const productsToReview = [];

        for (const order of deliveredOrders) {
            for (const item of order.products) {
                const product = item.product;

                if (
                    product &&
                    !reviewedProductIds.has(String(product._id))
                ) {
                    productsToReview.push({
                        product,
                        orderId: order._id,
                        deliveredAt: order.updatedAt,
                    });

                    reviewedProductIds.add(String(product._id));
                }
            }
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: productsToReview,
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
};

// Update review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Review not found"
            });
        }

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        const updatedReview = await review.save();
        const populatedReview = await updatedReview.populate("reviewer", "firstName lastName");

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Review updated successfully",
            data: populatedReview
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Review not found"
            });
        }

        // Remove review from product
        await Product.findByIdAndUpdate(
            review.product,
            { $pull: { reviews: reviewId } }
        );

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
