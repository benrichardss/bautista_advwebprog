const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const { HttpStatus } = require("../config/constants");

// Get all products with filters, pagination, and sorting
exports.getAllProducts = async (req, res) => {
    try {
        const {
            category,
            priceMin,
            priceMax,
            status,
            page = 1,
            limit = 10,
            search,
            sort = "createdAt"
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const skip = (pageNumber - 1) * limitNumber;

        let filter = {};

        // Filter by category
        if (category) {
            const categoryDocument = await Category.findOne({
                categoryName: { $regex: `^${category}$`, $options: "i" }
            });

            if (!categoryDocument) {
                return res.status(HttpStatus.OK).json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: 0
                    }
                });
            }

            filter.category = categoryDocument._id;
        }

        // Filter by price range
        if (priceMin || priceMax) {
            filter.price = {};

            if (priceMin) {
                filter.price.$gte = parseFloat(priceMin);
            }

            if (priceMax) {
                filter.price.$lte = parseFloat(priceMax);
            }
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // Keyword search
        if (search) {
            filter.$or = [
                { productName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Sorting
        let sortOption = {};

        if (sort === "price") {
            sortOption.price = 1;
        } else if (sort === "-price") {
            sortOption.price = -1;
        } else if (sort === "productName") {
            sortOption.productName = 1;
        } else if (sort === "-productName") {
            sortOption.productName = -1;
        } else {
            sortOption.createdAt = -1;
        }

        const products = await Product.find(filter)
            .populate("seller", "firstName lastName email contactNumber")
            .populate("category", "categoryName")
            .populate({
                path: "reviews",
                select: "rating comment reviewer",
                populate: {
                    path: "reviewer",
                    select: "firstName lastName"
                }
            })
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber);

        const total = await Product.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Products retrieved successfully",
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate("seller", "firstName lastName email contactNumber address")
            .populate("category", "categoryName description")
            .populate({
                path: "reviews",
                select: "rating comment reviewer createdAt",
                populate: { path: "reviewer", select: "firstName lastName" }
            });

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        const { productName, description, price, stock, images, seller, category, condition } = req.body;

        // Validate required fields
        if (!productName || !price || !seller || !category) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Category not found"
            });
        }

        const product = new Product({
            productName,
            description,
            price,
            stock,
            images: images || [],
            seller,
            category,
            condition,
            status: "Available"
        });

        const savedProduct = await product.save();

        const populatedProduct = await savedProduct.populate("seller", "firstName lastName email");

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, description, price, stock, images, category, condition, status } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if category exists if provided
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Category not found"
                });
            }
            product.category = category;
        }

        if (productName) product.productName = productName;
        if (description) product.description = description;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (images) product.images = images;
        if (condition) product.condition = condition;
        if (status) product.status = status;

        const updatedProduct = await product.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get products by seller
exports.getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const products = await Product.find({ seller: sellerId })
            .populate("category", "categoryName")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({ seller: sellerId });

        res.status(HttpStatus.OK).json({
            success: true,
            data: products,
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

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const products = await Product.find({ category: categoryId })
            .populate("seller", "firstName lastName")
            .populate("category", "categoryName")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({ category: categoryId });

        res.status(HttpStatus.OK).json({
            success: true,
            data: products,
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
