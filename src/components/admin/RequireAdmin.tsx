import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldX } from 'lucide-react';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user } = useAdminAuth();
    const navigate = useNavigate();
    const everAuthorizedRef = useRef(false);

    // Track if we've ever been authorized
    if (isAdmin && user) {
        everAuthorizedRef.current = true;
    }

    useEffect(() => {
        // If we were authorized before but now user is gone AND loading is done
        // → this is an intentional logout, redirect to login
        if (everAuthorizedRef.current && !user && !isLoading) {
            everAuthorizedRef.current = false;
            navigate('/admin/login', { replace: true });
            return;
        }

        // Never been authorized and no user → redirect to login
        if (!isLoading && !user && !everAuthorizedRef.current) {
            navigate('/admin/login', { replace: true });
        }
    }, [isLoading, user, isAdmin, navigate]);

    // RULE 1: User is gone after being authorized → logout in progress, show nothing
    if (everAuthorizedRef.current && !user && !isLoading) {
        return null;
    }

    // RULE 2: If authorized (even during transient auth flickers), ALWAYS render children
    if (everAuthorizedRef.current && user) {
        return <>{children}</>;
    }

    // RULE 3: Currently authorized
    if (isAdmin && user) {
        return <>{children}</>;
    }

    // RULE 4: Still loading initial auth state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-3 text-slate-400">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        );
    }

    // RULE 5: First-time access - user exists but not admin
    if (user && !isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h1>
                    <p className="text-slate-400 mb-4">Kamu tidak memiliki izin untuk mengakses halaman admin.</p>
                    <button
                        onClick={() => navigate('/admin/login', { replace: true })}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Login Ulang
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
