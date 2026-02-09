// pages/api/admin/createUser.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// You must set this env var in Vercel/your server, never expose in frontend!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Only allow admins (implement your own admin check here)
    // Example: check req.headers.authorization for a valid admin JWT
    // For demo, allow all (replace with real check!)

    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, role },
    });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    // Optionally, insert into your custom users table (if needed)
    // await supabaseAdmin.from('users').insert({ id: data.user.id, email, name, role });

    return res.status(200).json({ user: data.user });
}
