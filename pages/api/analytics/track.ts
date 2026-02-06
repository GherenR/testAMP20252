import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TrackRequest {
    type: 'page_view' | 'feature_click' | 'mentor_interaction';
    data: Record<string, any>;
}

/**
 * POST /api/analytics/track
 * Generic tracking endpoint
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, data } = req.body as TrackRequest;

    // Validate input
    if (!type || !data) {
        return res.status(400).json({ error: 'Missing type or data' });
    }

    try {
        if (type === 'page_view') {
            await supabase.from('page_views').insert(data);
        } else if (type === 'feature_click') {
            await supabase.from('feature_clicks').insert(data);
        } else if (type === 'mentor_interaction') {
            await supabase.from('mentor_interactions').insert(data);
        } else {
            return res.status(400).json({ error: 'Unknown tracking type' });
        }

        res.status(200).json({ success: true, message: 'Tracked successfully' });
    } catch (error) {
        console.error('[Track API] Error:', error);
        res.status(500).json({ error: 'Tracking failed', details: String(error) });
    }
}
