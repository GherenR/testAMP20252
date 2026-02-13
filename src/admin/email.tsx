import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { getAllMentors, MentorDB } from '../mentorService';
import { Mail, Send, FileText, Users, Filter, Check, AlertCircle, Copy, Loader2, Edit, RefreshCw, ExternalLink } from 'lucide-react';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
        id: 'welcome',
        name: 'Welcome Message',
        subject: 'Selamat Bergabung di Alumni Mentorship Project! 🎉',
        body: `Halo {name}! 👋

Selamat datang di Alumni Mentorship Project (AMP) IKAHATA!

Terima kasih sudah bersedia menjadi mentor untuk adik-adik kita. Data kamu sudah tercatat di database kami:
- Universitas: {university}
- Jurusan: {major}
- Angkatan: {angkatan}
- Kategori: {category}
- WhatsApp: {whatsapp}
- Instagram: @{instagram}

Data lengkap kamu, termasuk riwayat pengalaman dan prestasi, sudah dapat dilihat publik di:
https://alumnihangtuah2025.vercel.app/database

Cari nama kamu sendiri untuk memastikan semua informasi sudah benar. Jika ada data yang salah, ingin update prestasi/pengalaman, atau perlu diperbaiki, silakan hubungi admin (Gheren atau Faisal).

Adik-adik yang tertarik bisa menghubungi kamu melalui WhatsApp.

Salam hangat,
IKAHATA`
    },
    {
        id: 'update',
        name: 'Update Data Request',
        subject: 'Mohon Update Data Mentor AMP',
        body: `Halo {name}!

Kami ingin memastikan data kamu di AMP masih akurat:
- Universitas: {university}
- Jurusan: {major}
- Angkatan: {angkatan}

Jika ada perubahan (kontak, status, dll), mohon balas email ini atau hubungi admin.

Terima kasih atas kerjasamanya!

Salam,
IKAHATA`
    },
    {
        id: 'reminder',
        name: 'Mentor Reminder',
        subject: 'Reminder: Kamu adalah Mentor AMP! 📚',
        body: `Halo {name}! 👋

Ini reminder bahwa kamu terdaftar sebagai mentor di Alumni Mentorship Project IKAHATA.

Jangan lupa untuk membalas pesan dari adik-adik yang menghubungi ya! 💪

Terima kasih sudah menjadi bagian dari program ini.

Salam,
IKAHATA`
    },
    {
        id: 'custom',
        name: 'Custom Message',
        subject: 'Pesan dari AMP IKAHATA',
        body: `Halo {name}!

[Tulis pesan kamu di sini]

Salam,
IKAHATA`
    }
];

