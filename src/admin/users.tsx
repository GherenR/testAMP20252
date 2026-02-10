import React, { useEffect, useState } from 'react';
import { UserService, User } from '../services/UserService';
import axios from 'axios';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { Plus, Edit, Trash2, UserCheck, Shield, ShieldCheck, Search, Filter, X, Users } from 'lucide-react';
import { logUserCreate, logUserUpdate, logUserDelete } from '../utils/activityLogger';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function UserManagementPage() {
    const { adminRole } = useAdminAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState({ email: '', full_name: '', role: 'user', password: '' });
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Filter users based on search and role
        let result = users;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                u.email?.toLowerCase().includes(query) ||
                u.full_name?.toLowerCase().includes(query) ||
                u.kelas?.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== 'all') {
            result = result.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(result);
    }, [users, searchQuery, roleFilter]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch {
            setMessage('Gagal memuat data user');
        }
        setLoading(false);
    }

    function openEdit(user: User) {
        setEditingUser(user);
        setForm({
            email: user.email,
            full_name: user.full_name || '',
            role: user.role || 'user',
            password: ''
        });
        setShowForm(true);
    }

    function openAdd() {
        setForm({ email: '', full_name: '', role: 'user', password: '' });
        setShowAddForm(true);
    }

    async function handleRoleChange(userId: string, newRole: string) {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Prevent changing super_admin if not super_admin
        if (user.role === 'super_admin' && adminRole !== 'super_admin') {
            setMessage('❌ Hanya Super Admin yang bisa mengubah role Super Admin');
            return;
        }

        // Prevent setting super_admin if not super_admin
        if (newRole === 'super_admin' && adminRole !== 'super_admin') {
            setMessage('❌ Hanya Super Admin yang bisa membuat Super Admin baru');
            return;
        }

        try {
            await UserService.updateUserRole(userId, newRole);
            setMessage(`✅ Role ${user.email} berhasil diubah ke ${newRole}`);
            logUserUpdate(user.email, `role=${newRole}`);
            fetchUsers();
        } catch {
            setMessage('❌ Gagal mengubah role');
        }
    }

    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingUser) return;

        setMessage('');
        try {
            await UserService.updateUser(editingUser.id, {
                full_name: form.full_name,
                role: form.role,
            });
            setMessage('✅ User berhasil diupdate');
            logUserUpdate(form.email, `name=${form.full_name}, role=${form.role}`);
        } catch {
            setMessage('❌ Gagal update user');
        }
        setShowForm(false);
        fetchUsers();
    }

    async function handleAddSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage('');

        try {
            // Create user via API (requires Supabase Admin API)
            const res = await axios.post('/api/admin/createUser', {
                email: form.email,
                name: form.full_name,
                role: form.role,
                password: form.password,
            });
            if (res?.data?.success) {
                setMessage('✅ User berhasil ditambah');
                logUserCreate(form.email, form.role);
            }
        } catch (err: any) {
            const errorData = err?.response?.data?.error;
            let errorMsg = 'Gagal tambah user';

            if (err?.response?.status === 404) {
                errorMsg = 'API tidak ditemukan. Pastikan sudah deploy ke Vercel.';
            } else if (typeof errorData === 'string') {
                errorMsg = errorData;
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            } else if (err?.message) {
                errorMsg = err.message;
            }

            setMessage(`❌ ${errorMsg}`);
        }
        setShowAddForm(false);
        fetchUsers();
    }

    async function handleDelete(id: string) {
        const userToDelete = users.find(u => u.id === id);

        // Prevent deleting super_admin if not super_admin
        if (userToDelete?.role === 'super_admin' && adminRole !== 'super_admin') {
            setMessage('❌ Hanya Super Admin yang bisa menghapus Super Admin');
            return;
        }

        if (!window.confirm(`Hapus user ${userToDelete?.email}?`)) return;

        try {
            await UserService.deleteUser(id);
            setMessage('✅ User berhasil dihapus');
            if (userToDelete) {
                logUserDelete(userToDelete.email);
            }
        } catch {
            setMessage('❌ Gagal hapus user');
        }
        fetchUsers();
    }

    function getRoleBadge(role: string) {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <ShieldCheck size={12} /> Super Admin
                    </span>
                );
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Shield size={12} /> Admin
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
                        <Users size={12} /> User
                    </span>
                );
        }
    }

    const userCount = users.filter(u => u.role === 'user').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const superAdminCount = users.filter(u => u.role === 'super_admin').length;

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <UserCheck size={28} /> Manajemen User
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Kelola semua pengguna SNBT Area
                            </p>
                        </div>
                        <button
                            onClick={openAdd}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus size={18} /> Tambah User
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-600/50 rounded-lg">
                                    <Users size={20} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{userCount}</p>
                                    <p className="text-slate-400 text-sm">User Biasa</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/20 rounded-lg">
                                    <Shield size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{adminCount}</p>
                                    <p className="text-slate-400 text-sm">Admin</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600/20 rounded-lg">
                                    <ShieldCheck size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{superAdminCount}</p>
                                    <p className="text-slate-400 text-sm">Super Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm border ${message.includes('✅')
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari email, nama, atau kelas..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-400" />
                            <select
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 outline-none"
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Semua Role</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            Tidak ada user ditemukan
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-700">
                            <table className="min-w-full bg-slate-800/50">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-slate-700">
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Kelas</th>
                                        <th className="p-4 font-medium">Target PTN</th>
                                        <th className="p-4 font-medium">Role</th>
                                        <th className="p-4 font-medium">Terdaftar</th>
                                        <th className="p-4 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{user.full_name || '-'}</p>
                                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    <p>{user.kelas || '-'}</p>
                                                    <p className="text-slate-400">{user.angkatan ? `Angkatan ${user.angkatan}` : ''}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {user.target_university_1 ? (
                                                        <>
                                                            <p>{user.target_university_1}</p>
                                                            <p className="text-slate-400">{user.target_major_1}</p>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={user.role || 'user'}
                                                    onChange={e => handleRoleChange(user.id, e.target.value)}
                                                    className="bg-transparent border-none text-sm cursor-pointer focus:outline-none"
                                                    disabled={user.role === 'super_admin' && adminRole !== 'super_admin'}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    {adminRole === 'super_admin' && (
                                                        <option value="super_admin">Super Admin</option>
                                                    )}
                                                </select>
                                                <div className="mt-1">
                                                    {getRoleBadge(user.role || 'user')}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEdit(user)}
                                                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Hapus"
                                                        disabled={user.role === 'super_admin' && adminRole !== 'super_admin'}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Edit Modal */}
                    {showForm && editingUser && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <form onSubmit={handleEditSubmit} className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Edit User</h2>
                                    <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300"
                                        value={form.email}
                                        disabled
                                    />
                                    <p className="text-slate-500 text-xs mt-1">Email tidak bisa diubah</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-indigo-500 outline-none"
                                        value={form.full_name}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-slate-400 text-sm mb-2">Role</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-indigo-500 outline-none"
                                        value={form.role}
                                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                        disabled={editingUser.role === 'super_admin' && adminRole !== 'super_admin'}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        {adminRole === 'super_admin' && (
                                            <option value="super_admin">Super Admin</option>
                                        )}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Add Modal */}
                    {showAddForm && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <form onSubmit={handleAddSubmit} className="bg-slate-800 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Tambah User Baru</h2>
                                    <button type="button" onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-indigo-500 outline-none"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-indigo-500 outline-none"
                                        value={form.full_name}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2">Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-indigo-500 outline-none"
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-slate-500 text-xs mt-1">Minimal 6 karakter</p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-slate-400 text-sm mb-2">Role</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-indigo-500 outline-none"
                                        value={form.role}
                                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        {adminRole === 'super_admin' && (
                                            <option value="super_admin">Super Admin</option>
                                        )}
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
                                    >
                                        Tambah User
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
                                        onClick={() => setShowAddForm(false)}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
