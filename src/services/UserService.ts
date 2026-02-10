// UserService: All user-related Supabase queries
import { supabase } from '../supabaseClient';

export interface User {
    id: string;
    email: string;
    name: string;
    full_name?: string;
    role: string;
    kelas?: string;
    angkatan?: number;
    phone?: string;
    instagram?: string;
    target_university_1?: string;
    target_major_1?: string;
    target_university_2?: string;
    target_major_2?: string;
    created_at: string;
    // Extended profile data
    profile?: {
        full_name?: string;
        kelas?: string;
        angkatan?: number;
        phone?: string;
        instagram?: string;
        target_university_1?: string;
        target_major_1?: string;
        target_university_2?: string;
        target_major_2?: string;
    };
}

export const UserService = {
    // Get all users from users table with extended profile data (JOIN + paginasi)
    async getAllUsers({ limit = 100, offset = 0 } = {}) {
        // Ambil data langsung dari tabel users saja
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return (data || []).map((user: any) => ({
            ...user
        }));
    },

    // Update user in users table (trigger will sync role to user_profiles)
    async updateUser(id: string, updates: Partial<User>) {
        const { error } = await supabase
            .from('users')
            .update({
                name: updates.full_name || updates.name,
                role: updates.role,
                full_name: updates.full_name,
                kelas: updates.kelas,
                angkatan: updates.angkatan,
                phone: updates.phone,
                instagram: updates.instagram,
                target_university_1: updates.target_university_1,
                target_major_1: updates.target_major_1,
                target_university_2: updates.target_university_2,
                target_major_2: updates.target_major_2,
            })
            .eq('id', id);
        if (error) throw error;
    },

    // Update user role in users table
    async updateUserRole(id: string, role: string) {
        const { error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id);
        if (error) throw error;
    },

    // Delete user from users table
    async deleteUser(id: string) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
