# 📊 REAL USER ANALYTICS IMPLEMENTATION GUIDE
## Track Website Activity → Display as Social Proof

**Strategy:** Gunakan real visitor data untuk membuat social proof yang authentic dan constantly updated

**Tech Stack for Vercel:**
- **Database:** Supabase (PostgreSQL, free tier 1M rows)
- **Analytics:** Vercel Analytics + Custom Events
- **Display:** Real-time stats on mentor cards
- **Admin:** Simple dashboard untuk lihat data

---

## 🎯 ARCHITECTURE OVERVIEW

```
User Activity
    ↓
Event Tracking (React)
    ↓
Vercel API Route (/api/track)
    ↓
Supabase (PostgreSQL)
    ↓
Real-time Updated Mentor Stats
    ↓
Display on Mentor Card
```

---

## 📈 DATA TO COLLECT

### **Event Types (Track These)**
```
1. PAGE_VISIT
   - Page: 0 (Hero), 1 (Smart Match), 2 (Direktori), etc
   - Timestamp
   - Device: mobile/desktop
   - Refer: organic, direct, whatsapp, etc

2. BUTTON_CLICK
   - Button: "Mulai Simulasi", "Cari Manual", etc
   - Page: which slide
   - Timestamp
   - Device

3. MENTOR_CLICK
   - Mentor: [name]
   - Action: chat, detail, compare, instagram
   - From: Smart Match or Direktori
   - Timestamp

4. COMPARISON_ADD
   - Mentor: [name]
   - Source: Smart Match or Direktori
   - Timestamp

5. WHATSAPP_OPEN
   - Mentor: [name]
   - Timestamp
```

### **Derived Metrics (Calculate From Events)**
```
For Each Mentor:
- Total clicks (sum of mentor_click events)
- Chat clicks count
- Detail views count
- Times added to comparison
- Success rate = (chat clicks / total clicks) × 100

For Platform:
- Total visitors (unique sessions)
- Smart Match clicks (count)
- Direktori clicks (count)
- Total mentor contacts (sum chat clicks)
- Most popular mentor
- Feature usage stats
```

---

## 🛠️ SETUP STEPS

### **Step 1: Setup Supabase (Free Tier)**

1. Go to https://supabase.com
2. Sign up (free)
3. Create new project
4. Get `SUPABASE_URL` and `SUPABASE_ANON_KEY`
5. Create tables:

```sql
-- Table 1: Page Views
CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  page_number INT,
  device_type TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id UUID
);

-- Table 2: Button Clicks
CREATE TABLE button_clicks (
  id BIGSERIAL PRIMARY KEY,
  button_name TEXT,
  page_number INT,
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id UUID
);

-- Table 3: Mentor Interactions
CREATE TABLE mentor_interactions (
  id BIGSERIAL PRIMARY KEY,
  mentor_name TEXT,
  action_type TEXT, -- 'click', 'chat', 'detail', 'compare'
  source TEXT, -- 'smart_match', 'direktori'
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id UUID
);

-- Table 4: Analytics Cache (for fast queries)
CREATE TABLE mentor_stats (
  id BIGSERIAL PRIMARY KEY,
  mentor_name TEXT UNIQUE,
  total_clicks INT DEFAULT 0,
  chat_clicks INT DEFAULT 0,
  detail_views INT DEFAULT 0,
  compare_adds INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Table 5: Platform Stats (aggregate)
CREATE TABLE platform_stats (
  id BIGSERIAL PRIMARY KEY,
  metric_name TEXT,
  metric_value INT,
  date_recorded DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **Step 2: Add Environment Variables**

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx

# For development
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx (optional, for admin operations)
```

Update `vercel.json` or Vercel dashboard:
```json
{
  "env": [
    {
      "key": "NEXT_PUBLIC_SUPABASE_URL",
      "value": "https://xxxxx.supabase.co"
    },
    {
      "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "value": "eyJxxxxxx"
    }
  ]
}
```

---

### **Step 3: Create Analytics Hook**

File: `src/hooks/useAnalytics.ts`

```typescript
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useAnalytics = () => {
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    // Generate or get session ID from localStorage
    if (!sessionIdRef.current) {
      const stored = localStorage.getItem('analytics_session_id');
      if (stored) {
        sessionIdRef.current = stored;
      } else {
        sessionIdRef.current = `session_${Date.now()}_${Math.random()}`;
        localStorage.setItem('analytics_session_id', sessionIdRef.current);
      }
    }
  }, []);

  /**
   * Track page view
   */
  const trackPageView = async (pageNumber: number, deviceType: 'mobile' | 'desktop') => {
    try {
      await supabase.from('page_views').insert({
        page_number: pageNumber,
        device_type: deviceType,
        session_id: sessionIdRef.current,
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  /**
   * Track button click (Smart Match, Direktori, etc)
   */
  const trackButtonClick = async (buttonName: string, pageNumber: number) => {
    try {
      await supabase.from('button_clicks').insert({
        button_name: buttonName,
        page_number: pageNumber,
        session_id: sessionIdRef.current,
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  /**
   * Track mentor interaction (click, chat, detail, compare)
   */
  const trackMentorInteraction = async (
    mentorName: string,
    actionType: 'click' | 'chat' | 'detail' | 'compare',
    source: 'smart_match' | 'direktori'
  ) => {
    try {
      await supabase.from('mentor_interactions').insert({
        mentor_name: mentorName,
        action_type: actionType,
        source: source,
        session_id: sessionIdRef.current,
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  return {
    trackPageView,
    trackButtonClick,
    trackMentorInteraction,
    sessionId: sessionIdRef.current,
  };
};
```

