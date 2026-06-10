import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        adminSecret: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showAdminSecret, setShowAdminSecret] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        try {
            await API.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                adminSecret: formData.adminSecret
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden font-['Montserrat'] antialiased">
            {/* ... backgrounds ... */}
            
            {/* Back to Home Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 left-6"
            >
                <Link 
                    to="/" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    BACK
                </Link>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[360px] space-y-4 relative z-10"
            >
                <div className="bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[28px] p-6 space-y-3">
                    {/* Logo & Brand Name Inside Card */}
                    <div className="space-y-1">
                        <div className="flex flex-col items-center space-y-0 mb-1">
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    animate={{ 
                                        backgroundImage: [
                                            "linear-gradient(to bottom right, #06b6d4, #3b82f6)",
                                            "linear-gradient(to bottom right, #8b5cf6, #d946ef)",
                                            "linear-gradient(to bottom right, #f59e0b, #ef4444)",
                                            "linear-gradient(to bottom right, #06b6d4, #3b82f6)"
                                        ]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        WebkitMaskImage: 'url(/images/psychiatry.png)',
                                        maskImage: 'url(/images/psychiatry.png)',
                                        WebkitMaskSize: 'contain',
                                        maskSize: 'contain',
                                        WebkitMaskRepeat: 'no-repeat',
                                        maskRepeat: 'no-repeat',
                                        WebkitMaskPosition: 'center',
                                        maskPosition: 'center'
                                    }}
                                    className="w-7 h-7"
                                />
                                <motion.h1 
                                    animate={{ 
                                        backgroundImage: [
                                            "linear-gradient(to right, #06b6d4, #3b82f6)",
                                            "linear-gradient(to right, #8b5cf6, #d946ef)",
                                            "linear-gradient(to right, #f59e0b, #ef4444)",
                                            "linear-gradient(to right, #06b6d4, #3b82f6)"
                                        ]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    className="text-lg font-bold tracking-[0.2em] uppercase bg-clip-text text-transparent font-['Prosto_One']"
                                >
                                    SR TEA
                                </motion.h1>
                            </div>
                            <motion.div 
                                animate={{ 
                                    backgroundImage: [
                                        "linear-gradient(to right, #06b6d4, #3b82f6)",
                                        "linear-gradient(to right, #8b5cf6, #d946ef)",
                                        "linear-gradient(to right, #f59e0b, #ef4444)",
                                        "linear-gradient(to right, #06b6d4, #3b82f6)"
                                    ]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-[2px] rounded-full mx-auto"
                            />
                        </div>

                        <div className="space-y-0 text-center pt-1">
                            <h2 className="text-md font-bold text-gray-900 tracking-tight">Create Account</h2>
                            <p className="text-gray-400 text-[9px]">Join our tea community</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-[10px] text-center font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-green-50 border border-green-100 text-green-600 px-4 py-2 rounded-xl text-[10px] text-center font-medium"
                            >
                                Account created! Redirecting to login...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Role Selection */}
                        <div className="flex gap-2 mb-2">
                            <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'user', adminSecret: '' })}
                                className={`flex-grow py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.role === 'user' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}
                            >
                                User
                            </button>
                            <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                className={`flex-grow py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.role === 'admin' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}
                            >
                                Admin
                            </button>
                            <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'superadmin' })}
                                className={`flex-grow py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.role === 'superadmin' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}
                            >
                                Super
                            </button>
                        </div>

                        {/* Name Field */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-black ml-1 block text-left">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon size={14} className="text-gray-300 group-focus-within:text-cyan-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-400 rounded-xl py-2 pl-9 pr-4 outline-none focus:bg-white focus:border-cyan-500/50 transition-all text-[11px] font-medium text-left text-black"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-black ml-1 block text-left">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={14} className="text-gray-300 group-focus-within:text-cyan-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50/50 border border-gray-400 rounded-xl py-2 pl-9 pr-4 outline-none focus:bg-white focus:border-cyan-500/50 transition-all text-[11px] font-medium text-left text-black"
                                    placeholder="name@gmail.com"
                                />
                            </div>
                        </div>

                        {/* Password Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {/* Password Field */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-black ml-1 block text-left">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={14} className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 border border-gray-400 rounded-xl py-2 pl-9 pr-9 outline-none focus:bg-white focus:border-blue-500/50 transition-all text-[11px] font-medium text-left text-black"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-gray-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-black ml-1 block text-left">
                                    Confirm
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={14} className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50/50 border border-gray-400 rounded-xl py-2 pl-9 pr-9 outline-none focus:bg-white focus:border-blue-500/50 transition-all text-[11px] font-medium text-left text-black"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-gray-900 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Admin Secret Field (Conditional) */}
                        {(formData.role === 'admin' || formData.role === 'superadmin') && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-1"
                            >
                                <label className="text-[10px] font-bold text-cyan-600 ml-1 block text-left uppercase tracking-tighter">
                                    Admin Verification Code
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck size={16} className="text-cyan-500 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showAdminSecret ? 'text' : 'password'}
                                        name="adminSecret"
                                        required
                                        value={formData.adminSecret}
                                        onChange={handleChange}
                                        className="w-full bg-cyan-50/30 border border-cyan-200 rounded-xl py-2.5 pl-12 pr-12 outline-none focus:bg-white focus:border-cyan-500 transition-all text-xs font-bold text-left text-black placeholder:text-cyan-200"
                                        placeholder="Enter Secret Code"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminSecret(!showAdminSecret)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-cyan-300 hover:text-cyan-600 transition-colors"
                                    >
                                        {showAdminSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Register Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all disabled:opacity-50 mt-1"
                        >
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </motion.button>
                    </form>

                    {/* Sign In Link */}
                    <div className="text-center pt-2">
                        <p className="text-gray-400 text-[10px] font-semibold">
                            Already have an account?{' '}
                            <Link 
                                to="/login" 
                                className="text-cyan-600 hover:text-blue-600 transition-all ml-1"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
