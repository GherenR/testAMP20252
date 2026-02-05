import React from 'react';
import { X, ShieldCheck, Clock, Zap, ArrowRight } from 'lucide-react';
import { Mentor } from '../../types';

interface SopModalProps {
  isOpen: boolean;
  selectedMentor: Mentor | null;
  onClose: () => void;
  onProceed: () => void;
}

/**
 * SopModal Component
 * Modal yang menampilkan kode etik/SOP sebelum user menghubungi mentor
 * Mengingatkan user untuk menghargai waktu dan langsung ke inti
 */
export const SopModal: React.FC<SopModalProps> = ({
  isOpen,
  selectedMentor,
  onClose,
  onProceed
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto py-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl p-8 md:p-14 shadow-2xl relative z-10 animate-reveal overflow-hidden my-auto">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-950 transition-colors"
          aria-label="Close modal"
        >
          <X size={32} />
        </button>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-inner">
            <ShieldCheck size={48} />
          </div>
          <h3 className="text-4xl font-black tracking-tighter mb-4 text-slate-950 uppercase">
            Akses Diberikan
          </h3>
          <p className="text-slate-500 font-medium">
            Harap patuhi kode etik sebelum menghubungi alumni.
          </p>
        </div>

        {/* SOP Guidelines */}
        <div className="grid gap-4 mb-10">
          {/* Time guideline */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex gap-4 md:gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-950">Hargai Waktu Luang</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Sangat disarankan menghubungi di jam kerja: <span className="text-indigo-600 font-black">08:00 - 20:00 WIB</span>.
              </p>
            </div>
          </div>

          {/* Message guideline */}
          <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex gap-4 md:gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="text-lime-500" size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-950">Langsung ke Inti</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Sampaikan nama, asal kelas, dan tujuan spesifik di pesan pertama Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Proceed button */}
        <button
          onClick={onProceed}
          className="w-full bg-slate-950 text-white py-6 rounded-[2.5rem] font-bold text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
        >
          Lanjut ke WhatsApp <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
};
