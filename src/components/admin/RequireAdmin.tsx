import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                navigate('/admin/login');
                return;
            }
            // Ambil data user dari Supabase (misal, role di user_metadata)
            const role = user.user_metadata?.role;
            if (role === 'admin') {
                setIsAdmin(true);
            } else {
                navigate('/');
            }
            setLoading(false);
        };
        checkAdmin();
    }, [navigate]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!isAdmin) return null;
    return <>{children}</>;
}
