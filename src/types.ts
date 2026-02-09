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
