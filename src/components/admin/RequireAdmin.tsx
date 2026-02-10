import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { ShieldX } from 'lucide-react';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user } = useAdminAuth();
    const navigate = useNavigate();
    const [showUnauthorized, setShowUnauthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                navigate('/admin/login', { replace: true });
            } else if (!isAdmin) {
                setShowUnauthorized(true);
                const timer = setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isLoading, user, isAdmin, navigate]);

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

    if (showUnauthorized) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <ShieldX className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h1>
                    <p className="text-slate-400 mb-4">Kamu tidak memiliki izin untuk mengakses halaman admin.</p>
                    <p className="text-slate-500 text-sm">Mengalihkan ke beranda...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return <>{children}</>;
}
