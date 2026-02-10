/**
 * Data Passing Grade & Statistik Prodi PTN Jawa + Top 30
 * 
 * DISCLAIMER: Data ini adalah ESTIMASI berdasarkan berbagai sumber publik
 * Bukan data resmi dari LTMPT. Gunakan sebagai referensi, bukan patokan pasti.
 * 
 * Skor dalam bentuk persentase (0-100)
 */

export interface ProdiData {
    id: string;
    universitas: string;
    kodeUniv: string;
    prodi: string;
    fakultas: string;
    jenjang: 'S1' | 'D3' | 'D4';
    rumpun: 'SAINTEK' | 'SOSHUM';
    akreditasi: 'A' | 'B' | 'Unggul' | 'Baik Sekali';

    // Data SNBP
    snbp: {
        dayaTampung: number;
        peminatTahunLalu: number;
        rasioKeketatan: number; // peminat / daya tampung
        estimasiMinRapor: number; // rata-rata nilai rapor minimum (skala 100)
    };

    // Data SNBT  
    snbt: {
        dayaTampung: number;
        peminatTahunLalu: number;
        rasioKeketatan: number;
        estimasiMinSkor: number; // skor UTBK minimum (skala 1000)
    };

    // Metadata
    tags: string[];
    prospekKerja: string[];
}

