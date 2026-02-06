import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PlatformStats {
    date_range: {
        from: string;
        to: string;
        days: number;
    };
    summary: {
        unique_visitors: number;
        total_page_views: number;
        device_breakdown: {
            mobile: number;
            desktop: number;
        };
    };
    features: Record<string, number>;
    slides: Record<number, { name: string; views: number }>;
    mentors: Array<{
        name: string;
        clicks: number;
        actions: Record<string, number>;
    }>;
    timestamp: string;
}

/**
 * GET /api/analytics/stats/platform?days=30
 * Get platform-wide analytics
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PlatformStats | { error: string }>
) {
    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    const { days = 30 } = req.query;
    const dayCount = parseInt(days as string) || 30;
    const fromDate = subDays(new Date(), dayCount).toISOString();

    try {
        // 1. Get unique visitors (unique sessions)
        const { data: pageViews, error: pvError } = await supabase
            .from('page_views')
            .select('session_id')
            .gte('timestamp', fromDate);

        if (pvError) throw pvError;

        const uniqueVisitors = new Set(pageViews?.map(v => v.session_id) || []).size;
        const totalPageViews = pageViews?.length || 0;

        // 2. Get feature clicks breakdown
        const { data: featureClicks, error: fcError } = await supabase
            .from('feature_clicks')
            .select('feature_name, feature_type')
            .gte('timestamp', fromDate);

        if (fcError) throw fcError;

        const featureStats: Record<string, number> = {};
        featureClicks?.forEach(fc => {
            featureStats[fc.feature_name] = (featureStats[fc.feature_name] || 0) + 1;
        });

        // 3. Get slide views breakdown
        const { data: slideViews, error: svError } = await supabase
            .from('page_views')
            .select('slide_number, slide_name')
            .gte('timestamp', fromDate);

        if (svError) throw svError;

        const slideStats: Record<number, { name: string; views: number }> = {};
        slideViews?.forEach(sv => {
            if (!slideStats[sv.slide_number]) {
                slideStats[sv.slide_number] = { name: sv.slide_name, views: 0 };
            }
            slideStats[sv.slide_number].views++;
        });

        // 4. Get mentor interactions
        const { data: mentorInteractions, error: miError } = await supabase
            .from('mentor_interactions')
            .select('mentor_name, action_type')
            .gte('timestamp', fromDate);

        if (miError) throw miError;

        const mentorStats: Record<string, { clicks: number; actions: Record<string, number> }> = {};
        mentorInteractions?.forEach(mi => {
            if (!mentorStats[mi.mentor_name]) {
                mentorStats[mi.mentor_name] = { clicks: 0, actions: {} };
            }
            mentorStats[mi.mentor_name].clicks++;
            mentorStats[mi.mentor_name].actions[mi.action_type] =
                (mentorStats[mi.mentor_name].actions[mi.action_type] || 0) + 1;
        });

        // 5. Get top mentors
        const topMentors = Object.entries(mentorStats)
            .sort((a, b) => b[1].clicks - a[1].clicks)
            .map(([name, stats]) => ({ name, ...stats }));

        // 6. Get device breakdown
        const { data: deviceData, error: ddError } = await supabase
            .from('page_views')
            .select('device_type')
            .gte('timestamp', fromDate);

        if (ddError) throw ddError;

        const deviceStats = {
            mobile: deviceData?.filter(d => d.device_type === 'mobile').length || 0,
            desktop: deviceData?.filter(d => d.device_type === 'desktop').length || 0,
        };

        const response: PlatformStats = {
            date_range: {
                from: format(subDays(new Date(), dayCount), 'yyyy-MM-dd'),
                to: format(new Date(), 'yyyy-MM-dd'),
                days: dayCount,
            },
            summary: {
                unique_visitors: uniqueVisitors,
                total_page_views: totalPageViews,
                device_breakdown: deviceStats,
            },
            features: featureStats,
            slides: slideStats,
            mentors: topMentors,
            timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('[Platform Stats API] Error:', error);
        res.status(500).json({ error: 'Failed to fetch platform stats' });
    }
}
