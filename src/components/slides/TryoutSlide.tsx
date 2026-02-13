import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Play, Clock, Calendar, Lock, ChevronRight, Trophy, BookOpen,
    ArrowLeft, ArrowRight, CheckCircle, Timer, AlertTriangle, Unlock,
    Target, Award, XCircle, Save, RotateCcw, X, MinusCircle, FileText
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { SUBTES_CONFIG } from '../../data/bankSoal';
import { Routes, Route, useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import LatexRenderer from '../LatexRenderer';

import SimulationExamView from '../tryout/SimExamView';
import ReviewExamView from '../tryout/ReviewExamView';
import ReportIssueModal from '../system/ReportIssueModal';
import { Tryout, TryoutSoal, TryoutAttempt, SubtesResult } from '../../types';

// Helper to determine if a subtest result is actually finished (has score)
const isSubtesFinished = (res: any) => res && typeof res.skorNormalized === 'number';

const calculateSubtesScore = (soalList: TryoutSoal[], jawaban: Record<string, any>): SubtesResult => {
    let benar = 0, salah = 0, skorMentah = 0, skorMaksimal = 0;
    soalList.forEach(soal => {
        // Use bobot if available, otherwise default to 2
        // If not in DB, use 2
        const bobot = soal.bobot_nilai || 2;
        skorMaksimal += bobot;
        if (jawaban[soal.id] !== undefined) {
            let isCorrect = false;
            const userAns = jawaban[soal.id];

            switch (soal.tipe_soal) {
                case 'pg_kompleks':
                    // Compare arrays of indices
                    if (Array.isArray(userAns) && Array.isArray(soal.jawaban_kompleks)) {
                        isCorrect = userAns.length === soal.jawaban_kompleks.length &&
                            userAns.every(val => soal.jawaban_kompleks.includes(val));
                    }
                    break;
                case 'isian':
                    // Case-insensitive string match
                    if (typeof userAns === 'string' && typeof soal.jawaban_kompleks === 'string') {
                        isCorrect = userAns.trim().toLowerCase() === soal.jawaban_kompleks.trim().toLowerCase();
                    }
                    break;
                case 'benar_salah':
                    // Compare arrays of booleans
                    if (Array.isArray(userAns) && Array.isArray(soal.jawaban_kompleks)) {
                        isCorrect = userAns.length === soal.jawaban_kompleks.length &&
                            userAns.every((val, idx) => val === soal.jawaban_kompleks[idx]);
                    }
                    break;
                case 'pilihan_ganda':
                default:
                    isCorrect = userAns === soal.jawaban_benar;
                    break;
            }

            if (isCorrect) {
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
                    onClick={() => {
                        if (attempt?.completed_at) {
                            navigate(`/snbt/tryout/${tryout.id}/result`);
                        } else {
                            handleStart();
                        }
                    }}
                    className={`w-full py-4 bg-gradient-to-r ${attempt?.completed_at ? 'from-emerald-500 to-green-600' : 'from-indigo-500 to-violet-600'} text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                    {attempt ? (
                        attempt.completed_at ? (
                            <><Trophy size={18} /> Lihat Hasil (Selesai)</>
                        ) : (
                            <>Lanjutkan Pengerjaan <ChevronRight size={20} /></>
                        )
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

    // Data Loading State
    const [subtesList, setSubtesList] = useState<string[]>([]);
    const [completedSubtes, setCompletedSubtes] = useState<string[]>([]);
    const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
    const [soalBySubtes, setSoalBySubtes] = useState<Record<string, TryoutSoal[]>>({});
    const [userInfo, setUserInfo] = useState<{ email?: string, user_metadata?: any } | null>(null);
    const [tryoutName, setTryoutName] = useState('');
    const [loading, setLoading] = useState(true);

    // Common State for Selection
    const [showSimulationIntro, setShowSimulationIntro] = useState(false);
    const [pendingSubtes, setPendingSubtes] = useState<string | null>(null);

    const refreshAttempt = useCallback(async () => {
        if (!id) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: aData } = await supabase.from('tryout_attempts')
                .select('*').eq('tryout_id', id).eq('user_id', user.id).single();

            if (aData) {
                setAttempt(aData);
                const completedKeys = Object.keys(aData.skor_per_subtes || {}).filter(k => isSubtesFinished(aData.skor_per_subtes[k]));
                setCompletedSubtes(completedKeys);
            }
        }
    }, [id]);

    useEffect(() => {
        const init = async () => {
            if (!id) return;
            // Load Soal
            const { data: sData } = await supabase.from('tryout_soal').select('*').eq('tryout_id', id);
            if (sData) {
                const sortedSoal = [...sData].sort((a, b) => a.nomor_soal - b.nomor_soal);
                const grouped: Record<string, TryoutSoal[]> = {};
                sortedSoal.forEach(s => {
                    if (!grouped[s.subtes]) grouped[s.subtes] = [];
                    grouped[s.subtes].push(s);
                });
                setSoalBySubtes(grouped);
                setSubtesList(Object.keys(grouped));
            }

            // Tryout Name
            const { data: tData } = await supabase.from('tryouts').select('nama').eq('id', id).single();
            if (tData) setTryoutName(tData.nama);

            await refreshAttempt();

            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserInfo(user);

            setLoading(false);
        };
        init();
    }, [id, refreshAttempt]);

    const handleSubtesClick = (subtes: string) => {
        setPendingSubtes(subtes);
        setShowSimulationIntro(true);
    };

    const startSubtes = (subtes: string) => {
        navigate(`exam/${subtes}`);
    };

    const finishTryout = async () => {
        if (!attempt) return;
        const { error } = await supabase.from('tryout_attempts').update({
            completed_at: new Date().toISOString(),
            last_updated_at: new Date().toISOString()
        }).eq('id', attempt.id);

        if (!error) {
            navigate(`/snbt/tryout/${id}/result`);
        }
    };

    if (loading || !attempt) return <div className="p-12 text-center text-slate-400">Memuat data tryout...</div>;

    return (
        <Routes>
            <Route index element={
                <SubtestSelection
                    subtesList={subtesList}
                    completedSubtes={completedSubtes}
                    soalBySubtes={soalBySubtes}
                    attempt={attempt}
                    handleSubtesClick={handleSubtesClick}
                    finishTryout={finishTryout}
                    showSimulationIntro={showSimulationIntro}
                    setShowSimulationIntro={setShowSimulationIntro}
                    pendingSubtes={pendingSubtes}
                    startSubtes={startSubtes}
                />
            } />
            <Route path="exam/:subtestId" element={
                <ExamRouteWrapper
                    id={id!}
                    attempt={attempt}
                    soalBySubtes={soalBySubtes}
                    userInfo={userInfo}
                    tryoutName={tryoutName}
                    onFinishSubtes={refreshAttempt}
                />
            } />
            <Route path="review/:subtestId" element={
                <ReviewRouteWrapper
                    soalBySubtes={soalBySubtes}
                    attempt={attempt}
                    tryoutName={tryoutName}
                />
            } />
        </Routes>
    );
};

// --- Sub-components ---

const SubtestSelection = ({
    subtesList, completedSubtes, soalBySubtes, attempt,
    handleSubtesClick, finishTryout,
    showSimulationIntro, setShowSimulationIntro, pendingSubtes, startSubtes
}: any) => {
    const navigate = useNavigate();
    const isAllFinished = subtesList.length > 0 && subtesList.every((s: string) => completedSubtes.includes(s));
    const progressPercentage = Math.round((completedSubtes.length / Math.max(subtesList.length, 1)) * 100);

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-white mb-2 text-center">Pilih Subtes</h1>
            <p className="text-slate-500 text-center mb-10">Selesaikan seluruh subtes untuk melihat hasil akhir</p>

            <div className="mb-10 max-w-md mx-auto bg-slate-800/30 p-4 rounded-3xl border border-white/5">
                <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-black uppercase tracking-widest">
                    <span>Progres Belajar</span>
                    <span>{completedSubtes.length} / {subtesList.length} Subtest</span>
                </div>
                <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            <div className="grid gap-4 mb-10">
                {subtesList.map((s: string) => {
                    const isDone = completedSubtes.includes(s);
                    const config = SUBTES_CONFIG.find(c => c.kode === s);
                    const result = attempt.skor_per_subtes?.[s];

                    return (
                        <div key={s} className={`group relative p-6 rounded-3xl border-2 transition-all ${isDone ? 'bg-slate-800/40 border-slate-700/50 opacity-80' : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 hover:-translate-y-1'}`}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110 ${isDone ? 'bg-slate-700 text-slate-500 shadow-none' : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/20'}`}>
                                        {config?.emoji || '📝'}
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-xl mb-1 ${isDone ? 'text-slate-500' : 'text-white'}`}>{config?.nama || s}</h3>
                                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            <span className="flex items-center gap-1"><BookOpen size={14} /> {soalBySubtes[s]?.length} Soal</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {config?.waktuMenit} Menit</span>
                                        </div>
                                    </div>
                                </div>

                                {isDone ? (
                                    <div className="text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="px-3 py-1 bg-emerald-500/10 rounded-lg">
                                                <span className="text-emerald-400 font-extrabold text-sm uppercase tracking-widest">Selesai</span>
                                            </div>
                                            {isAllFinished && (
                                                <button
                                                    onClick={() => navigate(`review/${s}`)}
                                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-tight"
                                                >
                                                    Tinjau Ulang
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSubtesClick(s)}
                                        className="px-8 py-3 bg-white text-slate-900 hover:bg-indigo-50 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-white/5"
                                    >MULAI</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showSimulationIntro && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-10 text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-inner">
                            <img src="/LogoIKAHATANewRBG.svg" alt="Logo" className="w-14 h-14 object-contain" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">SIAP SIMULASI?</h3>
                        <p className="text-slate-500 mb-10 font-bold uppercase tracking-widest text-[10px]">Sistem Tryout SNBT IKAHATA</p>

                        <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-10 text-left relative">
                            <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-400 text-amber-950 rounded-lg text-[10px] font-black flex items-center gap-1.5 shadow-md">
                                <AlertTriangle size={12} strokeWidth={3} /> PERHATIAN
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                Antarmuka (UI) ujian ini telah disesuaikan agar <strong>semirip mungkin</strong> dengan tampilan asli UTBK.
                                <br /><br />
                                <span className="opacity-70 text-xs italic">* Gunakan laptop/PC untuk pengalaman terbaik.</span>
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowSimulationIntro(false)}
                                className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 font-extrabold rounded-2xl hover:bg-slate-200"
                            >NANTI DULU</button>
                            <button
                                onClick={() => {
                                    setShowSimulationIntro(false);
                                    if (pendingSubtes) startSubtes(pendingSubtes);
                                }}
                                className="flex-1 py-4 px-6 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                            >GAS MULAI!</button>
                        </div>
                    </div>
                </div>
            )}

            {isAllFinished && (
                <button
                    onClick={finishTryout}
                    className="w-full py-5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white font-black rounded-3xl shadow-2xl hover:shadow-orange-500/40 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 uppercase tracking-widest"
                >
                    <Trophy size={24} /> Lihat Hasil Akhir
                </button>
            )}
        </div>
    );
};

const ExamRouteWrapper = ({ id, attempt, soalBySubtes, userInfo, tryoutName, onFinishSubtes }: any) => {
    const { subtestId } = useParams<{ subtestId: string }>();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [jawaban, setJawaban] = useState<Record<string, any>>(attempt?.jawaban || {});
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>(attempt?.flagged_questions || []);
    const [isSaving, setIsSaving] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const sList = useMemo(() => subtestId ? (soalBySubtes[subtestId] || []) : [], [subtestId, soalBySubtes]);
    const config = useMemo(() => subtestId ? SUBTES_CONFIG.find(c => c.kode === subtestId) : null, [subtestId]);

    useEffect(() => {
        if (!subtestId || !attempt) return;

        const startSession = async () => {
            const existing = attempt.skor_per_subtes?.[subtestId];
            const duration = (config?.waktuMenit || 30) * 60;

            if (existing?.started_at && !existing?.finished_at) {
                const start = new Date(existing.started_at).getTime();
                const now = Date.now();
                const elapsed = Math.floor((now - start) / 1000);
                setTimeLeft(Math.max(duration - elapsed, 0));
            } else if (!existing?.finished_at) {
                // Start a new session
                const startTime = new Date().toISOString();
                const newScores = {
                    ...(attempt.skor_per_subtes || {}),
                    [subtestId]: { started_at: startTime }
                };
                await supabase.from('tryout_attempts').update({ skor_per_subtes: newScores }).eq('id', attempt.id);
                setTimeLeft(duration);
            }
        };
        startSession();
    }, [subtestId, attempt, config]);

    const handleSelectAnswer = async (soalId: string, val: any, isToggle: boolean = false) => {
        const newJawaban = { ...jawaban };
        if (isToggle) {
            const curr = Array.isArray(newJawaban[soalId]) ? [...newJawaban[soalId]] : [];
            if (curr.includes(val)) newJawaban[soalId] = curr.filter((v: any) => v !== val);
            else newJawaban[soalId] = [...curr, val];
        } else {
            newJawaban[soalId] = val;
        }
        setJawaban(newJawaban);
        setIsSaving(true);
        await supabase.from('tryout_attempts').update({ jawaban: newJawaban }).eq('id', attempt.id);
        setIsSaving(false);
    };

    const finishSubtes = async () => {
        if (!subtestId || !attempt) return;
        const res = calculateSubtesScore(sList, jawaban);
        res.subtes = subtestId;
        res.finished_at = new Date().toISOString();
        const existing = attempt.skor_per_subtes?.[subtestId];
        if (existing?.started_at) res.started_at = existing.started_at;

        const newScores = { ...attempt.skor_per_subtes, [subtestId]: res };
        const { error } = await supabase.from('tryout_attempts')
            .update({ skor_per_subtes: newScores, jawaban })
            .eq('id', attempt.id);

        if (!error) {
            await onFinishSubtes();
            navigate('../', { relative: 'path' });
        }
    };

    if (!subtestId || sList.length === 0) return null;

    return (
        <>
            <SimulationExamView
                subtes={subtestId}
                subtesName={config?.nama || 'Subtes'}
                soalList={sList}
                jawaban={jawaban}
                onAnswer={handleSelectAnswer}
                timeLeft={timeLeft}
                onFinishSubtes={finishSubtes}
                currentNumber={currentIndex}
                onNavigate={setCurrentIndex}
                flaggedQuestions={flaggedQuestions}
                onToggleFlag={async (id: string) => {
                    const newFlags = flaggedQuestions.includes(id) ? flaggedQuestions.filter(f => f !== id) : [...flaggedQuestions, id];
                    setFlaggedQuestions(newFlags);
                    await supabase.from('tryout_attempts').update({ flagged_questions: newFlags }).eq('id', attempt.id);
                }}
                userData={{
                    name: userInfo?.user_metadata?.full_name || userInfo?.user_metadata?.name || 'Peserta',
                    email: userInfo?.email || ''
                }}
                tryoutName={tryoutName}
                isSaving={isSaving}
                onReport={() => setShowReportModal(true)}
            />
            <ReportIssueModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} meta={{ tryout_id: id, subtes: subtestId, mode: 'exam' }} />
        </>
    );
};

const ReviewRouteWrapper = ({ soalBySubtes, attempt, tryoutName }: any) => {
    const { subtestId } = useParams<{ subtestId: string }>();
    const navigate = useNavigate();
    const config = subtestId ? SUBTES_CONFIG.find(c => c.kode === subtestId) : null;
    const sList = subtestId ? (soalBySubtes[subtestId] || []) : [];

    if (!subtestId) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white">
            <ReviewExamView
                subtesName={config?.nama || 'Subtes'}
                soalList={sList}
                jawaban={attempt?.jawaban || {}}
                onClose={() => navigate('../', { relative: 'path' })}
                tryoutName={tryoutName}
            />
        </div>
    );
}

// 4. TRYOUT RESULT
const TryoutResult = () => {
    const { id, subtestId: subtestParam } = useParams<{ id: string, subtestId?: string }>();
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

    const allScores = Object.values(attempt.skor_per_subtes || {}).map(s => s as SubtesResult);

    // Filter out "ghost" scores: 
    // 1. Must be finished (finished_at exists or has a valid score)
    // 2. Must have a corresponding config in SUBTES_CONFIG (avoid internal/undefined subtests)
    const scores = allScores.filter(s => {
        const hasConfig = SUBTES_CONFIG.some(c => c.kode === s.subtes);
        const isFinished = typeof s.skorNormalized === 'number' && (s.finished_at || s.total > 0);
        return hasConfig && isFinished;
    });

    // Use stored irt_score if available, otherwise calculate on the fly (for jitter consistency)
    const finalScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b.skorNormalized, 0) / scores.length).toFixed(2)
        : "0.00";

    // Analytics
    const sortedByScore = [...scores].sort((a, b) => b.skorNormalized - a.skorNormalized);
    const strongest = sortedByScore.slice(0, 2);
    const weakest = sortedByScore.slice(-2).reverse();

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

                {/* --- SMART ANALYTICS --- */}
                {scores.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-12">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                            <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><CheckCircle size={16} /> Kompetensi Terkuat</h4>
                            <div className="space-y-1">
                                {strongest.map(s => (
                                    <div key={s.subtes} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">{SUBTES_CONFIG.find(c => c.kode === s.subtes)?.nama}</span>
                                        <span className="text-emerald-400 font-bold">{s.skorNormalized}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                            <h4 className="text-rose-400 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Perlu Ditingkatkan</h4>
                            <div className="space-y-1">
                                {weakest.map(s => (
                                    <div key={s.subtes} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-300">{SUBTES_CONFIG.find(c => c.kode === s.subtes)?.nama}</span>
                                        <span className="text-rose-400 font-bold">{s.skorNormalized}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {scores.map((res) => {
                    const subtes = res.subtes;
                    const config = SUBTES_CONFIG.find(c => c.kode === subtes);
                    return (
                        <div key={subtes} className="flex flex-col p-5 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{config?.emoji}</span>
                                    <div>
                                        <span className="font-bold text-slate-200 block">{config?.nama || subtes}</span>
                                        <span className="text-xs text-slate-500">Benar: {res.benar} / {res.total}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-emerald-400 text-xl">{res.skorNormalized}</span>
                            </div>

                            <button
                                onClick={() => navigate(`review/${subtes}`)}
                                className="w-full py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-bold transition-all border border-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                <BookOpen size={16} /> Lihat Pembahasan
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Unified Review Modal via Routes */}
            <Routes>
                <Route path="review/:subtestId" element={
                    <ReviewModalWrapper
                        id={id || ''}
                        soalList={soalList}
                        jawaban={attempt.jawaban}
                    />
                } />
            </Routes>

            <button onClick={() => navigate('/snbt/tryout')} className="mt-12 px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">
                Kembali ke Menu Utama
            </button>
        </div>
    );
};

// Helper component to manage review state based on URL
const ReviewModalWrapper = ({ id, soalList, jawaban }: { id: string, soalList: TryoutSoal[], jawaban: any }) => {
    const { subtestId } = useParams<{ subtestId: string }>();
    const navigate = useNavigate();

    if (!subtestId) return null;

    const subtesName = SUBTES_CONFIG.find(c => c.kode === subtestId)?.nama || 'Pembahasan';
    const filteredSoal = soalList.filter(s => s.subtes === subtestId);

    return (
        <div className="fixed inset-0 z-[100] bg-white">
            <ReviewExamView
                subtesName={subtesName}
                soalList={filteredSoal}
                jawaban={jawaban}
                onClose={() => navigate(`/snbt/tryout/${id}/result`)}
                tryoutName="Pembahasan Soal"
            />
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
            <Route path=":id/result/*" element={<TryoutResult />} />
        </Routes>
    );
};

export default TryoutSlide;
