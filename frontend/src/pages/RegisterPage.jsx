import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Register from '../components/auth/Register';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleRegister = async (userData) => {
        const result = await register(userData);
        if (result.success) {
        }
        return result;
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full">
            <Register
                onSwitchToLogin={() => navigate('/login')}
                onSubmit={handleRegister}
            />
        </div>
    );
};

export default RegisterPage;