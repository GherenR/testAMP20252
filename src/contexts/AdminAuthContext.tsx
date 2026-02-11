import React, { createContext, useContext, useEffect, useState } from 'react';
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

    // Check admin status from users table (main admin table)
    const checkAdminStatus = async (userId: string): Promise<{ isAdmin: boolean; role: string | null }> => {
        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('ADMIN_CHECK_TIMEOUT')), 8000)
            );
            const queryPromise = supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

            if (error || !data) {
                console.warn('[AdminAuth] checkAdminStatus failed:', error);
                return { isAdmin: false, role: null };
            }

            const rawRole = data.role;
            // Normalize role: lowercase and trim
            const normalizedRole = rawRole?.toLowerCase().trim();

            const isSuperAdmin = normalizedRole === 'super_admin' || normalizedRole === 'super admin';
            const isAdminRole = normalizedRole === 'admin';

            // Only admin and super_admin can access admin dashboard
            const hasAccess = isAdminRole || isSuperAdmin;

            // Return 'super_admin' internally if it's any variation of super admin
            const finalRole = isSuperAdmin ? 'super_admin' : (isAdminRole ? 'admin' : rawRole);

            console.log('[AdminAuth] checkAdminStatus result:', { hasAccess, finalRole });
            return { isAdmin: hasAccess, role: finalRole };
        } catch (err: any) {
            if (err?.message === 'ADMIN_CHECK_TIMEOUT') {
                console.error('[AdminAuth] Admin status check timed out');
            }
            return { isAdmin: false, role: null };
        }
    };

    // Simplified: only use onAuthStateChange as the single source of truth
    // No separate checkAuth - this eliminates the race condition entirely
    useEffect(() => {
        console.log('[AdminAuth] Provider mounted - waiting for auth events');

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AdminAuth] Auth event:', event, '| Has session:', !!session?.user);

            if (session?.user) {
                setUser(session.user);

                // Check admin status for initial load and fresh login
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    console.log('[AdminAuth] Checking admin status for:', session.user.email);
                    const status = await checkAdminStatus(session.user.id);
                    setIsAdmin(status.isAdmin);
                    setAdminRole(status.role);
                    console.log('[AdminAuth] Admin status set:', status);
                }
                // For TOKEN_REFRESHED, keep existing admin state - don't re-query
            } else if (event === 'SIGNED_OUT') {
                console.log('[AdminAuth] User signed out');
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
            }
            setIsLoading(false);
        });

        // Safety: if no auth event fires within 12 seconds, stop loading
        const safetyTimer = setTimeout(() => {
            setIsLoading(prev => {
                if (prev) {
                    console.warn('[AdminAuth] Safety timeout - no auth event received, stopping loading');
                    return false;
                }
                return prev;
            });
        }, 12000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    // Expose checkAuth as a no-op for backward compatibility
    const checkAuth = async () => { };

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
