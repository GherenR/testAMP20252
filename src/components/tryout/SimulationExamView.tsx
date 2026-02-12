import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Grip } from 'lucide-react';
import { TryoutSoal, TryoutAttempt } from '../../types';
import LatexRenderer from '../LatexRenderer';

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
}

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
    userData
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

    return (
        <div className="fixed inset-0 bg-[#F5F5F5] text-black font-sans flex flex-col z-50 overflow-hidden">
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

            {/* --- HEADER --- */}
            <div className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-6 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <img src="/LogoIKAHATANewRBG.svg" alt="Logo" className="w-12 h-12 object-contain" />
                    <div className="hidden md:block">
                        <h1 className="text-lg font-bold text-blue-900 leading-tight">SISTEM TRYOUT SNBT IKAHATA</h1>
                        <p className="text-xs text-slate-500">Ikatan Alumni SMA Hang Tuah 1 Jakarta</p>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Sisa Waktu</p>
                    <div className="text-xl font-mono font-bold text-slate-800">
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden">
                {/* --- LEFT SIDEBAR (User & Nav) --- */}
                <div className="w-[300px] bg-white border-r border-slate-300 flex flex-col shrink-0 hidden lg:flex">
                    {/* User Profile Info */}
                    <div className="p-6 border-b border-slate-200 text-center">
                        <div className="w-24 h-32 bg-slate-200 mx-auto mb-3 border border-slate-300 shadow-inner flex items-center justify-center text-slate-400">
                            {/* Photo Placeholder */}
                            <span className="text-xs">FOTO</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded text-sm font-bold text-slate-800 mb-1">
                            {userData?.email?.split('@')[0] || 'PESERTA UJIAN'}
                        </div>
                        <p className="text-xs text-slate-500 uppercase font-bold">{userData?.name || 'SISWA'}</p>
                    </div>

                    {/* Subtest Info */}
                    <div className="p-4 bg-[#F0F4F8] border-b border-slate-200">
                        <p className="text-xs text-slate-500 font-bold mb-1">KOMPONEN UJIAN</p>
                        <p className="text-sm font-bold text-blue-900">{subtesName}</p>
                    </div>

                    {/* Navigation Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <p className="text-xs text-center mb-3 font-bold text-slate-400">DAFTAR SOAL</p>
                        <div className="grid grid-cols-5 gap-2">
                            {soalList.map((s, idx) => {
                                const isAnswered = jawaban[s.id] !== undefined && jawaban[s.id] !== null && jawaban[s.id] !== '';
                                const isFlagged = flaggedQuestions?.includes(s.id);
                                const isCurrent = currentNumber === idx;

                                let bgClass = "bg-white border-slate-300 text-slate-700"; // default
                                if (isCurrent) bgClass = "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200";
                                else if (isFlagged) bgClass = "bg-amber-300 text-black border-amber-400";
                                else if (isAnswered) bgClass = "bg-slate-800 text-white border-slate-800";

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
                </div>

                {/* --- RIGHT AREA (Question) --- */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    {/* Question Header */}
                    <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-500">Nomor Soal</span>
                            <span className="text-2xl font-bold text-black">{currentNumber + 1}</span>
                        </div>
                        <div className="flex gap-2">
                            <button className="lg:hidden p-2 bg-slate-100 rounded text-slate-600">
                                <Grip size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Question Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        <div className="max-w-4xl mx-auto w-full">
                            {/* Reading Passage (Split layout if exists) */}
                            {soal.teks_bacaan && (
                                <div className="mb-8 p-6 bg-[#F9F9F9] border border-slate-200 rounded-sm">
                                    <LatexRenderer className="text-base text-justify leading-relaxed font-serif text-slate-800">
                                        {soal.teks_bacaan}
                                    </LatexRenderer>
                                </div>
                            )}

                            {/* Image */}
                            {soal.image_url && (
                                <div className="mb-6">
                                    <img
                                        src={soal.image_url}
                                        alt="Ilustrasi Soal"
                                        className="max-w-full md:max-w-2xl mx-auto border border-slate-200 max-h-[400px] object-contain"
                                    />
                                </div>
                            )}

                            {/* Question Text */}
                            <div className="mb-8">
                                <LatexRenderer className="text-lg text-slate-900 leading-relaxed font-medium">
                                    {soal.pertanyaan}
                                </LatexRenderer>
                            </div>

                            {/* Options */}
                            <div className="space-y-4 max-w-3xl">
                                {(!soal.tipe_soal || soal.tipe_soal === 'pilihan_ganda') && soal.opsi.map((opt, idx) => {
                                    const isSelected = jawaban[soal.id] === idx;
                                    return (
                                        <label
                                            key={idx}
                                            className="flex items-start gap-4 p-2 cursor-pointer group"
                                        >
                                            <div className="relative pt-1">
                                                <input
                                                    type="radio"
                                                    name={`soal-${soal.id}`}
                                                    checked={isSelected}
                                                    onChange={() => onAnswer(soal.id, idx)}
                                                    className="peer sr-only"
                                                />
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all
                                                    ${isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'bg-white border-slate-400 text-slate-600 group-hover:border-blue-400'}
                                                `}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                            </div>
                                            <div className="flex-1 pt-1.5 md:pt-2">
                                                <LatexRenderer className="text-slate-800 text-base">{opt}</LatexRenderer>
                                            </div>
                                        </label>
                                    );
                                })}

                                {soal.tipe_soal === 'pg_kompleks' && (
                                    <div className="space-y-3">
                                        <p className="text-sm text-slate-500 italic mb-2">Pilih jawaban yang benar (bisa lebih dari satu):</p>
                                        {soal.opsi.map((opt, idx) => {
                                            const currentAns = Array.isArray(jawaban[soal.id]) ? jawaban[soal.id] : [];
                                            const isSelected = currentAns.includes(idx);
                                            return (
                                                <label key={idx} className="flex items-center gap-4 p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-white">
                                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-400'}`}>
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
                        </div>
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

                        {currentNumber < soalList.length - 1 ? (
                            <button
                                onClick={() => onNavigate(currentNumber + 1)}
                                className="px-6 py-2.5 bg-blue-600 shadow-sm rounded text-white font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
                            >
                                <span className="hidden sm:inline">SELANJUTNYA</span> <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={onFinishSubtes}
                                className="px-8 py-2.5 bg-emerald-600 shadow-sm rounded text-white font-bold text-sm hover:bg-emerald-700"
                            >
                                SELESAI
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationExamView;
