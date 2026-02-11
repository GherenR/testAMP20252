import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldX } from 'lucide-react';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user } = useAdminAuth();
    const navigate = useNavigate();
    // CRITICAL: once children have been rendered, NEVER unmount them
    const everAuthorizedRef = useRef(false);

    // Track if we've ever been authorized
    if (isAdmin) {
        everAuthorizedRef.current = true;
    }

    useEffect(() => {
        // Only redirect if we've NEVER been authorized and loading is done
        if (!isLoading && !user && !everAuthorizedRef.current) {
            navigate('/admin/login', { replace: true });
        }
    }, [isLoading, user, navigate]);

    // RULE 1: If ever authorized, ALWAYS render children - no exceptions
    // This prevents data loss from auth state flickering on tab switches
    if (everAuthorizedRef.current) {
        return <>{children}</>;
    }

    // RULE 2: Still loading initial auth state
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

    // RULE 3: First-time access - user exists but not admin
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
