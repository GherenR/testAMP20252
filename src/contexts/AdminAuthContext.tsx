import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AdminAuthContextType {
    user: User | null;
    isAdmin: boolean;
    adminRole: string | null; // 'admin' | 'super_admin' | null
    isLoading: boolean;
    checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminRole, setAdminRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);

    // Check admin status from users table (main admin table)
    const checkAdminStatus = async (userId: string): Promise<{ isAdmin: boolean; role: string | null }> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !data) {
                return { isAdmin: false, role: null };
            }

            // Only admin and super_admin can access admin dashboard
            const isAdminRole = data.role === 'admin' || data.role === 'super_admin';
            return { isAdmin: isAdminRole, role: data.role };
        } catch {
            return { isAdmin: false, role: null };
        }
    };

    const checkAuth = useCallback(async () => {
        // Only show loading on first check
        if (!hasChecked) {
            setIsLoading(true);
        }

        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
            } else {
                setUser(user);
                // Check admin status from database
                const { isAdmin: adminStatus, role } = await checkAdminStatus(user.id);
                setIsAdmin(adminStatus);
                setAdminRole(role);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setUser(null);
            setIsAdmin(false);
            setAdminRole(null);
        } finally {
            setIsLoading(false);
            setHasChecked(true);
        }
    }, [hasChecked]);

    useEffect(() => {
        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                // Check admin status from database
                const { isAdmin: adminStatus, role } = await checkAdminStatus(session.user.id);
                setIsAdmin(adminStatus);
                setAdminRole(role);
            } else {
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [checkAuth]);

    return (
        <AdminAuthContext.Provider value={{ user, isAdmin, adminRole, isLoading, checkAuth }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
}
