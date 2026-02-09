import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import {
    getAllMentors,
    createMentor,
    updateMentor,
    deleteMentor,
    MentorDB,
    MentorInput
} from '../mentorService';
import { Database, Search, Edit2, Save, X, Plus, Trash2, Phone, Mail, Instagram, Award, RefreshCw, AlertCircle, Check } from 'lucide-react';
import type { InstitutionCategory } from '../types';

export default function AlumniEditorPage() {
    const [alumni, setAlumni] = useState<MentorDB[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAlumni, setEditingAlumni] = useState<MentorDB | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [newAlumni, setNewAlumni] = useState<MentorInput>({
        name: '',
        university: '',
        major: '',
        category: 'PTN',
        angkatan: 2025,
        path: 'SNBP',
        whatsapp: '',
        instagram: '',
        email: '',
        achievements: [],
    });
    const [newAchievement, setNewAchievement] = useState('');
    const [editAchievement, setEditAchievement] = useState('');

    // Load alumni from Supabase
    const loadAlumni = useCallback(async () => {
        setLoading(true);
        const { data, error } = await getAllMentors();
        if (error) {
            showMessage('error', `Gagal memuat data: ${error}`);
        } else if (data) {
            setAlumni(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAlumni();
    }, [loadAlumni]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const filteredAlumni = alumni.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(a.id).includes(searchTerm) ||
        String(a.angkatan).includes(searchTerm)
    );

    const handleEdit = (alumnus: MentorDB) => {
        setEditingAlumni({ ...alumnus });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingAlumni) return;
        setSaving(true);

        const { data, error } = await updateMentor(editingAlumni.id, {
            name: editingAlumni.name,
            university: editingAlumni.university,
            major: editingAlumni.major,
            category: editingAlumni.category,
            angkatan: editingAlumni.angkatan,
            path: editingAlumni.path,
            whatsapp: editingAlumni.whatsapp || undefined,
            instagram: editingAlumni.instagram || undefined,
            email: editingAlumni.email || undefined,
            achievements: editingAlumni.achievements,
        });

        if (error) {
            showMessage('error', `Gagal update: ${error}`);
        } else if (data) {
            setAlumni(prev => prev.map(a => (a.id === data.id ? data : a)));
            setShowEditModal(false);
            setEditingAlumni(null);
            showMessage('success', 'Data alumni berhasil diperbarui!');
        }
        setSaving(false);
    };

    const handleAddAlumni = async () => {
        if (!newAlumni.name || !newAlumni.university) {
            showMessage('error', 'Nama dan universitas wajib diisi');
            return;
        }

        setSaving(true);
        const { data, error } = await createMentor(newAlumni);

        if (error) {
            showMessage('error', `Gagal menambahkan: ${error}`);
        } else if (data) {
            setAlumni(prev => [data, ...prev]);
            setShowAddModal(false);
            setNewAlumni({
                name: '',
                university: '',
                major: '',
                category: 'PTN',
                angkatan: 2025,
                path: 'SNBP',
                whatsapp: '',
                instagram: '',
                email: '',
                achievements: [],
            });
            showMessage('success', 'Alumni baru berhasil ditambahkan!');
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus alumni ini? Tindakan ini tidak bisa dibatalkan.')) return;

        setSaving(true);
        const { error } = await deleteMentor(id);

        if (error) {
            showMessage('error', `Gagal menghapus: ${error}`);
        } else {
            setAlumni(prev => prev.filter(a => a.id !== id));
            showMessage('success', 'Alumni berhasil dihapus!');
        }
        setSaving(false);
    };

    const addAchievementToNew = () => {
        if (newAchievement.trim()) {
            setNewAlumni(prev => ({
                ...prev,
                achievements: [...(prev.achievements || []), newAchievement.trim()]
            }));
            setNewAchievement('');
        }
    };

    const removeAchievementFromNew = (index: number) => {
        setNewAlumni(prev => ({
            ...prev,
            achievements: prev.achievements?.filter((_, i) => i !== index) || []
        }));
    };

    const addAchievementToEdit = () => {
        if (editAchievement.trim() && editingAlumni) {
            setEditingAlumni({
                ...editingAlumni,
                achievements: [...editingAlumni.achievements, editAchievement.trim()]
            });
            setEditAchievement('');
        }
    };

    const removeAchievementFromEdit = (index: number) => {
        if (editingAlumni) {
            setEditingAlumni({
                ...editingAlumni,
                achievements: editingAlumni.achievements.filter((_, i) => i !== index)
            });
        }
    };

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            <Database size={28} /> Alumni Database
                        </h1>
                        <div className="flex gap-2">
                            <button
                                onClick={loadAlumni}
                                disabled={loading}
                                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center gap-2"
                            >
                                <Plus size={20} /> Tambah
                            </button>
                        </div>
                    </div>

                    {/* Message Toast */}
                    {message && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-900/50 border border-green-500 text-green-300'
                            : 'bg-red-900/50 border border-red-500 text-red-300'
                            }`}>
                            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, universitas, jurusan, angkatan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Stats */}
                    <div className="mb-4 text-sm text-slate-400">
                        Menampilkan {filteredAlumni.length} dari {alumni.length} alumni
                    </div>

                    {/* List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw size={48} className="mx-auto mb-4 animate-spin text-slate-400" />
                            <p className="text-slate-400">Memuat data dari database...</p>
                        </div>
                    ) : filteredAlumni.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Database size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Tidak ada data alumni ditemukan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAlumni.map((a) => (
                                <div key={a.id} className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700/50 transition overflow-hidden">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded font-mono">
                                                    #{a.id}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${a.category === 'PTN' ? 'bg-blue-600' :
                                                    a.category === 'PTS' ? 'bg-green-600' : 'bg-purple-600'
                                                    }`}>
                                                    {a.category}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    Angkatan {a.angkatan}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg truncate">{a.name}</h3>
                                            <p className="text-sm text-slate-300 truncate">
                                                {a.university} - {a.major}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 truncate">
                                                Jalur: {a.path}
                                            </p>

                                            {/* Contact Info */}
                                            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs overflow-hidden">
                                                {a.whatsapp && (
                                                    <span className="flex items-center gap-1 text-green-400 truncate max-w-[150px] sm:max-w-none">
                                                        <Phone size={12} className="flex-shrink-0" /> <span className="truncate">{a.whatsapp.replace('wa.me/', '')}</span>
                                                    </span>
                                                )}
                                                {a.instagram && (
                                                    <span className="flex items-center gap-1 text-pink-400 truncate max-w-[120px] sm:max-w-none">
                                                        <Instagram size={12} className="flex-shrink-0" /> @{a.instagram}
                                                    </span>
                                                )}
                                            </div>
                                            {a.email && (
                                                <span className="flex items-center gap-1 text-blue-400 truncate text-xs mt-1">
                                                    <Mail size={12} className="flex-shrink-0" /> {a.email}
                                                </span>
                                            )}

                                            {/* Achievements */}
                                            {a.achievements && a.achievements.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-1 text-yellow-400 text-xs mb-1">
                                                        <Award size={12} /> Prestasi:
                                                    </div>
                                                    <ul className="text-xs text-slate-400 list-disc list-inside">
                                                        {a.achievements.slice(0, 2).map((ach, i) => (
                                                            <li key={i} className="truncate">{ach}</li>
                                                        ))}
                                                        {a.achievements.length > 2 && (
                                                            <li className="text-slate-500">+{a.achievements.length - 2} lainnya</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions - horizontal on mobile, vertical on desktop */}
                                        <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700">
                                            <button
                                                onClick={() => handleEdit(a)}
                                                className="flex-1 sm:flex-none p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                                <span className="sm:hidden">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                className="flex-1 sm:flex-none p-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 text-sm"
                                                title="Hapus"
                                            >
                                                <Trash2 size={18} />
                                                <span className="sm:hidden">Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Edit Modal */}
                    {showEditModal && editingAlumni && (
                        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                            <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Edit2 size={20} /> Edit Alumni
                                    </h2>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* ID (readonly) */}
                                    <div>
                                        <label className="text-sm text-slate-400">ID Database</label>
                                        <input
                                            type="text"
                                            value={`#${editingAlumni.id}`}
                                            disabled
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg opacity-50"
                                        />
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="text-sm text-slate-400">Nama *</label>
                                        <input
                                            type="text"
                                            value={editingAlumni.name}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, name: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* University */}
                                    <div>
                                        <label className="text-sm text-slate-400">Universitas *</label>
                                        <input
                                            type="text"
                                            value={editingAlumni.university}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, university: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Major */}
                                    <div>
                                        <label className="text-sm text-slate-400">Jurusan *</label>
                                        <input
                                            type="text"
                                            value={editingAlumni.major}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, major: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Category & Angkatan */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-400">Kategori</label>
                                            <select
                                                value={editingAlumni.category}
                                                onChange={(e) => setEditingAlumni({ ...editingAlumni, category: e.target.value as InstitutionCategory })}
                                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                            >
                                                <option value="PTN">PTN</option>
                                                <option value="PTS">PTS</option>
                                                <option value="PTLN">PTLN</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">Angkatan</label>
                                            <input
                                                type="number"
                                                value={editingAlumni.angkatan}
                                                onChange={(e) => setEditingAlumni({ ...editingAlumni, angkatan: parseInt(e.target.value) || 2025 })}
                                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    {/* Path */}
                                    <div>
                                        <label className="text-sm text-slate-400">Jalur Masuk</label>
                                        <input
                                            type="text"
                                            value={editingAlumni.path}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, path: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Phone size={14} /> WhatsApp</label>
                                        <input
                                            type="text"
                                            value={editingAlumni.whatsapp || ''}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, whatsapp: e.target.value })}
                                            placeholder="wa.me/628xxx"
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Instagram size={14} /> Instagram</label>
                                        <input
                                            type="text"
                                            value={editingAlumni.instagram || ''}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, instagram: e.target.value })}
                                            placeholder="username (tanpa @)"
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Mail size={14} /> Email</label>
                                        <input
                                            type="email"
                                            value={editingAlumni.email || ''}
                                            onChange={(e) => setEditingAlumni({ ...editingAlumni, email: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    {/* Achievements */}
                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Award size={14} /> Prestasi</label>
                                        <div className="space-y-2 mb-2">
                                            {editingAlumni.achievements.map((ach, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={ach}
                                                        onChange={(e) => {
                                                            const newAch = [...editingAlumni.achievements];
                                                            newAch[i] = e.target.value;
                                                            setEditingAlumni({ ...editingAlumni, achievements: newAch });
                                                        }}
                                                        className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm"
                                                    />
                                                    <button
                                                        onClick={() => removeAchievementFromEdit(i)}
                                                        className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editAchievement}
                                                onChange={(e) => setEditAchievement(e.target.value)}
                                                placeholder="Tambah prestasi baru..."
                                                className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm"
                                                onKeyDown={(e) => e.key === 'Enter' && addAchievementToEdit()}
                                            />
                                            <button
                                                onClick={addAchievementToEdit}
                                                className="px-3 bg-green-600 hover:bg-green-700 rounded-lg"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="sticky bottom-0 bg-slate-800 p-4 border-t border-slate-700">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2"
                                    >
                                        {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                            <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Plus size={20} /> Tambah Alumni Baru
                                    </h2>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="text-sm text-slate-400">Nama *</label>
                                        <input
                                            type="text"
                                            value={newAlumni.name}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, name: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* University */}
                                    <div>
                                        <label className="text-sm text-slate-400">Universitas *</label>
                                        <input
                                            type="text"
                                            value={newAlumni.university}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, university: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Major */}
                                    <div>
                                        <label className="text-sm text-slate-400">Jurusan *</label>
                                        <input
                                            type="text"
                                            value={newAlumni.major}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, major: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Category & Angkatan */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-400">Kategori</label>
                                            <select
                                                value={newAlumni.category}
                                                onChange={(e) => setNewAlumni({ ...newAlumni, category: e.target.value as InstitutionCategory })}
                                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                            >
                                                <option value="PTN">PTN</option>
                                                <option value="PTS">PTS</option>
                                                <option value="PTLN">PTLN</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">Angkatan</label>
                                            <input
                                                type="number"
                                                value={newAlumni.angkatan}
                                                onChange={(e) => setNewAlumni({ ...newAlumni, angkatan: parseInt(e.target.value) || 2025 })}
                                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    {/* Path */}
                                    <div>
                                        <label className="text-sm text-slate-400">Jalur Masuk</label>
                                        <select
                                            value={newAlumni.path}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, path: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        >
                                            <option value="SNBP">SNBP</option>
                                            <option value="SNBT">SNBT</option>
                                            <option value="Mandiri">Mandiri</option>
                                            <option value="Beasiswa">Beasiswa</option>
                                            <option value="Reguler">Reguler</option>
                                        </select>
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Phone size={14} /> WhatsApp</label>
                                        <input
                                            type="text"
                                            value={newAlumni.whatsapp}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, whatsapp: e.target.value })}
                                            placeholder="wa.me/628xxx"
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Instagram size={14} /> Instagram</label>
                                        <input
                                            type="text"
                                            value={newAlumni.instagram}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, instagram: e.target.value })}
                                            placeholder="username (tanpa @)"
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Mail size={14} /> Email</label>
                                        <input
                                            type="email"
                                            value={newAlumni.email}
                                            onChange={(e) => setNewAlumni({ ...newAlumni, email: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg"
                                        />
                                    </div>

                                    {/* Achievements */}
                                    <div>
                                        <label className="text-sm text-slate-400 flex items-center gap-1"><Award size={14} /> Prestasi</label>
                                        <div className="space-y-2 mb-2">
                                            {newAlumni.achievements?.map((ach, i) => (
                                                <div key={i} className="flex gap-2 items-center bg-slate-900 p-2 rounded-lg">
                                                    <span className="flex-1 text-sm">{ach}</span>
                                                    <button
                                                        onClick={() => removeAchievementFromNew(i)}
                                                        className="p-1 text-red-400 hover:bg-red-600/20 rounded"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newAchievement}
                                                onChange={(e) => setNewAchievement(e.target.value)}
                                                placeholder="Tambah prestasi..."
                                                className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm"
                                                onKeyDown={(e) => e.key === 'Enter' && addAchievementToNew()}
                                            />
                                            <button
                                                onClick={addAchievementToNew}
                                                className="px-3 bg-green-600 hover:bg-green-700 rounded-lg"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="sticky bottom-0 bg-slate-800 p-4 border-t border-slate-700">
                                    <button
                                        onClick={handleAddAlumni}
                                        disabled={saving}
                                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2"
                                    >
                                        {saving ? <RefreshCw size={20} className="animate-spin" /> : <Plus size={20} />}
                                        {saving ? 'Menyimpan...' : 'Tambah Alumni'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
