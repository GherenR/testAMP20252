import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading, user } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Only redirect after loading is complete
        if (!isLoading) {
            if (!user) {
                navigate('/admin/login', { replace: true });
            } else if (!isAdmin) {
                navigate('/', { replace: true });
            }
        }
    }, [isLoading, user, isAdmin, navigate]);

    // Show minimal loading indicator that matches dashboard style
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

    // Don't render anything if not admin (will redirect)
    if (!isAdmin) return null;

    return <>{children}</>;
}
