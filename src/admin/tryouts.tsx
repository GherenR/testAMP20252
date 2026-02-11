import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Eye, Save, X, Sparkles, Loader2, FileText, ChevronDown, ChevronUp, Lock, PlayCircle, Upload, BookOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import DashboardLayout from '../components/admin/DashboardLayout';
import LatexRenderer from '../components/LatexRenderer';

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
    id_wacana?: string | null;
    teks_bacaan?: string | null;
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

/**
 * Normalizes subtest codes from external sources (JSON import, AI)
 * to match internal SUBTES_LIST codes.
 */
const normalizeSubtesCode = (input: string): string => {
    const clean = input.toLowerCase().trim().replace(/_/g, '-');
    console.log('Normalizing subtest:', input, '->', clean);

    // Exact mapping for known variations
    const mapping: Record<string, string> = {
        'literasi-bahasa-indonesia': 'literasi-indonesia',
        'bahasa-indonesia': 'literasi-indonesia',
        'literasi-indo': 'literasi-indonesia',
        'indonesia': 'literasi-indonesia',
        'indnesia': 'literasi-indonesia',
        'indo': 'literasi-indonesia',

        'literasi-bahasa-inggris': 'literasi-inggris',
        'bahasa-inggris': 'literasi-inggris',
        'literasi-ing': 'literasi-inggris',
        'inggris': 'literasi-inggris',

        'penalaran-mtk': 'penalaran-matematika',
        'matematika': 'penalaran-matematika',
        'mtk': 'penalaran-matematika',

        'pbm': 'pemahaman-bacaan-menulis',
        'ppu': 'pengetahuan-pemahaman-umum',
        'pk': 'pengetahuan-kuantitatif',
        'pu': 'penalaran-umum',
        'pm': 'penalaran-matematika',
        'lbi': 'literasi-indonesia',
        'lbe': 'literasi-inggris'
    };

    if (mapping[clean]) return mapping[clean];

    // Fuzzy check against SUBTES_LIST
    const found = SUBTES_LIST.find(s =>
        s.kode === clean ||
        s.nama.toLowerCase() === clean ||
        clean.includes(s.kode) ||
        s.kode.includes(clean)
    );

    return found ? found.kode : clean;
};

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
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

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
        id_wacana?: string | null;
        teks_bacaan?: string | null;
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

            // Flatten the groups for the UI state if needed, or keep them grouped.
            // For now, we flatten but keep the metadata for saving.
            const allQuestionsFromGroups: GeneratedQuestion[] = [];

            if (data.groups && Array.isArray(data.groups)) {
                data.groups.forEach((group: any) => {
                    (group.daftar_soal || []).forEach((q: any) => {
                        allQuestionsFromGroups.push({
                            ...q,
                            id_wacana: group.id_wacana,
                            teks_bacaan: group.teks_bacaan,
                            subtes: subtes // Ensure subtes is correct
                        });
                    });
                });
            } else if (data.questions) {
                // Fallback for old flat format
                allQuestionsFromGroups.push(...data.questions);
            }

            setGeneratedQuestions(prev => ({
                ...prev,
                [subtes]: [...(prev[subtes] || []), ...allQuestionsFromGroups]
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
            Object.entries(generatedQuestions).forEach(([subtesKey, questions]) => {
                questions.forEach((q, idx) => {
                    allQuestions.push({
                        tryout_id: selectedTryoutForGen.id,
                        subtes: subtesKey,
                        nomor_soal: idx + 1,
                        pertanyaan: q.pertanyaan,
                        opsi: q.opsi,
                        jawaban_benar: q.jawaban_benar,
                        pembahasan: q.pembahasan,
                        difficulty_level: q.difficulty,
                        bobot_nilai: q.difficulty === 'sulit' ? 3 : (q.difficulty === 'mudah' ? 1 : 2),
                        id_wacana: q.id_wacana || null,
                        teks_bacaan: q.teks_bacaan || null
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
                let content = e.target?.result as string;

                // --- Robust Pre-parsing Sanitization ---
                // 1. Remove AI-generated citation markers [cite: ...] or [cite_start]
                // We target patterns like [cite: 8, 12] or [cite_start] or [cite_end]
                content = content.replace(/\[cite[_\s:][^\]]*\]/g, "");

                // 2. Fix common "lazy" AI JSON issues (like trailing commas before ] or })
                content = content.replace(/,\s*([\]}])/g, "$1");

                let data: any;
                try {
                    data = JSON.parse(content);
                } catch (parseErr: any) {
                    console.error('JSON Parse Error:', parseErr);
                    // Try to find where the error is
                    const pos = parseErr.message.match(/at position (\d+)/);
                    if (pos) {
                        const errorPos = parseInt(pos[1]);
                        const context = content.substring(Math.max(0, errorPos - 50), Math.min(content.length, errorPos + 50));
                        alert(`Gagal parsing JSON: ${parseErr.message}\n\nKonteks error:\n...${context}...`);
                    } else {
                        alert(`Gagal parsing JSON: ${parseErr.message}. Pastikan format file benar.`);
                    }
                    return;
                }

                // Detect format: Grouped or Flat Array
                const newQuestions: Record<string, GeneratedQuestion[]> = {};
                let validCount = 0;
                let errorMessages: string[] = [];

                if (Array.isArray(data) && data.length > 0 && (data[0].daftar_soal || data[0].questions)) {
                    // NEW GROUPED FORMAT
                    data.forEach((group: any) => {
                        const teks_bacaan = group.teks_bacaan || group.teks_wacana || group.passage || group.bacaan || null;
                        const id_wacana = group.id_wacana || (teks_bacaan ? `wacana_imp_${Date.now()}_${Math.random().toString(36).substring(7)}` : null);

                        const soalList = group.daftar_soal || group.questions || [];
                        if (Array.isArray(soalList)) {
                            soalList.forEach((item: any, idx: number) => {
                                const qNum = item.nomor_soal || (idx + 1);
                                if (!item.pertanyaan) {
                                    errorMessages.push(`Group ${id_wacana} - Soal #${qNum}: Pertanyaan missing.`);
                                    return;
                                }

                                const subKey = normalizeSubtesCode(String(item.subtes || 'literasi-indonesia'));
                                if (!newQuestions[subKey]) newQuestions[subKey] = [];

                                newQuestions[subKey].push({
                                    id_wacana,
                                    teks_bacaan,
                                    subtes: subKey,
                                    nomor_soal: qNum,
                                    pertanyaan: item.pertanyaan,
                                    opsi: item.opsi || [],
                                    jawaban_benar: typeof item.jawaban_benar === 'number' ? item.jawaban_benar : (item.jawabanBenar ?? 0),
                                    pembahasan: item.pembahasan || '',
                                    difficulty: item.difficulty || item.difficulty_level || 'sedang'
                                });
                                validCount++;
                            });
                        }
                    });
                } else if (Array.isArray(data)) {
                    // OLD FLAT FORMAT
                    data.forEach((item: any, idx: number) => {
                        const qNum = item.nomor_soal || (idx + 1);

                        // Basic validation
                        if (!item.subtes) {
                            errorMessages.push(`Soal #${qNum}: Subtes missing.`);
                            return;
                        }
                        if (!item.pertanyaan) {
                            errorMessages.push(`Soal #${qNum}: Pertanyaan missing.`);
                            return;
                        }
                        if (!Array.isArray(item.opsi) || item.opsi.length < 2) {
                            errorMessages.push(`Soal #${qNum}: Opsi harus berupa array minimal 2 pilihan.`);
                            return;
                        }

                        const subKey = normalizeSubtesCode(String(item.subtes));

                        if (!newQuestions[subKey]) {
                            newQuestions[subKey] = [];
                        }

                        newQuestions[subKey].push({
                            subtes: subKey,
                            nomor_soal: 0, // Will be indexed on save
                            pertanyaan: item.pertanyaan,
                            opsi: item.opsi,
                            jawaban_benar: typeof item.jawaban_benar === 'number' ? item.jawaban_benar : (item.jawabanBenar ?? 0),
                            pembahasan: item.pembahasan || '',
                            difficulty: item.difficulty || item.difficulty_level || 'sedang',
                            id_wacana: item.id_wacana || null,
                            teks_bacaan: item.teks_bacaan || null
                        });
                        validCount++;
                    });
                } else {
                    alert('Format file invalid: Harus berupa JSON Array [].');
                    return;
                }

                if (validCount === 0) {
                    alert('Tidak ada soal valid yang ditemukan.\n\nErrors:\n' + errorMessages.slice(0, 5).join('\n'));
                    return;
                }

                setGeneratedQuestions(prev => {
                    return { ...prev, ...newQuestions };
                });

                if (errorMessages.length > 0) {
                    alert(`Berhasil mengimpor ${validCount} soal.\nAda ${errorMessages.length} soal yang di-skip karena error (lihat console untuk detail).`);
                    console.warn('Import Errors:', errorMessages);
                } else {
                    const subtestSummary = Object.entries(newQuestions)
                        .map(([k, v]) => `- ${SUBTES_LIST.find(s => s.kode === k)?.nama || k}: ${v.length} soal`)
                        .join('\n');
                    alert(`Berhasil mengimpor ${validCount} soal!\n\nRingkasan:\n${subtestSummary}`);
                }

                // Clear input
                if (fileInputRef.current) fileInputRef.current.value = '';

            } catch (err) {
                console.error('Import process error:', err);
                alert('Terjadi kesalahan saat memproses file.');
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
        setSelectedQuestionIds([]);
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
            subtes: q.subtes,
            id_wacana: q.id_wacana,
            teks_bacaan: q.teks_bacaan
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
            setSelectedQuestionIds(prev => prev.filter(qid => qid !== id));
            if (selectedTryoutForManage) {
                fetchSoalCount(selectedTryoutForManage.id).then(c => setSoalCounts(prev => ({ ...prev, [selectedTryoutForManage.id]: c })));
            }
        }
    };

    const deleteBulkQuestions = async () => {
        if (selectedQuestionIds.length === 0) return;
        if (!confirm(`Hapus ${selectedQuestionIds.length} soal terpilih? Tindakan ini tidak dapat dibatalkan.`)) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from('tryout_soal').delete().in('id', selectedQuestionIds);

            if (error) {
                alert('Gagal menghapus bulk: ' + error.message);
            } else {
                setManagedQuestions(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(subtes => {
                        next[subtes] = next[subtes].filter(q => !selectedQuestionIds.includes(q.id));
                    });
                    return next;
                });

                if (selectedTryoutForManage) {
                    fetchSoalCount(selectedTryoutForManage.id).then(c => setSoalCounts(prev => ({ ...prev, [selectedTryoutForManage.id]: c })));
                }

                alert(`Berhasil menghapus ${selectedQuestionIds.length} soal.`);
                setSelectedQuestionIds([]);
            }
        } catch (err) {
            console.error('Bulk delete error:', err);
            alert('Terjadi kesalahan saat menghapus bulk.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleQuestionSelection = (id: string) => {
        setSelectedQuestionIds(prev =>
            prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
        );
    };

    const deleteSubtestQuestions = async (subtes: string) => {
        if (!selectedTryoutForManage) return;
        if (!confirm(`Hapus SELURUH soal di subtes "${subtes}"? Tindakan ini tidak dapat dibatalkan.`)) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from('tryout_soal')
                .delete()
                .eq('tryout_id', selectedTryoutForManage.id)
                .eq('subtes', subtes);

            if (error) {
                alert('Gagal menghapus subtes: ' + error.message);
            } else {
                setManagedQuestions(prev => {
                    const next = { ...prev };
                    delete next[subtes];
                    return next;
                });
                alert(`Berhasil menghapus seluruh soal di ${subtes}.`);
                fetchSoalCount(selectedTryoutForManage.id).then(c => setSoalCounts(prev => ({ ...prev, [selectedTryoutForManage.id]: c })));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSubtesSelection = (subtes: string, selectAll: boolean) => {
        const questions = managedQuestions[subtes] || [];
        const qIds = questions.map(q => q.id);

        setSelectedQuestionIds(prev => {
            const otherIds = prev.filter(id => !qIds.includes(id));
            return selectAll ? [...otherIds, ...qIds] : otherIds;
        });
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
            bobot_nilai: manualForm.difficulty_level === 'sulit' ? 3 : (manualForm.difficulty_level === 'mudah' ? 1 : 2),
            id_wacana: manualForm.id_wacana || null,
            teks_bacaan: manualForm.teks_bacaan || null
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
                                                                <LatexRenderer className="font-medium text-slate-800 mb-2">
                                                                    {`${idx + 1}. ${q.pertanyaan}`}
                                                                </LatexRenderer>
                                                                <div className="space-y-1 ml-4">
                                                                    {q.opsi.map((opt, oi) => (
                                                                        <div key={oi} className="flex items-center gap-1">
                                                                            <LatexRenderer
                                                                                className={`${oi === q.jawaban_benar ? 'text-green-600 font-semibold' : 'text-slate-600'}`}
                                                                            >
                                                                                {`${String.fromCharCode(65 + oi)}. ${opt}`}
                                                                            </LatexRenderer>
                                                                            {oi === q.jawaban_benar && <span className="text-green-600 font-semibold"> ✓</span>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-2 italic flex gap-1">
                                                                    <span>Pembahasan:</span>
                                                                    <LatexRenderer>{q.pembahasan}</LatexRenderer>
                                                                </div>
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
                                <div className="flex items-center gap-2">
                                    {selectedQuestionIds.length > 0 && (
                                        <button
                                            onClick={deleteBulkQuestions}
                                            disabled={submitting}
                                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 font-bold text-sm transition-all border border-red-200"
                                        >
                                            <Trash2 size={16} /> Hapus Terpilih ({selectedQuestionIds.length})
                                        </button>
                                    )}
                                    <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><X size={20} /></button>
                                </div>
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
                                        {[...SUBTES_LIST, ...Object.keys(managedQuestions)
                                            .filter(k => !SUBTES_LIST.some(s => s.kode === k))
                                            .map(k => ({ kode: k, nama: `Unknown/Old Subtes: ${k}`, jumlah: 0 }))
                                        ].map(subtes => {
                                            const questions = managedQuestions[subtes.kode] || [];
                                            const isExpanded = manageExpandedSubtes === subtes.kode;
                                            return (
                                                <div key={subtes.kode} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                    <div className="flex justify-between p-4 bg-slate-50 items-center border-b border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            {questions.length > 0 && (
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                    title="Pilih Semua di Subtes Ini"
                                                                    checked={questions.every(q => selectedQuestionIds.includes(q.id))}
                                                                    onChange={(e) => toggleSubtesSelection(subtes.kode, e.target.checked)}
                                                                />
                                                            )}
                                                            <button onClick={() => setManageExpandedSubtes(isExpanded ? null : subtes.kode)} className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                                {subtes.nama}
                                                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs ml-2">{questions.length}</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {questions.length > 0 && (
                                                                <button
                                                                    onClick={() => deleteSubtestQuestions(subtes.kode)}
                                                                    className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={16} /> Hapus Semua
                                                                </button>
                                                            )}
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
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="p-4 space-y-4 bg-white">
                                                            {questions.map((q, idx) => (
                                                                <div key={q.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 hover:border-slate-300 transition-all relative group">
                                                                    <div className="flex-1 flex gap-4">
                                                                        <div className="pt-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                                checked={selectedQuestionIds.includes(q.id)}
                                                                                onChange={() => toggleQuestionSelection(q.id)}
                                                                            />
                                                                        </div>
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
                                                                            {q.teks_bacaan && (
                                                                                <div className="mb-4 bg-slate-100 p-4 rounded-lg border-l-4 border-blue-400">
                                                                                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Teks Bacaan (ID: {q.id_wacana})</p>
                                                                                    <LatexRenderer className="text-sm text-slate-700 leading-relaxed max-h-[200px] overflow-y-auto">
                                                                                        {q.teks_bacaan}
                                                                                    </LatexRenderer>
                                                                                </div>
                                                                            )}
                                                                            <LatexRenderer className="text-slate-700 mb-3 whitespace-pre-line text-sm leading-relaxed">{q.pertanyaan}</LatexRenderer>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                                                {q.opsi.map((o, i) => (
                                                                                    <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded border transition-all ${i === q.jawaban_benar ? 'bg-green-50 border-green-200 text-green-800 font-bold' : 'bg-white border-slate-100 text-slate-500'}`}>
                                                                                        <span className="font-mono">{String.fromCharCode(65 + i)}.</span>
                                                                                        <LatexRenderer>{o}</LatexRenderer>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            {q.pembahasan && (
                                                                                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-[11px] text-indigo-700/80 leading-relaxed italic">
                                                                                    <p className="font-bold text-indigo-800 mb-1 flex items-center gap-1 uppercase tracking-wider not-italic">
                                                                                        <BookOpen size={12} /> Pembahasan
                                                                                    </p>
                                                                                    <LatexRenderer>{q.pembahasan}</LatexRenderer>
                                                                                </div>
                                                                            )}
                                                                        </div>
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
                                )
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TryoutManagement;
