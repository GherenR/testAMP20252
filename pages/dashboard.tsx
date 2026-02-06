import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface PlatformStats {
    date_range: {
        from: string;
        to: string;
        days: number;
    };
    summary: {
        unique_visitors: number;
        total_page_views: number;
        device_breakdown: {
            mobile: number;
            desktop: number;
        };
    };
    features: Record<string, number>;
    slides: Record<number, { name: string; views: number }>;
    mentors: Array<{
        name: string;
        clicks: number;
        actions: Record<string, number>;
    }>;
    timestamp: string;
}

type TabType = 'overview' | 'features' | 'mentors' | 'slides';

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        fetchStats();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [days]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/stats/platform?days=${days}`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">📊 Loading analytics...</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">⚠️ Failed to load analytics</div>
                    <p className="text-slate-400">Please check if Supabase is configured correctly</p>
                </div>
            </div>
        );
    }

    // Chart data
    const slideChartData = Object.values(stats.slides).map(s => ({
        name: s.name,
        views: s.views,
    }));

    const featureChartData = Object.entries(stats.features)
        .map(([name, count]) => ({
            name,
            clicks: count as number,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 8);

    const mentorChartData = stats.mentors.slice(0, 10).map(m => ({
        name: m.name.split(' ')[0], // First name only for chart
        clicks: m.clicks,
    }));

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 border-b border-slate-700 pb-6">
                    <h1 className="text-4xl font-black mb-2">📊 Analytics Dashboard</h1>
                    <p className="text-slate-400">
                        {format(new Date(stats.date_range.from), 'MMM dd')} -{' '}
                        {format(new Date(stats.date_range.to), 'MMM dd, yyyy')}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mb-8 items-center flex-wrap">
                    <select
                        value={days}
                        onChange={e => setDays(parseInt(e.target.value))}
                        className="px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>

                    <button
                        onClick={fetchStats}
                        className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700 font-bold transition"
                    >
                        🔄 Refresh
                    </button>

                    <span className="text-xs text-slate-500 ml-auto">
                        Updated: {format(new Date(stats.timestamp), 'HH:mm:ss')}
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Unique Visitors */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-800 p-6 rounded-lg border border-slate-700 hover:border-indigo-500 transition">
                        <div className="text-sm text-slate-400 mb-2">👥 Unique Visitors</div>
                        <div className="text-4xl font-black text-indigo-400">
                            {stats.summary.unique_visitors}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">This period</div>
                    </div>

                    {/* Total Page Views */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-800 p-6 rounded-lg border border-slate-700 hover:border-green-500 transition">
                        <div className="text-sm text-slate-400 mb-2">📄 Total Page Views</div>
                        <div className="text-4xl font-black text-green-400">
                            {stats.summary.total_page_views}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Slide visits</div>
                    </div>

                    {/* Mobile Users */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition">
                        <div className="text-sm text-slate-400 mb-2">📱 Mobile Users</div>
                        <div className="text-4xl font-black text-blue-400">
                            {stats.summary.device_breakdown.mobile}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                            {stats.summary.device_breakdown.mobile + stats.summary.device_breakdown.desktop > 0
                                ? Math.round(
                                    (stats.summary.device_breakdown.mobile /
                                        (stats.summary.device_breakdown.mobile +
                                            stats.summary.device_breakdown.desktop)) *
                                    100
                                )
                                : 0}
                            % of total
                        </div>
                    </div>

                    {/* Desktop Users */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-800 p-6 rounded-lg border border-slate-700 hover:border-red-500 transition">
                        <div className="text-sm text-slate-400 mb-2">💻 Desktop Users</div>
                        <div className="text-4xl font-black text-red-400">
                            {stats.summary.device_breakdown.desktop}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                            {stats.summary.device_breakdown.mobile + stats.summary.device_breakdown.desktop > 0
                                ? Math.round(
                                    (stats.summary.device_breakdown.desktop /
                                        (stats.summary.device_breakdown.mobile +
                                            stats.summary.device_breakdown.desktop)) *
                                    100
                                )
                                : 0}
                            % of total
                        </div>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
                    <h2 className="text-xl font-bold mb-4">📊 Device Breakdown</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Mobile', value: stats.summary.device_breakdown.mobile },
                                    { name: 'Desktop', value: stats.summary.device_breakdown.desktop },
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, percent }: any) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip formatter={(value: any) => value.toString()} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 flex-wrap">
                    {(['overview', 'features', 'mentors', 'slides'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded font-bold capitalize transition-colors ${activeTab === tab
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                }`}
                        >
                            {tab === 'features' && '🎯'}
                            {tab === 'mentors' && '⭐'}
                            {tab === 'slides' && '📄'}
                            {tab === 'overview' && '📊'}
                            {' '}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Slide Views */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">📄 Slide Views Distribution</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={slideChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                    <Bar dataKey="views" fill="#10b981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Feature Clicks */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">🎯 Top Features Used</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={featureChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" angle={-30} textAnchor="end" height={60} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                    <Bar dataKey="clicks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Mentors */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">⭐ Top 10 Most Clicked Mentors</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={mentorChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                    <Bar dataKey="clicks" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Key Metrics */}
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">📈 Key Metrics Summary</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-700 p-4 rounded">
                                    <div className="text-sm text-slate-400">Avg Views/Slide</div>
                                    <div className="text-3xl font-bold text-green-400 mt-2">
                                        {(stats.summary.total_page_views / slideChartData.length).toFixed(0)}
                                    </div>
                                </div>
                                <div className="bg-slate-700 p-4 rounded">
                                    <div className="text-sm text-slate-400">Total Features Used</div>
                                    <div className="text-3xl font-bold text-blue-400 mt-2">
                                        {Object.values(stats.features).reduce((a, b) => a + (b as number), 0)}
                                    </div>
                                </div>
                                <div className="bg-slate-700 p-4 rounded">
                                    <div className="text-sm text-slate-400">Total Mentor Clicks</div>
                                    <div className="text-3xl font-bold text-purple-400 mt-2">
                                        {stats.mentors.reduce((sum, m) => sum + m.clicks, 0)}
                                    </div>
                                </div>
                                <div className="bg-slate-700 p-4 rounded">
                                    <div className="text-sm text-slate-400">Avg Clicks/Mentor</div>
                                    <div className="text-3xl font-bold text-pink-400 mt-2">
                                        {(stats.mentors.reduce((sum, m) => sum + m.clicks, 0) / stats.mentors.length).toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'features' && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">🎯 Feature Usage Details</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={featureChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Bar dataKey="clicks" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 font-bold">Feature</th>
                                        <th className="text-right py-3 px-4 font-bold">Clicks</th>
                                        <th className="text-right py-3 px-4 font-bold">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(stats.features)
                                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                                        .map(([name, clicks], idx) => (
                                            <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700 transition">
                                                <td className="py-3 px-4 font-medium">{name}</td>
                                                <td className="text-right py-3 px-4 font-bold text-indigo-400">{clicks}</td>
                                                <td className="text-right py-3 px-4 text-slate-400">
                                                    {(
                                                        ((clicks as number) /
                                                            Object.values(stats.features).reduce((a, b) => a + (b as number), 0)) *
                                                        100
                                                    ).toFixed(1)}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'slides' && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">📄 Slide Views Details</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={slideChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Bar dataKey="views" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 font-bold">Slide</th>
                                        <th className="text-right py-3 px-4 font-bold">Views</th>
                                        <th className="text-right py-3 px-4 font-bold">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slideChartData.map((slide, idx) => (
                                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700 transition">
                                            <td className="py-3 px-4 font-medium">{slide.name}</td>
                                            <td className="text-right py-3 px-4 font-bold text-green-400">{slide.views}</td>
                                            <td className="text-right py-3 px-4 text-slate-400">
                                                {((slide.views / stats.summary.total_page_views) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'mentors' && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">⭐ Mentor Popularity Details</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={mentorChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Bar dataKey="clicks" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left py-3 px-4 font-bold">Mentor</th>
                                        <th className="text-right py-3 px-4 font-bold">Total Clicks</th>
                                        <th className="text-right py-3 px-4 font-bold">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.mentors.slice(0, 30).map((mentor, idx) => (
                                        <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700 transition">
                                            <td className="py-3 px-4 font-medium">{mentor.name}</td>
                                            <td className="text-right py-3 px-4 font-bold text-yellow-400">{mentor.clicks}</td>
                                            <td className="text-right py-3 px-4 text-slate-400">
                                                {mentor.clicks > 0
                                                    ? (
                                                        (mentor.clicks /
                                                            stats.mentors.reduce((sum, m) => sum + m.clicks, 0)) *
                                                        100
                                                    ).toFixed(1)
                                                    : 0}
                                                %
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
