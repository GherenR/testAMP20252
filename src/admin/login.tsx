import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || '/admin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            setError('Email atau password salah');
        } else {
            navigate(redirect);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
            <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 w-full max-w-md shadow-2xl">
                <h1 className="text-2xl font-bold mb-6 text-center">Login Admin</h1>
                {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">{error}</div>}
                <div className="mb-4">
                    <label className="block mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-6">
                    <label className="block mb-2">Password</label>
                    <input type="password" className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
            </form>
        </div>
    );
}
