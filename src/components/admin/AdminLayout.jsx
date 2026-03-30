import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Users,
    Car,
    FileSignature,
    LogOut,
    Menu,
    X,
    Shield,
    BookOpen,
    Search,
    BadgeDollarSign,
    GitCompare
} from 'lucide-react';

const AdminLayout = () => {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { path: '/admin/clients', icon: <Users size={20} />, label: 'Clients' },
        { path: '/admin/engagements', icon: <FileSignature size={20} />, label: 'Engagements' },
        { path: '/admin/vehicles', icon: <Car size={20} />, label: 'Vehicle Library' },
    ];

    const submissionItems = [
        { path: '/admin/listings', icon: <Search size={20} />, label: 'Listing Reviews' },
        { path: '/admin/offers', icon: <BadgeDollarSign size={20} />, label: 'Dealer Offers' },
    ];

    const contentItems = [
        { path: '/admin/resources', icon: <BookOpen size={20} />, label: 'Resources Library' },
        { path: '/admin/model-comparison', icon: <GitCompare size={20} />, label: 'Model Comparison Tool' },
    ];

    return (
        <div className="min-h-screen bg-[#0D0D12] text-[#FAF8F5] font-['Inter'] flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#0D0D12]/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#14141B] border-r border-[#2A2A35] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 flex items-center justify-between border-b border-[#2A2A35]">
                        <Link to="/admin" className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-[#C9A84C]" />
                            <span className="font-semibold tracking-tight text-[#FAF8F5]">Admin Core</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#FAF8F5]/60 hover:text-[#FAF8F5]">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 space-y-6">
                        <div>
                            <div className="text-xs font-['Space_Mono'] text-[#FAF8F5]/40 mb-3 px-2 uppercase tracking-wider">
                                Management
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                                                ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                                                : 'text-[#FAF8F5]/70 hover:bg-[#1A1A24] hover:text-[#FAF8F5]'
                                                }`}
                                        >
                                            {item.icon}
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div>
                            <div className="text-xs font-['Space_Mono'] text-[#FAF8F5]/40 mb-3 px-2 uppercase tracking-wider">
                                Submissions
                            </div>
                            <nav className="space-y-1">
                                {submissionItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                                                ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                                                : 'text-[#FAF8F5]/70 hover:bg-[#1A1A24] hover:text-[#FAF8F5]'
                                                }`}
                                        >
                                            {item.icon}
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                        
                        <div>
                            <div className="text-xs font-['Space_Mono'] text-[#FAF8F5]/40 mb-3 px-2 uppercase tracking-wider">
                                Content
                            </div>
                            <nav className="space-y-1">
                                {contentItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                                                ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                                                : 'text-[#FAF8F5]/70 hover:bg-[#1A1A24] hover:text-[#FAF8F5]'
                                                }`}
                                        >
                                            {item.icon}
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    <div className="mt-auto p-4 border-t border-[#2A2A35]">
                        <div className="flex items-center justify-between px-3 py-2 bg-[#1A1A24] rounded-xl border border-[#2A2A35]">
                            <div className="flex flex-col truncate pr-2">
                                <span className="text-sm font-medium truncate">{user?.user_metadata?.first_name || 'Admin'}</span>
                                <span className="text-xs text-[#FAF8F5]/50 font-['Space_Mono'] truncate">{user?.email}</span>
                            </div>
                            <button
                                onClick={signOut}
                                className="text-[#FAF8F5]/50 hover:text-red-400 transition-colors p-1"
                                title="Sign out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-[#0d1018] text-[#e2e8f0]">
                {/* Noise Overlay matching Brutalist Signal preset for Admin */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <filter id="adminNoiseFilter">
                            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#adminNoiseFilter)" />
                    </svg>
                </div>

                {/* Topbar Mobile */}
                <div className="lg:hidden flex justify-between items-center p-4 border-b border-[#2a3348] bg-[#0d1018] relative z-10">
                    <button onClick={() => setSidebarOpen(true)} className="text-[#e2e8f0]">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold tracking-tight font-['Space_Grotesk']">Admin</span>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                <div className="flex-1 overflow-auto relative z-10 flex flex-col h-full">
                    {location.pathname.startsWith('/admin/vehicles') ? (
                        <div className="w-full flex-1">
                            <Outlet />
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto w-full p-4 lg:p-8 flex-1">
                            <Outlet />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
