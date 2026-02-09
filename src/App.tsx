import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminPage from './admin';
import AdminLogin from './admin/login';
import {
  Home, BrainCircuit, Database, ShieldCheck, Info, ArrowUp, Heart
} from 'lucide-react';
import { MOCK_MENTORS } from './constants';
import { getAllMentors } from './mentorService';
import { SlideData, Mentor } from './types';
import {
  useSlideNavigation,
  useMentorFiltering,
  useMentorMatching,
  useSopModal,
  useMentorComparison,
  useFavorites
} from './hooks';
import {
  SlideNavigation,
  HeroSlide,
  MentorMatchmakerSlide,
  MentorDatabaseSlide,
  EtiquetteGuideSlide,
  AboutSlide,
  FavoritesSlide,
  SopModal,
  MentorComparisonModal,
  MentorDetailModal,
  SmartMatchActionModal,
  MenuItem,
  Toast
} from './components';
import { generateWhatsAppMessage, generateWhatsAppLink } from './utils/whatsappMessage';
import { decodeComparisonUrl, encodeComparisonUrl } from './utils/comparisonUrl';
import { useAnalytics } from './hooks/useAnalytics';
import { SLIDE_NAMES } from './utils/analytics';

/**
 * 🚀 FUTURE AI INTEGRATION (Gemini API)
 * =====================================
 * STATUS: Ready to integrate when needed
 * CURRENT: All mentor matching is done client-side (fast ⚡, no API calls)
 * 
 * Gemini API Key is already secured in:
 * - Vercel: Environment Variables (production)
 * - Local: .env.local (development)
 * See SECURITY.md for setup details
 * 
 * WHEN TO INTEGRATE:
 * - AI-powered mentor recommendations
 * - Smart student profile analysis
 * - Personalized matching suggestions
 * 
 * INTEGRATION EXAMPLE:
 * import { secureFetch } from './utils/security';
 * const response = await secureFetch(
 *   'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
 *   { method: 'POST', body: JSON.stringify({...}) }
 * );
 */

/**
 * App Component
 * Main container component yang mengatur state aplikasi dan routing
 * Menggunakan custom hooks untuk logic separation dan micro-components untuk UI
 *
 * Architecture:
 * - Hooks: useSlideNavigation, useMentorFiltering, useMentorMatching, useSopModal
 * - Components: SlideNavigation, 5 Slide components, SopModal
 * - Data: MOCK_MENTORS dari constants.ts
 */

