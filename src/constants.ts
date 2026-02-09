/**
 * 🚀 FUTURE: Gemini API Ready
 * ===========================
 * CURRENT MATCHING ALGORITHM: Client-side local scoring (in App.tsx runMatchmaker())
 * 
 * WHEN integrating Gemini API:
 * - Keep MOCK_MENTORS data for reference/fallback
 * - Call Gemini API in runMatchmaker() instead of local algorithm
 * - Use secureFetch() from utils/security for safe API calls
 * - See SECURITY.md for integration guidelines
 * 
 * API Key Location:
 * - Local: .env.local (GEMINI_API_KEY)
 * - Production: Vercel Environment Variables
 */

import { Mentor } from './types';

export const MOCK_MENTORS: Mentor[] = [
  {
    "name": "Siti Kirani Nurassifa Aminah",
    "university": "UPNVJ (Jakarta)",
    "major": "Biologi",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282125505517",
    "instagram": "ranisyif",
    "email": "kiraninurassyifaaminah@gmail.com",
    "achievements": [
      "Pil 1: UI - Biologi (S1)",
      "SNBT: UI - Statistika (S1), UNJ - Statistika (S1), UNJ - Pemasaran Digital (D4)",
      "Penmaru UPNVJ: S1 Biologi/Lulus, Penmaba UNJ: D4 Pemasaran Digital/Lulus"
    ]
  },
  {
    "name": "Zhalisha Athaya Fatihah",
    "university": "Universitas Indonesia (UI)",
    "major": "Manajemen Rekod dan Arsip",
    "path": "Mandiri PPKB UI",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/62895413910771",
    "instagram": "zhalishathyf",
    "email": "zhalisha0706@gmail.com",
    "achievements": [
      "UI - Ilmu Administrasi Fiskal",
      "SNBT: Manajemen Rekod dan Arsip UI, Administrasi Perpajakan UI, Ekonomi Syariah UNDIP",
      "PPKB - UI (D4- Manajemen Rekod dan Arsip), Jalur Prestasi Sekolah Vokasi - UNDIP"
    ]
  },
  {
    "name": "Gheren Ramandra Saputra",
    "university": "Institut Pertanian Bogor (IPB University)",
    "major": "Ilmu Komputer",
    "path": "Mandiri (Jalur Ketua OSIS)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282114927981",
    "instagram": "gheren_ramandra",
    "email": "gherenramandra@gmail.com",
    "achievements": [
      "Ketua OSIS 2023/2024",
      "UNJ - Ilmu Komputer (Tanpa TES Hanya nilai UTBK), IPB University - Ilmu Komputer"
    ]
  },
  {
    "name": "Chiesa Abby Putra",
    "university": "Universitas Jenderal Soedirman",
    "major": "Bisnis Internasional",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285797049346",
    "instagram": "chsabby",
    "email": "chiesaputra07@gmail.com",
    "achievements": ["Undip-Teknik Industri, UPNVJ-Teknik Industri, Unsoed-Bisnis Internasional"]

  },
  {
    "name": "Septiyan Dwi Putra Wibowo",
    "university": "Universitas Indonesia (UI)",
    "major": "Fisika",
    "path": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282111363420",
    "instagram": "septyan0_0",
    "email": "septyandwiip@gmail.com",
    "achievements": ["UI - Fisika (Lulus Jalur SNBP)"]
  },
  {
    "name": "Kevin Delprian",
    "university": "Politeknik Negeri Jakarta (PNJ)",
    "major": "Manajemen Keuangan",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6288225688820",
    "instagram": "kevin.d_77",
    "email": "kevindelprian30@gmail.com",
    "achievements": [
      "Juara 2 Basket HT Cup 2022, Komisi B MPK 2024, CP HT Cup 24/25",
      "Bendahara Umum Gathering Prodi Manajemen Keuangan 2025",
      "UI - Akuntansi (D3), PNJ - Manajemen Keuangan (D4)"
    ]
  },
  {
    "name": "Muhammad Putra Sofyan",
    "university": "Universitas Tarumanagara (UNTAR)",
    "major": "Psikologi",
    "path": "Reguler Tanpa TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281932797546",
    "instagram": "gagituput",
    "email": "putrasofyan31@gmail.com",
    "achievements": ["Pilihan: UB - Psikologi"]
  },
  {
    "name": "Mirza Firmansyah",
    "university": "Perbanas Institute",
    "major": "S1 Sistem Informasi",
    "path": "Reguler Tanpa TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6289623124053",
    "instagram": "miirjaaa_",
    "email": "firmansyahmirza3@gmail.com",
    "achievements": ["Mantan Kadiv Venue Manager HangTuahCup 2025", "Pilihan: UPN - Ilmu Politik, UGM - Hukum"]
  },
  {
    "name": "Irgi Dwi Saputra",
    "university": "Universitas Diponegoro (UNDIP)",
    "major": "Teknologi hasil perikanan",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287811755618",
    "instagram": "irgisptraa",
    "email": "irgidwisaputra177@gmail.com",
    "achievements": ["Pilihan: ITB - Teknik Pertambangan, Undip - Teknologi Hasil Perikanan"]
  },
  {
    "name": "Gilvara Delia Sayidina",
    "university": "Universitas Padjadjaran (UNPAD)",
    "major": "Jurnalistik",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/62895322280793",
    "instagram": "gilvaraadlia",
    "email": "gilvasayidina@gmail.com",
    "achievements": ["Wakil Ketua Osis", "Pilihan: UI - Ilmu Ekonomi, UNPAD - Jurnalistik"]
  },
  {
    "name": "Kyla Zafirah",
    "university": "UIN Jakarta",
    "major": "Kesejahteraan Sosial",
    "path": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285719335637",
    "instagram": "kyla_zafirah",
    "email": "kylazafirah15@gmail.com",
    "achievements": ["Lulus: UINJKT - Kesejahteraan Sosial, UNJ - Pendidikan Masyarakat"]
  },
  {
    "name": "Daffa Anargya Maheswara",
    "university": "UIN Jakarta",
    "major": "Sistem Informasi",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287778474677",
    "instagram": "daffanargya",
    "email": "daffaanargya01@gmail.com",
    "achievements": [
      "Bendahara MPK, Sekretaris 2 Hang Tuah Cup 2025, Ketua Pelaksana Hari Guru 2024",
      "Pilihan: ITB - Teknik Industri, UIN Jakarta - Sistem Informasi",
      "Perlap Event Ramadhan UIN Jakarta 2025",
      "Medali Emas Bahasa Inggris 2023"
    ]
  },
  {
    "name": "Rafha Aulia",
    "university": "UIN Jakarta",
    "major": "Sastra Inggris",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285888800489",
    "instagram": "rapaaa13._",
    "email": "rafalthaf15@gmail.com",
    "achievements": [
      "Wakil Ketua OSIS 2, Ketua Pelaksana HARTES 2025, Juara 1 Lomba Band Colabonation",
      "Pilihan: UNJ - Kimia, UPNVJ - Teknik Industri",
      "Lulus: UIN Jakarta - Sastra Inggris (Jalur Prestasi)"
    ]
  },
  {
    "name": "Maesania Vathonah",
    "university": "UPNVJ (Jakarta)",
    "major": "ekonomi syariah",
    "path": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281806861615",
    "instagram": "saaa.niaa",
    "email": "maesaaniaa@gmail.com",
    "achievements": ["Lulus: UPNVJ Ekonomi Syariah"]
  },
  {
    "name": "Nayla Safira Aritoa",
    "university": "Universitas Diponegoro (UNDIP)",
    "major": "Kimia",
    "path": "Mandiri (UM Undip skor utbk+rapot)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287777834899",
    "instagram": "nylsfra",
    "email": "naylasafira2015@gmail.com",
    "achievements": [
      "Anggota MPK",
      "Lulus UM Undip, UM UPNVJ Bela Negara, UM UPNVY Skor UTBK"
    ]
  },
  {
    "name": "Rahma Arifa Wulandari",
    "university": "Institut Teknologi Bandung (ITB)",
    "major": "FITB",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281219518038",
    "instagram": "wlrifaa",
    "email": "rahma.arifa2020@gmail.com",
    "achievements": ["Sekretaris Hang Tuah Cup 2025, Sekretaris MPK", "Lulus: ITB - FITB"]
  },
  {
    "name": "Neza Naysila Azahra",
    "university": "Institut Pertanian Bogor (IPB University)",
    "major": "Manajemen Sumberdaya Perairan",
    "path": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282112000308",
    "instagram": "nzanysla",
    "email": "nezzanaysila@gmail.com",
    "achievements": ["Osn kimia", "Lulus: IPB - Manajemen Sumberdaya Perairan"]
  },
  {
    "name": "Alifah Ayra Fauziah",
    "university": "UNJ",
    "major": "Pendidikan Vokasional Konstruksi Bangunan",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6289524069271",
    "instagram": "ayrfzh_",
    "email": "ayrfzh@gmail.com",
    "achievements": [
      "Ketua Sekbid Sastra dan Budaya OSIS, Ekskul Teater",
      "Lulus: UNJ - Pendidikan Vokasional Konstruksi Bangunan"
    ]
  },
  {
    "name": "Iqbal Hilal Al Sadam",
    "university": "UPNVJ (Jakarta)",
    "major": "Hukum",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/62895336170916",
    "instagram": "al.sdamm",
    "email": "hilalalsadamiqbal@gmail.com",
    "achievements": [
      "Ketua Divisi Acara HT Art Festival 2024, Anggota OSIS Bilingual",
      "Lulus: UPNVJ - Hukum (Mandiri SMPTN Barat)",
      "Tim Kreatif Buku Tahunan Sekolah",
      "Director of Event Management - Underradar"
    ]
  },
  {
    "name": "Muhammad Alief",
    "university": "UIN Jakarta",
    "major": "Ilmu Politik",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287877256300",
    "instagram": "N/A",
    "email": "muhammadalif3356@gmail.com",
    "achievements": ["Pilihan: UIN - Ilmu Politik, UIN - Sosiologi"]
  },
  {
    "name": "Hapsari Puspa Wulandari",
    "university": "Universitas Diponegoro (UNDIP)",
    "major": "Bisnis Digital",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281287672883",
    "instagram": "_hapsariwulan",
    "email": "hapsariw7@gmail.com",
    "achievements": [
      "Ticketing HT Cup 25, Pengurus Ekskul English Club, Anggota OSIS",
      "Lulus: UNDIP - Bisnis Digital, UNPAD - Produksi Media"
    ]
  },
  {
    "name": "Rifa Antika Zahra",
    "university": "Universitas Diponegoro (UNDIP)",
    "major": "Informasi dan Humas",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281299160430",
    "instagram": "rifaantikaa_",
    "email": "rifaantika2@gmail.com",
    "achievements": ["Ekskul PMR", "Lulus: UNDIP - Informasi dan Humas (Vokasi)"]
  },
  {
    "name": "Roudatul Jannah",
    "university": "UINSA",
    "major": "psikologi",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282228889947",
    "instagram": "rjnnh10",
    "email": "roujan10@gmail.com",
    "achievements": ["Anggota MPK", "Pilihan: Unair, UPNVJ, Unesa, Uinsa"]
  },
  {
    "name": "Bunga Aisyah Oktasyawaley",
    "university": "Universitas Indonesia (UI)",
    "major": "Teknik Bioproses",
    "path": "Jalur prestasi (SJP)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281585999258",
    "instagram": "bungaishy",
    "email": "bungatiar37@gmail.com",
    "achievements": [
      "Taekwondo, PJ Sponsor Hang Tuah Cup 2025",
      "Lulus: UI - Teknik Bioproses (SJP), UB - Teknologi Bioproses (Rapot)"
    ]
  },
  {
    "name": "Sevi Villiani",
    "university": "Universitas Brawijaya (UB)",
    "major": "Ilmu Politik",
    "path": "SNBP (Seleksi Nasional Berdasarkan Prestasi)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6288213837245",
    "instagram": "sevi_villiani",
    "email": "sevivilliani@gmail.com",
    "achievements": ["Lulus: UB - Ilmu Politik (SNBP)"]
  },
  {
    "name": "Muhammad Melvin Afandi",
    "university": "Universitas Brawijaya (UB)",
    "major": "Perpajakan",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285714010644",
    "instagram": "melpinfndi",
    "email": "melvinafandi@gmail.com",
    "achievements": [
      "Juara 1 Tournafest Colabonation, Juara 1 Bakti Mulya 400",
      "Lulus: UB Perpajakan (Jalur Prestasi)"
    ]
  },
  {
    "name": "Aulia Puspita Dewi",
    "university": "Poltekkes Kemenkes Jakarta II",
    "major": "Kesehatan Lingkungan",
    "path": "Jalur Prestasi",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287780163575",
    "instagram": "auliaapspt_",
    "email": "auliapspt957@gmail.com",
    "achievements": [
      "Humas Ratoh Jaroe Cup 2024, Anggota KPU PEMIRA Poltekkes II",
      "Pilihan: UI Biomedis, UIN Sistem Informasi"
    ]
  },
  {
    "name": "Marsya Putri Nhagita",
    "university": "Universitas Muhammadiyah jakarta",
    "major": "ilmu keperawatan",
    "path": "Reguler TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281212845520",
    "instagram": "ptrimrsyaa",
    "email": "nagitamarsya20@gmail.com",
    "achievements": ["Pilihan: UPN, Undip, Unair, UIN (Keperawatan)"]
  },
  {
    "name": "Raviela Mentari Agza",
    "university": "POLTEKKES JAKARTA 2",
    "major": "D3-Analisis Farmasi dan Makanan",
    "path": "N/A",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281324885192",
    "instagram": "ravielamntr",
    "achievements": ["Pemangku Adat Pramuka 2024, Bendahara HTRF 2024"]
  },
  {
    "name": "Raffi Zakihusaini",
    "university": "Institut Pertanian Bogor (IPB University)",
    "major": "teknologi hasil hutan",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281906066810",
    "instagram": "raffizakihusaini__",
    "email": "raffizakihusaini@gmail.com",
    "achievements": ["Lulus: IPB Teknologi Hasil Hutan (Skor UTBK)"]
  },
  {
    "name": "Alya Eriyanti Agustin",
    "university": "Binus University",
    "major": "Accounting",
    "path": "Reguler TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287721025462",
    "instagram": "mellodaizy",
    "email": "alyaeriyanti@gmail.com",
    "achievements": ["Pilihan: UI Akuntansi, Undip Akuntansi"]
  },
  {
    "name": "Sherina Salwa Tahira",
    "university": "binus",
    "major": "accounting",
    "path": "Beasiswa",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285959603484",
    "instagram": "sherinatahira",
    "email": "sherinatahira@gmail.com",
    "achievements": ["Status: Beasiswa Binus Accounting"]
  },
  {
    "name": "Carmen Aurora Wahyudi",
    "university": "Universitas Bina Nusantara",
    "major": "International Relations Global Class",
    "path": "Beasiswa",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285212364584",
    "instagram": "moon_p0ison",
    "email": "carmenaurora908@gmail.com",
    "achievements": [
      "Gold Medalist Olimpiade Bahasa Inggris Nasional, Head Delegate JSDC 2025",
      "Pilihan: UGM - Hubungan Internasional"
    ]
  },
  {
    "name": "Audrey Athalia",
    "university": "UPNVJ (Jakarta)",
    "major": "Kesehatan Masyarakat",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285281984136",
    "instagram": "audreyarsna",
    "email": "audreyarisena@gmail.com",
    "achievements": ["Humas OSIS, Humpro HT Cup", "Lulus: UPNVJ Kesmas (Tanpa Tes)"]
  },
  {
    "name": "Muhammad Farrel Athalla Yamin",
    "university": "Universitas Bakrie",
    "major": "Sistem informasi",
    "path": "Reguler Tanpa TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/62895635896981",
    "instagram": "athallafarrreel",
    "email": "athallayaminfarrel@gmail.com",
    "achievements": ["Pilihan: UPNVJ Komunikasi, UIN Sistem Informasi"]
  },
  {
    "name": "Putri Cahaya Mentari",
    "university": "UHAMKA",
    "major": "Kesehatan Masyarakat",
    "path": "Reguler Tanpa TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285781198037",
    "instagram": "sunnniees",
    "email": "cahayaaamentari@gmail.com",
    "achievements": ["Bendahara Buku Tahunan 2025, Ketua HTEC, OSIS TIK"]
  },
  {
    "name": "Mohammad Rizaqi Galihandra Nugroho",
    "university": "UNJ",
    "major": "Pendidikan Teknik Mesin",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281410393378",
    "instagram": "_glhiiii",
    "email": "galihandranugroho@gmail.com",
    "achievements": ["Wakil Ketua Jurnalistik", "Lulus: UNJ Pendidikan Teknik Mesin"]
  },
  {
    "name": "Ginaris Pangesti Wibowo",
    "university": "Universitas Brawijaya (UB)",
    "major": "Keuangan dan Perbankan",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285280036890",
    "instagram": "ginarsw",
    "email": "ginariswibowo400@gmail.com",
    "achievements": ["Lulus: UB Keuangan dan Perbankan (Rapot)"]
  },
  {
    "name": "Khalysha Radeftia Azzahra",
    "university": "UNJ",
    "major": "Pendidikan anak usia dini",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282124666890",
    "instagram": "khalysha_",
    "email": "khalyshaa@gmail.com",
    "achievements": ["Juara 1 Olimpiade PKN & Sosiologi", "Lulus: UNJ PAUD (Mandiri)"]
  },
  {
    "name": "Reyhanatul Quddus",
    "university": "Universitas Indonesia (UI)",
    "major": "Ilmu Keperawatan",
    "path": "SNBT (Seleksi Nasional Berdasarkan Tes)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/62881025319747",
    "instagram": "rhyaneat",
    "email": "qreyhanatul@gmail.com",
    "achievements": ["Lulus: UI - Ilmu Keperawatan (SNBT)"]
  },
  {
    "name": "Caesar Muhammad Zulkarnaen",
    "university": "Universitas Islam Indonesia",
    "major": "Hukum",
    "path": "Reguler Tanpa TES",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285156319826",
    "instagram": "caesaricall",
    "email": "icalzulkarnaen@gmail.com",
    "achievements": [
      "Ketua Basket SMA Hang Tuah, Juara 2 Basket Hukum Nasional Unpad",
      "Lulus: Unesa Ilmu Politik"
    ]
  },
  {
    "name": "Tiyas Rifa Lestari",
    "university": "poltekkes kemenkes jakarta II",
    "major": "teknik radiodiagnostik dan radioterapi",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285213026899",
    "instagram": "tiyasrifa",
    "email": "tiyasrifalestari@gmail.com",
    "achievements": ["Anggota Tari Ratoh Jaroe", "Lulus: Poltekkes II (Simami)"]
  },
  {
    "name": "Muhammad Faqih Rafi",
    "university": "Universitas Diponegoro (UNDIP)",
    "major": "Teknik Lingkungan",
    "path": "Mandiri Jalur Gelombang 2 (Skor UTBK)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287797704588",
    "instagram": "fqihrfi",
    "email": "rafifaqih30@gmail.com",
    "achievements": ["Lulus: Undip Teknik Lingkungan (Skor UTBK)"]
  },
  {
    "name": "Olivia Firdaus",
    "university": "Institut Teknologi Sepuluh Nopember (ITS)",
    "major": "Teknik Kimia",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/628118121396",
    "instagram": "oliviafirdauss",
    "email": "oliviafirdaus78@gmail.com",
    "achievements": ["Lulus: ITS - Teknik Kimia (Mandiri)"]
  },
  {
    "name": "Faisal Fazly Pratama",
    "university": "Universitas Bakrie",
    "major": "Ilmu Komunikasi",
    "path": "Beasiswa",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287785195744",
    "instagram": "salpratamaa",
    "achievements": ["Lulus: Universitas Bakrie Ilmu Komunikasi (Beasiswa)", "Ketua Paskibra SMA Hang Tuah 1 Jakarta Tahun 2024", "Sekretaris II MPK", "Ketua Pelaksana Hang Tuah Cup 2025."]
  },
  {
    "name": "Muhammad Fikri Fahlevi",
    "university": "UPNVJ (Jakarta)",
    "major": "Akuntansi",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282246973040",
    "instagram": "fikriflvi",
    "email": "fikrifahlevi2408@gmail.com",
    "achievements": [
      "Pilihan SNBP: UI Matematika",
      "Pilihan SNBT: UI Akuntansi, UI Matematika",
      "Mandiri: UI-Akuntansi (Simak), UI-Matematika (PPKB), UPNVJ-Akuntansi (SMM), UNJ-Akuntansi (UTUL), PNJ-Akuntansi"
    ]
  },
  {
    "name": "Daffa Gintara Wigena Atmadja",
    "university": "MNC University",
    "major": "Sistem Informasi",
    "path": "Beasiswa",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/628128011386",
    "instagram": "daffagintara",
    "email": "daffa.gintara1@gmail.com",
    "achievements": ["Pilihan SNBP: UI Teknik Elektro", "Pilihan SNBT: UPNVJ Sistem Informasi, UNJ Sistem Informasi"]
  },
  {
    "name": "Rayhan Krisnanda Tri Handoyo",
    "university": "Universitas Mercu Buana (UMB)",
    "major": "Manajemen",
    "path": "Mandiri",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6283845288236",
    "instagram": "rayhankas2",
    "email": "rayhankrisnanda0@gmail.com",
    "achievements": ["Ikut Eskul Basket", "Taekwondo", "Kadiv Keamanan HT Cup"]
  },
  {
    "name": "Samuel Peres",
    "university": "ITERA",
    "major": "Teknik Kimia",
    "path": "Mandiri",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287818784061",
    "instagram": "kygeon",
    "email": "samuelissei@gmail.com",
    "achievements": []
  },
  {
    "name": "Darrel Rafif Adnil Zakaria",
    "university": "ITERA",
    "major": "Teknik Sipil",
    "path": "SNBT",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281293234997",
    "instagram": "drrelrfif",
    "email": "darrelrafif10@gmail.com",
    "achievements": []
  },
  {
    "name": "Hanum Kiflaini",
    "university": "UPNVY (Jogja)",
    "major": "Teknik Kimia",
    "path": "SNBT",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282111327753",
    "instagram": "kiflaiiny",
    "email": "hanumkiflainii@gmail.com",
    "achievements": ["Anggota Liaison Officer Hang Tuah Cup 2023", "Anggota Ticketing Hang Tuah Cup 2024"]
  },
  {
    "name": "Alya Nur Ismy",
    "university": "Institut Pertanian Bogor (IPB University)",
    "major": "Nutrisi Dan Teknologi Pakan",
    "path": "Mandiri (Jalur Talenta)",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282216623311",
    "instagram": "alyanur.i",
    "email": "alyanurismy15@gmail.com",
    "achievements": ["Taekwondo"]
  },
  {
    "name": "Asahi Naura Salsabila",
    "university": "UPNVJ (Jakarta)",
    "major": "Hukum",
    "path": "SNBT",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6285156649690",
    "instagram": "alsauraa",
    "email": "asahinawra@gmail.com",
    "achievements": ["Juara 1 Saman", "Juara 3 Saman", "Juara Harapan 1 Saman", "Anggota LO HT Cup 2 Periode", "Anggota OSIS Divisi Belneg 2 Periode", "Bendahara RJ Cup 2024"]
  },
  {
    "name": "Syarla Alifia Cahyadi",
    "university": "Universitas Pembangunan Jaya (UPJ)",
    "major": "Digital Komunikasi Visual (DKV)",
    "path": "Mandiri",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6282112403892",
    "instagram": "urenemy.la",
    "email": "heri.dexter@gmail.com",
    "achievements": ["Prabu Taekwondo Nasional Challenge - Kyorugi Pemula Putri Medali Emas"]
  },
  {
    "name": "Nabila Nafisha",
    "university": "ITPLN",
    "major": "Teknik Lingkungan",
    "path": "Mandiri",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281295927271",
    "instagram": "fishaa_a",
    "email": "nafishanabila11@gmail.com",
    "achievements": []
  },
  {
    "name": "Muhammad Aidan Hafthah",
    "university": "Universitas Pertamina",
    "major": "Teknik Logistik",
    "path": "Mandiri",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6281398885859",
    "instagram": "aidanhfth",
    "email": "aidanhafthah4@gmail.com",
    "achievements": ["Aktif Organisasi di Kuliah"]
  },
  {
    "name": "Rizqita Tyas Damayanti",
    "university": "Universitas Al-Azhar Indonesia",
    "major": "Ilmu Hukum",
    "path": "Mandiri",
    "category": "PTS",
    "angkatan": 2025,
    "whatsapp": "wa.me/6288905898361",
    "instagram": "rizqityasd",
    "email": "rizqitatyas@gmail.com",
    "achievements": ["Anggota OSIS Divisi Humas", "Anggota Divisi LO Hang Tuah Cup", "Juara 1 Tari Ratoh Jaroe Competition RK Production", "Favorit 3 Tari Ratoh Jaroe Competition DISCO", "Juara 2 Festival Tari Ratoh Jaroe RMD Art"]
  },
  {
    "name": "Muhamad Dimas Aldrian",
    "university": "UIN Malang",
    "major": "Teknik Informatika",
    "path": "SNBT",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287793744463",
    "instagram": "dimasaldriann_",
    "email": "kucrutsukasolat@gmail.com",
    "achievements": []
  },
  {
    "name": "Firaz Khiar Al Rasyid",
    "university": "UNJ",
    "major": "Fisika",
    "path": "SNBT",
    "category": "PTN",
    "angkatan": 2025,
    "whatsapp": "wa.me/6287821896301",
    "instagram": "firaskiar",
    "email": "khiarqu@gmail.com",
    "achievements": []
  }
];

export const FORMS_URL = "https://forms.gle/iqpN6XJ24psDcwwf6";
export const CONTACT_WA = "https://wa.me/6282114927981";
export const COMMUNITY_WA_GROUP = "https://chat.whatsapp.com/L4p8G9x2m4B9z8x2m4B9z8";
