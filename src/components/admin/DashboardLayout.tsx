import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, BarChart3, Database, Settings, LogOut, Menu, X, ExternalLink, Upload } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Set document title for admin dashboard
    useEffect(() => {
        document.title = 'Dashboard Admin IKAHATA';
    }, []); // This line is retained to ensure the title is set correctly

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/alumni', label: 'Alumni Database', icon: Database },
        { path: '/admin/import', label: 'Import CSV', icon: Upload },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex">
                {/* Sidebar - Desktop */}
                <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-4 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">🛡️ Admin Panel</h2>
                                <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.path)
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Bottom Actions */}
                        <div className="p-4 border-t border-slate-700 space-y-2">
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition"
                            >
                                <ExternalLink size={20} />
                                Lihat Website
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-600/20 transition"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    {/* Top Header */}
                    <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                        <button
                            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="hidden sm:inline">Alumni Mentorship</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-indigo-400 font-medium">Admin</span>
                        </div>
                        <div className="w-8 lg:hidden" /> {/* Spacer for alignment */}
                    </header>

                    {/* Page Content - with smooth fade in */}
                    <div className="min-h-[calc(100vh-57px)] animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
