import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Eye, Save, X, Sparkles, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/admin/DashboardLayout';

interface Tryout {
    id: string;
    nama: string;
    deskripsi: string;
    tanggal_rilis: string;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    is_active: boolean;
}

interface GeneratedQuestion {
    subtes: string;
    nomor_soal: number;
    pertanyaan: string;
    opsi: string[];
    jawaban_benar: number;
    pembahasan: string;
}

const SUBTES_LIST = [
    { kode: 'penalaran-umum', nama: 'Penalaran Umum', jumlah: 30 },
    { kode: 'pengetahuan-pemahaman-umum', nama: 'Pengetahuan & Pemahaman Umum', jumlah: 20 },
    { kode: 'pemahaman-bacaan-menulis', nama: 'Pemahaman Bacaan & Menulis', jumlah: 20 },
    { kode: 'pengetahuan-kuantitatif', nama: 'Pengetahuan Kuantitatif', jumlah: 20 },
    { kode: 'literasi-indonesia', nama: 'Literasi Bahasa Indonesia', jumlah: 30 },
    { kode: 'literasi-inggris', nama: 'Literasi Bahasa Inggris', jumlah: 20 },
    { kode: 'penalaran-matematika', nama: 'Penalaran Matematika', jumlah: 20 },
];

const TryoutManagement: React.FC = () => {
    const [tryouts, setTryouts] = useState<Tryout[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);
    const [form, setForm] = useState({
        nama: '',
        deskripsi: '',
        tanggal_rilis: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        is_active: true
    });

    // AI Generation states
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedTryoutForGen, setSelectedTryoutForGen] = useState<Tryout | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generatingSubtes, setGeneratingSubtes] = useState<string | null>(null);
    const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, GeneratedQuestion[]>>({});
    const [expandedSubtes, setExpandedSubtes] = useState<string | null>(null);
    const [soalCounts, setSoalCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchTryouts();
    }, []);

    const fetchTryouts = async () => {
        const { data, error } = await supabase
            .from('tryouts')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setTryouts(data);
        setLoading(false);
    };

    // Fetch soal count for a tryout
    const fetchSoalCount = async (tryoutId: string) => {
        const { count } = await supabase
            .from('tryout_soal')
            .select('*', { count: 'exact', head: true })
            .eq('tryout_id', tryoutId);
        return count || 0;
    };

    // Generate questions using AI
    const generateQuestions = async (subtes: string, jumlah: number) => {
        setGeneratingSubtes(subtes);
        try {
            const response = await fetch('/api/generate-soal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subtes, jumlah: Math.min(jumlah, 10) }) // Max 10 at a time
            });

            if (!response.ok) {
                const err = await response.json();
                alert(`Error: ${err.error}`);
                return;
            }

            const data = await response.json();
            setGeneratedQuestions(prev => ({
                ...prev,
                [subtes]: [...(prev[subtes] || []), ...data.questions]
            }));
        } catch (error) {
            console.error('Generation error:', error);
            alert('Gagal generate soal. Pastikan API key sudah dikonfigurasi.');
        } finally {
            setGeneratingSubtes(null);
        }
    };

    // Save generated questions to database
    const saveGeneratedQuestions = async () => {
        if (!selectedTryoutForGen) return;

        setGenerating(true);
        try {
            const allQuestions: any[] = [];
            Object.entries(generatedQuestions).forEach(([subtes, questions]) => {
                questions.forEach((q, idx) => {
                    allQuestions.push({
                        tryout_id: selectedTryoutForGen.id,
                        subtes: q.subtes,
                        nomor_soal: idx + 1,
                        pertanyaan: q.pertanyaan,
                        opsi: q.opsi,
                        jawaban_benar: q.jawaban_benar,
                        pembahasan: q.pembahasan
                    });
                });
            });

            if (allQuestions.length === 0) {
                alert('Belum ada soal yang di-generate');
                return;
            }

            const { error } = await supabase.from('tryout_soal').insert(allQuestions);

            if (error) {
                console.error('Save error:', error);
                alert('Gagal menyimpan soal');
            } else {
                alert(`${allQuestions.length} soal berhasil disimpan!`);
                setShowGenerateModal(false);
                setGeneratedQuestions({});
            }
        } finally {
            setGenerating(false);
        }
    };

    // Open generate modal
    const openGenerateModal = async (tryout: Tryout) => {
        setSelectedTryoutForGen(tryout);
        setGeneratedQuestions({});

        // Fetch existing soal count
        const count = await fetchSoalCount(tryout.id);
        setSoalCounts({ [tryout.id]: count });

        setShowGenerateModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nama: form.nama,
            deskripsi: form.deskripsi,
            tanggal_rilis: form.tanggal_rilis,
            tanggal_mulai: form.tanggal_mulai,
            tanggal_selesai: form.tanggal_selesai || null,
            is_active: form.is_active
        };

        if (editingTryout) {
            await supabase.from('tryouts').update(payload).eq('id', editingTryout.id);
        } else {
            await supabase.from('tryouts').insert(payload);
        }

        setShowModal(false);
        setEditingTryout(null);
        resetForm();
        fetchTryouts();
    };

    const handleEdit = (tryout: Tryout) => {
        setEditingTryout(tryout);
        setForm({
            nama: tryout.nama,
            deskripsi: tryout.deskripsi || '',
            tanggal_rilis: tryout.tanggal_rilis?.slice(0, 16) || '',
            tanggal_mulai: tryout.tanggal_mulai?.slice(0, 16) || '',
            tanggal_selesai: tryout.tanggal_selesai?.slice(0, 16) || '',
            is_active: tryout.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Hapus tryout ini?')) {
            await supabase.from('tryouts').delete().eq('id', id);
            fetchTryouts();
        }
    };

    const resetForm = () => {
        setForm({ nama: '', deskripsi: '', tanggal_rilis: '', tanggal_mulai: '', tanggal_selesai: '', is_active: true });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Tryout</h1>
                    <button
                        onClick={() => { resetForm(); setEditingTryout(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus size={18} /> Tambah Tryout
                    </button>
                </div>

                {loading ? (
                    <p className="text-slate-500">Loading...</p>
                ) : tryouts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <p className="text-slate-500">Belum ada tryout</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tryouts.map(t => (
                            <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-slate-800">{t.nama}</h3>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {t.is_active ? 'Aktif' : 'Draft'}
                                            </span>
                                        </div>
                                        {t.deskripsi && <p className="text-slate-500 text-sm mt-1">{t.deskripsi}</p>}
                                        <div className="flex gap-4 mt-3 text-sm text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Eye size={14} /> Rilis: {formatDate(t.tanggal_rilis)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> Mulai: {formatDate(t.tanggal_mulai)}
                                            </span>
                                            {t.tanggal_selesai && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} /> Selesai: {formatDate(t.tanggal_selesai)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openGenerateModal(t)}
                                            className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg"
                                            title="Generate Soal AI"
                                        >
                                            <Sparkles size={18} />
                                        </button>
                                        <button onClick={() => handleEdit(t)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-800">{editingTryout ? 'Edit' : 'Tambah'} Tryout</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700">Nama Tryout</label>
                                    <input
                                        type="text"
                                        value={form.nama}
                                        onChange={e => setForm({ ...form, nama: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Tryout #1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700">Deskripsi</label>
                                    <textarea
                                        value={form.deskripsi}
                                        onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={2}
                                        placeholder="Deskripsi tryout (opsional)"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700">Tanggal Rilis</label>
                                        <input
                                            type="datetime-local"
                                            value={form.tanggal_rilis}
                                            onChange={e => setForm({ ...form, tanggal_rilis: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700">Tanggal Mulai</label>
                                        <input
                                            type="datetime-local"
                                            value={form.tanggal_mulai}
                                            onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700">Tanggal Selesai (opsional)</label>
                                    <input
                                        type="datetime-local"
                                        value={form.tanggal_selesai}
                                        onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={form.is_active}
                                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-slate-700">Aktifkan tryout (visible ke user)</label>
                                </div>
                                <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                                    <Save size={18} /> Simpan
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* AI Generate Modal */}
                {showGenerateModal && selectedTryoutForGen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white p-6 border-b border-slate-200 z-10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <Sparkles className="text-violet-500" size={24} />
                                            Generate Soal AI
                                        </h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {selectedTryoutForGen.nama} • {soalCounts[selectedTryoutForGen.id] || 0} soal tersimpan
                                        </p>
                                    </div>
                                    <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                                    <p className="font-semibold mb-1">⚡ Cara Generate Soal:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-amber-700">
                                        <li>Klik tombol "Generate" di samping subtes yang ingin diisi</li>
                                        <li>AI akan membuat soal mirip gaya Pahamify</li>
                                        <li>Review soal yang dihasilkan</li>
                                        <li>Klik "Simpan Semua Soal" untuk menyimpan ke database</li>
                                    </ol>
                                </div>

                                {/* Subtes List */}
                                <div className="space-y-3">
                                    {SUBTES_LIST.map(subtes => {
                                        const generated = generatedQuestions[subtes.kode] || [];
                                        const isExpanded = expandedSubtes === subtes.kode;

                                        return (
                                            <div key={subtes.kode} className="border border-slate-200 rounded-xl overflow-hidden">
                                                <div className="flex items-center justify-between p-4 bg-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setExpandedSubtes(isExpanded ? null : subtes.kode)}
                                                            className="p-1 hover:bg-slate-200 rounded"
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{subtes.nama}</p>
                                                            <p className="text-xs text-slate-500">
                                                                Target: {subtes.jumlah} soal • Generated: {generated.length}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => generateQuestions(subtes.kode, 5)}
                                                        disabled={generatingSubtes === subtes.kode}
                                                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-wait text-sm"
                                                    >
                                                        {generatingSubtes === subtes.kode ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={16} />
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles size={16} />
                                                                Generate 5 Soal
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Generated Questions Preview */}
                                                {isExpanded && generated.length > 0 && (
                                                    <div className="p-4 space-y-3 border-t border-slate-200 bg-white max-h-96 overflow-y-auto">
                                                        {generated.map((q, idx) => (
                                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm">
                                                                <p className="font-medium text-slate-800 mb-2">
                                                                    {idx + 1}. {q.pertanyaan}
                                                                </p>
                                                                <div className="space-y-1 ml-4">
                                                                    {q.opsi.map((opt, oi) => (
                                                                        <p
                                                                            key={oi}
                                                                            className={`${oi === q.jawaban_benar ? 'text-green-600 font-semibold' : 'text-slate-600'}`}
                                                                        >
                                                                            {String.fromCharCode(65 + oi)}. {opt}
                                                                            {oi === q.jawaban_benar && ' ✓'}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-slate-500 mt-2 italic">
                                                                    Pembahasan: {q.pembahasan}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {isExpanded && generated.length === 0 && (
                                                    <div className="p-4 text-center text-slate-400 text-sm border-t border-slate-200">
                                                        Belum ada soal yang di-generate untuk subtes ini
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Summary & Save */}
                                {Object.keys(generatedQuestions).length > 0 && (
                                    <div className="sticky bottom-0 bg-white pt-4 border-t border-slate-200">
                                        <div className="flex items-center justify-between">
                                            <p className="text-slate-600">
                                                Total: <span className="font-bold text-violet-600">
                                                    {Object.values(generatedQuestions).flat().length} soal
                                                </span> siap disimpan
                                            </p>
                                            <button
                                                onClick={saveGeneratedQuestions}
                                                disabled={generating}
                                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold"
                                            >
                                                {generating ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={18} />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={18} />
                                                        Simpan Semua Soal
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TryoutManagement;
