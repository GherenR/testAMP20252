/**
 * Daftar universitas untuk autocomplete Smart Match
 * Diambil dari data alumni + singkatan umum
 */
export const UNIVERSITY_SUGGESTIONS = [
  'UI',
  'Universitas Indonesia',
  'UIN Jakarta',
  'ITB',
  'Institut Teknologi Bandung',
  'UGM',
  'IPB',
  'IPB University',
  'ITS',
  'Universitas Diponegoro',
  'UNDIP',
  'Universitas Brawijaya',
  'UB',
  'Universitas Padjadjaran',
  'UNPAD',
  'Universitas Airlangga',
  'UNAIR',
  'UNJ',
  'Universitas Negeri Jakarta',
  'UPNVJ',
  'Politeknik Negeri Jakarta',
  'PNJ',
  'Binus',
  'Binus University',
  'Universitas Tarumanagara',
  'UNTAR',
  'Universitas Bakrie',
  'Poltekkes',
  'UINSA',
  'UHAMKA',
  'Universitas Islam Indonesia',
  'UII',
  'Universitas Jenderal Soedirman',
  'Unsoed',
  'Perbanas',
  'MNC University',
];

export const getUniversitySuggestions = (query: string, limit = 8): string[] => {
  if (!query.trim()) return UNIVERSITY_SUGGESTIONS.slice(0, limit);
  const q = query.trim().toLowerCase();
  return UNIVERSITY_SUGGESTIONS
    .filter(u => u.toLowerCase().includes(q))
    .slice(0, limit);
};
