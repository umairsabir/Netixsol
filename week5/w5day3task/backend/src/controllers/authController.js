const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, adminSecret } = req.body;

        // 1. If admin role requested, check secret code
        if (role === 'admin' || role === 'superadmin') {
            const secret = process.env.ADMIN_SECRET_CODE || 'SR_TEA_2026';
            if (adminSecret !== secret) {
                return res.status(401).json({ message: 'Invalid Admin Secret Code' });
            }
        }

        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        const token = signToken(user._id, user.role);

        res.status(201).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // 2. Check if user exists & password is correct
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        // 3. Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account is blocked. Contact support.' });
        }

        // 4. Send token
        const token = signToken(user._id, user.role);
        res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email address.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        console.log(`PASSWORD RESET TOKEN FOR ${user.email}: ${resetToken}`);

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email! (Check server console for token)',
            token: resetToken
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }
        
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const token = signToken(user._id, user.role);
        res.status(200).json({
            status: 'success',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
