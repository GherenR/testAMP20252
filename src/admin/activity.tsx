import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { supabase } from '../supabaseClient';
import { History, User, Calendar, Filter, RefreshCw, Trash2, Edit, Plus, Download, Upload, Eye } from 'lucide-react';

interface ActivityLog {
    id: number;
    user_email: string;
    action: string;
    details: string | null;
    entity_type: string | null;
    entity_id: string | null;
    created_at: string;
}

export default function ActivityLogPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState<string>('All');
    const [filterEntity, setFilterEntity] = useState<string>('All');
    const [dateRange, setDateRange] = useState(7);

    useEffect(() => {
        fetchLogs();
    }, [dateRange]);

    const fetchLogs = async () => {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - dateRange);

        const { data, error } = await supabase
            .from('admin_activity_log')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false })
            .limit(500);

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    // Get unique values for filters
    const actions = ['All', ...new Set(logs.map(l => l.action))];
    const entities: string[] = ['All', ...new Set(logs.map(l => l.entity_type).filter((e): e is string => e !== null))];

    // Filter logs
    const filteredLogs = logs.filter(l => {
        if (filterAction !== 'All' && l.action !== filterAction) return false;
        if (filterEntity !== 'All' && l.entity_type !== filterEntity) return false;
        return true;
    });

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
            case 'import':
                return <Plus size={16} className="text-green-400" />;
            case 'update':
            case 'edit':
                return <Edit size={16} className="text-blue-400" />;
            case 'delete':
                return <Trash2 size={16} className="text-red-400" />;
            case 'export':
                return <Download size={16} className="text-purple-400" />;
            case 'login':
            case 'view':
                return <Eye size={16} className="text-slate-400" />;
            default:
                return <History size={16} className="text-slate-400" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
            case 'import':
                return 'bg-green-900/30 text-green-400';
            case 'update':
            case 'edit':
                return 'bg-blue-900/30 text-blue-400';
            case 'delete':
                return 'bg-red-900/30 text-red-400';
            case 'export':
                return 'bg-purple-900/30 text-purple-400';
            default:
                return 'bg-slate-700 text-slate-300';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <History size={28} /> Activity Log
                        </h1>
                        <button
                            onClick={fetchLogs}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Periode</label>
                                <select
                                    value={dateRange}
                                    onChange={e => setDateRange(Number(e.target.value))}
                                    className="px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                >
                                    <option value={1}>24 jam terakhir</option>
                                    <option value={7}>7 hari terakhir</option>
                                    <option value={30}>30 hari terakhir</option>
                                    <option value={90}>90 hari terakhir</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Action</label>
                                <select
                                    value={filterAction}
                                    onChange={e => setFilterAction(e.target.value)}
                                    className="px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                >
                                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Entity</label>
                                <select
                                    value={filterEntity}
                                    onChange={e => setFilterEntity(e.target.value)}
                                    className="px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                >
                                    {entities.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <p className="text-sm text-slate-400 ml-auto">
                                {filteredLogs.length} aktivitas
                            </p>
                        </div>
                    </div>

                    {/* Activity List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw size={32} className="animate-spin mx-auto mb-2 text-slate-400" />
                            <p className="text-slate-400">Loading activity log...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 bg-slate-800 rounded-xl">
                            <History size={48} className="mx-auto mb-3 text-slate-600" />
                            <p className="text-slate-400">Belum ada aktivitas tercatat</p>
                            <p className="text-sm text-slate-500 mt-1">Aktivitas admin akan muncul di sini</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredLogs.map(log => (
                                <div key={log.id} className="bg-slate-800 rounded-xl p-4 flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action.toUpperCase()}
                                            </span>
                                            {log.entity_type && (
                                                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
                                                    {log.entity_type}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm mt-1 text-slate-300">
                                            {log.details || 'No details'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {log.user_email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(log.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
