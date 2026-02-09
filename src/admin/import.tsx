import React, { useState, useRef, useCallback, useEffect } from 'react';
import DashboardLayout from '../components/admin/DashboardLayout';
import RequireAdmin from '../components/admin/RequireAdmin';
import {
    getAllMentors,
    createMentorsBulk,
    MentorDB,
    MentorInput
} from '../mentorService';
import { Upload, FileSpreadsheet, Check, X, AlertCircle, Users, UserPlus, RefreshCw, ChevronDown, ChevronUp, Eye, Info } from 'lucide-react';
import type { InstitutionCategory } from '../types';

interface CSVEntry {
    name: string;
    email: string;
    whatsapp: string;
    instagram: string;
    university: string;
    major: string;
    path: string;
    category: InstitutionCategory;
    angkatan: number;
    achievements: string[];
    status: 'new' | 'existing' | 'invalid';
    existingData?: MentorDB;
    // Reasoning fields
    reasons: string[];  // Why valid/invalid
    warnings: string[]; // Missing optional fields
    rawData: Record<string, string>; // Original extracted values for debug
}

export default function ImportCSVPage() {
    const [csvData, setCsvData] = useState<CSVEntry[]>([]);
    const [existingMentors, setExistingMentors] = useState<MentorDB[]>([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importComplete, setImportComplete] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const [showExisting, setShowExisting] = useState(false);
    const [showInvalid, setShowInvalid] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [selectedEntry, setSelectedEntry] = useState<CSVEntry | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing mentors on mount
    useEffect(() => {
        loadExistingMentors();
    }, []);

    const loadExistingMentors = async () => {
        const { data } = await getAllMentors();
        if (data) {
            setExistingMentors(data);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const parseCSV = useCallback((text: string): CSVEntry[] => {
        const lines = text.split('\n');
        if (lines.length < 2) return [];

        const existingNames = existingMentors.map(m => m.name.toLowerCase().trim());
        const entries: CSVEntry[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            // Parse CSV with proper quote handling
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            // Map columns based on Google Form structure (updated 2025)
            // Index: 0=Timestamp, 1=Email, 2=Name, 3=Domisili, 4=WA, 5=Instagram, 6=Status, 7=JenisPT
            // Index: 40=Consent AMP, 42=Angkatan, 44=Prestasi
            const name = values[2]?.trim() || '';
            const email = values[1]?.trim() || '';
            const status = values[6]?.trim() || '';
            const consent = values[40]?.trim() || '';
            const angkatanStr = values[42]?.trim() || '2025';
            const domisili = values[3]?.trim() || '';

            // Skip if empty name
            if (!name) continue;

            // Build rawData for debugging
            const rawData: Record<string, string> = {
                'Nama': name,
                'Email': email,
                'Status': status,
                'Consent AMP': consent,
                'Angkatan': angkatanStr,
                'Domisili': domisili,
            };

            // Collect reasons and warnings
            const reasons: string[] = [];
            const warnings: string[] = [];

            // Check invalid criteria
            const isNotMahasiswa = !status.includes('Mahasiswa');
            const noConsent = !consent.includes('Ya');

            if (isNotMahasiswa) {
                reasons.push(`Status bukan Mahasiswa: "${status || '(kosong)'}"`);
            }
            if (noConsent) {
                reasons.push(`Tidak consent AMP: "${consent || '(kosong)'}"`);
            }

            // If invalid, push and continue
            if (isNotMahasiswa || noConsent) {
                entries.push({
                    name,
                    email,
                    whatsapp: '',
                    instagram: '',
                    university: '',
                    major: '',
                    path: '',
                    category: 'PTN',
                    angkatan: 2025,
                    achievements: [],
                    status: 'invalid',
                    reasons,
                    warnings: [],
                    rawData
                });
                continue;
            }

            // Valid entry - collect data
            reasons.push('✓ Status: Mahasiswa');
            reasons.push('✓ Consent AMP: Ya');

            // Get WhatsApp and Instagram
            let whatsapp = values[4]?.trim() || '';
            rawData['WhatsApp Raw'] = whatsapp;
            if (whatsapp && !whatsapp.startsWith('wa.me/')) {
                whatsapp = whatsapp.replace(/[^0-9]/g, '');
                if (whatsapp && !whatsapp.startsWith('62')) {
                    whatsapp = '62' + whatsapp.replace(/^0/, '');
                }
                whatsapp = `wa.me/${whatsapp}`;
            }

            // Check for missing contact info
            if (!whatsapp || whatsapp === 'wa.me/') {
                warnings.push('Tidak ada nomor WhatsApp');
                whatsapp = '';
            }

            let instagram = values[5]?.trim() || '';
            rawData['Instagram Raw'] = instagram;
            instagram = instagram.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
            if (!instagram) {
                warnings.push('Tidak ada Instagram');
            }

            if (!email) {
                warnings.push('Tidak ada Email');
            }

            // Get university and major based on Jenis PT
            const jenisPT = values[7]?.trim() || '';
            rawData['Jenis PT'] = jenisPT;
            let university = '';
            let major = '';
            let category: InstitutionCategory = 'PTN';

            if (jenisPT.includes('Negeri') || jenisPT === 'PTN') {
                university = values[8]?.trim() || '';
                major = values[9]?.trim() || '';
                category = 'PTN';
                rawData['Universitas (PTN)'] = university;
                rawData['Jurusan (PTN)'] = major;
                reasons.push(`Jenis: PTN - ${university || '(kosong)'}`);
            } else if (jenisPT.includes('Swasta') || jenisPT === 'PTS') {
                university = values[8]?.trim() || values[16]?.trim() || '';
                major = values[9]?.trim() || values[17]?.trim() || '';
                category = 'PTS';
                rawData['Universitas (PTS)'] = university;
                rawData['Jurusan (PTS)'] = major;
                reasons.push(`Jenis: PTS - ${university || '(kosong)'}`);
            } else if (jenisPT.includes('Politeknik')) {
                university = values[20]?.trim() || '';
                major = values[21]?.trim() || '';
                category = 'PTN';
                rawData['Politeknik'] = university;
                rawData['Jurusan (Poltek)'] = major;
                reasons.push(`Jenis: Politeknik - ${university || '(kosong)'}`);
            } else if (jenisPT.includes('Luar Negeri') || jenisPT === 'PTLN') {
                university = values[24]?.trim() || '';
                major = values[25]?.trim() || '';
                category = 'PTLN';
                rawData['Universitas (PTLN)'] = university;
                rawData['Jurusan (PTLN)'] = major;
                reasons.push(`Jenis: PTLN - ${university || '(kosong)'}`);
            } else if (jenisPT.includes('Kedinasan')) {
                university = values[12]?.trim() || '';
                major = values[13]?.trim() || '';
                category = 'PTN';
                rawData['Instansi Kedinasan'] = university;
                rawData['Program Kedinasan'] = major;
                reasons.push(`Jenis: Kedinasan - ${university || '(kosong)'}`);
            } else {
                university = values[8]?.trim() || values[16]?.trim() || values[20]?.trim() || '';
                major = values[9]?.trim() || values[17]?.trim() || values[21]?.trim() || '';
                reasons.push(`Jenis PT tidak dikenali: "${jenisPT || '(kosong)'}"`);
            }

            // Check missing university/major
            if (!university) {
                warnings.push('Tidak ada nama Universitas');
            }
            if (!major) {
                warnings.push('Tidak ada Jurusan/Prodi');
            }

            // Get path
            let path = values[11]?.trim() || values[19]?.trim() || values[23]?.trim() || values[27]?.trim() || 'Mandiri';
            rawData['Jalur Masuk Raw'] = path;
            if (path.includes('SNBP')) path = 'SNBP';
            else if (path.includes('SNBT')) path = 'SNBT';
            else if (path.toLowerCase().includes('mandiri')) path = 'Mandiri';
            else if (path.toLowerCase().includes('beasiswa')) path = 'Beasiswa';
            else if (path.toLowerCase().includes('reguler')) path = 'Reguler';
            reasons.push(`Jalur: ${path}`);

            // Get achievements (index 44)
            const achievementsRaw = values[44]?.trim() || '';
            rawData['Prestasi Raw'] = achievementsRaw;
            const achievements = achievementsRaw
                .split(/[,\n]/)
                .map(a => a.trim())
                .filter(a => a && a !== '-');

            if (achievements.length > 0) {
                reasons.push(`Prestasi: ${achievements.length} item`);
            }

            // Get angkatan
            const angkatan = parseInt(angkatanStr) || 2025;

            // Check if existing
            const isExisting = existingNames.includes(name.toLowerCase().trim());
            const existingMentor = isExisting
                ? existingMentors.find(m => m.name.toLowerCase().trim() === name.toLowerCase().trim())
                : undefined;

            if (isExisting) {
                reasons.push('⚠ Nama sudah ada di database');
            }

            entries.push({
                name,
                email,
                whatsapp,
                instagram,
                university,
                major,
                path,
                category,
                angkatan,
                achievements,
                status: isExisting ? 'existing' : 'new',
                existingData: existingMentor,
                reasons,
                warnings,
                rawData
            });
        }

        return entries;
    }, [existingMentors]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setFileName(file.name);
        setImportComplete(false);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const parsed = parseCSV(text);
            setCsvData(parsed);
            setIsProcessing(false);
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            setIsProcessing(true);
            setFileName(file.name);
            setImportComplete(false);

            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                const parsed = parseCSV(text);
                setCsvData(parsed);
                setIsProcessing(false);
            };
            reader.readAsText(file);
        }
    };

    const handleImport = async () => {
        const newEntries = csvData.filter(e => e.status === 'new' && e.university);

        if (newEntries.length === 0) {
            showMessage('error', 'Tidak ada data baru untuk diimport');
            return;
        }

        setIsImporting(true);

        // Convert to MentorInput format
        const mentorsToInsert: MentorInput[] = newEntries.map(entry => ({
            name: entry.name,
            university: entry.university,
            major: entry.major,
            path: entry.path,
            category: entry.category,
            angkatan: entry.angkatan,
            whatsapp: entry.whatsapp || undefined,
            instagram: entry.instagram || undefined,
            email: entry.email || undefined,
            achievements: entry.achievements
        }));

        const { data, error } = await createMentorsBulk(mentorsToInsert);

        if (error) {
            showMessage('error', `Gagal import: ${error}`);
        } else if (data) {
            setImportedCount(data.length);
            setImportComplete(true);
            showMessage('success', `${data.length} alumni berhasil ditambahkan ke database!`);

            // Refresh existing mentors
            await loadExistingMentors();
        }

        setIsImporting(false);
    };

    const toggleRowExpand = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    const newEntries = csvData.filter(e => e.status === 'new');
    const existingEntries = csvData.filter(e => e.status === 'existing');
    const invalidEntries = csvData.filter(e => e.status === 'invalid');
    const validNewEntries = newEntries.filter(e => e.university);

    const resetImport = () => {
        setCsvData([]);
        setFileName('');
        setImportComplete(false);
        setImportedCount(0);
        setExpandedRows(new Set());
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <RequireAdmin>
            <DashboardLayout>
                <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-6">
                        <FileSpreadsheet size={28} /> Import Data CSV
                    </h1>

                    {/* Message Toast */}
                    {message && (
                        <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-green-900/50 border border-green-500 text-green-300'
                            : 'bg-red-900/50 border border-red-500 text-red-300'
                            }`}>
                            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {/* Upload Area */}
                    <div
                        className="border-2 border-dashed border-slate-600 rounded-xl p-6 md:p-8 text-center mb-6 hover:border-blue-500 transition-colors cursor-pointer active:scale-[0.99]"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Upload size={48} className="mx-auto mb-4 text-slate-400" />
                        <p className="text-lg font-semibold mb-2">
                            {isProcessing ? 'Memproses...' : 'Tap untuk upload CSV'}
                        </p>
                        <p className="text-sm text-slate-400">
                            atau drag & drop file CSV dari Google Form
                        </p>
                        {fileName && (
                            <p className="mt-4 text-sm text-blue-400">
                                📁 {fileName}
                            </p>
                        )}
                    </div>

                    {/* Summary Cards */}
                    {csvData.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="bg-slate-800 rounded-xl p-4 text-center">
                                <Users size={24} className="mx-auto mb-2 text-slate-400" />
                                <p className="text-2xl font-bold">{csvData.length}</p>
                                <p className="text-xs text-slate-400">Total</p>
                            </div>
                            <div className="bg-green-900/30 border border-green-600/30 rounded-xl p-4 text-center">
                                <UserPlus size={24} className="mx-auto mb-2 text-green-400" />
                                <p className="text-2xl font-bold text-green-400">{validNewEntries.length}</p>
                                <p className="text-xs text-green-400">Data Baru</p>
                            </div>
                            <div className="bg-blue-900/30 border border-blue-600/30 rounded-xl p-4 text-center">
                                <RefreshCw size={24} className="mx-auto mb-2 text-blue-400" />
                                <p className="text-2xl font-bold text-blue-400">{existingEntries.length}</p>
                                <p className="text-xs text-blue-400">Sudah Ada</p>
                            </div>
                            <div className="bg-red-900/30 border border-red-600/30 rounded-xl p-4 text-center">
                                <AlertCircle size={24} className="mx-auto mb-2 text-red-400" />
                                <p className="text-2xl font-bold text-red-400">{invalidEntries.length}</p>
                                <p className="text-xs text-red-400">Tidak Valid</p>
                            </div>
                        </div>
                    )}

                    {/* New Entries */}
                    {validNewEntries.length > 0 && !importComplete && (
                        <div className="bg-slate-800 rounded-xl mb-4 overflow-hidden">
                            <div className="bg-green-900/30 px-4 py-3 flex items-center justify-between">
                                <h2 className="font-bold text-green-400 flex items-center gap-2">
                                    <UserPlus size={18} /> Data Baru ({validNewEntries.length})
                                </h2>
                                <span className="text-xs text-slate-400">Tap untuk detail</span>
                            </div>
                            <div className="divide-y divide-slate-700 max-h-[400px] overflow-y-auto">
                                {validNewEntries.map((entry, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 cursor-pointer hover:bg-slate-700/50 active:bg-slate-700 transition-colors"
                                        onClick={() => setSelectedEntry(entry)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold truncate">{entry.name}</p>
                                                <p className="text-sm text-slate-400 truncate">
                                                    {entry.university || '(Universitas kosong)'} - {entry.major || '(Jurusan kosong)'}
                                                </p>
                                                {/* Show warnings count */}
                                                {entry.warnings.length > 0 && (
                                                    <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                                                        <AlertCircle size={12} />
                                                        {entry.warnings.length} data kurang
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="bg-green-600 text-xs px-2 py-1 rounded font-bold">
                                                    NEW
                                                </span>
                                                <Eye size={16} className="text-slate-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing Entries (Collapsible) */}
                    {existingEntries.length > 0 && (
                        <div className="bg-slate-800 rounded-xl mb-4 overflow-hidden">
                            <div
                                className="bg-blue-900/30 px-4 py-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setShowExisting(!showExisting)}
                            >
                                <h2 className="font-bold text-blue-400 flex items-center gap-2">
                                    <RefreshCw size={18} /> Sudah Ada di Database ({existingEntries.length})
                                </h2>
                                {showExisting ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                            {showExisting && (
                                <div className="divide-y divide-slate-700 max-h-60 overflow-y-auto">
                                    {existingEntries.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 active:bg-slate-700 transition-colors"
                                            onClick={() => setSelectedEntry(entry)}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{entry.name}</p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {entry.existingData?.university || entry.university}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Check size={18} className="text-blue-400 flex-shrink-0" />
                                                <Eye size={14} className="text-slate-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Invalid Entries (Collapsible) */}
                    {invalidEntries.length > 0 && (
                        <div className="bg-slate-800 rounded-xl mb-4 overflow-hidden">
                            <div
                                className="bg-red-900/30 px-4 py-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setShowInvalid(!showInvalid)}
                            >
                                <h2 className="font-bold text-red-400 flex items-center gap-2">
                                    <AlertCircle size={18} /> Tidak Memenuhi Kriteria ({invalidEntries.length})
                                </h2>
                                {showInvalid ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                            {showInvalid && (
                                <div className="divide-y divide-slate-700 max-h-60 overflow-y-auto">
                                    {invalidEntries.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className="px-4 py-3 cursor-pointer hover:bg-slate-700/50 active:bg-slate-700 transition-colors"
                                            onClick={() => setSelectedEntry(entry)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{entry.name}</p>
                                                    <p className="text-xs text-red-400 truncate">
                                                        {entry.reasons.filter(r => !r.startsWith('✓')).slice(0, 2).join(' • ')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 ml-2">
                                                    <X size={18} className="text-red-400 flex-shrink-0" />
                                                    <Eye size={14} className="text-slate-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="px-4 py-2 text-xs text-slate-400 bg-slate-900/50">
                                Tap untuk lihat alasan kenapa tidak valid
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {validNewEntries.length > 0 && (
                        <div className="sticky bottom-4 mt-6">
                            {!importComplete ? (
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
                                >
                                    {isImporting ? (
                                        <>
                                            <RefreshCw size={24} className="animate-spin" />
                                            Mengimport ke Database...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={24} />
                                            Import {validNewEntries.length} Data ke Supabase
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-green-900/50 border border-green-500 rounded-xl p-4 text-center">
                                        <Check size={32} className="mx-auto mb-2 text-green-400" />
                                        <p className="font-bold text-green-400 text-lg">Import Berhasil!</p>
                                        <p className="text-sm text-slate-300 mt-1">
                                            {importedCount} alumni telah ditambahkan ke database Supabase
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Data akan langsung tampil di website tanpa perlu deploy ulang
                                        </p>
                                    </div>
                                    <button
                                        onClick={resetImport}
                                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold"
                                    >
                                        Upload File Baru
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {csvData.length === 0 && !isProcessing && (
                        <div className="text-center py-8 text-slate-400">
                            <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Upload file CSV dari Google Form</p>
                            <p className="text-sm mt-2">File → Download → CSV</p>
                            <p className="text-xs mt-4 text-slate-500">
                                Data akan langsung masuk ke Supabase, no coding needed! 🚀
                            </p>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedEntry && (
                    <div
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedEntry(null)}
                    >
                        <div
                            className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={`px-5 py-4 flex items-center justify-between ${selectedEntry.status === 'invalid'
                                ? 'bg-red-900/50'
                                : selectedEntry.status === 'existing'
                                    ? 'bg-blue-900/50'
                                    : 'bg-green-900/50'
                                }`}>
                                <div>
                                    <h3 className="font-bold text-lg truncate">{selectedEntry.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedEntry.status === 'invalid'
                                        ? 'bg-red-600'
                                        : selectedEntry.status === 'existing'
                                            ? 'bg-blue-600'
                                            : 'bg-green-600'
                                        }`}>
                                        {selectedEntry.status === 'invalid' ? 'TIDAK VALID'
                                            : selectedEntry.status === 'existing' ? 'SUDAH ADA'
                                                : 'DATA BARU'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4">
                                {/* Reasons Section */}
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-400 mb-2 flex items-center gap-2">
                                        <Info size={16} /> Reasoning
                                    </h4>
                                    <div className="bg-slate-900/50 rounded-xl p-3 space-y-1">
                                        {selectedEntry.reasons.map((reason, i) => (
                                            <p key={i} className={`text-sm ${reason.startsWith('✓') ? 'text-green-400'
                                                : reason.startsWith('⚠') ? 'text-yellow-400'
                                                    : selectedEntry.status === 'invalid' ? 'text-red-400'
                                                        : 'text-slate-300'
                                                }`}>
                                                {reason}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Warnings Section */}
                                {selectedEntry.warnings.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm text-yellow-400 mb-2 flex items-center gap-2">
                                            <AlertCircle size={16} /> Data Kurang
                                        </h4>
                                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-3 space-y-1">
                                            {selectedEntry.warnings.map((warning, i) => (
                                                <p key={i} className="text-sm text-yellow-300">
                                                    • {warning}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Extracted Data Section */}
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-400 mb-2 flex items-center gap-2">
                                        <Eye size={16} /> Data yang Diekstrak
                                    </h4>
                                    <div className="bg-slate-900/50 rounded-xl divide-y divide-slate-700 overflow-hidden">
                                        {/* Main fields */}
                                        <div className="p-3 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-slate-500 block text-xs">Universitas</span>
                                                <span className={selectedEntry.university ? '' : 'text-red-400'}>
                                                    {selectedEntry.university || '(kosong)'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-xs">Jurusan</span>
                                                <span className={selectedEntry.major ? '' : 'text-red-400'}>
                                                    {selectedEntry.major || '(kosong)'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-xs">Angkatan</span>
                                                <span>{selectedEntry.angkatan}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-xs">Kategori</span>
                                                <span>{selectedEntry.category}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-xs">Jalur</span>
                                                <span>{selectedEntry.path || '(kosong)'}</span>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="p-3 space-y-2 text-sm">
                                            <p>
                                                <span className="text-slate-500">Email: </span>
                                                <span className={selectedEntry.email ? 'text-blue-400' : 'text-red-400'}>
                                                    {selectedEntry.email || '(kosong)'}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-slate-500">WhatsApp: </span>
                                                <span className={selectedEntry.whatsapp ? 'text-green-400' : 'text-red-400'}>
                                                    {selectedEntry.whatsapp || '(kosong)'}
                                                </span>
                                            </p>
                                            <p>
                                                <span className="text-slate-500">Instagram: </span>
                                                <span className={selectedEntry.instagram ? 'text-pink-400' : 'text-red-400'}>
                                                    {selectedEntry.instagram ? `@${selectedEntry.instagram}` : '(kosong)'}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Achievements */}
                                        {selectedEntry.achievements.length > 0 && (
                                            <div className="p-3 text-sm">
                                                <span className="text-slate-500 block mb-1">Prestasi</span>
                                                <ul className="list-disc list-inside">
                                                    {selectedEntry.achievements.map((a, i) => (
                                                        <li key={i} className="text-yellow-400">{a}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Raw Data Debug */}
                                <details className="group">
                                    <summary className="font-semibold text-sm text-slate-500 cursor-pointer hover:text-slate-300 flex items-center gap-2">
                                        <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                                        Raw Data (Debug)
                                    </summary>
                                    <div className="mt-2 bg-slate-900 rounded-xl p-3 text-xs font-mono overflow-x-auto">
                                        {Object.entries(selectedEntry.rawData).map(([key, value]) => (
                                            <p key={key} className="py-0.5">
                                                <span className="text-slate-500">{key}:</span>{' '}
                                                <span className="text-slate-300">{value || '(kosong)'}</span>
                                            </p>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </RequireAdmin>
    );
}