export const PASSING_GRADE_DATA: ProdiData[] = [
    // ==================== UNIVERSITAS INDONESIA ====================
    // ==================== UNIVERSITAS GADJAH MADA ====================
    {
        id: 'ugm-kedokteran',
        universitas: 'Universitas Gadjah Mada',
        kodeUniv: 'UGM',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran, Kesehatan Masyarakat, dan Keperawatan',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 6000,
            rasioKeketatan: 100,
            estimasiMinRapor: 95.2
        },
        snbt: {
            dayaTampung: 120,
            peminatTahunLalu: 9000,
            rasioKeketatan: 75,
            estimasiMinSkor: 720
        },
        tags: ['favorit', 'kedokteran', 'kesehatan'],
        prospekKerja: ['Dokter', 'Peneliti Medis', 'Dosen']
    },
    {
        id: 'ugm-hukum',
        universitas: 'Universitas Gadjah Mada',
        kodeUniv: 'UGM',
        prodi: 'Ilmu Hukum',
        fakultas: 'Fakultas Hukum',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 80,
            peminatTahunLalu: 5000,
            rasioKeketatan: 62.5,
            estimasiMinRapor: 92.5
        },
        snbt: {
            dayaTampung: 160,
            peminatTahunLalu: 8000,
            rasioKeketatan: 50,
            estimasiMinSkor: 670
        },
        tags: ['hukum', 'sosial'],
        prospekKerja: ['Pengacara', 'Notaris', 'Legal Officer']
    },
    // ==================== UNIVERSITAS AIRLANGGA ====================
    {
        id: 'unair-akuntansi',
        universitas: 'Universitas Airlangga',
        kodeUniv: 'UNAIR',
        prodi: 'Akuntansi',
        fakultas: 'Fakultas Ekonomi dan Bisnis',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 3000,
            rasioKeketatan: 60,
            estimasiMinRapor: 91.8
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 5000,
            rasioKeketatan: 50,
            estimasiMinSkor: 660
        },
        tags: ['akuntansi', 'bisnis', 'keuangan'],
        prospekKerja: ['Auditor', 'Akuntan', 'Financial Analyst']
    },
    // ==================== UNIVERSITAS DIPONEGORO ====================
    {
        id: 'undip-teknik-sipil',
        universitas: 'Universitas Diponegoro',
        kodeUniv: 'UNDIP',
        prodi: 'Teknik Sipil',
        fakultas: 'Fakultas Teknik',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'A',
        snbp: {
            dayaTampung: 40,
            peminatTahunLalu: 2000,
            rasioKeketatan: 50,
            estimasiMinRapor: 90.5
        },
        snbt: {
            dayaTampung: 80,
            peminatTahunLalu: 3500,
            rasioKeketatan: 43.75,
            estimasiMinSkor: 640
        },
        tags: ['teknik', 'sipil', 'infrastruktur'],
        prospekKerja: ['Civil Engineer', 'Konsultan Konstruksi']
    },
    {
        id: 'ui-kedokteran',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 4823,
            rasioKeketatan: 96.46,
            estimasiMinRapor: 95.5
        },
        snbt: {
            dayaTampung: 150,
            peminatTahunLalu: 8234,
            rasioKeketatan: 54.89,
            estimasiMinSkor: 725
        },
        tags: ['favorit', 'kompetitif', 'kedokteran'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis', 'Peneliti Medis', 'Dosen']
    },
    {
        id: 'ui-teknik-informatika',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Ilmu Komputer',
        fakultas: 'Fakultas Ilmu Komputer',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 45,
            peminatTahunLalu: 3156,
            rasioKeketatan: 70.13,
            estimasiMinRapor: 93.8
        },
        snbt: {
            dayaTampung: 90,
            peminatTahunLalu: 5678,
            rasioKeketatan: 63.09,
            estimasiMinSkor: 698
        },
        tags: ['favorit', 'teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'Data Scientist', 'Product Manager', 'Startup Founder']
    },
    {
        id: 'ui-sistem-informasi',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Sistem Informasi',
        fakultas: 'Fakultas Ilmu Komputer',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 40,
            peminatTahunLalu: 2234,
            rasioKeketatan: 55.85,
            estimasiMinRapor: 92.1
        },
        snbt: {
            dayaTampung: 80,
            peminatTahunLalu: 4123,
            rasioKeketatan: 51.54,
            estimasiMinSkor: 678
        },
        tags: ['teknologi', 'bisnis', 'komputer'],
        prospekKerja: ['Business Analyst', 'IT Consultant', 'System Analyst', 'Project Manager']
    },
    {
        id: 'ui-hukum',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Ilmu Hukum',
        fakultas: 'Fakultas Hukum',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 80,
            peminatTahunLalu: 5678,
            rasioKeketatan: 70.98,
            estimasiMinRapor: 93.2
        },
        snbt: {
            dayaTampung: 200,
            peminatTahunLalu: 9123,
            rasioKeketatan: 45.62,
            estimasiMinSkor: 685
        },
        tags: ['favorit', 'hukum', 'sosial'],
        prospekKerja: ['Pengacara', 'Jaksa', 'Hakim', 'Legal Counsel', 'Notaris']
    },
    {
        id: 'ui-akuntansi',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Akuntansi',
        fakultas: 'Fakultas Ekonomi dan Bisnis',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 4234,
            rasioKeketatan: 70.57,
            estimasiMinRapor: 93.5
        },
        snbt: {
            dayaTampung: 120,
            peminatTahunLalu: 7456,
            rasioKeketatan: 62.13,
            estimasiMinSkor: 692
        },
        tags: ['favorit', 'bisnis', 'keuangan'],
        prospekKerja: ['Auditor', 'Akuntan Publik', 'Financial Analyst', 'Tax Consultant']
    },
    {
        id: 'ui-psikologi',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Psikologi',
        fakultas: 'Fakultas Psikologi',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 4567,
            rasioKeketatan: 83.04,
            estimasiMinRapor: 94.1
        },
        snbt: {
            dayaTampung: 110,
            peminatTahunLalu: 6789,
            rasioKeketatan: 61.72,
            estimasiMinSkor: 688
        },
        tags: ['favorit', 'sosial', 'kesehatan mental'],
        prospekKerja: ['Psikolog Klinis', 'HRD', 'Konselor', 'UX Researcher']
    },
    {
        id: 'ui-teknik-elektro',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Teknik Elektro',
        fakultas: 'Fakultas Teknik',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 1890,
            rasioKeketatan: 37.8,
            estimasiMinRapor: 91.2
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 3456,
            rasioKeketatan: 34.56,
            estimasiMinSkor: 658
        },
        tags: ['teknik', 'elektronika'],
        prospekKerja: ['Electrical Engineer', 'Hardware Engineer', 'Power Systems Engineer']
    },
    {
        id: 'ui-arsitektur',
        universitas: 'Universitas Indonesia',
        kodeUniv: 'UI',
        prodi: 'Arsitektur',
        fakultas: 'Fakultas Teknik',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 35,
            peminatTahunLalu: 1678,
            rasioKeketatan: 47.94,
            estimasiMinRapor: 91.8
        },
        snbt: {
            dayaTampung: 70,
            peminatTahunLalu: 2890,
            rasioKeketatan: 41.29,
            estimasiMinSkor: 665
        },
        tags: ['teknik', 'desain', 'kreatif'],
        prospekKerja: ['Arsitek', 'Interior Designer', 'Urban Planner', 'Landscape Architect']
    },

    // ==================== ITB ====================
    {
        id: 'itb-teknik-informatika',
        universitas: 'Institut Teknologi Bandung',
        kodeUniv: 'ITB',
        prodi: 'Teknik Informatika',
        fakultas: 'Sekolah Teknik Elektro dan Informatika',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 5234,
            rasioKeketatan: 87.23,
            estimasiMinRapor: 96.2
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 9876,
            rasioKeketatan: 98.76,
            estimasiMinSkor: 738
        },
        tags: ['favorit', 'top-tier', 'teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'AI/ML Engineer', 'CTO', 'Tech Lead']
    },
    {
        id: 'itb-teknik-elektro',
        universitas: 'Institut Teknologi Bandung',
        kodeUniv: 'ITB',
        prodi: 'Teknik Elektro',
        fakultas: 'Sekolah Teknik Elektro dan Informatika',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 2345,
            rasioKeketatan: 42.64,
            estimasiMinRapor: 93.5
        },
        snbt: {
            dayaTampung: 90,
            peminatTahunLalu: 4567,
            rasioKeketatan: 50.74,
            estimasiMinSkor: 695
        },
        tags: ['teknik', 'elektronika'],
        prospekKerja: ['Electrical Engineer', 'Embedded Systems Engineer', 'R&D Engineer']
    },
    {
        id: 'itb-arsitektur',
        universitas: 'Institut Teknologi Bandung',
        kodeUniv: 'ITB',
        prodi: 'Arsitektur',
        fakultas: 'Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 40,
            peminatTahunLalu: 2123,
            rasioKeketatan: 53.08,
            estimasiMinRapor: 93.8
        },
        snbt: {
            dayaTampung: 65,
            peminatTahunLalu: 3456,
            rasioKeketatan: 53.17,
            estimasiMinSkor: 685
        },
        tags: ['desain', 'kreatif', 'teknik'],
        prospekKerja: ['Arsitek', 'Urban Designer', 'Project Manager Konstruksi']
    },
    {
        id: 'itb-teknik-mesin',
        universitas: 'Institut Teknologi Bandung',
        kodeUniv: 'ITB',
        prodi: 'Teknik Mesin',
        fakultas: 'Fakultas Teknik Mesin dan Dirgantara',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 70,
            peminatTahunLalu: 2890,
            rasioKeketatan: 41.29,
            estimasiMinRapor: 92.8
        },
        snbt: {
            dayaTampung: 120,
            peminatTahunLalu: 5234,
            rasioKeketatan: 43.62,
            estimasiMinSkor: 678
        },
        tags: ['teknik', 'mesin', 'manufaktur'],
        prospekKerja: ['Mechanical Engineer', 'Manufacturing Engineer', 'Automotive Engineer']
    },
    {
        id: 'itb-teknik-kimia',
        universitas: 'Institut Teknologi Bandung',
        kodeUniv: 'ITB',
        prodi: 'Teknik Kimia',
        fakultas: 'Fakultas Teknologi Industri',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 1789,
            rasioKeketatan: 29.82,
            estimasiMinRapor: 91.5
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 3234,
            rasioKeketatan: 32.34,
            estimasiMinSkor: 665
        },
        tags: ['teknik', 'kimia', 'industri'],
        prospekKerja: ['Process Engineer', 'Chemical Engineer', 'R&D Scientist']
    },
    // Removed malformed duplicate entries for 'ugm-hukum-1' and 'ugm-hukum-2'.
    {
        id: 'ugm-teknik-informatika',
        universitas: 'Universitas Gadjah Mada',
        kodeUniv: 'UGM',
        prodi: 'Teknik Informatika',
        fakultas: 'Fakultas Teknik',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 45,
            peminatTahunLalu: 2678,
            rasioKeketatan: 59.51,
            estimasiMinRapor: 92.8
        },
        snbt: {
            dayaTampung: 85,
            peminatTahunLalu: 5123,
            rasioKeketatan: 60.27,
            estimasiMinSkor: 688
        },
        tags: ['favorit', 'teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'Data Scientist', 'Backend Developer']
    },
    {
        id: 'ugm-hukum',
        universitas: 'Universitas Gadjah Mada',
        kodeUniv: 'UGM',
        prodi: 'Ilmu Hukum',
        fakultas: 'Fakultas Hukum',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 90,
            peminatTahunLalu: 5432,
            rasioKeketatan: 60.36,
            estimasiMinRapor: 92.5
        },
        snbt: {
            dayaTampung: 180,
            peminatTahunLalu: 8234,
            rasioKeketatan: 45.74,
            estimasiMinSkor: 675
        },
        tags: ['favorit', 'hukum', 'sosial'],
        prospekKerja: ['Pengacara', 'Notaris', 'Diplomat', 'Legal Counsel']
    },
    {
        id: 'ugm-psikologi',
        universitas: 'Universitas Gadjah Mada',
        kodeUniv: 'UGM',
        prodi: 'Psikologi',
        fakultas: 'Fakultas Psikologi',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 4123,
            rasioKeketatan: 68.72,
            estimasiMinRapor: 93.5
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 6234,
            rasioKeketatan: 62.34,
            estimasiMinSkor: 682
        },
        tags: ['favorit', 'sosial', 'kesehatan mental'],
        prospekKerja: ['Psikolog', 'HRD', 'Konselor', 'Terapis']
    },
    {
        id: 'ugm-farmasi',
        universitas: 'Universitas Gadjah Mada',
        kodeUniv: 'UGM',
        prodi: 'Farmasi',
        fakultas: 'Fakultas Farmasi',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2345,
            rasioKeketatan: 46.9,
            estimasiMinRapor: 91.8
        },
        snbt: {
            dayaTampung: 90,
            peminatTahunLalu: 4123,
            rasioKeketatan: 45.81,
            estimasiMinSkor: 668
        },
        tags: ['kesehatan', 'farmasi', 'sains'],
        prospekKerja: ['Apoteker', 'Quality Control', 'R&D Farmasi', 'Medical Representative']
    },

    // ==================== IPB ====================
    {
        id: 'ipb-agribisnis',
        universitas: 'Institut Pertanian Bogor',
        kodeUniv: 'IPB',
        prodi: 'Agribisnis',
        fakultas: 'Fakultas Ekonomi dan Manajemen',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 70,
            peminatTahunLalu: 2890,
            rasioKeketatan: 41.29,
            estimasiMinRapor: 90.5
        },
        snbt: {
            dayaTampung: 140,
            peminatTahunLalu: 5234,
            rasioKeketatan: 37.39,
            estimasiMinSkor: 645
        },
        tags: ['bisnis', 'pertanian', 'ekonomi'],
        prospekKerja: ['Agribusiness Manager', 'Supply Chain', 'Agricultural Consultant']
    },
    {
        id: 'ipb-teknologi-pangan',
        universitas: 'Institut Pertanian Bogor',
        kodeUniv: 'IPB',
        prodi: 'Teknologi Pangan',
        fakultas: 'Fakultas Teknologi Pertanian',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 2123,
            rasioKeketatan: 38.6,
            estimasiMinRapor: 90.2
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 3789,
            rasioKeketatan: 37.89,
            estimasiMinSkor: 638
        },
        tags: ['teknologi', 'pangan', 'sains'],
        prospekKerja: ['Food Technologist', 'Quality Assurance', 'R&D Food Industry']
    },
    {
        id: 'ipb-kedokteran-hewan',
        universitas: 'Institut Pertanian Bogor',
        kodeUniv: 'IPB',
        prodi: 'Pendidikan Dokter Hewan',
        fakultas: 'Fakultas Kedokteran Hewan',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 2567,
            rasioKeketatan: 42.78,
            estimasiMinRapor: 91.2
        },
        snbt: {
            dayaTampung: 110,
            peminatTahunLalu: 4234,
            rasioKeketatan: 38.49,
            estimasiMinSkor: 652
        },
        tags: ['kedokteran', 'hewan', 'sains'],
        prospekKerja: ['Dokter Hewan', 'Peneliti', 'Pet Industry', 'Wildlife Conservation']
    },

    // ==================== UNAIR ====================
    {
        id: 'unair-kedokteran',
        universitas: 'Universitas Airlangga',
        kodeUniv: 'UNAIR',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 3890,
            rasioKeketatan: 64.83,
            estimasiMinRapor: 94.5
        },
        snbt: {
            dayaTampung: 140,
            peminatTahunLalu: 6789,
            rasioKeketatan: 48.49,
            estimasiMinSkor: 705
        },
        tags: ['favorit', 'kedokteran', 'kesehatan'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis', 'Akademisi']
    },
    {
        id: 'unair-psikologi',
        universitas: 'Universitas Airlangga',
        kodeUniv: 'UNAIR',
        prodi: 'Psikologi',
        fakultas: 'Fakultas Psikologi',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 3456,
            rasioKeketatan: 69.12,
            estimasiMinRapor: 92.8
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 5678,
            rasioKeketatan: 56.78,
            estimasiMinSkor: 672
        },
        tags: ['favorit', 'sosial', 'kesehatan mental'],
        prospekKerja: ['Psikolog', 'HRD', 'Konselor']
    },
    {
        id: 'unair-hukum',
        universitas: 'Universitas Airlangga',
        kodeUniv: 'UNAIR',
        prodi: 'Ilmu Hukum',
        fakultas: 'Fakultas Hukum',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 80,
            peminatTahunLalu: 4234,
            rasioKeketatan: 52.93,
            estimasiMinRapor: 91.5
        },
        snbt: {
            dayaTampung: 160,
            peminatTahunLalu: 6890,
            rasioKeketatan: 43.06,
            estimasiMinSkor: 658
        },
        tags: ['hukum', 'sosial'],
        prospekKerja: ['Pengacara', 'Notaris', 'Legal Counsel']
    },

    // ==================== ITS ====================
    {
        id: 'its-teknik-informatika',
        universitas: 'Institut Teknologi Sepuluh Nopember',
        kodeUniv: 'ITS',
        prodi: 'Teknik Informatika',
        fakultas: 'Fakultas Teknologi Elektro dan Informatika Cerdas',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2890,
            rasioKeketatan: 57.8,
            estimasiMinRapor: 92.5
        },
        snbt: {
            dayaTampung: 95,
            peminatTahunLalu: 5432,
            rasioKeketatan: 57.18,
            estimasiMinSkor: 682
        },
        tags: ['favorit', 'teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'Backend Developer', 'Data Engineer']
    },
    {
        id: 'its-teknik-elektro',
        universitas: 'Institut Teknologi Sepuluh Nopember',
        kodeUniv: 'ITS',
        prodi: 'Teknik Elektro',
        fakultas: 'Fakultas Teknologi Elektro dan Informatika Cerdas',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 1890,
            rasioKeketatan: 34.36,
            estimasiMinRapor: 90.8
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 3456,
            rasioKeketatan: 34.56,
            estimasiMinSkor: 655
        },
        tags: ['teknik', 'elektronika'],
        prospekKerja: ['Electrical Engineer', 'Control Engineer', 'PLN']
    },
    {
        id: 'its-teknik-perkapalan',
        universitas: 'Institut Teknologi Sepuluh Nopember',
        kodeUniv: 'ITS',
        prodi: 'Teknik Perkapalan',
        fakultas: 'Fakultas Teknologi Kelautan',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 1567,
            rasioKeketatan: 26.12,
            estimasiMinRapor: 89.5
        },
        snbt: {
            dayaTampung: 110,
            peminatTahunLalu: 2890,
            rasioKeketatan: 26.27,
            estimasiMinSkor: 635
        },
        tags: ['teknik', 'maritim', 'unik'],
        prospekKerja: ['Naval Architect', 'Marine Engineer', 'Shipyard Manager']
    },

    // ==================== UNDIP ====================
    {
        id: 'undip-kedokteran',
        universitas: 'Universitas Diponegoro',
        kodeUniv: 'UNDIP',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 3234,
            rasioKeketatan: 58.8,
            estimasiMinRapor: 93.8
        },
        snbt: {
            dayaTampung: 120,
            peminatTahunLalu: 5678,
            rasioKeketatan: 47.32,
            estimasiMinSkor: 695
        },
        tags: ['favorit', 'kedokteran'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis']
    },
    {
        id: 'undip-teknik-informatika',
        universitas: 'Universitas Diponegoro',
        kodeUniv: 'UNDIP',
        prodi: 'Informatika',
        fakultas: 'Fakultas Sains dan Matematika',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2123,
            rasioKeketatan: 42.46,
            estimasiMinRapor: 91.2
        },
        snbt: {
            dayaTampung: 90,
            peminatTahunLalu: 3890,
            rasioKeketatan: 43.22,
            estimasiMinSkor: 662
        },
        tags: ['teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'Data Analyst', 'IT Consultant']
    },
    {
        id: 'undip-hukum',
        universitas: 'Universitas Diponegoro',
        kodeUniv: 'UNDIP',
        prodi: 'Ilmu Hukum',
        fakultas: 'Fakultas Hukum',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 85,
            peminatTahunLalu: 3890,
            rasioKeketatan: 45.76,
            estimasiMinRapor: 90.8
        },
        snbt: {
            dayaTampung: 170,
            peminatTahunLalu: 6234,
            rasioKeketatan: 36.67,
            estimasiMinSkor: 652
        },
        tags: ['hukum', 'sosial'],
        prospekKerja: ['Pengacara', 'Notaris', 'PPAT']
    },

    // ==================== UNPAD ====================
    {
        id: 'unpad-kedokteran',
        universitas: 'Universitas Padjadjaran',
        kodeUniv: 'UNPAD',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 3567,
            rasioKeketatan: 59.45,
            estimasiMinRapor: 94.2
        },
        snbt: {
            dayaTampung: 130,
            peminatTahunLalu: 6123,
            rasioKeketatan: 47.1,
            estimasiMinSkor: 702
        },
        tags: ['favorit', 'kedokteran'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis', 'Akademisi']
    },
    {
        id: 'unpad-psikologi',
        universitas: 'Universitas Padjadjaran',
        kodeUniv: 'UNPAD',
        prodi: 'Psikologi',
        fakultas: 'Fakultas Psikologi',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 3789,
            rasioKeketatan: 68.89,
            estimasiMinRapor: 93.2
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 5890,
            rasioKeketatan: 58.9,
            estimasiMinSkor: 678
        },
        tags: ['favorit', 'sosial', 'kesehatan mental'],
        prospekKerja: ['Psikolog', 'HRD', 'Konselor']
    },
    {
        id: 'unpad-komunikasi',
        universitas: 'Universitas Padjadjaran',
        kodeUniv: 'UNPAD',
        prodi: 'Ilmu Komunikasi',
        fakultas: 'Fakultas Ilmu Komunikasi',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 80,
            peminatTahunLalu: 5234,
            rasioKeketatan: 65.43,
            estimasiMinRapor: 92.8
        },
        snbt: {
            dayaTampung: 160,
            peminatTahunLalu: 8765,
            rasioKeketatan: 54.78,
            estimasiMinSkor: 672
        },
        tags: ['favorit', 'komunikasi', 'media'],
        prospekKerja: ['Jurnalis', 'PR Specialist', 'Content Creator', 'Marketing']
    },

    // ==================== UB (BRAWIJAYA) ====================
    {
        id: 'ub-kedokteran',
        universitas: 'Universitas Brawijaya',
        kodeUniv: 'UB',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 3123,
            rasioKeketatan: 56.78,
            estimasiMinRapor: 93.5
        },
        snbt: {
            dayaTampung: 120,
            peminatTahunLalu: 5432,
            rasioKeketatan: 45.27,
            estimasiMinSkor: 692
        },
        tags: ['favorit', 'kedokteran'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis']
    },
    {
        id: 'ub-teknik-informatika',
        universitas: 'Universitas Brawijaya',
        kodeUniv: 'UB',
        prodi: 'Teknik Informatika',
        fakultas: 'Fakultas Ilmu Komputer',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 55,
            peminatTahunLalu: 2456,
            rasioKeketatan: 44.65,
            estimasiMinRapor: 91.5
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 4567,
            rasioKeketatan: 45.67,
            estimasiMinSkor: 668
        },
        tags: ['teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'Mobile Developer', 'Data Analyst']
    },
    {
        id: 'ub-manajemen',
        universitas: 'Universitas Brawijaya',
        kodeUniv: 'UB',
        prodi: 'Manajemen',
        fakultas: 'Fakultas Ekonomi dan Bisnis',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 90,
            peminatTahunLalu: 4567,
            rasioKeketatan: 50.74,
            estimasiMinRapor: 90.8
        },
        snbt: {
            dayaTampung: 180,
            peminatTahunLalu: 7890,
            rasioKeketatan: 43.83,
            estimasiMinSkor: 655
        },
        tags: ['bisnis', 'manajemen'],
        prospekKerja: ['Management Trainee', 'Business Analyst', 'Entrepreneur']
    },

    // ==================== UNS ====================
    {
        id: 'uns-kedokteran',
        universitas: 'Universitas Sebelas Maret',
        kodeUniv: 'UNS',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2890,
            rasioKeketatan: 57.8,
            estimasiMinRapor: 93.2
        },
        snbt: {
            dayaTampung: 110,
            peminatTahunLalu: 4890,
            rasioKeketatan: 44.45,
            estimasiMinSkor: 688
        },
        tags: ['favorit', 'kedokteran'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis']
    },
    {
        id: 'uns-teknik-informatika',
        universitas: 'Universitas Sebelas Maret',
        kodeUniv: 'UNS',
        prodi: 'Informatika',
        fakultas: 'Fakultas MIPA',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 45,
            peminatTahunLalu: 1890,
            rasioKeketatan: 42,
            estimasiMinRapor: 90.5
        },
        snbt: {
            dayaTampung: 85,
            peminatTahunLalu: 3456,
            rasioKeketatan: 40.66,
            estimasiMinSkor: 655
        },
        tags: ['teknologi', 'komputer'],
        prospekKerja: ['Software Engineer', 'IT Support', 'Web Developer']
    },
    {
        id: 'uns-farmasi',
        universitas: 'Universitas Sebelas Maret',
        kodeUniv: 'UNS',
        prodi: 'Farmasi',
        fakultas: 'Fakultas Farmasi',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 45,
            peminatTahunLalu: 1678,
            rasioKeketatan: 37.29,
            estimasiMinRapor: 90.2
        },
        snbt: {
            dayaTampung: 80,
            peminatTahunLalu: 2890,
            rasioKeketatan: 36.13,
            estimasiMinSkor: 645
        },
        tags: ['kesehatan', 'farmasi'],
        prospekKerja: ['Apoteker', 'Quality Control', 'Medical Representative']
    },

    // ==================== UNJ ====================
    {
        id: 'unj-pgsd',
        universitas: 'Universitas Negeri Jakarta',
        kodeUniv: 'UNJ',
        prodi: 'Pendidikan Guru Sekolah Dasar',
        fakultas: 'Fakultas Ilmu Pendidikan',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 100,
            peminatTahunLalu: 3890,
            rasioKeketatan: 38.9,
            estimasiMinRapor: 89.5
        },
        snbt: {
            dayaTampung: 200,
            peminatTahunLalu: 6234,
            rasioKeketatan: 31.17,
            estimasiMinSkor: 625
        },
        tags: ['pendidikan', 'guru'],
        prospekKerja: ['Guru SD', 'Kepala Sekolah', 'Education Consultant']
    },
    {
        id: 'unj-psikologi',
        universitas: 'Universitas Negeri Jakarta',
        kodeUniv: 'UNJ',
        prodi: 'Psikologi',
        fakultas: 'Fakultas Pendidikan Psikologi',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'A',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2567,
            rasioKeketatan: 51.34,
            estimasiMinRapor: 91.2
        },
        snbt: {
            dayaTampung: 90,
            peminatTahunLalu: 4123,
            rasioKeketatan: 45.81,
            estimasiMinSkor: 652
        },
        tags: ['psikologi', 'pendidikan'],
        prospekKerja: ['Psikolog Pendidikan', 'HRD', 'Konselor Sekolah']
    },

    // ==================== UNY ====================
    {
        id: 'uny-pgsd',
        universitas: 'Universitas Negeri Yogyakarta',
        kodeUniv: 'UNY',
        prodi: 'Pendidikan Guru Sekolah Dasar',
        fakultas: 'Fakultas Ilmu Pendidikan',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 120,
            peminatTahunLalu: 4234,
            rasioKeketatan: 35.28,
            estimasiMinRapor: 89.2
        },
        snbt: {
            dayaTampung: 240,
            peminatTahunLalu: 6890,
            rasioKeketatan: 28.71,
            estimasiMinSkor: 618
        },
        tags: ['pendidikan', 'guru'],
        prospekKerja: ['Guru SD', 'Pendidik', 'Tutor']
    },
    {
        id: 'uny-pend-bahasa-inggris',
        universitas: 'Universitas Negeri Yogyakarta',
        kodeUniv: 'UNY',
        prodi: 'Pendidikan Bahasa Inggris',
        fakultas: 'Fakultas Bahasa dan Seni',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 60,
            peminatTahunLalu: 2345,
            rasioKeketatan: 39.08,
            estimasiMinRapor: 90.5
        },
        snbt: {
            dayaTampung: 110,
            peminatTahunLalu: 3890,
            rasioKeketatan: 35.36,
            estimasiMinSkor: 635
        },
        tags: ['pendidikan', 'bahasa'],
        prospekKerja: ['Guru Bahasa Inggris', 'Translator', 'Content Writer']
    },

    // ==================== UPI ====================
    {
        id: 'upi-pgsd',
        universitas: 'Universitas Pendidikan Indonesia',
        kodeUniv: 'UPI',
        prodi: 'Pendidikan Guru Sekolah Dasar',
        fakultas: 'Fakultas Ilmu Pendidikan',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 150,
            peminatTahunLalu: 5234,
            rasioKeketatan: 34.89,
            estimasiMinRapor: 89.8
        },
        snbt: {
            dayaTampung: 300,
            peminatTahunLalu: 8567,
            rasioKeketatan: 28.56,
            estimasiMinSkor: 622
        },
        tags: ['pendidikan', 'guru'],
        prospekKerja: ['Guru SD', 'Kepala Sekolah', 'Dosen']
    },
    {
        id: 'upi-psikologi',
        universitas: 'Universitas Pendidikan Indonesia',
        kodeUniv: 'UPI',
        prodi: 'Psikologi',
        fakultas: 'Fakultas Ilmu Pendidikan',
        jenjang: 'S1',
        rumpun: 'SOSHUM',
        akreditasi: 'A',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2234,
            rasioKeketatan: 44.68,
            estimasiMinRapor: 91.5
        },
        snbt: {
            dayaTampung: 90,
            peminatTahunLalu: 3789,
            rasioKeketatan: 42.1,
            estimasiMinSkor: 648
        },
        tags: ['psikologi', 'pendidikan'],
        prospekKerja: ['Psikolog', 'Konselor', 'HRD']
    },

    // ==================== UNSOED ====================
    {
        id: 'unsoed-kedokteran',
        universitas: 'Universitas Jenderal Soedirman',
        kodeUniv: 'UNSOED',
        prodi: 'Pendidikan Dokter',
        fakultas: 'Fakultas Kedokteran',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'Unggul',
        snbp: {
            dayaTampung: 50,
            peminatTahunLalu: 2567,
            rasioKeketatan: 51.34,
            estimasiMinRapor: 92.8
        },
        snbt: {
            dayaTampung: 100,
            peminatTahunLalu: 4234,
            rasioKeketatan: 42.34,
            estimasiMinSkor: 678
        },
        tags: ['kedokteran'],
        prospekKerja: ['Dokter Umum', 'Dokter Spesialis']
    },
    {
        id: 'unsoed-farmasi',
        universitas: 'Universitas Jenderal Soedirman',
        kodeUniv: 'UNSOED',
        prodi: 'Farmasi',
        fakultas: 'Fakultas Ilmu Kesehatan',
        jenjang: 'S1',
        rumpun: 'SAINTEK',
        akreditasi: 'A',
        snbp: {
            dayaTampung: 40,
            peminatTahunLalu: 1456,
            rasioKeketatan: 36.4,
            estimasiMinRapor: 89.8
        },
        snbt: {
            dayaTampung: 75,
            peminatTahunLalu: 2567,
            rasioKeketatan: 34.23,
            estimasiMinSkor: 638
        },
        tags: ['kesehatan', 'farmasi'],
        prospekKerja: ['Apoteker', 'Quality Control']
    }
];

