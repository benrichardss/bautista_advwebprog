const Order = require("../models/orderModel");
const { HttpStatus } = require("../config/constants");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// Create new order from cart
exports.createOrder = async (req, res) => {
    try {
        const { userId } = req.params;
        const { shippingAddress, paymentMethod, products } = req.body;

        if (!shippingAddress || !paymentMethod) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Shipping address and payment method are required"
            });
        }

        // If products array provided, use it; otherwise use cart
        let orderProducts = [];
        let totalAmount = 0;

        if (products && products.length > 0) {
            for (let item of products) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(HttpStatus.NOT_FOUND).json({
                        success: false,
                        message: `Product ${item.productId} not found`
                    });
                }

                if (product.stock < item.quantity) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        success: false,
                        message: `Insufficient stock for ${product.productName}`
                    });
                }

                orderProducts.push({
                    product: item.productId,
                    quantity: item.quantity,
                    price: product.price
                });

                totalAmount += product.price * item.quantity;
            }
        } else {
            // Use cart products
            const cart = await Cart.findOne({ user: userId });
            if (!cart || cart.products.length === 0) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Cart is empty"
                });
            }

            for (let item of cart.products) {
                const product = await Product.findById(item.product);
                if (product.stock < item.quantity) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        success: false,
                        message: `Insufficient stock for ${product.productName}`
                    });
                }

                orderProducts.push({
                    product: item.product,
                    quantity: item.quantity,
                    price: product.price
                });

                totalAmount += product.price * item.quantity;
            }
        }

        // Create order
        const order = new Order({
            buyer: userId,
            products: orderProducts,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: "Pending"
        });

        const savedOrder = await order.save();

        // Clear cart if using cart products
        if (!products || products.length === 0) {
            await Cart.findOneAndUpdate(
                { user: userId },
                { products: [], totalPrice: 0 }
            );
        }

        const populatedOrder = await savedOrder.populate([
            {
                path: "products.product",
                select: "productName price images"
            },
            {
                path: "buyer",
                select: "firstName lastName email contactNumber"
            }
        ]);

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Order created successfully",
            data: populatedOrder
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate({
                path: "products.product",
                select: "productName price images"
            })
            .populate("buyer", "firstName lastName email contactNumber address");

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get all orders for a buyer
exports.getOrdersByBuyer = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let filter = { buyer: userId };
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate({
                path: "products.product",
                select: "productName price images"
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ orderDate: -1 });

        const total = await Order.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            data: orders,
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

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate({
                path: "products.product",
                select: "productName price images"
            })
            .populate("buyer", "firstName lastName email")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ orderDate: -1 });

        const total = await Order.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            data: orders,
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

exports.getOrdersForDashboard = async (req, res) => {
    try {
        const { role, sellerId } = req.query;
        const { status, page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;
        let filter = {};

        if (status) {
            filter.orderStatus = status;
        }

        if (role === "seller") {
            const sellerProducts = await Product.find({
                seller: sellerId
            }).select("_id");

            filter["products.product"] = {
                $in: sellerProducts.map((product) => product._id)
            };
        }

        const orders = await Order.find(filter)
            .populate({
                path: "products.product",
                select: "productName price images seller",
                populate: {
                    path: "seller",
                    select: "firstName lastName"
                }
            })
            .populate("buyer", "firstName lastName email contactNumber")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ orderDate: -1 });

        const total = await Order.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            data: orders,
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

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Order not found"
            });
        }

        const isProcessingOrder =
            order.orderStatus === "Pending" &&
            orderStatus === "Processing";

        if (isProcessingOrder) {
            for (const item of order.products) {
                const product = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        stock: { $gte: item.quantity }
                    },
                    {
                        $inc: { stock: -item.quantity }
                    },
                    { new: true }
                );

                if (!product) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        success: false,
                        message: "Insufficient stock for one or more products"
                    });
                }
            }
        }

        order.orderStatus = orderStatus;
        await order.save();

        const populatedOrder = await order.populate([
            {
                path: "products.product",
                select: "productName price images"
            },
            {
                path: "buyer",
                select: "firstName lastName email contactNumber"
            }
        ]);

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Order status updated",
            data: populatedOrder
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "Pending") {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Only pending orders can be cancelled"
            });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
