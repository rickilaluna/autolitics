import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D12] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] border-t-[#C9A84C] animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Replace with a better admin check later if needed
    const isAdmin = user.email === 'rickilaluna@gmail.com' || user.email?.includes('autolitics.com');

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
