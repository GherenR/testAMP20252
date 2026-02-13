import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, BrainCircuit, Database, Info, ArrowUp, Heart, GraduationCap, Zap
} from 'lucide-react';
import AdminPage from './admin';
import AdminLogin from './admin/login';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { UserAuthProvider } from './contexts/UserAuthContext';
import { useUserAuth } from './contexts/UserAuthContext';
import { MOCK_MENTORS } from './constants';
import { getAllMentors } from './mentorService';
import { SlideData, Mentor } from './types';
import {
  useMentorFiltering,
  useMentorMatching,
  useSopModal,
  useMentorComparison,
  useFavorites
} from './hooks';
import {
  SlideNavigation,
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

// Lazy load slides for performance
const HeroSlide = lazy(() => import('./components/slides/HeroSlide').then(m => ({ default: m.HeroSlide })));
const MentorMatchmakerSlide = lazy(() => import('./components/slides/MentorMatchmakerSlide').then(m => ({ default: m.MentorMatchmakerSlide })));
const MentorDatabaseSlide = lazy(() => import('./components/slides/MentorDatabaseSlide').then(m => ({ default: m.MentorDatabaseSlide })));
const AboutSlide = lazy(() => import('./components/slides/AboutSlide').then(m => ({ default: m.AboutSlide })));
const SNBTAreaSlide = lazy(() => import('./components/slides/SNBTAreaSlide').then(m => ({ default: m.SNBTAreaSlide })));

/**
 * App Component
 * Main container component yang mengatur state aplikasi dan routing
 */

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 flex items-center justify-center animate-pulse">
        <Zap className="text-indigo-400" size={32} />
      </div>
      <p className="text-slate-400 font-medium">Memuat...</p>
    </div>
  </div>
);

const MainApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionExpired } = useUserAuth();

  // ===== ANALYTICS =====
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    // Map path to slide name and number for analytics
    const pathConfig: Record<string, { name: string, id: number }> = {
      '/': { name: 'Hero', id: 0 },
      '/matchmaker': { name: 'Smart Match', id: 1 },
      '/database': { name: 'Direktori', id: 2 },
      '/about': { name: 'Tentang Kami', id: 3 },
    };
    const config = pathConfig[location.pathname] || { name: 'Unknown', id: -1 };
    trackPageView(config.id, config.name);
  }, [location.pathname, trackPageView]);

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
        } else if (data && data.length > 0) {
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
      } finally {
        setMentorsLoading(false);
      }
    };
    loadMentors();
  }, []);

  // ===== MENTOR FILTERING HOOKS =====
  const mentorFiltering = useMentorFiltering(mentors);
  const {
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    filterPath, setFilterPath,
    resetFilter, filteredMentors
  } = mentorFiltering;

  // ===== MENTOR MATCHING HOOKS =====
  const mentorMatching = useMentorMatching();
  const {
    matchTarget, setMatchTarget,
    matchPath, setMatchPath,
    matchUniversity, setMatchUniversity,
    matchMajor, setMatchMajor,
    isMatching, matchResults
  } = mentorMatching;

  // ===== MODAL HOOKS =====
  const sopModal = useSopModal();
  const { isOpen: showSopModal, data: selectedMentor, open: openSopModal, close: closeSopModal } = sopModal;

  // ===== MENTOR COMPARISON HOOKS =====
  const mentorComparison = useMentorComparison();
  const { selectedMentors, addMentorToCompare, removeMentorFromCompare, setBulkComparison, isComparing } = mentorComparison;
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

  useEffect(() => {
    if (sessionExpired) {
      setToastMessage('Sesi login kamu sudah habis. Silakan login ulang.');
      setShowToast(true);
    }
  }, [sessionExpired]);

  useEffect(() => {
    if (location.pathname === '/matchmaker' && matchResults && window.innerWidth < 1024) {
      setTimeout(() => {
        const resultsSection = document.getElementById('match-results');
        resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  }, [matchResults, location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300 && window.innerWidth < 640);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const comparisonMentors = decodeComparisonUrl(params);
    if (comparisonMentors.length > 0) {
      setBulkComparison(comparisonMentors);
      setShowComparisonModal(true);
    }
  }, []);

  useEffect(() => {
    if (selectedMentors.length > 0) {
      const newUrl = encodeComparisonUrl(selectedMentors);
      window.history.replaceState(null, '', window.location.pathname + newUrl);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [selectedMentors, location.pathname]);

  useEffect(() => {
    if (showComparisonModal && selectedMentors.length === 0) {
      setShowComparisonModal(false);
    }
  }, [selectedMentors, showComparisonModal]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailMentor, setDetailMentor] = useState<Mentor | null>(null);
  const [detailAlumniId, setDetailAlumniId] = useState<string>('');

  const [showSmartMatchAction, setShowSmartMatchAction] = useState(false);
  const [smartMatchMentor, setSmartMatchMentor] = useState<Mentor | null>(null);
  const [smartMatchAlumniId, setSmartMatchAlumniId] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDetailModal) setShowDetailModal(false);
        else if (showComparisonModal) setShowComparisonModal(false);
        else if (showSopModal) closeSopModal();
        else if (showSmartMatchAction) setShowSmartMatchAction(false);
      } else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!document.activeElement?.closest('input, textarea, select')) {
          const index = menuItems.findIndex(i => (i.path || '/') === location.pathname);
          if (index > 0) navigate(menuItems[index - 1].path || '/');
        }
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!document.activeElement?.closest('input, textarea, select')) {
          const index = menuItems.findIndex(i => (i.path || '/') === location.pathname);
          if (index >= 0 && index < 3) navigate(menuItems[index + 1].path || '/');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDetailModal, showComparisonModal, showSopModal, showSmartMatchAction, location.pathname, navigate, closeSopModal]);

  const getSubPaths = (category: string) => {
    switch (category) {
      case 'PTN': return ['SNBP', 'SNBT', 'Mandiri'];
      case 'PTS': return ['Reguler', 'Beasiswa'];
      case 'PTLN': return ['Beasiswa Luar Negeri', 'Mandiri'];
      case 'All': return ['SNBP', 'SNBT', 'Mandiri', 'Reguler', 'Beasiswa', 'Beasiswa Luar Negeri'];
      default: return [];
    }
  };

  const handleContactClick = (mentor: Mentor) => openSopModal(mentor);

  const proceedToWhatsapp = (studentName: string, studentClass: string, studentBatch: number) => {
    if (!selectedMentor) return;
    const message = generateWhatsAppMessage(selectedMentor.name, studentName, studentClass, studentBatch);
    const phoneNumber = selectedMentor.whatsapp?.replace('wa.me/', '') || '6282114927981';
    window.open(generateWhatsAppLink(phoneNumber, message), '_blank');
    closeSopModal();
  };

  const handleInstagramClick = (handle: string) => window.open(`https://www.instagram.com/${handle}/`, '_blank');

  const openDetailModal = (mentor: Mentor) => {
    const index = mentors.findIndex(m => m.name === mentor.name);
    setDetailAlumniId(`#2025-${index + 104}`);
    setDetailMentor(mentor);
    setShowDetailModal(true);
  };

  const getSimilarMentors = (mentor: Mentor) =>
    mentors.filter(m => m.name !== mentor.name && (m.university === mentor.university || m.major === mentor.major)).slice(0, 3);

  const handleSmartMatchMentorClick = (mentor: Mentor) => {
    const index = mentors.findIndex(m => m.name === mentor.name);
    setSmartMatchAlumniId(`#2025-${index + 104}`);
    setSmartMatchMentor(mentor);
    setShowSmartMatchAction(true);
  };

  const handleSmartMatchViewDetail = (mentor: Mentor) => {
    setShowSmartMatchAction(false);
    setTimeout(() => openDetailModal(mentor), 300);
  };

  const handleSmartMatchContact = (mentor: Mentor) => {
    setShowSmartMatchAction(false);
    setTimeout(() => handleContactClick(mentor), 300);
  };

  const { favorites, toggleFavorite, isFavorite } = useFavorites(mentors);

  const menuItems: MenuItem[] = [
    { id: 0, icon: <Home size={18} />, label: 'Beranda', path: '/' },
    { id: 1, icon: <BrainCircuit size={18} />, label: 'Smart Match', path: '/matchmaker' },
    { id: 2, icon: <Database size={18} />, label: 'Direktori', path: '/database' },
    { id: 3, icon: <Info size={18} />, label: 'Tentang Kami', path: '/about' },
    { id: -1, icon: <GraduationCap size={18} />, label: 'SNBT Area', path: '/snbt' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
        nav::-webkit-scrollbar { height: 6px !important; display: block !important; }
        nav::-webkit-scrollbar-track { background: #f1f5f9 !important; border-radius: 10px; }
        nav::-webkit-scrollbar-thumb { background: #4f46e5 !important; border-radius: 10px; border: 1px solid #f1f5f9; }
      ` }} />

      <header className="pt-4 sm:pt-8 md:pt-12 px-4 sm:px-6 md:px-16 max-w-[1600px] mx-auto w-full z-50">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/LogoIKAHATANew.svg" alt="Logo IKAHATA" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg md:text-2xl font-black tracking-tighter text-slate-950 leading-tight break-words">DATABASE ALUMNI HANGTUAH</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sistem Database Digital</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1">Version 1.0</p>
            <p className="text-lg font-black text-slate-950 tracking-tighter">IKAHATA 2025</p>
          </div>
        </div>

        <SlideNavigation menuItems={menuItems} currentSlide={0} onSlideChange={() => { }} />

        <nav className="px-4 sm:px-6 md:px-8 pt-2 pb-1" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400">
            <li><button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">Beranda</button></li>
            {location.pathname !== '/' && (
              <>
                <span aria-hidden>/</span>
                <li>
                  <span className="text-slate-600">
                    {location.pathname === '/matchmaker' && 'Smart Match'}
                    {location.pathname === '/database' && 'Direktori'}
                    {location.pathname === '/about' && 'Tentang Kami'}
                  </span>
                </li>
              </>
            )}
          </ol>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HeroSlide onSmartMatchClick={() => navigate('/matchmaker')} onNavigateToSlide={(idx) => navigate(menuItems.find(i => i.id === idx)?.path || '/')} />} />
            <Route path="/matchmaker" element={<MentorMatchmakerSlide matchTarget={matchTarget} onMatchTargetChange={setMatchTarget} matchPath={matchPath} onMatchPathChange={setMatchPath} matchUniversity={matchUniversity} onMatchUniversityChange={setMatchUniversity} matchMajor={matchMajor} onMatchMajorChange={setMatchMajor} isMatching={isMatching} matchResults={matchResults} subPaths={getSubPaths(matchTarget)} onRunMatchmaker={() => mentorMatching.runMatchmaker(mentors)} onReset={mentorMatching.resetMatching} onMentorSelect={handleSmartMatchMentorClick} onMentorCompare={addMentorToCompare} comparedMentors={selectedMentors.map((m: any) => m.name)} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} />} />
            <Route path="/database" element={<MentorDatabaseSlide filteredMentors={filteredMentors} searchTerm={searchTerm} onSearchChange={setSearchTerm} filterCategory={filterCategory} onCategoryChange={setFilterCategory} filterPath={filterPath} onPathChange={setFilterPath} subPaths={getSubPaths(filterCategory)} onMentorContact={handleContactClick} onMentorInstagram={handleInstagramClick} onMentorCompare={addMentorToCompare} comparedMentors={selectedMentors.map((m: any) => m.name)} onViewDetail={openDetailModal} onResetFilter={resetFilter} onFavoriteToggle={toggleFavorite} isFavorite={isFavorite} />} />
            <Route path="/about" element={<AboutSlide />} />
          </Routes>
        </Suspense>

        {isComparing && (
          <button onClick={() => setShowComparisonModal(true)} className="fixed bottom-4 right-4 bg-lime-500 text-white px-6 py-4 rounded-full font-bold shadow-2xl hover:bg-lime-600 transition-all z-40 flex items-center gap-2">
            <span className="text-xl font-black">{selectedMentors.length}</span>
            <span className="hidden sm:inline">Bandingkan Mentor</span>
          </button>
        )}

        {showScrollToTop && (
          <button onClick={scrollToTop} className="fixed bottom-20 right-4 lg:hidden z-40 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all">
            <ArrowUp size={24} />
          </button>
        )}
      </main>

      <footer className="py-12 px-6 text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© Alumni Mentorship Project • Hang Tuah Class of 2025</p>
      </footer>

      <SopModal isOpen={showSopModal} selectedMentor={selectedMentor} onClose={closeSopModal} onProceed={proceedToWhatsapp} />
      <MentorComparisonModal isOpen={showComparisonModal} mentors={selectedMentors} onClose={() => setShowComparisonModal(false)} onRemove={removeMentorFromCompare} onContact={handleContactClick} onInstagram={handleInstagramClick} onCopySuccess={() => showToastMessage('Link disalin!')} />
      <Toast message={toastMessage} isVisible={showToast} onHide={() => setShowToast(false)} />
      {detailMentor && <MentorDetailModal mentor={detailMentor} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} onContact={handleContactClick} alumniId={detailAlumniId} similarMentors={getSimilarMentors(detailMentor)} onViewSimilar={openDetailModal} />}
      {smartMatchMentor && <SmartMatchActionModal mentor={smartMatchMentor} isOpen={showSmartMatchAction} onClose={() => setShowSmartMatchAction(false)} onContact={handleSmartMatchContact} onViewDetail={handleSmartMatchViewDetail} alumniId={smartMatchAlumniId} />}
    </div>
  );
};

const App: React.FC = () => (
  <Routes>
    {/* Admin Routes */}
    <Route
      path="/admin/*"
      element={
        <AdminAuthProvider>
          <Routes>
            <Route path="login" element={<AdminLogin />} />
            <Route path="*" element={<AdminPage />} />
          </Routes>
        </AdminAuthProvider>
      }
    />

    {/* SNBT Area Routes */}
    <Route
      path="/snbt/*"
      element={
        <UserAuthProvider>
          <SNBTAreaSlide />
        </UserAuthProvider>
      }
    />

    {/* Main App Routes */}
    <Route
      path="/*"
      element={
        <UserAuthProvider>
          <MainApp />
        </UserAuthProvider>
      }
    />
  </Routes>
);

export default App;