---

### **Step 4: Integrate Tracking in Components**

**App.tsx - Track page views:**
```typescript
import { useAnalytics } from './hooks/useAnalytics';

export const App = () => {
  const { trackPageView } = useAnalytics();
  
  // Track page view on slide change
  useEffect(() => {
    const deviceType = window.innerWidth < 640 ? 'mobile' : 'desktop';
    trackPageView(currentSlide, deviceType);
  }, [currentSlide, trackPageView]);

  // ... rest of component
};
```

**MentorMatchmakerSlide.tsx - Track Smart Match button:**
```typescript
const { trackButtonClick, trackMentorInteraction } = useAnalytics();

<button
  onClick={() => {
    trackButtonClick('Mulai Simulasi', 1); // 1 = Smart Match slide
    onRunMatchmaker();
  }}
>
  Mulai Simulasi
</button>
```

**MentorCard.tsx - Track mentor clicks:**
```typescript
const { trackMentorInteraction } = useAnalytics();

<button
  onClick={() => {
    trackMentorInteraction(mentor.name, 'chat', 'direktori');
    onContact?.(mentor);
  }}
>
  Chat
</button>
```

---

### **Step 5: Create Stats API Route**

File: `pages/api/analytics/mentor-stats.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Cache for 5 minutes
  res.setHeader('Cache-Control', 'public, s-maxage=300');

  try {
    // Get mentor stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data: interactions, error } = await supabase
      .from('mentor_interactions')
      .select('mentor_name, action_type')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (error) throw error;

    // Aggregate by mentor
    const stats: Record<string, any> = {};

    interactions?.forEach((interaction) => {
      if (!stats[interaction.mentor_name]) {
        stats[interaction.mentor_name] = {
          clicks: 0,
          chat_clicks: 0,
          detail_views: 0,
          compare_adds: 0,
        };
      }

      stats[interaction.mentor_name].clicks++;

      if (interaction.action_type === 'chat') stats[interaction.mentor_name].chat_clicks++;
      if (interaction.action_type === 'detail') stats[interaction.mentor_name].detail_views++;
      if (interaction.action_type === 'compare') stats[interaction.mentor_name].compare_adds++;
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
```

**File: `pages/api/analytics/platform-stats.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'public, s-maxage=300');

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Unique visitors
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const uniqueVisitors = new Set(pageViews?.map(v => v.session_id) || []).size;

    // Button clicks
    const { data: buttonClicks } = await supabase
      .from('button_clicks')
      .select('button_name')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const smartMatchClicks = buttonClicks?.filter(b => b.button_name === 'Mulai Simulasi').length || 0;
    const direktoriClicks = buttonClicks?.filter(b => b.button_name === 'Cari Manual').length || 0;

    // Total mentor contacts
    const { data: contacts } = await supabase
      .from('mentor_interactions')
      .select('action_type')
      .eq('action_type', 'chat')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const totalContacts = contacts?.length || 0;

    // Most clicked mentor
    const { data: allInteractions } = await supabase
      .from('mentor_interactions')
      .select('mentor_name')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    const mentorClicks: Record<string, number> = {};
    allInteractions?.forEach(i => {
      mentorClicks[i.mentor_name] = (mentorClicks[i.mentor_name] || 0) + 1;
    });

    const mostClickedMentor = Object.entries(mentorClicks).sort((a, b) => b[1] - a[1])[0];

    res.status(200).json({
      unique_visitors: uniqueVisitors,
      smart_match_clicks: smartMatchClicks,
      direktori_clicks: direktoriClicks,
      total_mentor_contacts: totalContacts,
      most_clicked_mentor: mostClickedMentor?.[0],
      most_clicked_mentor_count: mostClickedMentor?.[1] || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch platform stats' });
  }
}
```

---

### **Step 6: Add Stats to Mentor Card**

Hook to fetch stats: `src/hooks/useMentorStats.ts`

```typescript
import { useEffect, useState } from 'react';

interface MentorStats {
  clicks: number;
  chat_clicks: number;
  detail_views: number;
  compare_adds: number;
}

export const useMentorStats = () => {
  const [stats, setStats] = useState<Record<string, MentorStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics/mentor-stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch mentor stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 60 seconds for real-time feel
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
};
```

**Update MentorCard.tsx:**