// Helper functions
export const getUniversitasList = () =>
    [...new Set(PASSING_GRADE_DATA.map(p => p.universitas))].sort();

export const getProdiByUniversitas = (univ: string) =>
    PASSING_GRADE_DATA.filter(p => p.universitas === univ);

export const getProdiByRumpun = (rumpun: 'SAINTEK' | 'SOSHUM') =>
    PASSING_GRADE_DATA.filter(p => p.rumpun === rumpun);

export const searchProdi = (query: string) => {
    const q = query.toLowerCase();
    return PASSING_GRADE_DATA.filter(p =>
        p.prodi.toLowerCase().includes(q) ||
        p.universitas.toLowerCase().includes(q) ||
        p.kodeUniv.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
    );
};

export const getTopKompetitif = (jalur: 'snbp' | 'snbt', limit = 10) =>
    [...PASSING_GRADE_DATA]
        .sort((a, b) => b[jalur].rasioKeketatan - a[jalur].rasioKeketatan)
        .slice(0, limit);

export const hitungPeluang = (
    prodi: ProdiData,
    jalur: 'snbp' | 'snbt',
    nilaiUser: number
): { persen: number; kategori: 'AMAN' | 'OPTIMIS' | 'COBA AJA' | 'BERAT' | 'MUSTAHIL' } => {
    // Get minimum score based on jalur
    const minSkor = jalur === 'snbp' ? prodi.snbp.estimasiMinRapor : prodi.snbt.estimasiMinSkor;
    const keketatan = prodi[jalur].rasioKeketatan;

    // Normalisasi nilai user ke skala yang sama dengan minimum
    const selisih = nilaiUser - minSkor;

    // Hitung base probability
    let basePersen: number;
    if (jalur === 'snbp') {
        // Untuk SNBP (skala 0-100), setiap 1 poin di atas minimum = +5% chance
        basePersen = 50 + (selisih * 8);
    } else {
        // Untuk SNBT (skala 0-1000), setiap 10 poin di atas minimum = +5% chance
        basePersen = 50 + (selisih / 10 * 6);
    }

    // Adjust berdasarkan keketatan
    const keketatanFactor = Math.max(0.5, 1 - (keketatan / 200));
    basePersen = basePersen * keketatanFactor;

    // Clamp ke 5-95%
    const persen = Math.min(95, Math.max(5, Math.round(basePersen)));

    // Kategorisasi
    let kategori: 'AMAN' | 'OPTIMIS' | 'COBA AJA' | 'BERAT' | 'MUSTAHIL';
    if (persen >= 75) kategori = 'AMAN';
    else if (persen >= 55) kategori = 'OPTIMIS';
    else if (persen >= 40) kategori = 'COBA AJA';
    else if (persen >= 20) kategori = 'BERAT';
    else kategori = 'MUSTAHIL';

    return { persen, kategori };
};
