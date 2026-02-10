import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Play, Clock, Calendar, Lock, ChevronRight, Trophy, BookOpen,
    ArrowLeft, CheckCircle, Timer, AlertTriangle, Unlock,
    Target, Award, XCircle
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { SUBTES_CONFIG } from '../../data/bankSoal';

// ============ INTERFACES ============
interface Tryout {
    id: string;
    nama: string;
    deskripsi: string;
    tanggal_rilis: string;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    is_active: boolean;
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

interface TryoutSlideProps {
    isLoggedIn?: boolean;
    onLoginRequired?: () => void;
}

type ViewMode = 'list' | 'detail' | 'subtes-select' | 'playing' | 'subtes-result' | 'final-result';

// ============ IRT SCORING SYSTEM ============
// Bobot: Mudah=1, Sedang=2, Sulit(HOTS)=3
// Skor akhir = (Skor Mentah / Skor Maksimal) * 1000
const calculateSubtesScore = (
    soalList: TryoutSoal[],
    jawaban: Record<string, number>
): SubtesResult => {
    let benar = 0;
    let salah = 0;
    let skorMentah = 0;
    let skorMaksimal = 0;

    soalList.forEach(soal => {
        const bobot = soal.bobot_nilai || 2;
        skorMaksimal += bobot;

        const jawabanUser = jawaban[soal.id];
        if (jawabanUser !== undefined) {
            if (jawabanUser === soal.jawaban_benar) {
                benar++;
                skorMentah += bobot;
            } else {
                salah++;
            }
        }
    });

    const skorNormalized = skorMaksimal > 0
        ? Math.round((skorMentah / skorMaksimal) * 1000)
        : 0;

    return {
        subtes: soalList[0]?.subtes || '',
        benar,
        salah,
        total: soalList.length,
        skorMentah,
        skorMaksimal,
        skorNormalized
    };
};

const calculateFinalScore = (results: SubtesResult[]): number => {
    if (results.length === 0) return 0;
    const totalSkor = results.reduce((acc, r) => acc + r.skorNormalized, 0);
    return Math.round(totalSkor / results.length);
};

// ============ MAIN COMPONENT ============
export const TryoutSlide: React.FC<TryoutSlideProps> = ({ isLoggedIn = false, onLoginRequired }) => {
    const [tryouts, setTryouts] = useState<Tryout[]>([]);
    const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [loading, setLoading] = useState(true);

    const [tryoutSoal, setTryoutSoal] = useState<TryoutSoal[]>([]);
    const [soalBySubtes, setSoalBySubtes] = useState<Record<string, TryoutSoal[]>>({});

    const [currentSubtes, setCurrentSubtes] = useState<string | null>(null);
    const [currentSoalList, setCurrentSoalList] = useState<TryoutSoal[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [jawaban, setJawaban] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [completedSubtes, setCompletedSubtes] = useState<string[]>([]);
    const [subtesResults, setSubtesResults] = useState<SubtesResult[]>([]);
    const [currentSubtesResult, setCurrentSubtesResult] = useState<SubtesResult | null>(null);
    const [unlockedTryouts, setUnlockedTryouts] = useState<string[]>([]);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const fetchTryouts = async () => {
            try {
                const { data, error } = await supabase
                    .from('tryouts')
                    .select('*')
                    .order('tanggal_rilis', { ascending: false });

                if (!isMountedRef.current) return;
                if (error) console.error('Error fetching tryouts:', error);
                if (data) setTryouts(data);
            } catch (err) {
                if (!isMountedRef.current) return;
                console.error('Tryout fetch error:', err);
            } finally {
                if (isMountedRef.current) setLoading(false);
            }
        };

        fetchTryouts();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchTryoutSoal = async (tryoutId: string) => {
        try {
            const { data, error } = await supabase
                .from('tryout_soal')
                .select('*')
                .eq('tryout_id', tryoutId)
                .order('subtes')
                .order('nomor_soal');

            if (!isMountedRef.current) return;
            if (error) { console.error('Error fetching soal:', error); return; }

            if (data) {
                setTryoutSoal(data);
                const grouped: Record<string, TryoutSoal[]> = {};
                data.forEach(soal => {
                    if (!grouped[soal.subtes]) grouped[soal.subtes] = [];
                    grouped[soal.subtes].push(soal);
                });
                setSoalBySubtes(grouped);
            }
        } catch (err) {
            if (!isMountedRef.current) return;
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error('Error fetching soal:', err);
        }
    };

    const handleFinishSubtes = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!currentSubtes || currentSoalList.length === 0) return;

        const result = calculateSubtesScore(currentSoalList, jawaban);
        result.subtes = currentSubtes;

        setCurrentSubtesResult(result);
        setSubtesResults(prev => [...prev, result]);
        setCompletedSubtes(prev => [...prev, currentSubtes]);
        setViewMode('subtes-result');
    }, [currentSubtes, currentSoalList, jawaban]);

    useEffect(() => {
        if (viewMode !== 'playing' || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleFinishSubtes();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [viewMode, timeLeft, handleFinishSubtes]);

    const openTryoutDetail = async (tryout: Tryout) => {
        if (!isLoggedIn) { onLoginRequired?.(); return; }
        setSelectedTryout(tryout);
        await fetchTryoutSoal(tryout.id);
        setViewMode('detail');
    };

    const unlockTryout = () => {
        if (!selectedTryout) return;
        setUnlockedTryouts(prev => [...prev, selectedTryout.id]);
        setCompletedSubtes([]);
        setSubtesResults([]);
        setJawaban({});
        setViewMode('subtes-select');
    };

    const startSubtes = (subtes: string) => {
        const soalList = soalBySubtes[subtes] || [];
        if (soalList.length === 0) { alert('Tidak ada soal untuk subtes ini'); return; }

        const config = SUBTES_CONFIG.find(c => c.kode === subtes);
        const waktuMenit = config?.waktuMenit || 30;

        setCurrentSubtes(subtes);
        setCurrentSoalList(soalList);
        setCurrentIndex(0);
        setTimeLeft(waktuMenit * 60);
        setViewMode('playing');
    };

    const handleSelectAnswer = (soalId: string, optionIndex: number) => {
        setJawaban(prev => ({ ...prev, [soalId]: optionIndex }));
    };

    const continueToNextSubtes = () => {
        const allSubtes = Object.keys(soalBySubtes);
        const remaining = allSubtes.filter(s => !completedSubtes.includes(s) && s !== currentSubtes);

        if (remaining.length === 0) {
            setViewMode('final-result');
        } else {
            setCurrentSubtesResult(null);
            setViewMode('subtes-select');
        }
    };

    const resetAndBackToList = () => {
        setSelectedTryout(null);
        setTryoutSoal([]);
        setSoalBySubtes({});
        setCurrentSubtes(null);
        setCurrentSoalList([]);
        setCurrentIndex(0);
        setJawaban({});
        setTimeLeft(0);
        setCompletedSubtes([]);
        setSubtesResults([]);
        setCurrentSubtesResult(null);
        setViewMode('list');
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const canStart = (t: Tryout) => new Date(t.tanggal_mulai) <= new Date();
    const isExpired = (t: Tryout) => t.tanggal_selesai && new Date(t.tanggal_selesai) < new Date();

    const getTryoutStats = () => {
        const totalSoal = tryoutSoal.length;
        const subtesCount = Object.keys(soalBySubtes).length;
        let totalWaktu = 0;
        Object.keys(soalBySubtes).forEach(subtes => {
            const config = SUBTES_CONFIG.find(c => c.kode === subtes);
            totalWaktu += config?.waktuMenit || 30;
        });
        return { totalSoal, subtesCount, totalWaktu };
    };

    // ============ LIST VIEW ============
    if (viewMode === 'list') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white mb-2">Tryout SNBT</h1>
                        <p className="text-slate-400">Latihan soal dengan format dan penilaian mirip UTBK</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center animate-pulse">
                                <BookOpen className="text-indigo-400" size={24} />
                            </div>
                            <p className="text-slate-500">Memuat tryout...</p>
                        </div>
                    ) : tryouts.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                            <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
                            <p className="text-slate-400">Belum ada tryout tersedia</p>
                            <p className="text-slate-500 text-sm mt-2">Admin belum membuat tryout</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tryouts.map(t => {
                                const expired = isExpired(t);
                                const canStartNow = canStart(t);

                                return (
                                    <button key={t.id} onClick={() => openTryoutDetail(t)} className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10 hover:border-indigo-500/50 transition-all text-left group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{t.nama}</h3>
                                                    {expired && <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded-full">Selesai</span>}
                                                    {!canStartNow && !expired && <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">Segera</span>}
                                                    {canStartNow && !expired && t.is_active && <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">Aktif</span>}
                                                </div>
                                                {t.deskripsi && <p className="text-slate-400 text-sm mt-1">{t.deskripsi}</p>}
                                                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar size={14} /> Mulai: {formatDate(t.tanggal_mulai)}</span>
                                                    {t.tanggal_selesai && <span className="flex items-center gap-1"><Clock size={14} /> Selesai: {formatDate(t.tanggal_selesai)}</span>}
                                                </div>
                                            </div>
                                            <ChevronRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={24} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ============ DETAIL VIEW ============
    if (viewMode === 'detail' && selectedTryout) {
        const stats = getTryoutStats();
        const isUnlocked = unlockedTryouts.includes(selectedTryout.id);
        const canStartNow = canStart(selectedTryout);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <button onClick={resetAndBackToList} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={20} /> Kembali
                    </button>

                    <div className="bg-white/5 backdrop-blur rounded-3xl p-6 border border-white/10">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                <BookOpen className="text-indigo-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white">{selectedTryout.nama}</h2>
                            {selectedTryout.deskripsi && <p className="text-slate-400 mt-2">{selectedTryout.deskripsi}</p>}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-emerald-400">{stats.totalSoal}</p>
                                <p className="text-xs text-slate-500">Total Soal</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-amber-400">{stats.totalWaktu}</p>
                                <p className="text-xs text-slate-500">Menit</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-violet-400">{stats.subtesCount}</p>
                                <p className="text-xs text-slate-500">Subtes</p>
                            </div>
                        </div>

                        {Object.keys(soalBySubtes).length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-slate-300 mb-3">Detail Per Subtes:</p>
                                <div className="space-y-2">
                                    {Object.entries(soalBySubtes).map(([subtes, soalList]) => {
                                        const config = SUBTES_CONFIG.find(c => c.kode === subtes);
                                        return (
                                            <div key={subtes} className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span>{config?.emoji || '📝'}</span>
                                                    <span className="text-sm text-slate-300">{config?.nama || subtes}</span>
                                                </div>
                                                <div className="text-sm text-slate-500">{soalList.length} soal • {config?.waktuMenit || 30} menit</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                            <div className="flex gap-3">
                                <AlertTriangle className="text-amber-400 flex-shrink-0" size={20} />
                                <div className="text-sm text-amber-200">
                                    <p className="font-semibold">Perhatian:</p>
                                    <ul className="list-disc list-inside mt-1 text-amber-300/80 space-y-1">
                                        <li>Setelah mulai subtes, timer tidak bisa di-pause</li>
                                        <li>Jawaban otomatis tersimpan saat waktu habis</li>
                                        <li>Skor dihitung dengan sistem pembobotan (IRT)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {!canStartNow ? (
                            <div className="text-center py-4 bg-slate-800/50 rounded-xl">
                                <Lock className="mx-auto text-amber-500 mb-2" size={24} />
                                <p className="text-slate-400">Tryout belum dibuka</p>
                                <p className="text-sm text-slate-500">Mulai: {formatDate(selectedTryout.tanggal_mulai)}</p>
                            </div>
                        ) : isUnlocked ? (
                            <button onClick={() => setViewMode('subtes-select')} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all">
                                <Play size={20} /> Lanjutkan Tryout
                            </button>
                        ) : (
                            <button onClick={unlockTryout} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all">
                                <Unlock size={20} /> Daftar & Mulai Tryout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ============ SUBTES SELECTION ============
    if (viewMode === 'subtes-select' && selectedTryout) {
        const allSubtes = Object.keys(soalBySubtes);
        const allDone = allSubtes.every(s => completedSubtes.includes(s));

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-white">{selectedTryout.nama}</h2>
                        <p className="text-slate-400">Pilih subtes untuk dikerjakan</p>
                        <p className="text-sm text-indigo-400 mt-2">Progress: {completedSubtes.length}/{allSubtes.length} subtes selesai</p>
                    </div>

                    <div className="grid gap-3 mb-6">
                        {allSubtes.map(subtes => {
                            const isDone = completedSubtes.includes(subtes);
                            const result = subtesResults.find(r => r.subtes === subtes);
                            const config = SUBTES_CONFIG.find(c => c.kode === subtes);
                            const soalCount = soalBySubtes[subtes]?.length || 0;

                            return (
                                <button key={subtes} onClick={() => !isDone && startSubtes(subtes)} disabled={isDone}
                                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${isDone ? 'bg-emerald-500/10 border-emerald-500/30 cursor-default' : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{config?.emoji || '📝'}</span>
                                        <div>
                                            <p className={`font-bold ${isDone ? 'text-emerald-400' : 'text-white'}`}>{config?.nama || subtes}</p>
                                            <p className="text-sm text-slate-500">{soalCount} soal • {config?.waktuMenit || 30} menit</p>
                                        </div>
                                    </div>
                                    {isDone && result ? (
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-bold">{result.skorNormalized}</p>
                                            <p className="text-xs text-slate-500">{result.benar}/{result.total} benar</p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-indigo-400"><Play size={18} /><span className="font-semibold">Mulai</span></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {allDone && (
                        <button onClick={() => setViewMode('final-result')} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                            <Trophy size={20} /> Lihat Hasil Akhir
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ============ PLAYING ============
    if (viewMode === 'playing' && currentSubtes && currentSoalList.length > 0) {
        const currentSoal = currentSoalList[currentIndex];
        const config = SUBTES_CONFIG.find(c => c.kode === currentSubtes);
        const isTimeWarning = timeLeft <= 60;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-4 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-4 bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{config?.emoji || '📝'}</span>
                            <span className="text-white font-bold text-sm">{config?.nama || currentSubtes}</span>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${isTimeWarning ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            <Timer size={18} />{formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex gap-1 mb-6">
                        {currentSoalList.map((_, i) => (
                            <button key={i} onClick={() => setCurrentIndex(i)} className={`flex-1 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-indigo-500' : jawaban[currentSoalList[i]?.id] !== undefined ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                        ))}
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-slate-500 text-sm">Soal {currentIndex + 1} dari {currentSoalList.length}</p>
                            {currentSoal.tingkat_kesulitan && (
                                <span className={`px-2 py-0.5 text-xs rounded-full ${currentSoal.tingkat_kesulitan === 'mudah' ? 'bg-emerald-500/20 text-emerald-400' : currentSoal.tingkat_kesulitan === 'sulit' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {currentSoal.tingkat_kesulitan.charAt(0).toUpperCase() + currentSoal.tingkat_kesulitan.slice(1)}
                                </span>
                            )}
                        </div>
                        <p className="text-white whitespace-pre-line leading-relaxed">{currentSoal.pertanyaan}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                        {currentSoal.opsi.map((opt, i) => (
                            <button key={i} onClick={() => handleSelectAnswer(currentSoal.id, i)}
                                className={`w-full p-4 rounded-xl border text-left transition-all ${jawaban[currentSoal.id] === i ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/10'}`}>
                                <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-slate-800 mr-3 font-bold text-sm">{String.fromCharCode(65 + i)}</span>
                                {opt}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        {currentIndex > 0 && (
                            <button onClick={() => setCurrentIndex(i => i - 1)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors">Sebelumnya</button>
                        )}
                        {currentIndex < currentSoalList.length - 1 ? (
                            <button onClick={() => setCurrentIndex(i => i + 1)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">Selanjutnya</button>
                        ) : (
                            <button onClick={handleFinishSubtes} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors">Selesai Subtes</button>
                        )}
                    </div>

                    <p className="text-center text-slate-500 text-sm mt-4">
                        {Object.keys(jawaban).filter(k => currentSoalList.some(s => s.id === k)).length} dari {currentSoalList.length} soal terjawab
                    </p>
                </div>
            </div>
        );
    }

    // ============ SUBTES RESULT ============
    if (viewMode === 'subtes-result' && currentSubtesResult) {
        const config = SUBTES_CONFIG.find(c => c.kode === currentSubtesResult.subtes);
        const percentage = Math.round((currentSubtesResult.benar / currentSubtesResult.total) * 100);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center ${percentage >= 70 ? 'bg-emerald-500/20' : percentage >= 50 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
                        {percentage >= 70 ? <CheckCircle className="text-emerald-400" size={40} /> : percentage >= 50 ? <Target className="text-amber-400" size={40} /> : <XCircle className="text-red-400" size={40} />}
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">Subtes Selesai!</h2>
                    <p className="text-slate-400 mb-6">{config?.emoji} {config?.nama || currentSubtesResult.subtes}</p>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-6">
                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mb-2">{currentSubtesResult.skorNormalized}</p>
                        <p className="text-slate-400 text-sm">Skor (skala 0-1000)</p>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-emerald-500/10 rounded-xl p-3">
                                <p className="text-2xl font-bold text-emerald-400">{currentSubtesResult.benar}</p>
                                <p className="text-xs text-slate-500">Benar</p>
                            </div>
                            <div className="bg-red-500/10 rounded-xl p-3">
                                <p className="text-2xl font-bold text-red-400">{currentSubtesResult.salah}</p>
                                <p className="text-xs text-slate-500">Salah</p>
                            </div>
                            <div className="bg-slate-500/10 rounded-xl p-3">
                                <p className="text-2xl font-bold text-slate-400">{currentSubtesResult.total - currentSubtesResult.benar - currentSubtesResult.salah}</p>
                                <p className="text-xs text-slate-500">Kosong</p>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-slate-500">Akurasi: {percentage}% • Skor mentah: {currentSubtesResult.skorMentah}/{currentSubtesResult.skorMaksimal}</div>
                    </div>

                    <button onClick={continueToNextSubtes} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">Lanjut ke Subtes Berikutnya</button>
                </div>
            </div>
        );
    }

    // ============ FINAL RESULT ============
    if (viewMode === 'final-result' && selectedTryout) {
        const finalScore = calculateFinalScore(subtesResults);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Trophy className="text-white" size={48} />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-2">Tryout Selesai! 🎉</h2>
                    <p className="text-slate-400 mb-8">{selectedTryout.nama}</p>

                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 mb-6">
                        <p className="text-sm text-slate-500 mb-2">Skor Akhir</p>
                        <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 mb-2">{finalScore}</p>
                        <p className="text-slate-400">dari 1000</p>

                        <div className={`mt-4 px-4 py-2 rounded-full inline-flex items-center gap-2 ${finalScore >= 700 ? 'bg-emerald-500/20 text-emerald-400' : finalScore >= 500 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                            <Award size={18} />
                            {finalScore >= 700 ? 'Sangat Baik!' : finalScore >= 500 ? 'Cukup Baik' : 'Perlu Latihan Lagi'}
                        </div>

                        <div className="mt-8 space-y-3">
                            <p className="text-sm font-semibold text-slate-300 mb-3">Rincian Per Subtes:</p>
                            {subtesResults.map(result => {
                                const config = SUBTES_CONFIG.find(c => c.kode === result.subtes);
                                return (
                                    <div key={result.subtes} className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span>{config?.emoji || '📝'}</span>
                                            <span className="text-sm text-slate-300">{config?.nama || result.subtes}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${result.skorNormalized >= 700 ? 'text-emerald-400' : result.skorNormalized >= 500 ? 'text-amber-400' : 'text-red-400'}`}>{result.skorNormalized}</span>
                                            <span className="text-slate-500 text-sm ml-2">({result.benar}/{result.total})</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button onClick={resetAndBackToList} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors">Kembali ke Daftar Tryout</button>
                </div>
            </div>
        );
    }

    return null;
};

export default TryoutSlide;
