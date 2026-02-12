import { ReactNode } from 'react';

export type InstitutionCategory = 'PTN' | 'PTS' | 'PTLN' | 'All';

export interface Mentor {
  name: string;
  university: string;
  major: string;
  path: string;
  category: InstitutionCategory;
  angkatan: number;
  achievements?: string[];
  instagram?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface SlideData {
  id: string;
}

// --- Tryout Definitions ---

export interface Tryout {
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

export interface TryoutSoal {
  id: string;
  tryout_id: string;
  subtes: string;
  nomor_soal: number;
  pertanyaan: string;
  opsi: string[];
  jawaban_benar: number;
  pembahasan: string;
  difficulty_level?: 'mudah' | 'sedang' | 'sulit';
  bobot_nilai?: number;
  teks_bacaan?: string | null;
  id_wacana?: string | null;
  image_url?: string | null;
  tipe_soal?: 'pilihan_ganda' | 'isian' | 'pg_kompleks' | 'benar_salah';
  jawaban_kompleks?: any;
  table_headers?: string[];
}

export interface SubtesResult {
  subtes: string;
  benar: number;
  salah: number;
  total: number;
  skorMentah: number;
  skorMaksimal: number;
  skorNormalized: number;
  started_at?: string;
  finished_at?: string;
}

export interface TryoutAttempt {
  id: string;
  tryout_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  current_subtes: string | null;
  jawaban: Record<string, any>; // { [soalId]: answer }
  skor_per_subtes: Record<string, SubtesResult>;
  total_skor: number;
  status: 'in_progress' | 'completed';
  skor_akhir: number;
  flagged_questions?: string[]; // Array of question IDs
}
