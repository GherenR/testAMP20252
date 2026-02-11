import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    kelas?: string;
    angkatan?: number;
    school?: string;
    phone?: string;
    instagram?: string;
    targetUniversity1?: string;
    targetMajor1?: string;
    targetUniversity2?: string;
    targetMajor2?: string;
    targetUniversity?: string;
    targetMajor?: string;
    createdAt: string;
}

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
    kelas?: string;
    angkatan?: number;
    phone?: string;
    instagram?: string;
    targetUniversity1?: string;
    targetMajor1?: string;
    targetUniversity2?: string;
    targetMajor2?: string;
}

interface UserAuthContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
    sessionExpired: boolean;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

// sessionStorage helpers for persistence across refreshes
function getStoredProfile(): UserProfile | null {
    try {
        const raw = sessionStorage.getItem('user_profile');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}
function storeProfile(profile: UserProfile | null) {
    try {
        if (profile) {
            sessionStorage.setItem('user_profile', JSON.stringify(profile));
        } else {
            sessionStorage.removeItem('user_profile');
        }
    } catch { /* ignore */ }
}

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const storedProfile = getStoredProfile();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(storedProfile);
    const [isLoading, setIsLoading] = useState(storedProfile ? false : true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const intentionalLogoutRef = useRef(false);
    const profileLoadedRef = useRef(!!storedProfile);

    // Fetch user profile from database
    const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
        console.log('[UserAuth] Fetching profile for:', userId);
        try {
            const { data, error } = await Promise.race([
                supabase.from('users').select('*').eq('id', userId).single(),
                new Promise<never>((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 10000))
            ]);
            if (error || !data) {
                console.warn('[UserAuth] Profile fetch failed:', error?.message);
                return null;
            }
            return {
                id: data.id,
                email: data.email,
                fullName: data.full_name,
                kelas: data.kelas,
                angkatan: data.angkatan,
                school: data.school,
                phone: data.phone,
                instagram: data.instagram,
                targetUniversity1: data.target_university_1,
                targetMajor1: data.target_major_1,
                targetUniversity2: data.target_university_2,
                targetMajor2: data.target_major_2,
                targetUniversity: data.target_university,
                targetMajor: data.target_major,
                createdAt: data.created_at
            } as UserProfile;
        } catch (err) {
            console.warn('[UserAuth] Profile fetch error:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Instantly restore session from Supabase local storage
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;
            if (session?.user) {
                setUser(session.user);
                // If we already have a stored profile, skip fetch (instant restore)
                if (profileLoadedRef.current) {
                    setIsLoading(false);
                    return;
                }
                // Otherwise fetch profile
                const p = await fetchProfile(session.user.id);
                if (isMounted && p) {
                    setProfile(p);
                    storeProfile(p);
                    profileLoadedRef.current = true;
                }
                if (isMounted) setIsLoading(false);
            } else {
                if (isMounted) setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            console.log('[UserAuth]', event, !!session?.user, 'intentional:', intentionalLogoutRef.current);

            if (event === 'SIGNED_OUT') {
                // Was this an intentional logout?
                if (intentionalLogoutRef.current) {
                    console.log('[UserAuth] Intentional SIGNED_OUT');
                    intentionalLogoutRef.current = false;
                    setUser(null);
                    setProfile(null);
                    storeProfile(null);
                    profileLoadedRef.current = false;
                    setSessionExpired(false);
                    setIsLoading(false);
                    return;
                }

                // FALSE ALARM CHECK: verify session is actually gone
                const { data: check } = await supabase.auth.getSession();
                if (check.session?.user) {
                    // Session still alive — false alarm from failed token refresh
                    console.warn('[UserAuth] SIGNED_OUT was false alarm — session still active');
                    setUser(check.session.user);
                    // Keep profile as-is
                    setIsLoading(false);
                    return;
                }

                // Real signout (session truly gone)
                console.log('[UserAuth] Real SIGNED_OUT — session gone');
                if (user) setSessionExpired(true);
                setUser(null);
                setProfile(null);
                storeProfile(null);
                profileLoadedRef.current = false;
                setIsLoading(false);
                return;
            }

            if (session?.user) {
                setUser(session.user);
                setSessionExpired(false);

                if (event === 'TOKEN_REFRESHED') {
                    // Token refreshed — keep existing profile, don't refetch
                    console.log('[UserAuth] TOKEN_REFRESHED — keeping profile');
                    setIsLoading(false);
                    return;
                }

                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    // Check for pending profile data from signup
                    const pendingProfile = localStorage.getItem('pendingUserProfile');
                    if (pendingProfile) {
                        try {
                            const profileData: SignUpData = JSON.parse(pendingProfile);
                            console.log('[UserAuth] Inserting pending profile for:', session.user.id);
                            await supabase.from('users').upsert({
                                id: session.user.id,
                                email: profileData.email,
                                name: profileData.fullName,
                                full_name: profileData.fullName,
                                role: 'user',
                                kelas: profileData.kelas || null,
                                angkatan: profileData.angkatan || null,
                                phone: profileData.phone || null,
                                instagram: profileData.instagram || null,
                                target_university_1: profileData.targetUniversity1 || null,
                                target_major_1: profileData.targetMajor1 || null,
                                target_university_2: profileData.targetUniversity2 || null,
                                target_major_2: profileData.targetMajor2 || null,
                                created_at: new Date().toISOString()
                            }, { onConflict: 'id' });
                            localStorage.removeItem('pendingUserProfile');
                            console.log('[UserAuth] Pending profile inserted');
                        } catch (error) {
                            console.error('[UserAuth] Failed to insert pending profile:', error);
                        }
                    }

                    // Skip profile fetch if we already have one cached
                    if (profileLoadedRef.current && profile) {
                        console.log('[UserAuth] Already have profile — skipping fetch');
                        setIsLoading(false);
                        return;
                    }

                    // Fetch profile with retry
                    let userProfile = await fetchProfile(session.user.id);
                    if (!userProfile && pendingProfile) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        userProfile = await fetchProfile(session.user.id);
                    }

                    if (isMounted) {
                        if (userProfile) {
                            setProfile(userProfile);
                            storeProfile(userProfile);
                            profileLoadedRef.current = true;
                        }
                        // Don't set profile to null if fetch fails — keep stored one
                        setIsLoading(false);
                    }
                }
            }
        });

        // Safety timeout
        const timer = setTimeout(() => {
            if (isMounted) setIsLoading(prev => prev ? false : prev);
        }, 12000);

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    // Sign up
    const signUp = async (signUpData: SignUpData) => {
        const { email, password, fullName, kelas, angkatan, phone, instagram, targetUniversity1, targetMajor1, targetUniversity2, targetMajor2 } = signUpData;

        const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/snbtarea`
            : undefined;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: redirectUrl
            }
        });

        if (!error && data.user && data.user.identities && data.user.identities.length === 0) {
            return {
                error: {
                    message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.',
                    name: 'AuthApiError',
                    status: 400
                } as AuthError
            };
        }

        if (!error && data.user && data.user.identities && data.user.identities.length > 0) {
            await supabase.from('users').upsert({
                id: data.user.id,
                email: email,
                name: fullName,
                full_name: fullName,
                role: 'user',
                kelas: kelas || null,
                angkatan: angkatan || null,
                phone: phone || null,
                instagram: instagram || null,
                target_university_1: targetUniversity1 || null,
                target_major_1: targetMajor1 || null,
                target_university_2: targetUniversity2 || null,
                target_major_2: targetMajor2 || null,
                created_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }

        return { error };
    };

    // Sign in
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    // Sign out
    const signOut = async () => {
        // Mark as intentional so SIGNED_OUT handler doesn't false-alarm-check
        intentionalLogoutRef.current = true;
        storeProfile(null);
        profileLoadedRef.current = false;
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.warn('[UserAuth] Logout error:', err);
        }
        setUser(null);
        setProfile(null);
    };

    // Update profile
    const updateProfile = async (data: Partial<UserProfile>) => {
        if (!user) return { error: new Error('Not authenticated') };
        try {
            const updateData: Record<string, unknown> = {};
            if (data.fullName !== undefined) updateData.full_name = data.fullName;
            if (data.kelas !== undefined) updateData.kelas = data.kelas;
            if (data.angkatan !== undefined) updateData.angkatan = data.angkatan;
            if (data.school !== undefined) updateData.school = data.school;
            if (data.phone !== undefined) updateData.phone = data.phone;
            if (data.instagram !== undefined) updateData.instagram = data.instagram;
            if (data.targetUniversity1 !== undefined) updateData.target_university_1 = data.targetUniversity1;
            if (data.targetMajor1 !== undefined) updateData.target_major_1 = data.targetMajor1;
            if (data.targetUniversity2 !== undefined) updateData.target_university_2 = data.targetUniversity2;
            if (data.targetMajor2 !== undefined) updateData.target_major_2 = data.targetMajor2;
            if (data.targetUniversity !== undefined) updateData.target_university = data.targetUniversity;
            if (data.targetMajor !== undefined) updateData.target_major = data.targetMajor;

            const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
            if (error) throw error;

            const newProfile = await fetchProfile(user.id);
            if (newProfile) {
                setProfile(newProfile);
                storeProfile(newProfile);
            }
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Refresh profile
    const refreshProfile = async () => {
        if (user) {
            const newProfile = await fetchProfile(user.id);
            if (newProfile) {
                setProfile(newProfile);
                storeProfile(newProfile);
            }
        }
    };

    return (
        <UserAuthContext.Provider
            value={{
                user,
                profile,
                isLoading,
                isAuthenticated: !!user,
                signUp,
                signIn,
                signOut,
                updateProfile,
                refreshProfile,
                sessionExpired
            }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    const context = useContext(UserAuthContext);
    if (!context) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
}
