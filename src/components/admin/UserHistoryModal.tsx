import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { TryoutAttempt, Tryout } from '../../types';
import { X, Trash2, AlertTriangle, RefreshCcw, Search } from 'lucide-react';

interface UserHistoryModalProps {
    userId?: string; // If provided, shows history for this user only
    tryoutId?: string; // If provided, shows participants for this tryout only
    onClose: () => void;
    currentUserName?: string; // Optional context name
    currentTryoutName?: string; // Optional context name
}

interface ExtendedAttempt extends TryoutAttempt {
    tryout?: Tryout; // Joined or mapped
    user_email?: string; // Mapped
    user_name?: string; // Mapped
    user_school?: string; // Mapped
    skor_akhir_calculated?: number;
}

export default function UserHistoryModal({ userId, tryoutId, onClose, currentUserName, currentTryoutName }: UserHistoryModalProps) {
    const [attempts, setAttempts] = useState<ExtendedAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAttempts();
    }, [userId, tryoutId]);

    const fetchAttempts = async () => {
        setLoading(true);
        try {
            let query = supabase.from('tryout_attempts')
                .select('*')
                .order('created_at', { ascending: false });

            if (userId) query = query.eq('user_id', userId);
            if (tryoutId) query = query.eq('tryout_id', tryoutId);

            const { data: attemptsData, error } = await query;

            if (error) {
                console.error('Error fetching attempts:', error);
                return;
            }

            if (!attemptsData) {
                setAttempts([]);
                return;
            }

            // --- 2-Step Fetch for Details ---

            // 1. Fetch Tryout Names (if not filtering by tryout)
            const tryoutIds = [...new Set(attemptsData.map(a => a.tryout_id))];
            let tryoutMap: Record<string, Tryout> = {};
            if (!tryoutId && tryoutIds.length > 0) {
                const { data: tData } = await supabase.from('tryouts').select('*').in('id', tryoutIds);
                tData?.forEach(t => tryoutMap[t.id] = t);
            }

            // 2. Fetch User Names (if not filtering by user)
            const userIds = [...new Set(attemptsData.map(a => a.user_id))];
            let userMap: Record<string, any> = {};
            if (!userId && userIds.length > 0) {
                const { data: uData } = await supabase.from('users').select('id, email, full_name, kelas').in('id', userIds);
                uData?.forEach(u => userMap[u.id] = u);
            }

            // Map Data
            const extended: ExtendedAttempt[] = attemptsData.map(a => {
                // Calculate score if configured (sum of normalized scores)
                let totalScore = 0;
                if (a.skor_per_subtes) {
                    Object.values(a.skor_per_subtes).forEach((s: any) => totalScore += (s.skorNormalized || 0));
                    // Average it? Or Sum? SNBT usually Average?
                    // Previous code: (sum / count)
                    const count = Object.keys(a.skor_per_subtes).length;
                    if (count > 0) totalScore = totalScore / count;
                }

                // Or use stored score?
                // The DB might not have consistent score columns, so robust calc is good.

                return {
                    ...a,
                    tryout: tryoutMap[a.tryout_id],
                    user_email: userId ? undefined : (userMap[a.user_id]?.email || 'Unknown'),
                    user_name: userId ? undefined : (userMap[a.user_id]?.full_name || 'Unknown'),
                    user_school: userId ? undefined : (userMap[a.user_id]?.kelas || ''),
                    skor_akhir_calculated: parseFloat(totalScore.toFixed(2))
                };
            });

            setAttempts(extended);

        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (attemptId: string) => {
        if (!confirm('Apakah anda yakin ingin me-RESET data tryout ini? Data akan hilang permanen dan user harus mengerjakan ulang.')) return;

        setDeletingId(attemptId);
        try {
            const { error } = await supabase.from('tryout_attempts').delete().eq('id', attemptId);
            if (error) {
                alert('Gagal menghapus attempt: ' + error.message);
            } else {
                setAttempts(prev => prev.filter(a => a.id !== attemptId));
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan.');
        } finally {
            setDeletingId(null);
        }
    };

    const filteredAttempts = attempts.filter(a => {
        if (!search) return true;
        const q = search.toLowerCase();
        if (a.tryout?.nama.toLowerCase().includes(q)) return true;
        if (a.user_email?.toLowerCase().includes(q)) return true;
        if (a.user_name?.toLowerCase().includes(q)) return true;
        return false;
    });

    const averageScore = filteredAttempts.length > 0
        ? (filteredAttempts.reduce((acc, curr) => acc + (curr.skor_akhir_calculated || 0), 0) / filteredAttempts.length).toFixed(2)
        : '0.00';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <RefreshCcw size={24} className="text-indigo-400" />
                            History & Reset Tryout
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {userId ? `User: ${currentUserName || 'Selected User'}` : `Tryout: ${currentTryoutName || 'Selected Tryout'}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/30">
                    <div className="relative w-full md:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Rata-rata Skor</p>
                            <p className="text-lg font-bold text-emerald-400">{averageScore}</p>
                        </div>
                        <div className="text-right border-l border-slate-700 pl-4">
                            <p className="text-xs text-slate-400">Total Data</p>
                            <p className="text-lg font-bold text-white">{filteredAttempts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Memuat data...</div>
                    ) : filteredAttempts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            Belum ada riwayat pengerjaan.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredAttempts.map(attempt => (
                                <div key={attempt.id} className="bg-slate-700/50 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-500/30 transition-all">
                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-white truncate">
                                                {tryoutId ? (attempt.user_name || attempt.user_email) : (attempt.tryout?.nama || 'Unknown Tryout')}
                                            </h4>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${attempt.completed_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {attempt.completed_at ? 'Selesai' : 'In Progress'}
                                            </span>
                                        </div>

                                        {tryoutId && (
                                            <p className="text-xs text-slate-400 mb-1">{attempt.user_email} • {attempt.user_school}</p>
                                        )}

                                        <div className="flex gap-4 text-xs text-slate-400">
                                            <span>Mulai: {new Date(attempt.started_at).toLocaleDateString('id-ID')}</span>
                                            {attempt.completed_at && (
                                                <span>Selesai: {new Date(attempt.completed_at).toLocaleTimeString('id-ID')}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                        <div className="text-right px-4">
                                            <p className="text-xs text-slate-400">Skor Akhir</p>
                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                                {attempt.skor_akhir_calculated}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(attempt.id)}
                                            disabled={deletingId === attempt.id}
                                            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 group"
                                            title="Reset / Hapus Data"
                                        >
                                            {deletingId === attempt.id ? (
                                                <RefreshCcw size={20} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
