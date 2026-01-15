import { ReactNode } from 'react';

export type InstitutionCategory = 'PTN' | 'PTS' | 'PTLN' | 'All';

export interface Mentor {
  name: string;
  university: string;
  major: string;
  path: string;
  category: InstitutionCategory;
  achievements?: string[];
  instagram?: string;
  phone?: string;
}

export interface SlideData {
  id: string;
  title?: string;
  subtitle?: string;
  content: ReactNode;
}