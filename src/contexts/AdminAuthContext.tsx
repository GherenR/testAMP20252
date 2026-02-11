import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

    // Track if admin has been confirmed - once true, only SIGNED_OUT can reset it
    const adminConfirmedRef = useRef(false);

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
            const normalizedRole = rawRole?.toLowerCase().trim();
            const isSuperAdmin = normalizedRole === 'super_admin' || normalizedRole === 'super admin';
            const isAdminRole = normalizedRole === 'admin';
            const hasAccess = isAdminRole || isSuperAdmin;
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

    useEffect(() => {
        console.log('[AdminAuth] Provider mounted');

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AdminAuth] Auth event:', event, '| Has user:', !!session?.user, '| Admin confirmed:', adminConfirmedRef.current);

            // SIGNED_OUT is the ONLY event that resets admin state
            if (event === 'SIGNED_OUT') {
                console.log('[AdminAuth] Explicit sign out - resetting all state');
                adminConfirmedRef.current = false;
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
                setIsLoading(false);
                return;
            }

            if (session?.user) {
                setUser(session.user);

                // Only check admin status if not yet confirmed
                // This prevents tab switches from re-querying and potentially failing
                if (!adminConfirmedRef.current && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                    console.log('[AdminAuth] First-time admin check for:', session.user.email);
                    const status = await checkAdminStatus(session.user.id);

                    if (status.isAdmin) {
                        adminConfirmedRef.current = true;
                        setIsAdmin(true);
                        setAdminRole(status.role);
                        console.log('[AdminAuth] Admin confirmed:', status.role);
                    } else {
                        setIsAdmin(false);
                        setAdminRole(status.role);
                        console.log('[AdminAuth] Not admin');
                    }
                } else if (adminConfirmedRef.current) {
                    // Already confirmed as admin - skip re-check
                    // This handles TOKEN_REFRESHED and repeated INITIAL_SESSION (tab switches)
                    console.log('[AdminAuth] Already confirmed admin, skipping re-check for event:', event);
                }
            }

            setIsLoading(false);
        });

        // Safety: if no auth event fires within 12 seconds, stop loading
        const safetyTimer = setTimeout(() => {
            setIsLoading(prev => {
                if (prev) {
                    console.warn('[AdminAuth] Safety timeout - stopping loading');
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
