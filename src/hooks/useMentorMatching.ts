import { useState } from 'react';
import { Mentor, InstitutionCategory } from '../types';

export interface MatchResult {
  mentors: Mentor[];
  score: number;
  type: 'exact' | 'partial' | 'none';
}

/**
 * Custom hook untuk mengelola logika mentor matching dengan scoring algorithm
 * Scoring: Category 25pts + Path 20pts + University 30pts + Major 25pts
 * Exact match: >= 85pts, Partial match: >= 20pts, No match: < 20pts
 */
export const useMentorMatching = () => {
  const [matchTarget, setMatchTarget] = useState<InstitutionCategory>('PTN');
  const [matchPath, setMatchPath] = useState<string>('All');
  const [matchUniversity, setMatchUniversity] = useState<string>('');
  const [matchMajor, setMatchMajor] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult | null>(null);

  /**
   * Menjalankan algoritma matching dengan delay 800ms untuk UX (loading animation)
   */
  const runMatchmaker = (mentors: Mentor[]) => {
    // Validasi minimal ada satu kriteria
    if (!matchMajor && matchPath === 'All' && !matchUniversity) return;

    setIsMatching(true);
    setMatchResults(null);

    // Delay untuk simulasi proses matching (UX improvement)
    setTimeout(() => {
      const resultsWithScores = mentors.map(mentor => {
        let score = 0;

        // Scoring system (max 100 points)
        if (mentor.category === matchTarget) score += 25;
        if (mentor.path === matchPath) score += 20;
        if (matchUniversity && mentor.university.toLowerCase().includes(matchUniversity.toLowerCase())) score += 30;
        if (matchMajor && mentor.major.toLowerCase().includes(matchMajor.toLowerCase())) score += 25;

        return { mentor, score };
      }).sort((a, b) => b.score - a.score);

      const topScore = resultsWithScores[0]?.score || 0;
      let type: 'exact' | 'partial' | 'none' = 'none';

      // Determine match type berdasarkan score
      if (topScore >= 85) type = 'exact';
      else if (topScore >= 20) type = 'partial';
      else type = 'none';

      // Get top 3 results dengan score > 0
      const finalMentors = resultsWithScores
        .filter(r => r.score > 0)
        .slice(0, 3)
        .map(r => r.mentor);

      setMatchResults({ mentors: finalMentors, score: topScore, type });
      setIsMatching(false);
    }, 800);
  };

  /**
   * Reset hasil matching dan state matching
   */
  const resetMatching = () => {
    setMatchTarget('PTN');
    setMatchPath('All');
    setMatchUniversity('');
    setMatchMajor('');
    setMatchResults(null);
  };

  return {
    // State
    matchTarget,
    matchPath,
    matchUniversity,
    matchMajor,
    isMatching,
    matchResults,
    // Setters
    setMatchTarget,
    setMatchPath,
    setMatchUniversity,
    setMatchMajor,
    // Methods
    runMatchmaker,
    resetMatching
  };
};
