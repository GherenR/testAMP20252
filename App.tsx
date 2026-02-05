import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, MessageCircle, ArrowRight, Sparkles, Database, UserCheck,
  BookOpen, Phone, X, Clock, Share2, Info, ShieldCheck, Users,
  Zap, ArrowUpRight, Globe, Target, BrainCircuit, Landmark,
  HelpCircle,
  Instagram
} from 'lucide-react';
import { MOCK_MENTORS, CONTACT_WA, COMMUNITY_WA_GROUP } from './constants';
import { SlideData, InstitutionCategory, Mentor } from './types';
// GANTI KODE YANG ERROR JADI INI:

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPath, setFilterPath] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<InstitutionCategory>('All');
  const [showSopModal, setShowSopModal] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const handleContactClick = (mentor: Mentor) => {
    setSelectedMentor(mentor); // Simpan data mentor ke state
    setShowSopModal(true);    // Munculkan modal SOP
  };
  // Matchmaker State
  const [matchTarget, setMatchTarget] = useState<InstitutionCategory>('PTN');
  const [matchPath, setMatchPath] = useState<string>('All');
  const [matchUniversity, setMatchUniversity] = useState<string>('');
  const [matchMajor, setMatchMajor] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<{ mentors: Mentor[], score: number, type: 'exact' | 'partial' | 'none' } | null>(null);

  // Reset path filter when category changes in Explorer
  useEffect(() => {
    setFilterPath('All');
  }, [filterCategory]);

  // Scroll to top when slide changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlide]);

  const filteredMentors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return MOCK_MENTORS.filter((m, index) => { // Added index here
      const alumniId = `#2025-${index + 104}`.toLowerCase(); // Generate the ID string

      const matchesSearch =
        m.university.toLowerCase().includes(term) ||
        m.major.toLowerCase().includes(term) ||
        m.name.toLowerCase().includes(term) ||
        alumniId.includes(term) || // Added search by ID
        (m.achievements && m.achievements.some(a => a.toLowerCase().includes(term)));

      const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
      const matchesPath = filterPath === 'All' || m.path.includes(filterPath);

      return matchesSearch && matchesCategory && matchesPath;
    });
  }, [searchTerm, filterPath, filterCategory]);

  const handleChatRequest = () => setShowSopModal(true);

  const proceedToWhatsapp = () => {
    // Ambil link WA dari mentor yang dipilih, atau gunakan CONTACT_WA jika kosong
    const whatsappLink = selectedMentor?.whatsapp
      ? `https://${selectedMentor.whatsapp}`
      : CONTACT_WA;

    window.open(whatsappLink, '_blank');

    // Tutup modal dan reset mentor terpilih
    setShowSopModal(false);
    setSelectedMentor(null);
  };

  const handleShare = async (mentor: Mentor) => {
    const shareText = `🎓 *Profil Mentor - AMP 25/26*\n\nNama: ${mentor.name}\nKampus: ${mentor.university}\nJurusan: ${mentor.major}`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'AMP 25/26', text: shareText, url: shareUrl }); } catch (err) { }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Teks profil mentor disalin!');
    }
  };

  const getSubPaths = (category: InstitutionCategory) => {
    switch (category) {
      case 'PTN': return ['SNBP', 'SNBT', 'Mandiri'];
      case 'PTS': return ['Reguler', 'Beasiswa'];
      case 'PTLN': return ['Beasiswa Luar Negeri', 'Mandiri'];
      default: return [];
    }
  };

  const runMatchmaker = () => {
    if (!matchMajor && matchPath === 'All' && !matchUniversity) return;
    setIsMatching(true);
    setMatchResults(null);

    setTimeout(() => {
      const resultsWithScores = MOCK_MENTORS.map(mentor => {
        let score = 0;
        if (mentor.category === matchTarget) score += 25;
        if (mentor.path === matchPath) score += 20;
        if (matchUniversity && mentor.university.toLowerCase().includes(matchUniversity.toLowerCase())) score += 30;
        if (matchMajor && mentor.major.toLowerCase().includes(matchMajor.toLowerCase())) score += 25;

        return { mentor, score };
      }).sort((a, b) => b.score - a.score);

      const topScore = resultsWithScores[0]?.score || 0;
      let type: 'exact' | 'partial' | 'none' = 'none';

      if (topScore >= 85) type = 'exact';
      else if (topScore >= 20) type = 'partial';
      else type = 'none';

      const finalMentors = resultsWithScores
        .filter(r => r.score > 0)
        .slice(0, 3)
        .map(r => r.mentor);

      setMatchResults({ mentors: finalMentors, score: topScore, type });
      setIsMatching(false);
    }, 800);
  };

  const menuItems = [
    { icon: <Zap size={18} />, label: 'Beranda', id: 0 },
    { icon: <BrainCircuit size={18} />, label: 'Smart Match', id: 1 },
    { icon: <Database size={18} />, label: 'Direktori', id: 2 },
    { icon: <ShieldCheck size={18} />, label: 'Etika Chat', id: 3 },
    { icon: <Info size={18} />, label: 'Tentang Kami', id: 4 },
  ];

  const slides: SlideData[] = [
    {
      id: 'hero',
      content: (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 animate-reveal relative py-12">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-lime-400/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10 max-w-5xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-slate-200 bg-white text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              DATABASE ALUMNI HANG TUAH 2025 TERINTEGRASI
            </div>

            <h1 className="text-6xl md:text-[140px] font-extrabold leading-[0.8] tracking-tighter text-slate-950 mb-10">
              CARI<br />
              <span className="text-outline">MENTOR ALUMNIMU</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12">
              Platform kolaboratif alumni Hang Tuah untuk mendampingi angkatan 2026 menavigasi ambisi menuju kampus impian.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
              <button
                onClick={() => setCurrentSlide(1)}
                className="group relative bg-slate-950 text-white px-12 py-6 rounded-2xl font-bold transition-all hover:bg-indigo-600 active:scale-95 shadow-2xl shadow-slate-950/20 text-lg w-full sm:w-auto"
              >
                <span className="flex items-center gap-3 justify-center">
                  Coba Smart Match <BrainCircuit size={22} className="group-hover:rotate-12 transition-transform" />
                </span>
              </button>
              <button
                onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
                className="group bg-white text-slate-900 border-2 border-slate-100 px-12 py-6 rounded-2xl font-bold transition-all hover:border-indigo-600 flex items-center gap-3 active:scale-95 text-lg w-full sm:w-auto justify-center"
              >
                <Users size={22} className="text-green-600" /> Komunitas WhatsApp
              </button>
            </div>

            <div className="p-6 bg-indigo-50/50 border border-indigo-100/50 rounded-[2.5rem] max-w-2xl mx-auto flex items-center gap-6 text-left">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Pusat Informasi & Diskusi</h4>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                  Bergabunglah di grup komunitas WhatsApp sebagai wadah informasi utama. Dapatkan jadwal <span className="text-indigo-600 font-bold">sharing session</span>, info tryout, dan update penting lainnya secara real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'matchmaker',
      content: (
        <div className="max-w-5xl mx-auto px-6 animate-reveal pb-32 pt-8">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white mb-2 shadow-xl shadow-indigo-200">
              <Target size={32} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950 leading-none">THE SMART <span className="text-indigo-600">MATCH.</span></h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Masukkan target impianmu, sistem kami akan mencarikan alumni dengan rekam jejak paling relevan.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 bg-white p-6 md:p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Kategori Institusi</p>
                <div className="grid grid-cols-3 gap-2">
                  {['PTN', 'PTS', 'PTLN'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setMatchTarget(cat as InstitutionCategory)}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${matchTarget === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-transparent'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Jalur Masuk</p>
                <select
                  value={matchPath}
                  onChange={(e) => setMatchPath(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm appearance-none"
                >
                  <option value="All">Semua Jalur...</option>
                  {getSubPaths(matchTarget).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Universitas Impian</p>
                <div className="relative">
                  <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    placeholder="Contoh: UI, ITB, UGM..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm"
                    value={matchUniversity}
                    onChange={(e) => setMatchUniversity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Jurusan / Bidang Impian</p>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    placeholder="Contoh: Kedokteran, Hukum, CS..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all text-sm"
                    value={matchMajor}
                    onChange={(e) => setMatchMajor(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={runMatchmaker}
                disabled={isMatching}
                className="w-full bg-slate-950 text-white py-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {isMatching ? 'Menghitung...' : 'Mulai Simulasi'} <Sparkles size={18} />
              </button>
            </div>

            <div className="lg:col-span-7 space-y-6">
              {!matchResults && !isMatching && (
                <div className="h-full flex flex-col items-center justify-center p-12 md:p-20 border-2 border-dashed border-slate-200 rounded-[4rem] text-slate-300">
                  <BrainCircuit size={64} strokeWidth={1} />
                  <p className="mt-6 font-bold text-lg text-center">Hasil akan muncul di sini</p>
                </div>
              )}

              {isMatching && (
                <div className="flex flex-col items-center justify-center p-20 space-y-6">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs text-center">Mencocokkan dengan Database...</p>
                </div>
              )}

              {matchResults && (
                <div className="space-y-8 animate-reveal">
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 gap-4">
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Skor Kecocokan Pencarian Mentor Alumni</p>
                      <h4 className="text-2xl font-black text-slate-950">{Math.round(matchResults.score)}% Skor Alumni Yang Cocok</h4>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${matchResults.type === 'exact' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                      {matchResults.type === 'exact' ? 'Profil Optimal' : 'Kecocokan Terkait'}
                    </div>
                  </div>

                  {/* Suggestion Card for Non-Exact Matches */}
                  {matchResults.type !== 'exact' && (
                    <div className="p-8 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] space-y-6 animate-reveal">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                          <HelpCircle size={28} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-900">Butuh Mentor Spesifik Lainnya?</h4>
                          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                            Sistem kami tidak menemukan alumni yang cocok 100% dengan kriteria kamu. Jangan khawatir! Kami memiliki akses ke database alumni yang lebih luas.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/60 p-5 rounded-2xl border border-amber-200">
                        <p className="text-xs font-bold text-slate-700 italic">
                          "Saran: Silakan hubungi admin di Grup Komunitas WhatsApp. Admin kami dapat membantu mencarikan kakak alumni yang sesuai dengan target jurusan/kampusmu yang mungkin belum terdaftar di sini."
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => window.open(COMMUNITY_WA_GROUP, '_blank')}
                          className="flex-1 bg-amber-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                        >
                          Gabung Komunitas WA <Users size={16} />
                        </button>
                        <button
                          onClick={() => window.open(CONTACT_WA, '_blank')}
                          className="flex-1 bg-white text-amber-600 border-2 border-amber-200 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-50 transition-all"
                        >
                          Chat Admin Langsung <Phone size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6">
                    {matchResults.mentors.map((m, i) => (
                      <div key={i} className="group ticket-border rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 hover:border-indigo-600 transition-all animate-reveal">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center shrink-0">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`} alt="avatar" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl" />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                          <h4 className="text-lg md:text-xl font-black text-slate-950">{m.name}</h4>
                          <p className="text-xs md:text-sm font-bold text-slate-400">{m.university} • {m.major}</p>
                          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase">{m.path}</span>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase">{m.category}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleContactClick(m)} // <--- PAKAI INI
                          className="w-full md:w-auto p-5 bg-slate-950 text-white rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 shadow-xl flex justify-center items-center"
                        >
                          <ArrowUpRight size={24} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'database',
      content: (
        <div className="max-w-7xl mx-auto px-6 animate-reveal pb-32 pt-8">
          <div className="mb-12 space-y-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="space-y-3">
                <div className="w-12 h-1 bg-indigo-600 mb-4"></div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950">ARSIP <span className="text-indigo-600">ALUMNI</span></h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Koleksi Mentor & Pemimpin Masa Depan</p>
              </div>
              <div className="flex flex-col gap-4 items-end w-full md:w-auto">
                <div className="flex flex-wrap gap-2 justify-end w-full">
                  {['Semua', 'PTN', 'PTS', 'PTLN'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat === 'Semua' ? 'All' : cat as InstitutionCategory)}
                      className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${(filterCategory === 'All' ? 'Semua' : filterCategory) === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-300'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {getSubPaths(filterCategory).length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 animate-reveal w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 whitespace-nowrap">Jalur:</span>
                    {['Semua', ...getSubPaths(filterCategory)].map(path => (
                      <button
                        key={path}
                        onClick={() => setFilterPath(path === 'Semua' ? 'All' : path)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${(filterPath === 'All' ? 'Semua' : filterPath) === path ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {path}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative group max-w-4xl">
              <Search className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
              <input
                type="text"
                placeholder="Cari mentor berdasarkan Jurusan, Universitas, atau Prestasi..."
                className="w-full pl-16 md:pl-24 pr-8 py-6 md:py-8 bg-white border-2 border-slate-100 rounded-[2.5rem] outline-none focus:border-indigo-600 transition-all font-bold text-slate-900 text-lg md:text-xl shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((m, i) => (
              <div key={i} className={`group ticket-border rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col hover:border-indigo-600 hover:shadow-2xl animate-reveal stagger-${(i % 3) + 1}`}>
                <div className="flex justify-between items-start mb-10 pb-6 dashed-line">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Alumni ID</p>
                    <h4 className="text-xl font-black text-slate-950">#2025-{i + 104}</h4>
                  </div>
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`} alt="avatar" className="w-12 h-12 rounded-xl" />
                  </div>
                </div>

                <div className="mb-10 space-y-6">
                  <h3 className="text-2xl font-extrabold tracking-tighter text-slate-950 leading-none group-hover:text-indigo-600 transition-colors">{m.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Institusi</p>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{m.university}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Jurusan</p>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{m.major}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-10 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-slate-950 text-white text-[9px] font-black rounded-full uppercase tracking-widest">{m.path}</div>
                    <div className="flex-1 h-0.5 bg-slate-50"></div>
                  </div>
                  <div className="bg-lime-300/20 p-4 rounded-2xl border border-lime-400/20 flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <Sparkles size={14} className="text-lime-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        {/* Jika ada achievements */}
                        {m.achievements && m.achievements.length > 0 ? (
                          <div className="space-y-2 max-h-[80px] overflow-y-auto pr-2 custom-scrollbar">
                            {m.achievements.map((ach, index) => (
                              <p key={index} className="text-[10px] md:text-[11px] font-bold text-slate-700 italic leading-snug">
                                • "{ach}"
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] font-bold text-slate-700 italic">"Siap Membimbing"</p>
                        )}
                      </div>
                    </div>

                    {/* Indikator Halus kalau datanya banyak */}
                    {m.achievements && m.achievements.length > 2 && (
                      <div className="flex justify-end">
                        <span className="text-[8px] font-black text-lime-600 uppercase tracking-tighter">
                          Scroll untuk lihat {m.achievements.length - 2} lainnya ↓
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleContactClick(m)}
                    className="flex-1 bg-slate-950 text-white py-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                  >
                    Hubungi Mentor <ArrowUpRight size={16} />
                  </button>

                  {/* Tombol Instagram - Bersih tanpa fdprocessedid */}
                  {m.instagram && m.instagram !== "N/A" && (
                    <a
                      href={`https://www.instagram.com/${m.instagram}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all active:scale-90 flex items-center justify-center"
                    >
                      <Instagram size={18} />
                    </a>
                  )}

                  <button
                    onClick={() => handleShare(m)}
                    className="p-5 rounded-2xl bg-white text-slate-400 hover:text-indigo-600 border-2 border-slate-100 hover:border-indigo-100 transition-all active:scale-90"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'etiquette',
      content: (
        <div className="max-w-6xl mx-auto px-6 animate-reveal pb-32 pt-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="w-20 h-2 bg-indigo-600"></div>
                <h2 className="text-6xl font-black tracking-tighter text-slate-950 leading-[0.9]">ETIKA CHAT<br /><span className="text-outline">PROFESIONAL</span>.</h2>
                <p className="text-xl text-slate-500 font-medium">Etika adalah landasan kepercayaan. Ikuti protokol berikut untuk menjamin kelancaran komunikasi antar alumni.</p>
              </div>

              <div className="grid gap-4">
                {[
                  { title: "Identifikasi", desc: "Sebutkan Nama & Kelas asal secara jelas." },
                  { title: "Ringkas", desc: "Tanyakan poin diskusi secara padat dan terukur." },
                  { title: "Privasi", desc: "Hargai waktu luang & batas privasi alumni." },
                  { title: "Terima Kasih", desc: "Akhiri setiap sesi dengan ucapan terima kasih." }
                ].map((step, idx) => (
                  <div key={idx} className="group flex items-start gap-6 p-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm hover:border-indigo-600 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{step.title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-indigo-600 rounded-[4rem] rotate-3 -z-10 shadow-2xl opacity-10"></div>
              <div className="bg-slate-950 p-8 md:p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-lime-300 flex items-center justify-center">
                    <MessageCircle size={24} className="text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Standar Pesan</h3>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 font-mono text-sm leading-relaxed text-indigo-100 relative">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">CONTOH PESAN</div>
                    "Selamat siang Kak [Nama], saya [Nama] dari XII-1. Ingin berkonsultasi mengenai strategi portofolio di [Jurusan] Kakak. Apakah ada waktu luang untuk berdiskusi sebentar? Terima kasih Kak!"
                  </div>
                </div>

                <div className="mt-12 flex items-center gap-4 text-xs font-black text-lime-300 uppercase tracking-widest">
                  <ShieldCheck size={18} /> Verified Protocol • Class of 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'about',
      content: (
        <div className="max-w-5xl mx-auto px-6 animate-reveal text-center pb-32 pt-8">
          <div className="mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
              <Globe size={14} /> Proyek Kolaboratif
            </div>
            <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-950 mb-8 leading-[0.85]">MEMBANGUN<br /><span className="text-outline">BUDAYA</span> TOLONG MENOLONG.</h2>
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto italic">
              "Inisiatif mandiri untuk merajut silaturahmi yang fungsional antar generasi alumni Hang Tuah."
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-8 md:p-12 bg-white rounded-[4rem] border-2 border-slate-100 shadow-sm hover:border-indigo-600 transition-all group">
              <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center text-white mb-8 group-hover:bg-indigo-600 transition-colors">
                <UserCheck size={32} />
              </div>
              <h4 className="text-3xl font-extrabold text-slate-950 mb-3 tracking-tight">Gheren Ramandra S.</h4>
              <p className="text-indigo-600 font-black mb-6 uppercase text-[11px] tracking-[0.3em]">Lead Architect & Founder</p>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">Ilmu Komputer IPB. Berdedikasi untuk membangun infrastruktur data alumni yang memudahkan akses informasi bagi adik kelas.</p>
            </div>
            <div className="p-8 md:p-12 bg-slate-950 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-lime-300/10 rounded-full blur-[80px]"></div>
              <div className="w-16 h-16 bg-lime-300 rounded-[1.5rem] flex items-center justify-center text-slate-950 mb-8">
                <Database size={32} />
              </div>
              <h4 className="text-3xl font-extrabold mb-3 tracking-tight">Impact Hub 2026</h4>
              <p className="text-lime-300 font-black mb-6 uppercase text-[11px] tracking-[0.3em]">Visi & Misi</p>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">Menjadi ekosistem mentorship terbesar di lingkungan Hang Tuah, memperpendek jarak antara ambisi dan realisasi kampus impian.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      {/* --- KODE SAKTI SCROLLBAR HP MULAI DI SINI --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        nav::-webkit-scrollbar {
          height: 6px !important;
          display: block !important;
          -webkit-appearance: none !important;
        }
        nav::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
          border-radius: 10px;
        }
        nav::-webkit-scrollbar-thumb {
          background: #4f46e5 !important;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
        }
      ` }} />
      {/* Editorial Header & Nav */}
      <header className="pt-8 md:pt-12 px-6 md:px-16 max-w-[1600px] mx-auto w-full z-50">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
              <img src="/LogoIKAHATANew.svg" alt="Logo IKAHATA" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-950 leading-none">DATABASE ALUMNI HANGTUAH</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sistem Database Digital</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none mb-1">Version 1.0</p>
            <p className="text-lg font-black text-slate-950 tracking-tighter">IKAHATA 2025</p>
          </div>
        </div>

        {/* Navigation Menu: Integrated, Non-Floating */}
        <nav
          ref={navRef}
          className="w-full flex items-center gap-2 overflow-x-auto pb-8 border-b border-slate-100 relative z-10"
          style={{
            /* Trik Maut biar HP nurut */
            scrollbarWidth: 'thin',
            scrollbarColor: '#4f46e5 #f1f5f9',
            WebkitOverflowScrolling: 'touch',
            /* Tambahkan ini khusus untuk Chrome/Safari di HP */
            msOverflowStyle: 'auto'
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentSlide(item.id)}
              className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-[1.5rem] transition-all duration-300 shrink-0 group ${currentSlide === item.id
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
            >
              <span className="transition-colors">{item.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-visible">
        {slides[currentSlide].content}
      </main>

      {/* Footer Branding */}
      <footer className="py-12 px-6 text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© Alumni Mentorship Project • Hang Tuah Class of 2025</p>
      </footer>

      {/* Protocol Modal */}
      {showSopModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-y-auto py-8">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl" onClick={() => setShowSopModal(false)}></div>
          <div className="bg-white rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl p-8 md:p-14 shadow-2xl relative z-10 animate-reveal overflow-hidden my-auto">
            <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>
            <button onClick={() => setShowSopModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-950 transition-colors"><X size={32} /></button>

            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto shadow-inner">
                <ShieldCheck size={48} />
              </div>
              <h3 className="text-4xl font-black tracking-tighter mb-4 text-slate-950 uppercase">Akses Diberikan</h3>
              <p className="text-slate-500 font-medium">Harap patuhi kode etik sebelum menghubungi alumni.</p>
            </div>

            <div className="grid gap-4 mb-10">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex gap-4 md:gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-950">Hargai Waktu Luang</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Sangat disarankan menghubungi di jam kerja: <span className="text-indigo-600 font-black">08:00 - 20:00 WIB</span>.</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex gap-4 md:gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Zap className="text-lime-500" size={20} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-950">Langsung ke Inti</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">Sampaikan nama, asal kelas, dan tujuan spesifik di pesan pertama Anda.</p>
                </div>
              </div>
            </div>

            <button
              onClick={proceedToWhatsapp}
              className="w-full bg-slate-950 text-white py-6 rounded-[2.5rem] font-bold text-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
            >
              Lanjut ke WhatsApp <ArrowRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
