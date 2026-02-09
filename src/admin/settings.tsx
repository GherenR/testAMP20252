import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { Settings, User, Shield, Key, Bell, Palette } from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');

    // Profile form
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Security form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notifications
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [analyticsReports, setAnalyticsReports] = useState(true);

    // Appearance
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
                    role: authUser.user_metadata?.role || 'user',
                    createdAt: authUser.created_at,
                });
                setName(authUser.user_metadata?.name || '');
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.updateUser({
                data: { name }
            });
            if (error) throw error;
            setMessage('✅ Profil berhasil diperbarui');
            loadUserProfile();
        } catch (error: any) {
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage('❌ Password baru tidak cocok');
            return;
        }
        if (newPassword.length < 6) {
            setMessage('❌ Password minimal 6 karakter');
            return;
        }

        setSaving(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            setMessage('✅ Password berhasil diperbarui');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Keamanan', icon: Shield },
        { id: 'notifications', label: 'Notifikasi', icon: Bell },
        { id: 'appearance', label: 'Tampilan', icon: Palette },
    ];

    if (loading) {
        return (
            <RequireAdmin>
                <DashboardLayout>
                    <div className="p-6 text-center">Loading...</div>
                </DashboardLayout>
            </RequireAdmin>
        );
    }

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
                        <Settings size={28} /> Pengaturan
                    </h1>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'
                            }`}>
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Tabs */}
                        <div className="lg:w-64 flex lg:flex-col gap-2 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-left whitespace-nowrap transition ${activeTab === tab.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-800 hover:bg-slate-700'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-800 rounded-xl p-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Profil Admin</h2>
                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm mb-1 text-slate-400">Email</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-slate-400">Nama</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-slate-400">Role</label>
                                            <div className="px-4 py-2 bg-slate-700 rounded border border-slate-600">
                                                <span className="px-2 py-1 bg-indigo-600 rounded text-sm font-bold">
                                                    {user?.role?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-slate-400">Bergabung Sejak</label>
                                            <input
                                                type="text"
                                                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : ''}
                                                disabled
                                                className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 text-slate-400"
                                            />
                                        </div>
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={saving}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold"
                                        >
                                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Keamanan Akun</h2>
                                    <div className="space-y-4 max-w-md">
                                        <div className="p-4 bg-slate-700 rounded-lg mb-6">
                                            <div className="flex items-center gap-2 text-green-400 mb-2">
                                                <Key size={18} />
                                                <span className="font-bold">Ganti Password</span>
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                Pastikan password baru minimal 6 karakter dan berbeda dari sebelumnya.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-slate-400">Password Baru</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-slate-400">Konfirmasi Password Baru</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600"
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={saving || !newPassword || !confirmPassword}
                                            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold disabled:opacity-50"
                                        >
                                            {saving ? 'Memproses...' : 'Ubah Password'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Pengaturan Notifikasi</h2>
                                    <div className="space-y-4 max-w-md">
                                        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                                            <div>
                                                <div className="font-medium">Email Notifikasi</div>
                                                <div className="text-sm text-slate-400">Terima update penting via email</div>
                                            </div>
                                            <button
                                                onClick={() => setEmailNotifications(!emailNotifications)}
                                                className={`w-12 h-6 rounded-full transition ${emailNotifications ? 'bg-green-600' : 'bg-slate-600'
                                                    } relative`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${emailNotifications ? 'right-1' : 'left-1'
                                                    }`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                                            <div>
                                                <div className="font-medium">Laporan Analytics</div>
                                                <div className="text-sm text-slate-400">Terima laporan mingguan</div>
                                            </div>
                                            <button
                                                onClick={() => setAnalyticsReports(!analyticsReports)}
                                                className={`w-12 h-6 rounded-full transition ${analyticsReports ? 'bg-green-600' : 'bg-slate-600'
                                                    } relative`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${analyticsReports ? 'right-1' : 'left-1'
                                                    }`} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            * Fitur notifikasi akan aktif setelah integrasi email service.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Tampilan</h2>
                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm mb-2 text-slate-400">Tema</label>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setTheme('dark')}
                                                    className={`flex-1 p-4 rounded-lg border-2 transition ${theme === 'dark' ? 'border-indigo-500 bg-slate-700' : 'border-slate-600 bg-slate-800'
                                                        }`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-1">🌙</div>
                                                        <div className="font-medium">Dark</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setTheme('light')}
                                                    className={`flex-1 p-4 rounded-lg border-2 transition ${theme === 'light' ? 'border-indigo-500 bg-slate-700' : 'border-slate-600 bg-slate-800'
                                                        }`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-1">☀️</div>
                                                        <div className="font-medium">Light</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            * Tema light akan tersedia di update mendatang.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
