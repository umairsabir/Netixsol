const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');


exports.createOrder = async (req, res) => {
    try {
        const { items, totalPrice, shippingAddress } = req.body;
        
        // 1. Check stock for all items (including variants)
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }

            // Find the specific variant in the product's variants array
            const variant = product.variants.find(v => v.label === item.selectedVariant);
            
            if (variant) {
                if (variant.stock < item.quantity) {
                    return res.status(400).json({ 
                        message: `Insufficient stock for ${product.name} (${item.selectedVariant}). Available: ${variant.stock}, Requested: ${item.quantity}` 
                    });
                }
            }
        }

        // 2. Create the order
        const order = await Order.create({
            user: req.user._id,
            items,
            totalPrice,
            shippingAddress
        });

        // 3. Decrease stock (Variant stock only)
        for (const item of items) {
            // Decrease specific variant stock using array filter
            await Product.updateOne(
                { _id: item.product, "variants.label": item.selectedVariant },
                { $inc: { "variants.$.stock": -item.quantity } }
            );
        }

        // 4. Clear cart in the database
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.status(201).json({
            status: 'success',
            data: order
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot update status of a cancelled order' });
        }

        order.status = req.body.status;
        await order.save({ runValidators: true });

        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cancelMyOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be cancelled' });
        }

        order.status = 'cancelled';
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.updateOne(
                { _id: item.product, "variants.label": item.selectedVariant },
                { $inc: { "variants.$.stock": item.quantity } }
            );
        }

        res.status(200).json({
            status: 'success',
            data: order
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
