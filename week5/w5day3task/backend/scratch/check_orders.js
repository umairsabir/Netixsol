const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Order = require('../src/models/Order');

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const orders = await Order.find({});
        console.log('Total Orders in DB:', orders.length);
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkOrders();
