import React, { useState, useRef, useEffect } from 'react';
import {
  Target, Sparkles, Landmark, BookOpen, BrainCircuit,
  HelpCircle, Users, Phone, ArrowUpRight
} from 'lucide-react';
import { CONTACT_WA, COMMUNITY_WA_GROUP } from '../../constants';
import { Mentor, InstitutionCategory } from '../../types';
import { MentorCard } from '../MentorCard';
import { useAnalytics } from '../../hooks/useAnalytics';
import { getUniversitySuggestions } from '../../utils/universitySuggestions';

interface MentorMatchmakerSlideProps {
  matchTarget: InstitutionCategory;
  onMatchTargetChange: (target: InstitutionCategory) => void;
  matchPath: string;
  onMatchPathChange: (path: string) => void;
  matchUniversity: string;
  onMatchUniversityChange: (university: string) => void;
  matchMajor: string;
  onMatchMajorChange: (major: string) => void;
  isMatching: boolean;
  matchResults: { mentors: Mentor[]; score: number; type: 'exact' | 'partial' | 'none' } | null;
  subPaths: string[];
  onRunMatchmaker: () => void;
  onReset: () => void;
  onMentorSelect: (mentor: Mentor) => void;
  onMentorCompare?: (mentor: Mentor) => void;
  comparedMentors?: string[];
  onFavoriteToggle?: (mentorName: string) => void;
  isFavorite?: (name: string) => boolean;
}

/**
 * MentorMatchmakerSlide Component
 * Smart Match feature: Input form untuk mencari mentor dengan scoring algorithm
 * User input kategori, jalur, universitas, dan jurusan - sistem akan mencari mentor terbaik
 */

