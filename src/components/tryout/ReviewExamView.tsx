import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { TryoutSoal } from '../../types';
import LatexRenderer from '../LatexRenderer';

interface ReviewExamViewProps {
    subtesName: string;
    soalList: TryoutSoal[];
    jawaban: Record<string, any>; // User's answers
    onClose: () => void;
    tryoutName?: string;
}

const ReviewExamView: React.FC<ReviewExamViewProps> = ({
    subtesName,
    soalList,
    jawaban,
    onClose,
    tryoutName
}) => {
    const [currentNumber, setCurrentNumber] = useState(0);
    const soal = soalList[currentNumber];
    const userAns = jawaban[soal.id];

    // Navigation
    const handleNavigate = (idx: number) => {
        if (idx >= 0 && idx < soalList.length) setCurrentNumber(idx);
    };

    return (
        <div className="fixed inset-0 bg-[#F5F5F5] text-black font-sans flex flex-col z-50 overflow-hidden">
            {/* --- HEADER --- */}
            <div className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-6 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-blue-900 leading-tight">PEMBAHASAN: {subtesName}</h1>
                        <p className="text-xs text-slate-500">{tryoutName || 'Tryout Review'}</p>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden">
                {/* --- LEFT SIDEBAR (Nav) --- */}
                <div className="w-[300px] bg-white border-r border-slate-300 flex flex-col shrink-0 hidden lg:flex">
                    <div className="p-4 bg-[#F0F4F8] border-b border-slate-200">
                        <p className="text-xs text-slate-500 font-bold mb-1">NAVIGASI SOAL</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Benar</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Salah</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 rounded-sm border border-slate-300"></span> Kosong</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-5 gap-2">
                            {soalList.map((s, idx) => {
                                const ans = jawaban[s.id];
                                let isCorrect = false;

                                // Simple check for PG (expand for others if needed)
                                if (s.tipe_soal === 'pilihan_ganda' || !s.tipe_soal) {
                                    isCorrect = ans === s.jawaban_benar;
                                }
                                // Fill other logic if needed, simplied for navigation color

                                const isCurrent = currentNumber === idx;
                                let bgClass = "bg-white border-slate-300 text-slate-700";

                                if (ans === undefined || ans === null) bgClass = "bg-slate-100 text-slate-400"; // Empty
                                else if (isCorrect) bgClass = "bg-green-500 text-white border-green-600";
                                else bgClass = "bg-red-500 text-white border-red-600";

                                if (isCurrent) bgClass += " ring-2 ring-blue-400 ring-offset-2";

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => handleNavigate(idx)}
                                        className={`h-10 w-full rounded border text-sm font-bold flex items-center justify-center transition-all ${bgClass}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT AREA (Question & Explanation) --- */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        <div className="max-w-4xl mx-auto w-full">
                            {/* Question Section */}
                            {soal.teks_bacaan && (
                                <div className="mb-8 p-6 bg-[#F9F9F9] border border-slate-200 rounded-sm">
                                    <LatexRenderer className="text-base text-justify leading-relaxed font-serif text-slate-800">
                                        {soal.teks_bacaan}
                                    </LatexRenderer>
                                </div>
                            )}

                            {soal.image_url && (
                                <div className="mb-6">
                                    <img src={soal.image_url} alt="Soal" className="max-w-full md:max-w-2xl mx-auto border border-slate-200 max-h-[400px] object-contain" />
                                </div>
                            )}

                            <div className="prose max-w-none mb-8 text-slate-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '16px', lineHeight: '1.6' }}>
                                <div className="flex gap-2 mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">No. {currentNumber + 1}</span>
                                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded capitalize">{soal.tipe_soal?.replace('_', ' ') || 'Pilihan Ganda'}</span>
                                </div>
                                <LatexRenderer>{soal.pertanyaan}</LatexRenderer>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-12">
                                {soal.opsi.map((opt, idx) => {
                                    const isSelected = userAns === idx;
                                    const isAnswerKey = soal.jawaban_benar === idx;

                                    let styleClass = "border-slate-300 bg-white";
                                    let icon = <div className="w-6 h-6 rounded-full border border-slate-400 flex items-center justify-center text-xs font-bold text-slate-500">{String.fromCharCode(65 + idx)}</div>;

                                    if (isAnswerKey) {
                                        styleClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                        icon = <CheckCircle size={24} className="text-green-600" />;
                                    } else if (isSelected && !isAnswerKey) {
                                        styleClass = "border-red-500 bg-red-50";
                                        icon = <XCircle size={24} className="text-red-600" />;
                                    }

                                    return (
                                        <div key={idx} className={`flex items-start gap-4 p-4 border rounded-xl transition-all ${styleClass}`}>
                                            <div className="shrink-0 pt-1">{icon}</div>
                                            <div className="flex-1 text-slate-800" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                                <LatexRenderer>{opt}</LatexRenderer>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* EXPLANATION BOX */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 animate-in slide-in-from-bottom-5">
                                <h3 className="text-blue-900 font-bold text-lg mb-4 flex items-center gap-2">
                                    <BookOpen size={24} /> Pembahasan
                                </h3>
                                <div className="prose max-w-none text-slate-700 leading-relaxed">
                                    {soal.pembahasan ? (
                                        <LatexRenderer>{soal.pembahasan}</LatexRenderer>
                                    ) : (
                                        <p className="italic text-slate-500">Belum ada pembahasan untuk soal ini.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Nav */}
                    <div className="h-20 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0">
                        <button
                            disabled={currentNumber === 0}
                            onClick={() => handleNavigate(currentNumber - 1)}
                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft className="inline mr-1" size={20} /> Sebelumnya
                        </button>
                        <button
                            disabled={currentNumber === soalList.length - 1}
                            onClick={() => handleNavigate(currentNumber + 1)}
                            className="px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg disabled:opacity-50"
                        >
                            Selanjutnya <ChevronRight className="inline ml-1" size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewExamView;
