import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import DashboardLayout from './DashboardLayout';
import { BarChart3, Database, Settings, Users, Eye, MousePointerClick, TrendingUp, ArrowRight, Upload } from 'lucide-react';

interface DashboardStats {
    totalVisitors: number;
    totalPageViews: number;
    totalFeatureClicks: number;
    totalMentorInteractions: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Get user
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            // Get stats from last 30 days
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const startDateStr = startDate.toISOString();

            const [pvResult, fcResult, miResult] = await Promise.all([
                supabase.from('page_views').select('user_id', { count: 'exact' }).gte('viewed_at', startDateStr),
                supabase.from('feature_clicks').select('*', { count: 'exact' }).gte('clicked_at', startDateStr),
                supabase.from('mentor_interactions').select('*', { count: 'exact' }).gte('interacted_at', startDateStr),
            ]);

            const uniqueVisitors = new Set(pvResult.data?.map(pv => pv.user_id) || []).size;

            setStats({
                totalVisitors: uniqueVisitors,
                totalPageViews: pvResult.count || 0,
                totalFeatureClicks: fcResult.count || 0,
                totalMentorInteractions: miResult.count || 0,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        { label: 'Import CSV', description: 'Upload data alumni baru', icon: Upload, href: '/admin/import', color: 'from-orange-600 to-orange-700' },
        { label: 'Analytics', description: 'Lihat statistik lengkap', icon: BarChart3, href: '/admin/analytics', color: 'from-blue-600 to-blue-700' },
        { label: 'Alumni Database', description: 'Kelola data alumni', icon: Database, href: '/admin/alumni', color: 'from-green-600 to-green-700' },
        { label: 'Settings', description: 'Pengaturan admin', icon: Settings, href: '/admin/settings', color: 'from-purple-600 to-purple-700' },
    ];

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        Selamat Datang, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin'}! 👋
                    </h1>
                    <p className="text-slate-400">
                        Ini adalah dashboard admin untuk Alumni Mentorship Project.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 text-slate-300">📊 Statistik 30 Hari Terakhir</h2>
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading...</div>
                    ) : stats ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-blue-400 mb-2">
                                    <Users size={20} />
                                    <span className="text-sm">Visitors</span>
                                </div>
                                <div className="text-2xl font-bold">{stats.totalVisitors}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-green-400 mb-2">
                                    <Eye size={20} />
                                    <span className="text-sm">Page Views</span>
                                </div>
                                <div className="text-2xl font-bold">{stats.totalPageViews}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-purple-400 mb-2">
                                    <MousePointerClick size={20} />
                                    <span className="text-sm">Feature Clicks</span>
                                </div>
                                <div className="text-2xl font-bold">{stats.totalFeatureClicks}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-orange-400 mb-2">
                                    <TrendingUp size={20} />
                                    <span className="text-sm">Mentor Interactions</span>
                                </div>
                                <div className="text-2xl font-bold">{stats.totalMentorInteractions}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg text-sm">
                            ⚠️ Tidak dapat memuat statistik. Pastikan tabel analytics sudah dibuat di Supabase.
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-slate-300">🚀 Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`bg-gradient-to-br ${link.color} p-4 sm:p-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                            >
                                <div className="flex items-center justify-center sm:justify-start sm:items-start">
                                    <link.icon size={24} className="sm:hidden" />
                                    <link.icon size={28} className="hidden sm:block" />
                                </div>
                                <div className="mt-3 sm:mt-4 text-center sm:text-left">
                                    <div className="font-bold text-sm sm:text-lg">{link.label}</div>
                                    <div className="hidden sm:block text-sm opacity-80 mt-1">{link.description}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <h3 className="font-bold mb-2">💡 Tips</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• <strong>Import CSV</strong> - Upload data alumni baru dari Google Form</li>
                        <li>• <strong>Analytics</strong> - Lihat detail statistik pengunjung</li>
                        <li>• <strong>Alumni Database</strong> - Kelola data alumni secara manual</li>
                        <li>• <strong>Settings</strong> - Ubah password dan pengaturan akun</li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
}
