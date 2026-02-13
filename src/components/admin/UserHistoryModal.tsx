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

interface Participant {
    id: string; // user_id
    email: string;
    full_name: string;
    kelas?: string;
    attempt?: ExtendedAttempt;
}

export default function UserHistoryModal({ userId, tryoutId, onClose, currentUserName, currentTryoutName }: UserHistoryModalProps) {
    const [attempts, setAttempts] = useState<ExtendedAttempt[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [viewMode, setViewMode] = useState<'attempts' | 'participants'>(tryoutId ? 'participants' : 'attempts');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, [userId, tryoutId, viewMode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (tryoutId) {
                // TRYOUT MANAGEMENT MODE: Fetch all participants and their attempts for this specific tryout

                // 1. Fetch all attempts for this tryout (includes In-Progress)
                const { data: attemptData, error: attemptError } = await supabase
                    .from('tryout_attempts')
                    .select('*')
                    .eq('tryout_id', tryoutId);

                if (attemptError) throw attemptError;

                // 2. Fetch all users (Base list)
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, email, full_name, kelas')
                    .order('full_name', { ascending: true });

                if (userError) throw userError;

                // 3. Ensure users with attempts are in the list (RLS fallback)
                const baseUsers = userData || [];
                const userIdsInBase = new Set(baseUsers.map(u => u.id));
                const missingUserIds = (attemptData || []).filter(a => !userIdsInBase.has(a.user_id)).map(a => a.user_id);

                let extraUsers: any[] = [];
                if (missingUserIds.length > 0) {
                    const { data } = await supabase
                        .from('users')
                        .select('id, email, full_name, kelas')
                        .in('id', missingUserIds);
                    if (data) extraUsers = data;
                }

                const allUsersMap: Record<string, any> = {};
                [...baseUsers, ...extraUsers].forEach(u => allUsersMap[u.id] = u);
                const allUsers = Object.values(allUsersMap).sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || ''));

                // 4. Map Attempts (for "Hanya yang Mengerjakan" view)
                const mappedAttempts: ExtendedAttempt[] = (attemptData || []).map(a => {
                    const u = allUsersMap[a.user_id];
                    let totalScore = 0;
                    if (a.skor_per_subtes) {
                        const values = Object.values(a.skor_per_subtes);
                        values.forEach((s: any) => totalScore += (s.skorNormalized || 0));
                        if (values.length > 0) totalScore = totalScore / values.length;
                    }

                    return {
                        ...a,
                        user_email: u?.email || 'Unknown',
                        user_name: u?.full_name || 'Unknown',
                        user_school: u?.kelas || '',
                        skor_akhir_calculated: parseFloat(totalScore.toFixed(2))
                    };
                }).sort((a, b) => b.skor_akhir_calculated - a.skor_akhir_calculated);

                // 5. Map Participants (for "Semua User" view)
                const mappedParticipants: Participant[] = allUsers.map(u => {
                    const attempt = mappedAttempts.find(a => a.user_id === u.id);
                    return {
                        id: u.id,
                        email: u.email,
                        full_name: u.full_name,
                        kelas: u.kelas,
                        attempt
                    };
                });

                setAttempts(mappedAttempts);
                setParticipants(mappedParticipants);

            } else if (userId) {
                // USER HISTORY MODE: Fetch all attempts for a specific user across different tryouts
                const { data: attemptsData, error } = await supabase
                    .from('tryout_attempts')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Fetch tryout names for these attempts
                const tIds = [...new Set(attemptsData.map(a => a.tryout_id))];
                let tMap: Record<string, Tryout> = {};
                if (tIds.length > 0) {
                    const { data } = await supabase.from('tryouts').select('*').in('id', tIds);
                    data?.forEach(t => tMap[t.id] = t);
                }

                const extended = (attemptsData || []).map(a => {
                    let totalScore = 0;
                    if (a.skor_per_subtes) {
                        const values = Object.values(a.skor_per_subtes);
                        values.forEach((s: any) => totalScore += (s.skorNormalized || 0));
                        if (values.length > 0) totalScore = totalScore / values.length;
                    }
                    return {
                        ...a,
                        tryout: tMap[a.tryout_id],
                        skor_akhir_calculated: parseFloat(totalScore.toFixed(2))
                    };
                });

                setAttempts(extended);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
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

    const filteredParticipants = participants.filter(p => {
        if (!search) return true;
        const q = search.toLowerCase();
        return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q);
    });

    const averageScore = viewMode === 'attempts'
        ? (filteredAttempts.length > 0
            ? (filteredAttempts.reduce((acc: number, curr: ExtendedAttempt) => acc + (curr.skor_akhir_calculated || 0), 0) / filteredAttempts.length).toFixed(2)
            : '0.00')
        : (filteredParticipants.filter(p => p.attempt).length > 0
            ? (filteredParticipants.reduce((acc: number, curr: Participant) => acc + (curr.attempt?.skor_akhir_calculated || 0), 0) / filteredParticipants.filter(p => p.attempt).length).toFixed(2)
            : '0.00');

    const totalDisplayCount = viewMode === 'attempts' ? filteredAttempts.length : filteredParticipants.length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <RefreshCcw size={24} className="text-indigo-400" />
                            {tryoutId ? 'Kelola Peserta Tryout' : 'Riwayat Pengerjaan User'}
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
                        {tryoutId && (
                            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 mr-2">
                                <button
                                    onClick={() => setViewMode('participants')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'participants' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Semua User
                                </button>
                                <button
                                    onClick={() => setViewMode('attempts')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'attempts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Hanya yg Mengerjakan
                                </button>
                            </div>
                        )}
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Rata-rata Skor</p>
                            <p className="text-lg font-bold text-emerald-400">{averageScore}</p>
                        </div>
                        <div className="text-right border-l border-slate-700 pl-4">
                            <p className="text-xs text-slate-400">Total User</p>
                            <p className="text-lg font-bold text-white">{totalDisplayCount}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">
                            <RefreshCcw className="animate-spin mx-auto mb-2 text-indigo-400" size={32} />
                            Memuat data...
                        </div>
                    ) : (viewMode === 'attempts' ? filteredAttempts : filteredParticipants).length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            Belum ada riwayat pengerjaan.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {viewMode === 'attempts' ? (
                                filteredAttempts.map(attempt => (
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
                                ))
                            ) : (
                                filteredParticipants.map(participant => (
                                    <div key={participant.id} className="bg-slate-700/50 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-indigo-500/30 transition-all">
                                        <div className="flex-1 min-w-0 w-full">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-white truncate">
                                                    {participant.full_name || 'No Name'}
                                                </h4>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${participant.attempt ? (participant.attempt.completed_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400') : 'bg-slate-600/20 text-slate-500'}`}>
                                                    {participant.attempt ? (participant.attempt.completed_at ? 'Selesai' : 'In Progress') : 'Belum Mulai'}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-400 mb-1">{participant.email} • {participant.kelas || 'No School'}</p>

                                            {participant.attempt && (
                                                <div className="flex gap-4 text-xs text-slate-400">
                                                    <span>Mulai: {new Date(participant.attempt.started_at).toLocaleDateString('id-ID')}</span>
                                                    {participant.attempt.completed_at && (
                                                        <span>Selesai: {new Date(participant.attempt.completed_at).toLocaleTimeString('id-ID')}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-right px-4">
                                                <p className="text-xs text-slate-400">Skor Akhir</p>
                                                <span className={`text-2xl font-black ${participant.attempt ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400' : 'text-slate-600'}`}>
                                                    {participant.attempt ? participant.attempt.skor_akhir_calculated : '-'}
                                                </span>
                                            </div>

                                            {participant.attempt && (
                                                <button
                                                    onClick={() => handleDelete(participant.attempt!.id)}
                                                    disabled={deletingId === participant.attempt.id}
                                                    className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 group"
                                                    title="Reset / Hapus Data"
                                                >
                                                    {deletingId === participant.attempt.id ? (
                                                        <RefreshCcw size={20} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={20} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
