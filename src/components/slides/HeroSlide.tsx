import React from 'react';
import { BrainCircuit, Users } from 'lucide-react';
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

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 sm:gap-5 mb-12 sm:mb-16">
          <button
            onClick={onSmartMatchClick}
            className="group relative bg-indigo-600 text-white px-6 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold transition-all hover:bg-indigo-700 active:scale-95 shadow-2xl shadow-indigo-600/20 text-sm sm:text-lg w-full min-h-[48px] sm:min-h-[56px] touch-none"
          >
            <span className="flex items-center gap-2 sm:gap-3 justify-center">
              Coba Smart Match <BrainCircuit size={18} className="sm:w-[22px] sm:h-[22px] group-hover:rotate-12 transition-transform" />
            </span>
          </button>
          <button
            onClick={() => setCurrentSlide(2)}
            className="group relative bg-slate-900 text-white px-6 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold transition-all hover:bg-slate-950 active:scale-95 shadow-2xl shadow-slate-900/20 text-sm sm:text-lg w-full min-h-[48px] sm:min-h-[56px] touch-none"
          >
            <span className="flex items-center gap-2 sm:gap-3 justify-center">
              Cari Manual <BrainCircuit size={18} className="sm:w-[22px] sm:h-[22px] group-hover:rotate-12 transition-transform" />
            </span>
          </button>
          <button
            onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
            className="group bg-white text-slate-900 border-2 border-slate-200 px-6 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold transition-all hover:border-indigo-600 hover:bg-indigo-50 flex items-center gap-2 sm:gap-3 active:scale-95 text-sm sm:text-lg w-full justify-center min-h-[48px] sm:min-h-[56px] touch-none"
          >
            <Users size={18} className="sm:w-[22px] sm:h-[22px] text-green-600" /> Komunitas WhatsApp
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
