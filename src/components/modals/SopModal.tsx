import React, { useState } from 'react';
import { X, ShieldCheck, Clock, Zap, ArrowRight } from 'lucide-react';
import { Mentor } from '../../types';

interface SopModalProps {
  isOpen: boolean;
  selectedMentor: Mentor | null;
  onClose: () => void;
  onProceed: (studentName: string, studentClass: string, studentBatch: number) => void;
}

/**
 * SopModal Component
 * Modal yang menampilkan kode etik/SOP sebelum user menghubungi mentor
 * Juga mengumpulkan info siswa untuk pre-filled WhatsApp message
 */
export const SopModal: React.FC<SopModalProps> = ({
  isOpen,
  selectedMentor,
  onClose,
  onProceed
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentBatch, setStudentBatch] = useState(2026);
  const [showForm, setShowForm] = useState(false);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!studentName || !studentClass) {
      alert('Harap isi nama dan kelas terlebih dahulu');
      return;
    }
    onProceed(studentName, studentClass, studentBatch);
    setStudentName('');
    setStudentClass('');
    setStudentBatch(2026);
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-3 sm:px-4 overflow-y-auto py-4 sm:py-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl p-5 sm:p-8 md:p-12 lg:p-14 shadow-2xl relative z-10 animate-reveal overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-2 sm:h-3 bg-indigo-600"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-slate-950 transition-colors p-1 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X size={20} className="sm:hidden" />
          <X size={32} className="hidden sm:block" />
        </button>

        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 text-indigo-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-inner">
            <ShieldCheck size={32} className="sm:block" />
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-2 sm:mb-4 text-slate-950 uppercase">
            Akses Diberikan
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Harap patuhi kode etik sebelum menghubungi alumni.
          </p>
        </div>

        {/* SOP Guidelines */}
        {!showForm && (
          <div className="grid gap-3 sm:gap-4 mb-8 sm:mb-10">
            {/* Time guideline */}
            <div className="bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 border-slate-100 flex gap-3 sm:gap-4 items-start">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="text-indigo-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-slate-950">Hargai Waktu Luang</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                  Disarankan hubungi: <span className="text-indigo-600 font-black">08:00 - 20:00 WIB</span>
                </p>
              </div>
            </div>

            {/* Message guideline */}
            <div className="bg-slate-50 p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border-2 border-slate-100 flex gap-3 sm:gap-4 items-start">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="text-lime-500" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-slate-950">Pesan Sudah Siap</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                  Kami siapkan template pesan untuk Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Student Info Form */}
        {showForm && (
          <div className="space-y-4 sm:space-y-5 mb-8">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-950 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:outline-none font-medium text-slate-900 placeholder-slate-400 text-sm sm:text-base min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-950 mb-2">
                  Kelas
                </label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="Contoh: 10 A"
                  className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:outline-none font-medium text-slate-900 placeholder-slate-400 text-sm sm:text-base min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-950 mb-2">
                  Batch Angkatan
                </label>
                <select
                  value={studentBatch}
                  onChange={(e) => setStudentBatch(Number(e.target.value))}
                  className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:outline-none font-medium text-slate-900 text-sm sm:text-base min-h-[44px]"
                >
                  <option value={2028}>2028</option>
                  <option value={2027}>2027</option>
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
              <p className="text-xs text-indigo-900 font-medium">
                <span className="font-bold">Preview pesan:</span> Selamat Siang Kak {selectedMentor?.name || 'Mentor'}, saya {studentName || '[Nama Anda]'} dari kelas {studentClass || '[Kelas]'} angkatan {studentBatch}. Ingin berkonsultasi mengenai perkuliahan...
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {!showForm ? (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 bg-slate-950 text-white py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-bold text-sm sm:text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 sm:gap-4 shadow-xl active:scale-95 min-h-[44px]"
              >
                Lanjut ke WhatsApp <ArrowRight size={18} className="sm:hidden" /><ArrowRight size={24} className="hidden sm:block" />
              </button>
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-bold text-sm sm:text-lg hover:bg-slate-100 transition-all active:scale-95 text-slate-950 min-h-[44px]"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleProceed}
                className="flex-1 bg-slate-950 text-white py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-bold text-sm sm:text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 sm:gap-4 shadow-xl active:scale-95 min-h-[44px]"
              >
                Hubungi di WhatsApp <ArrowRight size={18} className="sm:hidden" /><ArrowRight size={24} className="hidden sm:block" />
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 sm:px-6 py-4 sm:py-6 rounded-xl sm:rounded-[2.5rem] font-bold text-sm sm:text-lg hover:bg-slate-100 transition-all active:scale-95 text-slate-950 min-h-[44px]"
              >
                Kembali
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
