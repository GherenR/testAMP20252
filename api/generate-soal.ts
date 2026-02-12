import type { VercelRequest, VercelResponse } from '@vercel/node';

// Prompt templates for each subtes based on Pahamify style
const SUBTES_PROMPTS: Record<string, string> = {
    'penalaran-umum': `Generate SNBT Penalaran Umum questions in Indonesian. Focus on:
- Silogisme (syllogism): "Semua A adalah B. Semua B adalah C. Maka..."
- Modus Tollens/Ponens: "Jika P maka Q. Tidak Q, maka..."
- Pola bilangan/deret: "Pola: 2, 6, 12, 20, ... Bilangan selanjutnya..."
- Penalaran logis: "A > B, B > C. Pernyataan yang PASTI BENAR..."
- Analogi: "Panas : Dingin = Terang : ..."`,

    'pengetahuan-pemahaman-umum': `Generate SNBT Pengetahuan & Pemahaman Umum questions in Indonesian.
IMPORTANT: Questions MUST be grouped by a reading passage (wacana).
Focus on:
- Sinonim kata: "Sinonim 'ameliorasi'..."
- Antonim kata: "Antonim 'heterogen'..."
- Makna kata: "Makna kata 'sporadis'..."
- Analisis teks: Main idea, purpose of the text.

Structure:
Provide a passage (teks_bacaan) and then 2-3 questions based on that same passage.`,

    'pemahaman-bacaan-menulis': `Generate SNBT Pemahaman Bacaan & Menulis questions in Indonesian.
IMPORTANT: Questions MUST be grouped by a reading passage (wacana).
Focus on:
- Ide pokok paragraf: Provide short paragraph, ask main idea
- Majas/gaya bahasa: "Kalimat personifikasi/metafora..."
- Struktur teks: "Paragraf di atas termasuk jenis..."
- Kelengkapan kalimat/ EYD / PUEBI.

Structure:
Provide a passage (teks_bacaan) and then 2-3 questions based on that same passage.`,

    'pengetahuan-kuantitatif': `Generate SNBT Pengetahuan Kuantitatif questions in Indonesian.
Most questions should be independent (teks_bacaan: null).
Focus on:
- Eksponen, Persentase, Rata-rata, FPB/KPK, Akar kuadrat, Perbandingan.
Use Unicode for math symbols.`,

    'literasi-indonesia': `Generate SNBT Literasi Bahasa Indonesia questions in Indonesian.
CRITICAL: All questions MUST be grouped by a reading passage (wacana).
Focus on:
- Analisis teks lengkap (social issues, digital economy, environment).
- Membaca kritis: Conclusion, implication, author's perspective.
- Interpretasi data/statistik dalam teks.

Structure:
Provide a LONG passage (teks_bacaan, 200-400 words) and then 3-5 questions based on it.`,

    'literasi-inggris': `Generate SNBT Literasi Bahasa Inggris questions in English.
CRITICAL: All questions MUST be grouped by a reading passage (wacana).
Focus on:
- Reading comprehension: Main idea, reference, inference, vocabulary in context.
- Author's purpose/tone.

Structure:
Provide a LONG passage (teks_bacaan, 200-400 words) and then 3-5 questions based on it.`,

    'penalaran-matematika': `Generate SNBT Penalaran Matematika questions in Indonesian.
Questions can be independent or grouped by a context/story.
Focus on:
- Fungsi, Gradien, Deret, Logaritma, Persamaan kuadrat, Geometri.
Use Unicode for math symbols.`
};

const SUBTES_NAMES: Record<string, string> = {
    'penalaran-umum': 'Penalaran Umum',
    'pengetahuan-pemahaman-umum': 'Pengetahuan & Pemahaman Umum',
    'pemahaman-bacaan-menulis': 'Pemahaman Bacaan & Menulis',
    'pengetahuan-kuantitatif': 'Pengetahuan Kuantitatif',
    'literasi-indonesia': 'Literasi Bahasa Indonesia',
    'literasi-inggris': 'Literasi Bahasa Inggris',
    'penalaran-matematika': 'Penalaran Matematika'
};

