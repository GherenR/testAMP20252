import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Search, TrendingUp, Users, Target, ChevronRight,
    Sparkles, AlertTriangle, CheckCircle, XCircle, Flame,
    GraduationCap, BookOpen, Filter, ArrowRight, Zap
} from 'lucide-react';
import {
    PASSING_GRADE_DATA,
    getUniversitasList,
    searchProdi,
    hitungPeluang,
    ProdiData
} from '../../data/passingGrade';

interface PeluangSlideProps {
    isLoggedIn?: boolean;
    onLoginRequired?: () => void;
}

type JalurType = 'snbp' | 'snbt';

const KATEGORI_STYLE: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
    'AMAN': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', emoji: '🎯' },
    'OPTIMIS': { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300', emoji: '💪' },
    'COBA AJA': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', emoji: '🤞' },
    'BERAT': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', emoji: '😬' },
    'MUSTAHIL': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', emoji: '💀' }
};

export const PeluangSlide: React.FC<PeluangSlideProps> = ({
    isLoggedIn = false,
    onLoginRequired
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJalur, setSelectedJalur] = useState<JalurType>('snbt');
    const [selectedProdi, setSelectedProdi] = useState<ProdiData | null>(null);
    const [nilaiUser, setNilaiUser] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [selectedRumpun, setSelectedRumpun] = useState<'SEMUA' | 'SAINTEK' | 'SOSHUM'>('SEMUA');

    const { prodiId } = useParams<{ prodiId: string }>();
    const navigate = useNavigate();

    // Sync selected prodi with URL prodiId
    useEffect(() => {
        if (prodiId) {
            const prodi = PASSING_GRADE_DATA.find(p => p.id === prodiId);
            if (prodi) {
                setSelectedProdi(prodi);
            }
        } else {
            setSelectedProdi(null);
        }
    }, [prodiId]);

    const universitasList = useMemo(() => getUniversitasList(), []);

    const filteredProdi = useMemo(() => {
        let results = searchQuery.length >= 2
            ? searchProdi(searchQuery)
            : PASSING_GRADE_DATA;

        if (selectedRumpun !== 'SEMUA') {
            results = results.filter(p => p.rumpun === selectedRumpun);
        }

        return results.slice(0, 12);
    }, [searchQuery, selectedRumpun]);

    const peluangResult = useMemo(() => {
        if (!selectedProdi || !nilaiUser) return null;
        const nilai = parseFloat(nilaiUser);
        if (isNaN(nilai)) return null;
        return hitungPeluang(selectedProdi, selectedJalur, nilai);
    }, [selectedProdi, selectedJalur, nilaiUser]);

    const handleCekPeluang = () => {
        if (!isLoggedIn) {
            onLoginRequired?.();
            return;
        }
        setShowResult(true);
    };

    const handleSelectProdi = (prodi: ProdiData) => {
        navigate(prodi.id);
        setShowResult(false);
        setNilaiUser('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4 overflow-y-auto">
            {/* Header yang beda */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30 rotate-3">
                        🎲
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Cek Peluang Lolos
                        </h1>
                        <p className="text-slate-400 mt-1 text-sm sm:text-base">
                            Mau tau seberapa besar chance kamu? Masukin nilai, pilih prodi, kita hitung bareng!
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
                {/* Kolom Kiri - Search & Browse */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Search Box dengan style unik */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Ketik nama prodi atau kampus..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 rounded-2xl text-white placeholder-slate-500 border-2 border-transparent focus:border-amber-400/50 focus:outline-none transition-all text-sm"
                            />
                        </div>

                        {/* Filter Rumpun - Unik */}
                        <div className="flex gap-2 mt-4">
                            {(['SEMUA', 'SAINTEK', 'SOSHUM'] as const).map((rumpun) => (
                                <button
                                    key={rumpun}
                                    onClick={() => setSelectedRumpun(rumpun)}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedRumpun === rumpun
                                        ? 'bg-amber-400 text-slate-900'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {rumpun}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Daftar Prodi - Card style berbeda */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 max-h-[60vh] overflow-y-auto scrollbar-thin">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 px-2">
                            {searchQuery ? `Hasil untuk "${searchQuery}"` : 'Prodi Populer'}
                        </p>
                        <div className="space-y-2">
                            {filteredProdi.map((prodi, idx) => (
                                <button
                                    key={prodi.id}
                                    onClick={() => handleSelectProdi(prodi)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all group ${selectedProdi?.id === prodi.id
                                        ? 'bg-amber-400/20 border-2 border-amber-400'
                                        : 'bg-slate-800/50 border-2 border-transparent hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${prodi.rumpun === 'SAINTEK' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'
                                            }`}>
                                            {prodi.kodeUniv.slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold truncate ${selectedProdi?.id === prodi.id ? 'text-amber-300' : 'text-white'
                                                }`}>
                                                {prodi.prodi}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{prodi.universitas}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${prodi.rumpun === 'SAINTEK'
                                                    ? 'bg-cyan-500/20 text-cyan-400'
                                                    : 'bg-rose-500/20 text-rose-400'
                                                    }`}>
                                                    {prodi.rumpun}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                                                    {prodi.akreditasi}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`mt-1 transition-transform ${selectedProdi?.id === prodi.id ? 'text-amber-400 translate-x-1' : 'text-slate-600 group-hover:translate-x-1'
                                            }`} size={18} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan - Calculator & Result */}
                <div className="lg:col-span-3 space-y-4">
                    {selectedProdi ? (
                        <>
                            {/* Info Prodi Terpilih */}
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 text-indigo-200 text-xs uppercase tracking-widest mb-2">
                                        <GraduationCap size={14} />
                                        <span>Prodi Terpilih</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                                        {selectedProdi.prodi}
                                    </h2>
                                    <p className="text-indigo-200 font-medium">{selectedProdi.universitas}</p>

                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <div className="bg-white/10 rounded-2xl p-4">
                                            <p className="text-xs text-indigo-200 mb-1">Daya Tampung {selectedJalur.toUpperCase()}</p>
                                            <p className="text-2xl font-black text-white">
                                                {selectedProdi[selectedJalur].dayaTampung}
                                            </p>
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-4">
                                            <p className="text-xs text-indigo-200 mb-1">Peminat Tahun Lalu</p>
                                            <p className="text-2xl font-black text-white">
                                                {selectedProdi[selectedJalur].peminatTahunLalu.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rasio Keketatan Visual */}
                                    <div className="mt-4 bg-white/10 rounded-2xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-indigo-200">Rasio Keketatan</p>
                                            <p className="text-sm font-bold text-white">
                                                1 : {Math.round(selectedProdi[selectedJalur].rasioKeketatan)}
                                            </p>
                                        </div>
                                        <div className="h-3 bg-indigo-900/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, selectedProdi[selectedJalur].rasioKeketatan)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-indigo-300 mt-1">
                                            {selectedProdi[selectedJalur].rasioKeketatan > 50
                                                ? '🔥 Kompetitif banget!'
                                                : selectedProdi[selectedJalur].rasioKeketatan > 30
                                                    ? '⚡ Lumayan ketat'
                                                    : '✨ Masih terbuka lebar'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Calculator Box */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                    <Zap className="text-amber-400" size={20} />
                                    Hitung Peluang Kamu
                                </h3>

                                {/* Pilih Jalur */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <button
                                        onClick={() => { setSelectedJalur('snbp'); setShowResult(false); }}
                                        className={`p-4 rounded-2xl border-2 transition-all ${selectedJalur === 'snbp'
                                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        <p className="font-black text-lg">SNBP</p>
                                        <p className="text-xs opacity-70">Nilai Rapor</p>
                                    </button>
                                    <button
                                        onClick={() => { setSelectedJalur('snbt'); setShowResult(false); }}
                                        className={`p-4 rounded-2xl border-2 transition-all ${selectedJalur === 'snbt'
                                            ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        <p className="font-black text-lg">SNBT</p>
                                        <p className="text-xs opacity-70">Skor UTBK</p>
                                    </button>
                                </div>

                                {/* Input Nilai */}
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-2">
                                        {selectedJalur === 'snbp'
                                            ? 'Rata-rata Nilai Rapor (skala 100)'
                                            : 'Perkiraan Skor UTBK (200-800)'}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={selectedJalur === 'snbp' ? 'Contoh: 92.5' : 'Contoh: 650'}
                                        value={nilaiUser}
                                        onChange={(e) => { setNilaiUser(e.target.value); setShowResult(false); }}
                                        className="w-full px-4 py-4 bg-slate-800/70 rounded-2xl text-white text-xl font-bold placeholder-slate-600 border-2 border-transparent focus:border-amber-400/50 focus:outline-none transition-all text-center"
                                        min={selectedJalur === 'snbp' ? 0 : 200}
                                        max={selectedJalur === 'snbp' ? 100 : 800}
                                        step={selectedJalur === 'snbp' ? 0.1 : 1}
                                    />
                                </div>

                                {/* Tombol Hitung */}
                                <button
                                    onClick={handleCekPeluang}
                                    disabled={!nilaiUser}
                                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${nilaiUser
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5'
                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    {!isLoggedIn && nilaiUser ? (
                                        <>🔒 Login untuk Cek Peluang</>
                                    ) : (
                                        <>
                                            <Target size={20} />
                                            Hitung Sekarang!
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Hasil Perhitungan */}
                            {showResult && peluangResult && (
                                <div className={`rounded-3xl p-6 border-2 ${KATEGORI_STYLE[peluangResult.kategori].bg} ${KATEGORI_STYLE[peluangResult.kategori].border}`}>
                                    <div className="text-center">
                                        <p className="text-6xl mb-2">{KATEGORI_STYLE[peluangResult.kategori].emoji}</p>
                                        <p className={`text-5xl font-black ${KATEGORI_STYLE[peluangResult.kategori].text}`}>
                                            {peluangResult.persen}%
                                        </p>
                                        <p className={`text-2xl font-black mt-2 ${KATEGORI_STYLE[peluangResult.kategori].text}`}>
                                            {peluangResult.kategori}
                                        </p>
                                        <p className="text-sm text-slate-600 mt-4 max-w-md mx-auto">
                                            {peluangResult.kategori === 'AMAN' && 'Mantap! Dengan nilai segini, kamu punya peluang besar. Tapi tetap kerja keras ya!'}
                                            {peluangResult.kategori === 'OPTIMIS' && 'Bagus! Peluang kamu cukup oke. Tingkatkan lagi biar makin pede.'}
                                            {peluangResult.kategori === 'COBA AJA' && 'Worth a shot! Emang agak ketat, tapi miracle happens. Gas terus!'}
                                            {peluangResult.kategori === 'BERAT' && 'Hmm, lumayan berat sih. Coba explore prodi lain sebagai backup.'}
                                            {peluangResult.kategori === 'MUSTAHIL' && 'Jujur aja, ini berat banget. Mending fokus ke target yang lebih realistis.'}
                                        </p>

                                        {/* Perbandingan dengan minimum */}
                                        <div className="mt-6 p-4 bg-white/50 rounded-2xl">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Nilai kamu</span>
                                                <span className="font-bold text-slate-900">{nilaiUser}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-2">
                                                <span className="text-slate-600">Estimasi minimum lolos</span>
                                                <span className="font-bold text-slate-900">
                                                    {selectedJalur === 'snbp'
                                                        ? selectedProdi.snbp.estimasiMinRapor
                                                        : selectedProdi.snbt.estimasiMinSkor}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-slate-300">
                                                <span className="text-slate-600">Selisih</span>
                                                <span className={`font-bold ${parseFloat(nilaiUser) >= (selectedJalur === 'snbp'
                                                    ? selectedProdi.snbp.estimasiMinRapor
                                                    : selectedProdi.snbt.estimasiMinSkor)
                                                    ? 'text-emerald-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {parseFloat(nilaiUser) >= (selectedJalur === 'snbp'
                                                        ? selectedProdi.snbp.estimasiMinRapor
                                                        : selectedProdi.snbt.estimasiMinSkor)
                                                        ? '+' : ''}
                                                    {(parseFloat(nilaiUser) - (selectedJalur === 'snbp'
                                                        ? selectedProdi.snbp.estimasiMinRapor
                                                        : selectedProdi.snbt.estimasiMinSkor)).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Prospek Kerja */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
                                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                                    Prospek Kerja Lulusan
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProdi.prospekKerja.map((kerja, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-sm font-medium"
                                        >
                                            {kerja}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State - Belum pilih prodi */
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                                <span className="text-5xl">👈</span>
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Pilih Prodi Dulu!</h3>
                            <p className="text-slate-400 max-w-sm mx-auto">
                                Cari dan pilih program studi yang kamu incar di kolom sebelah kiri. Nanti kita hitung peluang kamu bareng-bareng.
                            </p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="bg-slate-800/50 rounded-2xl p-4">
                                    <p className="text-3xl font-black text-amber-400">{PASSING_GRADE_DATA.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">Total Prodi</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-2xl p-4">
                                    <p className="text-3xl font-black text-cyan-400">{universitasList.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">Kampus</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-2xl p-4">
                                    <p className="text-3xl font-black text-rose-400">2</p>
                                    <p className="text-xs text-slate-500 mt-1">Jalur</p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left">
                                <p className="text-amber-300 text-sm font-bold flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Disclaimer
                                </p>
                                <p className="text-amber-200/70 text-xs mt-1">
                                    Data ini adalah ESTIMASI berdasarkan berbagai sumber publik.
                                    Bukan data resmi LTMPT. Gunakan sebagai referensi, bukan patokan pasti.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PeluangSlide;
