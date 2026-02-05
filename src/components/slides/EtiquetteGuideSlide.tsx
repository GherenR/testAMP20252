import React from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';

/**
 * EtiquetteGuideSlide Component
 * Menampilkan panduan dan SOP untuk berkomunikasi dengan mentor
 * Menjelaskan 4 prinsip utama: Identifikasi, Ringkas, Privasi, dan Terima Kasih
 */
export const EtiquetteGuideSlide: React.FC = () => {
  const guidelines = [
    { title: "Identifikasi", desc: "Sebutkan Nama & Kelas asal secara jelas." },
    { title: "Ringkas", desc: "Tanyakan poin diskusi secara padat dan terukur." },
    { title: "Privasi", desc: "Hargai waktu luang & batas privasi alumni." },
    { title: "Terima Kasih", desc: "Akhiri setiap sesi dengan ucapan terima kasih." }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 animate-reveal pb-32 pt-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Guidelines */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="w-20 h-2 bg-indigo-600"></div>
            <h2 className="text-6xl font-black tracking-tighter text-slate-950 leading-[0.9]">
              ETIKA CHAT<br />
              <span className="text-outline">PROFESIONAL</span>.
            </h2>
            <p className="text-xl text-slate-500 font-medium">
              Etika adalah landasan kepercayaan. Ikuti protokol berikut untuk menjamin kelancaran komunikasi antar alumni.
            </p>
          </div>

          {/* Guidelines Cards */}
          <div className="grid gap-4">
            {guidelines.map((step, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-6 p-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-indigo-600 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">{step.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Example Message */}
        <div className="relative">
          <div className="absolute -inset-6 bg-indigo-600 rounded-[4rem] rotate-3 -z-10 shadow-2xl opacity-10"></div>
          <div className="bg-slate-950 p-8 md:p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

            {/* Message Standard Header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-lime-300 flex items-center justify-center">
                <MessageCircle size={24} className="text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Standar Pesan</h3>
            </div>

            {/* Example Message */}
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 font-mono text-sm leading-relaxed text-indigo-100 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  CONTOH PESAN
                </div>
                "Selamat siang Kak [Nama], saya [Nama] dari XII-1. Ingin berkonsultasi mengenai strategi portofolio di [Jurusan] Kakak. Apakah ada waktu luang untuk berdiskusi sebentar? Terima kasih Kak!"
              </div>
            </div>

            {/* Verified badge */}
            <div className="mt-12 flex items-center gap-4 text-xs font-black text-lime-300 uppercase tracking-widest">
              <ShieldCheck size={18} /> Verified Protocol • Class of 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
