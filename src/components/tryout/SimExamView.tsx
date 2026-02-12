import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Grip, FileText, Cloud, Loader2, MessageSquareWarning, Moon, Sun } from 'lucide-react';
import { TryoutSoal, TryoutAttempt } from '../../types';
import LatexRenderer from '../LatexRenderer';
import LogoIkahata from '../../LogoIKAHATANew.svg';

interface SimulationExamViewProps {
    subtes: string; // Current subtes code
    subtesName: string; // Current subtes name (e.g. "Penalaran Umum")
    soalList: TryoutSoal[];
    jawaban: Record<string, any>;
    onAnswer: (soalId: string, answer: any, isToggle?: boolean) => void;
    timeLeft: number; // Seconds
    onFinishSubtes: () => void;
    currentNumber: number; // 0-indexed
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
}> = ({ soal, jawaban, onAnswer, isDarkMode, textClass, subText }) => {
    return (
        <div className="space-y-3">
            {soal.tipe_soal === 'pilihan_ganda' || !soal.tipe_soal ? (
                soal.opsi.map((opt, idx) => {
                    const isSelected = jawaban[soal.id] === idx;
                    let styleClass = isDarkMode ? "border-slate-700 bg-slate-800 hover:border-slate-600" : "border-slate-300 bg-white hover:bg-slate-50";

                    if (isSelected) {
                        styleClass = "border-blue-500 bg-blue-50 ring-1 ring-blue-500";
                        // Dark mode selected override
                        if (isDarkMode) styleClass = "border-blue-500 bg-blue-900/30 ring-1 ring-blue-500";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => onAnswer(soal.id, idx)}
                            className={`w-full text-left flex items-start gap-4 p-4 border rounded-xl transition-all group ${styleClass}`}
                        >
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${isSelected ? 'bg-blue-500 text-white border-blue-500' : isDarkMode ? 'border-slate-600 text-slate-400 group-hover:border-slate-500' : 'border-slate-400 text-slate-500 group-hover:border-slate-600'}`}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <div className={`flex-1 ${isDarkMode ? (isSelected ? 'text-blue-200' : 'text-slate-300') : 'text-slate-800'}`} style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '15px' }}>
                                <LatexRenderer>{opt}</LatexRenderer>
                            </div>
                        </button>
                    );
                })
            ) : (
                <div className={`p-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'} border rounded-xl text-center italic`}>
                    Tipe soal ini ({soal.tipe_soal}) belum didukung penuh di simulasi UI ini.
                </div>
            )}

            {soal.tipe_soal === 'pg_kompleks' && (
                <div className="space-y-3">
                    <p className={`text-sm ${subText} italic mb-2`}>Pilih jawaban yang benar (bisa lebih dari satu):</p>
                    {soal.opsi.map((opt, idx) => {
                        const currentAns = Array.isArray(jawaban[soal.id]) ? jawaban[soal.id] : [];
                        const isSelected = currentAns.includes(idx);
                        return (
                            <label key={idx} className={`flex items-center gap-4 p-4 border ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 bg-white'} transition-colors`}>
                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : isDarkMode ? 'bg-slate-900 border-slate-600 text-slate-400' : 'bg-white border-slate-400'}`}>
                                    {isSelected && <CheckCircle size={14} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => onAnswer(soal.id, idx, true)} // 3rd arg isToggle
                                />
                                <LatexRenderer className="flex-1 text-slate-800 font-medium">{opt}</LatexRenderer>
                            </label>
                        );
                    })}
                </div>
            )}

            {soal.tipe_soal === 'benar_salah' && (
                <div className="mt-4">
                    <div className="overflow-hidden border border-slate-300 rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 w-1/2">Pernyataan</th>
                                    <th className="px-6 py-3 text-center w-1/4 border-l border-slate-200">Benar</th>
                                    <th className="px-6 py-3 text-center w-1/4 border-l border-slate-200">Salah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {soal.opsi.map((stmt, idx) => {
                                    const currentAns = Array.isArray(jawaban[soal.id]) ? jawaban[soal.id] : [];
                                    const val = currentAns[idx]; // true, false, or undefined

                                    return (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <LatexRenderer className="text-slate-800">{stmt}</LatexRenderer>
                                            </td>
                                            <td className="px-6 py-4 text-center border-l border-slate-200">
                                                <label className="inline-flex items-center justify-center p-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`bs-${soal.id}-${idx}`}
                                                        checked={val === true}
                                                        onChange={() => {
                                                            const next = [...(currentAns || [])];
                                                            next[idx] = true;
                                                            onAnswer(soal.id, next);
                                                        }}
                                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-center border-l border-slate-200">
                                                <label className="inline-flex items-center justify-center p-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`bs-${soal.id}-${idx}`}
                                                        checked={val === false}
                                                        onChange={() => {
                                                            const next = [...(currentAns || [])];
                                                            next[idx] = false;
                                                            onAnswer(soal.id, next);
                                                        }}
                                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                    />
                                                </label>
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
                    placeholder="Ketik jawaban Anda..."
                    className="w-full p-4 border border-slate-300 rounded font-bold text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
    const soal = soalList[currentNumber];
    const isFlagged = flaggedQuestions?.includes(soal.id);

    // Format Time:  HH:MM:SS (e.g., 00:02:04)
    // SNBT format often shows milliseconds too, but let's stick to HH:MM:SS for stability
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const [showTabWarning, setShowTabWarning] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    // Count Answered
    const answeredCount = soalList.filter(s => {
        const ans = jawaban[s.id];
        return ans !== undefined && ans !== null && ans !== '' && (Array.isArray(ans) ? ans.length > 0 : true);
    }).length;

    // Detect Tab Switching
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setShowTabWarning(true);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // Dark Mode Logic
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

    const [showDarkModeWarning, setShowDarkModeWarning] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false); // Mobile Nav State

    const toggleDarkMode = () => {
        if (!isDarkMode) {
            setShowDarkModeWarning(true);
        } else {
            setIsDarkMode(false);
        }
    };

    const confirmDarkMode = () => {
        setIsDarkMode(true);
        setShowDarkModeWarning(false);
    };

    // Helper class for dark mode text
    const textClass = isDarkMode ? 'text-slate-200' : 'text-slate-800';
    const bgClass = isDarkMode ? 'bg-slate-900' : 'bg-[#F5F5F5]';
    const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300';
    const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className={`fixed inset-0 ${bgClass} font-sans flex flex-col z-[50] overflow-hidden transition-colors duration-300`}>

            {/* Dark Mode Warning Modal */}
            {showDarkModeWarning && (
                <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-6 text-center animate-in fade-in">
                    <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl">
                        <Moon size={48} className="text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Mode Gelap (Dark Mode)</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Fitur ini <strong>TIDAK TERSEDIA</strong> pada sistem UTBK/SNBT resmi.
                            Kami menyediakannya hanya untuk kenyamanan mata saat belajar.
                            Disarankan untuk sesekali berlatih dengan Mode Terang agar terbiasa.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDarkModeWarning(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">Batal</button>
                            <button onClick={confirmDarkMode} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500">Aktifkan</button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- TAB SWITCH WARNING MODAL --- */}
            {showTabWarning && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-amber-500"></div>

                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-4">Peringatan Aktivitas</h2>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                            <p className="text-amber-800 font-medium">
                                Anda terdeteksi meninggalkan halaman ujian.
                            </p>
                        </div>

                        <p className="text-slate-600 mb-8 leading-relaxed">
                            "Tidak perlu membuka tab lain atau mencari jawaban.
                            <strong> Tryout ini adalah simulasi untuk mengukur kemampuan Anda sendiri.</strong>
                            <br /><br />
                            Tidak apa-apa jika salah sekarang. Justru <strong>SALAH-nya di Tryout</strong>,
                            supaya Anda tahu apa yang perlu diperbaiki sebelum ujian yang sesungguhnya."
                        </p>

                        <button
                            onClick={() => setShowTabWarning(false)}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Saya Mengerti, Kembali Mengerjakan
                        </button>
                    </div>
                </div>
            )}

            {/* --- FINISH CONFIRMATION MODAL --- */}
            {showFinishConfirm && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FileText size={48} />
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-6">{tryoutName || 'Tryout UTBK'}</h3>

                        <div className="flex justify-between items-center mb-6 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-left">
                                <p className="text-xs text-slate-500 font-bold uppercase">Soal Terisi</p>
                                <p className="text-xl font-black text-slate-800">
                                    <span className="text-blue-600">{answeredCount}</span> / {soalList.length}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-slate-300"></div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-bold uppercase">Sisa Waktu</p>
                                <p className="text-xl font-black text-slate-800 font-mono text-blue-600">{formatTime(timeLeft)}</p>
                            </div>
                        </div>

                        <p className="text-slate-600 text-sm mb-8 leading-relaxed px-2">
                            Jawaban tidak bisa dicek / diganti setelah melanjutkan sesi.
                            Tekan tombol batalkan di bawah untuk cek kembali, atau tekan tombol lanjutkan setelah kamu yakin selesai.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={onFinishSubtes}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                            >
                                Lanjutkan Ke Sesi Berikutnya
                            </button>
                            <button
                                onClick={() => setShowFinishConfirm(false)}
                                className="w-full py-3.5 text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-all"
                            >
                                Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className={`h-16 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} border-b flex items-center justify-between px-6 shadow-sm shrink-0 transition-colors`}>
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setShowMobileNav(true)}
                        className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        <Grip size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <img src={LogoIkahata} alt="IKAHATA Logo" className="h-10 w-auto" />
                        <div className="flex flex-col">
                            <h1 className={`text-lg font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-blue-900'} truncate`}>IKAHATA SNBT Tryout System</h1>
                            <p className={`text-xs ${subText} hidden md:block font-medium`}>{subtesName} - {tryoutName || 'Tryout UTBK'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        title="Ganti Mode Tampilan"
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="flex flex-col items-center">
                        {/* Saving Indicator */}
                        <div className="flex items-center gap-1.5 mb-1 h-4">
                            {isSaving ? (
                                <>
                                    <Loader2 size={12} className="text-amber-500 animate-spin" />
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">MENYIMPAN...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">TERSIMPAN</span>
                                </>
                            )}
                        </div>

                        <p className={`text-xs ${subText} font-bold uppercase tracking-wider mb-0.5`}>Sisa Waktu</p>
                        <div className={`text-xl font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden">
                {/* --- LEFT SIDEBAR (User & Nav) --- */}
                <div className={`w-[300px] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} border-r flex flex-col shrink-0 hidden lg:flex transition-colors`}>
                    {/* User Profile Info */}
                    <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} text-center`}>
                        <div className={`w-24 h-32 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} mx-auto mb-3 border ${isDarkMode ? 'border-slate-600' : 'border-slate-300'} shadow-inner flex items-center justify-center ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                            {/* Photo Placeholder */}
                            <span className="text-xs">FOTO</span>
                        </div>
                        <div className={`${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} p-2 rounded text-sm font-bold mb-1`}>
                            {userData?.email?.split('@')[0] || 'PESERTA UJIAN'}
                        </div>
                        <p className={`text-xs ${subText} uppercase font-bold`}>{userData?.name || 'SISWA'}</p>
                    </div>

                    {/* Subtest Info */}
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-[#F0F4F8] border-slate-200'} border-b`}>
                        <p className={`text-xs ${subText} font-bold mb-1`}>KOMPONEN UJIAN</p>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>{subtesName}</p>
                    </div>

                    {/* Navigation Grid */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-2">
                            {soalList.map((s, idx) => {
                                const isAnswered = jawaban[s.id] !== undefined && jawaban[s.id] !== null && jawaban[s.id] !== '' && (Array.isArray(jawaban[s.id]) ? jawaban[s.id].length > 0 : true);
                                const isFlagged = flaggedQuestions?.includes(s.id);
                                const isCurrent = currentNumber === idx;

                                let bgClass = "";
                                if (isCurrent) bgClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200";
                                else if (isFlagged) bgClass = "bg-amber-300 text-black border-amber-400";
                                else if (isAnswered) bgClass = "bg-slate-800 text-white border-slate-800";
                                else bgClass = isDarkMode ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => onNavigate(idx)}
                                        className={`h-10 w-full rounded border text-sm font-bold flex items-center justify-center transition-all ${bgClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar Footer */}
                    <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'} text-center`}>
                        <p className={`text-[10px] ${subText} font-semibold`}>
                            @ Ikatan Alumni SMA Hang Tuah 1 Jakarta
                        </p>
                    </div>
                </div>


                {/* --- MOBILE NAVIGATION DRAWER --- */}
                {
                    showMobileNav && (
                        <div className="fixed inset-0 z-[200] lg:hidden">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
                                onClick={() => setShowMobileNav(false)}
                            ></div>

                            {/* Drawer */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl flex flex-col animate-in slide-in-from-left duration-300`}>
                                <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
                                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Daftar Soal</h3>
                                    <button
                                        onClick={() => setShowMobileNav(false)}
                                        className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-5 gap-2">
                                        {soalList.map((s, idx) => {
                                            const isAnswered = jawaban[s.id] !== undefined && jawaban[s.id] !== null && jawaban[s.id] !== '';
                                            const isFlagged = flaggedQuestions?.includes(s.id);
                                            const isCurrent = currentNumber === idx;

                                            let bgClass = "";
                                            if (isCurrent) bgClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200";
                                            else if (isFlagged) bgClass = "bg-amber-300 text-black border-amber-400";
                                            else if (isAnswered) bgClass = "bg-slate-800 text-white border-slate-800";
                                            else bgClass = isDarkMode ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";

                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        onNavigate(idx);
                                                        setShowMobileNav(false);
                                                    }}
                                                    className={`h-10 w-full rounded border text-sm font-bold flex items-center justify-center transition-all ${bgClass}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-600 rounded-sm"></span> Saat Ini</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-800 rounded-sm"></span> Terjawab</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-300 rounded-sm"></span> Ragu</span>
                                        <span className="flex items-center gap-1"><span className={`w-2 h-2 border rounded-sm ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}></span> Kosong</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>

            {/* --- RIGHT AREA (Question) --- */}
            <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'} overflow-hidden relative transition-colors`}>
                {/* Question Header */}
                <div className={`h-14 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} flex items-center justify-between px-6 shrink-0 hidden lg:flex`}>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${subText}`}>Nomor Soal</span>
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{currentNumber + 1}</span>
                    </div>
                    <div className="flex gap-2">
                        <button className={`p-2 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            <Grip size={20} />
                        </button>
                    </div>
                </div >

                {/* Header Info Mobile */}
                <div className={`lg:hidden h-14 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'} border-b flex items-center justify-between px-4 shrink-0`}>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No. {currentNumber + 1}</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatTime(timeLeft)}</span>
                    </div>
                </div >

                {/* Question Content (Scrollable) */}
                <div className="flex-1 overflow-hidden relative flex">
                    {soal.teks_bacaan ? (
                        // --- SPLIT VIEW LAYOUT ---
                        <div className="flex w-full h-full flex-col lg:flex-row">
                            {/* Left Logic: Reading Passage */}
                            <div className={`w-full lg:w-1/2 h-full overflow-y-auto p-6 md:p-8 border-b lg:border-b-0 lg:border-r ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-[#F8F9FA]'}`}>
                                <div className="flex items-center gap-2 mb-4 sticky top-0 bg-inherit py-2 z-10">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-1 bg-slate-200/50 rounded-full">
                                        <FileText size={14} /> Bacaan Pendukung
                                    </div>
                                </div>
                                <LatexRenderer className={`text-base text-justify leading-relaxed font-serif ${isDarkMode ? 'text-slate-300' : 'text-slate-800'} pb-10`}>
                                    {soal.teks_bacaan}
                                </LatexRenderer>
                            </div>

                            {/* Right Logic: Question & Options */}
                            <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 md:p-8">
                                <div className="max-w-3xl mx-auto">
                                    {soal.image_url && (
                                        <div className="mb-6">
                                            <img
                                                src={soal.image_url}
                                                alt="Ilustrasi Soal"
                                                className={`max-w-full mx-auto border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} rounded-lg shadow-sm`}
                                            />
                                        </div>
                                    )}

                                    {/* Question Text */}
                                    <div className={`prose max-w-none mb-8 ${textClass}`} style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '15px', lineHeight: '1.6' }}>
                                        <div className="flex gap-2 mb-4">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">No. {currentNumber + 1}</span>
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded capitalize">{soal.tipe_soal?.replace('_', ' ') || 'Pilihan Ganda'}</span>
                                            {isFlagged && <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={10} /> Ragu-ragu</span>}
                                        </div>
                                        <LatexRenderer>{soal.pertanyaan}</LatexRenderer>
                                    </div>

                                    {/* Options Component (Reused) */}
                                    <div className="pb-10">
                                        <QuestionOptions
                                            soal={soal}
                                            jawaban={jawaban}
                                            onAnswer={onAnswer}
                                            isDarkMode={isDarkMode}
                                            textClass={textClass}
                                            subText={subText}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- SINGLE COLUMN LAYOUT (No Passage) ---
                        <div className="w-full h-full overflow-y-auto p-6 md:p-10">
                            <div className="max-w-4xl mx-auto w-full">
                                {soal.image_url && (
                                    <div className="mb-6">
                                        <img
                                            src={soal.image_url}
                                            alt="Ilustrasi Soal"
                                            className={`max-w-full md:max-w-2xl mx-auto border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} max-h-[400px] object-contain text-center`}
                                        />
                                    </div>
                                )}

                                <div className={`prose max-w-none mb-8 ${textClass}`} style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '16px', lineHeight: '1.6' }}>
                                    <div className="flex gap-2 mb-4">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">No. {currentNumber + 1}</span>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded capitalize">{soal.tipe_soal?.replace('_', ' ') || 'Pilihan Ganda'}</span>
                                        {isFlagged && <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={10} /> Ragu-ragu</span>}
                                    </div>
                                    <LatexRenderer>{soal.pertanyaan}</LatexRenderer>
                                </div>

                                <div className="space-y-3 pb-10">
                                    <QuestionOptions
                                        soal={soal}
                                        jawaban={jawaban}
                                        onAnswer={onAnswer}
                                        isDarkMode={isDarkMode}
                                        textClass={textClass}
                                        subText={subText}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Navigation Bar */}
                <div className="h-20 bg-[#F9F9F9] border-t border-slate-300 flex items-center justify-between px-6 shrink-0 z-10">
                    <button
                        disabled={currentNumber === 0}
                        onClick={() => onNavigate(currentNumber - 1)}
                        className="px-6 py-2.5 bg-white border border-slate-300 shadow-sm rounded text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft size={16} /> <span className="hidden sm:inline">SEBELUMNYA</span>
                    </button>

                    <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-2 rounded hover:bg-black/5">
                        <input
                            type="checkbox"
                            checked={isFlagged || false}
                            onChange={() => onToggleFlag(soal.id)}
                            className="w-5 h-5 text-amber-500 rounded border-slate-400 focus:ring-amber-500"
                        />
                        <span className="text-sm font-bold text-slate-700 uppercase">Ragu-Ragu</span>
                    </label>

                    {
                        currentNumber < soalList.length - 1 ? (
                            <button
                                onClick={() => onNavigate(currentNumber + 1)}
                                className="px-6 py-2.5 bg-blue-600 shadow-sm rounded text-white font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
                            >
                                <span className="hidden sm:inline">SELANJUTNYA</span> <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowFinishConfirm(true)}
                                className="px-8 py-2.5 bg-emerald-600 shadow-sm rounded text-white font-bold text-sm hover:bg-emerald-700"
                            >
                                SELESAI
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default SimulationExamView;