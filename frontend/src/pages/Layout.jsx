import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-7xl">
        <Header 
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={logout}
        />
        <main className="mt-4 md:mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;