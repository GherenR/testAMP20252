import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import { getAllMentors, MentorDB } from '../mentorService';
import { Download, FileSpreadsheet, FileText, Loader2, Check, Filter } from 'lucide-react';

export default function ExportPage() {
    const [mentors, setMentors] = useState<MentorDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterAngkatan, setFilterAngkatan] = useState<string>('All');
    const [filterUniversity, setFilterUniversity] = useState<string>('All');

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
    const universities = ['All', ...new Set(mentors.map(m => m.university))].sort();

    // Filter mentors
    const filteredMentors = mentors.filter(m => {
        if (filterCategory !== 'All' && m.category !== filterCategory) return false;
        if (filterAngkatan !== 'All' && String(m.angkatan) !== filterAngkatan) return false;
        if (filterUniversity !== 'All' && m.university !== filterUniversity) return false;
        return true;
    });

    const exportToCSV = () => {
        setExporting(true);
        try {
            const headers = ['Nama', 'Universitas', 'Jurusan', 'Jalur', 'Kategori', 'Angkatan', 'WhatsApp', 'Instagram', 'Email', 'Prestasi'];
            const rows = filteredMentors.map(m => [
                m.name,
                m.university,
                m.major,
                m.path,
                m.category,
                m.angkatan,
                m.whatsapp || '',
                m.instagram || '',
                m.email || '',
                (m.achievements || []).join('; ')
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mentor_data_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: `✅ Berhasil export ${filteredMentors.length} data ke CSV` });
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Gagal export data' });
        }
        setExporting(false);
        setTimeout(() => setMessage(null), 3000);
    };

    const exportToJSON = () => {
        setExporting(true);
        try {
            const jsonContent = JSON.stringify(filteredMentors, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mentor_data_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: `✅ Berhasil export ${filteredMentors.length} data ke JSON` });
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Gagal export data' });
        }
        setExporting(false);
        setTimeout(() => setMessage(null), 3000);
    };

    const exportForWhatsApp = () => {
        setExporting(true);
        try {
            const lines = filteredMentors
                .filter(m => m.whatsapp)
                .map(m => `${m.name} - ${m.university} - ${m.whatsapp}`);

            const content = lines.join('\n');
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `whatsapp_contacts_${new Date().toISOString().split('T')[0]}.txt`;
            link.click();
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: `✅ Berhasil export ${lines.length} kontak WhatsApp` });
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Gagal export data' });
        }
        setExporting(false);
        setTimeout(() => setMessage(null), 3000);
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
                        <Download size={28} /> Export Data
                    </h1>

                    {message && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-900/50 border border-green-500'
                                : 'bg-red-900/50 border border-red-500'
                            }`}>
                            {message.type === 'success' ? <Check size={20} /> : null}
                            {message.text}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-slate-800 rounded-xl p-4 mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <Filter size={20} /> Filter Data
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Universitas</label>
                                <select
                                    value={filterUniversity}
                                    onChange={e => setFilterUniversity(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600"
                                >
                                    {universities.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-400">
                            Menampilkan <span className="text-white font-bold">{filteredMentors.length}</span> dari {mentors.length} mentor
                        </p>
                    </div>

                    {/* Export Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={exportToCSV}
                            disabled={exporting || filteredMentors.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl p-6 text-left transition"
                        >
                            <FileSpreadsheet size={40} className="text-green-400 mb-3" />
                            <h3 className="text-lg font-bold">Export ke CSV</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Format spreadsheet, bisa dibuka di Excel/Google Sheets
                            </p>
                        </button>

                        <button
                            onClick={exportToJSON}
                            disabled={exporting || filteredMentors.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl p-6 text-left transition"
                        >
                            <FileText size={40} className="text-blue-400 mb-3" />
                            <h3 className="text-lg font-bold">Export ke JSON</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Format data lengkap untuk backup atau integrasi
                            </p>
                        </button>

                        <button
                            onClick={exportForWhatsApp}
                            disabled={exporting || filteredMentors.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-xl p-6 text-left transition"
                        >
                            <Download size={40} className="text-emerald-400 mb-3" />
                            <h3 className="text-lg font-bold">Export Kontak WA</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Daftar nama dan nomor WhatsApp saja
                            </p>
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="mt-6 bg-slate-800 rounded-xl p-4">
                        <h2 className="text-lg font-semibold mb-4">Preview Data ({filteredMentors.length} mentor)</h2>
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full text-sm">
                                <thead className="sticky top-0 bg-slate-800">
                                    <tr className="text-left text-slate-400 border-b border-slate-700">
                                        <th className="p-2">Nama</th>
                                        <th className="p-2">Universitas</th>
                                        <th className="p-2">Jurusan</th>
                                        <th className="p-2">Kategori</th>
                                        <th className="p-2">Angkatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMentors.slice(0, 20).map(m => (
                                        <tr key={m.id} className="border-b border-slate-700/50">
                                            <td className="p-2">{m.name}</td>
                                            <td className="p-2">{m.university}</td>
                                            <td className="p-2">{m.major}</td>
                                            <td className="p-2">{m.category}</td>
                                            <td className="p-2">{m.angkatan}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredMentors.length > 20 && (
                                <p className="text-center text-slate-400 py-2">... dan {filteredMentors.length - 20} lainnya</p>
                            )}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </RequireAdmin>
    );
}
