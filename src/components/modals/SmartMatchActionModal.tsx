import React from 'react';
import { X, Phone, BookOpen, ArrowRight } from 'lucide-react';
import { Mentor } from '../../types';

interface SmartMatchActionModalProps {
    mentor: Mentor | null;
    isOpen: boolean;
    onClose: () => void;
    onContact?: (mentor: Mentor) => void;
    onViewDetail?: (mentor: Mentor) => void;
    alumniId?: string;
}

/**
 * SmartMatchActionModal Component
 * Modal untuk Smart Match yang memberikan pilihan:
 * - Hubungi via WhatsApp
 * - Lihat Profile Detail Lengkap
 * 
 * Didesain untuk mobile-first dengan touch targets 44px+
 */
export const SmartMatchActionModal: React.FC<SmartMatchActionModalProps> = ({
    mentor,
    isOpen,
    onClose,
    onContact,
    onViewDetail,
    alumniId
}) => {
    if (!isOpen || !mentor) return null;

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`;

    const handleContact = () => {
        onContact?.(mentor);
        onClose();
    };

    const handleViewDetail = () => {
        onViewDetail?.(mentor);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Modal Card - Full width on mobile, centered on desktop */}
            <div className="w-full sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
                {/* Header dengan Close Button */}
                <div className="sticky top-0 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 flex items-center justify-between text-white rounded-t-[2.5rem]">
                    <h3 className="text-xl font-black tracking-tighter">Lanjutkan dengan</h3>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/20 rounded-xl transition-colors touch-none active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Tutup modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Mentor Info */}
                <div className="p-6 space-y-6">
                    {/* Mentor Card Preview */}
                    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                        <img
                            src={avatarUrl}
                            alt={mentor.name}
                            className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-black text-slate-950 line-clamp-2">{mentor.name}</h4>
                            <p className="text-xs text-slate-500 font-bold mt-1">
                                {mentor.university} • {mentor.major}
                            </p>
                            {alumniId && (
                                <p className="text-xs text-indigo-600 font-black mt-2">{alumniId}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons - Stack on mobile, row on larger screens */}
                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                        {/* Contact WhatsApp Button */}
                        <button
                            onClick={handleContact}
                            className="w-full px-4 py-5 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-base sm:text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg touch-none min-h-[56px] sm:min-h-[44px]"
                        >
                            <Phone size={20} />
                            <span>Chat WhatsApp</span>
                        </button>

                        {/* View Detail Button */}
                        <button
                            onClick={handleViewDetail}
                            className="w-full px-4 py-5 sm:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base sm:text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg touch-none min-h-[56px] sm:min-h-[44px]"
                        >
                            <BookOpen size={20} />
                            <span>Lihat Profile</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative py-4">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200"></div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs text-slate-400 font-bold">atau</span>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-5 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-base sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 touch-none min-h-[56px] sm:min-h-[44px]"
                    >
                        <ArrowRight size={20} />
                        <span>Lihat Mentor Lain</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
