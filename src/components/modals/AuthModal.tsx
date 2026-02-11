import React, { useState, useEffect } from 'react';
import {
    X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle,
    Phone, Instagram, GraduationCap, School, ChevronRight, ChevronLeft, Target
} from 'lucide-react';
import { useUserAuth, SignUpData } from '../../contexts/UserAuthContext';
import type { AuthError } from '@supabase/supabase-js';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

// Kelas options
const KELAS_OPTIONS = ['12-1', '12-2', '12-3', '12-4', '12-5', '12-6', '12-7'];

// Generate angkatan options (current year - 1 to current year + 3)
const currentYear = new Date().getFullYear();
const ANGKATAN_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

// Popular universities for suggestions
const POPULAR_UNIVERSITIES = [
    'Universitas Indonesia (UI)',
    'Institut Teknologi Bandung (ITB)',
    'Universitas Gadjah Mada (UGM)',
    'Institut Pertanian Bogor (IPB)',
    'Universitas Airlangga (UNAIR)',
    'Universitas Brawijaya (UB)',
    'Universitas Padjadjaran (UNPAD)',
    'Universitas Diponegoro (UNDIP)',
    'Institut Teknologi Sepuluh Nopember (ITS)',
    'Universitas Hasanuddin (UNHAS)',
];