const MainApp: React.FC = () => {
  // ===== NAVIGATION HOOKS =====
  const totalSlides = 6;
  const slides: SlideData[] = [
    { id: 'hero' },
    { id: 'matchmaker' },
    { id: 'database' },
    { id: 'etiquette' },
    { id: 'about' },
    { id: 'favorites' }
  ];

  const slideNavigation = useSlideNavigation(totalSlides);
  const { currentSlide, setCurrentSlide } = slideNavigation;

  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Track page view when current slide changes
    trackPageView(currentSlide, SLIDE_NAMES[currentSlide] || 'Unknown');
  }, [currentSlide, trackPageView]);

  // ===== MENTOR DATA STATE (SUPABASE) =====
  const [mentors, setMentors] = useState<Mentor[]>(MOCK_MENTORS);
  const [mentorsLoading, setMentorsLoading] = useState(true);

  // Load mentors from Supabase on mount
  useEffect(() => {
    const loadMentors = async () => {
      try {
        const { data, error } = await getAllMentors();
        if (error) {
          console.error('Failed to load mentors from Supabase:', error);
          // Fallback to MOCK_MENTORS (already set as initial state)
        } else if (data && data.length > 0) {
          // Convert MentorDB to Mentor type (strip id, timestamps)
          const mentorData: Mentor[] = data.map(m => ({
            name: m.name,
            university: m.university,
            major: m.major,
            path: m.path,
            category: m.category,
            angkatan: m.angkatan,
            achievements: m.achievements || [],
            instagram: m.instagram || undefined,
            whatsapp: m.whatsapp || undefined,
            email: m.email || undefined
          }));
          setMentors(mentorData);
        }
      } catch (err) {
        console.error('Error loading mentors:', err);
        // Fallback to MOCK_MENTORS
      } finally {
        setMentorsLoading(false);
      }
    };
    loadMentors();
  }, []);

  // ===== MENTOR FILTERING HOOKS =====
  const mentorFiltering = useMentorFiltering(mentors);
  const {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterPath,
    setFilterPath,
    resetFilter,
    filteredMentors
  } = mentorFiltering;

  // ===== MENTOR MATCHING HOOKS =====
  const mentorMatching = useMentorMatching();
  const {
    matchTarget,
    setMatchTarget,
    matchPath,
    setMatchPath,
    matchUniversity,
    setMatchUniversity,
    matchMajor,
    setMatchMajor,
    isMatching,
    matchResults,
    runMatchmaker
  } = mentorMatching;

  // ===== MODAL HOOKS =====
  const sopModal = useSopModal();
  const { isOpen: showSopModal, data: selectedMentor, open: openSopModal, close: closeSopModal } = sopModal;

  // ===== MENTOR COMPARISON HOOKS =====
  const mentorComparison = useMentorComparison();
  const { selectedMentors, addMentorToCompare, removeMentorFromCompare, clearComparison, setBulkComparison, isComparing } = mentorComparison;
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // ===== SCROLL TO TOP STATE (Mobile Only) =====
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // ===== TOAST STATE =====
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  // ===== AUTO-SCROLL TO RESULTS ON MOBILE =====
  /**
   * Saat matchResults update di Smart Match (mobile), auto-scroll ke hasil
   * NOTE: Hanya untuk Smart Match, TIDAK untuk Direktori (user request: biar scroll manual)
   */
  useEffect(() => {
    if (currentSlide === 1 && matchResults && window.innerWidth < 1024) {
      setTimeout(() => {
        const resultsSection = document.getElementById('match-results');
        resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250); // Optimal timing untuk DOM render"}}]
    }
  }, [matchResults, currentSlide]);

  // NOTE: Auto-scroll untuk Direktori dihapus sesuai request user
  // User lebih suka scroll manual setelah search

  // ===== SCROLL TO TOP BUTTON VISIBILITY (Mobile Only) =====
  /**
   * Show floating button saat scroll down > 300px, tapi hanya di mobile
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Show di mobile (<640px) dan saat scroll down
      setShowScrollToTop(scrollTop > 300 && window.innerWidth < 640);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Scroll ke atas dengan smooth animation
   */
  const scrollToTop = () => {
    // Gunakan requestAnimationFrame untuk smooth performance
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===== RESTORE COMPARISON STATE FROM URL =====
  /**
   * Load comparison mentors dari URL params saat page load
   * Contoh: ?compare=siti-nurassifa,zhalisha-athaya,gheren-ramandra
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const comparisonMentors = decodeComparisonUrl(params);

    if (comparisonMentors.length > 0) {
      // Bulk set mentors dari URL (menghindari async setState loop issue)
      setBulkComparison(comparisonMentors);
      // Automatically open comparison modal jika ada mentors di URL
      setShowComparisonModal(true);
    }
  }, []); // Only run on mount

  // ===== PERSIST COMPARISON STATE TO URL =====
  /**
   * Update URL params setiap kali selectedMentors berubah
   * Ini memastikan URL selalu reflect state terkini
   * Saat remove mentor -> URL updated -> refresh akan restore state yang benar
   */
  useEffect(() => {
    if (selectedMentors.length > 0) {
      // Ada mentors -> update URL dengan selectedMentors
      const newUrl = encodeComparisonUrl(selectedMentors);
      window.history.replaceState(null, '', window.location.pathname + newUrl);
    } else {
      // Tidak ada mentors -> clear URL params
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [selectedMentors]); // Re-run setiap kali selectedMentors berubah

  // ===== AUTO-CLOSE MODAL WHEN EMPTY =====
  /**
   * Tutup modal otomatis ketika semua mentors di-remove
   * Terpisah dari persist effect untuk menghindari race condition
   */
  useEffect(() => {
    if (showComparisonModal && selectedMentors.length === 0) {
      setShowComparisonModal(false);
    }
  }, [selectedMentors, showComparisonModal]); // Watch both untuk accuracy

  // ===== MENTOR DETAIL MODAL STATE =====
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMentor, setDetailMentor] = useState<Mentor | null>(null);
  const [detailAlumniId, setDetailAlumniId] = useState<string>('');

  // ===== SMART MATCH ACTION MODAL STATE =====
  const [showSmartMatchAction, setShowSmartMatchAction] = useState(false);
  const [smartMatchMentor, setSmartMatchMentor] = useState<Mentor | null>(null);
  const [smartMatchAlumniId, setSmartMatchAlumniId] = useState<string>('');

  // ===== KEYBOARD SHORTCUTS =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDetailModal) setShowDetailModal(false);
        else if (showComparisonModal) setShowComparisonModal(false);
        else if (showSopModal) closeSopModal();
        else if (showSmartMatchAction) setShowSmartMatchAction(false);
      } else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!document.activeElement?.closest('input, textarea, select')) {
          setCurrentSlide(s => Math.max(0, s - 1));
        }
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!document.activeElement?.closest('input, textarea, select')) {
          setCurrentSlide(s => Math.min(totalSlides - 1, s + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDetailModal, showComparisonModal, showSopModal, showSmartMatchAction, totalSlides, closeSopModal]);

  // ===== HELPER FUNCTIONS =====
  /**
   * Get sub-paths berdasarkan kategori institusi
   */
  const getSubPaths = (category: typeof filterCategory) => {
    switch (category) {
      case 'PTN': return ['SNBP', 'SNBT', 'Mandiri'];
      case 'PTS': return ['Reguler', 'Beasiswa'];
      case 'PTLN': return ['Beasiswa Luar Negeri', 'Mandiri'];
      case 'All': return ['SNBP', 'SNBT', 'Mandiri', 'Reguler', 'Beasiswa', 'Beasiswa Luar Negeri'];
      default: return [];
    }
  };

  /**
   * Handle tombol "Hubungi Mentor" - open SOP modal
   */
  const handleContactClick = (mentor: Mentor) => {
    openSopModal(mentor);
  };

  /**
   * Proceed ke WhatsApp setelah menerima SOP dengan pre-filled message
   */
  const proceedToWhatsapp = (studentName: string, studentClass: string, studentBatch: number) => {
    if (!selectedMentor) return;

    const message = generateWhatsAppMessage(
      selectedMentor.name,
      studentName,
      studentClass,
      studentBatch
    );

    const phoneNumber = selectedMentor.whatsapp?.replace('wa.me/', '') || '6282114927981';
    const whatsappLink = generateWhatsAppLink(phoneNumber, message);

    window.open(whatsappLink, '_blank');
    closeSopModal();
  };

  /**
   * Handle Instagram button click
   */
  const handleInstagramClick = (handle: string) => {
    window.open(`https://www.instagram.com/${handle}/`, '_blank');
  };

  /**
   * Handle detail modal opening
   */
  const openDetailModal = (mentor: Mentor) => {
    const index = mentors.findIndex(m => m.name === mentor.name);
    setDetailAlumniId(`#2025-${index + 104}`);
    setDetailMentor(mentor);
    setShowDetailModal(true);
  };

  /** Alumni serupa: same university atau major, max 3 */
  const getSimilarMentors = (mentor: Mentor) =>
    mentors
      .filter(m => m.name !== mentor.name && (m.university === mentor.university || m.major === mentor.major))
      .slice(0, 3);

  /**
   * Handle Smart Match action - when user clicks a mentor card in Smart Match
   * Opens action modal with options to contact or view detail
   */
  const handleSmartMatchMentorClick = (mentor: Mentor) => {
    const index = mentors.findIndex(m => m.name === mentor.name);
    setSmartMatchAlumniId(`#2025-${index + 104}`);
    setSmartMatchMentor(mentor);
    setShowSmartMatchAction(true);
  };

  /**
   * From Smart Match Action Modal - view detail
   */
  const handleSmartMatchViewDetail = (mentor: Mentor) => {
    setShowSmartMatchAction(false);
    setTimeout(() => {
      openDetailModal(mentor);
    }, 300);
  };

  /**
   * From Smart Match Action Modal - start WhatsApp conversation
   */
  const handleSmartMatchContact = (mentor: Mentor) => {
    setShowSmartMatchAction(false);
    setTimeout(() => {
      handleContactClick(mentor);
    }, 300);
  };

  // ===== MENU ITEMS untuk navigation =====
  const { favorites, toggleFavorite, isFavorite } = useFavorites(mentors);

  const menuItems: MenuItem[] = [
    { icon: <Home size={18} />, label: 'Beranda', id: 0 },
    { icon: <BrainCircuit size={18} />, label: 'Smart Match', id: 1 },
    { icon: <Database size={18} />, label: 'Direktori', id: 2 },
    { icon: <ShieldCheck size={18} />, label: 'Etika Chat', id: 3 },
    { icon: <Info size={18} />, label: 'Tentang Kami', id: 4 },
    { icon: <Heart size={18} />, label: 'Favorit', id: 5 },
  ];

  // ===== SLIDE CONTENT MAPPING =====
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <HeroSlide
            onSmartMatchClick={() => setCurrentSlide(1)}
            onNavigateToSlide={setCurrentSlide}
          />
        );
      case 1:
        return (
          <MentorMatchmakerSlide
            matchTarget={matchTarget}
            onMatchTargetChange={setMatchTarget}
            matchPath={matchPath}
            onMatchPathChange={setMatchPath}
            matchUniversity={matchUniversity}
            onMatchUniversityChange={setMatchUniversity}
            matchMajor={matchMajor}
            onMatchMajorChange={setMatchMajor}
            isMatching={isMatching}
            matchResults={matchResults}
            subPaths={getSubPaths(matchTarget)}
            onRunMatchmaker={() => mentorMatching.runMatchmaker(mentors)}
            onReset={mentorMatching.resetMatching}
            onMentorSelect={handleSmartMatchMentorClick}
            onMentorCompare={addMentorToCompare}
            comparedMentors={selectedMentors.map(m => m.name)}
            onFavoriteToggle={toggleFavorite}
            isFavorite={isFavorite}
          />
        );
      case 2:
        return (
          <MentorDatabaseSlide
            filteredMentors={filteredMentors}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            filterPath={filterPath}
            onPathChange={setFilterPath}
            subPaths={getSubPaths(filterCategory)}
            onMentorContact={handleContactClick}
            onMentorInstagram={handleInstagramClick}
            onMentorCompare={addMentorToCompare}
            comparedMentors={selectedMentors.map(m => m.name)}
            onViewDetail={openDetailModal}
            onResetFilter={resetFilter}
            onFavoriteToggle={toggleFavorite}
            isFavorite={isFavorite}
          />
        );
      case 3:
        return <EtiquetteGuideSlide />;
      case 4:
        return <AboutSlide />;
      case 5:
        return (
          <FavoritesSlide
            favorites={favorites}
            onMentorContact={handleContactClick}
            onMentorInstagram={handleInstagramClick}
            onMentorCompare={addMentorToCompare}
            comparedMentors={selectedMentors.map(m => m.name)}
            onViewDetail={openDetailModal}
            onFavoriteToggle={toggleFavorite}
            isFavorite={isFavorite}
            getAllMentors={() => mentors}
            onNavigateToDirektori={() => setCurrentSlide(2)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      {/* ===== SCROLLBAR STYLING ===== */}
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

      {/* ===== HEADER & NAVIGATION ===== */}
      <header className="pt-4 sm:pt-8 md:pt-12 px-4 sm:px-6 md:px-16 max-w-[1600px] mx-auto w-full z-50">
        {/* Logo Section */}
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/LogoIKAHATANew.svg" alt="Logo IKAHATA" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-2xl font-black tracking-tighter text-slate-950 leading-tight break-words">
                DATABASE ALUMNI HANGTUAH
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Sistem Database Digital
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none mb-1">
              Version 1.0
            </p>
            <p className="text-lg font-black text-slate-950 tracking-tighter">IKAHATA 2025</p>
          </div>
        </div>

        {/* Slide Navigation */}
        <SlideNavigation
          menuItems={menuItems}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />

        {/* Breadcrumb */}
        <nav className="px-4 sm:px-6 md:px-8 pt-2 pb-1" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400">
            <li>
              <button onClick={() => setCurrentSlide(0)} className="hover:text-indigo-600 transition-colors">
                Beranda
              </button>
            </li>
            {currentSlide > 0 && (
              <>
                <span aria-hidden>/</span>
                <li>
                  <span className="text-slate-600">
                    {currentSlide === 1 && 'Smart Match'}
                    {currentSlide === 2 && 'Direktori'}
                    {currentSlide === 3 && 'Etika Chat'}
                    {currentSlide === 4 && 'Tentang Kami'}
                    {currentSlide === 5 && 'Favorit'}
                  </span>
                </li>
              </>
            )}
          </ol>
        </nav>
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-visible">
        {renderSlideContent()}

        {/* Floating Comparison Button */}
        {isComparing && (
          <button
            onClick={() => setShowComparisonModal(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 bg-lime-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-2xl hover:bg-lime-600 transition-all active:scale-95 flex items-center gap-2 z-40 min-h-[44px]"
          >
            <span className="text-lg sm:text-xl font-black">{selectedMentors.length}</span>
            <span className="hidden sm:inline">Bandingkan Mentor</span>
            <span className="sm:hidden">Bandingkan</span>
          </button>
        )}

        {/* Floating Back-to-Top Button (Mobile Only) */}
        {showScrollToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 lg:hidden z-40 w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all min-h-[44px]"
            title="Kembali ke atas"
            aria-label="Scroll to top button"
          >
            <ArrowUp size={24} />
          </button>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-6 sm:py-12 px-4 sm:px-6 text-center border-t border-slate-100">
        <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] sm:tracking-[0.4em] break-words">
          © Alumni Mentorship Project • Hang Tuah Class of 2025
        </p>
      </footer>

      {/* ===== MODALS ===== */}
      <SopModal
        isOpen={showSopModal}
        selectedMentor={selectedMentor}
        onClose={closeSopModal}
        onProceed={proceedToWhatsapp}
      />

      <MentorComparisonModal
        isOpen={showComparisonModal}
        mentors={selectedMentors}
        onClose={() => setShowComparisonModal(false)}
        onRemove={removeMentorFromCompare}
        onContact={handleContactClick}
        onInstagram={handleInstagramClick}
        onCopySuccess={() => showToastMessage('Link disalin ke clipboard!')}
      />

      <Toast message={toastMessage} isVisible={showToast} onHide={() => setShowToast(false)} />

      {detailMentor && (
        <MentorDetailModal
          mentor={detailMentor}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onContact={handleContactClick}
          alumniId={detailAlumniId}
          similarMentors={getSimilarMentors(detailMentor)}
          onViewSimilar={openDetailModal}
        />
      )}

      {smartMatchMentor && (
        <SmartMatchActionModal
          mentor={smartMatchMentor}
          isOpen={showSmartMatchAction}
          onClose={() => setShowSmartMatchAction(false)}
          onContact={handleSmartMatchContact}
          onViewDetail={handleSmartMatchViewDetail}
          alumniId={smartMatchAlumniId}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="/*" element={<MainApp />} />
    </Routes>
  );
};

export default App;

