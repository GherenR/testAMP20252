import React from 'react';
import { ArrowUpRight, Sparkles, Instagram, Scale } from 'lucide-react';
import { Mentor } from '../types';

interface MentorCardProps {
  mentor: Mentor;
  index: number;
  showAlumniId?: boolean;
  variant?: 'default' | 'compact';
  onContact?: (mentor: Mentor) => void;
  onInstagram?: (instagramHandle: string) => void;
  onCompare?: (mentor: Mentor) => void;
  isSelected?: boolean;
  onViewDetail?: (mentor: Mentor) => void;
}

/**
 * MentorCard Component
 * Komponen reusable untuk menampilkan kartu profil mentor
 * Digunakan di MentorDatabaseSlide dan MentorMatchmakerSlide
 *
 * @param mentor - Data mentor dari types.ts
 * @param index - Index untuk generate Alumni ID
 * @param showAlumniId - Apakah tampilkan Alumni ID (default: true)
 * @param variant - 'default' untuk database, 'compact' untuk matchmaker
 * @param onContact - Callback saat tombol hubungi diklik
 * @param onInstagram - Callback saat tombol Instagram diklik
 */
export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  index,
  showAlumniId = true,
  variant = 'default',
  onContact,
  onInstagram,
  onCompare,
  isSelected = false,
  onViewDetail
}) => {
  const alumniId = `#2025-${index + 104}`;
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`;

  if (variant === 'compact') {
    // Compact variant untuk matchmaker results - mobile optimized
    return (
      <div className="group ticket-border rounded-[2.5rem] p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:border-indigo-600 transition-all animate-reveal">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center shrink-0">
          <img src={avatarUrl} alt={mentor.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
          <h4 className="text-base sm:text-lg md:text-xl font-black text-slate-950 truncate">{mentor.name}</h4>
          <p className="text-xs sm:text-sm font-bold text-slate-400 line-clamp-1">{mentor.university}</p>
          <p className="text-xs font-bold text-slate-500 line-clamp-1">{mentor.major}</p>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-3 justify-center sm:justify-start">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase whitespace-nowrap">{mentor.path}</span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase whitespace-nowrap">{mentor.category}</span>
          </div>
        </div>

        {/* Action Buttons - Stack on mobile, row on larger screens */}
        <div className="w-full sm:w-auto flex gap-2 sm:flex-col sm:gap-1 mt-3 sm:mt-0">
          {/* Main Button - Select/Contact */}
          <button
            onClick={() => onContact?.(mentor)}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-4 sm:py-3.5 bg-slate-950 text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl flex justify-center items-center font-bold text-sm min-h-[44px] sm:min-h-[48px] touch-none"
            title="Pilih mentor ini"
          >
            <ArrowUpRight size={20} className="sm:hidden" />
            <span className="hidden sm:inline text-xs font-black">Select</span>
          </button>

          {/* Compare Button */}
          <button
            onClick={() => onCompare?.(mentor)}
            className={`px-4 sm:px-5 py-4 sm:py-3.5 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center shadow-lg min-h-[44px] sm:min-h-[48px] touch-none ${isSelected
              ? 'bg-lime-500 text-white hover:bg-lime-600'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            title="Bandingkan dengan mentor lain"
            aria-pressed={isSelected}
          >
            <Scale size={24} className="sm:size-6" />
          </button>
        </div>
      </div>
    );
  }

  // Default variant untuk database
  return (
    <div className="group ticket-border rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col hover:border-indigo-600 hover:shadow-2xl animate-reveal">
      {/* Header dengan Alumni ID dan Avatar */}
      <div className="flex justify-between items-start mb-10 pb-6 dashed-line">
        <div className="space-y-1">
          {showAlumniId && (
            <>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Alumni ID</p>
              <h4 className="text-xl font-black text-slate-950">{alumniId}</h4>
            </>
          )}
        </div>
        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
          <img src={avatarUrl} alt={mentor.name} className="w-12 h-12 rounded-xl" />
        </div>
      </div>

      {/* Main Info */}
      <div className="mb-10 space-y-6">
        <h3 className="text-2xl font-extrabold tracking-tighter text-slate-950 leading-none group-hover:text-indigo-600 transition-colors">
          {mentor.name}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Institusi</p>
            <p className="text-xs font-bold text-slate-800 leading-snug">{mentor.university}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Jurusan</p>
            <p className="text-xs font-bold text-slate-800 leading-snug">{mentor.major}</p>
          </div>
        </div>
      </div>

      {/* Path & Achievements */}
      <div className="space-y-4 mb-10 mt-auto">
        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 bg-slate-950 text-white text-[9px] font-black rounded-full uppercase tracking-widest">
            {mentor.path}
          </div>
          <div className="flex-1 h-0.5 bg-slate-50"></div>
        </div>

        <div className="bg-lime-300/20 p-4 rounded-2xl border border-lime-400/20 flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <Sparkles size={14} className="text-lime-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              {mentor.achievements && mentor.achievements.length > 0 ? (
                <div className="space-y-2 max-h-[80px] overflow-y-auto pr-2 custom-scrollbar">
                  {mentor.achievements.map((ach, idx) => (
                    <p key={idx} className="text-[10px] md:text-[11px] font-bold text-slate-700 italic leading-snug">
                      • "{ach}"
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-bold text-slate-700 italic">"Siap Membimbing"</p>
              )}
            </div>
          </div>

          {mentor.achievements && mentor.achievements.length > 2 && (
            <div className="flex justify-end">
              <span className="text-[8px] font-black text-lime-600 uppercase tracking-tighter">
                Scroll untuk lihat {mentor.achievements.length - 2} lainnya ↓
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onContact?.(mentor)}
          className="flex-1 bg-slate-950 text-white py-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 min-h-[48px] touch-none"
        >
          Hubungi Mentor <ArrowUpRight size={16} />
        </button>

        <button
          onClick={() => onCompare?.(mentor)}
          className={`p-5 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center shadow-lg min-h-[48px] w-[48px] touch-none ${isSelected
            ? 'bg-lime-500 text-white hover:bg-lime-600'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          title="Bandingkan dengan mentor lain"
          aria-pressed={isSelected}
        >
          <Scale size={28} />
        </button>

        {mentor.instagram && mentor.instagram !== "N/A" && (
          <button
            onClick={() => onInstagram?.(mentor.instagram || '')}
            className="p-5 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all active:scale-90 flex items-center justify-center min-h-[48px] w-[48px] touch-none"
            title={`Visit ${mentor.name} on Instagram`}
            aria-label={`Instagram: ${mentor.name}`}
          >
            <Instagram size={28} />
          </button>
        )}
      </div>
    </div>
  );
};
