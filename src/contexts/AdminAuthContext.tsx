import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
    const hasCheckedRef = useRef(false);

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

            const rawRole = data.role;
            // Normalize role: lowercase and trim
            const normalizedRole = rawRole?.toLowerCase().trim();

            const isSuperAdmin = normalizedRole === 'super_admin' || normalizedRole === 'super admin';
            const isAdmin = normalizedRole === 'admin';

            // Only admin and super_admin can access admin dashboard
            const isAdminRole = isAdmin || isSuperAdmin;

            // Return 'super_admin' internally if it's any variation of super admin
            const finalRole = isSuperAdmin ? 'super_admin' : (isAdmin ? 'admin' : rawRole);

            return { isAdmin: isAdminRole, role: finalRole };
        } catch {
            return { isAdmin: false, role: null };
        }
    };

    const checkAuth = useCallback(async () => {
        // Only run on first check - onAuthStateChange handles subsequent updates
        if (hasCheckedRef.current) return;

        setIsLoading(true);

        try {
            // Add timeout to prevent indefinite hanging
            const timeoutPromise = new Promise<'TIMEOUT'>((resolve) =>
                setTimeout(() => resolve('TIMEOUT'), 10000)
            );
            const userPromise = supabase.auth.getUser().then(res => {
                if (res.error || !res.data.user) return null;
                return res.data.user;
            });

            const result = await Promise.race([userPromise, timeoutPromise]);

            // On timeout, DON'T reset existing state - just stop loading
            // The onAuthStateChange listener will handle the auth state properly
            if (result === 'TIMEOUT') {
                console.warn('Auth check timed out - keeping existing state');
                setIsLoading(false);
                hasCheckedRef.current = true;
                return;
            }

            const authUser = result;
            if (!authUser) {
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
            } else {
                setUser(authUser);
                // Check admin status from database
                const { isAdmin: adminStatus, role } = await checkAdminStatus(authUser.id);
                setIsAdmin(adminStatus);
                setAdminRole(role);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            // On error, DON'T reset state either - just log
        } finally {
            setIsLoading(false);
            hasCheckedRef.current = true;
        }
    }, []);

    useEffect(() => {
        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                // Check admin status on SIGNED_IN and INITIAL_SESSION
                // INITIAL_SESSION fires when the page loads with an existing session
                // SIGNED_IN fires after a fresh login
                // Both need admin status checked before we set isLoading=false
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    const status = await checkAdminStatus(session.user.id);
                    setIsAdmin(status.isAdmin);
                    setAdminRole(status.role);
                }
                // For TOKEN_REFRESHED, keep existing admin state
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

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
