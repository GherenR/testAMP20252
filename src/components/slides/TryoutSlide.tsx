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
}

const calculateSubtesScore = (soalList: TryoutSoal[], jawaban: Record<string, number>): SubtesResult => {
    let benar = 0, salah = 0, skorMentah = 0, skorMaksimal = 0;
    soalList.forEach(soal => {
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
    return {
        subtes: soalList[0]?.subtes || '',
        benar, salah, total: soalList.length,
        skorMentah, skorMaksimal,
        skorNormalized: skorMaksimal > 0 ? Math.round((skorMentah / skorMaksimal) * 1000) : 0
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

    const handleStart = async () => {
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

        navigate('play');
    };

    if (loading || !tryout) return <div className="p-8 text-center text-slate-400">Memuat...</div>;

    // Determine status for UI
    const isLocked = tryout.password && !attempt;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <button onClick={() => navigate('..')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"><ArrowLeft size={18} /> Kembali</button>

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
        setTimeLeft((config?.waktuMenit || 20) * 60);
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
        navigate(`../result`);
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

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && id) {
                const { data } = await supabase.from('tryout_attempts').select('*').eq('tryout_id', id).eq('user_id', user.id).single();
                if (data) setAttempt(data);
            }
        };
        fetch();
    }, [id]);

    if (!attempt) return <div className="p-8 text-center text-slate-400">Memuat hasil...</div>;

    const scores = Object.values(attempt.skor_per_subtes || {});
    const finalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.skorNormalized, 0) / scores.length) : 0;

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <Trophy size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Hasii Tryout</h1>
            <p className="text-slate-400 mb-8">Skor Akhir Kamu</p>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
                <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{finalScore}</span>
                <p className="text-slate-500 mt-2">dari 1000</p>
            </div>

            <div className="grid gap-3 text-left">
                {Object.entries(attempt.skor_per_subtes || {}).map(([subtes, res]) => {
                    const config = SUBTES_CONFIG.find(c => c.kode === subtes);
                    return (
                        <div key={subtes} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{config?.emoji}</span>
                                <span className="font-bold text-slate-300">{config?.nama || subtes}</span>
                            </div>
                            <span className="font-bold text-emerald-400">{res.skorNormalized}</span>
                        </div>
                    );
                })}
            </div>

            <button onClick={() => navigate('../../tryout')} className="mt-8 px-8 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600">Kembali ke Menu</button>
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
