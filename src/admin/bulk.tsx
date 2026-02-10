import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { getAllMentors, MentorDB } from '../mentorService';
import { supabase } from '../supabaseClient';
import {
    Settings2, Trash2, Tag, Check, X, Search, Filter,
    CheckSquare, Square, Loader2, AlertTriangle, Edit, RefreshCw
} from 'lucide-react';

export default function BulkOperationsPage() {
    const [mentors, setMentors] = useState<MentorDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterAngkatan, setFilterAngkatan] = useState<string>('All');

    // Bulk edit modal
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditField, setBulkEditField] = useState<string>('category');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');

    useEffect(() => {
        loadMentors();
    }, []);

    const loadMentors = async () => {
        setLoading(true);
        const { data } = await getAllMentors();
        if (data) setMentors(data);
        setLoading(false);
    };

    // Get unique values for filters
    const categories = ['All', ...new Set(mentors.map(m => m.category))];
    const angkatans = ['All', ...new Set(mentors.map(m => String(m.angkatan)))].sort();

    // Filter and search mentors
    const filteredMentors = mentors.filter(m => {
        if (filterCategory !== 'All' && m.category !== filterCategory) return false;
        if (filterAngkatan !== 'All' && String(m.angkatan) !== filterAngkatan) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return m.name.toLowerCase().includes(query) ||
                m.university.toLowerCase().includes(query) ||
                m.major.toLowerCase().includes(query) ||
                (m.email?.toLowerCase().includes(query));
        }
        return true;
    });

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        if (selectedIds.size === filteredMentors.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredMentors.map(m => m.id)));
        }
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`⚠️ HAPUS ${selectedIds.size} mentor? Aksi ini TIDAK BISA dibatalkan!`)) return;
        if (!window.confirm(`Kamu yakin? Ketik jumlah yang akan dihapus: ${selectedIds.size}`)) return;

        setProcessing(true);
        try {
            const { error } = await supabase
                .from('mentors')
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            // Log activity
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('admin_activity_log').insert({
                user_email: user?.email || 'unknown',
                action: 'delete',
                entity_type: 'mentor',
                details: `Bulk deleted ${selectedIds.size} mentors`
            });

            setMessage({ type: 'success', text: `✅ Berhasil menghapus ${selectedIds.size} mentor` });
            setSelectedIds(new Set());
            loadMentors();
        } catch (err: any) {
            setMessage({ type: 'error', text: `❌ Gagal menghapus: ${err.message}` });
        }
        setProcessing(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const bulkUpdate = async () => {
        if (selectedIds.size === 0 || !bulkEditValue) return;

        setProcessing(true);
        try {
            const updateData: Record<string, string | number> = {};

            if (bulkEditField === 'angkatan') {
                updateData.angkatan = parseInt(bulkEditValue) || 2025;
            } else {
                updateData[bulkEditField] = bulkEditValue;
            }

            const { error } = await supabase
                .from('mentors')
                .update(updateData)
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            // Log activity
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('admin_activity_log').insert({
                user_email: user?.email || 'unknown',
                action: 'update',
                entity_type: 'mentor',
                details: `Bulk updated ${selectedIds.size} mentors: ${bulkEditField} = ${bulkEditValue}`
            });

            setMessage({ type: 'success', text: `✅ Berhasil update ${selectedIds.size} mentor` });
            setSelectedIds(new Set());
            setShowBulkEdit(false);
            setBulkEditValue('');
            loadMentors();
        } catch (err: any) {
            setMessage({ type: 'error', text: `❌ Gagal update: ${err.message}` });
        }
        setProcessing(false);
        setTimeout(() => setMessage(null), 5000);
    };

    if (loading) {
        return (
            <RequireAdmin>
                <DashboardLayout>
                    <div className="p-6 flex items-center justify-center">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                </DashboardLayout>
            </RequireAdmin>
        );
    }

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Settings2 size={28} /> Bulk Operations
                        </h1>
                        <button
                            onClick={loadMentors}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                            <RefreshCw size={18} />
                            Refresh
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-900/50 border border-green-500'
                                : 'bg-red-900/50 border border-red-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Search and Filters */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-4">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm text-slate-400 mb-1">Cari</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Nama, universitas, jurusan..."
                                        className="w-full pl-10 pr-3 py-2 bg-slate-700 rounded border border-slate-600"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Kategori</label>
                                <select
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Angkatan</label>
                                <select
                                    value={filterAngkatan}
                                    onChange={e => setFilterAngkatan(e.target.value)}
                                    className="px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                >
                                    {angkatans.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4">
                        <button
                            onClick={selectAll}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                            {selectedIds.size === filteredMentors.length && filteredMentors.length > 0 ? (
                                <CheckSquare size={18} className="text-blue-400" />
                            ) : (
                                <Square size={18} />
                            )}
                            {selectedIds.size === filteredMentors.length && filteredMentors.length > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'}
                        </button>

                        <span className="text-sm text-slate-400">
                            {selectedIds.size} dari {filteredMentors.length} dipilih
                        </span>

                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={() => setShowBulkEdit(true)}
                                disabled={selectedIds.size === 0 || processing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                            >
                                <Edit size={18} />
                                Bulk Edit
                            </button>
                            <button
                                onClick={deleteSelected}
                                disabled={selectedIds.size === 0 || processing}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition"
                            >
                                <Trash2 size={18} />
                                Hapus ({selectedIds.size})
                            </button>
                        </div>
                    </div>

                    {/* Mentor List */}
                    <div className="bg-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto max-h-[60vh]">
                            <table className="min-w-full">
                                <thead className="bg-slate-900 sticky top-0">
                                    <tr className="text-left text-slate-400 text-sm">
                                        <th className="p-3 w-12"></th>
                                        <th className="p-3">Nama</th>
                                        <th className="p-3">Universitas</th>
                                        <th className="p-3">Jurusan</th>
                                        <th className="p-3">Kategori</th>
                                        <th className="p-3">Angkatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMentors.map(m => (
                                        <tr
                                            key={m.id}
                                            onClick={() => toggleSelect(m.id)}
                                            className={`border-b border-slate-700/50 cursor-pointer transition ${selectedIds.has(m.id)
                                                    ? 'bg-blue-900/30'
                                                    : 'hover:bg-slate-700/30'
                                                }`}
                                        >
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(m.id)}
                                                    onChange={() => toggleSelect(m.id)}
                                                    className="w-4 h-4"
                                                    onClick={e => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="p-3 font-medium">{m.name}</td>
                                            <td className="p-3 text-sm text-slate-300">{m.university}</td>
                                            <td className="p-3 text-sm text-slate-300">{m.major}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${m.category === 'PTN' ? 'bg-blue-900/50 text-blue-400' :
                                                        m.category === 'PTS' ? 'bg-purple-900/50 text-purple-400' :
                                                            'bg-green-900/50 text-green-400'
                                                    }`}>
                                                    {m.category}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm">{m.angkatan}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredMentors.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                Tidak ada data yang cocok dengan filter
                            </div>
                        )}
                    </div>

                    {/* Bulk Edit Modal */}
                    {showBulkEdit && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Edit size={24} />
                                    Bulk Edit {selectedIds.size} Mentor
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Field yang diubah</label>
                                        <select
                                            value={bulkEditField}
                                            onChange={e => {
                                                setBulkEditField(e.target.value);
                                                setBulkEditValue('');
                                            }}
                                            className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                        >
                                            <option value="category">Kategori</option>
                                            <option value="angkatan">Angkatan</option>
                                            <option value="path">Jalur Masuk</option>
                                            <option value="university">Universitas</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Nilai baru</label>
                                        {bulkEditField === 'category' ? (
                                            <select
                                                value={bulkEditValue}
                                                onChange={e => setBulkEditValue(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                            >
                                                <option value="">Pilih kategori...</option>
                                                <option value="PTN">PTN</option>
                                                <option value="PTS">PTS</option>
                                                <option value="PTLN">PTLN</option>
                                            </select>
                                        ) : bulkEditField === 'path' ? (
                                            <select
                                                value={bulkEditValue}
                                                onChange={e => setBulkEditValue(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                            >
                                                <option value="">Pilih jalur...</option>
                                                <option value="SNBP">SNBP</option>
                                                <option value="SNBT">SNBT</option>
                                                <option value="Mandiri">Mandiri</option>
                                                <option value="Beasiswa">Beasiswa</option>
                                                <option value="Kedinasan">Kedinasan</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={bulkEditField === 'angkatan' ? 'number' : 'text'}
                                                value={bulkEditValue}
                                                onChange={e => setBulkEditValue(e.target.value)}
                                                placeholder={bulkEditField === 'angkatan' ? '2025' : 'Masukkan nilai...'}
                                                className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                            />
                                        )}
                                    </div>

                                    <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 text-sm">
                                        <AlertTriangle size={16} className="inline mr-2 text-yellow-400" />
                                        Perubahan akan diterapkan ke <strong>{selectedIds.size}</strong> mentor
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowBulkEdit(false)}
                                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={bulkUpdate}
                                        disabled={!bulkEditValue || processing}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                                    >
                                        {processing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Update'}
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
