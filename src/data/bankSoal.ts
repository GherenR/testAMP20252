/**
 * Bank Soal SNBT - Pahamify Style
 */

export type SubtesType =
    | 'penalaran-umum'
    | 'pengetahuan-pemahaman-umum'
    | 'pemahaman-bacaan-menulis'
    | 'pengetahuan-kuantitatif'
    | 'literasi-indonesia'
    | 'literasi-inggris'
    | 'penalaran-matematika';

export interface Soal {
    id: string;
    subtes: SubtesType;
    pertanyaan: string;
    opsi: string[];
    jawabanBenar: number;
    pembahasan: string;
}

export interface SubtesConfig {
    nama: string;
    kode: SubtesType;
    jumlahSoal: number;
    waktuMenit: number;
    kategori: 'TPS' | 'Literasi';
    emoji: string;
    warna: string;
}

export const SUBTES_CONFIG: SubtesConfig[] = [
    { kode: 'penalaran-umum', nama: 'Penalaran Umum', jumlahSoal: 30, waktuMenit: 30, kategori: 'TPS', emoji: '🧠', warna: 'indigo' },
    { kode: 'pengetahuan-pemahaman-umum', nama: 'Pengetahuan & Pemahaman Umum', jumlahSoal: 20, waktuMenit: 15, kategori: 'TPS', emoji: '📚', warna: 'emerald' },
    { kode: 'pemahaman-bacaan-menulis', nama: 'Pemahaman Bacaan & Menulis', jumlahSoal: 20, waktuMenit: 25, kategori: 'TPS', emoji: '📖', warna: 'amber' },
    { kode: 'pengetahuan-kuantitatif', nama: 'Pengetahuan Kuantitatif', jumlahSoal: 20, waktuMenit: 20, kategori: 'TPS', emoji: '📊', warna: 'sky' },
    { kode: 'literasi-indonesia', nama: 'Literasi Bahasa Indonesia', jumlahSoal: 30, waktuMenit: 45, kategori: 'Literasi', emoji: '🇮🇩', warna: 'rose' },
    { kode: 'literasi-inggris', nama: 'Literasi Bahasa Inggris', jumlahSoal: 20, waktuMenit: 20, kategori: 'Literasi', emoji: '🌍', warna: 'violet' },
    { kode: 'penalaran-matematika', nama: 'Penalaran Matematika', jumlahSoal: 20, waktuMenit: 45, kategori: 'Literasi', emoji: '➗', warna: 'cyan' },
];

