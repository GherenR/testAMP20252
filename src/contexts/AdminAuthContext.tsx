import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AdminAuthContextType {
    user: User | null;
    isAdmin: boolean;
    adminRole: string | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// SessionStorage helpers - survives refresh, cleared on tab/browser close
const ADMIN_KEY = 'admin_confirmed';

function getStoredAdmin(): { isAdmin: boolean; role: string | null } {
    try {
        const s = sessionStorage.getItem(ADMIN_KEY);
        if (s) return JSON.parse(s);
    } catch { /* ignore */ }
    return { isAdmin: false, role: null };
}

function storeAdmin(isAdmin: boolean, role: string | null) {
    try {
        if (isAdmin) {
            sessionStorage.setItem(ADMIN_KEY, JSON.stringify({ isAdmin, role }));
        } else {
            sessionStorage.removeItem(ADMIN_KEY);
        }
    } catch { /* ignore */ }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const stored = getStoredAdmin();
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(stored.isAdmin);
    const [adminRole, setAdminRole] = useState<string | null>(stored.role);
    const [isLoading, setIsLoading] = useState(!stored.isAdmin);
    const confirmedRef = useRef(stored.isAdmin);
    const intentionalLogoutRef = useRef(false);

    const checkAdminStatus = async (userId: string): Promise<{ isAdmin: boolean; role: string | null }> => {
        try {
            const { data, error } = await Promise.race([
                supabase.from('users').select('role').eq('id', userId).single(),
                new Promise<never>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 10000))
            ]);
            if (error || !data) return { isAdmin: false, role: null };

            const norm = data.role?.toLowerCase().trim();
            const isSA = norm === 'super_admin' || norm === 'super admin';
            const isA = norm === 'admin';
            const role = isSA ? 'super_admin' : (isA ? 'admin' : data.role);
            return { isAdmin: isSA || isA, role };
        } catch {
            return { isAdmin: false, role: null };
        }
    };

    useEffect(() => {
        // 1. Immediately try to restore session from Supabase local storage
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                if (confirmedRef.current) {
                    // Already confirmed from sessionStorage, just set loading false
                    setIsLoading(false);
                }
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AdminAuth]', event, !!session?.user, 'confirmed:', confirmedRef.current);

            if (event === 'SIGNED_OUT') {
                // Check if this was an intentional logout first
                if (intentionalLogoutRef.current) {
                    console.log('[AdminAuth] Intentional SIGNED_OUT');
                    intentionalLogoutRef.current = false;
                    confirmedRef.current = false;
                    setUser(null);
                    setIsAdmin(false);
                    setAdminRole(null);
                    storeAdmin(false, null);
                    setIsLoading(false);
                    return;
                }

                // Unexpected SIGNED_OUT - verify if session still exists (false alarm check)
                const { data: check } = await supabase.auth.getSession();
                if (check.session?.user) {
                    // FALSE ALARM - session still exists
                    console.warn('[AdminAuth] SIGNED_OUT was false alarm - session still active');
                    setUser(check.session.user);
                    setIsLoading(false);
                    return;
                }

                // Real signout (session actually gone - expired or network issue)
                console.log('[AdminAuth] Real SIGNED_OUT - session expired');
                intentionalLogoutRef.current = false; // Reset logout flag
                confirmedRef.current = false;
                storeAdmin(false, null);
                setUser(null);
                setIsAdmin(false);
                setAdminRole(null);
                setIsLoading(false);
                return;
            }

            if (session?.user) {
                setUser(session.user);

                // Handle token refresh separately - don't re-verify admin
                if (event === 'TOKEN_REFRESHED') {
                    console.log('[AdminAuth] Token refreshed successfully');
                    setIsLoading(false);
                    return;
                }

                // ALWAYS verify on SIGNED_IN, even if we have cached data
                // This prevents stale sessionStorage from blocking re-authentication after session expiration
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    setIsLoading(true); // Force loading state while checking
                    const status = await checkAdminStatus(session.user.id);
                    if (status.isAdmin) {
                        confirmedRef.current = true;
                        storeAdmin(true, status.role);
                        setIsAdmin(true);
                        setAdminRole(status.role);
                    } else if (status.role === null && stored.isAdmin) {
                        // Query failed but we have stored admin - keep it
                        confirmedRef.current = true;
                        console.warn('[AdminAuth] Check failed, keeping stored admin');
                    } else {
                        setIsAdmin(false);
                        setAdminRole(null);
                        storeAdmin(false, null);
                    }
                }
            }

            setIsLoading(false);
        });

        // Safety timeout
        const timer = setTimeout(() => {
            setIsLoading(prev => prev ? false : prev);
        }, 12000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const checkAuth = async () => { };

    const signOut = async () => {
        // Mark as intentional so SIGNED_OUT handler doesn't false-alarm-check
        intentionalLogoutRef.current = true;
        confirmedRef.current = false;
        storeAdmin(false, null);
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.warn('[AdminAuth] Logout error:', err);
        }
        // State cleanup happens in SIGNED_OUT handler
    };

    return (
        <AdminAuthContext.Provider value={{ user, isAdmin, adminRole, isLoading, checkAuth, signOut }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return context;
}
