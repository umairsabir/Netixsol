import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import API from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        try {
            await API.post('/auth/forgotPassword', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-['Montserrat'] antialiased">
            {/* Interactive Blue Mesh Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            
            {/* Back to Login Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-8 left-8"
            >
                <Link 
                    to="/login" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-all text-[11px] font-bold tracking-widest uppercase group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    BACK TO LOGIN
                </Link>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[380px] space-y-6 relative z-10"
            >
                <div className="bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[32px] p-6 md:p-8 space-y-6">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col items-center space-y-0 mb-1">
                            <div className="flex items-center gap-3">
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
                                    className="w-9 h-9"
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
                                    className="text-xl font-bold tracking-[0.2em] uppercase bg-clip-text text-transparent font-['Prosto_One']"
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
                                className="w-32 h-[3px] rounded-full mx-auto"
                            />
                        </div>

                        <div className="space-y-1 text-center pt-4">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Forgot Password?</h2>
                            <p className="text-gray-400 text-xs">Enter your email to reset your password</p>
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
                                Reset link sent! Please check your email inbox.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-black ml-1 block text-left">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-gray-300 group-focus-within:text-cyan-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-400 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white focus:border-cyan-500/50 transition-all text-xs font-medium text-left text-black"
                                        placeholder="name@gmail.com"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all disabled:opacity-50"
                            >
                                {loading ? 'SENDING...' : 'SEND'}
                            </motion.button>
                        </form>
                    ) : (
                        <div className="text-center pt-4">
                            <Link 
                                to="/login"
                                className="text-[10px] font-bold text-cyan-600 hover:text-blue-600 uppercase transition-colors"
                            >
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
