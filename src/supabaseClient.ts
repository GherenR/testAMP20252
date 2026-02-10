import { createClient } from '@supabase/supabase-js'

// Ambil variabel dari .env dengan gaya Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Suppress AbortError globally (happens when components unmount during fetch)
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.name === 'AbortError' ||
            event.reason?.message?.includes('aborted') ||
            event.reason?.message?.includes('signal')) {
            event.preventDefault();
            // Silently ignore - this is expected behavior when navigating away
        }
    });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});