export const BANK_SOAL: Soal[] = [
    // PENALARAN UMUM
    { id: 'pu-001', subtes: 'penalaran-umum', pertanyaan: 'Jika Toktok Shop dibuka kembali, Riu dan Maha akan membeli sepatu. Riu tidak membeli sepatu.\n\nSimpulan yang BENAR adalah...', opsi: ['Toktok Shop dibuka dan Maha membeli', 'Toktok Shop tidak dibuka', 'Maha tetap membeli', 'Tidak dapat disimpulkan', 'Riu akan membeli nanti'], jawabanBenar: 1, pembahasan: 'Modus Tollens: Jika P maka Q. Tidak Q, maka tidak P.' },
    { id: 'pu-002', subtes: 'penalaran-umum', pertanyaan: 'Semua produk Pabrik X adalah ekspor. Beberapa ekspor mahal. Simpulan yang MUNGKIN BENAR...', opsi: ['Semua produk X mahal', 'Sebagian produk X mahal', 'Tidak ada X yang mahal', 'Semua ekspor dari X', 'Ekspor tidak mahal'], jawabanBenar: 1, pembahasan: 'Silogisme: Semua A=B, sebagian B=C, maka sebagian A mungkin C.' },
    { id: 'pu-003', subtes: 'penalaran-umum', pertanyaan: 'Pola: 2, 6, 12, 20, 30, ... Bilangan selanjutnya...', opsi: ['38', '40', '42', '44', '46'], jawabanBenar: 2, pembahasan: 'Selisih: 4,6,8,10,12. Jadi 30+12=42.' },
    { id: 'pu-004', subtes: 'penalaran-umum', pertanyaan: 'A > B, B > C, C > D. Pernyataan PASTI BENAR...', opsi: ['D > A', 'A = D', 'A > D', 'D > B', 'B > A'], jawabanBenar: 2, pembahasan: 'Transitif: A > B > C > D.' },
    { id: 'pu-005', subtes: 'penalaran-umum', pertanyaan: 'Jika hujan, jalanan basah. Jalanan tidak basah. Kesimpulan...', opsi: ['Hujan turun', 'Hujan tidak turun', 'Akan basah nanti', 'Tidak pasti', 'Mungkin hujan'], jawabanBenar: 1, pembahasan: 'Modus Tollens.' },

    // PENGETAHUAN & PEMAHAMAN UMUM
    { id: 'ppu-001', subtes: 'pengetahuan-pemahaman-umum', pertanyaan: 'Sinonim "ameliorasi"...', opsi: ['Perbaikan', 'Kerusakan', 'Perubahan', 'Penghancuran', 'Pengurangan'], jawabanBenar: 0, pembahasan: 'Ameliorasi = perbaikan.' },
    { id: 'ppu-002', subtes: 'pengetahuan-pemahaman-umum', pertanyaan: 'Antonim "heterogen"...', opsi: ['Beragam', 'Homogen', 'Campuran', 'Majemuk', 'Kompleks'], jawabanBenar: 1, pembahasan: 'Heterogen >< Homogen.' },
    { id: 'ppu-003', subtes: 'pengetahuan-pemahaman-umum', pertanyaan: 'Kata baku yang tepat...', opsi: ['Analisa', 'Analisis', 'Analis', 'Analize', 'Analise'], jawabanBenar: 1, pembahasan: 'KBBI: analisis.' },
    { id: 'ppu-004', subtes: 'pengetahuan-pemahaman-umum', pertanyaan: 'Penulisan EYD benar...', opsi: ['Jadwal di batalkan', 'Jadwal dibatalkan', 'jadwal Dibatalkan', 'JADWAL dibatalkan', 'jadwal di-batalkan'], jawabanBenar: 1, pembahasan: 'di- awalan ditulis serangkai.' },
    { id: 'ppu-005', subtes: 'pengetahuan-pemahaman-umum', pertanyaan: 'Makna "sporadis"...', opsi: ['Terus-menerus', 'Teratur', 'Jarang dan tidak teratur', 'Sering', 'Berulang'], jawabanBenar: 2, pembahasan: 'Sporadis = jarang, tidak teratur.' },

    // PEMAHAMAN BACAAN & MENULIS
    { id: 'pbm-001', subtes: 'pemahaman-bacaan-menulis', pertanyaan: '"Perubahan iklim menyebabkan dampak signifikan pada ekosistem laut. Kenaikan suhu memaksa ikan bermigrasi."\n\nIde pokok...', opsi: ['Kehidupan nelayan', 'Dampak iklim pada laut', 'Migrasi ikan', 'Suhu laut', 'Ekosistem'], jawabanBenar: 1, pembahasan: 'Paragraf tentang dampak iklim pada ekosistem laut.' },
    { id: 'pbm-002', subtes: 'pemahaman-bacaan-menulis', pertanyaan: 'Kalimat personifikasi...', opsi: ['Wajahnya bagai bulan', 'Angin berbisik', 'Dia bagai air', 'Hatinya keras bak batu', 'Rambutnya hitam'], jawabanBenar: 1, pembahasan: 'Personifikasi memberi sifat manusia pada benda.' },
    { id: 'pbm-003', subtes: 'pemahaman-bacaan-menulis', pertanyaan: '"Energi nuklir dikritik karena radiasi, namun emisinya rendah."\n\nSikap penulis...', opsi: ['Menolak', 'Netral', 'Mendukung', 'Ragu', 'Tidak peduli'], jawabanBenar: 2, pembahasan: '"Namun" = pembelaan, cenderung mendukung.' },
    { id: 'pbm-004', subtes: 'pemahaman-bacaan-menulis', pertanyaan: 'Konjungsi "baik...maupun" adalah...', opsi: ['Adversatif', 'Kausal', 'Korelatif', 'Temporal', 'Kondisional'], jawabanBenar: 2, pembahasan: 'Konjungsi korelatif = pasangan.' },
    { id: 'pbm-005', subtes: 'pemahaman-bacaan-menulis', pertanyaan: 'Kata penghubung: "Dia rajin ___ nilainya bagus"', opsi: ['tetapi', 'meskipun', 'sehingga', 'walaupun', 'namun'], jawabanBenar: 2, pembahasan: 'Sehingga = sebab-akibat positif.' },

    // PENGETAHUAN KUANTITATIF  
    { id: 'pk-001', subtes: 'pengetahuan-kuantitatif', pertanyaan: 'Jika 2^x = 32, nilai x...', opsi: ['3', '4', '5', '6', '7'], jawabanBenar: 2, pembahasan: '32 = 2^5.' },
    { id: 'pk-002', subtes: 'pengetahuan-kuantitatif', pertanyaan: '15% dari 240...', opsi: ['24', '30', '36', '42', '48'], jawabanBenar: 2, pembahasan: '0.15 × 240 = 36.' },
    { id: 'pk-003', subtes: 'pengetahuan-kuantitatif', pertanyaan: 'Rata-rata 5,8,12,15,20...', opsi: ['10', '11', '12', '13', '14'], jawabanBenar: 2, pembahasan: '60/5 = 12.' },
    { id: 'pk-004', subtes: 'pengetahuan-kuantitatif', pertanyaan: 'FPB 48 dan 72...', opsi: ['12', '18', '24', '36', '48'], jawabanBenar: 2, pembahasan: 'FPB = 24.' },
    { id: 'pk-005', subtes: 'pengetahuan-kuantitatif', pertanyaan: '√144 + √81 = ...', opsi: ['21', '23', '25', '27', '29'], jawabanBenar: 0, pembahasan: '12 + 9 = 21.' },

    // LITERASI INDONESIA
    { id: 'li-001', subtes: 'literasi-indonesia', pertanyaan: 'Data IDF: penderita diabetes Indonesia 19,5 juta (2021), proyeksi 28,57 juta (2045). Peningkatan...', opsi: ['~7 juta', '~9 juta', '~11 juta', '~13 juta', '~15 juta'], jawabanBenar: 1, pembahasan: '28.57 - 19.5 ≈ 9 juta.' },
    { id: 'li-002', subtes: 'literasi-indonesia', pertanyaan: 'E-commerce tumbuh 30%/tahun, tapi kesenjangan digital kota-desa masih ada.\n\nGagasan utama...', opsi: ['E-commerce bagus', 'Transformasi digital dan tantangan', 'Kesenjangan harus diatasi', 'Kota lebih maju', 'Internet populer'], jawabanBenar: 1, pembahasan: 'Manfaat sekaligus tantangan.' },
    { id: 'li-003', subtes: 'literasi-indonesia', pertanyaan: 'Sampah plastik: 60% rumah tangga, 25% industri, 15% lain. Solusi prioritas...', opsi: ['Bangun pabrik', 'Edukasi rumah tangga', 'Larang industri', 'Impor plastik', 'Bakar sampah'], jawabanBenar: 1, pembahasan: '60% dari rumah tangga = prioritas edukasi.' },
    { id: 'li-004', subtes: 'literasi-indonesia', pertanyaan: 'Pengguna internet: 2015=73jt, 2018=132jt, 2021=202jt. Rata-rata pertumbuhan/tahun...', opsi: ['~15 juta', '~18 juta', '~21 juta', '~24 juta', '~27 juta'], jawabanBenar: 2, pembahasan: '(202-73)/6 ≈ 21 juta/tahun.' },
    { id: 'li-005', subtes: 'literasi-indonesia', pertanyaan: 'UMKM sumbang 61% PDB, serap 97% tenaga kerja, tapi baru 13% digital. Implikasi...', opsi: ['UMKM tidak penting', 'Digitalisasi optimal', 'Potensi besar digitalisasi', 'UMKM tak perlu teknologi', 'TK terlalu banyak'], jawabanBenar: 2, pembahasan: '87% belum digital = potensi besar.' },

    // LITERASI INGGRIS
    { id: 'le-001', subtes: 'literasi-inggris', pertanyaan: 'Choose correct: She ___ coffee.', opsi: ["don't like", "doesn't likes", "doesn't like", 'not like', 'no like'], jawabanBenar: 2, pembahasan: "Third person: doesn't + base verb." },
    { id: 'le-002', subtes: 'literasi-inggris', pertanyaan: '"If I ___ rich, I would travel."', opsi: ['am', 'was', 'were', 'be', 'being'], jawabanBenar: 2, pembahasan: 'Conditional 2: were.' },
    { id: 'le-003', subtes: 'literasi-inggris', pertanyaan: '"Ubiquitous" means...', opsi: ['Rare', 'Everywhere', 'Dangerous', 'Expensive', 'Ancient'], jawabanBenar: 1, pembahasan: 'Ubiquitous = present everywhere.' },
    { id: 'le-004', subtes: 'literasi-inggris', pertanyaan: 'Antonym of "abundant"...', opsi: ['Plentiful', 'Scarce', 'Excessive', 'Copious', 'Ample'], jawabanBenar: 1, pembahasan: 'Abundant >< Scarce.' },
    { id: 'le-005', subtes: 'literasi-inggris', pertanyaan: '"___ the rain, the event continued."', opsi: ['Although', 'Because of', 'Despite', 'Since', 'Due to'], jawabanBenar: 2, pembahasan: 'Despite = contrast.' },

    // PENALARAN MATEMATIKA
    { id: 'pm-001', subtes: 'penalaran-matematika', pertanyaan: 'f(x) = 2x² - 3x + 1, maka f(2) = ...', opsi: ['1', '3', '5', '7', '9'], jawabanBenar: 1, pembahasan: '2(4) - 3(2) + 1 = 3.' },
    { id: 'pm-002', subtes: 'penalaran-matematika', pertanyaan: 'Gradien garis (1,3) dan (4,9)...', opsi: ['1', '2', '3', '4', '5'], jawabanBenar: 1, pembahasan: '(9-3)/(4-1) = 2.' },
    { id: 'pm-003', subtes: 'penalaran-matematika', pertanyaan: 'Deret aritmatika a=5, b=3. S₁₀ = ...', opsi: ['175', '185', '195', '205', '215'], jawabanBenar: 1, pembahasan: '5×(10+27) = 185.' },
    { id: 'pm-004', subtes: 'penalaran-matematika', pertanyaan: 'log₂32 + log₃27 = ...', opsi: ['6', '7', '8', '9', '10'], jawabanBenar: 2, pembahasan: '5 + 3 = 8.' },
    { id: 'pm-005', subtes: 'penalaran-matematika', pertanyaan: 'Persamaan kuadrat x²-5x+6=0, akarnya...', opsi: ['1,6', '2,3', '-2,-3', '1,5', '-1,6'], jawabanBenar: 1, pembahasan: '(x-2)(x-3) = 0.' },
];

export const getSoalBySubtes = (subtes: SubtesType): Soal[] =>
    BANK_SOAL.filter(s => s.subtes === subtes);

export const getSubtesConfig = (subtes: SubtesType): SubtesConfig | undefined =>
    SUBTES_CONFIG.find(c => c.kode === subtes);
