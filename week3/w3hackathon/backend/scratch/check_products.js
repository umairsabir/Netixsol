const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Product = require('../src/models/Product');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({}, 'name stock variants');
        console.log('Total Products in DB:', products.length);
        console.log('Product Details:');
        products.forEach((p, index) => {
            console.log(`${index + 1}. Name: ${p.name}, Stock: ${p.stock}`);
            if (p.variants && p.variants.length > 0) {
                p.variants.forEach(v => {
                    console.log(`   - Variant: ${v.label}, Stock: ${v.stock}`);
                });
            }
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkProducts();
