import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: 'bg-green-50/90 border-green-200 text-green-700',
        error: 'bg-red-50/90 border-red-200 text-red-700',
        info: 'bg-blue-50/90 border-blue-200 text-blue-700',
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
            <div className={`glass rounded-2xl px-6 py-4 shadow-xl border ${styles[type]}`}>
                <div className="flex items-center gap-3">
                    <span className="text-lg">{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                    <p className="font-medium">{message}</p>
                    <button
                        onClick={onClose}
                        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;