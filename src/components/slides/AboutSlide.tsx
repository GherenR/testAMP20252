import React from 'react';
import { Globe, UserCheck, Database } from 'lucide-react';

/**
 * AboutSlide Component
 * Menampilkan informasi tentang proyek AMP (Alumni Mentorship Project)
 * Visi, misi, dan profil tim/founder
 */
export const AboutSlide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 animate-reveal text-center pb-32 pt-8">
      {/* Header Section */}
      <div className="mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
          <Globe size={14} /> Proyek Kolaboratif
        </div>
        <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-950 mb-8 leading-[0.85]">
          MEMBANGUN<br />
          <span className="text-outline">BUDAYA</span> TOLONG MENOLONG.
        </h2>
        <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto italic">
          "Inisiatif mandiri untuk merajut silaturahmi yang fungsional antar generasi alumni Hang Tuah."
        </p>
      </div>

      {/* Team / Project Information Grid */}
      <div className="grid md:grid-cols-2 gap-8 text-left">
        {/* Founder Card */}
        <div className="p-8 md:p-12 bg-white rounded-[4rem] border-2 border-slate-100 shadow-sm hover:border-indigo-600 transition-all group">
          <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center text-white mb-8 group-hover:bg-indigo-600 transition-colors">
            <UserCheck size={32} />
          </div>
          <h4 className="text-3xl font-extrabold text-slate-950 mb-3 tracking-tight">
            Gheren Ramandra S.
          </h4>
          <p className="text-indigo-600 font-black mb-6 uppercase text-[11px] tracking-[0.3em]">
            Lead Architect & Founder
          </p>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Ilmu Komputer IPB. Berdedikasi untuk membangun infrastruktur data alumni yang memudahkan akses informasi bagi adik kelas.
          </p>
        </div>

        {/* Impact Hub Card */}
        <div className="p-8 md:p-12 bg-slate-950 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime-300/10 rounded-full blur-[80px]"></div>
          <div className="w-16 h-16 bg-lime-300 rounded-[1.5rem] flex items-center justify-center text-slate-950 mb-8">
            <Database size={32} />
          </div>
          <h4 className="text-3xl font-extrabold mb-3 tracking-tight">Impact Hub 2026</h4>
          <p className="text-lime-300 font-black mb-6 uppercase text-[11px] tracking-[0.3em]">
            Visi & Misi
          </p>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Menjadi ekosistem mentorship terbesar di lingkungan Hang Tuah, memperpendek jarak antara ambisi dan realisasi kampus impian.
          </p>
        </div>
      </div>
    </div>
  );
};
