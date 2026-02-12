import React, { useState } from 'react';
import { X, MessageSquareWarning, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    meta?: any; // Extra data like soal_id, subtes, etc.
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, meta }) => {
    const [type, setType] = useState('soal');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        setStatus('idle');

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.from('user_reports').insert({
                user_id: user?.id,
                type,
                description,
                url: window.location.href,
                metadata: meta,
                status: 'open',
                created_at: new Date().toISOString()
            });

            if (error) throw error;
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setDescription('');
            }, 2000);
        } catch (err) {
            console.error('Report failed:', err);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquareWarning size={20} className="text-amber-500" />
                        Lapor Masalah
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Terima Kasih!</h4>
                            <p className="text-slate-500">Laporan Anda telah kami terima dan akan segera ditinjau.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Jenis Masalah</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['soal', 'bug', 'feedback'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${type === t
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {t === 'soal' ? 'Soal Error' : t === 'bug' ? 'Sistem Error' : 'Masukan'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Deskripsi</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder={type === 'soal' ? "Contoh: Gambar tidak muncul, atau kunci jawaban salah..." : "Jelaskan detail masalahnya..."}
                                    className="w-full h-32 p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
                                    required
                                />
                            </div>

                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} /> Gagal mengirim laporan. Coba lagi.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || !description.trim()}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Kirim Laporan
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportIssueModal;
