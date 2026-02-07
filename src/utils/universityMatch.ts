/**
 * Smart matching untuk nama universitas
 * Memisahkan UI (Universitas Indonesia) vs UIN Jakarta - keduanya berbeda
 */

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Alias: singkatan <-> nama lengkap. UI dan UIN Jakarta berbeda institusi. */
const ALIAS_MAP: Record<string, string[]> = {
  'ui': ['universitas indonesia', '(ui)'],
  'uin': ['uin jakarta', 'uin syarif', 'uinjkt'],
  'ugm': ['universitas gadjah mada', 'ugm'],
  'itb': ['institut teknologi bandung', 'itb'],
  'ipb': ['institut pertanian bogor', 'ipb'],
  'its': ['institut teknologi sepuluh nopember', 'its'],
  'undip': ['universitas diponegoro', 'undip'],
  'unpad': ['universitas padjadjaran', 'unpad'],
  'unj': ['universitas negeri jakarta', 'unj'],
  'upnvj': ['upnvj'],
};

/**
 * Cek apakah field universitas mentor cocok dengan search term.
 * - "UI" match "Universitas Indonesia (UI)" tapi TIDAK "UIN Jakarta"
 * - "UIN" match "UIN Jakarta" tapi TIDAK "Universitas Indonesia"
 */
export const matchUniversitySmart = (mentorUniversity: string, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return false;
  const term = searchTerm.trim().toLowerCase();
  const univ = mentorUniversity.toLowerCase();

  const variants = ALIAS_MAP[term];
  if (variants) {
    return variants.some(v => univ.includes(v));
  }

  // Tanpa alias: pakai word boundary agar "UI" tidak match di dalam "UIN"
  const escaped = escapeRegex(term);
  return new RegExp(`\\b${escaped}\\b`, 'i').test(mentorUniversity);
};
