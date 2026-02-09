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
            // Check role from user_metadata or app_metadata
            // For now, allow any authenticated user as admin
            // You can restrict this later by checking specific emails or roles
            const allowedEmails = ['gherenramandra@gmail.com', 'saputragheren@gmail.com'];
            const isAllowed = allowedEmails.includes(user.email || '');

            if (isAllowed) {
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
