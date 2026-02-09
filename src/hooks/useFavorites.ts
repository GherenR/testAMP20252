import { useState, useEffect, useCallback } from 'react';
import { Mentor } from '../types';
import { secureStorage } from '../utils/security';

const STORAGE_KEY = 'amp_favorites';

export const useFavorites = (mentors: Mentor[]) => {
  const [favoriteNames, setFavoriteNames] = useState<string[]>(() => {
    try {
      const stored = secureStorage.get(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      secureStorage.set(STORAGE_KEY, JSON.stringify(favoriteNames));
    } catch {
      // ignore
    }
  }, [favoriteNames]);

  const toggleFavorite = useCallback((mentorName: string) => {
    setFavoriteNames(prev =>
      prev.includes(mentorName) ? prev.filter(n => n !== mentorName) : [...prev, mentorName]
    );
  }, []);

  const isFavorite = useCallback(
    (mentorName: string) => favoriteNames.includes(mentorName),
    [favoriteNames]
  );

  const favorites = mentors.filter(m => favoriteNames.includes(m.name));

  return { favorites, toggleFavorite, isFavorite };
};
