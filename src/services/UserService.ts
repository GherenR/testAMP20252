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
        // Join users with user_profiles, paginated
        const { data, error } = await supabase
            .from('users')
            .select('*, user_profiles: user_profiles(*)')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Map join result ke User type
        return (data || []).map((user: any) => {
            const profile = user.user_profiles?.[0] || user.user_profiles || {};
            return {
                ...user,
                full_name: profile.full_name || user.name,
                kelas: profile.kelas,
                angkatan: profile.angkatan,
                phone: profile.phone,
                instagram: profile.instagram,
                target_university_1: profile.target_university_1,
                target_major_1: profile.target_major_1,
                target_university_2: profile.target_university_2,
                target_major_2: profile.target_major_2,
            } as User;
        });
    },

    // Update user in users table (trigger will sync role to user_profiles)
    async updateUser(id: string, updates: Partial<User>) {
        const { error } = await supabase
            .from('users')
            .update({
                name: updates.full_name || updates.name,
                role: updates.role,
            })
            .eq('id', id);
        if (error) throw error;

        // Also update user_profiles if extended fields provided
        if (updates.full_name || updates.kelas || updates.angkatan) {
            await supabase
                .from('user_profiles')
                .update({
                    full_name: updates.full_name,
                    kelas: updates.kelas,
                    angkatan: updates.angkatan,
                    phone: updates.phone,
                    instagram: updates.instagram,
                })
                .eq('id', id);
        }
    },

    // Update user role in users table
    async updateUserRole(id: string, role: string) {
        const { error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id);
        if (error) throw error;
        // Trigger will sync to user_profiles
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
