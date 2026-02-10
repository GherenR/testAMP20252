import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { User, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    // School info
    kelas?: string;
    angkatan?: number;
    school?: string;
    // Contact info
    phone?: string;
    instagram?: string;
    // Target PTN 1
    targetUniversity1?: string;
    targetMajor1?: string;
    // Target PTN 2
    targetUniversity2?: string;
    targetMajor2?: string;
    // Legacy fields
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
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from database
    const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
        try {
            // Add timeout to profile fetch (10 seconds)
            const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) =>
                setTimeout(() => {
                    console.warn('Profile fetch timed out');
                    resolve({ data: null, error: null });
                }, 10000)
            );

            const fetchPromise = supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            // Tambahkan log detail
            console.log('[fetchProfile] userId:', userId, '| data:', data, '| error:', error);

            if (error || !data) {
                if (error) console.warn('Error fetching profile:', error.message, '| userId:', userId);
                if (!data) console.warn('No profile data found for userId:', userId);
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
            console.warn('Profile fetch failed:', err instanceof Error ? err.message : 'Unknown error', '| userId:', userId);
            return null;
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            setIsLoading(true);
            try {
                // Add timeout to prevent infinite loading (10 seconds)
                const timeoutPromise = new Promise<null>((resolve) =>
                    setTimeout(() => {
                        console.warn('Auth check timed out - continuing as guest');
                        resolve(null);
                    }, 10000)
                );

                const authPromise = supabase.auth.getUser().then(res => res.data.user);
                const authUser = await Promise.race([authPromise, timeoutPromise]);

                if (!isMounted) return;

                if (authUser) {
                    setUser(authUser);
                    const userProfile = await fetchProfile(authUser.id);
                    if (isMounted) setProfile(userProfile);
                }
            } catch (err) {
                if (!isMounted) return;
                // Network or other error - just continue without auth
                console.warn('Auth unavailable:', err instanceof Error ? err.message : 'Unknown error');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                const userProfile = await fetchProfile(session.user.id);
                if (isMounted) setProfile(userProfile);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    // Sign up with extended profile data
    const signUp = async (signUpData: SignUpData) => {
        const { email, password, fullName, kelas, angkatan, phone, instagram, targetUniversity1, targetMajor1, targetUniversity2, targetMajor2 } = signUpData;

        // Get the current site URL for email redirect
        const redirectUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/snbtarea`
            : undefined;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: redirectUrl
            }
        });

        // Check if user already exists (Supabase returns user with empty identities)
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
            // Create profile in user_profiles with extended data
            await supabase.from('user_profiles').insert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: 'user', // IMPORTANT: All signups get 'user' role by default
                kelas: kelas || null,
                angkatan: angkatan || null,
                phone: phone || null,
                instagram: instagram || null,
                target_university_1: targetUniversity1 || null,
                target_major_1: targetMajor1 || null,
                target_university_2: targetUniversity2 || null,
                target_major_2: targetMajor2 || null
            });

            // Also insert into users table for admin dashboard sync
            // (trigger will also do this, but we add here for safety)
            await supabase.from('users').upsert({
                id: data.user.id,
                email: email,
                name: fullName,
                role: 'user',
                created_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }

        return { error };
    };

    // Sign in
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        return { error };
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
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
            // Legacy fields
            if (data.targetUniversity !== undefined) updateData.target_university = data.targetUniversity;
            if (data.targetMajor !== undefined) updateData.target_major = data.targetMajor;

            const { error } = await supabase
                .from('user_profiles')
                .update(updateData)
                .eq('id', user.id);

            if (error) throw error;

            // Refresh profile
            const newProfile = await fetchProfile(user.id);
            setProfile(newProfile);

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // Refresh profile manually
    const refreshProfile = async () => {
        if (user) {
            const newProfile = await fetchProfile(user.id);
            setProfile(newProfile);
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
                refreshProfile
            }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    const context = useContext(UserAuthContext);
    if (!context) {
        throw new Error('useUserAuth must be used within UserAuthProvider');
    }
    return context;
}
