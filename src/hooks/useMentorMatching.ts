import { useState } from 'react';
import { Mentor, InstitutionCategory } from '../types';
import { matchUniversitySmart } from '../utils/universityMatch';

export interface MatchResult {
  mentors: Mentor[];
  score: number;
  type: 'exact' | 'partial' | 'none';
}

/**
 * Custom hook untuk mengelola logika mentor matching dengan scoring algorithm
 * Scoring Priorities (Tertinggi ke Terendah):
 * 1. Major (Jurusan): 40 pts - HIGHEST PRIORITY
 * 2. University (Universitas): 35 pts - SECOND PRIORITY
 * 3. Path (Jalur Masuk): 15 pts - THIRD PRIORITY
 * 4. Category (Institusi): 10 pts - LOWEST PRIORITY
 * 
 * Filter: Minimum 10 pts (ada minimal 1 match) untuk muncul
 * Match Type:
 * - Exact: >= 85 pts (3+ fields match perfectly)
 * - Partial: >= 10 pts (minimal 1 field match)
 * - None: < 10 pts (tidak ada yang match)
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
      // Step 1: Ketika jalur spesifik dipilih (bukan "All"), filter dulu mentor yg path-nya cocok
      // Data mentor bisa punya path "SNBT (Seleksi...)" sementara dropdown hanya "SNBT" - pakai includes()
      const mentorsToScore = matchPath !== 'All'
        ? mentors.filter(m => m.path.toLowerCase().includes(matchPath.toLowerCase()))
        : mentors;

      const resultsWithScores = mentorsToScore.map(mentor => {
        let score = 0;
        let matchCount = 0;

        // Priority 1: MAJOR (Jurusan) - HIGHEST WEIGHT: 40 pts
        if (matchMajor && mentor.major.toLowerCase().includes(matchMajor.toLowerCase())) {
          score += 40;
          matchCount++;
        }

        // Priority 2: UNIVERSITY (Universitas) - WEIGHT: 35 pts
        // Pakai matchUniversitySmart agar UI tidak salah match UIN Jakarta
        if (matchUniversity && matchUniversitySmart(mentor.university, matchUniversity)) {
          score += 35;
          matchCount++;
        }

        // Priority 3: PATH (Jalur Masuk) - WEIGHT: 15 pts
        // Pakai includes() karena data bisa "SNBT (Seleksi...)" sementara dropdown "SNBT"
        if (matchPath !== 'All' && mentor.path.toLowerCase().includes(matchPath.toLowerCase())) {
          score += 15;
          matchCount++;
        }

        // Priority 4: CATEGORY (Institusi) - LOWEST WEIGHT: 10 pts
        if (matchTarget !== 'All' && mentor.category === matchTarget) {
          score += 10;
          matchCount++;
        }

        return { mentor, score, matchCount };
      })
        .filter(r => r.score >= 10) // Minimum 10 pts (ada minimal 1 match yang significant)
        .sort((a, b) => {
          // Sort by score DESC, then by match count DESC untuk consistency
          if (b.score !== a.score) return b.score - a.score;
          return b.matchCount - a.matchCount;
        });

      const topScore = resultsWithScores[0]?.score || 0;
      let type: 'exact' | 'partial' | 'none' = 'none';

      // Determine match type berdasarkan score
      if (topScore >= 85) type = 'exact';
      else if (topScore >= 10) type = 'partial';
      else type = 'none';

      // Get top 12 results dengan score >= 10 (sudah di-filter di atas)
      const finalMentors = resultsWithScores
        .slice(0, 12)
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