// Helper to clean and extract JSON
function cleanAndExtractJSON(text: string): any {
    // 1. Remove Markdown code blocks
    let clean = text.replace(/```json\n?|```/g, '').trim();

    // 2. Find array bounds
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');

    if (firstBracket !== -1 && lastBracket !== -1) {
        clean = clean.substring(firstBracket, lastBracket + 1);
    }

    // 3. Try standard parse
    try {
        return JSON.parse(clean);
    } catch (e) {
        // 4. Fallback: Try to fix common issues (trailing commas, etc)
        // Simple fix: remove trailing commas before closing brackets/braces
        clean = clean.replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(clean);
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { subtes, jumlahValue = 5 } = req.body;
    const jumlah = Number(jumlahValue) || 5;

    if (!subtes || !SUBTES_PROMPTS[subtes]) {
        return res.status(400).json({ error: 'Invalid subtes type' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error('SERVER ERROR: Gemini API key is missing');
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const cleanKey = GEMINI_API_KEY.trim();

    const systemPrompt = `You are an expert SNBT question creator. Create questions for ${SUBTES_NAMES[subtes]} totalling ${jumlah} questions.
Rules:
1. Output ONLY a valid JSON Array of Group objects.
2. Group questions by "Reading Passage" (Teks Bacaan).
3. Use Unicode for Math (x², π, √, etc) or LaTeX \\( ... \\) for complex formulas.
4. Difficulty Distribution: Mix of Mudah, Sedang, Sulit.
5. Mix of Question Types:
   - "pilihan_ganda": Standard 5 options (A-E).
   - "pg_kompleks": Multiple correct answers from options.
   - "isian": Short text/number answer.
   - "benar_salah": A list of statements that must be marked as Benar/Salah.
6. Clean text: No random newlines in the middle of sentences in teks_bacaan.`;

    const userPrompt = `${SUBTES_PROMPTS[subtes]}
    
    STRICT JSON SCHEMA (Grouped):
    [
      {
        "id_wacana": "wacana_01",
        "teks_bacaan": "String teks lengkap...",
        "daftar_soal": [
          {
            "pertanyaan": "Question...",
            "tipe_soal": "pilihan_ganda" | "pg_kompleks" | "isian" | "benar_salah",
            "opsi": ["A", "B", "C", "D", "E"], // For 'isian', set to []. For 'benar_salah', set to list of statements.
            "jawabanBenar": 0, // ONLY for 'pilihan_ganda'
            "jawabanKompleks": [0, 2] | "string answer" | [true, false], // Array of indices for 'pg_kompleks', String for 'isian', Array of booleans for 'benar_salah'
            "pembahasan": "Exp...",
            "difficulty": "sedang"
          }
        ]
      }
    ]
    
    If a question doesn't need a passage, set teks_bacaan and id_wacana to null.`;

    // MAX RETRIES
    let attempts = 0;
    const MAX_RETRIES = 2;
    let lastError = null;
    let lastContent = "";

    while (attempts < MAX_RETRIES) {
        attempts++;
        console.log(`[generate-soal] Attempt ${attempts} for ${subtes}...`);

        try {
            // Use gemini-1.5-flash for stability
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nTarget TOTAL questions: ${jumlah}` }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4000,
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            lastContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

            // Parse Grouped Data
            const groups = cleanAndExtractJSON(lastContent);

            if (!Array.isArray(groups)) {
                throw new Error('Parsed result is not an array of groups');
            }

            // Flatten for internal legacy handling if needed, but we'll return the Grouped structure
            // to the frontend to handle.
            const formattedGroups = groups.map((g: any, gIdx: number) => ({
                id_wacana: g.id_wacana || (g.teks_bacaan ? `wacana_${Date.now()}_${gIdx}` : null),
                teks_bacaan: g.teks_bacaan || null,
                daftar_soal: (g.daftar_soal || []).map((q: any) => ({
                    subtes,
                    pertanyaan: q.pertanyaan || 'Pertanyaan kosong',
                    tipe_soal: q.tipe_soal || 'pilihan_ganda',
                    opsi: Array.isArray(q.opsi) ? q.opsi : [],
                    jawaban_benar: typeof q.jawabanBenar === 'number' ? q.jawabanBenar : (typeof q.jawaban_benar === 'number' ? q.jawaban_benar : 0),
                    jawaban_kompleks: q.jawabanKompleks !== undefined ? q.jawabanKompleks : (q.jawaban_kompleks !== undefined ? q.jawaban_kompleks : null),
                    pembahasan: q.pembahasan || '',
                    difficulty: q.difficulty || 'sedang'
                }))
            }));

            console.log(`[generate-soal] Success on attempt ${attempts}`);
            return res.status(200).json({ success: true, groups: formattedGroups });

        } catch (error: any) {
            console.error(`[generate-soal] Attempt ${attempts} failed:`, error.message);
            lastError = error;
        }
    }

    // If failed after retries
    console.error('[generate-soal] All attempts failed. Last content:', lastContent.substring(0, 200));
    return res.status(500).json({
        error: 'Failed to generate valid questions after retries',
        details: lastError?.message,
        receivedContent: lastContent.substring(0, 500)
    });
}
