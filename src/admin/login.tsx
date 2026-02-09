import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Sparkles } from 'lucide-react';

// Animated grid background component
function AnimatedGridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const gridSize = 40;
        let animationId: number;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid lines
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x <= canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (let y = 0; y <= canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw glowing dots at intersections near mouse
            const { x: mx, y: my } = mousePos.current;
            const glowRadius = 150;

            for (let x = 0; x <= canvas.width; x += gridSize) {
                for (let y = 0; y <= canvas.height; y += gridSize) {
                    const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2);
                    if (dist < glowRadius) {
                        const alpha = 1 - dist / glowRadius;
                        ctx.beginPath();
                        ctx.arc(x, y, 3 + alpha * 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.8})`;
                        ctx.fill();

                        // Glow effect
                        ctx.beginPath();
                        ctx.arc(x, y, 8 + alpha * 6, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.2})`;
                        ctx.fill();
                    }
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 relative overflow-hidden">
            {/* Animated Background */}
            <AnimatedGridBackground />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-purple-500/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Login Card */}
            <form onSubmit={handleSubmit} className="relative bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-purple-900/20 z-10">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    {/* IKAHAT Logo */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-600/30">
                        <Shield size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">IKAHAT</span> Admin
                    </h1>
                    <p className="text-slate-400 text-sm">Alumni Mentorship Portal</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        {error}
                    </div>
                )}

                {/* Email Input */}
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-slate-300">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="email"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="mb-8">
                    <label className="block mb-2 text-sm font-medium text-slate-300">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            Masuk ke Dashboard
                            <Sparkles size={18} />
                        </>
                    )}
                </button>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    Akses terbatas untuk admin terautentikasi
                </p>
            </form>
        </div>
    );
}
