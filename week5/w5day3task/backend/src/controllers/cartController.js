const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get User Cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            // Create an empty cart for the user if it doesn't exist
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add Item to Cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, selectedVariant, price } = req.body;

        if (!productId || !selectedVariant || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product details, variant or quantity' });
        }

        // 1. Get product and check if variant and stock exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const variant = product.variants.find(v => v.label === selectedVariant);
        if (!variant) {
            return res.status(404).json({ message: `Variant ${selectedVariant} not found for this product` });
        }

        // Check current quantity of this item already in the cart
        let cart = await Cart.findOne({ user: req.user._id });
        let existingItem = null;
        if (cart) {
            existingItem = cart.items.find(
                item => item.product.toString() === productId && item.selectedVariant === selectedVariant
            );
        }

        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        const totalRequestedQty = currentQtyInCart + quantity;

        if (variant.stock < totalRequestedQty) {
            return res.status(400).json({ 
                message: `Insufficient stock for ${product.name} (${selectedVariant}). Available: ${variant.stock}, Requested: ${totalRequestedQty}` 
            });
        }

        // 2. Add or update items
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{
                    product: productId,
                    name: product.name,
                    image: product.image,
                    selectedVariant,
                    price: price || (product.price * (variant.multiplier || 1)),
                    quantity
                }]
            });
        } else {
            if (existingItem) {
                existingItem.quantity = totalRequestedQty;
            } else {
                cart.items.push({
                    product: productId,
                    name: product.name,
                    image: product.image,
                    selectedVariant,
                    price: price || (product.price * (variant.multiplier || 1)),
                    quantity
                });
            }
            await cart.save();
        }

        // Populate product references for the response
        await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Cart Item Quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { productId, delta, selectedVariant } = req.body;

        if (!productId || !selectedVariant || delta === undefined) {
            return res.status(400).json({ message: 'Missing product, variant or delta' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId && item.selectedVariant === selectedVariant
        );

        if (!existingItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        const newQuantity = existingItem.quantity + delta;

        if (newQuantity <= 0) {
            // Remove item if quantity falls to or below 0
            cart.items = cart.items.filter(
                item => !(item.product.toString() === productId && item.selectedVariant === selectedVariant)
            );
        } else {
            // Check stock
            const product = await Product.findById(productId);
            const variant = product.variants.find(v => v.label === selectedVariant);
            if (variant && variant.stock < newQuantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${product.name} (${selectedVariant}). Available: ${variant.stock}, Requested: ${newQuantity}` 
                });
            }
            existingItem.quantity = newQuantity;
        }

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove Cart Item
exports.removeItem = async (req, res) => {
    try {
        const { productId, variant } = req.params;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => !(item.product.toString() === productId && item.selectedVariant === variant)
        );

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Clear Cart
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        } else {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sync Guest Cart items with user's backend cart on Login
exports.syncCart = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Items array is required for synchronization' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) continue;

            const variant = product.variants.find(v => v.label === item.selectedVariant);
            if (!variant) continue;

            const existingItem = cart.items.find(
                ci => ci.product.toString() === item.product && ci.selectedVariant === item.selectedVariant
            );

            const currentQty = existingItem ? existingItem.quantity : 0;
            const newQty = currentQty + item.quantity;
            const finalQty = Math.min(newQty, variant.stock);

            if (finalQty > 0) {
                if (existingItem) {
                    existingItem.quantity = finalQty;
                } else {
                    cart.items.push({
                        product: item.product,
                        name: product.name,
                        image: product.image,
                        selectedVariant: item.selectedVariant,
                        price: item.price,
                        quantity: finalQty
                    });
                }
            }
        }

        await cart.save();
        await cart.populate('items.product');

        res.status(200).json({
            status: 'success',
            data: cart
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
