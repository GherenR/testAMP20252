import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { getAllMentors, MentorDB } from '../mentorService';
import { Mail, Send, FileText, Users, Filter, Check, AlertCircle, Copy, Loader2 } from 'lucide-react';

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

Terima kasih sudah bersedia menjadi mentor untuk adik-adik kita. Data kamu sudah tercatat:
- Universitas: {university}
- Jurusan: {major}
- Angkatan: {angkatan}

Adik-adik yang tertarik bisa menghubungi kamu melalui WhatsApp.

Jika ada perubahan data, silakan hubungi admin.

Salam hangat,
Tim AMP IKAHATA`
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
Tim AMP IKAHATA`
    },
    {
        id: 'reminder',
        name: 'Mentor Reminder',
        subject: 'Reminder: Kamu adalah Mentor AMP! 📚',
        body: `Halo {name}!

Ini reminder bahwa kamu terdaftar sebagai mentor di Alumni Mentorship Project IKAHATA.

Jangan lupa untuk membalas pesan dari adik-adik yang menghubungi ya! 💪

Terima kasih sudah menjadi bagian dari program ini.

Salam,
Tim AMP IKAHATA`
    },
    {
        id: 'custom',
        name: 'Custom Message',
        subject: '',
        body: ''
    }
];

export default function EmailPage() {
    const [mentors, setMentors] = useState<MentorDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(DEFAULT_TEMPLATES[0]);
    const [customSubject, setCustomSubject] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterAngkatan, setFilterAngkatan] = useState<string>('All');
    const [filterHasEmail, setFilterHasEmail] = useState(true);

    // Preview
    const [previewMentor, setPreviewMentor] = useState<MentorDB | null>(null);

    useEffect(() => {
        loadMentors();
    }, []);

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
            .replace(/{email}/g, mentor.email || '')
            .replace(/{whatsapp}/g, mentor.whatsapp || '');
    };

    const getEmailSubject = (): string => {
        if (selectedTemplate.id === 'custom') return customSubject;
        return selectedTemplate.subject;
    };

    const getEmailBody = (): string => {
        if (selectedTemplate.id === 'custom') return customBody;
        return selectedTemplate.body;
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

    const openMailClient = (mentor: MentorDB) => {
        const subject = encodeURIComponent(replacePlaceholders(getEmailSubject(), mentor));
        const body = encodeURIComponent(replacePlaceholders(getEmailBody(), mentor));
        window.open(`mailto:${mentor.email}?subject=${subject}&body=${body}`, '_blank');
    };

    const openBulkMail = () => {
        const emails = filteredMentors
            .filter(m => m.email)
            .map(m => m.email)
            .join(',');
        const subject = encodeURIComponent(getEmailSubject().replace(/{name}/g, 'Rekan Mentor'));
        const body = encodeURIComponent(getEmailBody()
            .replace(/{name}/g, 'Rekan Mentor')
            .replace(/{university}/g, '[Universitas]')
            .replace(/{major}/g, '[Jurusan]')
            .replace(/{angkatan}/g, '[Angkatan]'));
        window.open(`mailto:${emails}?subject=${subject}&body=${body}`, '_blank');
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
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-900/50 border border-green-500'
                                : 'bg-red-900/50 border border-red-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Template Editor */}
                        <div className="space-y-4">
                            {/* Template Selection */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <label className="block text-sm text-slate-400 mb-2">Template</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DEFAULT_TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t)}
                                            className={`p-3 rounded-lg text-left transition ${selectedTemplate.id === t.id
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

                            {/* Subject */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <label className="block text-sm text-slate-400 mb-2">Subject</label>
                                {selectedTemplate.id === 'custom' ? (
                                    <input
                                        type="text"
                                        value={customSubject}
                                        onChange={e => setCustomSubject(e.target.value)}
                                        placeholder="Masukkan subject email..."
                                        className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                    />
                                ) : (
                                    <p className="px-3 py-2 bg-slate-700/50 rounded">{selectedTemplate.subject}</p>
                                )}
                            </div>

                            {/* Body */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <label className="block text-sm text-slate-400 mb-2">Body</label>
                                {selectedTemplate.id === 'custom' ? (
                                    <textarea
                                        value={customBody}
                                        onChange={e => setCustomBody(e.target.value)}
                                        placeholder="Masukkan isi email... Gunakan {name}, {university}, {major}, {angkatan} untuk placeholder"
                                        rows={10}
                                        className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 font-mono text-sm"
                                    />
                                ) : (
                                    <pre className="px-3 py-2 bg-slate-700/50 rounded whitespace-pre-wrap text-sm font-mono">
                                        {selectedTemplate.body}
                                    </pre>
                                )}
                                <p className="text-xs text-slate-500 mt-2">
                                    Placeholders: {'{name}'}, {'{university}'}, {'{major}'}, {'{angkatan}'}, {'{email}'}, {'{whatsapp}'}
                                </p>
                            </div>
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
                                <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users size={18} className="text-blue-400" />
                                        <span className="font-semibold">{filteredMentors.filter(m => m.email).length}</span>
                                        <span className="text-slate-400">penerima dengan email</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <h2 className="text-lg font-semibold mb-3">Aksi</h2>
                                <div className="space-y-2">
                                    <button
                                        onClick={copyEmailList}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                    >
                                        <Copy size={18} />
                                        Copy Semua Email
                                    </button>
                                    <button
                                        onClick={openBulkMail}
                                        disabled={filteredMentors.filter(m => m.email).length === 0}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition"
                                    >
                                        <Send size={18} />
                                        Buka Mail Client (Bulk)
                                    </button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-800 rounded-xl p-4">
                                <h2 className="text-lg font-semibold mb-3">Preview</h2>
                                <select
                                    onChange={e => {
                                        const mentor = filteredMentors.find(m => m.id === Number(e.target.value));
                                        setPreviewMentor(mentor || null);
                                    }}
                                    className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 mb-3"
                                >
                                    <option value="">Pilih mentor untuk preview...</option>
                                    {filteredMentors.slice(0, 20).map(m => (
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
                                                {replacePlaceholders(getEmailSubject(), previewMentor)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">Body:</span>
                                            <pre className="text-sm whitespace-pre-wrap mt-1 text-slate-300">
                                                {replacePlaceholders(getEmailBody(), previewMentor)}
                                            </pre>
                                        </div>
                                        {previewMentor.email && (
                                            <button
                                                onClick={() => openMailClient(previewMentor)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                                            >
                                                <Send size={16} />
                                                Kirim ke {previewMentor.name}
                                            </button>
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
