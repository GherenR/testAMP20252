# 📊 ANALYTICS SYSTEM - VISUAL GUIDE

## What Gets Tracked? 🎯

```
User → Website
        ↓
      Click Event
        ↓
    useAnalytics Hook
        ↓
   Supabase (DB)
        ↓
    API Routes
        ↓
    Dashboard
```

---

## 📁 File Structure

```
your-project/
├── src/
│   ├── utils/
│   │   └── analytics.ts           ← Helper functions
│   │
│   └── hooks/
│       ├── useAnalytics.ts        ← Main tracking hook ⭐
│       └── index.ts               ← Updated (exports useAnalytics)
│
├── pages/
│   ├── api/
│   │   └── analytics/
│   │       ├── track.ts           ← Generic tracking endpoint
│   │       └── stats/
│   │           ├── platform.ts    ← Get platform-wide stats
│   │           └── detailed.ts    ← Get raw detailed data
│   │
│   └── dashboard.tsx              ← Beautiful analytics dashboard ⭐
│
├── .env.local                     ← Supabase credentials (CREATE THIS)
└── package.json                   ← Updated (add 3 packages)
```

---

## 🔄 Data Flow

### **Event Happens (User clicks button)**
```typescript
// In MentorCard.tsx
const { trackMentorInteraction } = useAnalytics();

<button onClick={() => {
  trackMentorInteraction('Siti Nurassifa', 'chat', 'Direktori', 2);
  // ↓↓↓
}}>
  Chat
</button>
```

### **Event Sent to Supabase**
```typescript
// In useAnalytics.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

await supabase.from('mentor_interactions').insert({
  session_id: 'session_1707223...',
  mentor_name: 'Siti Nurassifa',
  action_type: 'chat',
  source_feature: 'Direktori',
  source_slide: 2,
  device_type: 'mobile',
  timestamp: '2026-02-06T10:45:23Z'
  // ↓↓↓
});
```

### **Data Stored in PostgreSQL**
```
Supabase Database:
┌─ mentor_interactions table ──────┐
│ id  │ mentor_name    │ action    │
├─────┼────────────────┼───────────┤
│ 1   │ Siti Nurassifa │ chat      │
│ 2   │ Ahmad Hidayat  │ detail    │
│ 3   │ Siti Nurassifa │ click     │
│ ...                              │
└──────────────────────────────────┘
```

### **API Route Aggregates Data**
```typescript
// /api/analytics/stats/platform.ts
GET /api/analytics/stats/platform?days=30

// Groups data by mentor name
mentorStats = {
  'Siti Nurassifa': { clicks: 87, chat_clicks: 34 },
  'Ahmad Hidayat': { clicks: 56, chat_clicks: 18 },
  'Lisa Indriani': { clicks: 45, chat_clicks: 12 }
}
```

### **Dashboard Displays Charts**
```
/dashboard page shows:
┌─────────────────────┐
│ ⭐ Top Mentors     │
│ Siti: 87 clicks   │
│ Ahmad: 56 clicks  │
│ Lisa: 45 clicks   │
└─────────────────────┘
```

---

## 📊 What Data Is Collected?

### **Table 1: page_views**
```
When: User navigates to a new slide
What: Each row = 1 slide visit

Columns:
- session_id       (anonymous user ID)
- slide_number     (0=Home, 1=Smart Match, 2=Direktori, etc)
- slide_name       ('Home', 'Smart Match', etc)
- device_type      ('mobile' or 'desktop')
- timestamp        (when viewed)
```

### **Table 2: feature_clicks**
```
When: User clicks a button or filter
What: Each row = 1 feature click

Columns:
- session_id       (anonymous user ID)
- feature_name     ('Mulai Simulasi', 'Search', 'Filter', etc)
- feature_type     ('button', 'filter', 'search', 'action')
- slide_number     (which slide it happened on)
- device_type      ('mobile' or 'desktop')
- timestamp        (when clicked)
```

### **Table 3: mentor_interactions**
```
When: User clicks on a mentor
What: Each row = 1 mentor interaction

Columns:
- session_id       (anonymous user ID)
- mentor_name      ('Siti Nurassifa', 'Ahmad Hidayat', etc)
- action_type      ('click', 'detail', 'chat', 'compare', 'instagram')
- source_feature   ('Smart Match', 'Direktori', 'Comparison Modal')
- source_slide     (slide number where it happened)
- device_type      ('mobile' or 'desktop')
- timestamp        (when clicked)
```

---

## 🚀 3-Step Setup

### **Step 1: Supabase** (30 min)
```
1. Go to supabase.com
2. Sign up → Create project
3. Run SQL (from ANALYTICS_SETUP_COMPLETE.md)
4. Copy: Project URL + anon key
```

### **Step 2: Packages** (2 min)
```bash
npm install @supabase/supabase-js date-fns recharts
```

### **Step 3: Integrate** (90 min)
```
Add tracking calls to:
- App.tsx (trackPageView)
- MentorMatchmakerSlide.tsx (trackFeatureClick, trackMentorInteraction)
- SearchAndFilter.tsx (trackFeatureClick)
- MentorCard.tsx (trackMentorInteraction)

Follow: INTEGRATION_GUIDE.md
```

