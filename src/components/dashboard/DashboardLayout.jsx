import React, { useState, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePurchases } from '../../hooks/usePurchases';
import {
    LayoutDashboard,
    FolderKanban,
    User,
    LogOut,
    Menu,
    X,
    Shield,
    ShieldCheck,
    BookOpen,
    Search
} from 'lucide-react';

const DashboardLayout = () => {
    const { user, signOut } = useAuth();
    const { loading: purchaseLoading, hasPurchasedAdvisory } = usePurchases();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = useMemo(() => {
        const items = [
            { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        ];
        if (!purchaseLoading && hasPurchasedAdvisory) {
            items.push(
                { path: '/dashboard/strategy-brief', icon: <FolderKanban size={20} />, label: 'My Strategy' },
                { path: '/dashboard/my-search', icon: <Search size={20} />, label: 'My Search' },
            );
        }
        items.push(
            { path: '/dashboard/resources', icon: <BookOpen size={20} />, label: 'Resources' },
            { path: '/dashboard/profile', icon: <User size={20} />, label: 'Profile' },
        );
        return items;
    }, [purchaseLoading, hasPurchasedAdvisory]);

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
                        <Link to="/" className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-[#C9A84C]" />
                            <span className="font-semibold tracking-tight text-[#FAF8F5]">Platform</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#FAF8F5]/60 hover:text-[#FAF8F5]">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 mb-4 px-2 uppercase tracking-wider">
                            Menu
                        </div>
                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const path =
                                    location.pathname.replace(/\/$/, '') || '/';
                                const itemPath = item.path.replace(/\/$/, '') || '/';
                                const isActive =
                                    itemPath === '/dashboard'
                                        ? path === '/dashboard'
                                        : path === itemPath || path.startsWith(`${itemPath}/`);
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

                        {/* Admin Section */}
                        {(user?.email === 'rickilaluna@gmail.com' || user?.email?.includes('autolitics.com')) && (
                            <div className="mt-8">
                                <div className="text-xs font-['JetBrains_Mono'] text-[#FAF8F5]/40 mb-4 px-2 uppercase tracking-wider">
                                    Admin Management
                                </div>
                                <nav className="space-y-1">
                                    <Link
                                        to="/admin"
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-[#FAF8F5]/70 hover:bg-red-500/10 hover:text-red-400"
                                    >
                                        <Shield size={20} />
                                        <span className="font-medium text-sm">Admin Panel</span>
                                    </Link>
                                </nav>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto p-4 border-t border-[#2A2A35]">
                        <div className="flex items-center justify-between px-3 py-2 bg-[#1A1A24] rounded-xl border border-[#2A2A35]">
                            <div className="flex flex-col truncate pr-2">
                                <span className="text-sm font-medium truncate">{user?.user_metadata?.first_name || 'User'}</span>
                                <span className="text-xs text-[#FAF8F5]/50 font-['JetBrains_Mono'] truncate">{user?.email}</span>
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
            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-[#FAF8F5] text-[#0D0D12]">
                {/* Noise Overlay matching brand */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-multiply">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                        <filter id="dashboardNoiseFilter">
                            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#dashboardNoiseFilter)" />
                    </svg>
                </div>

                {/* Topbar Mobile */}
                <div className="lg:hidden flex justify-between items-center p-4 border-b border-[#0D0D12]/10 bg-[#FAF8F5] relative z-10">
                    <button onClick={() => setSidebarOpen(true)} className="text-[#0D0D12]">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold tracking-tight">Dashboard</span>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                <div className="flex-1 overflow-auto p-6 lg:p-10 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
