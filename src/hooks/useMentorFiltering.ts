import { useState, useMemo } from 'react';
import { Mentor, InstitutionCategory } from '../types';

/**
 * Custom hook untuk mengelola filtering dan searching mentors
 * Menangani search term, category filter, dan path filter
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
    return mentors.filter((m) => {
      const originalIndex = mentors.indexOf(m);
      const alumniId = `#2025-${originalIndex + 104}`.toLowerCase();

      const matchesSearch =
        m.university.toLowerCase().includes(term) ||
        m.major.toLowerCase().includes(term) ||
        m.name.toLowerCase().includes(term) ||
        alumniId.includes(term) ||
        (m.achievements && m.achievements.some(a => a.toLowerCase().includes(term)));

      const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
      const matchesPath = filterPath === 'All' || m.path.includes(filterPath);

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
    filteredMentors
  };
};
