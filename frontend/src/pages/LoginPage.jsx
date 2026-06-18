import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/auth/Login';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success) {
            navigate('/');
        }
        return result;
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full">
            <Login
                onSwitchToRegister={() => navigate('/register')}
                onSubmit={handleLogin}
            />
        </div>
    );
};

export default LoginPage;