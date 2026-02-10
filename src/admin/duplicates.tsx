import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { getAllMentors, MentorDB } from '../mentorService';
import { supabase } from '../supabaseClient';
import { Copy, Search, Trash2, Check, AlertTriangle, Users, Loader2, Merge } from 'lucide-react';

interface DuplicateGroup {
    key: string;
    mentors: MentorDB[];
    similarity: 'exact' | 'similar';
}

export default function DuplicatesPage() {
    const [mentors, setMentors] = useState<MentorDB[]>([]);
    const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadMentors();
    }, []);

    const loadMentors = async () => {
        setLoading(true);
        const { data } = await getAllMentors();
        if (data) {
            setMentors(data);
            findDuplicates(data);
        }
        setLoading(false);
    };

    // Normalize name for comparison
    const normalizeName = (name: string): string => {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^a-z0-9\s]/g, '');
    };

    // Find duplicates by name
    const findDuplicates = (mentorList: MentorDB[]) => {
        const nameMap = new Map<string, MentorDB[]>();
        const similarMap = new Map<string, MentorDB[]>();

        // Group by exact normalized name
        mentorList.forEach(m => {
            const normalizedName = normalizeName(m.name);
            if (!nameMap.has(normalizedName)) {
                nameMap.set(normalizedName, []);
            }
            nameMap.get(normalizedName)!.push(m);
        });

        // Find similar names (first + last name match)
        mentorList.forEach(m => {
            const parts = m.name.toLowerCase().trim().split(' ');
            if (parts.length >= 2) {
                const key = `${parts[0]}-${parts[parts.length - 1]}`;
                if (!similarMap.has(key)) {
                    similarMap.set(key, []);
                }
                similarMap.get(key)!.push(m);
            }
        });

        const groups: DuplicateGroup[] = [];

        // Add exact duplicates
        nameMap.forEach((mentors, key) => {
            if (mentors.length > 1) {
                groups.push({ key, mentors, similarity: 'exact' });
            }
        });

        // Add similar (but not exact) duplicates
        similarMap.forEach((mentors, key) => {
            if (mentors.length > 1) {
                // Check if all have different normalized names (not already in exact)
                const normalizedNames = new Set(mentors.map(m => normalizeName(m.name)));
                if (normalizedNames.size > 1) {
                    groups.push({ key, mentors, similarity: 'similar' });
                }
            }
        });

        // Sort by most duplicates first
        groups.sort((a, b) => b.mentors.length - a.mentors.length);
        setDuplicates(groups);
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAllInGroup = (group: DuplicateGroup, keepFirst = true) => {
        const newSelected = new Set(selectedIds);
        group.mentors.forEach((m, i) => {
            if (keepFirst && i === 0) {
                newSelected.delete(m.id);
            } else {
                newSelected.add(m.id);
            }
        });
        setSelectedIds(newSelected);
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Hapus ${selectedIds.size} mentor yang dipilih? Aksi ini tidak bisa dibatalkan.`)) return;

        setProcessing(true);
        try {
            const { error } = await supabase
                .from('mentors')
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            setMessage({ type: 'success', text: `✅ Berhasil menghapus ${selectedIds.size} mentor duplikat` });
            setSelectedIds(new Set());
            loadMentors();
        } catch (err: any) {
            setMessage({ type: 'error', text: `❌ Gagal menghapus: ${err.message}` });
        }
        setProcessing(false);
        setTimeout(() => setMessage(null), 5000);
    };

    const exactDuplicates = duplicates.filter(d => d.similarity === 'exact');
    const similarDuplicates = duplicates.filter(d => d.similarity === 'similar');

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
                            <Copy size={28} /> Duplicates Checker
                        </h1>
                        {selectedIds.size > 0 && (
                            <button
                                onClick={deleteSelected}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                            >
                                <Trash2 size={18} />
                                Hapus {selectedIds.size} Dipilih
                            </button>
                        )}
                    </div>

                    {message && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-900/50 border border-green-500'
                                : 'bg-red-900/50 border border-red-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Users size={24} className="text-blue-400" />
                                <div>
                                    <p className="text-2xl font-bold">{mentors.length}</p>
                                    <p className="text-sm text-slate-400">Total Mentor</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={24} className="text-red-400" />
                                <div>
                                    <p className="text-2xl font-bold">{exactDuplicates.length}</p>
                                    <p className="text-sm text-slate-400">Grup Duplikat Persis</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <Search size={24} className="text-yellow-400" />
                                <div>
                                    <p className="text-2xl font-bold">{similarDuplicates.length}</p>
                                    <p className="text-sm text-slate-400">Grup Nama Mirip</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {duplicates.length === 0 ? (
                        <div className="text-center py-12 bg-slate-800 rounded-xl">
                            <Check size={48} className="mx-auto mb-3 text-green-400" />
                            <p className="text-xl font-semibold">Tidak ada duplikat terdeteksi! 🎉</p>
                            <p className="text-sm text-slate-400 mt-1">Semua data mentor unik</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Exact Duplicates */}
                            {exactDuplicates.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={20} />
                                        Duplikat Persis ({exactDuplicates.length} grup)
                                    </h2>
                                    <div className="space-y-3">
                                        {exactDuplicates.map((group, gIdx) => (
                                            <div key={gIdx} className="bg-slate-800 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold">
                                                        "{group.mentors[0].name}" × {group.mentors.length}
                                                    </span>
                                                    <button
                                                        onClick={() => selectAllInGroup(group)}
                                                        className="text-sm text-blue-400 hover:underline"
                                                    >
                                                        Pilih semua kecuali pertama
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {group.mentors.map((m, mIdx) => (
                                                        <label
                                                            key={m.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedIds.has(m.id)
                                                                    ? 'bg-red-900/30 border border-red-500'
                                                                    : 'bg-slate-700/50 hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(m.id)}
                                                                onChange={() => toggleSelect(m.id)}
                                                                className="w-4 h-4"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{m.name}</span>
                                                                    {mIdx === 0 && (
                                                                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                                                                            Pertama
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-slate-400 truncate">
                                                                    {m.university} • {m.major} • {m.angkatan}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-slate-500">ID: {m.id}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Similar Names */}
                            {similarDuplicates.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                                        <Search size={20} />
                                        Nama Mirip ({similarDuplicates.length} grup) - Perlu Review Manual
                                    </h2>
                                    <div className="space-y-3">
                                        {similarDuplicates.slice(0, 10).map((group, gIdx) => (
                                            <div key={gIdx} className="bg-slate-800 rounded-xl p-4">
                                                <div className="space-y-2">
                                                    {group.mentors.map(m => (
                                                        <label
                                                            key={m.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedIds.has(m.id)
                                                                    ? 'bg-red-900/30 border border-red-500'
                                                                    : 'bg-slate-700/50 hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(m.id)}
                                                                onChange={() => toggleSelect(m.id)}
                                                                className="w-4 h-4"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-medium">{m.name}</span>
                                                                <p className="text-sm text-slate-400 truncate">
                                                                    {m.university} • {m.major} • {m.angkatan}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-slate-500">ID: {m.id}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {similarDuplicates.length > 10 && (
                                            <p className="text-center text-slate-400 py-2">
                                                ... dan {similarDuplicates.length - 10} grup lainnya
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
