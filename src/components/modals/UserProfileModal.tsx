import React, { useState, useEffect } from 'react';
import {
    X, User, Phone, Instagram, GraduationCap, School, Target,
    Loader2, CheckCircle, AlertCircle, Save, Mail
} from 'lucide-react';
import { useUserAuth, UserProfile } from '../../contexts/UserAuthContext';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Kelas options
const KELAS_OPTIONS = ['12-1', '12-2', '12-3', '12-4', '12-5', '12-6', '12-7'];

// Generate angkatan options
const currentYear = new Date().getFullYear();
const ANGKATAN_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

// Popular universities
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

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
    isOpen,
    onClose
}) => {
    const { profile, updateProfile } = useUserAuth();

    // Form states
    const [fullName, setFullName] = useState('');
    const [kelas, setKelas] = useState('');
    const [angkatan, setAngkatan] = useState<number | ''>('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [targetUniversity1, setTargetUniversity1] = useState('');
    const [targetMajor1, setTargetMajor1] = useState('');
    const [targetUniversity2, setTargetUniversity2] = useState('');
    const [targetMajor2, setTargetMajor2] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load profile data when modal opens
    useEffect(() => {
        if (isOpen && profile) {
            setFullName(profile.fullName || '');
            setKelas(profile.kelas || '');
            setAngkatan(profile.angkatan || '');
            setPhone(profile.phone || '');
            setInstagram(profile.instagram || '');
            setTargetUniversity1(profile.targetUniversity1 || '');
            setTargetMajor1(profile.targetMajor1 || '');
            setTargetUniversity2(profile.targetUniversity2 || '');
            setTargetMajor2(profile.targetMajor2 || '');
        }
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            if (!fullName.trim()) {
                setError('Nama lengkap wajib diisi');
                setIsLoading(false);
                return;
            }

            const updateData: Partial<UserProfile> = {
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

            const { error } = await updateProfile(updateData);
            if (error) {
                setError(error.message);
            } else {
                setSuccess('Profil berhasil diperbarui!');
                setTimeout(() => {
                    setSuccess(null);
                    onClose();
                }, 1500);
            }
        } catch {
            setError('Terjadi kesalahan. Coba lagi nanti.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                            <User className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white">Profil Saya</h2>
                        <p className="text-indigo-100 text-sm mt-1">
                            Edit informasi data diri kamu
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                            <CheckCircle size={18} className="shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah</p>
                    </div>

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

                    {/* Two columns for Kelas & Angkatan */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Kelas */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Kelas
                            </label>
                            <div className="relative">
                                <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select aria-label="Pilih"
                                    value={kelas}
                                    onChange={(e) => setKelas(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">Pilih</option>
                                    {KELAS_OPTIONS.map(k => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Angkatan */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                Angkatan
                            </label>
                            <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select aria-label="Pilih"
                                    value={angkatan}
                                    onChange={(e) => setAngkatan(e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">Pilih</option>
                                    {ANGKATAN_OPTIONS.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Two columns for Phone & Instagram */}
                    <div className="grid grid-cols-2 gap-4">
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
                                    placeholder="08xxx"
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
                                    placeholder="username"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Target 1 */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold">
                            <Target size={16} />
                            <span>Target Pilihan 1</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Universitas
                                </label>
                                <input
                                    type="text"
                                    value={targetUniversity1}
                                    onChange={(e) => setTargetUniversity1(e.target.value)}
                                    placeholder="Contoh: UI"
                                    list="uni-suggestions"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Jurusan
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
                    </div>

                    {/* Target 2 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-amber-700 font-bold">
                            <Target size={16} />
                            <span>Target Pilihan 2</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
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
                                    Jurusan
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
                    </div>

                    {/* University suggestions */}
                    <datalist id="uni-suggestions">
                        {POPULAR_UNIVERSITIES.map(uni => (
                            <option key={uni} value={uni} />
                        ))}
                    </datalist>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfileModal;
