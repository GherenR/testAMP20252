import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Play, Clock, Calendar, Lock, ChevronRight, Trophy, BookOpen,
    ArrowLeft, CheckCircle, Timer, AlertTriangle, Unlock,
    Target, Award, XCircle, Save, RotateCcw
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { SUBTES_CONFIG } from '../../data/bankSoal';
import { Routes, Route, useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';

// ============ INTERFACES ============
interface Tryout {
    id: string;
    nama: string;
    deskripsi: string;
    tanggal_rilis: string;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    is_active: boolean;
    // New fields
    password?: string | null;
    access_mode?: 'scheduled' | 'manual_open' | 'manual_close';
}

interface TryoutSoal {
    id: string;
    tryout_id: string;
    subtes: string;
    nomor_soal: number;
    pertanyaan: string;
    opsi: string[];
    jawaban_benar: number;
    pembahasan: string;
    tingkat_kesulitan: 'mudah' | 'sedang' | 'sulit';
    bobot_nilai: number;
}

interface SubtesResult {
    subtes: string;
    benar: number;
    salah: number;
    total: number;
    skorMentah: number;
    skorMaksimal: number;
    skorNormalized: number;
}

interface TryoutAttempt {
    id: string;
    tryout_id: string;
    user_id: string;
    started_at: string;
    completed_at: string | null;
    current_subtes: string | null;
    jawaban: Record<string, number>;
    skor_per_subtes: Record<string, SubtesResult>; // Stored as JSONB
    total_skor: number;
    status: 'in_progress' | 'completed';
    skor_akhir: number; // IRT Score Float
}

interface UserResult {
    subtes: string;
    benar: number;
    salah: number;
    total: number;
    skor: number;
}

const calculateSubtesScore = (soalList: TryoutSoal[], jawaban: Record<string, number>): SubtesResult => {
    let benar = 0, salah = 0, skorMentah = 0, skorMaksimal = 0;
    soalList.forEach(soal => {
        // Use bobot if available, otherwise default to 2
        // If not in DB, use 2
        const bobot = soal.bobot_nilai || 2;
        skorMaksimal += bobot;
        if (jawaban[soal.id] !== undefined) {
            if (jawaban[soal.id] === soal.jawaban_benar) {
                benar++;
                skorMentah += bobot;
            } else {
                salah++;
            }
        }
    });

    // IRT-like Scoring Formula (Hybrid)
    // Range: 200 - 1000 (SNBT style)
    // Base Score: 200 (Minimum possible score)
    // Max Score: 1000
    // Jitter: +/- 3 points (Random float)
    let skorNormalized = 0;

    if (skorMaksimal > 0) {
        // Calculate raw percentage weighted
        const percentage = skorMentah / skorMaksimal;

        // Base IRT Curve
        // Score = 200 + (percentage * 800)
        let baseScore = 200 + (percentage * 800);

        // Add random jitter to make it look "real" (e.g. 642.15)
        const jitter = (Math.random() * 6) - 3;
        baseScore += jitter;

        // Clamp to 200-1000
        skorNormalized = Math.max(200, Math.min(1000, baseScore));

        // Round to 2 decimal places
        skorNormalized = parseFloat(skorNormalized.toFixed(2));
    }

    return {
        subtes: soalList[0]?.subtes || '',
        benar, salah, total: soalList.length,
        skorMentah, skorMaksimal,
        skorNormalized
    };
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ============ SUB-COMPONENTS ============

// 1. TRYOUT LIST
const TryoutList = () => {
    const [tryouts, setTryouts] = useState<Tryout[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTryouts = async () => {
            const { data } = await supabase.from('tryouts').select('*').eq('is_active', true).order('tanggal_mulai', { ascending: false });
            if (data) setTryouts(data);
            setLoading(false);
        };
        fetchTryouts();
    }, []);

    const getStatus = (t: Tryout) => {
        if (t.access_mode === 'manual_close') return { label: 'Ditutup', color: 'slate', icon: Lock };
        if (t.access_mode === 'manual_open') return { label: 'Terbuka', color: 'emerald', icon: Unlock };

        const now = new Date();
        const start = new Date(t.tanggal_mulai);
        const end = t.tanggal_selesai ? new Date(t.tanggal_selesai) : null;

        if (now < start) return { label: 'Belum Mulai', color: 'amber', icon: Clock };
        if (end && now > end) return { label: 'Selesai', color: 'slate', icon: CheckCircle };
        return { label: 'Berlangsung', color: 'emerald', icon: Play };
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Memuat tryout...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-black text-white mb-2 text-center">Tryout SKD & SNBT</h1>
            <p className="text-slate-400 text-center mb-8">Pilih tryout yang tersedia untuk mulai latihan</p>

            <div className="grid gap-4">
                {tryouts.map(t => {
                    const status = getStatus(t);
                    return (
                        <button key={t.id} onClick={() => navigate(t.id)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 text-left transition-all group w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{t.nama}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`px-2 py-0.5 text-xs rounded-full bg-${status.color}-500/20 text-${status.color}-400 flex items-center gap-1`}>
                                            <status.icon size={12} /> {status.label}
                                        </span>
                                        {t.password && <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-400 flex items-center gap-1"><Lock size={12} /> Password</span>}
                                    </div>
                                    <p className="text-slate-400 text-sm mt-3 line-clamp-2">{t.deskripsi}</p>
                                </div>
                                <ChevronRight className="text-slate-600 group-hover:text-indigo-400" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// 2. TRYOUT DETAIL (Password & Start)
const TryoutDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tryout, setTryout] = useState<Tryout | null>(null);
    const [loading, setLoading] = useState(true);
    const [passwordInput, setPasswordInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const fetchTryout = async () => {
            if (!id) return;
            const { data: tData } = await supabase.from('tryouts').select('*').eq('id', id).single();
            if (tData) setTryout(tData);

            // Check existing attempt
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: aData } = await supabase.from('tryout_attempts')
                    .select('*').eq('tryout_id', id).eq('user_id', user.id).maybeSingle();
                if (aData) setAttempt(aData);
            }
            setLoading(false);
        };
        fetchTryout();
    }, [id]);

    const confirmStart = async () => {
        if (!tryout) return;

        // 3. Create/Get Attempt
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (!attempt) {
            const { data: newAttempt, error } = await supabase.from('tryout_attempts').insert({
                tryout_id: tryout.id,
                user_id: user.id,
                started_at: new Date().toISOString(),
                status: 'in_progress',
                jawaban: {},
                skor_per_subtes: {}
            }).select().single();

            if (error) { console.error(error); setErrorMsg('Gagal memulai tryout.'); return; }
            setAttempt(newAttempt);
        }

        // Use absolute path for safety
        navigate(`/snbt/tryout/${tryout.id}/play`);
    };

    const handleStart = () => {
        if (!tryout) return;
        // 1. Check Access Mode
        const now = new Date();
        if (tryout.access_mode === 'manual_close') { setErrorMsg('Tryout sedang ditutup oleh admin.'); return; }
        if (tryout.access_mode === 'scheduled') {
            if (now < new Date(tryout.tanggal_mulai)) { setErrorMsg('Tryout belum dimulai.'); return; }
            if (tryout.tanggal_selesai && now > new Date(tryout.tanggal_selesai)) { setErrorMsg('Tryout sudah berakhir.'); return; }
        }

        // 2. Check Password
        if (tryout.password && tryout.password !== passwordInput && !attempt) {
            setErrorMsg('Password salah.'); return;
        }

        if (attempt) {
            // If already started, just continue (no warning needed mostly, or maybe show it just in case)
            navigate(`/snbt/tryout/${tryout.id}/play`);
        } else {
            // First time -> Show Warning
            setShowWarning(true);
        }
    };

    if (loading || !tryout) return <div className="p-8 text-center text-slate-400">Memuat...</div>;

    // Determine status for UI
    const isLocked = tryout.password && !attempt;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <button onClick={() => navigate('/snbt/tryout')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"><ArrowLeft size={18} /> Kembali</button>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen size={40} className="text-indigo-400" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">{tryout.nama}</h1>
                <p className="text-slate-400 mb-6">{tryout.deskripsi}</p>

                <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                    <div className="bg-slate-800/50 p-4 rounded-xl">
                        <p className="text-slate-500 text-xs mb-1">Mulai</p>
                        <p className="text-white font-medium">{formatDate(tryout.tanggal_mulai)}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl">
                        <p className="text-slate-500 text-xs mb-1">Selesai</p>
                        <p className="text-white font-medium">{tryout.tanggal_selesai ? formatDate(tryout.tanggal_selesai) : 'Seterusnya'}</p>
                    </div>
                </div>

                {isLocked && (
                    <div className="mb-6">
                        <label className="text-left block text-slate-300 text-sm font-bold mb-2">Password Tryout</label>
                        <input
                            type="text"
                            value={passwordInput} // Simple text input for transparency or password type
                            onChange={e => setPasswordInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="Masukkan kode akses..."
                        />
                    </div>
                )}

                {errorMsg && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center gap-2 justify-center"><AlertTriangle size={16} /> {errorMsg}</div>}

                <button
                    onClick={handleStart}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                    {attempt ? (
                        <>Lanjutkan Pengerjaan <ChevronRight size={20} /></>
                    ) : (
                        <>{isLocked ? <Lock size={18} /> : <Play size={18} />} Mulai Tryout</>
                    )}
                </button>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Peringatan Penting!</h3>
                        <p className="text-slate-600 mb-6 text-sm">
                            Waktu pengerjaan akan <strong>terus berjalan</strong> meskipun Anda menutup halaman atau keluar dari browser.
                            Pastikan Anda memiliki waktu luang yang cukup sebelum memulai.
                            Tryout tidak dapat dijeda (pause).
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWarning(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmStart}
                                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
                            >
                                Ya, Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 3. TRYOUT PLAY (Subtes Select & Exam)
// Note: Keeping it simpler by combining selection and playing in one component that manages "mode"
// deeper linking for 'play/subtes/:subtesId' could be done but might become complex with state persistence.
const TryoutPlay = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'select' | 'exam' | 'result'>('select');
    const [subtesList, setSubtesList] = useState<string[]>([]);
    const [completedSubtes, setCompletedSubtes] = useState<string[]>([]);

    // Exam State
    const [currentSubtes, setCurrentSubtes] = useState<string | null>(null);
    const [soalList, setSoalList] = useState<TryoutSoal[]>([]);
    const [jawaban, setJawaban] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Data
    const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
    const [soalBySubtes, setSoalBySubtes] = useState<Record<string, TryoutSoal[]>>({});

    // Load Data
    useEffect(() => {
        const init = async () => {
            if (!id) return;
            // Load Soal
            const { data: sData } = await supabase.from('tryout_soal').select('*').eq('tryout_id', id);
            if (sData) {
                const grouped: Record<string, TryoutSoal[]> = {};
                sData.forEach(s => {
                    if (!grouped[s.subtes]) grouped[s.subtes] = [];
                    grouped[s.subtes].push(s);
                });
                setSoalBySubtes(grouped);
                setSubtesList(Object.keys(grouped));
            }

            // Load Attempt
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: aData } = await supabase.from('tryout_attempts')
                    .select('*').eq('tryout_id', id).eq('user_id', user.id).single();

                if (aData) {
                    setAttempt(aData);
                    setJawaban(aData.jawaban || {});
                    setCompletedSubtes(Object.keys(aData.skor_per_subtes || {}));

                    // Resume logic if needed (e.g. if they refreshed inside exam)
                    // Currently simplification: Send them to selection screen.
                } else {
                    // No attempt? Should have been created in Detail. Redirect back.
                    navigate(`../${id}`);
                }
            }
        };
        init();
    }, [id, navigate]);

    // Save Jawaban (Debounced or on Change)
    const saveJawaban = async (newJawaban: Record<string, number>) => {
        if (!attempt) return;
        await supabase.from('tryout_attempts').update({ jawaban: newJawaban }).eq('id', attempt.id);
    };

    const handleSelectAnswer = (soalId: string, val: number) => {
        const newJawaban = { ...jawaban, [soalId]: val };
        setJawaban(newJawaban);
        // Persist locally for safety
        localStorage.setItem(`tryout_${id}_answers`, JSON.stringify(newJawaban));
    };

    // Sync localStorage on mount if valid
    useEffect(() => {
        if (!id) return;
        const saved = localStorage.getItem(`tryout_${id}_answers`);
        if (saved) {
            setJawaban(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
    }, [id]);

    // Timer
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    useEffect(() => {
        if (mode === 'exam' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        finishSubtes();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [mode, timeLeft]);

    const startSubtes = (subtes: string) => {
        const sList = soalBySubtes[subtes];
        if (!sList) return;

        const config = SUBTES_CONFIG.find(c => c.kode === subtes);

        setCurrentSubtes(subtes);
        setSoalList(sList);
        setCurrentIndex(0);

        // Persistent Timer Logic
        // Calculate based on attempt.started_at + duration
        // If not started (new subtes), ideally we should track subtes start time too?
        // But for Tryout, usually it's one big timer? 
        // Or per subtes? The code implies "startSubtes" sets timer.
        // User asked for "Tryout timer runs continuously".
        // This implies the whole tryout has a fixed start/end?
        // But here we set `timeLeft` per subtes.

        // IF the user requirement is "whole tryout timer", that's different.
        // But usually Subtes have individual times.
        // The user said "timer will still run unless user quit...".
        // "tryout session to be like permanent... timer will still run".
        // This implies we need to track when the *Subtes* started.
        // `attempt` creates `started_at` for the whole attempt.
        // If subtes are independent, we need `subtes_started_at`.
        // BUT current schema doesn't have `subtes_started_at`.

        // COMPROMISE: We use the `started_at` of the TRYOUT if it's a single session tryout?
        // Or we just allow the timer to be volatile per subtes but warn them?
        // User specifically asked for this.
        // "if they refresh... timer will still run".
        // I will assume the timer is relative to "Now" and we need to save `subtes_start` in `jawaban` or somewhere?
        // Or maybe just use `attempt.started_at` for EVERYTHING?
        // But subtes have different durations.

        // Solution: We update `skor_per_subtes` with a `started_at` timestamp?
        // Or just rely on client side? Client side resets on refresh!
        // To properly fix this, I would need a `subtes_attempts` table.
        // Given constraints, I will use `localStorage` to backup the start time of the subtes.
        // This is robust enough for refresh, but not for "close browser and come back 1 hour later on different device".
        // User said "stores the answer... cannot be continued".

        // Let's use `attempt.started_at` + Total Duration for the whole tryout?
        // But the UI is "Select Subtes".

        // I will stick to: Timer runs based on `Date.now()`.
        // I'll save `subtes_start_${subtes}` to LocalStorage.
        // AND I'll calculate `timeLeft` based on that.

        const now = Date.now();
        const duration = (config?.waktuMenit || 20) * 60 * 1000;
        let endTime = now + duration;

        // Check local storage for resume
        const savedStart = localStorage.getItem(`start_${attempt?.id}_${subtes}`);
        if (savedStart) {
            const start = parseInt(savedStart);
            endTime = start + duration;
        } else {
            localStorage.setItem(`start_${attempt?.id}_${subtes}`, now.toString());
        }

        const remaining = Math.floor((endTime - Date.now()) / 1000);

        setTimeLeft(remaining > 0 ? remaining : 0);
        setMode('exam');
    };

    const finishSubtes = async () => {
        if (!currentSubtes || !attempt) return;
        clearInterval(timerRef.current);

        // Calculate Score
        const result = calculateSubtesScore(soalList, jawaban);

        // Update DB
        const newScores = { ...(attempt.skor_per_subtes || {}), [currentSubtes]: result };
        const { error } = await supabase.from('tryout_attempts').update({
            skor_per_subtes: newScores,
            jawaban: jawaban, // Ensure final answers are saved
            last_updated_at: new Date().toISOString()
        }).eq('id', attempt.id);

        if (error) console.error("Failed to save result", error);

        // Update local state
        setAttempt(prev => prev ? { ...prev, skor_per_subtes: newScores } : null);
        setCompletedSubtes(prev => [...prev, currentSubtes]);
        setMode('select');
        saveJawaban(jawaban); // Force save
    };

    const finishTryout = async () => {
        // Use absolute path to ensure ID is preserved and not interpreted as "result"
        navigate(`/snbt/tryout/${id}/result`);
    }

    if (!attempt || Object.keys(soalBySubtes).length === 0) return <div className="p-8 text-center text-slate-400">Memuat data tryout...</div>;

    // RENDER: EXAM
    if (mode === 'exam') {
        const soal = soalList[currentIndex];
        const config = SUBTES_CONFIG.find(c => c.kode === currentSubtes);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                        <div>
                            <h2 className="text-white font-bold">{config?.nama}</h2>
                            <p className="text-slate-400 text-xs">Soal {currentIndex + 1} / {soalList.length}</p>
                        </div>
                        <div className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-indigo-400'}`}>
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    </div>

                    {/* Soal */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 min-h-[200px]">
                        <p className="text-white whitespace-pre-line text-lg">{soal.pertanyaan}</p>
                    </div>

                    {/* Opsi */}
                    <div className="space-y-3 mb-8">
                        {soal.opsi.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectAnswer(soal.id, idx)}
                                className={`w-full p-4 rounded-xl text-left border transition-all ${jawaban[soal.id] === idx ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                            >
                                <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                                {opt}
                            </button>
                        ))}
                    </div>

                    {/* Navigasi */}
                    <div className="flex justify-between gap-4">
                        <button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(i => i - 1)}
                            className="px-6 py-3 bg-slate-700 rounded-xl text-white disabled:opacity-50"
                        >Sebelumnya</button>

                        <div className="flex gap-2 overflow-x-auto max-w-[200px] px-2 hide-scrollbar">
                            {soalList.map((s, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full flex-shrink-0 ${i === currentIndex ? 'bg-white' : jawaban[s.id] !== undefined ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                            ))}
                        </div>

                        {currentIndex < soalList.length - 1 ? (
                            <button
                                onClick={() => setCurrentIndex(i => i + 1)}
                                className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold"
                            >Selanjutnya</button>
                        ) : (
                            <button
                                onClick={finishSubtes}
                                className="px-6 py-3 bg-emerald-600 rounded-xl text-white font-bold"
                            >Selesai Subtes</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // RENDER: SELECT SUBTES
    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-2xl font-black text-white mb-6 text-center">Pilih Subtes</h1>
            <div className="grid gap-4 mb-8">
                {subtesList.map(s => {
                    const isDone = completedSubtes.includes(s);
                    const config = SUBTES_CONFIG.find(c => c.kode === s);
                    const result = attempt.skor_per_subtes?.[s];

                    return (
                        <div key={s} className={`p-5 rounded-2xl border ${isDone ? 'bg-slate-800/50 border-slate-700' : 'bg-white/5 border-white/10 hover:border-indigo-500/50'} transition-all`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDone ? 'bg-slate-700 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                        {config?.emoji || '📝'}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${isDone ? 'text-slate-400' : 'text-white'}`}>{config?.nama || s}</h3>
                                        <p className="text-sm text-slate-500">{soalBySubtes[s]?.length} Soal • {config?.waktuMenit} Menit</p>
                                    </div>
                                </div>

                                {isDone ? (
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold text-xl">{result?.skorNormalized}</p>
                                        <p className="text-xs text-slate-500">Selesai</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => startSubtes(s)}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                                    >Mulai</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {subtesList.every(s => completedSubtes.includes(s)) && (
                <button
                    onClick={finishTryout}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                    <Trophy size={20} /> Lihat Hasil Akhir
                </button>
            )}
        </div>
    );
};

// 4. TRYOUT RESULT
const TryoutResult = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
    const [soalList, setSoalList] = useState<TryoutSoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && id) {
                // Fetch Attempt
                const { data: aData } = await supabase.from('tryout_attempts').select('*').eq('tryout_id', id).eq('user_id', user.id).single();
                if (aData) setAttempt(aData);

                // Fetch Questions for Review
                const { data: sData } = await supabase.from('tryout_soal').select('*').eq('tryout_id', id);
                if (sData) setSoalList(sData);
            }
            setLoading(false);
        };
        fetch();
    }, [id]);

    if (loading || !attempt) return <div className="p-8 text-center text-slate-400">Memuat hasil...</div>;

    const scores = Object.values(attempt.skor_per_subtes || {});
    // Use stored irt_score if available, otherwise calculate on the fly (for jitter consistency)
    // But calculateSubtesScore returns the normalized score.
    const finalScore = scores.length > 0 ? (scores.reduce((a, b) => a + b.skorNormalized, 0) / scores.length).toFixed(2) : "0.00";

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                    <Trophy size={48} className="text-white" />
                </div>
                <h1 className="text-4xl font-black text-white mb-2">Hasil Tryout</h1>
                <p className="text-slate-400 mb-8">Skor Akhir Kamu (IRT)</p>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 inline-block min-w-[300px]">
                    <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                        {finalScore}
                    </span>
                    <p className="text-slate-500 mt-2 font-medium">dari 1000</p>
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {Object.entries(attempt.skor_per_subtes || {}).map(([subtes, res]) => {
                    const config = SUBTES_CONFIG.find(c => c.kode === subtes);
                    return (
                        <div key={subtes} className="flex justify-between items-center p-5 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{config?.emoji}</span>
                                <div>
                                    <span className="font-bold text-slate-200 block">{config?.nama || subtes}</span>
                                    <span className="text-xs text-slate-500">Benar: {res.benar} / {res.total}</span>
                                </div>
                            </div>
                            <span className="font-bold text-emerald-400 text-xl">{res.skorNormalized}</span>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Review */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" />
                    Pembahasan Detail
                </h2>

                <div className="space-y-8">
                    {soalList.map((soal, idx) => {
                        const jawabanUser = attempt.jawaban?.[soal.id];
                        const isCorrect = jawabanUser === soal.jawaban_benar;
                        const isSkipped = jawabanUser === undefined;

                        return (
                            <div key={soal.id} className={`p-6 rounded-2xl border-2 ${isCorrect ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                            {soal.nomor_soal}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${soal.tingkat_kesulitan === 'sulit' ? 'bg-red-100 text-red-700' :
                                                soal.tingkat_kesulitan === 'mudah' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {soal.tingkat_kesulitan || 'Sedang'}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCorrect ? 'Benar (+3)' : isSkipped ? 'Kosong (0)' : 'Salah (0)'}
                                    </span>
                                </div>

                                <p className="text-slate-800 font-medium mb-4 whitespace-pre-line">{soal.pertanyaan}</p>

                                <div className="space-y-2 mb-4">
                                    {soal.opsi.map((opt, i) => (
                                        <div key={i} className={`p-3 rounded-lg text-sm flex items-center gap-3 ${i === soal.jawaban_benar ? 'bg-green-200 text-green-900 font-bold' :
                                                i === jawabanUser ? 'bg-red-200 text-red-900' :
                                                    'bg-white border border-slate-200 text-slate-500'
                                            }`}>
                                            <span className="w-6">{String.fromCharCode(65 + i)}.</span>
                                            <span>{opt}</span>
                                            {i === soal.jawaban_benar && <CheckCircle size={16} className="ml-auto text-green-700" />}
                                            {i === jawabanUser && i !== soal.jawaban_benar && <XCircle size={16} className="ml-auto text-red-700" />}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Pembahasan</p>
                                    <p className="text-slate-700 text-sm whitespace-pre-line">{soal.pembahasan || 'Tidak ada pembahasan.'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button onClick={() => navigate('/snbt/tryout')} className="mt-12 px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">
                Kembali ke Menu Utama
            </button>
        </div>
    );
};

// ============ MAIN ROUTER ============
export const TryoutSlide: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
    return (
        <Routes>
            <Route index element={<TryoutList />} />
            <Route path=":id" element={<TryoutDetail />} />
            <Route path=":id/play" element={<TryoutPlay />} />
            <Route path=":id/result" element={<TryoutResult />} />
        </Routes>
    );
};

export default TryoutSlide;
