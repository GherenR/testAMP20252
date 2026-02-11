import type { VercelRequest, VercelResponse } from '@vercel/node';

// Prompt templates for each subtes based on Pahamify style
const SUBTES_PROMPTS: Record<string, string> = {
    'penalaran-umum': `Generate SNBT Penalaran Umum questions in Indonesian. Focus on:
- Silogisme (syllogism): "Semua A adalah B. Semua B adalah C. Maka..."
- Modus Tollens/Ponens: "Jika P maka Q. Tidak Q, maka..."
- Pola bilangan/deret: "Pola: 2, 6, 12, 20, ... Bilangan selanjutnya..."
- Penalaran logis: "A > B, B > C. Pernyataan yang PASTI BENAR..."
- Analogi: "Panas : Dingin = Terang : ..."

Example format:
{
  "pertanyaan": "Jika Toktok Shop dibuka kembali, Riu dan Maha akan membeli sepatu. Riu tidak membeli sepatu.\\n\\nSimpulan yang BENAR adalah...",
  "opsi": ["Toktok Shop dibuka dan Maha membeli", "Toktok Shop tidak dibuka", "Maha tetap membeli", "Tidak dapat disimpulkan", "Riu akan membeli nanti"],
  "jawabanBenar": 1,
  "pembahasan": "Modus Tollens: Jika P maka Q. Tidak Q, maka tidak P."
}`,

    'pengetahuan-pemahaman-umum': `Generate SNBT Pengetahuan & Pemahaman Umum questions in Indonesian. Focus on:
- Sinonim kata: "Sinonim 'ameliorasi'..."
- Antonim kata: "Antonim 'heterogen'..."
- Kata baku KBBI: "Kata baku yang tepat..."
- Penulisan EYD: "Penulisan yang benar menurut EYD..."
- Makna kata: "Makna kata 'sporadis'..."
- Peribahasa/idiom: "Arti peribahasa..."

Use vocabulary commonly tested in UTBK/SNBT.`,

    'pemahaman-bacaan-menulis': `Generate SNBT Pemahaman Bacaan & Menulis questions in Indonesian. Focus on:
- Ide pokok paragraf: Provide short paragraph, ask main idea
- Majas/gaya bahasa: "Kalimat personifikasi/metafora..."
- Sikap/sudut pandang penulis: Based on text analysis
- Konjungsi: "baik...maupun adalah konjungsi..."
- Melengkapi kalimat: "Kata penghubung yang tepat..."
- Struktur teks: "Paragraf di atas termasuk jenis..."`,

    'pengetahuan-kuantitatif': `Generate SNBT Pengetahuan Kuantitatif questions in Indonesian. Focus on:
- Eksponen: "Jika 2^x = 32, nilai x..."
- Persentase: "15% dari 240..."
- Rata-rata/statistik: "Rata-rata dari 5,8,12,15,20..."
- FPB/KPK: "FPB dari 48 dan 72..."
- Akar kuadrat: "√144 + √81 = ..."
- Perbandingan: "Perbandingan umur A dan B..."

Keep calculations simple but require logical thinking.`,

    'literasi-indonesia': `Generate SNBT Literasi Bahasa Indonesia questions in Indonesian. Focus on:
- Analisis data/tabel/grafik: Provide data, ask interpretation
- Membaca kritis: Paragraph about social issues, ask conclusions
- Statistik dalam teks: "Data menunjukkan... Peningkatan berapa..."
- Argumen dalam teks: "Gagasan utama paragraf..."
- Implikasi data: "Berdasarkan data, implikasi yang tepat..."

Use current Indonesian issues: digital economy, environment, health, education.`,

    'literasi-inggris': `Generate SNBT Literasi Bahasa Inggris questions in English. Focus on:
- Grammar: "Choose the correct sentence: She ___ coffee"
- Conditional: "If I ___ rich, I would travel"
- Vocabulary: "Ubiquitous means..."
- Antonyms/Synonyms: "Antonym of 'abundant'..."
- Preposition/Conjunction: "___ the rain, the event continued"
- Reading comprehension: Short passage with question

Keep at intermediate English level (B1-B2).`,

    'penalaran-matematika': `Generate SNBT Penalaran Matematika questions in Indonesian. Focus on:
- Fungsi: "f(x) = 2x² - 3x + 1, maka f(2) = ..."
- Gradien/persamaan garis: "Gradien garis melalui (1,3) dan (4,9)..."
- Deret aritmatika/geometri: "Deret dengan a=5, b=3. S₁₀ = ..."
- Logaritma: "log₂32 + log₃27 = ..."
- Persamaan kuadrat: "x²-5x+6=0, akar-akarnya..."
- Geometri dasar: Luas, keliling, volume

Show calculation in pembahasan.`
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

    const { subtes, jumlah = 5 } = req.body;

    if (!subtes || !SUBTES_PROMPTS[subtes]) {
        return res.status(400).json({ error: 'Invalid subtes type' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error('SERVER ERROR: Gemini API key is missing');
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const cleanKey = GEMINI_API_KEY.trim();

    // Calculate Difficulty Distribution
    let difficultyInstruction = "4. Difficulty: Create a mix of behaviors (Mudah, Sedang, Sulit).";

    if (jumlah >= 5) {
        const units = Math.floor(jumlah / 5);
        const mudah = units;
        const sulit = units;
        const sedang = jumlah - mudah - sulit;

        difficultyInstruction = `4. Difficulty Distribution (STRICT):
   - Mudah: ${mudah} questions
   - Sedang: ${sedang} questions
   - Sulit: ${sulit} questions`;
    }

    const systemPrompt = `You are an expert SNBT question creator. Create ${jumlah} questions for ${SUBTES_NAMES[subtes]}.
Rules:
1. Output ONLY a valid JSON Array.
2. No markdown, no "Here is the JSON".
3. Use Unicode for Math (x², π, √, etc).
${difficultyInstruction}
5. 5 Options (A-E).`;

    const userPrompt = `${SUBTES_PROMPTS[subtes]}
    
    STRICT JSON OUTPUT:
    [
      {
        "pertanyaan": "Question...",
        "opsi": ["A", "B", "C", "D", "E"],
        "jawabanBenar": 0,
        "pembahasan": "Exp...",
        "difficulty": "sedang"
      }
    ]`;

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
                    contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 3000,
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.status} ${await response.text()}`);
            }

            const data = await response.json();
            lastContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

            // Parse
            const questions = cleanAndExtractJSON(lastContent);

            if (!Array.isArray(questions)) {
                throw new Error('Parsed result is not an array');
            }

            // Map and Validate
            const formattedQuestions = questions.map((q: any, idx: number) => ({
                subtes,
                nomor_soal: idx + 1,
                pertanyaan: q.pertanyaan || 'Pertanyaan kosong',
                opsi: Array.isArray(q.opsi) ? q.opsi : [],
                jawaban_benar: typeof q.jawabanBenar === 'number' ? q.jawabanBenar : (typeof q.jawaban_benar === 'number' ? q.jawaban_benar : 0),
                pembahasan: q.pembahasan || '',
                difficulty: q.difficulty || 'sedang'
            }));

            console.log(`[generate-soal] Success on attempt ${attempts}`);
            return res.status(200).json({ success: true, questions: formattedQuestions });

        } catch (error: any) {
            console.error(`[generate-soal] Attempt ${attempts} failed:`, error.message);
            lastError = error;
            // Loop to retry
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
