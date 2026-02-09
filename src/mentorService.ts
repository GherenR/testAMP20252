/**
 * Mentor Service - Supabase Database Operations
 * Full CRUD operations for alumni/mentor data
 */

import { supabase } from './supabaseClient';
import type { InstitutionCategory } from './types';

// Database mentor type (matches Supabase table)
export interface MentorDB {
    id: number;
    name: string;
    university: string;
    major: string;
    path: string;
    category: InstitutionCategory;
    angkatan: number;
    whatsapp: string | null;
    instagram: string | null;
    email: string | null;
    achievements: string[];
    created_at: string;
    updated_at: string;
}

// Input type for creating/updating mentor
export interface MentorInput {
    name: string;
    university: string;
    major: string;
    path: string;
    category: InstitutionCategory;
    angkatan: number;
    whatsapp?: string;
    instagram?: string;
    email?: string;
    achievements?: string[];
}

// Service response type
export interface ServiceResponse<T> {
    data: T | null;
    error: string | null;
}

/**
 * Get all mentors from database
 */
export async function getAllMentors(): Promise<ServiceResponse<MentorDB[]>> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching mentors:', error);
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to fetch mentors' };
    }
}

/**
 * Get mentors by category
 */
export async function getMentorsByCategory(category: InstitutionCategory): Promise<ServiceResponse<MentorDB[]>> {
    try {
        let query = supabase.from('mentors').select('*');

        if (category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) {
            console.error('Error fetching mentors by category:', error);
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to fetch mentors' };
    }
}

/**
 * Get mentors by angkatan (graduation year)
 */
export async function getMentorsByAngkatan(angkatan: number): Promise<ServiceResponse<MentorDB[]>> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .select('*')
            .eq('angkatan', angkatan)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching mentors by angkatan:', error);
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to fetch mentors' };
    }
}

/**
 * Get single mentor by ID
 */
export async function getMentorById(id: number): Promise<ServiceResponse<MentorDB>> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching mentor:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to fetch mentor' };
    }
}

/**
 * Create new mentor
 */
export async function createMentor(mentor: MentorInput): Promise<ServiceResponse<MentorDB>> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .insert([{
                name: mentor.name,
                university: mentor.university,
                major: mentor.major,
                path: mentor.path || 'Mandiri',
                category: mentor.category || 'PTN',
                angkatan: mentor.angkatan || 2025,
                whatsapp: mentor.whatsapp || null,
                instagram: mentor.instagram || null,
                email: mentor.email || null,
                achievements: mentor.achievements || []
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating mentor:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to create mentor' };
    }
}

/**
 * Create multiple mentors at once (bulk insert)
 */
export async function createMentorsBulk(mentors: MentorInput[]): Promise<ServiceResponse<MentorDB[]>> {
    try {
        const insertData = mentors.map(mentor => ({
            name: mentor.name,
            university: mentor.university,
            major: mentor.major,
            path: mentor.path || 'Mandiri',
            category: mentor.category || 'PTN',
            angkatan: mentor.angkatan || 2025,
            whatsapp: mentor.whatsapp || null,
            instagram: mentor.instagram || null,
            email: mentor.email || null,
            achievements: mentor.achievements || []
        }));

        const { data, error } = await supabase
            .from('mentors')
            .insert(insertData)
            .select();

        if (error) {
            console.error('Error bulk creating mentors:', error);
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to create mentors' };
    }
}

/**
 * Update mentor by ID
 */
export async function updateMentor(id: number, updates: Partial<MentorInput>): Promise<ServiceResponse<MentorDB>> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating mentor:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to update mentor' };
    }
}

/**
 * Delete mentor by ID
 */
export async function deleteMentor(id: number): Promise<ServiceResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('mentors')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting mentor:', error);
            return { data: false, error: error.message };
        }

        return { data: true, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: false, error: 'Failed to delete mentor' };
    }
}

/**
 * Search mentors by name, university, or major
 */
export async function searchMentors(query: string): Promise<ServiceResponse<MentorDB[]>> {
    try {
        const searchTerm = `%${query}%`;

        const { data, error } = await supabase
            .from('mentors')
            .select('*')
            .or(`name.ilike.${searchTerm},university.ilike.${searchTerm},major.ilike.${searchTerm}`)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error searching mentors:', error);
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to search mentors' };
    }
}

/**
 * Check if mentor with name already exists
 */
export async function mentorExists(name: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .select('id')
            .ilike('name', name)
            .maybeSingle();

        if (error) {
            console.error('Error checking mentor existence:', error);
            return false;
        }

        return data !== null;
    } catch (err) {
        console.error('Unexpected error:', err);
        return false;
    }
}

/**
 * Get total count of mentors
 */
export async function getMentorCount(): Promise<ServiceResponse<number>> {
    try {
        const { count, error } = await supabase
            .from('mentors')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error counting mentors:', error);
            return { data: null, error: error.message };
        }

        return { data: count || 0, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to count mentors' };
    }
}

/**
 * Get distinct angkatan years
 */
export async function getDistinctAngkatan(): Promise<ServiceResponse<number[]>> {
    try {
        const { data, error } = await supabase
            .from('mentors')
            .select('angkatan')
            .order('angkatan', { ascending: false });

        if (error) {
            console.error('Error fetching angkatan:', error);
            return { data: null, error: error.message };
        }

        // Get unique values
        const unique = [...new Set(data?.map(d => d.angkatan) || [])];
        return { data: unique, error: null };
    } catch (err) {
        console.error('Unexpected error:', err);
        return { data: null, error: 'Failed to fetch angkatan' };
    }
}