export const MentorMatchmakerSlide: React.FC<MentorMatchmakerSlideProps> = ({
  matchTarget,
  onMatchTargetChange,
  matchPath,
  onMatchPathChange,
  matchUniversity,
  onMatchUniversityChange,
  matchMajor,
  onMatchMajorChange,
  isMatching,
  matchResults,
  subPaths,
  onRunMatchmaker,
  onReset,
  onMentorSelect,
  onMentorCompare,
  comparedMentors = [],
  onFavoriteToggle,
  isFavorite
}) => {
  const [showUnivSuggestions, setShowUnivSuggestions] = useState(false);
  const univInputRef = useRef<HTMLInputElement>(null);
  const univDropdownRef = useRef<HTMLDivElement>(null);

  const suggestions = getUniversitySuggestions(matchUniversity);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        univInputRef.current && !univInputRef.current.contains(e.target as Node) &&
        univDropdownRef.current && !univDropdownRef.current.contains(e.target as Node)
      ) {
        setShowUnivSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-reveal pb-32 pt-6 sm:pt-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
        <div className="inline-flex p-2.5 sm:p-3 bg-indigo-600 rounded-2xl text-white mb-2 shadow-xl shadow-indigo-200">
          <Target size={28} className="sm:size-32" />
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-950 leading-none">
          THE SMART <span className="text-indigo-600">MATCH.</span>
        </h2>
        <p className="text-slate-500 font-medium text-base sm:text-lg max-w-xl mx-auto px-2">
          Masukkan target impianmu, sistem kami akan mencarikan alumni dengan rekam jejak paling relevan.
        </p>
      </div>

      {/* Main Content Grid - Stack on mobile, side-by-side on desktop */}
      <div className="grid lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-start">
        {/* Input Form (Left Column) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-6 md:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 sm:space-y-8">
          {/* Category Selection */}
          <div className="space-y-3 sm:space-y-4">
            <label htmlFor="category-group" className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Kategori Institusi
            </label>
            <div id="category-group" role="group" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['PTN', 'PTS', 'PTLN', 'All'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => onMatchTargetChange(cat)}
                  className={`py-4 sm:py-5 rounded-xl text-[10px] font-black transition-all border-2 touch-none active:scale-95 min-h-[44px] flex items-center justify-center ${matchTarget === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                    }`}
                >
                  {cat === 'All' ? 'SEMUA' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Path Selection */}
          <div className="space-y-3 sm:space-y-4">
            <label htmlFor="path-select" className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Jalur Masuk
            </label>
            <select
              id="path-select"
              value={matchPath}
              onChange={(e) => onMatchPathChange(e.target.value)}
              className="w-full p-4 sm:p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm appearance-none min-h-[48px] touch-none"
            >
              <option value="All">Semua Jalur...</option>
              {subPaths.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* University Input with Autocomplete */}
          <div className="space-y-3 sm:space-y-4">
            <label htmlFor="university-input" className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Universitas Impian
            </label>
            <div className="relative" ref={univInputRef}>
              <Landmark className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                id="university-input"
                type="text"
                placeholder="Ketik bebas: UI, ITB, Harvard..."
                autoComplete="off"
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 transition-all text-sm min-h-[48px] touch-none"
                value={matchUniversity}
                onChange={(e) => { onMatchUniversityChange(e.target.value); setShowUnivSuggestions(true); }}
                onFocus={() => setShowUnivSuggestions(true)}
              />
              {showUnivSuggestions && suggestions.length > 0 && (
                <div
                  ref={univDropdownRef}
                  className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border-2 border-slate-200 rounded-xl shadow-xl py-2 max-h-48 overflow-y-auto"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { onMatchUniversityChange(s); setShowUnivSuggestions(false); }}
                      className="w-full px-4 sm:px-5 py-3 text-left text-sm font-bold text-slate-800 hover:bg-indigo-50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 -mt-1">
              💡 Ketik nama universitas apapun, tidak harus dari saran
            </p>
          </div>

          {/* Major Input */}
          <div className="space-y-3 sm:space-y-4">
            <label htmlFor="major-input" className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Jurusan / Bidang Impian
            </label>
            <div className="relative">
              <BookOpen className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                id="major-input"
                type="text"
                placeholder="Contoh: Kedokteran, Hukum, CS..."
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 transition-all text-sm min-h-[48px] touch-none"
                value={matchMajor}
                onChange={(e) => onMatchMajorChange(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons - Stack on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {/* Run Matchmaker Button */}
            <button
              onClick={onRunMatchmaker}
              disabled={isMatching}
              className="bg-slate-950 text-white py-4 sm:py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base min-h-[44px] sm:min-h-[48px] touch-none"
            >
              {isMatching ? 'Menghitung...' : 'Mulai Simulasi'} <Sparkles size={18} className="sm:size-5" />
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              disabled={isMatching}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 sm:py-5 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base min-h-[44px] sm:min-h-[48px] touch-none"
              title="Reset semua input ke default"
            >
              Bersihkan
            </button>
          </div>
        </div>

        {/* Results Area (Right Column) */}
        <div id="match-results" className="lg:col-span-7 space-y-6">
          {/* Empty State */}
          {!matchResults && !isMatching && (
            <div className="h-full flex flex-col items-center justify-center p-12 md:p-20 border-2 border-dashed border-slate-200 rounded-[4rem] text-slate-400">
              <BrainCircuit size={64} strokeWidth={1} />
              <p className="mt-6 font-bold text-lg text-center text-slate-600">Hasil akan muncul di sini</p>
              <p className="mt-3 text-sm text-slate-500 text-center max-w-sm">
                Isi minimal 1 kriteria lalu klik <strong>Mulai Simulasi</strong>. Coba pilih <strong>SEMUA</strong> kategori atau <strong>Semua Jalur</strong> untuk hasil lebih banyak.
              </p>
              <button
                onClick={onReset}
                className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm text-slate-700 transition-all"
              >
                Bersihkan Form
              </button>
            </div>
          )}

          {/* Loading State - Skeleton Cards */}
          {isMatching && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-100 p-6 rounded-[2rem] gap-4 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded-lg" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="ticket-border rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-pulse">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-200 shrink-0" />
                  <div className="flex-1 w-full space-y-2">
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-6 w-16 bg-slate-200 rounded-lg" />
                      <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="h-12 flex-1 sm:flex-none sm:w-24 bg-slate-200 rounded-2xl" />
                    <div className="h-12 w-12 bg-slate-200 rounded-2xl" />
                  </div>
                </div>
              ))}
              <p className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">
                Mencocokkan dengan Database...
              </p>
            </div>
          )}

          {/* Results */}
          {matchResults && (
            <div className="space-y-8 animate-reveal">
              {/* Score Badge */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                    Skor Kecocokan Pencarian Mentor Alumni
                  </p>
                  <h4 className="text-2xl font-black text-slate-950">
                    {Math.round(matchResults.score)}% Skor Alumni Yang Cocok
                  </h4>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${matchResults.type === 'exact'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-orange-50 text-orange-700'
                    }`}
                >
                  {matchResults.type === 'exact' ? 'Profil Optimal' : 'Kecocokan Terkait'}
                </div>
              </div>

              {/* Suggestion for Non-Exact Matches */}
              {matchResults.type !== 'exact' && (
                <div className="p-4 sm:p-8 bg-amber-50 border-2 border-amber-100 rounded-[2rem] sm:rounded-[2.5rem] space-y-4 sm:space-y-6 animate-reveal" role="region" aria-label="Mentor availability suggestion box">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                      <HelpCircle size={24} className="sm:size-28" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-black text-slate-900">
                        Butuh Mentor Spesifik Lainnya?
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        Sistem kami tidak menemukan alumni yang cocok 100% dengan kriteria kamu. Jangan khawatir! Kami memiliki akses ke database alumni yang lebih luas.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 p-4 sm:p-5 rounded-2xl border border-amber-200">
                    <p className="text-xs sm:text-sm font-bold text-slate-700 italic leading-snug">
                      "Silahkan bergabung atau chat admin untuk informasi lebih lanjut."
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
                      className="w-full bg-amber-600 text-white py-4 sm:py-5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 touch-none active:scale-95 min-h-[48px]"
                    >
                      Gabung Komunitas WA <Users size={18} />
                    </button>
                    <button
                      onClick={() => window.open(CONTACT_WA, '_blank')}
                      className="w-full bg-white text-amber-600 border-2 border-amber-200 py-4 sm:py-5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:bg-amber-50 transition-all touch-none active:scale-95 min-h-[48px]"
                    >
                      Chat Admin Langsung <Phone size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Mentor Results Cards */}
              <div className="grid gap-6">
                {matchResults.mentors.map((m, i) => (
                  <MentorCard
                    key={i}
                    mentor={m}
                    index={-1}
                    variant="compact"
                    showAlumniId={false}
                    onContact={onMentorSelect}
                    onCompare={onMentorCompare}
                    isSelected={comparedMentors.includes(m.name)}
                    onFavoriteToggle={onFavoriteToggle}
                    isFavorite={isFavorite?.(m.name) ?? false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
