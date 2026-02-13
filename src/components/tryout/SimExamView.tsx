import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Grip, FileText, Cloud, Loader2, MessageSquareWarning, Moon, Sun, X, User, Type } from 'lucide-react';
import { TryoutSoal, TryoutAttempt } from '../../types';
import LatexRenderer from '../LatexRenderer';

interface SimulationExamViewProps {
    subtes: string;
    subtesName: string;
    soalList: TryoutSoal[];
    jawaban: Record<string, any>;
    onAnswer: (soalId: string, answer: any, isToggle?: boolean) => void;
    timeLeft: number;
    onFinishSubtes: () => void;
    currentNumber: number;
    onNavigate: (index: number) => void;
    flaggedQuestions: string[];
    onToggleFlag: (soalId: string) => void;
    userData?: { name: string; email: string };
    tryoutName?: string;
    isSaving?: boolean;
    onReport?: () => void;
}

// --- SUB COMPONENTS ---

const QuestionOptions: React.FC<{
    soal: TryoutSoal;
    jawaban: Record<string, any>;
    onAnswer: (soalId: string, answer: any, isToggle?: boolean) => void;
    isDarkMode: boolean;
    textClass: string;
    subText: string;
    zoomLevel: number;
}> = ({ soal, jawaban, onAnswer, isDarkMode, textClass, subText, zoomLevel }) => {

    const zoomMap: Record<number, number> = {
        0: 0.8,
        1: 0.9,
        2: 1.0,
        3: 1.25,
        4: 1.5
    };
    const multiplier = zoomMap[zoomLevel] || 1;

    const optStyle = {
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: `${15 * multiplier}px`,
        lineHeight: '1.6',
        fontWeight: '400'
    };

    return (
        <div className="space-y-4">
            {(soal.tipe_soal === 'pilihan_ganda' || !soal.tipe_soal) && (
                soal.opsi.map((opt, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    const isSelected = jawaban[soal.id] === idx;

                    return (
                        <button
                            key={idx}
                            onClick={() => onAnswer(soal.id, idx)}
                            className={`w-full text-left flex items-start gap-4 p-4 border transition-all group ${isSelected
                                ? (isDarkMode ? 'bg-blue-900/30 border-blue-500 shadow-sm' : 'bg-blue-50 border-blue-600 shadow-sm')
                                : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 shadow-sm' : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm')
                                } rounded-2xl`}
                        >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : (isDarkMode ? 'border-slate-600 text-slate-400 group-hover:border-slate-500' : 'border-slate-300 text-slate-500 group-hover:border-slate-400')
                                }`}>
                                {label}
                            </div>
                            <div className={`flex-1 ${textClass}`} style={optStyle}>
                                <LatexRenderer>{opt}</LatexRenderer>
                            </div>
                        </button>
                    );
                })
            )}

            {soal.tipe_soal === 'pg_kompleks' && (
                <div className="flex flex-col gap-4">
                    {soal.opsi.map((opt, idx) => {
                        const currentAns = Array.isArray(jawaban[soal.id]) ? jawaban[soal.id] : [];
                        const isSelected = currentAns.includes(idx);
                        return (
                            <label key={idx} className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${isSelected
                                ? (isDarkMode ? 'bg-blue-900/30 border-blue-500 shadow-sm' : 'bg-blue-50 border-blue-600 shadow-sm')
                                : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 shadow-sm' : 'bg-white border-slate-300 hover:border-slate-400 shadow-sm')
                                } rounded-2xl`}>
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : isDarkMode ? 'bg-slate-900 border-slate-600 text-slate-400' : 'bg-white border-slate-300'}`}>
                                    {isSelected && <CheckCircle size={14} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => onAnswer(soal.id, idx, true)}
                                />
                                <div style={optStyle} className={`flex-1 ${textClass}`}>
                                    <LatexRenderer>{opt}</LatexRenderer>
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}

            {soal.tipe_soal === 'benar_salah' && (
                <div className="mt-4">
                    <div className={`overflow-hidden border rounded-2xl ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} shadow-sm`}>
                        <table className="w-full text-sm text-left">
                            <thead className={`${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'} font-bold uppercase text-[10px] tracking-widest`}>
                                <tr>
                                    <th className="px-6 py-4 w-1/2">Pernyataan</th>
                                    <th className={`px-6 py-4 text-center w-1/4 border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>{soal.table_headers?.[0] || 'Benar'}</th>
                                    <th className={`px-6 py-4 text-center w-1/4 border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>{soal.table_headers?.[1] || 'Salah'}</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-200'} ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                                {soal.opsi.map((stmt, idx) => {
                                    const currentAns = Array.isArray(jawaban[soal.id]) ? jawaban[soal.id] : [];
                                    const val = currentAns[idx];
                                    return (
                                        <tr key={idx} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                            <td className="px-6 py-4">
                                                <div style={optStyle} className={textClass}>
                                                    <LatexRenderer>{stmt}</LatexRenderer>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-center border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                                <input
                                                    type="radio"
                                                    name={`bs-${soal.id}-${idx}`}
                                                    checked={val === true}
                                                    onChange={() => {
                                                        const next = [...(currentAns || [])];
                                                        next[idx] = true;
                                                        onAnswer(soal.id, next);
                                                    }}
                                                    className="w-5 h-5 text-blue-600 cursor-pointer"
                                                />
                                            </td>
                                            <td className={`px-6 py-4 text-center border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                                <input
                                                    type="radio"
                                                    name={`bs-${soal.id}-${idx}`}
                                                    checked={val === false}
                                                    onChange={() => {
                                                        const next = [...(currentAns || [])];
                                                        next[idx] = false;
                                                        onAnswer(soal.id, next);
                                                    }}
                                                    className="w-5 h-5 text-blue-600 cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {soal.tipe_soal === 'isian' && (
                <input
                    type="text"
                    value={jawaban[soal.id] || ''}
                    onChange={(e) => onAnswer(soal.id, e.target.value)}
                    placeholder="Ketik jawaban Anda di sini..."
                    className={`w-full p-6 border transition-all outline-none rounded-2xl font-bold text-lg shadow-sm ${isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600'
                        }`}
                    style={optStyle}
                />
            )}
        </div>
    );
};

const SimulationExamView: React.FC<SimulationExamViewProps> = ({
    subtes,
    subtesName,
    soalList,
    jawaban,
    onAnswer,
    timeLeft,
    onFinishSubtes,
    currentNumber,
    onNavigate,
    flaggedQuestions,
    onToggleFlag,
    userData,
    tryoutName,
    isSaving,
    onReport
}) => {
    // Format Time:  HH:MM:SS
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const [showTabWarning, setShowTabWarning] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [showDarkModeWarning, setShowDarkModeWarning] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);

    // Zoom Logic
    const [zoomLevel, setZoomLevel] = useState(2); // Index: 0 (0.8x), 1 (0.9x), 2 (1.0x), 3 (1.25x), 4 (1.5x)
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const zoomMap: Record<number, number> = {
        0: 0.8,
        1: 0.9,
        2: 1.0,
        3: 1.25,
        4: 1.5
    };

    // Dark Mode Hook
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('tryout_dark_mode') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('tryout_dark_mode', String(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        if (!isDarkMode) setShowDarkModeWarning(true);
        else setIsDarkMode(false);
    };

    const confirmDarkMode = () => {
        setIsDarkMode(true);
        setShowDarkModeWarning(false);
    };

    // Styling Tokens
    const textClass = isDarkMode ? 'text-slate-200' : 'text-slate-800';
    const bgClass = isDarkMode ? 'bg-slate-900' : 'bg-[#F5F5F5]';
    const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    // Count Answered
    const answeredCount = soalList.filter(s => {
        const ans = jawaban[s.id];
        return ans !== undefined && ans !== null && ans !== '' && (Array.isArray(ans) ? ans.length > 0 : true);
    }).length;

    // Visibility Change Hook
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) setShowTabWarning(true);
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    // Guard for empty data
    if (!soalList || soalList.length === 0 || !soalList[currentNumber]) {
        return (
            <div className={`fixed inset-0 ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'} flex flex-col items-center justify-center p-8 z-[200]`}>
                <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
                <p className="font-bold uppercase tracking-widest text-sm">Memuat data soal...</p>
            </div>
        );
    }

    const soal = soalList[currentNumber];
    const isFlagged = flaggedQuestions?.includes(soal.id);

    // Styling Tokens - Typography Refactor
    const multiplier = zoomMap[zoomLevel] || 1;
    const fontStyle = {
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        fontSize: `${15 * multiplier}px`,
        lineHeight: '1.6',
        fontWeight: '400'
    };

    return (
        <div className={`fixed inset-0 ${bgClass} flex flex-col z-[50] overflow-hidden transition-colors duration-300`}>

            {/* --- MODALS --- */}
            {showDarkModeWarning && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-6 text-center animate-in fade-in">
                    <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                        <Moon size={48} className="text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Mode Gelap (Dark Mode)</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Fitur ini <strong>TIDAK TERSEDIA</strong> pada sistem SNBT resmi.
                            Hanya untuk kenyamanan mata saat belajar di IKAHATA.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDarkModeWarning(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Batal</button>
                            <button onClick={confirmDarkMode} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">Aktifkan</button>
                        </div>
                    </div>
                </div>
            )}

            {showTabWarning && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-center animate-in fade-in">
                    <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden ring-4 ring-amber-500/20">
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">PERINGATAN!</h2>
                        <p className="text-slate-600 mb-10 font-bold leading-relaxed text-lg">
                            Anda terdeteksi meninggalkan halaman ujian. Aktivitas ini dicatat sebagai pelanggaran prosedur. Harap fokus pada layar simulasi.
                        </p>
                        <button onClick={() => setShowTabWarning(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl">SAYA MENGERTI</button>
                    </div>
                </div>
            )}

            {showFinishConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-center animate-in fade-in">
                    <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden text-slate-800 border-t-8 border-blue-600">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{tryoutName || 'KONFIRMASI AKHIR'}</h3>
                        <p className="text-slate-500 text-sm mb-8 font-bold">Subtes: {subtesName}</p>
                        <div className="flex justify-between items-center mb-8 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-left">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">TERISI</p>
                                <p className="text-xl font-black"><span className="text-blue-600">{answeredCount}</span> / {soalList.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">SISA WAKTU</p>
                                <p className="text-xl font-black text-blue-600 font-mono">{formatTime(timeLeft)}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-10 font-bold leading-relaxed">Setelah konfirmasi, Anda tidak dapat mengubah jawaban pada subtes ini. Apakah Anda yakin ingin mengakhiri sekarang?</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={onFinishSubtes} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">YA, SAYA SELESAI</button>
                            <button onClick={() => setShowFinishConfirm(false)} className="w-full py-4 text-slate-400 font-bold hover:bg-slate-100 rounded-2xl transition-all">KEMBALI KE SOAL</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={`h-16 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} border-b flex items-center justify-between px-6 z-20`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowMobileNav(true)} className={`lg:hidden p-2 rounded-xl ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <Grip size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/LogoIKAHATANewRBG.svg" alt="Logo" className="h-10 w-auto" />
                        <div className="flex flex-col">
                            <h1 className={`text-sm md:text-md font-black leading-tight ${isDarkMode ? 'text-white' : 'text-blue-900'} uppercase tracking-tight`}>IKAHATA TRYOUT</h1>
                            <p className={`text-[10px] font-bold ${subText}`}>{subtesName} </p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-center">
                    <span className={`text-[11px] ${subText} font-bold uppercase tracking-widest mb-0.5`}>Nomor</span>
                    <span className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentNumber + 1}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-center min-w-[100px] border-r pr-6 border-slate-200">
                        <div className="flex items-center gap-1.5 mb-1 h-4">
                            {isSaving ? (
                                <><Loader2 size={12} className="text-amber-500 animate-spin" /><span className="text-[9px] font-bold text-amber-500 uppercase">Saving</span></>
                            ) : (
                                <><CheckCircle size={12} className="text-emerald-500" /><span className="text-[9px] font-bold text-emerald-500 uppercase">Saved</span></>
                            )}
                        </div>
                        <div className={`text-lg font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatTime(timeLeft)}</div>
                    </div>
                    <button onClick={toggleDarkMode} className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Sidebar */}
                <div className={`w-[260px] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border-r flex flex-col shrink-0 hidden lg:flex transition-colors`}>
                    <div className="p-6 text-center">
                        <div className={`w-32 h-40 ${isDarkMode ? 'bg-slate-700' : 'bg-white shadow-sm'} mx-auto mb-4 border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'} rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:scale-[1.02]`}>
                            <User size={80} className={isDarkMode ? 'text-slate-500' : 'text-slate-300'} strokeWidth={1.5} />
                        </div>
                        <p className={`text-[10px] font-bold mb-1 ${subText} uppercase tracking-widest`}>Peserta Ujian</p>
                        <p className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>{userData?.name || 'PESERTA UJIAN'}</p>
                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-500'}`}>
                            ID-{userData?.email?.length || '0001'}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-2">
                            {soalList.map((s, idx) => {
                                const isAnswered = jawaban[s.id] !== undefined && jawaban[s.id] !== null && jawaban[s.id] !== '' && (Array.isArray(jawaban[s.id]) ? jawaban[s.id].length > 0 : true);
                                const isF = flaggedQuestions?.includes(s.id);
                                const isC = currentNumber === idx;
                                let cClass = "";
                                if (isC) cClass = "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 z-10 border-blue-500";
                                else if (isF) cClass = "bg-amber-300 text-black border-amber-400";
                                else if (isAnswered) cClass = "bg-emerald-500 text-white border-emerald-400";
                                else cClass = isDarkMode ? "bg-slate-700 border-slate-600 text-slate-400" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400";
                                return (
                                    <button key={s.id} onClick={() => onNavigate(idx)} className={`h-10 w-full rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${cClass}`}>{idx + 1}</button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 text-center">
                        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-white shadow-sm border border-slate-100'}`}>
                            <p className={`text-[10px] font-bold ${isDarkMode ? 'text-indigo-400' : 'text-blue-900'} mb-1 uppercase tracking-widest`}>SNBT POTENSI SKOLASTIK</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">IKAHATA © 2025</p>
                        </div>
                    </div>
                </div>

                {/* Main Question Area */}
                <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'} overflow-hidden relative`}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <div className="p-8 md:p-14 w-full text-left font-sans">
                            <div className="max-w-4xl">
                                {soal.teks_bacaan && (
                                    <div className={`mb-12 pb-12 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <div className="flex items-center gap-2 mb-6">
                                            <span className="w-8 h-px bg-slate-200"></span>
                                            <span className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Bacaan Utama</span>
                                            <span className="w-20 h-px bg-slate-200"></span>
                                        </div>
                                        <div style={fontStyle} className="text-justify">
                                            <LatexRenderer className={textClass}>
                                                {soal.teks_bacaan}
                                            </LatexRenderer>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-8">
                                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full border border-blue-200 uppercase">Soal {currentNumber + 1}</span>
                                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 uppercase">{soal.tipe_soal?.replace('_', ' ') || 'Pilihan Ganda'}</span>
                                </div>

                                {soal.image_url && (
                                    <div className="mb-10 p-4 border border-slate-100 rounded-3xl bg-slate-50/50">
                                        <img src={soal.image_url} className="max-w-full rounded-2xl" alt="Soal" />
                                    </div>
                                )}

                                <div className={`mb-12 ${textClass}`} style={fontStyle}>
                                    <LatexRenderer>{soal.pertanyaan}</LatexRenderer>
                                </div>

                                <QuestionOptions soal={soal} jawaban={jawaban} onAnswer={onAnswer} isDarkMode={isDarkMode} textClass={textClass} subText={subText} zoomLevel={zoomLevel} />

                                <div className="h-24"></div> {/* Spacer for fixed footer */}
                            </div>
                        </div>

                    </div>

                    {/* Floating Zoom Controls - Minimal & Collapsible (Sticky) */}
                    <div className="absolute bottom-24 right-6 flex flex-col items-end gap-2 z-40">
                        {showZoomMenu && (
                            <div className="flex flex-col gap-1 p-1 bg-white dark:bg-slate-800 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
                                <button onClick={() => { setZoomLevel(4); setShowZoomMenu(false); }} className={`w-10 h-10 rounded-xl text-[16px] font-black flex items-center justify-center transition-all ${zoomLevel === 4 ? 'bg-blue-600 text-white shadow-lg' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Sangat Besar">A++</button>
                                <button onClick={() => { setZoomLevel(3); setShowZoomMenu(false); }} className={`w-10 h-10 rounded-xl text-[14px] font-black flex items-center justify-center transition-all ${zoomLevel === 3 ? 'bg-blue-600 text-white shadow-lg' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Besar">A+</button>
                                <button onClick={() => { setZoomLevel(2); setShowZoomMenu(false); }} className={`w-10 h-10 rounded-xl text-[12px] font-black flex items-center justify-center transition-all ${zoomLevel === 2 ? 'bg-blue-600 text-white shadow-lg' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Normal">A</button>
                                <button onClick={() => { setZoomLevel(1); setShowZoomMenu(false); }} className={`w-10 h-10 rounded-xl text-[11px] font-black flex items-center justify-center transition-all ${zoomLevel === 1 ? 'bg-blue-600 text-white shadow-lg' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Kecil">A-</button>
                                <button onClick={() => { setZoomLevel(0); setShowZoomMenu(false); }} className={`w-10 h-10 rounded-xl text-[10px] font-black flex items-center justify-center transition-all ${zoomLevel === 0 ? 'bg-blue-600 text-white shadow-lg' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Sangat Kecil">A--</button>
                            </div>
                        )}
                        <button
                            onClick={() => setShowZoomMenu(!showZoomMenu)}
                            className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all active:scale-95 border-2 ${showZoomMenu
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-600'
                                }`}
                            title="Pengaturan Ukuran Font"
                        >
                            <Type size={22} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Footer Navigation - Modern Style */}
                    <div className={`h-20 border-t flex items-center justify-between px-6 md:px-12 shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'}`}>
                        <button disabled={currentNumber === 0} onClick={() => onNavigate(currentNumber - 1)} className="flex items-center gap-2.5 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs md:text-sm hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all active:scale-95">
                            <ChevronLeft size={20} /><span className="hidden md:inline">SEBELUMNYA</span>
                        </button>

                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer select-none group">
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isFlagged ? 'bg-amber-400 border-amber-400' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    <input type="checkbox" checked={isFlagged || false} onChange={() => onToggleFlag(soal.id)} className="hidden" />
                                    {isFlagged && <Clock size={14} className="text-amber-900" />}
                                </div>
                                <span className={`text-xs md:text-sm font-black uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>RAGU-RAGU</span>
                            </label>
                        </div>

                        {currentNumber < soalList.length - 1 ? (
                            <button onClick={() => onNavigate(currentNumber + 1)} className="flex items-center gap-2.5 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs md:text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                <span className="hidden md:inline">SELANJUTNYA</span><ChevronRight size={20} />
                            </button>
                        ) : (
                            <button onClick={() => setShowFinishConfirm(true)} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs md:text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 uppercase">Akhiri Ujian</button>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile Nav Drawer */}
            {showMobileNav && (
                <div className="fixed inset-0 z-[200] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowMobileNav(false)}></div>
                    <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 rounded-r-3xl`}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-blue-900/5 transition-colors">
                            <img src="/LogoIKAHATANewRBG.svg" className="h-8" alt="Logo" />
                            <button onClick={() => setShowMobileNav(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>

                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 text-center bg-white dark:bg-slate-800 transition-colors">
                            <div className={`w-20 h-24 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'} mx-auto mb-3 border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'} rounded-2xl flex items-center justify-center overflow-hidden shadow-sm transition-all`}>
                                <User size={48} className={isDarkMode ? 'text-slate-500' : 'text-slate-300'} strokeWidth={1.5} />
                            </div>
                            <p className={`text-[9px] font-bold mb-0.5 ${subText} uppercase tracking-widest`}>Peserta</p>
                            <p className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userData?.name || 'PESERTA UJIAN'}</p>
                            <p className={`text-[9px] font-mono mt-1 ${subText}`}>ID-{userData?.email?.length || '0001'}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-5 gap-2">
                                {soalList.map((s, idx) => {
                                    const isA = jawaban[s.id] !== undefined;
                                    const isF = flaggedQuestions?.includes(s.id);
                                    const isC = currentNumber === idx;
                                    let cClass = isC ? "bg-blue-600 text-white" : isF ? "bg-amber-300 text-black" : isA ? "bg-emerald-500 text-white" : isDarkMode ? "bg-slate-700" : "bg-white border-slate-200";
                                    return (
                                        <button key={s.id} onClick={() => { onNavigate(idx); setShowMobileNav(false); }} className={`h-11 w-full rounded-xl border text-sm font-bold flex items-center justify-center ${cClass}`}>{idx + 1}</button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                            <button onClick={() => { setShowFinishConfirm(true); setShowMobileNav(false); }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs">Selesai Sekarang</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationExamView;