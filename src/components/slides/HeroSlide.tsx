import React from 'react';
import { BrainCircuit, Users } from 'lucide-react';
import { COMMUNITY_WA_GROUP } from '../../constants';

interface HeroSlideProps {
  onSmartMatchClick: () => void;
}

/**
 * HeroSlide Component
 * Landing page pertama dengan value proposition dan CTA buttons
 * User bisa mulai Smart Match atau bergabung komunitas WhatsApp
 */
export const HeroSlide: React.FC<HeroSlideProps> = ({ onSmartMatchClick }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-reveal relative py-12">
      {/* Gradient blur backgrounds */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-lime-400/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 max-w-5xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          DATABASE ALUMNI HANG TUAH 2025 TERINTEGRASI
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-[140px] font-extrabold leading-[0.8] tracking-tighter text-slate-950 mb-10">
          CARI<br />
          <span className="text-outline">MENTOR ALUMNIMU</span>
        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
          Platform kolaboratif alumni Hang Tuah untuk mendampingi angkatan 2026 menavigasi ambisi menuju kampus impian.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
          <button
            onClick={onSmartMatchClick}
            className="group relative bg-slate-950 text-white px-12 py-6 rounded-2xl font-bold transition-all hover:bg-indigo-600 active:scale-95 shadow-2xl shadow-slate-950/20 text-lg w-full sm:w-auto"
          >
            <span className="flex items-center gap-3 justify-center">
              Coba Smart Match <BrainCircuit size={22} className="group-hover:rotate-12 transition-transform" />
            </span>
          </button>
          <button
            onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
            className="group bg-white text-slate-900 border-2 border-slate-100 px-12 py-6 rounded-2xl font-bold transition-all hover:border-indigo-600 flex items-center gap-3 active:scale-95 text-lg w-full sm:w-auto justify-center"
          >
            <Users size={22} className="text-green-600" /> Komunitas WhatsApp
          </button>
        </div>

        {/* Info Box */}
        <div className="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-[2.5rem] max-w-2xl mx-auto flex items-center gap-6 text-left">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Pusat Informasi & Diskusi</h4>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              Bergabunglah di grup komunitas WhatsApp sebagai wadah informasi utama. Dapatkan jadwal <span className="text-indigo-600 font-bold">sharing session</span>, info tryout, dan update penting lainnya secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
