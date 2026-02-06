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
        <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto italic">
          "Inisiatif mandiri untuk merajut silaturahmi yang fungsional antar generasi alumni Hang Tuah."
        </p>
      </div>

      {/* Founder Section */}
      <div className="mb-20 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 rounded-[3rem] p-8 md:p-16 border border-indigo-100">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Founder Photo & Bio */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Photo with Frame */}
            <div className="relative mb-8 w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-[2.5rem] blur-2xl opacity-20"></div>
              <img
                src="/images/foto12gh.png"
                alt="Gheren Ramandra S."
                className="relative w-full h-full object-cover rounded-[2.5rem] shadow-2xl border-4 border-white"
              />
            </div>

            {/* Name & Role */}
            <h3 className="text-4xl md:text-5xl font-black text-slate-950 mb-2">
              Gheren<br />Ramandra S.
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest mb-6">
              <UserCheck size={14} /> Lead Architect & Founder
            </div>
          </div>

          {/* Founder Info Card */}
          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <p className="text-indigo-600 font-black uppercase text-[11px] tracking-[0.3em] mb-3">Tentang Founder</p>
                <p className="text-xl md:text-2xl text-slate-950 font-bold leading-relaxed">
                  Alumni SMA Hang Tuah 1 Jakarta Angkatan 2025, mahasiswa Ilmu Komputer IPB University.
                </p>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Berdedikasi untuk membangun infrastruktur data alumni yang memudahkan akses informasi bagi adik kelas. Percaya bahwa mentorship, relasi, dan koneksi adalah kunci pembuka pintu kesempatan di masa depan.
              </p>

              <div className="pt-6 border-t border-indigo-200">
                <p className="text-sm text-slate-500 italic font-medium">
                  "Inisiatif AMP lahir dari visi sederhana: tidak boleh ada energi dan potensi yang terbuang begitu saja. Setiap alumni punya cerita berharga untuk dibagikan."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team / Project Information Grid */}
      <div className="grid md:grid-cols-2 gap-8 text-left">
        {/* Values Card */}
        <div className="p-8 md:p-12 bg-white rounded-[4rem] border-2 border-slate-100 shadow-sm hover:border-indigo-600 transition-all group">
          <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center text-white mb-8 group-hover:bg-indigo-600 transition-colors">
            <UserCheck size={32} />
          </div>
          <h4 className="text-3xl font-extrabold text-slate-950 mb-3 tracking-tight">
            Nilai & Komitmen
          </h4>
          <p className="text-indigo-600 font-black mb-6 uppercase text-[11px] tracking-[0.3em]">
            Filosofi AMP
          </p>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Transparansi, kolaborasi, dan dedikasi untuk membangun ekosistem yang saling mendukung antar generasi.
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
