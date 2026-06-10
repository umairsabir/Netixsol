const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue
        const revenueData = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // 2. Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        // 4. Current Week Revenue (Starting from Monday)
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(now.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyRevenueData = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const weeklyRevenue = weeklyRevenueData.length > 0 ? weeklyRevenueData[0].total : 0;

        // 5. Low Stock Products (Sum of all variants < 10)
        const lowStockProducts = await Product.aggregate([
            {
                $addFields: {
                    totalStock: { $sum: "$variants.stock" }
                }
            },
            {
                $match: { totalStock: { $lt: 10 } }
            },
            { $limit: 5 }
        ]);

        // 6. Recent Orders
        const recentOrders = await Order.find()
            .populate('user', 'name')
            .sort('-createdAt')
            .limit(4);

        res.status(200).json({
            status: 'success',
            data: {
                totalRevenue,
                weeklyRevenue,
                totalOrders,
                totalUsers,
                lowStockProducts,
                recentOrders
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        // Restriction: Only superadmin can block/unblock ANY account
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ 
                message: 'Access Denied. Only Superadmin can manage account statuses.' 
            });
        }

        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        targetUser.isBlocked = req.body.isBlocked;
        await targetUser.save({ runValidators: true });

        res.status(200).json({
            status: 'success',
            data: targetUser
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true, runValidators: true }
        );
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
