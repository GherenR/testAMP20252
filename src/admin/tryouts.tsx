import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Eye, Save, X, Sparkles, Loader2, FileText, ChevronDown, ChevronUp, Lock, PlayCircle, Upload, BookOpen } from 'lucide-react';
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
    password?: string | null;
    access_mode?: 'scheduled' | 'manual_open' | 'manual_close';
}

interface GeneratedQuestion {
    subtes: string;
    nomor_soal: number;
    pertanyaan: string;
    opsi: string[];
    jawaban_benar: number;
    pembahasan: string;
    difficulty?: 'mudah' | 'sedang' | 'sulit';
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
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);
    const [form, setForm] = useState({
        nama: '',
        deskripsi: '',
        tanggal_rilis: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        is_active: true,
        password: '',
        access_mode: 'scheduled'
    });

    // AI Generation states
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedTryoutForGen, setSelectedTryoutForGen] = useState<Tryout | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generatingSubtes, setGeneratingSubtes] = useState<string | null>(null);
    const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, GeneratedQuestion[]>>({});
    const [expandedSubtes, setExpandedSubtes] = useState<string | null>(null);
    const [soalCounts, setSoalCounts] = useState<Record<string, number>>({});

    // Manage Questions State
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedTryoutForManage, setSelectedTryoutForManage] = useState<Tryout | null>(null);
    const [managedQuestions, setManagedQuestions] = useState<Record<string, Question[]>>({});
    const [manageExpandedSubtes, setManageExpandedSubtes] = useState<string | null>(null);
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [manualForm, setManualForm] = useState<Partial<Question>>({
        pertanyaan: '',
        opsi: ['', '', '', '', ''],
        jawaban_benar: 0,
        pembahasan: '',
        difficulty_level: 'sedang',
        bobot_nilai: 2
    });
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    interface Question {
        id: string;
        tryout_id: string;
        subtes: string;
        nomor_soal: number;
        pertanyaan: string;
        opsi: string[];
        jawaban_benar: number;
        pembahasan: string;
        difficulty_level: 'mudah' | 'sedang' | 'sulit';
        bobot_nilai: number;
    }

    useEffect(() => {
        fetchTryouts();
    }, []);

    const fetchTryouts = async () => {
        try {
            const { data, error } = await supabase
                .from('tryouts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetch tryouts error:', error);
            }
            if (data) setTryouts(data);
        } catch (err) {
            console.error('Fetch tryouts exception:', err);
        } finally {
            setLoading(false);
        }
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
                const msg = err.details || err.message || err.error || 'Unknown error';
                console.error('Generate soal failed:', err);
                alert(`Gagal generate soal: ${msg}`);
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
                        pembahasan: q.pembahasan,
                        difficulty_level: q.difficulty,
                        bobot_nilai: q.difficulty === 'sulit' ? 3 : (q.difficulty === 'mudah' ? 1 : 2)
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

    // Bulk Import Logic
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                if (!Array.isArray(data)) {
                    alert('Format file invalid: Harus berupa JSON Array [].');
                    return;
                }

                // Validate and Group
                const newQuestions: Record<string, GeneratedQuestion[]> = {};
                let validCount = 0;

                data.forEach((item: any) => {
                    // Basic validation
                    if (!item.subtes || !item.pertanyaan || !Array.isArray(item.opsi)) return;

                    if (!newQuestions[item.subtes]) {
                        newQuestions[item.subtes] = [];
                    }

                    newQuestions[item.subtes].push({
                        subtes: item.subtes,
                        nomor_soal: 0, // Will be indexed on save
                        pertanyaan: item.pertanyaan,
                        opsi: item.opsi,
                        jawaban_benar: typeof item.jawaban_benar === 'number' ? item.jawaban_benar : item.jawabanBenar || 0,
                        pembahasan: item.pembahasan || '',
                        difficulty: item.difficulty || 'sedang'
                    });
                    validCount++;
                });

                if (validCount === 0) {
                    alert('Tidak ada soal valid yang ditemukan. Pastikan key JSON sesuai (subtes, pertanyaan, opsi, jawaban_benar).');
                    return;
                }

                setGeneratedQuestions(prev => {
                    const next = { ...prev };
                    Object.entries(newQuestions).forEach(([subtes, qs]) => {
                        next[subtes] = [...(next[subtes] || []), ...qs];
                    });
                    return next;
                });

                alert(`Berhasil mengimpor ${validCount} soal!`);

                // Clear input
                if (fileInputRef.current) fileInputRef.current.value = '';

            } catch (err) {
                console.error('Import error:', err);
                alert('Gagal parsing JSON. Pastikan file valid.');
            }
        };
        reader.readAsText(file);
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
        setSubmitting(true);
        setSubmitError(null);

        const payload = {
            nama: form.nama,
            deskripsi: form.deskripsi,
            tanggal_rilis: form.tanggal_rilis,
            tanggal_mulai: form.tanggal_mulai,
            tanggal_selesai: form.tanggal_selesai || null,
            is_active: form.is_active,
            password: form.password || null,
            access_mode: form.access_mode
        };

        try {
            // Add timeout to prevent infinite hang (15 seconds)
            const timeoutPromise = new Promise<{ error: { message: string } }>((resolve) =>
                setTimeout(() => resolve({ error: { message: 'Request timeout - coba lagi' } }), 15000)
            );

            let dbPromise;
            if (editingTryout) {
                dbPromise = supabase.from('tryouts').update(payload).eq('id', editingTryout.id);
            } else {
                dbPromise = supabase.from('tryouts').insert(payload);
            }

            const result = await Promise.race([dbPromise, timeoutPromise]);

            if (result.error) {
                console.error('Save tryout error:', result.error);
                setSubmitError(result.error.message || 'Gagal menyimpan tryout');
                return;
            }

            setShowModal(false);
            setEditingTryout(null);
            resetForm();
            fetchTryouts();
        } catch (err) {
            console.error('Save tryout exception:', err);
            setSubmitError('Terjadi kesalahan saat menyimpan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (tryout: Tryout) => {
        setEditingTryout(tryout);
        setForm({
            nama: tryout.nama,
            deskripsi: tryout.deskripsi || '',
            tanggal_rilis: tryout.tanggal_rilis?.slice(0, 16) || '',
            tanggal_mulai: tryout.tanggal_mulai?.slice(0, 16) || '',
            tanggal_selesai: tryout.tanggal_selesai?.slice(0, 16) || '',
            is_active: tryout.is_active,
            password: tryout.password || '',
            access_mode: tryout.access_mode || 'scheduled'
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Hapus tryout ini?')) {
            try {
                const { error } = await supabase.from('tryouts').delete().eq('id', id);
                if (error) {
                    console.error('Delete tryout error:', error);
                    alert('Gagal menghapus tryout: ' + error.message);
                    return;
                }
                fetchTryouts();
            } catch (err) {
                console.error('Delete tryout exception:', err);
                alert('Terjadi kesalahan saat menghapus');
            }
        }
    };

    // Manage Functions
    const openManageModal = async (tryout: Tryout) => {
        setSelectedTryoutForManage(tryout);
        setManageExpandedSubtes(null);
        setIsAddingManual(false);
        const { data } = await supabase.from('tryout_soal').select('*').eq('tryout_id', tryout.id).order('nomor_soal', { ascending: true });

        const grouped: Record<string, Question[]> = {};
        if (data) {
            data.forEach((q: any) => {
                if (!grouped[q.subtes]) grouped[q.subtes] = [];
                grouped[q.subtes].push(q);
            });
        }
        setManagedQuestions(grouped);
        setShowManageModal(true);
    };

    const startEditQuestion = (q: Question) => {
        setEditingQuestion(q);
        setManualForm({
            pertanyaan: q.pertanyaan,
            opsi: [...q.opsi],
            jawaban_benar: q.jawaban_benar,
            pembahasan: q.pembahasan,
            difficulty_level: q.difficulty_level,
            bobot_nilai: q.bobot_nilai,
            subtes: q.subtes
        });
        setIsAddingManual(true);
    };

    const deleteQuestion = async (id: string, subtes: string) => {
        if (!confirm('Hapus soal ini?')) return;
        const { error } = await supabase.from('tryout_soal').delete().eq('id', id);
        if (error) {
            alert('Gagal menghapus: ' + error.message);
        } else {
            setManagedQuestions(prev => ({
                ...prev,
                [subtes]: prev[subtes].filter(q => q.id !== id)
            }));
            if (selectedTryoutForManage) {
                fetchSoalCount(selectedTryoutForManage.id).then(c => setSoalCounts(prev => ({ ...prev, [selectedTryoutForManage.id]: c })));
            }
        }
    };

    const saveManualQuestion = async () => {
        if (!selectedTryoutForManage || !manualForm.subtes) {
            alert('Subtes harus dipilih');
            return;
        }

        const payload: any = {
            tryout_id: selectedTryoutForManage.id,
            subtes: manualForm.subtes,
            pertanyaan: manualForm.pertanyaan,
            opsi: manualForm.opsi,
            jawaban_benar: manualForm.jawaban_benar,
            pembahasan: manualForm.pembahasan,
            difficulty_level: manualForm.difficulty_level,
            bobot_nilai: manualForm.difficulty_level === 'sulit' ? 3 : (manualForm.difficulty_level === 'mudah' ? 1 : 2)
        };

        if (!editingQuestion) {
            payload.nomor_soal = (managedQuestions[manualForm.subtes]?.length || 0) + 1;
        }

        let result;
        if (editingQuestion) {
            result = await supabase.from('tryout_soal').update(payload).eq('id', editingQuestion.id).select().single();
        } else {
            result = await supabase.from('tryout_soal').insert(payload).select().single();
        }

        const { data, error } = result;
        if (error) {
            console.error(error);
            alert('Gagal menyimpan soal: ' + error.message);
        } else {
            setManagedQuestions(prev => {
                const subtes = manualForm.subtes!;
                const list = prev[subtes] || [];
                if (editingQuestion) {
                    return {
                        ...prev,
                        [subtes]: list.map(q => q.id === editingQuestion.id ? data : q)
                    };
                } else {
                    return {
                        ...prev,
                        [subtes]: [...list, data]
                    };
                }
            });
            setIsAddingManual(false);
            setEditingQuestion(null);
            setManualForm({ ...manualForm, pertanyaan: '', opsi: ['', '', '', '', ''], pembahasan: '' });
            if (selectedTryoutForManage) {
                fetchSoalCount(selectedTryoutForManage.id).then(c => setSoalCounts(prev => ({ ...prev, [selectedTryoutForManage.id]: c })));
            }
        }
    };

    const resetForm = () => {
        setForm({ nama: '', deskripsi: '', tanggal_rilis: '', tanggal_mulai: '', tanggal_selesai: '', is_active: true, password: '', access_mode: 'scheduled' });
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
                                            {t.access_mode === 'manual_open' && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                                    <PlayCircle size={12} /> Buka Manual
                                                </span>
                                            )}
                                            {t.access_mode === 'manual_close' && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                                    <X size={12} /> Tutup Manual
                                                </span>
                                            )}
                                            {t.password && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                                    <Lock size={12} /> Password
                                                </span>
                                            )}
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
                                            onClick={() => openManageModal(t)}
                                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-2 font-bold text-sm transition-colors border border-blue-200"
                                            title="Kelola Soal & Pembahasan"
                                        >
                                            <FileText size={16} /> Atur Soal
                                        </button>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700">Mode Akses</label>
                                        <select
                                            value={form.access_mode}
                                            onChange={e => setForm({ ...form, access_mode: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="scheduled">Sesuai Jadwal</option>
                                            <option value="manual_open">Buka Sekarang (Manual)</option>
                                            <option value="manual_close">Tutup Sekarang (Manual)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-slate-700">Password (Opsional)</label>
                                        <input
                                            type="text"
                                            value={form.password || ''}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Kosongkan jika publik"
                                        />
                                    </div>
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
                                {submitError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {submitError}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} /> Simpan
                                        </>
                                    )}
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
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept=".json"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-2 text-sm font-bold"
                                            title="Upload file JSON dari tool AI lain"
                                        >
                                            <Upload size={16} /> Import JSON
                                        </button>
                                        <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                                            <X size={20} />
                                        </button>
                                    </div>
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
                {/* Manage Questions Modal */}
                {showManageModal && selectedTryoutForManage && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto flex flex-col relative">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Kelola & Review Soal: {selectedTryoutForManage.nama}</h2>
                                    <p className="text-slate-500 text-sm">{soalCounts[selectedTryoutForManage.id] || 0} soal tersimpan</p>
                                </div>
                                <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><X size={20} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {isAddingManual ? (
                                    /* Manual Form */
                                    <div className="space-y-4">
                                        <button onClick={() => { setIsAddingManual(false); setEditingQuestion(null); }} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 font-bold text-sm"><ChevronDown className="rotate-90" size={16} /> Kembali ke Daftar</button>

                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                            <h3 className="font-bold text-lg mb-4 text-slate-800">
                                                {editingQuestion ? 'Edit Soal' : 'Tambah Soal Manual'}: {SUBTES_LIST.find(s => s.kode === (editingQuestion?.subtes || manualForm.subtes))?.nama}
                                            </h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Pertanyaan</label>
                                                    <textarea
                                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                                        placeholder="Tulis pertanyaan di sini..."
                                                        value={manualForm.pertanyaan}
                                                        onChange={e => setManualForm({ ...manualForm, pertanyaan: e.target.value })}
                                                    />
                                                </div>

                                                <div className="grid gap-3">
                                                    <label className="block text-sm font-bold text-slate-700">Opsi Jawaban</label>
                                                    {manualForm.opsi?.map((opt, i) => (
                                                        <div key={i} className="flex gap-2 items-center">
                                                            <span className="font-mono font-bold text-slate-500 w-6 flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
                                                            <input
                                                                type="text"
                                                                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                                                                value={opt}
                                                                onChange={e => {
                                                                    const newOpsi = [...(manualForm.opsi || [])];
                                                                    newOpsi[i] = e.target.value;
                                                                    setManualForm({ ...manualForm, opsi: newOpsi });
                                                                }}
                                                            />
                                                            <input
                                                                type="radio"
                                                                name="correct_answer"
                                                                checked={manualForm.jawaban_benar === i}
                                                                onChange={() => setManualForm({ ...manualForm, jawaban_benar: i })}
                                                                className="w-5 h-5 text-green-600"
                                                                title="Tandai sebagai jawaban benar"
                                                            />
                                                        </div>
                                                    ))}
                                                    <p className="text-xs text-slate-500">*pilih radio button di kanan untuk menandai jawaban benar</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Pembahasan</label>
                                                    <textarea
                                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                                        placeholder="Tulis pembahasan jawaban di sini..."
                                                        value={manualForm.pembahasan}
                                                        onChange={e => setManualForm({ ...manualForm, pembahasan: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
                                                    <select
                                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        value={manualForm.difficulty_level}
                                                        onChange={e => setManualForm({ ...manualForm, difficulty_level: e.target.value as any })}
                                                    >
                                                        <option value="mudah">Mudah</option>
                                                        <option value="sedang">Sedang</option>
                                                        <option value="sulit">Sulit</option>
                                                    </select>
                                                </div>

                                                <div className="flex justify-end gap-3 mt-6">
                                                    <button
                                                        onClick={() => { setIsAddingManual(false); setEditingQuestion(null); }}
                                                        className="px-6 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                                                    >Batal</button>
                                                    <button
                                                        onClick={saveManualQuestion}
                                                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                                                    >Simpan Soal</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Question List */
                                    <div className="space-y-4">
                                        {SUBTES_LIST.map(subtes => {
                                            const questions = managedQuestions[subtes.kode] || [];
                                            const isExpanded = manageExpandedSubtes === subtes.kode;
                                            return (
                                                <div key={subtes.kode} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                    <div className="flex justify-between p-4 bg-slate-50 items-center border-b border-slate-100">
                                                        <button onClick={() => setManageExpandedSubtes(isExpanded ? null : subtes.kode)} className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                            {subtes.nama}
                                                            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{questions.length}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsAddingManual(true);
                                                                setManualForm(prev => ({ ...prev, subtes: subtes.kode }));
                                                            }}
                                                            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 flex items-center gap-2"
                                                        >
                                                            <Plus size={16} /> Tambah Manual
                                                        </button>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="p-4 space-y-4 bg-white">
                                                            {questions.map((q, idx) => (
                                                                <div key={q.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 hover:border-slate-300 transition-all relative group">
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <p className="font-bold text-slate-800 flex items-center gap-2">
                                                                                <span className="bg-slate-200 text-slate-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">{q.nomor_soal}</span>
                                                                                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${q.difficulty_level === 'sulit' ? 'bg-red-100 text-red-600' : q.difficulty_level === 'mudah' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{q.difficulty_level}</span>
                                                                            </p>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={() => startEditQuestion(q)}
                                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                                    title="Edit Soal"
                                                                                >
                                                                                    <Edit2 size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => deleteQuestion(q.id, subtes.kode)}
                                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                                    title="Hapus Soal"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-slate-700 mb-3 whitespace-pre-line text-sm leading-relaxed">{q.pertanyaan}</p>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                                            {q.opsi.map((o, i) => (
                                                                                <div key={i} className={`text-xs px-3 py-2 rounded border transition-all ${i === q.jawaban_benar ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-white border-slate-100 text-slate-500'}`}>
                                                                                    <span className="font-mono mr-1">{String.fromCharCode(65 + i)}.</span> {o}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {q.pembahasan && (
                                                                            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-[11px] text-indigo-700/80 leading-relaxed italic">
                                                                                <p className="font-bold text-indigo-800 mb-1 flex items-center gap-1 uppercase tracking-wider not-italic">
                                                                                    <BookOpen size={12} /> Pembahasan
                                                                                </p>
                                                                                {q.pembahasan}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {questions.length === 0 && (
                                                                <div className="text-center text-slate-400 py-12 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                                    Belum ada soal untuk subtes ini. Klik "Tambah Soal" untuk membuat soal pertama.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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
