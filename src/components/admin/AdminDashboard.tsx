import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ClipboardList, FileText, HeartPulse, StickyNote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { secureFetch } from '../../utils/security';
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
    // Admin helpers state
    interface ActivityLogEntry { id: number; action: string; created_at: string;[key: string]: any }
    interface Notification { id: number; message: string; created_at: string;[key: string]: any }
    interface PendingApproval { id: number; user_id: string; created_at: string;[key: string]: any }
    interface ErrorLog { id: number; error: string; created_at: string;[key: string]: any }

    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [systemHealth, setSystemHealth] = useState<{ db: boolean; api: boolean }>({ db: true, api: true });
    const [adminNotes, setAdminNotes] = useState<string>('');

    useEffect(() => {
        loadData();
        const fetchHelpers = async () => {
            try {
                // Activity Log
                const { data: logData } = await supabase
                    .from('admin_activity_log')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (logData && logData.length > 0) {
                    setActivityLog(
                        logData.map(l => ({
                            id: l.id,
                            action: l.action,
                            created_at: l.created_at,
                            user_email: l.user_email,
                            detail: l.detail,
                        }))
                    );
                }

                // Notifications
                const { data: notifData } = await supabase
                    .from('admin_notifications')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (notifData && notifData.length > 0) {
                    setNotifications(
                        notifData.map(n => ({
                            id: n.id,
                            message: n.message,
                            created_at: n.created_at,
                            type: n.type,
                        }))
                    );
                }

                // Pending Approvals
                const { data: approvalData } = await supabase
                    .from('admin_pending_approvals')
                    .select('*')
                    .order('submitted_at', { ascending: false })
                    .limit(10);
                if (approvalData && approvalData.length > 0) {
                    setPendingApprovals(
                        approvalData.map(p => ({
                            id: p.id,
                            user_id: p.user_id,
                            created_at: p.submitted_at,
                            type: p.type,
                            name: p.name,
                        }))
                    );
                }

                // Error Logs
                const { data: errorData } = await supabase
                    .from('admin_error_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (errorData && errorData.length > 0) {
                    setErrorLogs(
                        errorData.map(e => ({
                            id: e.id,
                            error: e.error,
                            created_at: e.created_at,
                            type: e.type,
                            message: e.message,
                        }))
                    );
                }

                // Admin Notes (single row)
                const { data: notesData } = await supabase
                    .from('admin_notes')
                    .select('*')
                    .order('updated_at', { ascending: false })
                    .limit(1);
                if (notesData && notesData[0]?.note) {
                    setAdminNotes(notesData[0].note);
                }

                // System Health
                let dbOk = true;
                let apiOk = true;
                try {
                    await supabase.from('admin_activity_log').select('id').limit(1);
                } catch {
                    dbOk = false;
                }
                try {
                    await secureFetch('/api/analytics/stats/platform?days=1');
                } catch {
                    apiOk = false;
                }
                setSystemHealth({ db: dbOk, api: apiOk });
            } catch (err) {
                console.error('[AdminDashboard] fetchHelpers error:', err);
                // Don't wipe existing data on error
            }
        };
        fetchHelpers();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) setUser(authUser);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const startDateStr = startDate.toISOString();

            const [pvResult, fcResult, miResult] = await Promise.all([
                supabase.from('page_views').select('user_id', { count: 'exact' }).gte('viewed_at', startDateStr),
                supabase.from('feature_clicks').select('*', { count: 'exact' }).gte('clicked_at', startDateStr),
                supabase.from('mentor_interactions').select('*', { count: 'exact' }).gte('interacted_at', startDateStr),
            ]);

            // Only update stats if we got actual results (not RLS blocked)
            if (pvResult.data || fcResult.data || miResult.data) {
                const uniqueVisitors = new Set(pvResult.data?.map(pv => pv.user_id) || []).size;
                setStats({
                    totalVisitors: uniqueVisitors,
                    totalPageViews: pvResult.count || 0,
                    totalFeatureClicks: fcResult.count || 0,
                    totalMentorInteractions: miResult.count || 0,
                });
            }
        } catch (error) {
            console.error('[AdminDashboard] loadData error:', error);
            // Don't wipe existing stats on error
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        { label: 'Import CSV', description: 'Upload data alumni baru', icon: Upload, href: '/admin/import', color: 'from-orange-600 to-orange-700' },
        { label: 'Analytics', description: 'Lihat statistik lengkap', icon: BarChart3, href: '/admin/analytics', color: 'from-blue-600 to-blue-700' },
        { label: 'Alumni Database', description: 'Kelola data alumni', icon: Database, href: '/admin/alumni', color: 'from-green-600 to-green-700' },
        { label: 'User Management', description: 'Kelola user & admin', icon: Users, href: '/admin/users', color: 'from-pink-600 to-pink-700' },
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
                {/* Admin Helper Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-10 mb-10">
                    {/* Activity Log */}
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3 font-bold text-indigo-400"><ClipboardList size={18} /> Activity Log</div>
                        <ul className="text-sm text-slate-300 space-y-2">
                            {activityLog.length === 0 && <li className="text-slate-500">No recent activity</li>}
                            {activityLog.map((log, i) => (
                                <li key={i} className="flex flex-col">
                                    <span><span className="font-semibold">{log.user}</span> {log.type} {log.detail && <span>- {log.detail}</span>}</span>
                                    <span className="text-xs text-slate-500">{log.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Notifications */}
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3 font-bold text-green-400"><CheckCircle size={18} /> Notifications</div>
                        <ul className="text-sm text-slate-300 space-y-2">
                            {notifications.length === 0 && <li className="text-slate-500">No notifications</li>}
                            {notifications.map((n, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    {n.type === 'warning' ? <AlertTriangle size={14} className="text-yellow-400" /> : <CheckCircle size={14} className="text-green-400" />}
                                    <span>{n.message}</span>
                                    <span className="ml-auto text-xs text-slate-500">{n.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pending Approvals */}
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3 font-bold text-yellow-400"><ClipboardList size={18} /> Pending Approvals</div>
                        <ul className="text-sm text-slate-300 space-y-2">
                            {pendingApprovals.length === 0 && <li className="text-slate-500">No pending approvals</li>}
                            {pendingApprovals.map((p, i) => (
                                <li key={i} className="flex flex-col">
                                    <span>{p.type === 'user' ? 'User' : p.type}: <span className="font-semibold">{p.name}</span></span>
                                    <span className="text-xs text-slate-500">Submitted: {p.submitted}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Error/Access Logs */}
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3 font-bold text-red-400"><FileText size={18} /> Error/Access Logs</div>
                        <ul className="text-sm text-slate-300 space-y-2">
                            {errorLogs.length === 0 && <li className="text-slate-500">No errors or unauthorized attempts</li>}
                            {errorLogs.map((e, i) => (
                                <li key={i} className="flex flex-col">
                                    <span>{e.type === 'unauthorized' ? 'Unauthorized' : 'Error'}: {e.message}</span>
                                    <span className="text-xs text-slate-500">{e.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Health */}
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3 font-bold text-pink-400"><HeartPulse size={18} /> System Health</div>
                        <ul className="text-sm text-slate-300 space-y-2">
                            <li>Database: <span className={systemHealth.db ? 'text-green-400' : 'text-red-400'}>{systemHealth.db ? 'Online' : 'Offline'}</span></li>
                            <li>API: <span className={systemHealth.api ? 'text-green-400' : 'text-red-400'}>{systemHealth.api ? 'Online' : 'Offline'}</span></li>
                        </ul>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-3 font-bold text-blue-400"><StickyNote size={18} /> Admin Notes</div>
                        <textarea
                            className="w-full min-h-[80px] bg-slate-700 border border-slate-600 rounded p-2 text-slate-200"
                            value={adminNotes}
                            onChange={async e => {
                                setAdminNotes(e.target.value);
                                // Update admin_notes (single row, id=1)
                                await supabase.from('admin_notes').update({ note: e.target.value, updated_at: new Date().toISOString() }).eq('id', 1);
                            }}
                        />
                        <div className="text-xs text-slate-500 mt-1">Catatan ini dapat diedit oleh semua admin.</div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
