import React from 'react';
import { Mentor, InstitutionCategory } from '../../types';
import { FilteredMentorWithIndex } from '../../hooks/useMentorFiltering';
import { SearchAndFilter } from '../SearchAndFilter';
import { MentorCard } from '../MentorCard';

interface MentorDatabaseSlideProps {
  filteredMentors: FilteredMentorWithIndex[]; // Array dengan mentor + originalIndex
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: InstitutionCategory;
  onCategoryChange: (category: InstitutionCategory) => void;
  filterPath: string;
  onPathChange: (path: string) => void;
  subPaths: string[];
  onMentorContact: (mentor: Mentor) => void;
  onMentorInstagram: (handle: string) => void;
}

/**
 * MentorDatabaseSlide Component
 * Menampilkan semua mentor dalam grid dengan search dan filter
 * User bisa cari mentor by nama, universitas, jurusan, atau prestasi
 */
export const MentorDatabaseSlide: React.FC<MentorDatabaseSlideProps> = ({
  filteredMentors,
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterPath,
  onPathChange,
  subPaths,
  onMentorContact,
  onMentorInstagram
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 animate-reveal pb-32 pt-8">
      {/* Search and Filter Section */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filterCategory={filterCategory}
        onCategoryChange={onCategoryChange}
        filterPath={filterPath}
        onPathChange={onPathChange}
        subPaths={subPaths}
      />

      {/* Mentor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMentors.map(({ mentor, originalIndex }) => (
          <MentorCard
            key={originalIndex}
            mentor={mentor}
            index={originalIndex}
            onContact={onMentorContact}
            onInstagram={onMentorInstagram}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredMentors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-2xl font-bold text-slate-400 mb-2">Mentor tidak ditemukan</p>
          <p className="text-slate-500">Coba ubah filter atau keyword pencarian Anda</p>
        </div>
      )}
    </div>
  );
};
