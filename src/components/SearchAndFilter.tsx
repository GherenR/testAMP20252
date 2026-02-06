import React from 'react';
import { Search } from 'lucide-react';
import { InstitutionCategory } from '../types';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterCategory: InstitutionCategory;
  onCategoryChange: (category: InstitutionCategory) => void;
  filterPath: string;
  onPathChange: (path: string) => void;
  subPaths: string[];
}

/**
 * SearchAndFilter Component
 * Kombinasi search bar dan filter controls untuk mentor directory
 * Menampilkan search input, category buttons, dan path filters
 */
export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterPath,
  onPathChange,
  subPaths
}) => {
  return (
    <div className="mb-8 sm:mb-12 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
        {/* Title Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="w-10 sm:w-12 h-1 bg-indigo-600 mb-3 sm:mb-4"></div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-slate-950">
            ARSIP <span className="text-indigo-600">ALUMNI</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            Koleksi Mentor & Pemimpin Masa Depan
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full md:w-auto md:items-end">
          <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">
            {['Semua', 'PTN', 'PTS', 'PTLN'].map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat === 'Semua' ? 'All' : (cat as InstitutionCategory))}
                className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-[9px] sm:text-[10px] font-black transition-all border-2 min-h-[48px] sm:min-h-[52px] flex items-center justify-center ${(filterCategory === 'All' ? 'Semua' : filterCategory) === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                aria-pressed={(filterCategory === 'All' ? 'Semua' : filterCategory) === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Path Filter (Sub-categories) */}
          {subPaths.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2 sm:p-3 rounded-2xl border border-slate-200 animate-reveal w-full md:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest px-1 sm:px-2 whitespace-nowrap">
                Jalur:
              </span>
              {['Semua', ...subPaths].map(path => (
                <button
                  key={path}
                  onClick={() => onPathChange(path === 'Semua' ? 'All' : path)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[8px] sm:text-[10px] font-bold transition-all whitespace-nowrap min-h-[40px] flex items-center justify-center touch-none ${(filterPath === 'All' ? 'Semua' : filterPath) === path
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  aria-pressed={(filterPath === 'All' ? 'Semua' : filterPath) === path}
                >
                  {path}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative group max-w-4xl">
        <Search className="absolute left-4 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
        <input
          type="text"
          placeholder="Cari mentor berdasarkan Jurusan, Universitas, atau Prestasi..."
          className="w-full pl-12 sm:pl-16 md:pl-24 pr-4 sm:pr-8 py-4 sm:py-6 md:py-8 bg-white border-2 border-slate-100 rounded-2xl sm:rounded-[2.5rem] outline-none focus:border-indigo-600 transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm sm:text-lg md:text-xl shadow-sm min-h-[44px] sm:min-h-[48px]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search mentors"
        />
      </div>
    </div>
  );
};
