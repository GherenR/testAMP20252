// UserService: All user-related Supabase queries
import { supabase } from '../supabaseClient';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
    password?: string;
}

export const UserService = {
    async getAllUsers() {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data as User[];
    },
    async updateUser(id: string, updates: Partial<User>) {
        const { error } = await supabase.from('users').update(updates).eq('id', id);
        if (error) throw error;
    },
    async createUser(user: Partial<User>) {
        const { error } = await supabase.from('users').insert(user);
        if (error) throw error;
    },
    async deleteUser(id: string) {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
    },
};
