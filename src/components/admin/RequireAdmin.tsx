import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldX } from 'lucide-react';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user } = useAdminAuth();
    const navigate = useNavigate();
    // Track if we ever showed children successfully - prevents flash of unauthorized
    const hasRenderedRef = useRef(false);

    if (isAdmin && !isLoading) {
        hasRenderedRef.current = true;
    }

    useEffect(() => {
        if (!isLoading && !user && !hasRenderedRef.current) {
            // No user and never rendered - redirect to login
            navigate('/admin/login', { replace: true });
        }
    }, [isLoading, user, navigate]);

    // Still loading - show spinner
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

    // User exists and is admin - render children
    if (isAdmin) {
        return <>{children}</>;
    }

    // If we previously rendered successfully, keep showing children
    // This prevents data loss on transient auth state changes (tab switch, token refresh)
    if (hasRenderedRef.current) {
        return <>{children}</>;
    }

    // Only show unauthorized if we definitely have a user but they're not admin
    // AND we never successfully rendered before
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

    // Fallback: show nothing while state settles
    return null;
}
