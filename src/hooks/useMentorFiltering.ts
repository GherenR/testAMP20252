import { useState, useMemo } from 'react';
import { Mentor, InstitutionCategory } from '../types';

/**
 * Type untuk hasil filtering yang menyimpan mentor + original index dari MOCK_MENTORS
 */
export interface FilteredMentorWithIndex {
  mentor: Mentor;
  originalIndex: number; // Index dari MOCK_MENTORS, bukan dari filtered array
}

/**
 * Custom hook untuk mengelola filtering dan searching mentors
 * Menangani search term, category filter, dan path filter
 * Returns array dengan mentor info + original index dari MOCK_MENTORS
 */
export const useMentorFiltering = (mentors: Mentor[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<InstitutionCategory>('All');
  const [filterPath, setFilterPath] = useState<string>('All');

  // Reset path filter ketika category berubah
  const handleCategoryChange = (category: InstitutionCategory) => {
    setFilterCategory(category);
    setFilterPath('All');
  };

  // Memoized filtering logic untuk performa optimal
  const filteredMentors = useMemo(() => {
    const term = searchTerm.toLowerCase();

    // Map dulu ke object yang menyimpan mentor + index asli dari MOCK_MENTORS
    return mentors
      .map((m, index) => ({ mentor: m, originalIndex: index }))
      .filter(({ mentor, originalIndex }) => {
        // Hitung Alumni ID menggunakan original index (INI PENTING!)
        const alumniId = `#2025-${originalIndex + 104}`.toLowerCase();

        const matchesSearch =
          mentor.university.toLowerCase().includes(term) ||
          mentor.major.toLowerCase().includes(term) ||
          mentor.name.toLowerCase().includes(term) ||
          alumniId.includes(term) ||
          (mentor.achievements && mentor.achievements.some(a => a.toLowerCase().includes(term)));

        const matchesCategory = filterCategory === 'All' || mentor.category === filterCategory;
        const matchesPath = filterPath === 'All' || mentor.path.includes(filterPath);

        return matchesSearch && matchesCategory && matchesPath;
      });
  }, [searchTerm, filterPath, filterCategory, mentors]);

  return {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory: handleCategoryChange,
    filterPath,
    setFilterPath,
    filteredMentors // Array of { mentor, originalIndex }
  };
};
