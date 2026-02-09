import React, { useEffect, useState } from 'react';
import { UserService } from '../services/UserService';
import axios from 'axios';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

interface UserRow {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ email: '', name: '', role: 'user', password: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        try {
            const data = await UserService.getAllUsers();
            setUsers(data);
        } catch {
            setMessage('Gagal memuat data user');
        }
        setLoading(false);
    }

    function openEdit(user: UserRow) {
        setEditingUser(user);
        setForm({ email: user.email, name: user.name, role: user.role, password: '' });
        setShowForm(true);
    }

    function openAdd() {
        setEditingUser(null);
        setForm({ email: '', name: '', role: 'user', password: '' });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage('');
        try {
            if (editingUser) {
                await UserService.updateUser(editingUser.id, {
                    email: form.email,
                    name: form.name,
                    role: form.role,
                });
                setMessage('User berhasil diupdate');
            } else {
                // Panggil API admin untuk create user via Supabase Auth Admin API
                const res = await axios.post('/api/admin/createUser', {
                    email: form.email,
                    name: form.name,
                    role: form.role,
                    password: form.password,
                }).catch((err) => {
                    // Tangani error 404 atau error lain
                    if (err?.response?.status === 404) {
                        setMessage('API /api/admin/createUser tidak ditemukan. Fitur ini hanya berjalan di Next.js/Vercel, bukan di Vite.');
                    } else {
                        setMessage(err?.response?.data?.error || 'Gagal tambah user');
                    }
                    throw err;
                });
                if (res && res.data && res.data.user) {
                    setMessage('User berhasil ditambah');
                }
            }
        } catch (err: any) {
            if (!editingUser && !message) setMessage('Gagal tambah user');
            if (editingUser) setMessage('Gagal update user');
        }
        setShowForm(false);
        fetchUsers();
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Hapus user ini?')) return;
        try {
            await UserService.deleteUser(id);
            setMessage('User berhasil dihapus');
        } catch {
            setMessage('Gagal hapus user');
        }
        fetchUsers();
    }

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <UserCheck size={28} /> User & Admin Management
                    </h1>
                    {message && <div className="mb-4 p-3 rounded-lg text-sm bg-slate-800 border border-slate-600">{message}</div>}
                    <button onClick={openAdd} className="mb-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold flex items-center gap-2">
                        <Plus size={18} /> Tambah User
                    </button>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-slate-800 rounded-lg">
                                <thead>
                                    <tr className="text-left text-slate-400">
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Nama</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Dibuat</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-slate-700">
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">{user.name}</td>
                                            <td className="p-3">{user.role}</td>
                                            <td className="p-3">{new Date(user.created_at).toLocaleString('id-ID')}</td>
                                            <td className="p-3 flex gap-2">
                                                <button onClick={() => openEdit(user)} className="text-blue-400 hover:underline flex items-center gap-1"><Edit size={16} />Edit</button>
                                                <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:underline flex items-center gap-1"><Trash2 size={16} />Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700">
                                <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Tambah User'}</h2>
                                <div className="mb-3">
                                    <label className="block text-slate-400 mb-1">Email</label>
                                    <input type="email" className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-slate-400 mb-1">Nama</label>
                                    <input type="text" className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-slate-400 mb-1">Role</label>
                                    <select className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                {!editingUser && (
                                    <div className="mb-3">
                                        <label className="block text-slate-400 mb-1">Password</label>
                                        <input type="password" className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                    </div>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-bold">Simpan</button>
                                    <button type="button" className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded font-bold" onClick={() => setShowForm(false)}>Batal</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
