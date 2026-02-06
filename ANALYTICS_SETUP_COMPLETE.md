# 🚀 COMPREHENSIVE ANALYTICS SYSTEM - COMPLETE SETUP
## Full Implementation with Dashboard (Production Ready)

**Timeline:** 3-4 hours  
**Status:** Ready to implement  
**Deployment:** Vercel + Supabase (free tier)

---

## 📋 PHASE 1: SUPABASE SETUP (30 minutes)

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com/auth/signup
2. Sign up with GitHub (easier)
3. Create new project:
   - Name: `ikahata-analytics`
   - Region: `Singapore` (closest to Indonesia)
   - Database password: Save it
4. Wait 2-3 minutes for project to initialize
5. Go to **Settings → API**:
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 1.2: Create Tables

Go to **SQL Editor** in Supabase Dashboard and run this:

```sql
-- Table 1: Page Views / Slide Views
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  slide_number INT NOT NULL,
  slide_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  view_duration_seconds INT DEFAULT 0
);

-- Table 2: Feature Clicks (Button interactions)
CREATE TABLE IF NOT EXISTS feature_clicks (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  feature_type TEXT NOT NULL,
  slide_number INT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_type TEXT
);

-- Table 3: Mentor Interactions
CREATE TABLE IF NOT EXISTS mentor_interactions (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  mentor_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  source_feature TEXT NOT NULL,
  source_slide INT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_type TEXT
);

-- Table 4: Mentor Stats Cache (updated every hour)
CREATE TABLE IF NOT EXISTS mentor_stats_cache (
  id BIGSERIAL PRIMARY KEY,
  mentor_name TEXT UNIQUE NOT NULL,
  total_clicks INT DEFAULT 0,
  chat_clicks INT DEFAULT 0,
  detail_views INT DEFAULT 0,
  compare_adds INT DEFAULT 0,
  instagram_clicks INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_slide ON page_views(slide_number);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_feature_clicks_session ON feature_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_feature_clicks_feature ON feature_clicks(feature_name);
CREATE INDEX IF NOT EXISTS idx_mentor_interactions_mentor ON mentor_interactions(mentor_name);
CREATE INDEX IF NOT EXISTS idx_mentor_interactions_timestamp ON mentor_interactions(timestamp);
```

✅ If no errors, tables are created!

---

## 📦 PHASE 2: INSTALL PACKAGES (10 minutes)

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install date utilities (for dashboard)
npm install date-fns

# (Optional) For charts in dashboard
npm install recharts
```

---

## 🎣 PHASE 3: CREATE HOOKS & UTILITIES

### 3.1 Create `src/utils/analytics.ts`

```typescript
// Session management
export function getOrCreateSessionId(): string {
  const key = 'analytics_session_id';
  let sessionId = localStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

// Get device type
export function getDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}

// Slide name mapping
export const SLIDE_NAMES: Record<number, string> = {
  0: 'Home',
  1: 'Smart Match',
  2: 'Direktori',
  3: 'Etika',
  4: 'About'
};

// Feature name mapping
export const FEATURE_NAMES = {
  MULAI_SIMULASI: 'Mulai Simulasi',
  CARI_MANUAL: 'Cari Manual',
  FILTER_KATEGORI: 'Filter Kategori',
  FILTER_PATH: 'Filter Path',
  SEARCH_MENTOR: 'Search Mentor',
  CONTACT_CHAT: 'Contact Chat',
  VIEW_DETAIL: 'View Detail',
  ADD_COMPARE: 'Add Comparison',
  VISIT_INSTAGRAM: 'Visit Instagram',
  SHARE_WHATSAPP: 'Share WhatsApp'
};
```

### 3.2 Create `src/hooks/useAnalytics.ts`

```typescript
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getOrCreateSessionId, getDeviceType } from '../utils/analytics';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let sessionId = '';

