import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { Trophy, Medal, Award, Share2, Camera, User, Download, ChevronLeft } from 'lucide-react';
import html2canvas from 'html2canvas';

interface LeaderboardEntry {
    id: string;
    rank: number;
    user_name: string;
    school: string;
    score: number;
}

interface TryoutOption {
    id: string;
    nama: string;
}

export default function LeaderboardPage() {
    const [tryouts, setTryouts] = useState<TryoutOption[]>([]);
    const [selectedTryoutId, setSelectedTryoutId] = useState<string>('');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [shareMode, setShareMode] = useState(false);

    useEffect(() => {
        fetchTryouts();
    }, []);

    useEffect(() => {
        if (selectedTryoutId) {
            fetchLeaderboard(selectedTryoutId);
        }
    }, [selectedTryoutId]);

    const fetchTryouts = async () => {
        const { data } = await supabase.from('tryouts').select('id, nama').eq('is_active', true).order('created_at', { ascending: false });
        if (data && data.length > 0) {
            setTryouts(data);
            setSelectedTryoutId(data[0].id);
        }
    };

    const fetchLeaderboard = async (tryoutId: string) => {
        setLoading(true);
        try {
            // Fetch attempts sorted by score (we assume score is available or needs calc)
            // We need to fetch users too.
            // Optimized: Fetch top 50 attempts using IRT score if available, or just raw fetch.
            // Since we need to join users, and public.users might be separate.

            // Step 1: Get Attempts
            const { data: attempts } = await supabase
                .from('tryout_attempts')
                .select('*')
                .eq('tryout_id', tryoutId)
                .not('completed_at', 'is', null);

            if (!attempts) {
                setLeaderboard([]);
                return;
            }

            // Step 2: Get User IDs
            const userIds = [...new Set(attempts.map(a => a.user_id))];

            // Step 3: Get Users (from public.users for name/school)
            const { data: users } = await supabase
                .from('users')
                .select('id, full_name, kelas, email')
                .in('id', userIds);

            const userMap: Record<string, any> = {};
            users?.forEach(u => userMap[u.id] = u);

            // Step 4: Process & Sort
            const processed = attempts.map(a => {
                const user = userMap[a.user_id];
                // Calculate score: Sum of subtes normalized scores
                let total = 0;
                if (a.skor_per_subtes) {
                    const scores = Object.values(a.skor_per_subtes);
                    if (scores.length > 0) {
                        // Average or Sum? Usually IRT is Average * 10 or similar.
                        // For simplicity and previous code logic: Average of normalized scores.
                        const sum = scores.reduce((acc: number, curr: any) => acc + (curr.skorNormalized || 0), 0);
                        total = sum / scores.length;
                    }
                }

                return {
                    id: a.id,
                    user_name: user ? (user.full_name || user.email.split('@')[0]) : 'Unknown',
                    school: user?.kelas || 'Umum',
                    score: parseFloat(total.toFixed(2)),
                };
            });

            // Sort Descending
            processed.sort((a, b) => b.score - a.score);

            // Take Top 10
            const top10 = processed.slice(0, 10).map((item, idx) => ({
                ...item,
                rank: idx + 1
            }));

            setLeaderboard(top10);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadImage = async () => {
        const element = document.getElementById('leaderboard-content');
        if (element) {
            const canvas = await html2canvas(element, { backgroundColor: '#1e293b' }); // Slate-800
            const data = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = data;
            link.download = `leaderboard-${selectedTryoutId}.png`;
            link.click();
        }
    };

    // Shared Content Component
    const LeaderboardContent = () => (
        <div id="leaderboard-content" className="p-8 bg-slate-900 min-h-screen text-white flex flex-col items-center">
            {/* Branding */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <img src="/LogoIKAHATANewRBG.svg" alt="Logo" className="w-20 h-20 object-contain drop-shadow-2xl" />
                </div>
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mb-2">
                    HALL OF FAME
                </h1>
                <h2 className="text-xl text-slate-300 font-bold uppercase tracking-widest">
                    {tryouts.find(t => t.id === selectedTryoutId)?.nama || 'Tryout SNBT'}
                </h2>
            </div>

            {loading ? (
                <div className="text-slate-500 animate-pulse">Memuat data juara...</div>
            ) : leaderboard.length === 0 ? (
                <div className="text-slate-500">Belum ada data pengerjaan</div>
            ) : (
                <div className="w-full max-w-4xl">
                    {/* PODIUM (Top 3) */}
                    <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-4 mb-20 md:mb-16 min-h-[400px] md:h-80 w-full pt-10">
                        {/* Rank 2 (Silver) */}
                        {leaderboard[1] && (
                            <div className="flex flex-col items-center w-full md:w-1/3 animate-in slide-in-from-bottom-10 delay-100 duration-700 order-2 md:order-1">
                                <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden mb-[-40px] z-10 bg-slate-200 shadow-xl flex items-center justify-center">
                                    <User size={48} className="text-slate-400" />
                                </div>
                                <div className="w-full bg-gradient-to-b from-slate-200 to-slate-400 rounded-t-3xl pt-12 pb-6 px-4 text-center shadow-lg relative h-56 md:h-64 flex flex-col justify-between border-t border-white/20">
                                    <div className="relative z-10">
                                        <p className="font-black text-slate-800 text-lg line-clamp-2 leading-tight mb-1 drop-shadow-sm">{leaderboard[1].user_name}</p>
                                        <p className="text-slate-700 text-xs font-bold uppercase tracking-widest">{leaderboard[1].school}</p>
                                    </div>
                                    <div className="bg-slate-900/10 py-2 rounded-xl mt-2 border border-white/10 backdrop-blur-sm">
                                        <p className="text-2xl font-black text-slate-900">{leaderboard[1].score}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 text-slate-100/30">
                                        <Medal size={48} strokeWidth={1} />
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-slate-500/30 rounded-full mt-2 filter blur-sm"></div>
                            </div>
                        )}

                        {/* Rank 1 (Gold) */}
                        {leaderboard[0] && (
                            <div className="flex flex-col items-center w-full md:w-1/3 z-20 animate-in slide-in-from-bottom-20 duration-700 order-1 md:order-2 scale-105 md:scale-110">
                                <div className="mb-4 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce">
                                    <Trophy size={56} fill="currentColor" />
                                </div>
                                <div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden mb-[-48px] z-10 bg-slate-100 shadow-2xl ring-8 ring-yellow-500/10 flex items-center justify-center">
                                    <User size={64} className="text-slate-400" />
                                </div>
                                <div className="w-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 rounded-t-3xl pt-14 pb-8 px-4 text-center shadow-[0_20px_50px_rgba(245,158,11,0.3)] relative h-72 md:h-80 flex flex-col justify-between border-t border-white/40">
                                    <div className="relative z-10">
                                        <p className="font-black text-amber-950 text-xl line-clamp-2 leading-tight mb-1">{leaderboard[0].user_name}</p>
                                        <p className="text-amber-900/80 text-sm font-bold uppercase tracking-widest">{leaderboard[0].school}</p>
                                    </div>
                                    <div className="bg-white/40 py-3 rounded-2xl mt-2 backdrop-blur-md border border-white/20 shadow-inner">
                                        <p className="text-4xl font-black text-amber-950 drop-shadow-sm">{leaderboard[0].score}</p>
                                        <p className="text-[10px] text-amber-900 font-black uppercase tracking-[0.2em] mt-1">Nilai Akhir IRT</p>
                                    </div>
                                </div>
                                <div className="w-full h-4 bg-amber-600/30 rounded-full mt-3 filter blur-md"></div>
                            </div>
                        )}

                        {/* Rank 3 (Bronze) */}
                        {leaderboard[2] && (
                            <div className="flex flex-col items-center w-full md:w-1/3 animate-in slide-in-from-bottom-10 delay-200 duration-700 order-3 md:order-3">
                                <div className="w-20 h-20 rounded-full border-4 border-amber-600/50 overflow-hidden mb-[-40px] z-10 bg-slate-200 shadow-xl flex items-center justify-center">
                                    <User size={48} className="text-slate-400" />
                                </div>
                                <div className="w-full bg-gradient-to-b from-amber-600/80 to-amber-700 rounded-t-3xl pt-12 pb-6 px-4 text-center shadow-lg relative h-48 md:h-56 flex flex-col justify-between border-t border-white/10">
                                    <div className="relative z-10">
                                        <p className="font-black text-amber-100 text-lg line-clamp-2 leading-tight mb-1 drop-shadow-sm">{leaderboard[2].user_name}</p>
                                        <p className="text-amber-200/60 text-xs font-bold uppercase tracking-widest">{leaderboard[2].school}</p>
                                    </div>
                                    <div className="bg-black/20 py-2 rounded-xl mt-2 backdrop-blur-sm border border-white/5">
                                        <p className="text-2xl font-black text-white">{leaderboard[2].score}</p>
                                    </div>
                                    <div className="absolute top-4 right-4 text-amber-200/20">
                                        <Award size={48} strokeWidth={1} />
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-amber-900/30 rounded-full mt-2 filter blur-sm"></div>
                            </div>
                        )}
                    </div>

                    {/* LIST (Rank 4-10) */}
                    <div className="space-y-3">
                        {leaderboard.slice(3).map((entry) => (
                            <div key={entry.id} className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 flex items-center justify-between border border-slate-700/50 hover:bg-slate-700 transition-all animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center font-black text-xl text-slate-500 bg-slate-900 rounded-lg">
                                        #{entry.rank}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                        <User size={24} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">{entry.user_name}</p>
                                        <p className="text-slate-400 text-xs uppercase">{entry.school}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-indigo-400">{entry.score}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-slate-500 text-sm">
                        Generasi Juara • IKAHATA Tryout System
                    </div>
                </div>
            )}
        </div>
    );

    if (shareMode) {
        return (
            <div className="min-h-screen bg-slate-900 relative">
                <button
                    onClick={() => setShareMode(false)}
                    className="fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 shadow-lg"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="fixed top-4 right-4 z-50 flex gap-2">
                    <button
                        onClick={handleDownloadImage}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 shadow-lg font-bold flex items-center gap-2"
                    >
                        <Download size={18} /> Simpan Gambar
                    </button>
                </div>
                <LeaderboardContent />
            </div>
        );
    }

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    {/* Control Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl">
                                <Trophy size={28} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                                <p className="text-slate-400 text-sm">Ranking peserta tryout</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select
                                value={selectedTryoutId}
                                onChange={(e) => setSelectedTryoutId(e.target.value)}
                                className="bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 focus:border-indigo-500 outline-none flex-1 md:w-64"
                            >
                                <option value="" disabled>Pilih Tryout</option>
                                {tryouts.map(t => (
                                    <option key={t.id} value={t.id}>{t.nama}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setShareMode(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                            >
                                <Share2 size={18} />
                                <span className="hidden md:inline">Mode Share</span>
                            </button>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                        <LeaderboardContent />
                    </div>
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
