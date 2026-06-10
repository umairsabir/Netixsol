const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Cart item must have a product reference']
    },
    name: {
        type: String,
        required: [true, 'Cart item must have a name']
    },
    image: {
        type: String,
        required: [true, 'Cart item must have an image']
    },
    selectedVariant: {
        type: String,
        required: [true, 'Cart item must have a selected variant']
    },
    price: {
        type: Number,
        required: [true, 'Cart item must have a price']
    },
    quantity: {
        type: Number,
        required: [true, 'Cart item must have a quantity'],
        min: [1, 'Quantity cannot be less than 1'],
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cart must belong to a user'],
        unique: true
    },
    items: [cartItemSchema]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
