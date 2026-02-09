import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { BarChart3, Users, MousePointerClick, TrendingUp, Eye, Calendar } from 'lucide-react';

interface AnalyticsData {
    totalVisitors: number;
    totalPageViews: number;
    totalFeatureClicks: number;
    totalMentorInteractions: number;
    pageViewsBySlide: { slide_index: number; slide_name: string; count: number }[];
    featureClicksByType: { feature: string; count: number }[];
    topMentors: { mentor_name: string; count: number }[];
    dailyVisitors: { date: string; count: number }[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dateRange);
        const startDateStr = startDate.toISOString();

        try {
            // Fetch page views
            const { data: pageViews, count: pvCount } = await supabase
                .from('page_views')
                .select('*', { count: 'exact' })
                .gte('viewed_at', startDateStr);

            // Fetch feature clicks
            const { data: featureClicks, count: fcCount } = await supabase
                .from('feature_clicks')
                .select('*', { count: 'exact' })
                .gte('clicked_at', startDateStr);

            // Fetch mentor interactions
            const { data: mentorInteractions, count: miCount } = await supabase
                .from('mentor_interactions')
                .select('*', { count: 'exact' })
                .gte('interacted_at', startDateStr);

            // Get unique visitors
            const uniqueVisitors = new Set(pageViews?.map(pv => pv.user_id) || []).size;

            // Page views by slide
            const slideMap: Record<string, number> = {};
            pageViews?.forEach(pv => {
                const key = pv.page || 'Unknown';
                slideMap[key] = (slideMap[key] || 0) + 1;
            });
            const pageViewsBySlide = Object.entries(slideMap)
                .map(([name, count]) => ({ slide_index: 0, slide_name: name, count }))
                .sort((a, b) => b.count - a.count);

            // Feature clicks by type
            const featureMap: Record<string, number> = {};
            featureClicks?.forEach(fc => {
                const key = fc.feature || 'Unknown';
                featureMap[key] = (featureMap[key] || 0) + 1;
            });
            const featureClicksByType = Object.entries(featureMap)
                .map(([feature, count]) => ({ feature, count }))
                .sort((a, b) => b.count - a.count);

            // Top mentors
            const mentorMap: Record<string, number> = {};
            mentorInteractions?.forEach(mi => {
                const key = mi.mentor_id || 'Unknown';
                mentorMap[key] = (mentorMap[key] || 0) + 1;
            });
            const topMentors = Object.entries(mentorMap)
                .map(([mentor_name, count]) => ({ mentor_name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Daily visitors (last 7 days)
            const dailyMap: Record<string, Set<string>> = {};
            pageViews?.forEach(pv => {
                const date = new Date(pv.viewed_at).toLocaleDateString('id-ID');
                if (!dailyMap[date]) dailyMap[date] = new Set();
                dailyMap[date].add(pv.user_id);
            });
            const dailyVisitors = Object.entries(dailyMap)
                .map(([date, users]) => ({ date, count: users.size }))
                .slice(-7);

            setData({
                totalVisitors: uniqueVisitors,
                totalPageViews: pvCount || 0,
                totalFeatureClicks: fcCount || 0,
                totalMentorInteractions: miCount || 0,
                pageViewsBySlide,
                featureClicksByType,
                topMentors,
                dailyVisitors,
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const slideNames: Record<string, string> = {
        '0': 'Beranda',
        '1': 'Smart Match',
        '2': 'Direktori',
        '3': 'Etika Chat',
        '4': 'Tentang Kami',
        '5': 'Favorit',
    };

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 size={28} /> Analytics Dashboard
                        </h1>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        >
                            <option value={7}>7 Hari Terakhir</option>
                            <option value={14}>14 Hari Terakhir</option>
                            <option value={30}>30 Hari Terakhir</option>
                            <option value={90}>90 Hari Terakhir</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading analytics...</div>
                    ) : data ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users size={24} />
                                        <span className="text-sm opacity-80">Unique Visitors</span>
                                    </div>
                                    <div className="text-3xl font-bold">{data.totalVisitors}</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Eye size={24} />
                                        <span className="text-sm opacity-80">Page Views</span>
                                    </div>
                                    <div className="text-3xl font-bold">{data.totalPageViews}</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MousePointerClick size={24} />
                                        <span className="text-sm opacity-80">Feature Clicks</span>
                                    </div>
                                    <div className="text-3xl font-bold">{data.totalFeatureClicks}</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp size={24} />
                                        <span className="text-sm opacity-80">Mentor Interactions</span>
                                    </div>
                                    <div className="text-3xl font-bold">{data.totalMentorInteractions}</div>
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Page Views by Slide */}
                                <div className="bg-slate-800 p-6 rounded-xl">
                                    <h3 className="text-lg font-bold mb-4">📊 Page Views by Section</h3>
                                    <div className="space-y-3">
                                        {data.pageViewsBySlide.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-24 text-sm text-slate-400 truncate">
                                                    {slideNames[item.slide_name] || item.slide_name}
                                                </div>
                                                <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                                                    <div
                                                        className="bg-indigo-500 h-full rounded-full flex items-center justify-end pr-2"
                                                        style={{
                                                            width: `${Math.max(10, (item.count / Math.max(...data.pageViewsBySlide.map(p => p.count))) * 100)}%`,
                                                        }}
                                                    >
                                                        <span className="text-xs font-bold">{item.count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {data.pageViewsBySlide.length === 0 && (
                                            <p className="text-slate-400 text-sm">Belum ada data</p>
                                        )}
                                    </div>
                                </div>

                                {/* Feature Clicks */}
                                <div className="bg-slate-800 p-6 rounded-xl">
                                    <h3 className="text-lg font-bold mb-4">🖱️ Feature Clicks</h3>
                                    <div className="space-y-3">
                                        {data.featureClicksByType.slice(0, 8).map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-32 text-sm text-slate-400 truncate">{item.feature}</div>
                                                <div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-full rounded-full flex items-center justify-end pr-2"
                                                        style={{
                                                            width: `${Math.max(10, (item.count / Math.max(...data.featureClicksByType.map(f => f.count))) * 100)}%`,
                                                        }}
                                                    >
                                                        <span className="text-xs font-bold">{item.count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {data.featureClicksByType.length === 0 && (
                                            <p className="text-slate-400 text-sm">Belum ada data</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Top Mentors */}
                            <div className="bg-slate-800 p-6 rounded-xl">
                                <h3 className="text-lg font-bold mb-4">⭐ Top 10 Mentor Paling Diklik</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {data.topMentors.map((mentor, i) => (
                                        <div key={i} className="bg-slate-700 p-4 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-yellow-400">#{i + 1}</div>
                                            <div className="text-sm mt-1 truncate">{mentor.mentor_name}</div>
                                            <div className="text-xs text-slate-400 mt-1">{mentor.count} interactions</div>
                                        </div>
                                    ))}
                                    {data.topMentors.length === 0 && (
                                        <p className="text-slate-400 text-sm col-span-5">Belum ada data</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-slate-400">Gagal memuat data analytics</div>
                    )}
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
