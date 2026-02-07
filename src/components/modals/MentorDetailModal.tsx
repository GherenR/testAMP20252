import React from 'react';
import { X, Sparkles, Instagram, Phone, ArrowUpRight } from 'lucide-react';
import { Mentor } from '../../types';

interface MentorDetailModalProps {
    mentor: Mentor | null;
    isOpen: boolean;
    onClose: () => void;
    onContact?: (mentor: Mentor) => void;
    alumniId?: string;
    similarMentors?: Mentor[];
    onViewSimilar?: (mentor: Mentor) => void;
    getAlumniId?: (mentor: Mentor) => string;
}

/**
 * MentorDetailModal Component
 * Menampilkan profil detail mentor dalam modal full-screen
 * Digunakan untuk viewing dari Smart Match results
 */
export const MentorDetailModal: React.FC<MentorDetailModalProps> = ({
    mentor,
    isOpen,
    onClose,
    onContact,
    alumniId,
    similarMentors = [],
    onViewSimilar,
    getAlumniId
}) => {
    if (!isOpen || !mentor) return null;

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.name}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 sm:p-8 flex items-center justify-between rounded-t-[2.5rem] text-white">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">Profil Mentor</h2>
                        {alumniId && <p className="text-indigo-200 text-sm font-bold mt-1">{alumniId}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <img
                            src={avatarUrl}
                            alt={mentor.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-3 border-indigo-100"
                        />
                        <div className="flex-1">
                            <h3 className="text-3xl font-black text-slate-950 mb-2">{mentor.name}</h3>
                            <p className="text-lg text-slate-600 font-bold mb-4">
                                {mentor.university} • {mentor.major}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-4 py-2 bg-slate-950 text-white rounded-lg text-xs font-black uppercase">
                                    {mentor.path}
                                </span>
                                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black uppercase">
                                    {mentor.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-lime-600" size={20} />
                            <h4 className="text-lg font-black text-slate-950">Pencapaian & Riwayat</h4>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                            <p className="font-bold mb-1">Keterangan:</p>
                            <p><span className="font-black text-green-700">Lulus:</span> Diterima dan berkuliah di PT tersebut</p>
                            <p><span className="font-black text-slate-600">Pilihan/Daftar:</span> Pernah mendaftar (pilihan SNBP/SNBT) — belum tentu lolos</p>
                        </div>
                        <div className="bg-lime-50 border-2 border-lime-200 rounded-2xl p-6 space-y-3">
                            {mentor.achievements && mentor.achievements.length > 0 ? (
                                mentor.achievements.map((ach, idx) => (
                                    <div key={idx} className="flex gap-3 items-start">
                                        <span className="text-lime-600 font-black text-lg">✓</span>
                                        <p className="text-sm text-slate-700 leading-relaxed">{ach}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-600 italic">Mentor siap membimbing dengan pengalaman yang berharga</p>
                            )}
                        </div>
                    </div>

                    {/* Alumni Serupa */}
                    {similarMentors.length > 0 && onViewSimilar && (
                        <div className="space-y-3">
                            <h4 className="text-lg font-black text-slate-950">Alumni Serupa</h4>
                            <p className="text-xs text-slate-500">Jurusan atau universitas sama — bisa jadi pilihan lain</p>
                            <div className="flex flex-wrap gap-3">
                                {similarMentors.slice(0, 3).map((m) => (
                                    <button
                                        key={m.name}
                                        onClick={() => { onViewSimilar(m); onClose(); }}
                                        className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-200 rounded-2xl transition-all text-left group"
                                    >
                                        <img
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                                            alt={m.name}
                                            className="w-12 h-12 rounded-xl"
                                        />
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-indigo-600">{m.name}</p>
                                            <p className="text-xs text-slate-500">{m.university} • {m.major}</p>
                                        </div>
                                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-600 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {mentor.whatsapp && (
                            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp</p>
                                <p className="text-sm font-bold text-slate-700 break-all">{mentor.whatsapp}</p>
                            </div>
                        )}
                        {mentor.instagram && mentor.instagram !== 'N/A' && (
                            <div className="bg-gradient-to-br from-yellow-50 to-purple-50 rounded-2xl p-4 border-2 border-purple-100">
                                <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2">Instagram</p>
                                <p className="text-sm font-bold text-purple-700">@{mentor.instagram}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-slate-100">
                        <button
                            onClick={() => {
                                onContact?.(mentor);
                                onClose();
                            }}
                            className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
                        >
                            <Phone size={20} />
                            Hubungi Sekarang
                        </button>
                        {mentor.instagram && mentor.instagram !== 'N/A' && (
                            <button
                                onClick={() => window.open(`https://instagram.com/${mentor.instagram}`, '_blank')}
                                className="flex-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:shadow-lg active:scale-95 transition-all"
                            >
                                <Instagram size={20} />
                                Instagram
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
