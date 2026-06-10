const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 9, isOrganic, collectionName, origin, flavour, quality, caffeine, allergen } = req.query;
        const queryObj = {};

        if (isOrganic === 'true') queryObj.isOrganic = true;
        
        const filterFields = ['collectionName', 'origin', 'flavour', 'quality', 'caffeine', 'allergen'];
        filterFields.forEach(field => {
            if (req.query[field]) {
                const values = req.query[field].split(',');
                queryObj[field] = { $in: values };
            }
        });

        let sortStr = '-createdAt';
        const { sort } = req.query;
        if (sort === 'Price: Low to High') sortStr = 'price';
        else if (sort === 'Price: High to Low') sortStr = '-price';
        else if (sort === 'Name: A to Z') sortStr = 'name';
        else if (sort === 'Newest First') sortStr = '-createdAt';

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(queryObj);
        const products = await Product.find(queryObj).sort(sortStr).skip(skip).limit(parseInt(limit));

        res.status(200).json({
            status: 'success',
            results: products.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            data: products
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Seeding function (to be called once to populate DB)
exports.seedProducts = async (req, res) => {
    try {
        const productsData = req.body; // Array of products from frontend/src/data/products.js
        
        // Clear existing products
        await Product.deleteMany();
        
        // Format and insert
        const formattedProducts = productsData.map(p => {
            const { id, ...rest } = p; // Remove the static ID
            return { ...rest, collectionName: p.collection };
        });
        
        const products = await Product.insertMany(formattedProducts);
        
        res.status(201).json({
            status: 'success',
            message: 'Products seeded successfully',
            data: products
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addMultipleProducts = async (req, res) => {
    try {
        const productsData = req.body;
        const formattedProducts = productsData.map(p => {
            const { id, ...rest } = p;
            return { ...rest, collectionName: p.collection };
        });
        
        const products = await Product.insertMany(formattedProducts);
        
        res.status(201).json({
            status: 'success',
            message: 'Products added successfully',
            data: products
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            collectionName: req.body.collection // mapping frontend 'collection' to 'collectionName'
        });
        res.status(201).json({
            status: 'success',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({
            status: 'success',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
