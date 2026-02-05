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
    <div className="mb-12 space-y-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Title Section */}
        <div className="space-y-3">
          <div className="w-12 h-1 bg-indigo-600 mb-4"></div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950">
            ARSIP <span className="text-indigo-600">ALUMNI</span>
          </h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">
            Koleksi Mentor & Pemimpin Masa Depan
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-col gap-4 items-end w-full md:w-auto">
          <div className="flex flex-wrap gap-2 justify-end w-full">
            {['Semua', 'PTN', 'PTS', 'PTLN'].map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat === 'Semua' ? 'All' : (cat as InstitutionCategory))}
                className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${(filterCategory === 'All' ? 'Semua' : filterCategory) === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Path Filter (Sub-categories) */}
          {subPaths.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 animate-reveal w-full md:w-auto overflow-x-auto no-scrollbar">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 whitespace-nowrap">
                Jalur:
              </span>
              {['Semua', ...subPaths].map(path => (
                <button
                  key={path}
                  onClick={() => onPathChange(path === 'Semua' ? 'All' : path)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${(filterPath === 'All' ? 'Semua' : filterPath) === path
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-200'
                    }`}
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
        <Search className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
        <input
          type="text"
          placeholder="Cari mentor berdasarkan Jurusan, Universitas, atau Prestasi..."
          className="w-full pl-16 md:pl-24 pr-8 py-6 md:py-8 bg-white border-2 border-slate-100 rounded-[2.5rem] outline-none focus:border-indigo-600 transition-all font-bold text-slate-900 text-lg md:text-xl shadow-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
