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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { subtes, jumlah = 5 } = req.body;

    if (!subtes || !SUBTES_PROMPTS[subtes]) {
        return res.status(400).json({ error: 'Invalid subtes type' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error('SERVER ERROR: Gemini API key is missing in environment variables');
        return res.status(500).json({ error: 'Gemini API key not configured on server (GEMINI_API_KEY)' });
    }

    try {
        const systemPrompt = `You are an expert SNBT (Seleksi Nasional Berdasarkan Tes) question creator for Indonesian university admission tests. 
Your task is to create questions that are:
1. Similar in style and difficulty to Pahamify tryout questions
2. Have exactly 5 answer options (A-E)
3. Include correct answer index (0-4) and brief explanation
4. Written in Indonesian (except Literasi Inggris which is in English)

Output ONLY valid JSON array, no markdown, no explanation outside JSON.`;

        const userPrompt = `${SUBTES_PROMPTS[subtes]}

Generate ${jumlah} different questions for ${SUBTES_NAMES[subtes]} subtest.

Return as JSON array:
[
  {
    "pertanyaan": "Question text here",
    "opsi": ["Option A", "Option B", "Option C", "Option D", "Option E"],
    "jawabanBenar": 0,
    "pembahasan": "Brief explanation"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text. DO NOT use markdown code blocks.`;

        console.log(`[generate-soal] Requesting ${jumlah} questions for ${subtes} using Gemini...`);

        // Try v1 (stable) endpoint with gemini-pro which is most widely available
        const cleanKey = GEMINI_API_KEY.trim();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${cleanKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\n${userPrompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2000, // gemini-pro limit is 2048
                    // responseMimeType: "application/json" // REMOVED: Only supported in gemini-1.5
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[generate-soal] Gemini API error:', response.status, errorText);
            return res.status(500).json({
                error: `Gemini API Error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        // Parse JSON from response
        let questions;
        try {
            // Try to extract JSON from response (in case there's extra text)
            // Remove markdown code blocks if present
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();

            const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
            questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('[generate-soal] JSON parse error. Content received:', content);
            return res.status(500).json({
                error: 'Failed to parse generated questions',
                receivedContent: content.substring(0, 200) + '...'
            });
        }

        // Validate and format questions
        if (!Array.isArray(questions)) {
            console.error('[generate-soal] Expected array but got:', typeof questions);
            return res.status(500).json({ error: 'AI response was not a valid array of questions' });
        }

        const formattedQuestions = questions.map((q: any, idx: number) => ({
            subtes,
            nomor_soal: idx + 1,
            pertanyaan: q.pertanyaan || '',
            opsi: Array.isArray(q.opsi) ? q.opsi : [],
            jawaban_benar: typeof q.jawabanBenar === 'number' ? q.jawabanBenar : (typeof q.jawaban_benar === 'number' ? q.jawaban_benar : 0),
            pembahasan: q.pembahasan || ''
        }));

        console.log(`[generate-soal] Successfully generated ${formattedQuestions.length} questions`);

        return res.status(200).json({
            success: true,
            questions: formattedQuestions
        });

    } catch (error: any) {
        console.error('[generate-soal] Internal server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
