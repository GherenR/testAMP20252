import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { subDays } from 'date-fns';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/**
 * GET /api/analytics/stats/detailed?days=30&type=all
 * Get detailed raw analytics data
 * type: 'all' | 'page_views' | 'feature_clicks' | 'mentor_interactions'
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Cache for 10 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');

    const { days = 30, type = 'all', limit = 1000 } = req.query;
    const dayCount = parseInt(days as string) || 30;
    const dataLimit = parseInt(limit as string) || 1000;
    const fromDate = subDays(new Date(), dayCount).toISOString();

    try {
        let response: Record<string, any> = {
            query: { days: dayCount, type, limit: dataLimit },
            timestamp: new Date().toISOString(),
        };

        if (type === 'all' || type === 'page_views') {
            const { data, error } = await supabase
                .from('page_views')
                .select('*')
                .gte('timestamp', fromDate)
                .order('timestamp', { ascending: false })
                .limit(dataLimit);

            if (error) throw error;
            response.page_views = data || [];
        }

        if (type === 'all' || type === 'feature_clicks') {
            const { data, error } = await supabase
                .from('feature_clicks')
                .select('*')
                .gte('timestamp', fromDate)
                .order('timestamp', { ascending: false })
                .limit(dataLimit);

            if (error) throw error;
            response.feature_clicks = data || [];
        }

        if (type === 'all' || type === 'mentor_interactions') {
            const { data, error } = await supabase
                .from('mentor_interactions')
                .select('*')
                .gte('timestamp', fromDate)
                .order('timestamp', { ascending: false })
                .limit(dataLimit);

            if (error) throw error;
            response.mentor_interactions = data || [];
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('[Detailed Stats API] Error:', error);
        res.status(500).json({ error: 'Failed to fetch detailed stats' });
    }
}
