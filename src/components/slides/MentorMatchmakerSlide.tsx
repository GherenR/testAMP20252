import React from 'react';
import {
  Target, Sparkles, Landmark, BookOpen, BrainCircuit,
  HelpCircle, Users, Phone, ArrowUpRight
} from 'lucide-react';
import { CONTACT_WA, COMMUNITY_WA_GROUP } from '../../constants';
import { Mentor, InstitutionCategory } from '../../types';
import { MentorCard } from '../MentorCard';

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
  onMentorContact: (mentor: Mentor) => void;
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
  onMentorContact
}) => {
  return (
    <div className="max-w-5xl mx-auto px-6 animate-reveal pb-32 pt-8">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white mb-2 shadow-xl shadow-indigo-200">
          <Target size={32} />
        </div>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950 leading-none">
          THE SMART <span className="text-indigo-600">MATCH.</span>
        </h2>
        <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
          Masukkan target impianmu, sistem kami akan mencarikan alumni dengan rekam jejak paling relevan.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Input Form (Left Column) */}
        <div className="lg:col-span-5 bg-white p-6 md:p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
          {/* Category Selection */}
          <div className="space-y-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Kategori Institusi
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['PTN', 'PTS', 'PTLN'].map(cat => (
                <button
                  key={cat}
                  onClick={() => onMatchTargetChange(cat as InstitutionCategory)}
                  className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${matchTarget === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-400 border-transparent'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Path Selection */}
          <div className="space-y-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Jalur Masuk
            </p>
            <select
              value={matchPath}
              onChange={(e) => onMatchPathChange(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm appearance-none"
            >
              <option value="All">Semua Jalur...</option>
              {subPaths.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* University Input */}
          <div className="space-y-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Universitas Impian
            </p>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Contoh: UI, ITB, UGM..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm"
                value={matchUniversity}
                onChange={(e) => onMatchUniversityChange(e.target.value)}
              />
            </div>
          </div>

          {/* Major Input */}
          <div className="space-y-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Jurusan / Bidang Impian
            </p>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Contoh: Kedokteran, Hukum, CS..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm"
                value={matchMajor}
                onChange={(e) => onMatchMajorChange(e.target.value)}
              />
            </div>
          </div>

          {/* Run Matchmaker Button */}
          <button
            onClick={onRunMatchmaker}
            disabled={isMatching}
            className="w-full bg-slate-950 text-white py-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {isMatching ? 'Menghitung...' : 'Mulai Simulasi'} <Sparkles size={18} />
          </button>
        </div>

        {/* Results Area (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Empty State */}
          {!matchResults && !isMatching && (
            <div className="h-full flex flex-col items-center justify-center p-12 md:p-20 border-2 border-dashed border-slate-200 rounded-[4rem] text-slate-300">
              <BrainCircuit size={64} strokeWidth={1} />
              <p className="mt-6 font-bold text-lg text-center">Hasil akan muncul di sini</p>
            </div>
          )}

          {/* Loading State */}
          {isMatching && (
            <div className="flex flex-col items-center justify-center p-20 space-y-6">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs text-center">
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
                      ? 'bg-green-100 text-green-600'
                      : 'bg-orange-100 text-orange-600'
                    }`}
                >
                  {matchResults.type === 'exact' ? 'Profil Optimal' : 'Kecocokan Terkait'}
                </div>
              </div>

              {/* Suggestion for Non-Exact Matches */}
              {matchResults.type !== 'exact' && (
                <div className="p-8 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] space-y-6 animate-reveal">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                      <HelpCircle size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900">
                        Butuh Mentor Spesifik Lainnya?
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                        Sistem kami tidak menemukan alumni yang cocok 100% dengan kriteria kamu. Jangan khawatir! Kami memiliki akses ke database alumni yang lebih luas.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/60 p-5 rounded-2xl border border-amber-200">
                    <p className="text-xs font-bold text-slate-700 italic">
                      "Saran: Silakan hubungi admin di Grup Komunitas WhatsApp. Admin kami dapat membantu mencarikan kakak alumni yang sesuai dengan target jurusan/kampusmu yang mungkin belum terdaftar di sini."
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
                      className="flex-1 bg-amber-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                    >
                      Gabung Komunitas WA <Users size={16} />
                    </button>
                    <button
                      onClick={() => window.open(CONTACT_WA, '_blank')}
                      className="flex-1 bg-white text-amber-600 border-2 border-amber-200 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-50 transition-all"
                    >
                      Chat Admin Langsung <Phone size={16} />
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
                    onContact={onMentorContact}
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