export default function EmailPage() {
    const [mentors, setMentors] = useState<MentorDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome');

    // Editable subject and body (applies to any template)
    const [editSubject, setEditSubject] = useState(DEFAULT_TEMPLATES[0].subject);
    const [editBody, setEditBody] = useState(DEFAULT_TEMPLATES[0].body);

    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterAngkatan, setFilterAngkatan] = useState<string>('All');
    const [filterHasEmail, setFilterHasEmail] = useState(true);

    // Selected mentors for sending
    const [selectedMentorIds, setSelectedMentorIds] = useState<Set<number>>(new Set());

    // Preview
    const [previewMentor, setPreviewMentor] = useState<MentorDB | null>(null);

    // Send progress
    const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; errors: string[] } | null>(null);

    useEffect(() => {
        loadMentors();
    }, []);

    // When template changes, update editable fields
    const handleTemplateChange = (templateId: string) => {
        const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplateId(templateId);
            setEditSubject(template.subject);
            setEditBody(template.body);
        }
    };

    const loadMentors = async () => {
        const { data } = await getAllMentors();
        if (data) setMentors(data);
        setLoading(false);
    };

    // Get unique values for filters
    const categories = ['All', ...new Set(mentors.map(m => m.category))];
    const angkatans = ['All', ...new Set(mentors.map(m => String(m.angkatan)))].sort();

    // Filter mentors
    const filteredMentors = mentors.filter(m => {
        if (filterCategory !== 'All' && m.category !== filterCategory) return false;
        if (filterAngkatan !== 'All' && String(m.angkatan) !== filterAngkatan) return false;
        if (filterHasEmail && !m.email) return false;
        return true;
    });

    // Replace placeholders in template
    const replacePlaceholders = (text: string, mentor: MentorDB): string => {
        return text
            .replace(/{name}/g, mentor.name)
            .replace(/{university}/g, mentor.university)
            .replace(/{major}/g, mentor.major)
            .replace(/{angkatan}/g, String(mentor.angkatan))
            .replace(/{whatsapp}/g, mentor.whatsapp || '')
            .replace(/{instagram}/g, mentor.instagram || '')
            .replace(/{category}/g, mentor.category || '');
    };

    const copyEmailList = () => {
        const emails = filteredMentors
            .filter(m => m.email)
            .map(m => m.email)
            .join(', ');
        navigator.clipboard.writeText(emails);
        setMessage({ type: 'success', text: `✅ ${filteredMentors.filter(m => m.email).length} email disalin ke clipboard` });
        setTimeout(() => setMessage(null), 3000);
    };

    const copyEmailContent = (mentor: MentorDB) => {
        const content = `To: ${mentor.email}\nSubject: ${replacePlaceholders(editSubject, mentor)}\n\n${replacePlaceholders(editBody, mentor)}`;
        navigator.clipboard.writeText(content);
        setMessage({ type: 'success', text: `✅ Email content copied for ${mentor.name}` });
        setTimeout(() => setMessage(null), 3000);
    };

    // Open Gmail compose (more reliable than mailto:)
    const openGmailCompose = (mentor: MentorDB) => {
        const subject = encodeURIComponent(replacePlaceholders(editSubject, mentor));
        const body = encodeURIComponent(replacePlaceholders(editBody, mentor));
        const to = encodeURIComponent(mentor.email || '');
        window.open(`https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`, '_blank');
    };

    // Send email via API
    const sendEmailDirect = async (mentor: MentorDB): Promise<boolean> => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: mentor.email,
                    subject: replacePlaceholders(editSubject, mentor),
                    body: replacePlaceholders(editBody, mentor)
                })
            });

            let data: any = {};
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (e) {
                    console.error('Failed to parse JSON error response:', e);
                }
            } else {
                const text = await response.text();
                console.warn('Received non-JSON response:', text.substring(0, 100));
            }

            if (!response.ok) {
                const errorMsg = data.message || data.error || `Server error (${response.status})`;
                throw new Error(errorMsg);
            }

            return true;
        } catch (error: any) {
            console.error('Send error:', error);
            throw error;
        }
    };

    // Send to single mentor
    const sendToMentor = async (mentor: MentorDB) => {
        if (!mentor.email) {
            setMessage({ type: 'error', text: `❌ ${mentor.name} tidak punya email` });
            return;
        }

        setSending(true);
        try {
            await sendEmailDirect(mentor);
            setMessage({ type: 'success', text: `✅ Email berhasil dikirim ke ${mentor.name}` });
        } catch (error: any) {
            // If API not configured, offer Gmail as alternative
            if (error.message?.includes('configured')) {
                setMessage({
                    type: 'info',
                    text: `⚠️ Email API belum dikonfigurasi. Hubungi Admin untuk menset GMAIL_USER atau RESEND_API_KEY.`
                });
            } else if (error.message?.includes('limit reached')) {
                setMessage({
                    type: 'error',
                    text: `🚫 Limit email harian tercapai (100/hari). Silakan coba lagi besok.`
                });
            } else {
                setMessage({ type: 'error', text: `❌ Gagal kirim ke ${mentor.name}: ${error.message}` });
            }
        }
        setSending(false);
        setTimeout(() => setMessage(null), 5000);
    };

    // Bulk send to selected mentors
    const sendBulkEmail = async () => {
        const selectedMentors = filteredMentors.filter(m => selectedMentorIds.has(m.id) && m.email);

        if (selectedMentors.length === 0) {
            setMessage({ type: 'error', text: '❌ Pilih minimal 1 mentor dengan email' });
            return;
        }

        if (!window.confirm(`Kirim email ke ${selectedMentors.length} mentor?`)) return;

        setSending(true);
        setSendProgress({ sent: 0, total: selectedMentors.length, errors: [] });

        const errors: string[] = [];
        let sent = 0;

        for (const mentor of selectedMentors) {
            try {
                await sendEmailDirect(mentor);
                sent++;
            } catch (error: any) {
                const errorMsg = error.message || 'Unknown error';
                errors.push(`${mentor.name}: ${errorMsg}`);

                // Check for fatal errors (case-insensitive)
                const lowerMsg = errorMsg.toLowerCase();

                if (lowerMsg.includes('configured')) {
                    setMessage({
                        type: 'info',
                        text: `⚠️ Email API belum dikonfigurasi. Pastikan GMAIL_USER atau RESEND_API_KEY sudah diset di Vercel.`
                    });
                    setSending(false);
                    return;
                }

                if (lowerMsg.includes('limit reached')) {
                    setMessage({
                        type: 'error',
                        text: `🚫 Limit email harian tercapai. Terkirim: ${sent}, Gagal: ${selectedMentors.length - sent}`
                    });
                    setSending(false);
                    return;
                }

                // If Gmail specifically fails, we stop to avoid further blocks
                if (lowerMsg.includes('gmail error')) {
                    setMessage({
                        type: 'error',
                        text: `❌ Error pada Gmail: ${errorMsg}. Pengiriman dihentikan.`
                    });
                    setSending(false);
                    return;
                }
            }
            setSendProgress({ sent, total: selectedMentors.length, errors });

            // Small delay to avoid rate limiting and spam filters (burst detection)
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        setSending(false);

        if (errors.length === 0) {
            setMessage({ type: 'success', text: `✅ Berhasil kirim ${sent} email!` });
        } else {
            setMessage({ type: 'error', text: `⚠️ Terkirim: ${sent}, Gagal: ${errors.length}` });
        }

        setSelectedMentorIds(new Set());
        setTimeout(() => {
            setMessage(null);
            setSendProgress(null);
        }, 5000);
    };

    const toggleSelectMentor = (id: number) => {
        const newSet = new Set(selectedMentorIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedMentorIds(newSet);
    };

    const selectAllFiltered = () => {
        const emailMentors = filteredMentors.filter(m => m.email);
        if (selectedMentorIds.size === emailMentors.length) {
            setSelectedMentorIds(new Set());
        } else {
            setSelectedMentorIds(new Set(emailMentors.map(m => m.id)));
        }
    };

    if (loading) {
        return (
            <RequireAdmin>
                <DashboardLayout>
                    <div className="p-6 flex items-center justify-center">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                </DashboardLayout>
            </RequireAdmin>
        );
    }

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
                        <Mail size={28} /> Email Template & Send
                    </h1>

                    {message && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-900/50 border border-green-500' :
                            message.type === 'error' ? 'bg-red-900/50 border border-red-500' :
                                'bg-blue-900/50 border border-blue-500'
                            }`}>
                            {message.type === 'success' && <Check size={20} />}
                            {message.type === 'error' && <AlertCircle size={20} />}
                            {message.type === 'info' && <AlertCircle size={20} />}
                            <span className="flex-1">{message.text}</span>
                        </div>
                    )}

                    {/* Send Progress */}
                    {sendProgress && (
                        <div className="mb-4 p-4 bg-indigo-900/50 border border-indigo-500 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="font-semibold">Mengirim: {sendProgress.sent}/{sendProgress.total}</span>
                                </div>
                                <span className="text-xs text-indigo-300">
                                    {Math.round((sendProgress.sent / sendProgress.total) * 100)}% Complete
                                </span>
                            </div>
                            <div className="bg-slate-700 rounded-full h-2 mb-4">
                                <div
                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                                />
                            </div>

                            {/* Real-time Error Log */}
                            {sendProgress.errors.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-indigo-500/30">
                                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold mb-2">
                                        <AlertCircle size={14} /> Gagal Terkirim ({sendProgress.errors.length}):
                                    </div>
                                    <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                                        {sendProgress.errors.map((err, idx) => (
                                            <div key={idx} className="text-xs bg-red-900/20 border border-red-900/30 p-2 rounded text-red-300 flex items-start gap-2 animate-fadeIn">
                                                <span className="opacity-50">•</span>
                                                <span>{err}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Template Editor */}
                        <div className="space-y-4">
                            {/* Template Selection */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <label className="block text-sm text-slate-400 mb-2">Template (pilih untuk load)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DEFAULT_TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleTemplateChange(t.id)}
                                            className={`p-3 rounded-lg text-left transition ${selectedTemplateId === t.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-700 hover:bg-slate-600'
                                                }`}
                                        >
                                            <FileText size={18} className="mb-1" />
                                            <span className="text-sm">{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Editable Subject */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                                    <Edit size={14} /> Subject (bisa diedit)
                                </label>
                                <input
                                    type="text"
                                    value={editSubject}
                                    onChange={e => setEditSubject(e.target.value)}
                                    placeholder="Subject email..."
                                    className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            {/* Editable Body */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-2">
                                    <Edit size={14} /> Body (bisa diedit)
                                </label>
                                <textarea
                                    value={editBody}
                                    onChange={e => setEditBody(e.target.value)}
                                    placeholder="Isi email... Gunakan {name}, {university}, {major}, {angkatan} untuk placeholder"
                                    rows={12}
                                    className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 focus:border-indigo-500 outline-none font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Placeholders: {'{name}'}, {'{university}'}, {'{major}'}, {'{angkatan}'}, {'{email}'}, {'{whatsapp}'}
                                </p>
                            </div>

                            {/* Reset Template Button */}
                            <button
                                onClick={() => handleTemplateChange(selectedTemplateId)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                            >
                                <RefreshCw size={16} /> Reset ke Template Asli
                            </button>
                        </div>

                        {/* Right: Recipients & Preview */}
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                                    <Filter size={20} /> Filter Penerima
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Kategori</label>
                                        <select
                                            value={filterCategory}
                                            onChange={e => setFilterCategory(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Angkatan</label>
                                        <select
                                            value={filterAngkatan}
                                            onChange={e => setFilterAngkatan(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                        >
                                            {angkatans.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 mt-3">
                                    <input
                                        type="checkbox"
                                        checked={filterHasEmail}
                                        onChange={e => setFilterHasEmail(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-400">Hanya yang punya email</span>
                                </label>
                            </div>

                            {/* Recipients List with Checkboxes */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Users size={20} /> Penerima ({filteredMentors.filter(m => m.email).length})
                                    </h2>
                                    <button
                                        onClick={selectAllFiltered}
                                        className="text-sm text-indigo-400 hover:text-indigo-300"
                                    >
                                        {selectedMentorIds.size === filteredMentors.filter(m => m.email).length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                    </button>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {filteredMentors.filter(m => m.email).slice(0, 50).map(m => (
                                        <label
                                            key={m.id}
                                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-700/50 ${selectedMentorIds.has(m.id) ? 'bg-indigo-900/30' : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMentorIds.has(m.id)}
                                                onChange={() => toggleSelectMentor(m.id)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm truncate flex-1">{m.name}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[120px]">{m.email}</span>
                                        </label>
                                    ))}
                                    {filteredMentors.filter(m => m.email).length > 50 && (
                                        <p className="text-xs text-slate-500 p-2">+{filteredMentors.filter(m => m.email).length - 50} lainnya...</p>
                                    )}
                                </div>

                                {selectedMentorIds.size > 0 && (
                                    <div className="mt-3 p-2 bg-indigo-900/30 rounded-lg text-sm">
                                        <strong>{selectedMentorIds.size}</strong> mentor dipilih
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <h2 className="text-lg font-semibold mb-3">Kirim Email</h2>
                                <div className="space-y-2">
                                    <button
                                        onClick={sendBulkEmail}
                                        disabled={sending || selectedMentorIds.size === 0}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold"
                                    >
                                        {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                        Kirim ke {selectedMentorIds.size} Mentor (Direct)
                                    </button>
                                    <p className="text-xs text-slate-500 text-center">
                                        Mendukung Gmail SMTP (Gratis) atau Resend API. Limit 100 email/hari.
                                    </p>
                                    <div className="border-t border-slate-700 my-3 pt-3">
                                        <p className="text-sm text-slate-400 mb-2">Alternatif (manual):</p>
                                        <button
                                            onClick={copyEmailList}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
                                        >
                                            <Copy size={16} />
                                            Copy Semua Alamat Email
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <h2 className="text-lg font-semibold mb-3">Preview & Kirim Satuan</h2>
                                <select
                                    onChange={e => {
                                        const mentor = filteredMentors.find(m => m.id === Number(e.target.value));
                                        setPreviewMentor(mentor || null);
                                    }}
                                    className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 mb-3"
                                >
                                    <option value="">Pilih mentor untuk preview...</option>
                                    {filteredMentors.slice(0, 30).map(m => (
                                        <option key={m.id} value={m.id}>{m.name} - {m.email || '(no email)'}</option>
                                    ))}
                                </select>

                                {previewMentor && (
                                    <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                                        <div>
                                            <span className="text-xs text-slate-500">To:</span>
                                            <p className="text-sm">{previewMentor.email || '(no email)'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">Subject:</span>
                                            <p className="text-sm font-semibold">
                                                {replacePlaceholders(editSubject, previewMentor)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">Body:</span>
                                            <pre className="text-sm whitespace-pre-wrap mt-1 text-slate-300 max-h-32 overflow-y-auto">
                                                {replacePlaceholders(editBody, previewMentor)}
                                            </pre>
                                        </div>
                                        {previewMentor.email && (
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => sendToMentor(previewMentor)}
                                                    disabled={sending}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition text-sm"
                                                >
                                                    <Send size={14} />
                                                    Kirim Direct
                                                </button>
                                                <button
                                                    onClick={() => openGmailCompose(previewMentor)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
                                                >
                                                    <ExternalLink size={14} />
                                                    Buka Gmail
                                                </button>
                                                <button
                                                    onClick={() => copyEmailContent(previewMentor)}
                                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                                    title="Copy content"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