export const useAnalytics = () => {
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
      sessionId = sessionIdRef.current;
    }
  }, []);

  /**
   * Track page/slide view
   */
  const trackPageView = async (
    slideNumber: number,
    slideName: string,
    viewDurationSeconds: number = 0
  ) => {
    try {
      await supabase.from('page_views').insert({
        session_id: sessionIdRef.current,
        slide_number: slideNumber,
        slide_name: slideName,
        device_type: getDeviceType(),
        view_duration_seconds: viewDurationSeconds,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      });
    } catch (err) {
      console.error('[Analytics] Page view error:', err);
    }
  };

  /**
   * Track feature/button clicks
   */
  const trackFeatureClick = async (
    featureName: string,
    featureType: string,
    slideNumber?: number
  ) => {
    try {
      await supabase.from('feature_clicks').insert({
        session_id: sessionIdRef.current,
        feature_name: featureName,
        feature_type: featureType,
        slide_number: slideNumber,
        device_type: getDeviceType(),
      });
    } catch (err) {
      console.error('[Analytics] Feature click error:', err);
    }
  };

  /**
   * Track mentor interactions
   */
  const trackMentorInteraction = async (
    mentorName: string,
    actionType: string,
    sourceFeature: string,
    sourceSlide?: number
  ) => {
    try {
      await supabase.from('mentor_interactions').insert({
        session_id: sessionIdRef.current,
        mentor_name: mentorName,
        action_type: actionType,
        source_feature: sourceFeature,
        source_slide: sourceSlide,
        device_type: getDeviceType(),
      });
    } catch (err) {
      console.error('[Analytics] Mentor interaction error:', err);
    }
  };

  return {
    trackPageView,
    trackFeatureClick,
    trackMentorInteraction,
    sessionId: sessionIdRef.current,
  };
};
```

---

## 🔧 PHASE 4: CREATE API ROUTES

### 4.1 Create `pages/api/analytics/track.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generic tracking endpoint (alternative to direct Supabase calls)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  try {
    if (type === 'page_view') {
      await supabase.from('page_views').insert(data);
    } else if (type === 'feature_click') {
      await supabase.from('feature_clicks').insert(data);
    } else if (type === 'mentor_interaction') {
      await supabase.from('mentor_interactions').insert(data);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Track API] Error:', error);
    res.status(500).json({ error: 'Tracking failed' });
  }
}
```

### 4.2 Create `pages/api/analytics/stats/platform.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'public, s-maxage=300'); // Cache 5 minutes

  const { days = 30 } = req.query;
  const dayCount = parseInt(days as string) || 30;
  const fromDate = subDays(new Date(), dayCount).toISOString();

  try {
    // Unique visitors (unique sessions)
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('timestamp', fromDate);

    const uniqueVisitors = new Set(pageViews?.map(v => v.session_id) || []).size;

    // Total page views
    const totalPageViews = pageViews?.length || 0;

    // Feature clicks breakdown
    const { data: featureClicks } = await supabase
      .from('feature_clicks')
      .select('feature_name, feature_type')
      .gte('timestamp', fromDate);

    const featureStats: Record<string, number> = {};
    featureClicks?.forEach(fc => {
      featureStats[fc.feature_name] = (featureStats[fc.feature_name] || 0) + 1;
    });

    // Slide views breakdown
    const { data: slideViews } = await supabase
      .from('page_views')
      .select('slide_number, slide_name')
      .gte('timestamp', fromDate);

    const slideStats: Record<number, { name: string; views: number }> = {};
    slideViews?.forEach(sv => {
      if (!slideStats[sv.slide_number]) {
        slideStats[sv.slide_number] = { name: sv.slide_name, views: 0 };
      }
      slideStats[sv.slide_number].views++;
    });

    // Mentor interactions
    const { data: mentorInteractions } = await supabase
      .from('mentor_interactions')
      .select('mentor_name, action_type')
      .gte('timestamp', fromDate);

    const mentorStats: Record<string, { clicks: number; actions: Record<string, number> }> = {};
    mentorInteractions?.forEach(mi => {
      if (!mentorStats[mi.mentor_name]) {
        mentorStats[mi.mentor_name] = { clicks: 0, actions: {} };
      }
      mentorStats[mi.mentor_name].clicks++;
      mentorStats[mi.mentor_name].actions[mi.action_type] =
        (mentorStats[mi.mentor_name].actions[mi.action_type] || 0) + 1;
    });

    // Top mentors
    const topMentors = Object.entries(mentorStats)
      .sort((a, b) => b[1].clicks - a[1].clicks)
      .slice(0, 10)
      .map(([name, stats]) => ({ name, ...stats }));

    // Device breakdown
    const { data: deviceData } = await supabase
      .from('page_views')
      .select('device_type')
      .gte('timestamp', fromDate);

    const deviceStats = {
      mobile: deviceData?.filter(d => d.device_type === 'mobile').length || 0,
      desktop: deviceData?.filter(d => d.device_type === 'desktop').length || 0,
    };

    res.status(200).json({
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
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error('[Platform Stats API] Error:', error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
}
```

### 4.3 Create `pages/api/analytics/stats/detailed.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { subDays } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'public, s-maxage=600'); // Cache 10 minutes

  const { days = 30, type = 'all' } = req.query;
  const dayCount = parseInt(days as string) || 30;
  const fromDate = subDays(new Date(), dayCount).toISOString();

  try {
    let response: Record<string, any> = {};

    if (type === 'all' || type === 'page_views') {
      const { data } = await supabase
        .from('page_views')
        .select('*')
        .gte('timestamp', fromDate)
        .order('timestamp', { ascending: false });

      response.page_views = data;
    }

    if (type === 'all' || type === 'feature_clicks') {
      const { data } = await supabase
        .from('feature_clicks')
        .select('*')
        .gte('timestamp', fromDate)
        .order('timestamp', { ascending: false });

      response.feature_clicks = data;
    }

    if (type === 'all' || type === 'mentor_interactions') {
      const { data } = await supabase
        .from('mentor_interactions')
        .select('*')
        .gte('timestamp', fromDate)
        .order('timestamp', { ascending: false });

      response.mentor_interactions = data;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('[Detailed Stats API] Error:', error);
    res.status(500).json({ error: 'Failed to fetch detailed stats' });
  }
}
```

---

## 📊 PHASE 5: CREATE ANALYTICS DASHBOARD

### 5.1 Create `pages/dashboard.tsx`

```typescript
import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'mentors' | 'slides'>('overview');

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/stats/platform?days=${days}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Failed to load analytics</div>
      </div>
    );
  }

  // Chart data
  const slideChartData = Object.values(stats.slides).map(s => ({
    name: s.name,
    views: s.views,
  }));

  const featureChartData = Object.entries(stats.features)
    .map(([name, count]) => ({
      name,
      clicks: count as number,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);

  const mentorChartData = stats.mentors.slice(0, 10).map(m => ({
    name: m.name,
    clicks: m.clicks,
  }));

  const deviceColors = {
    mobile: '#3b82f6',
    desktop: '#ef4444',
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">📊 Analytics Dashboard</h1>
          <p className="text-slate-400">
            {format(new Date(stats.date_range.from), 'MMM dd, yyyy')} -{' '}
            {format(new Date(stats.date_range.to), 'MMM dd, yyyy')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8 items-center flex-wrap">
          <select
            value={days}
            onChange={e => setDays(parseInt(e.target.value))}
            className="px-4 py-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700 font-bold"
          >
            Refresh
          </button>

          <span className="text-xs text-slate-500 ml-auto">
            Updated: {format(new Date(stats.timestamp), 'HH:mm:ss')}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1 */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">Unique Visitors</div>
            <div className="text-4xl font-black text-indigo-400">
              {stats.summary.unique_visitors}
            </div>
            <div className="text-xs text-slate-500 mt-2">This period</div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">Total Page Views</div>
            <div className="text-4xl font-black text-green-400">
              {stats.summary.total_page_views}
            </div>
            <div className="text-xs text-slate-500 mt-2">Slide visits</div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">Mobile Users</div>
            <div className="text-4xl font-black text-blue-400">
              {stats.summary.device_breakdown.mobile}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {stats.summary.device_breakdown.mobile + stats.summary.device_breakdown.desktop > 0
                ? Math.round(
                    (stats.summary.device_breakdown.mobile /
                      (stats.summary.device_breakdown.mobile +
                        stats.summary.device_breakdown.desktop)) *
                      100
                  )
                : 0}
              % of total
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">Desktop Users</div>
            <div className="text-4xl font-black text-red-400">
              {stats.summary.device_breakdown.desktop}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {stats.summary.device_breakdown.mobile + stats.summary.device_breakdown.desktop > 0
                ? Math.round(
                    (stats.summary.device_breakdown.desktop /
                      (stats.summary.device_breakdown.mobile +
                        stats.summary.device_breakdown.desktop)) *
                      100
                  )
                : 0}
              % of total
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
          <h2 className="text-xl font-bold mb-4">📱 Device Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Mobile', value: stats.summary.device_breakdown.mobile },
                  { name: 'Desktop', value: stats.summary.device_breakdown.desktop },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {(['overview', 'features', 'mentors', 'slides'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded font-bold capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'features' && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
            <h2 className="text-xl font-bold mb-4">🎯 Feature Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Bar dataKey="clicks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>

            {/* Feature Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-right py-2 px-4">Clicks</th>
                    <th className="text-right py-2 px-4">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {featureChartData.map((feature, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="py-3 px-4">{feature.name}</td>
                      <td className="text-right py-3 px-4 font-bold">{feature.clicks}</td>
                      <td className="text-right py-3 px-4 text-slate-400">
                        {(
                          (feature.clicks /
                            Object.values(stats.features).reduce((a, b) => a + (b as number), 0)) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'slides' && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
            <h2 className="text-xl font-bold mb-4">📄 Slide Views</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={slideChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Bar dataKey="views" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>

            {/* Slide Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-4">Slide</th>
                    <th className="text-right py-2 px-4">Views</th>
                    <th className="text-right py-2 px-4">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {slideChartData.map((slide, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="py-3 px-4">{slide.name}</td>
                      <td className="text-right py-3 px-4font-bold">{slide.views}</td>
                      <td className="text-right py-3 px-4 text-slate-400">
                        {(
                          (slide.views / stats.summary.total_page_views) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-8">
            <h2 className="text-xl font-bold mb-4">⭐ Mentor Popularity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mentorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Bar dataKey="clicks" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>

            {/* Mentor Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-4">Mentor</th>
                    <th className="text-right py-2 px-4">Total Clicks</th>
                    <th className="text-right py-2 px-4">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.mentors.slice(0, 20).map((mentor, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="py-3 px-4">{mentor.name}</td>
                      <td className="text-right py-3 px-4 font-bold">{mentor.clicks}</td>
                      <td className="text-right py-3 px-4 text-slate-400">
                        {mentor.clicks > 0
                          ? (
                              (mentor.clicks /
                                stats.mentors.reduce((sum, m) => sum + m.clicks, 0)) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Slide Views Chart */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-bold mb-4">📊 Slide Views Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={slideChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="views" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Clicks */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-bold mb-4">🎯 Top Features Used</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={featureChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="clicks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Mentors */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-bold mb-4">⭐ Top 10 Most Clicked Mentors</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mentorChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="clicks" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-xl font-bold mb-4">📈 Key Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Avg Views per Slide</div>
                  <div className="text-3xl font-bold text-green-400">
                    {(stats.summary.total_page_views / slideChartData.length).toFixed(0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Total Features Used</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {Object.values(stats.features).reduce((a, b) => a + (b as number), 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Total Mentor Interactions</div>
                  <div className="text-3xl font-bold text-purple-400">
                    {stats.mentors.reduce((sum, m) => sum + m.clicks, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Avg Interactions per Mentor</div>
                  <div className="text-3xl font-bold text-pink-400">
                    {(stats.mentors.reduce((sum, m) => sum + m.clicks, 0) / stats.mentors.length).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔌 PHASE 6: INTEGRATE TRACKING IN COMPONENTS 

### Update `src/App.tsx`:

```typescript
import { useAnalytics } from './hooks/useAnalytics';
import { SLIDE_NAMES } from './utils/analytics';

// Inside App component
const { trackPageView } = useAnalytics();

useEffect(() => {
  trackPageView(currentSlide, SLIDE_NAMES[currentSlide] || 'Unknown');
}, [currentSlide, trackPageView]);
```
###### BARU SAMPE SINI WOI!!!!
### Update `src/components/slides/MentorMatchmakerSlide.tsx`:

```typescript
import { useAnalytics } from '../../hooks/useAnalytics';

export const MentorMatchmakerSlide = () => {
  const { trackFeatureClick, trackMentorInteraction } = useAnalytics();

  return (
    <>
      <button
        onClick={() => {
          trackFeatureClick('Mulai Simulasi', 'SmartMatch', 1);
          // ... existing logic
        }}
      >
        Mulai Simulasi
      </button>

      {/* When mentors are clicked in results */}
      {results.map(mentor => (
        <button
          key={mentor.name}
          onClick={() => {
            trackMentorInteraction(mentor.name, 'click', 'Smart Match', 1);
          }}
        >
          Detail
        </button>
      ))}
    </>
  );
};
```

### Update `src/components/SearchAndFilter.tsx`:

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

export const SearchAndFilter = () => {
  const { trackFeatureClick } = useAnalytics();

  return (
    <>
      <button
        onClick={() => {
          trackFeatureClick('Cari Manual', 'Filter', 2);
          // ... existing
        }}
      >
        Cari Manual
      </button>

      <select
        onChange={() => {
          trackFeatureClick('Filter Kategori', 'CategoryFilter', 2);
        }}
      >
        {/* Options */}
      </select>
    </>
  );
};
```

### Update `src/components/MentorCard.tsx`:

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

export const MentorCard = ({ mentor, source = 'direktori' }) => {
  const { trackMentorInteraction } = useAnalytics();

  return (
    <>
      <button
        onClick={() => {
          trackMentorInteraction(mentor.name, 'chat', source === 'smart_match' ? 'Smart Match' : 'Direktori', 2);
          // ... contact logic
        }}
      >
        Chat
      </button>

      <button
        onClick={() => {
          trackMentorInteraction(mentor.name, 'detail', source, 2);
          // ... detail logic
        }}
      >
        Detail
      </button>

      <button
        onClick={() => {
          trackMentorInteraction(mentor.name, 'instagram', source, 2);
          // ... instagram logic
        }}
      >
        Instagram
      </button>
    </>
  );
};
```

---

## 🚀 PHASE 7: ENVIRONMENT SETUP & DEPLOYMENT

### Step 7.1: Create `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxx
```

### Step 7.2: Deploy to Vercel

**Option 1: Automatic (Recommended)**
```bash
# Push to GitHub
git add .
git commit -m "Add comprehensive analytics system"
git push origin main

# Vercel will auto-deploy
```

**Option 2: Manual**
```bash
npm i -g vercel
vercel login
vercel deploy --prod
```

### Step 7.3: Add Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. **Settings → Environment Variables**
4. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Redeploy

---

## 🔒 SECURITY BEST PRACTICES

1. **Supabase RLS (Row-Level Security)** - Set to read-only from frontend
2. **API Routes** - Write data through API routes when possible
3. **Rate Limiting** - Consider adding in API routes later
4. **Dashboard Auth** - Add password protection:

```typescript
// pages/dashboard.tsx
import { useState } from 'react';

const Dashboard = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    if (password === process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Wrong password');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter dashboard password"
          className="px-4 py-2 rounded"
        />
        <button onClick={handleAuth} className="ml-2 px-4 py-2 bg-indigo-600 rounded text-white">
          Login
        </button>
      </div>
    );
  }

  // ... rest of dashboard
};
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] **Supabase Setup** (30 min)
  - [ ] Create account
  - [ ] Create project
  - [ ] Run SQL to create tables
  - [ ] Get environment keys

- [ ] **Package Installation** (5 min)
  - [ ] npm install @supabase/supabase-js
  - [ ] npm install date-fns
  - [ ] npm install recharts

- [ ] **Code Scaffolding** (90 min)
  - [ ] Create src/utils/analytics.ts
  - [ ] Create src/hooks/useAnalytics.ts
  - [ ] Create pages/api/analytics/track.ts
  - [ ] Create pages/api/analytics/stats/platform.ts
  - [ ] Create pages/api/analytics/stats/detailed.ts
  - [ ] Create pages/dashboard.tsx

- [ ] **Integration** (60 min)
  - [ ] Update src/App.tsx with tracking
  - [ ] Update MentorMatchmakerSlide.tsx
  - [ ] Update SearchAndFilter.tsx
  - [ ] Update MentorCard.tsx
  - [ ] Test locally

- [ ] **Deployment** (30 min)
  - [ ] Add .env.local
  - [ ] Test npm run build
  - [ ] Push to GitHub
  - [ ] Add env vars in Vercel
  - [ ] Monitor deployment

**Total Time:** ~4 hours (end-to-end)

---

## 🎯 EXPECTED RESULTS

After deployment (give it 1-2 days of traffic):

```
Dashboard will show:
✅ Unique visitors count
✅ Page views per slide
✅ Feature usage breakdown (which buttons are clicked most)
✅ Top 10 mentors by clicks
✅ Device breakdown (mobile vs desktop)
✅ Time-based filtering (7, 14, 30, 90 days)
✅ Actionable insights for optimization
```

---

## 📞 TROUBLESHOOTING

**Q: "Cannot find module '@supabase/supabase-js'"**
A: Run `npm install @supabase/supabase-js`

**Q: "API routes not found"**
A: Make sure files are in `pages/api/` directory (Next.js routes)

**Q: "Dashboard shows no data"**
A: 
1. Check if Supabase keys are correct
2. Ensure tables are created
3. Wait 5-10 minutes for data to populate
4. Check browser console for errors

**Q: "Build fails with TypeScript errors"**
A: Make sure all imports are correct and types match

---

## 🚀 NEXT STEPS

1. **This week:** Implement all phases above
2. **Next week:** Monitor analytics and identify top features
3. **Week 3:** Optimize UI based on data
4. **Week 4:** Add more advanced features (referral tracking, session duration, etc)

**Result:** Production-grade analytics system that tells you exactly what users are doing! 📊
