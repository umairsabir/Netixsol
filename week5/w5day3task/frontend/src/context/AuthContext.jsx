import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    // Fetch user details if token exists
                    const res = await API.get('/auth/me');
                    setUser(res.data.user);
                } catch (error) {
                    sessionStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await API.post('/auth/register', userData);
        sessionStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