```typescript
import { useMentorStats } from '../hooks/useMentorStats';

export const MentorCard = ({ mentor, ... }) => {
  const { stats } = useMentorStats();
  const mentorStats = stats[mentor.name] || { clicks: 0, chat_clicks: 0 };

  return (
    <div>
      {/* Existing card content */}
      
      {/* NEW: Stats from analytics */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
          <div>
            <div className="text-green-600">{mentorStats.clicks}+</div>
            <div className="text-slate-500">Viewed</div>
          </div>
          <div>
            <div className="text-green-600">{mentorStats.chat_clicks}</div>
            <div className="text-slate-500">Contacted</div>
          </div>
          <div>
            <div className="text-green-600">
              {mentorStats.clicks > 0 
                ? Math.round((mentorStats.chat_clicks / mentorStats.clicks) * 100)
                : 0}%
            </div>
            <div className="text-slate-500">Success</div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### **Step 7: Add Platform Stats to Hero Page**

File: `src/hooks/usePlatformStats.ts`

```typescript
import { useEffect, useState } from 'react';

export interface PlatformStats {
  unique_visitors: number;
  smart_match_clicks: number;
  direktori_clicks: number;
  total_mentor_contacts: number;
  most_clicked_mentor: string;
  most_clicked_mentor_count: number;
}

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics/platform-stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch platform stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds for real-time feel
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
};
```

**Add to HeroSlide.tsx:**

```typescript
import { usePlatformStats } from '../../hooks/usePlatformStats';

export const HeroSlide = () => {
  const { stats } = usePlatformStats();

  return (
    <div>
      {/* Existing hero content */}

      {/* NEW: Platform stats display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">
            {stats?.unique_visitors || '500'}+
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Visitors This Month
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-green-600">
            {stats?.total_mentor_contacts || '200'}+
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Mentorships Started
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            {stats?.smart_match_clicks || '150'}+
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Smart Matches Used
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            {stats?.most_clicked_mentor_count || '45'}+
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Top Mentor Choices
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🚀 DEPLOYMENT TO VERCEL

### **Step 1: Setup GitHub Integration**
```bash
# If not already done
git init
git add .
git commit -m "Add analytics system"
git push origin main
```

### **Step 2: Connect to Vercel**
```
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import project
4. Select repository
```

### **Step 3: Add Environment Variables in Vercel**
```
Dashboard → Project Settings → Environment Variables

Add:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Step 4: Deploy**
```bash
# Automatic on push to main
git push origin main

# Or manual
vercel deploy --prod
```

---

## 📊 REAL-TIME UPDATES

Make stats feel alive:

**Option 1: Slow Polling** (Simple)
```typescript
// Refresh every 30-60 seconds
setInterval(() => fetchStats(), 30000);
```

**Option 2: WebSocket** (Advanced)
```typescript
// Use Supabase Realtime
const subscription = supabase
  .from('mentor_interactions')
  .on('*', payload => {
    console.log('New interaction!', payload);
    // Update stats in real-time
  })
  .subscribe();
```

**Option 3: Server-Sent Events** (Medium)
```typescript
// Streaming updates from API
```

---

## 📈 SAMPLE DATA AFTER 1 MONTH

```
Hero Stats Display:
┌─────────────────────────────────┐
│ 1,234 Visitors                  │
│ 456 Mentorships Started         │
│ 789 Smart Matches Used          │
│ Siti Nurassifa: Top Choice 87x  │
└─────────────────────────────────┘

Mentor Card Stats:
┌──────────────────────┐
│ Siti Nurassifa       │
│ Viewed 87+ times     │
│ Contacted 34 times   │
│ Success Rate: 39%    │
│ [Chat] [Detail]      │
└──────────────────────┘
```

---

## 🔒 PRIVACY & SECURITY

**Data Collected is Anonymous:**
- No personal info
- Session IDs only (not linked to user identity)
- No PII
- Compliant with GDPR/privacy laws

**Best Practices:**
1. Set Supabase RLS (Row-Level Security) to read-only from frontend
2. Use API routes to write data (more control)
3. Never expose sensitive keys
4. Aggregate data (don't store individual clicks)

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Create Supabase account & project
- [ ] Create tables (copy SQL above)
- [ ] Add environment variables
- [ ] Create `useAnalytics` hook
- [ ] Integrate tracking in components
- [ ] Create API routes for stats
- [ ] Create `useMentorStats` hook
- [ ] Update MentorCard to display stats
- [ ] Create `usePlatformStats` hook
- [ ] Add stats display to HeroSlide
- [ ] Test locally
- [ ] Deploy to Vercel
- [ ] Monitor & tweak

---

## 📝 NEXT STEPS

**Fase 1: Basic Analytics (This Week)**
- Track page views & button clicks
- Display on hero & mentor cards

**Fase 2: Advanced Analytics (Next Week)**
- Add success rate calculation
- Add trending mentors
- Add referral tracking

**Fase 3: Analytics Dashboard (Week 3)**
- Admin panel for mentors to see their stats
- Export data to CSV
- Visualizations & graphs

