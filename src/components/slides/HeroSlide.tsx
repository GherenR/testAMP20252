import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Users, ArrowRight } from 'lucide-react';
import { COMMUNITY_WA_GROUP } from '../../constants';

interface HeroSlideProps {
  onSmartMatchClick: () => void;
  onNavigateToSlide: (slideIndex: number) => void;
}

/**
 * HeroSlide Component
 * Landing page pertama dengan value proposition dan CTA buttons
 * User bisa mulai Smart Match atau bergabung komunitas WhatsApp
 */
export const HeroSlide: React.FC<HeroSlideProps> = ({ onSmartMatchClick, onNavigateToSlide }) => {
  const navigate = useNavigate();

  function setCurrentSlide(slideIndex: number): void {
    onNavigateToSlide(slideIndex);
  }

  return (
    <div className="min-h-[60vh] sm:min-h-[70vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 animate-reveal relative py-8 sm:py-12">
      {/* Gradient blur backgrounds - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      <div className="hidden sm:block absolute bottom-1/4 -right-20 w-64 h-64 bg-lime-400/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-900 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-600"></span>
          DATABASE ALUMNI HANG TUAH 2025
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[140px] font-extrabold leading-[0.9] sm:leading-[0.8] tracking-tighter text-slate-950 mb-6 sm:mb-10">
          CARI<br />
          <span className="text-outline">MENTOR ALUMNIMU</span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-slate-500 font-medium leading-relaxed mb-8 sm:mb-12">
          Platform kolaboratif alumni Hang Tuah untuk mendampingi angkatan 2026 menavigasi ambisi menuju kampus impian.
        </p>

        {/* CTA Buttons - Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center max-w-4xl mx-auto">
          <button
            onClick={onSmartMatchClick}
            className="group relative bg-indigo-600 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-xl shadow-indigo-600/20 text-sm sm:text-base flex-1 min-h-[48px] sm:min-h-[56px] touch-none"
          >
            <span className="flex items-center gap-2 sm:gap-3 justify-center">
              Coba Smart Match <BrainCircuit size={18} className="sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
            </span>
          </button>
          <button
            onClick={() => setCurrentSlide(2)}
            className="group relative bg-slate-900 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold transition-all hover:bg-slate-950 active:scale-95 shadow-xl shadow-slate-900/20 text-sm sm:text-base flex-1 min-h-[48px] sm:min-h-[56px] touch-none"
          >
            <span className="flex items-center gap-2 sm:gap-3 justify-center">
              Cari Manual <Users size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            </span>
          </button>
        </div>

        {/* SNBT Area Highlight - The "Interspersed" Promo Section */}
        <div className="relative group mb-12 sm:mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-[2.5rem] blur-2xl group-hover:opacity-75 transition-opacity"></div>
          <div className="relative p-6 sm:p-8 bg-white border border-amber-100 rounded-[2.5rem] shadow-xl shadow-amber-500/5 overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
              <div className="shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200 animate-bounce-subtle">
                  <BrainCircuit size={32} className="text-white sm:w-10 sm:h-10" />
                </div>
              </div>

              <div className="text-center lg:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-3">
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                  Fitur Unggulan
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-2 tracking-tight">
                  Persiapkan SNBT 2026 di <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">SNBTArea</span>
                </h3>
                <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed mb-4 max-w-xl">
                  Bukan cuma cari mentor, kini kamu bisa simulasi tryout SNBT & cek peluang lolos PTN impian secara mandiri.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-emerald-500">✓</span> Mini Tryout
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-emerald-500">✓</span> Peluang Lolos
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-emerald-500">✓</span> Data PTN
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => navigate('/snbt')}
                  className="w-full lg:w-auto bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                >
                  Masuk Area SNBT
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Info/Link */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 sm:mb-16 justify-center">
          <button
            onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
            className="group bg-white text-slate-900 border-2 border-slate-200 px-6 sm:px-8 py-4 rounded-2xl font-bold transition-all hover:border-indigo-600 hover:bg-indigo-50 flex items-center gap-2 sm:gap-3 active:scale-95 text-sm sm:text-base justify-center min-h-[48px] sm:min-h-[56px] touch-none"
          >
            <Users size={18} className="sm:w-5 sm:h-5 text-green-600" /> Komunitas WhatsApp
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 sm:p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl sm:rounded-[2.5rem] max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
            <Users size={24} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Pusat Informasi & Diskusi</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bergabunglah di grup komunitas WhatsApp sebagai wadah informasi utama. Dapatkan jadwal <span className="text-indigo-600 font-bold">sharing session</span>, info tryout, dan update penting lainnya secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
