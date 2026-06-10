const mongoose = require('mongoose');
const Product = require('../src/models/Product');
require('dotenv').config({ path: '../.env' });

const cleanupDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Remove the top-level 'stock' field from all documents
        const result = await Product.updateMany({}, { 
            $unset: { stock: "" } 
        });

        console.log(`Cleaned up ${result.modifiedCount} products. Redundant 'stock' field removed.`);
        process.exit(0);
    } catch (err) {
        console.error('Error during database cleanup:', err);
        process.exit(1);
    }
};

cleanupDatabase();
