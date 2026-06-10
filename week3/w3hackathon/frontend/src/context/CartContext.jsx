import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [notification, setNotification] = useState(null);
    const { user } = useAuth();

    // Helper to fetch cart from backend
    const fetchCartFromBackend = async () => {
        try {
            const res = await API.get('/cart');
            if (res.data && res.data.data) {
                const items = res.data.data.items.map(item => {
                    const productObj = item.product || {};
                    return {
                        _id: productObj._id || item.product,
                        name: item.name || productObj.name,
                        image: item.image || productObj.image,
                        price: item.price,
                        quantity: item.quantity,
                        selectedVariant: item.selectedVariant,
                        stock: productObj.variants?.find(v => v.label === item.selectedVariant)?.stock ?? 99
                    };
                });
                setCartItems(items);
            }
        } catch (error) {
            console.error("Error fetching cart from backend:", error);
        }
    };

    // Load and sync cart
    useEffect(() => {
        if (user) {
            const localCart = localStorage.getItem('guest_cart');
            const parsedLocal = localCart ? JSON.parse(localCart) : [];
            if (parsedLocal.length > 0) {
                const syncAndFetch = async () => {
                    try {
                        const itemsToSync = parsedLocal.map(item => ({
                            product: item._id,
                            quantity: item.quantity,
                            selectedVariant: item.selectedVariant,
                            price: item.price
                        }));
                        await API.post('/cart/sync', { items: itemsToSync });
                        localStorage.removeItem('guest_cart');
                        await fetchCartFromBackend();
                    } catch (err) {
                        console.error("Error syncing guest cart:", err);
                        await fetchCartFromBackend();
                    }
                };
                syncAndFetch();
            } else {
                fetchCartFromBackend();
            }
        } else {
            const guestCart = localStorage.getItem('guest_cart');
            setCartItems(guestCart ? JSON.parse(guestCart) : []);
        }
    }, [user]);

    // Save guest cart to localStorage
    useEffect(() => {
        if (!user) {
            localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = async (product, quantity, selectedVariant, price) => {
        if (user) {
            try {
                const res = await API.post('/cart', {
                    productId: product._id,
                    quantity,
                    selectedVariant,
                    price
                });
                if (res.data && res.data.data) {
                    const items = res.data.data.items.map(item => {
                        const productObj = item.product || {};
                        return {
                            _id: productObj._id || item.product,
                            name: item.name || productObj.name,
                            image: item.image || productObj.image,
                            price: item.price,
                            quantity: item.quantity,
                            selectedVariant: item.selectedVariant,
                            stock: productObj.variants?.find(v => v.label === item.selectedVariant)?.stock ?? 99
                        };
                    });
                    setCartItems(items);
                    setNotification('Item added to bag');
                    setTimeout(() => setNotification(null), 3000);
                }
            } catch (err) {
                console.error("Error adding to cart:", err);
                const errMsg = err.response?.data?.message || "Failed to add to cart";
                setNotification(errMsg);
                setTimeout(() => setNotification(null), 3000);
            }
        } else {
            // Guest mode
            setCartItems((prev) => {
                const existing = prev.find(item => item._id === product._id && item.selectedVariant === selectedVariant);
                const currentQty = existing ? existing.quantity : 0;
                const totalQty = currentQty + quantity;
                const variantStock = product.variants?.find(v => v.label === selectedVariant)?.stock ?? 99;

                if (variantStock < totalQty) {
                    setNotification(`Insufficient stock. Only ${variantStock} available.`);
                    setTimeout(() => setNotification(null), 3000);
                    return prev;
                }

                setNotification('Item added to bag');
                setTimeout(() => setNotification(null), 3000);

                if (existing) {
                    return prev.map(item => 
                        (item._id === product._id && item.selectedVariant === selectedVariant) 
                        ? { ...item, quantity: totalQty } 
                        : item
                    );
                }
                return [...prev, { ...product, quantity, selectedVariant, price, stock: variantStock }];
            });
        }
    };

    const updateQuantity = async (id, delta, variant) => {
        if (user) {
            try {
                // If removing the item (delta is -item.quantity)
                if (delta <= -9999 || (cartItems.find(item => item._id === id && item.selectedVariant === variant)?.quantity + delta <= 0)) {
                    const response = await API.delete(`/cart/items/${id}/${variant}`);
                    if (response.data && response.data.data) {
                        const items = response.data.data.items.map(item => {
                            const productObj = item.product || {};
                            return {
                                _id: productObj._id || item.product,
                                name: item.name || productObj.name,
                                image: item.image || productObj.image,
                                price: item.price,
                                quantity: item.quantity,
                                selectedVariant: item.selectedVariant,
                                stock: productObj.variants?.find(v => v.label === item.selectedVariant)?.stock ?? 99
                            };
                        });
                        setCartItems(items);
                    }
                } else {
                    const response = await API.patch('/cart', {
                        productId: id,
                        delta,
                        selectedVariant: variant
                    });
                    if (response.data && response.data.data) {
                        const items = response.data.data.items.map(item => {
                            const productObj = item.product || {};
                            return {
                                _id: productObj._id || item.product,
                                name: item.name || productObj.name,
                                image: item.image || productObj.image,
                                price: item.price,
                                quantity: item.quantity,
                                selectedVariant: item.selectedVariant,
                                stock: productObj.variants?.find(v => v.label === item.selectedVariant)?.stock ?? 99
                            };
                        });
                        setCartItems(items);
                    }
                }
            } catch (err) {
                console.error("Error updating cart quantity:", err);
                const errMsg = err.response?.data?.message || "Failed to update quantity";
                setNotification(errMsg);
                setTimeout(() => setNotification(null), 3000);
            }
        } else {
            // Guest mode
            setCartItems((prev) => 
                prev.map(item => {
                    if (item._id === id && item.selectedVariant === variant) {
                        const newQuantity = item.quantity + delta;
                        
                        if (delta > 0 && newQuantity > item.stock) {
                            setNotification(`Insufficient stock. Only ${item.stock} available.`);
                            setTimeout(() => setNotification(null), 3000);
                            return item;
                        }
                        
                        return { ...item, quantity: Math.max(0, newQuantity) };
                    }
                    return item;
                }).filter(item => item.quantity > 0)
            );
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                await API.delete('/cart');
                setCartItems([]);
            } catch (err) {
                console.error("Error clearing cart:", err);
            }
        } else {
            setCartItems([]);
            localStorage.removeItem('guest_cart');
        }
    };

    const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = cartItems.length > 0 ? 3.95 : 0;
    const cartTotal = cartSubtotal + deliveryFee;

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, clearCart, cartSubtotal, deliveryFee, cartTotal, notification, setNotification }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
