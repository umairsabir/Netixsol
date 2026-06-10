const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product must have a name'],
        trim: true
    },
    subtitle: {
        type: String,
        required: [true, 'A product must have a subtitle']
    },
    price: {
        type: Number,
        required: [true, 'A product must have a price']
    },
    unit: {
        type: String,
        default: 'bag'
    },
    image: {
        type: String,
        required: [true, 'A product must have an image']
    },
    description: String,
    isOrganic: {
        type: Boolean,
        default: false
    },
    variants: [
        {
            label: { type: String, required: true },
            multiplier: { type: Number, default: 1 },
            stock: { type: Number, default: 0 }
        }
    ],
    collectionName: {
        type: String,
        required: [true, 'A product must belong to a collection'],
        alias: 'collection' // To match frontend data if needed
    },
    origin: String,
    flavour: String,
    quality: String,
    caffeine: String,
    allergen: String,
    description: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
