-- Tryout Management Tables

-- 1. Tryouts table (admin manages tryouts)
CREATE TABLE IF NOT EXISTS tryouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    tanggal_rilis TIMESTAMPTZ NOT NULL,
    tanggal_mulai TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tryout soal (questions per tryout)
CREATE TABLE IF NOT EXISTS tryout_soal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tryout_id UUID REFERENCES tryouts(id) ON DELETE CASCADE,
    subtes VARCHAR(50) NOT NULL,
    nomor_soal INTEGER NOT NULL,
    pertanyaan TEXT NOT NULL,
    opsi JSONB NOT NULL,
    jawaban_benar INTEGER NOT NULL,
    pembahasan TEXT,
    tingkat_kesulitan VARCHAR(20) DEFAULT 'sedang', -- 'mudah', 'sedang', 'sulit' (HOTS)
    bobot_nilai INTEGER DEFAULT 2, -- mudah=1, sedang=2, sulit=3
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User tryout attempts
CREATE TABLE IF NOT EXISTS tryout_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tryout_id UUID REFERENCES tryouts(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    current_subtes VARCHAR(50),
    jawaban JSONB DEFAULT '{}',
    skor_per_subtes JSONB DEFAULT '{}',
    total_skor INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress'
);

-- Indexes (drop if exists first)
DROP INDEX IF EXISTS idx_tryout_soal_tryout;
DROP INDEX IF EXISTS idx_tryout_soal_subtes;
DROP INDEX IF EXISTS idx_tryout_attempts_user;
DROP INDEX IF EXISTS idx_tryout_attempts_tryout;

CREATE INDEX idx_tryout_soal_tryout ON tryout_soal(tryout_id);
CREATE INDEX idx_tryout_soal_subtes ON tryout_soal(subtes);
CREATE INDEX idx_tryout_attempts_user ON tryout_attempts(user_id);
CREATE INDEX idx_tryout_attempts_tryout ON tryout_attempts(tryout_id);

-- RLS Policies
ALTER TABLE tryouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryout_soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryout_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read active tryouts" ON tryouts;
DROP POLICY IF EXISTS "Public read tryout soal" ON tryout_soal;
DROP POLICY IF EXISTS "Users manage own attempts" ON tryout_attempts;
DROP POLICY IF EXISTS "Admin full access tryouts" ON tryouts;
DROP POLICY IF EXISTS "Admin full access soal" ON tryout_soal;

-- Public can read active tryouts
CREATE POLICY "Public read active tryouts" ON tryouts FOR SELECT USING (is_active = true);

-- Public can read soal from active tryouts
CREATE POLICY "Public read tryout soal" ON tryout_soal FOR SELECT 
    USING (EXISTS (SELECT 1 FROM tryouts WHERE id = tryout_id AND is_active = true));

-- Users can manage their own attempts
CREATE POLICY "Users manage own attempts" ON tryout_attempts FOR ALL 
    USING (auth.uid() = user_id);

-- Admin full access (service role)
CREATE POLICY "Admin full access tryouts" ON tryouts FOR ALL USING (true);
CREATE POLICY "Admin full access soal" ON tryout_soal FOR ALL USING (true);
