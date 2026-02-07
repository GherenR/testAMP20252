import React, { useState } from 'react';
import { X, Share2, Copy, Check, ChevronDown, Phone, Instagram } from 'lucide-react';
import { Mentor } from '../../types';
import {
    getComparisonShareUrl,
    getComparisonWhatsAppLink,
    generateComparisonWhatsAppMessage
} from '../../utils/comparisonUrl';

interface MentorComparisonModalProps {
    isOpen: boolean;
    mentors: Mentor[];
    onClose: () => void;
    onRemove: (mentorName: string) => void;
    onContact?: (mentor: Mentor) => void;
    onInstagram?: (handle: string) => void;
    onCopySuccess?: () => void;
}

/**
 * MentorComparisonModal Component
 * Modal untuk membandingkan 2-3 mentors secara side-by-side
 */
export const MentorComparisonModal: React.FC<MentorComparisonModalProps> = ({
    isOpen,
    mentors,
    onClose,
    onRemove,
    onContact,
    onInstagram,
    onCopySuccess
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    if (!isOpen || mentors.length === 0) return null;

    // Generate share URL dengan mentor slugs
    const shareUrl = getComparisonShareUrl(mentors);
    const whatsappLink = getComparisonWhatsAppLink(mentors);
    const whatsappMessage = generateComparisonWhatsAppMessage(mentors);

    const handleShareWhatsApp = () => {
        window.open(whatsappLink, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        onCopySuccess?.();
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-3 sm:px-4 overflow-y-auto py-4 sm:py-8">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl sm:rounded-[3rem] w-full max-w-5xl p-5 sm:p-8 md:p-12 shadow-2xl relative z-10 animate-reveal max-h-[90vh] overflow-y-auto">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-2 sm:h-3 bg-lime-400"></div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-slate-950 transition-colors p-1 hover:bg-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close modal"
                >
                    <X size={20} className="sm:hidden" />
                    <X size={32} className="hidden sm:block" />
                </button>

                {/* Header */}
                <div className="mb-6 sm:mb-10 pr-8">
                    <h3 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter mb-1 sm:mb-2 text-slate-950 uppercase">
                        Perbandingan Mentor
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Lihat perbedaan dari {mentors.length} mentor yang dipilih
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto mb-6 sm:mb-8">
                    <div className="grid gap-3 sm:gap-4 min-w-min sm:min-w-0" style={{ gridTemplateColumns: `repeat(${mentors.length}, minmax(200px, 1fr))` }}>
                        {mentors.map((mentor) => (
                            <div
                                key={mentor.name}
                                className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-slate-100 relative group overflow-visible"
                            >
                                {/* Remove button */}
                                <button
                                    onClick={() => onRemove(mentor.name)}
                                    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-300 hover:text-red-500 transition-colors p-1 hover:bg-slate-100 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                                    aria-label={`Hapus ${mentor.name}`}
                                >
                                    <X size={16} className="sm:hidden" />
                                    <X size={20} className="hidden sm:block" />
                                </button>

                                {/* Mentor Info */}
                                <div className="pr-6">
                                    <h4 className="font-bold text-slate-950 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg text-left leading-tight">
                                        {mentor.name}
                                    </h4>

                                    <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                                        {/* University */}
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">
                                                Universitas
                                            </p>
                                            <p className="text-slate-900 font-semibold text-xs sm:text-sm break-words">{mentor.university}</p>
                                        </div>

                                        {/* Major */}
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">
                                                Program Studi
                                            </p>
                                            <p className="text-slate-900 font-semibold text-xs sm:text-sm break-words">{mentor.major}</p>
                                        </div>

                                        {/* Path */}
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">
                                                Jalur Masuk
                                            </p>
                                            <p className="text-slate-900 font-semibold text-xs sm:text-sm break-words">{mentor.path}</p>
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">
                                                Institusi
                                            </p>
                                            <div className="inline-block">
                                                <span
                                                    className={`px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-xs font-bold ${mentor.category === 'PTN'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : mentor.category === 'PTS'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-purple-100 text-purple-700'
                                                        }`}
                                                >
                                                    {mentor.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Achievements */}
                                        {mentor.achievements && mentor.achievements.length > 0 && (
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-500 mb-1">Lulus=diterima • Pilihan=pernah daftar</p>
                                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2">
                                                    Pencapaian
                                                </p>
                                                <ul className="space-y-1 max-h-[100px] overflow-y-auto">
                                                    {mentor.achievements.slice(0, 3).map((achievement, idx) => (
                                                        <li key={idx} className="text-[9px] sm:text-[10px] text-slate-600 flex gap-1">
                                                            <span className="text-indigo-600 font-bold">•</span>
                                                            <span className="break-words">{achievement}</span>
                                                        </li>
                                                    ))}
                                                    {mentor.achievements.length > 3 && (
                                                        <li className="text-[8px] sm:text-[9px] font-black text-indigo-600">+{mentor.achievements.length - 3} lebih lagi</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Dropdown - Contact & Instagram */}
                                {(onContact || (onInstagram && mentor.instagram && mentor.instagram !== 'N/A')) && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 relative">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === mentor.name ? null : mentor.name)}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 min-h-[44px] touch-none"
                                            aria-expanded={openDropdown === mentor.name}
                                            aria-haspopup="true"
                                        >
                                            <span>Hubungi Alumni</span>
                                            <ChevronDown size={16} className={`transition-transform ${openDropdown === mentor.name ? 'rotate-180' : ''}`} />
                                        </button>
                                        {openDropdown === mentor.name && (
                                            <>
                                                <div className="fixed inset-0 z-[199]" onClick={() => setOpenDropdown(null)} aria-hidden="true" />
                                                <div className="absolute left-0 right-0 top-full mt-1 z-[201] bg-white rounded-xl border-2 border-slate-200 shadow-xl py-2 overflow-hidden">
                                                    {onContact && (
                                                        <button
                                                            onClick={() => { onContact(mentor); setOpenDropdown(null); onClose(); }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left text-sm font-bold text-slate-800 transition-colors"
                                                        >
                                                            <Phone size={18} className="text-green-600" />
                                                            Contact via WhatsApp
                                                        </button>
                                                    )}
                                                    {onInstagram && mentor.instagram && mentor.instagram !== 'N/A' && (
                                                        <button
                                                            onClick={() => { onInstagram(mentor.instagram!); setOpenDropdown(null); }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left text-sm font-bold text-slate-800 transition-colors"
                                                        >
                                                            <Instagram size={18} className="text-pink-600" />
                                                            Instagram @{mentor.instagram}
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:gap-3">
                    {/* Share WhatsApp Button */}
                    <button
                        onClick={handleShareWhatsApp}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 sm:py-5 rounded-lg sm:rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg active:scale-95 min-h-[44px]"
                        title="Bagikan perbandingan ke WhatsApp"
                    >
                        <Share2 size={18} /> Share ke WhatsApp
                    </button>

                    {/* Copy Link Button */}
                    <button
                        onClick={handleCopyLink}
                        className={`w-full py-4 sm:py-5 rounded-lg sm:rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg active:scale-95 min-h-[44px] ${isCopied
                            ? 'bg-green-500 text-white'
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                        title="Salin link perbandingan"
                    >
                        {isCopied ? (
                            <>
                                <Check size={18} /> Link Disalin!
                            </>
                        ) : (
                            <>
                                <Copy size={18} /> Salin Link Perbandingan
                            </>
                        )}
                    </button>

                    {/* URL Preview */}
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            URL Share:
                        </p>
                        <p className="text-[10px] sm:text-xs font-mono text-slate-700 break-all line-clamp-2">
                            {shareUrl}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-100 text-slate-900 py-4 sm:py-5 rounded-lg sm:rounded-2xl font-bold text-sm sm:text-base hover:bg-slate-200 transition-all shadow-lg active:scale-95 min-h-[44px]"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};
