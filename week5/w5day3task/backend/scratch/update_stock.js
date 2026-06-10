const mongoose = require('mongoose');
const Product = require('../src/models/Product');
require('dotenv').config({ path: '../.env' });

const updateStock = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const variants = [
            { label: '50 g bag', multiplier: 1, stock: 10 },
            { label: '100 g bag', multiplier: 2, stock: 5 },
            { label: '170 g bag', multiplier: 3.4, stock: 0 },
            { label: '250 g bag', multiplier: 5, stock: 0 },
            { label: '1 kg bag', multiplier: 20, stock: 0 },
            { label: 'Sampler', multiplier: 0.5, stock: 0 }
        ];

        // Update all products with these variants
        const result = await Product.updateMany({}, { 
            $set: { 
                variants: variants,
                stock: 15 // Total stock for the product (10+5)
            } 
        });

        console.log(`Updated ${result.modifiedCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Error updating stock:', err);
        process.exit(1);
    }
};

updateStock();
