const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const forceCleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Use raw MongoDB driver to bypass any Mongoose schema logic
        const result = await productsCollection.updateMany({}, { 
            $unset: { stock: "" } 
        });

        console.log(`Force Cleaned up ${result.modifiedCount} products. Raw $unset performed.`);
        
        // Let's verify one document
        const oneProduct = await productsCollection.findOne({});
        console.log('Verification - One product keys:', Object.keys(oneProduct));
        if (oneProduct.stock !== undefined) {
            console.log('WARNING: stock field still exists in verification!');
        } else {
            console.log('SUCCESS: stock field removed.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error during force cleanup:', err);
        process.exit(1);
    }
};

forceCleanup();
