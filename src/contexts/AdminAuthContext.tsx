import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AdminAuthContextType {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const ALLOWED_EMAILS = ['gherenramandra@gmail.com', 'saputragheren@gmail.com'];

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChecked, setHasChecked] = useState(false);

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
            } else {
                setUser(user);
                setIsAdmin(ALLOWED_EMAILS.includes(user.email || ''));
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setUser(null);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
            setHasChecked(true);
        }
    }, [hasChecked]);

    useEffect(() => {
        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setIsAdmin(ALLOWED_EMAILS.includes(session.user.email || ''));
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [checkAuth]);

    return (
        <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, checkAuth }}>
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
