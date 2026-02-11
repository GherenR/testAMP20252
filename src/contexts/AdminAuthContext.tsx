import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AdminAuthContextType {
    user: User | null;
    isAdmin: boolean;
    adminRole: string | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Persist admin status in sessionStorage so it survives page refreshes
const ADMIN_STORAGE_KEY = 'admin_confirmed';

function getStoredAdminStatus(): { isAdmin: boolean; role: string | null } {
    try {
        const stored = sessionStorage.getItem(ADMIN_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { isAdmin: false, role: null };
}

function setStoredAdminStatus(isAdmin: boolean, role: string | null) {
    try {
        if (isAdmin) {
            sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ isAdmin, role }));
        } else {
            sessionStorage.removeItem(ADMIN_STORAGE_KEY);
        }
    } catch { /* ignore */ }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize from sessionStorage for instant restore on page refresh
    const stored = getStoredAdminStatus();
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(stored.isAdmin);
    const [adminRole, setAdminRole] = useState<string | null>(stored.role);
    // If we have stored admin status, don't show loading (instant restore)
    const [isLoading, setIsLoading] = useState(!stored.isAdmin);

    // Track if admin has been confirmed in this session
    const adminConfirmedRef = useRef(stored.isAdmin);

    // Check admin status from users table
    const checkAdminStatus = async (userId: string): Promise<{ isAdmin: boolean; role: string | null }> => {
        try {
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('ADMIN_CHECK_TIMEOUT')), 10000)
            );
            const queryPromise = supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

            if (error || !data) {
                console.warn('[AdminAuth] checkAdminStatus query failed:', error);
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
            console.error('[AdminAuth] checkAdminStatus exception:', err?.message);
            // On timeout/error, return null role to signal "don't know" vs "not admin"
            return { isAdmin: false, role: null };
        }
    };

    useEffect(() => {
        console.log('[AdminAuth] Provider mounted | stored admin:', stored.isAdmin);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AdminAuth] Event:', event, '| User:', !!session?.user, '| Confirmed:', adminConfirmedRef.current);

            // SIGNED_OUT is the ONLY event that fully resets admin state
            if (event === 'SIGNED_OUT') {
                console.log('[AdminAuth] SIGNED_OUT - full reset');
                adminConfirmedRef.current = false;
                setStoredAdminStatus(false, null);
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
                setIsLoading(false);
                return;
            }

            if (session?.user) {
                setUser(session.user);

                // If already confirmed as admin (via ref or sessionStorage), skip re-check
                if (adminConfirmedRef.current) {
                    console.log('[AdminAuth] Already confirmed, skipping check for:', event);
                    setIsLoading(false);
                    return;
                }

                // First-time check on SIGNED_IN or INITIAL_SESSION
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    console.log('[AdminAuth] Checking admin status for:', session.user.email);
                    const status = await checkAdminStatus(session.user.id);

                    if (status.isAdmin) {
                        adminConfirmedRef.current = true;
                        setStoredAdminStatus(true, status.role);
                        setIsAdmin(true);
                        setAdminRole(status.role);
                        console.log('[AdminAuth] ✅ Admin confirmed:', status.role);
                    } else if (status.role === null && stored.isAdmin) {
                        // Query failed/timed out but we had stored admin status
                        // Keep the stored status - don't revoke on network failure
                        console.warn('[AdminAuth] Check failed but stored admin exists - keeping access');
                        adminConfirmedRef.current = true;
                    } else {
                        setIsAdmin(false);
                        setAdminRole(null);
                        setStoredAdminStatus(false, null);
                        console.log('[AdminAuth] ❌ Not admin');
                    }
                }
                // TOKEN_REFRESHED: just update user, keep admin state
            }

            setIsLoading(false);
        });

        // Safety timeout - if no auth event fires, stop loading
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