---

## 🎯 Tracking Examples

### **Example 1: User Visits Smart Match Slide**
```typescript
// App.tsx
useEffect(() => {
  trackPageView(1, 'Smart Match');
  // ↓ Records: Page view to slide 1
}, [currentSlide]);
```

### **Example 2: User Clicks Mulai Simulasi**
```typescript
// MentorMatchmakerSlide.tsx
<button onClick={() => {
  trackFeatureClick('Mulai Simulasi', 'button', 1);
  // ↓ Records: Button click on slide 1
}}>
```

### **Example 3: User Clicks Mentor**
```typescript
// MentorCard.tsx
<button onClick={() => {
  trackMentorInteraction('Siti Nurassifa', 'chat', 'Direktori', 2);
  // ↓ Records: Mentor interaction on slide 2
}}>
  Chat
</button>
```

---

## 📊 Dashboard Sections

Visit `http://localhost:3000/dashboard` (or live URL) to see:

### **Overview Tab** (Main)
```
Summary Cards:
├─ 👥 Unique Visitors: 247
├─ 📄 Page Views: 847
├─ 📱 Mobile: 156
└─ 💻 Desktop: 91

Charts:
├─ Slide views over time
├─ Feature usage breakdown
├─ Top mentors chart
└─ Device breakdown pie
```

### **Features Tab**
```
Bar chart of all features used:
├─ Cari Manual: 187
├─ Mulai Simulasi: 98
├─ Filter Kategori: 73
└─ ...

Filterable table with percentages
```

### **Mentors Tab**
```
Bar chart of top mentors:
├─ Siti Nurassifa: 87
├─ Ahmad Hidayat: 56
├─ Lisa Indriani: 45
└─ ...

Top 30 mentors with click counts
```

### **Slides Tab**
```
Bar chart of slide views:
├─ Direktori: 342
├─ Smart Match: 198
├─ Home: 156
└─ ...

All slides with view counts
```

---

## 🔧 Configuration

### **.env.local** (Create this file)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

Get these from:
- Supabase dashboard → Settings → API → Project URL & anon key

---

## 📈 What You Can Learn

After implementation, you'll see:

✅ **Usage Patterns**
- Which slide gets most traffic
- When users are most active
- Mobile vs desktop preferences

✅ **Feature Insights**
- Most used features
- Unused features (to remove)
- Feature combinations

✅ **Mentor Performance**
- Most popular mentors
- Contact rate per mentor
- Trending vs stable mentors

✅ **User Behavior**
- Traffic sources
- User journey flows
- Conversion funnels

---

## 🚨 Common Mistakes (Avoid These!)

❌ **Wrong:** Tracking every mouse movement
✅ **Right:** Track intentional clicks only

❌ **Wrong:** Using mentor IDs for names
✅ **Right:** Use full mentor names

❌ **Wrong:** Forgetting to add `.env.local`
✅ **Right:** Create file before testing

❌ **Wrong:** Deploying without testing locally
✅ **Right:** Test, build, then deploy

---

## 📋 Verification Checklist

- [ ] Files created (check 6 new files exist)
- [ ] Packages installed (`npm install` ran without errors)
- [ ] `.env.local` created with correct values
- [ ] Supabase tables created (SQL ran successfully)
- [ ] Tracking added to components (5 files updated)
- [ ] Build passes (`npm run build` = 0 errors)
- [ ] Local testing works (visit dashboard)
- [ ] Deploy to Vercel with env vars
- [ ] Live dashboard shows real data

---

## 🎯 Success = You See Real Data

**Locally:**
```
npm run build     ✅ No errors
npm run dev       ✅ Website loads
Click buttons     ✅ Events tracked
localhost:3000/dashboard ✅ Shows your clicks
```

**Live on Vercel:**
```
Deploy succeeds   ✅ No errors
Real users visit  ✅ Traffic arrives
Share dashboard   ✅ See live analytics
Make decisions    ✅ Use data to improve
```

---

## 💡 Pro Tips

**1. Start Simple**
Just track page views first. Add feature tracking after it works.

**2. Monitor Performance**
Dashboard auto-refreshes every 60 seconds. Monitor API response time.

**3. Data Privacy**
You're only collecting session IDs + clicks. No PII. GDPR compliant.

**4. Use Insights**
After 1 week of data, you'll spot patterns. Use them to optimize!

**5. Scale Gradually**
Add more sophisticated tracking as you grow. Start with basics.

---

## 📞 Need Help?

**Files to read (in order):**
1. This file (overview)
2. `INTEGRATION_GUIDE.md` (how to add tracking)
3. `ANALYTICS_SETUP_COMPLETE.md` (detailed reference)
4. `ANALYTICS_QUICK_START.md` (step-by-step)

**Common Issues:**
- Can't see data? Check `.env.local` has correct values
- Dashboard won't load? Check Supabase connection in browser console
- Build fails? Do `npm install @supabase/supabase-js date-fns recharts`

---

## 🎉 You're Ready!

All code is created. Documentation is complete.

**Next:** Follow `ANALYTICS_SETUP_COMPLETE.md` Phase 1-7 or `INTEGRATION_GUIDE.md` for quick integration.

Happy tracking! 📊✨