export const AuthModal: React.FC<AuthModalProps> = ({
    isOpen,
    onClose,
    initialMode = 'login'
}) => {
    const { signIn, signUp } = useUserAuth();
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [signupStep, setSignupStep] = useState(1);
    const totalSteps = 3;

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [kelas, setKelas] = useState('');
    const [angkatan, setAngkatan] = useState<number | ''>('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [targetUniversity1, setTargetUniversity1] = useState('');
    const [targetMajor1, setTargetMajor1] = useState('');
    const [targetUniversity2, setTargetUniversity2] = useState('');
    const [targetMajor2, setTargetMajor2] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Reset to initial mode when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setSignupStep(1);
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Add timeout to prevent infinite loading
            const signInPromise = signIn(email, password);
            const timeoutPromise = new Promise<{ error: Error | null }>((resolve) =>
                setTimeout(() => resolve({
                    error: {
                        message: 'Login timeout. Server lambat merespons. Coba lagi.',
                        name: 'TimeoutError',
                        status: 408
                    } as Error
                }), 15000)
            );

            const { error } = await Promise.race([signInPromise, timeoutPromise]);

            if (error) {
                if (error.message.includes('Invalid login')) {
                    setError('Email atau password salah');
                } else if (error.message.includes('Email not confirmed')) {
                    setError('Email belum diverifikasi. Cek inbox kamu.');
                } else {
                    setError(error.message);
                }
            } else {
                // Add small delay to allow auth state to update before closing modal
                setTimeout(() => onClose(), 500);
            }
        } catch {
            setError('Terjadi kesalahan. Coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupStepNext = () => {
        setError(null);

        // Validate step 1
        if (signupStep === 1) {
            if (!fullName.trim()) {
                setError('Nama lengkap wajib diisi');
                return;
            }
            if (!email.trim() || !email.includes('@')) {
                setError('Email tidak valid');
                return;
            }
            if (password.length < 6) {
                setError('Password minimal 6 karakter');
                return;
            }
        }

        // Validate step 2
        if (signupStep === 2) {
            if (!kelas) {
                setError('Pilih kelas kamu');
                return;
            }
            if (!angkatan) {
                setError('Pilih angkatan kamu');
                return;
            }
        }

        setSignupStep(prev => Math.min(prev + 1, totalSteps));
    };

    const handleSignupStepBack = () => {
        setError(null);
        setSignupStep(prev => Math.max(prev - 1, 1));
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const signUpData: SignUpData = {
                email,
                password,
                fullName,
                kelas: kelas || undefined,
                angkatan: angkatan || undefined,
                phone: phone || undefined,
                instagram: instagram || undefined,
                targetUniversity1: targetUniversity1 || undefined,
                targetMajor1: targetMajor1 || undefined,
                targetUniversity2: targetUniversity2 || undefined,
                targetMajor2: targetMajor2 || undefined
            };

            const { error } = await signUp(signUpData);
            if (error) {
                if (error.message.includes('already registered')) {
                    setError('Email sudah terdaftar. Silakan login.');
                } else {
                    setError(error.message);
                }
            } else {
                // Store profile data for insertion after email confirmation and sign-in
                localStorage.setItem('pendingUserProfile', JSON.stringify(signUpData));
                setSuccess('Akun berhasil dibuat! Cek email untuk verifikasi. Email verifikasi kemungkinan besar masuk ke folder Spam atau Promotion.');
                setTimeout(() => {
                    resetForm();
                    setMode('login');
                    setSuccess(null);
                }, 5000); // Show success for 5 seconds
            }
        } catch {
            setError('Terjadi kesalahan. Coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFullName('');
        setKelas('');
        setAngkatan('');
        setPhone('');
        setInstagram('');
        setTargetUniversity1('');
        setTargetMajor1('');
        setTargetUniversity2('');
        setTargetMajor2('');
        setError(null);
        setSuccess(null);
        setSignupStep(1);
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        resetForm();
    };

    // Render step indicator
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === signupStep
                            ? 'bg-white text-indigo-600'
                            : step < signupStep
                                ? 'bg-emerald-400 text-white'
                                : 'bg-white/30 text-white/70'
                            }`}
                    >
                        {step < signupStep ? '✓' : step}
                    </div>
                    {step < 3 && (
                        <div
                            className={`w-8 h-1 mx-1 rounded ${step < signupStep ? 'bg-emerald-400' : 'bg-white/30'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    // Render signup step content
    const renderSignupStep = () => {
        if (signupStep === 1) {
            return (
                <>
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>
                    </div>
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full pl-10 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </>
            );
        } else if (signupStep === 2) {
            return (
                <>
                    {/* Kelas */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Kelas <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select aria-label="Pilih"
                                value={kelas}
                                onChange={(e) => setKelas(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                required
                            >
                                <option value="">Pilih kelas</option>
                                {KELAS_OPTIONS.map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Angkatan */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Angkatan <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select aria-label="Pilih"
                                value={angkatan}
                                onChange={(e) => setAngkatan(e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                required
                            >
                                <option value="">Pilih angkatan</option>
                                {ANGKATAN_OPTIONS.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Nomor HP
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Instagram */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Instagram
                        </label>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                                placeholder="username (tanpa @)"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </>
            );

        } else if (signupStep === 3) {
            return (
                <>
                    <p className="text-sm text-slate-500 mb-4">
                        Pilih target kampus & jurusan untuk rekomendasi yang lebih personal.
                    </p>
                    {/* Target 1 */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                            <Target size={16} />
                            <span>Target Pilihan 1</span>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Universitas
                            </label>
                            <input
                                type="text"
                                value={targetUniversity1}
                                onChange={(e) => setTargetUniversity1(e.target.value)}
                                placeholder="Contoh: Universitas Indonesia"
                                list="uni-suggestions"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Jurusan/Prodi
                            </label>
                            <input
                                type="text"
                                value={targetMajor1}
                                onChange={(e) => setTargetMajor1(e.target.value)}
                                placeholder="Contoh: Teknik Informatika"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                            />
                        </div>
                    </div>
                    {/* Target 2 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-amber-700 font-bold">
                            <Target size={16} />
                            <span>Target Pilihan 2</span>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Universitas
                            </label>
                            <input
                                type="text"
                                value={targetUniversity2}
                                onChange={(e) => setTargetUniversity2(e.target.value)}
                                placeholder="Contoh: ITB"
                                list="uni-suggestions"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Jurusan/Prodi
                            </label>
                            <input
                                type="text"
                                value={targetMajor2}
                                onChange={(e) => setTargetMajor2(e.target.value)}
                                placeholder="Contoh: Sistem Informasi"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none transition-colors text-sm"
                            />
                        </div>
                    </div>
                    {/* University suggestions datalist */}
                    <datalist id="uni-suggestions">
                        {POPULAR_UNIVERSITIES.map(uni => (
                            <option key={uni} value={uni} />
                        ))}
                    </datalist>
                </>
            );
        }
        return null;
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-center">
                        {mode === 'signup' && renderStepIndicator()}
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                            <span className="text-3xl">
                                {mode === 'login' ? '👋' : signupStep === 1 ? '🚀' : signupStep === 2 ? '📝' : '🎯'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-white">
                            {mode === 'login' ? 'Selamat Datang!' : 'Buat Akun Baru'}
                        </h2>
                    </div>
                </div>
                {/* Notification (error/success) */}
                {(error || success) && (
                    <div className="flex items-center justify-center p-4">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold animate-fade-in-out" style={{ minWidth: 260, justifyContent: 'center' }}>
                                <CheckCircle size={18} /> {success}
                            </div>
                        )}
                    </div>
                )}
                {/* Form */}
                <form
                    className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto"
                    onSubmit={mode === 'login' ? handleLogin : handleSignupSubmit}
                >
                    {mode === 'login' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan password"
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    {mode === 'signup' && renderSignupStep()}
                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        {mode === 'signup' && signupStep > 1 && (
                            <button
                                type="button"
                                onClick={handleSignupStepBack}
                                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronLeft size={18} /> Kembali
                            </button>
                        )}
                        <button
                            type={mode === 'signup' && signupStep < totalSteps ? 'button' : 'submit'}
                            onClick={mode === 'signup' && signupStep < totalSteps ? handleSignupStepNext : undefined}
                            disabled={isLoading}
                            className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                mode === 'login' ? 'Login' : signupStep < totalSteps ? 'Lanjut' : 'Daftar'
                            )}
                        </button>
                    </div>
                </form>
                {/* Switch mode */}
                <div className="text-center py-4">
                    {mode === 'login' ? (
                        <span className="text-sm text-slate-600">
                            Belum punya akun?{' '}
                            <button
                                type="button"
                                className="text-indigo-600 font-bold hover:underline"
                                onClick={switchMode}
                            >
                                Daftar
                            </button>
                        </span>
                    ) : (
                        <span className="text-sm text-slate-600">
                            Sudah punya akun?{' '}
                            <button
                                type="button"
                                className="text-indigo-600 font-bold hover:underline"
                                onClick={switchMode}
                            >
                                Login
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
