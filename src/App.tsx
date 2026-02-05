import React from 'react';
import {
  Zap, BrainCircuit, Database, ShieldCheck, Info
} from 'lucide-react';
import { MOCK_MENTORS } from './constants';
import { SlideData } from './types';
import {
  useSlideNavigation,
  useMentorFiltering,
  useMentorMatching,
  useSopModal
} from './hooks';
import {
  SlideNavigation,
  HeroSlide,
  MentorMatchmakerSlide,
  MentorDatabaseSlide,
  EtiquetteGuideSlide,
  AboutSlide,
  SopModal,
  MenuItem
} from './components';

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
const App: React.FC = () => {
  // ===== NAVIGATION HOOKS =====
  const totalSlides = 5;
  const slides: SlideData[] = [
    { id: 'hero' },
    { id: 'matchmaker' },
    { id: 'database' },
    { id: 'etiquette' },
    { id: 'about' }
  ];

  const slideNavigation = useSlideNavigation(totalSlides);
  const { currentSlide, setCurrentSlide } = slideNavigation;

  // ===== MENTOR FILTERING HOOKS =====
  const mentorFiltering = useMentorFiltering(MOCK_MENTORS);
  const {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterPath,
    setFilterPath,
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

  // ===== HELPER FUNCTIONS =====
  /**
   * Get sub-paths berdasarkan kategori institusi
   */
  const getSubPaths = (category: typeof filterCategory) => {
    switch (category) {
      case 'PTN': return ['SNBP', 'SNBT', 'Mandiri'];
      case 'PTS': return ['Reguler', 'Beasiswa'];
      case 'PTLN': return ['Beasiswa Luar Negeri', 'Mandiri'];
      default: return [];
    }
  };

  /**
   * Handle tombol "Hubungi Mentor" - open SOP modal
   */
  const handleContactClick = (mentor: typeof MOCK_MENTORS[0]) => {
    openSopModal(mentor);
  };

  /**
   * Proceed ke WhatsApp setelah menerima SOP
   */
  const proceedToWhatsapp = () => {
    const whatsappLink = selectedMentor?.whatsapp
      ? `https://${selectedMentor.whatsapp}`
      : 'https://wa.me/6282114927981';

    window.open(whatsappLink, '_blank');
    closeSopModal();
  };

  /**
   * Handle Instagram button click
   */
  const handleInstagramClick = (handle: string) => {
    window.open(`https://www.instagram.com/${handle}/`, '_blank');
  };

  // ===== MENU ITEMS untuk navigation =====
  const menuItems: MenuItem[] = [
    { icon: <Zap size={18} />, label: 'Beranda', id: 0 },
    { icon: <BrainCircuit size={18} />, label: 'Smart Match', id: 1 },
    { icon: <Database size={18} />, label: 'Direktori', id: 2 },
    { icon: <ShieldCheck size={18} />, label: 'Etika Chat', id: 3 },
    { icon: <Info size={18} />, label: 'Tentang Kami', id: 4 },
  ];

  // ===== SLIDE CONTENT MAPPING =====
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return <HeroSlide onSmartMatchClick={() => setCurrentSlide(1)} />;
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
            onRunMatchmaker={() => mentorMatching.runMatchmaker(MOCK_MENTORS)}
            onMentorContact={handleContactClick}
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
          />
        );
      case 3:
        return <EtiquetteGuideSlide />;
      case 4:
        return <AboutSlide />;
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
      <header className="pt-8 md:pt-12 px-6 md:px-16 max-w-[1600px] mx-auto w-full z-50">
        {/* Logo Section */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
              <img src="/LogoIKAHATANew.svg" alt="Logo IKAHATA" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tighter text-slate-950 leading-none">
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
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-visible">
        {renderSlideContent()}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-6 text-center border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
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
    </div>
  );
};

export default App;
