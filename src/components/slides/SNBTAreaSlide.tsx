import React, { useState, lazy, Suspense } from 'react';
// Error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        // log error if needed
        // console.error(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-center p-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Terjadi Error</h1>
                        <p className="mb-4">Maaf, terjadi kesalahan pada halaman ini.<br />Silakan refresh atau login ulang.</p>
                        <pre className="text-xs text-red-400 bg-slate-800 rounded p-2 overflow-x-auto max-w-xl mx-auto">{String(this.state.error)}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
import { useNavigate } from 'react-router-dom';
import {
    Target, BookOpen, TrendingUp, Award, Lock,
    ChevronRight, Sparkles, BarChart3, Brain,
    CheckCircle, Users, Zap, ArrowRight, LogOut, Home, User, Settings
} from 'lucide-react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { AuthModal } from '../modals/AuthModal';
import { UserProfileModal } from '../modals/UserProfileModal';

// Lazy load heavy components
const PeluangSlide = lazy(() => import('./PeluangSlide'));
const TryoutSlide = lazy(() => import('./TryoutSlide'));

type DashboardView = 'home' | 'peluang' | 'tryout';

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

// Feature Card Component
const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    delay?: number;
}> = ({ icon, title, description, color, delay = 0 }) => (
    <div
        className={`bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-${color}-500/50 transition-all duration-300 hover:-translate-y-1 group`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-14 h-14 rounded-2xl bg-${color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-lg font-black text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
);

// Teaser Landing Page (not logged in)
const TeaserPage: React.FC<{ onLoginClick: () => void; onBackClick: () => void }> = ({ onLoginClick, onBackClick }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 overflow-y-auto">
        {/* Back Button */}
        <button
            onClick={onBackClick}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-xl hover:bg-slate-700 transition-all"
        >
            <Home size={18} />
            <span className="hidden sm:inline">Beranda</span>
        </button>

        {/* Hero Section */}
        <div className="relative px-4 pt-16 pb-16 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto text-center relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6">
                    <Sparkles className="text-amber-400" size={16} />
                    <span className="text-amber-300 text-sm font-bold">Fitur Premium Gratis!</span>
                </div>

                {/* Main Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
                    SNBT & SNBP
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                        Area
                    </span>
                </h1>

                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
                    Tools lengkap untuk persiapan SNBT & SNBP kamu.
                    Cek peluang lolos, latihan tryout, dan track progress — semua dalam satu tempat.
                </p>

                {/* CTA Button */}
                <button
                    onClick={onLoginClick}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-lg rounded-2xl hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1 transition-all"
                >
                    <Lock size={20} />
                    Masuk untuk Akses
                    <ChevronRight size={20} />
                </button>

                <p className="text-slate-500 text-sm mt-4">
                    Gratis selamanya • Tidak perlu kartu kredit
                </p>
            </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-white mb-2">Apa yang Kamu Dapatkan?</h2>
                <p className="text-slate-400">Fitur-fitur yang bakal bantu persiapan kamu</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    icon={<Target className="text-emerald-400" size={28} />}
                    title="Cek Peluang Lolos"
                    description="Hitung estimasi peluang kamu masuk PTN impian berdasarkan nilai rapor (SNBP) atau skor UTBK (SNBT)."
                    color="emerald"
                    delay={100}
                />
                <FeatureCard
                    icon={<BookOpen className="text-violet-400" size={28} />}
                    title="Mini Tryout SNBT"
                    description="Latihan soal TPS dengan timer, scoring otomatis, dan pembahasan lengkap. Mirip ujian aslinya!"
                    color="violet"
                    delay={200}
                />
                <FeatureCard
                    icon={<BarChart3 className="text-amber-400" size={28} />}
                    title="Data PTN Lengkap"
                    description="Akses data passing grade, daya tampung, dan keketatan dari 50+ prodi di PTN Jawa & Top 30."
                    color="amber"
                    delay={300}
                />
                <FeatureCard
                    icon={<TrendingUp className="text-sky-400" size={28} />}
                    title="Track Progress"
                    description="Pantau perkembangan skor tryout kamu dari waktu ke waktu. Lihat area yang perlu ditingkatkan."
                    color="sky"
                    delay={400}
                />
                <FeatureCard
                    icon={<Brain className="text-rose-400" size={28} />}
                    title="6 Subtes TPS"
                    description="Soal lengkap: Penalaran Umum, Kuantitatif, Pemahaman Bacaan, Literasi Indo & Inggris, Penalaran Mat."
                    color="rose"
                    delay={500}
                />
                <FeatureCard
                    icon={<Award className="text-lime-400" size={28} />}
                    title="Simpan Data"
                    description="Semua progress dan favorit tersimpan di akun kamu. Akses dari device manapun, kapanpun."
                    color="lime"
                    delay={600}
                />
            </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/5 border-y border-white/10 py-16">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-black text-white mb-2">Kenapa Harus Daftar?</h2>
                    <p className="text-slate-400">Keuntungan punya akun di AMP</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {[
                        { icon: '🔒', text: 'Data tersimpan aman di cloud' },
                        { icon: '📱', text: 'Akses dari HP, tablet, atau laptop' },
                        { icon: '📊', text: 'Histori tryout tersimpan permanen' },
                        { icon: '🎯', text: 'Rekomendasi prodi yang sesuai' },
                        { icon: '⚡', text: 'Fitur baru gratis selamanya' },
                        { icon: '🤝', text: 'Gabung komunitas 1000+ siswa' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-white font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Final CTA */}
        <div className="py-16 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
                    🚀
                </div>
                <h2 className="text-3xl font-black text-white mb-4">
                    Siap Mulai Persiapan?
                </h2>
                <p className="text-slate-400 mb-8">
                    Ribuan siswa sudah menggunakan tools ini. Sekarang giliran kamu.
                </p>
                <button
                    onClick={onLoginClick}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black text-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    Daftar Gratis Sekarang
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    </div>
);

// Dashboard Home (logged in)
const DashboardHome: React.FC<{
    profile: { fullName: string } | null;
    onNavigate: (view: DashboardView) => void;
    onLogout: () => void;
    onBackClick: () => void;
    onEditProfile: () => void;
}> = ({ profile, onNavigate, onLogout, onBackClick, onEditProfile }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-8 px-4 overflow-y-auto">
        {/* Back Button */}
        <button
            onClick={onBackClick}
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-xl hover:bg-slate-700 transition-all"
        >
            <Home size={18} />
            <span className="hidden sm:inline">Beranda</span>
        </button>

        <div className="max-w-4xl mx-auto pt-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-1">
                        SNBT & SNBP Area
                    </p>
                    <h1 className="text-3xl font-black text-white">
                        Halo, {profile?.fullName?.split(' ')[0] || 'Pejuang'}! 👋
                    </h1>
                    <p className="text-slate-400 mt-1">Mau latihan apa hari ini?</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEditProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-500/30 transition-all text-sm"
                    >
                        <Settings size={16} />
                        <span className="hidden sm:inline">Profil</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all text-sm"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-emerald-400">0</p>
                    <p className="text-xs text-emerald-300/70">Tryout Selesai</p>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-amber-400">-</p>
                    <p className="text-xs text-amber-300/70">Skor Tertinggi</p>
                </div>
                <div className="bg-violet-500/20 border border-violet-500/30 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-violet-400">0</p>
                    <p className="text-xs text-violet-300/70">Prodi Disimpan</p>
                </div>
            </div>

            {/* Menu Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
                {/* Cek Peluang Card */}
                <button
                    onClick={() => onNavigate('peluang')}
                    className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-left hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Target className="text-white" size={28} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Cek Peluang Lolos</h3>
                    <p className="text-emerald-100 text-sm mb-4">
                        Hitung estimasi peluang masuk PTN berdasarkan nilai kamu
                    </p>
                    <div className="flex items-center gap-2 text-white font-bold">
                        <span>Mulai Hitung</span>
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </div>
                </button>

                {/* Tryout Card */}
                <button
                    onClick={() => onNavigate('tryout')}
                    className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 text-left hover:shadow-xl hover:shadow-violet-500/20 hover:-translate-y-1 transition-all group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="text-white" size={28} />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Mini Tryout TPS</h3>
                    <p className="text-violet-100 text-sm mb-4">
                        Latihan soal dengan timer dan pembahasan lengkap
                    </p>
                    <div className="flex items-center gap-2 text-white font-bold">
                        <span>Mulai Tryout</span>
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </div>
                </button>
            </div>

            {/* Tips Section */}
            <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="text-amber-400" size={20} />
                    </div>
                    <h3 className="text-lg font-black text-white">Tips Hari Ini</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                    Konsistensi lebih penting dari intensitas. Lebih baik latihan 30 menit setiap hari
                    daripada 5 jam sekali seminggu. Otak butuh waktu untuk memproses dan mengingat.
                    Yuk mulai dengan tryout singkat hari ini! 💪
                </p>
            </div>
        </div>
    </div>
);

// Main Component
export const SNBTAreaSlide: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, profile, signOut, isLoading } = useUserAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [currentView, setCurrentView] = useState<DashboardView>('home');

    const handleBackToHome = () => navigate('/');

    // Tambahkan delay sebelum error profile null
    const [profileError, setProfileError] = useState(false);
    React.useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (isAuthenticated && !profile && !isLoading) {
            timer = setTimeout(() => setProfileError(true), 2000);
        } else {
            setProfileError(false);
        }
        return () => timer && clearTimeout(timer);
    }, [isAuthenticated, profile, isLoading]);

    // Handler logout agar redirect ke halaman utama setelah signOut
    const handleLogout = async () => {
        await signOut();
        navigate('/', { replace: true });
    };

    return (
        <ErrorBoundary>
            {/* Show loading state */}
            {isLoading ? <LoadingFallback /> : null}

            {/* Not authenticated - show teaser */}
            {!isLoading && !isAuthenticated ? (
                <>
                    <TeaserPage
                        onLoginClick={() => {
                            setAuthMode('signup');
                            setShowAuthModal(true);
                        }}
                        onBackClick={handleBackToHome}
                    />
                    <AuthModal
                        isOpen={showAuthModal}
                        onClose={() => setShowAuthModal(false)}
                        initialMode={authMode}
                    />
                </>
            ) : null}

            {/* Jika sudah login tapi profile null, tampilkan pesan error dan tombol logout (setelah delay) */}
            {profileError ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white text-center p-8">
                    <h1 className="text-2xl font-bold mb-2">Data Profil Tidak Ditemukan</h1>
                    <p className="mb-4">Akun kamu sudah login, tapi data profil tidak ditemukan.<br />Silakan logout lalu login ulang, atau hubungi admin jika masalah berlanjut.</p>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-700 transition-colors mt-2"
                    >Logout</button>
                </div>
            ) : null}

            {/* Authenticated - show dashboard or feature */}
            {isAuthenticated && profile && !isLoading ? (
                <Suspense fallback={<LoadingFallback />}>
                    {currentView === 'home' && (
                        <DashboardHome
                            profile={profile}
                            onNavigate={setCurrentView}
                            onLogout={signOut}
                            onBackClick={handleBackToHome}
                            onEditProfile={() => setShowProfileModal(true)}
                        />
                    )}
                    <UserProfileModal
                        isOpen={showProfileModal}
                        onClose={() => setShowProfileModal(false)}
                    />
                    {currentView === 'peluang' && (
                        <div className="relative">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-xl hover:bg-slate-700 transition-all"
                            >
                                <ChevronRight className="rotate-180" size={18} />
                                Kembali
                            </button>
                            <PeluangSlide isLoggedIn={true} />
                        </div>
                    )}
                    {currentView === 'tryout' && (
                        <div className="relative">
                            <button
                                onClick={() => setCurrentView('home')}
                                className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm text-white rounded-xl hover:bg-slate-700 transition-all"
                            >
                                <ChevronRight className="rotate-180" size={18} />
                                Kembali
                            </button>
                            <TryoutSlide isLoggedIn={true} />
                        </div>
                    )}
                </Suspense>
            ) : null}
        </ErrorBoundary>
    );
};

export default SNBTAreaSlide;
