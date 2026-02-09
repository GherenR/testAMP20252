import React from 'react';
import { Heart } from 'lucide-react';
import { Mentor } from '../../types';
import { MentorCard } from '../MentorCard';

interface FavoritesSlideProps {
  favorites: Mentor[];
  onMentorContact: (mentor: Mentor) => void;
  onMentorInstagram: (handle: string) => void;
  onMentorCompare?: (mentor: Mentor) => void;
  comparedMentors?: string[];
  onViewDetail?: (mentor: Mentor) => void;
  onFavoriteToggle: (mentorName: string) => void;
  isFavorite: (name: string) => boolean;
  getAllMentors: () => Mentor[];
  onNavigateToDirektori?: () => void;
}

/**
 * FavoritesSlide - Menampilkan alumni yang difavoritkan user (disimpan di secureStorage)
 */
export const FavoritesSlide: React.FC<FavoritesSlideProps> = ({
  favorites,
  onMentorContact,
  onMentorInstagram,
  onMentorCompare,
  comparedMentors = [],
  onViewDetail,
  onFavoriteToggle,
  isFavorite,
  getAllMentors,
  onNavigateToDirektori
}) => {
  const mentors = getAllMentors();

  return (
    <div className="max-w-7xl mx-auto px-6 animate-reveal pb-32 pt-8">
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Heart size={24} className="text-red-500 fill-red-500" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-950">
              FAVORIT <span className="text-red-500">SAYA</span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
              {favorites.length} alumni tersimpan
            </p>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 border-2 border-dashed border-slate-200 rounded-[2rem]">
          <Heart size={64} className="text-slate-200 mb-6" />
          <p className="text-xl font-bold text-slate-500 mb-2">Belum ada favorit</p>
          <p className="text-slate-400 max-w-md mb-6">
            Klik ikon ♥ pada card alumni di Direktori atau Smart Match untuk menyimpan ke favorit.
          </p>
          {onNavigateToDirektori && (
            <button
              onClick={onNavigateToDirektori}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              Ke Direktori →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((mentor) => {
            const originalIndex = mentors.findIndex(m => m.name === mentor.name);
            return (
              <MentorCard
                key={mentor.name}
                mentor={mentor}
                index={originalIndex >= 0 ? originalIndex : 0}
                onContact={onMentorContact}
                onInstagram={onMentorInstagram}
                onCompare={onMentorCompare}
                isSelected={comparedMentors.includes(mentor.name)}
                onViewDetail={onViewDetail}
                onFavoriteToggle={onFavoriteToggle}
                isFavorite={isFavorite(mentor.name)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
