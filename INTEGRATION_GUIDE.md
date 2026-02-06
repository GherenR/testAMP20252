# 🔌 INTEGRATION GUIDE - ADD TRACKING TO EXISTING COMPONENTS

**Timeline:** 30-45 minutes
**Difficulty:** Easy (just add tracking calls)

---

## ✅ QUICK START: 3 Steps Only

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js date-fns recharts
```

### Step 2: Add Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxx
```

Get these from Supabase dashboard: **Settings → API → Project URL & anon key**

### Step 3: Add Tracking to Components (Below)

---

## 🔧 COMPONENT INTEGRATION

### 1️⃣ Update `src/App.tsx`

Add this import at the top:
```typescript
import { useAnalytics } from './hooks/useAnalytics';
import { SLIDE_NAMES } from './utils/analytics';
```

Inside your App component, add this:
```typescript
export const App = () => {
  const { trackPageView } = useAnalytics();

  // Assuming you have a state for current slide
  useEffect(() => {
    // Track when slide changes
    trackPageView(currentSlide, SLIDE_NAMES[currentSlide] || 'Unknown');
  }, [currentSlide, trackPageView]);

  // ... rest of your code
};
```

---

### 2️⃣ Update `src/components/slides/MentorMatchmakerSlide.tsx`

Add import:
```typescript
import { useAnalytics } from '../../hooks/useAnalytics';
```

Inside component:
```typescript
export const MentorMatchmakerSlide = () => {
  const { trackFeatureClick, trackMentorInteraction } = useAnalytics();

  // When user clicks "Mulai Simulasi" button
  const handleRunMatchmaker = () => {
    trackFeatureClick('Mulai Simulasi', 'button', 1); // 1 = Smart Match slide
    // ... existing logic
  };

  // When results are displayed and user clicks on a mentor
  const handleMentorClick = (mentor: Mentor) => {
    trackMentorInteraction(
      mentor.name,
      'click',
      'Smart Match',
      1 // slide number
    );
    // ... open detail modal or navigate
  };

  return (
    <>
      <button onClick={handleRunMatchmaker}>
        Mulai Simulasi
      </button>

      {/* When showing results */}
      {results.map(mentor => (
        <div key={mentor.name}>
          <button onClick={() => handleMentorClick(mentor)}>
            Lihat Detail
          </button>
        </div>
      ))}
    </>
  );
};
```

---

### 3️⃣ Update `src/components/SearchAndFilter.tsx`

Add import:
```typescript
import { useAnalytics } from '../hooks/useAnalytics';
```

Inside component:
```typescript
export const SearchAndFilter = () => {
  const { trackFeatureClick } = useAnalytics();

  // When category filter clicked
  const handleCategoryFilter = (category: string) => {
    trackFeatureClick('Filter Kategori', 'filter', 2); // 2 = Direktori slide
    // ... existing filter logic
  };

  // When path filter clicked
  const handlePathFilter = (path: string) => {
    trackFeatureClick('Filter Path', 'filter', 2);
    // ... existing filter logic
  };

  // When search input changed
  const handleSearch = (query: string) => {
    trackFeatureClick('Search Mentor', 'search', 2);
    // ... existing search logic
  };

  return (
    <>
      <input
        type="text"
        placeholder="Cari mentor..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      <select onChange={(e) => handleCategoryFilter(e.target.value)}>
        <option value="">Semua Kategori</option>
        {/* options */}
      </select>

      <select onChange={(e) => handlePathFilter(e.target.value)}>
        <option value="">Semua Path</option>
        {/* options */}
      </select>
    </>
  );
};
```

---

### 4️⃣ Update `src/components/MentorCard.tsx`

Add import:
```typescript
import { useAnalytics } from '../hooks/useAnalytics';
```

Inside component:
```typescript
interface MentorCardProps {
  mentor: Mentor;
  source?: 'smart_match' | 'direktori'; // Add this prop
  slideNumber?: number; // Add this prop
}

export const MentorCard = ({
  mentor,
  source = 'direktori',
  slideNumber = 2
}: MentorCardProps) => {
  const { trackMentorInteraction } = useAnalytics();

  // Chat/Contact button
  const handleContact = () => {
    trackMentorInteraction(
      mentor.name,
      'chat',
      source === 'smart_match' ? 'Smart Match' : 'Direktori',
      slideNumber
    );
    // ... existing contact logic (open WhatsApp, etc)
  };

  // Detail button
  const handleViewDetail = () => {
    trackMentorInteraction(
      mentor.name,
      'detail',
      source === 'smart_match' ? 'Smart Match' : 'Direktori',
      slideNumber
    );
    // ... existing detail logic (open modal)
  };

  // Instagram button
  const handleInstagram = () => {
    trackMentorInteraction(
      mentor.name,
      'instagram',
      source === 'smart_match' ? 'Smart Match' : 'Direktori',
      slideNumber
    );
    // ... existing instagram logic (open link)
  };

  // Compare button
  const handleCompare = () => {
    trackMentorInteraction(
      mentor.name,
      'compare',
      source === 'smart_match' ? 'Smart Match' : 'Direktori',
      slideNumber
    );
    // ... existing compare logic
  };

  return (
    <div>
      {/* Your existing card content */}

      <button onClick={handleContact}>
        💬 Chat
      </button>

      <button onClick={handleViewDetail}>
        👁️ Detail
      </button>

      <button onClick={handleInstagram}>
        📸 Instagram
      </button>

      <button onClick={handleCompare}>
        ⚖️ Compare
      </button>
    </div>
  );
};
```

---

### 5️⃣ Update `src/components/slides/HeroSlide.tsx`

Add import:
```typescript
import { useAnalytics } from '../../hooks/useAnalytics';
```

Inside component:
```typescript
export const HeroSlide = () => {
  const { trackFeatureClick } = useAnalytics();

  const handleExplore = () => {
    trackFeatureClick('Jelajahi', 'button', 0); // 0 = Home slide
    // ... navigate to next slide
  };

  return (
    <>
      <button onClick={handleExplore}>
        Jelajahi Sekarang
      </button>
    </>
  );
};
```

---

## 📱 Using Tracking in Different Source Locations

When calling `trackMentorInteraction`, specify where the click came from:

### From Smart Match Results
```typescript
trackMentorInteraction(
  mentor.name,
  'chat',
  'Smart Match',
  1 // slide 1
);
```

### From Direktori Search
```typescript
trackMentorInteraction(
  mentor.name,
  'chat',
  'Direktori',
  2 // slide 2
);
```

### From Comparison Modal
```typescript
trackMentorInteraction(
  mentor.name,
  'chat',
  'Comparison Modal',
  2 // current slide when modal opened
);
```

---

## 🧪 Testing Tracking Locally

### 1. Check Console
Open browser DevTools (F12) → Console. You should see no errors from analytics.

### 2. Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Run this query to see if data is being inserted:
   ```sql
   SELECT * FROM page_views ORDER BY timestamp DESC LIMIT 10;
   SELECT * FROM feature_clicks ORDER BY timestamp DESC LIMIT 10;
   SELECT * FROM mentor_interactions ORDER BY timestamp DESC LIMIT 10;
   ```

### 3. Visit Dashboard
Go to http://localhost:3000/dashboard (or your dev URL)
- Should show "Loading analytics..."
- After ~10 seconds, should show data
- If not, check console for errors

---

## 🚀 DEPLOYMENT TO VERCEL

### 1. Push to GitHub
```bash
git add .
git commit -m "Add analytics system with dashboard"
git push origin main
```

### 2. Add Environment Variables in Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add two variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Save**
6. Vercel will auto-redeploy

### 3. Verify Live
Visit your production URL + `/dashboard`
- Should see real analytics from live users!

---

## 📊 WHAT GETS TRACKED

After integration, your dashboard will show:

✅ **Slide Views**
- How many times each slide (Home, Smart Match, Direktori, etc) was viewed
- Which slide gets most traffic
- Device breakdown (mobile vs desktop per slide)

✅ **Feature Usage**
- How many times "Mulai Simulasi" was clicked
- How many times "Cari Manual" was used
- Which filters are popular
- Search usage patterns

✅ **Mentor Popularity**
- Which mentors get clicked most
- Which mentors get contacted (chat clicks)
- Which mentors are added to comparisons
- Instagram profile clicks

✅ **Device Breakdown**
- Percentage mobile vs desktop
- Trends over time

---

## 🎯 EXAMPLE: After 1 Day of Traffic

Dashboard will show something like:
```
👥 Unique Visitors: 247
📄 Total Page Views: 847
📱 Mobile Users: 156 (63%)
💻 Desktop Users: 91 (37%)

📊 Most Viewed Slides:
  1. Direktori - 342 views
  2. Smart Match - 198 views
  3. Home - 156 views
  4. About - 102 views
  5. Etika - 49 views

🎯 Most Used Features:
  1. Cari Manual - 187 clicks
  2. Mulai Simulasi - 98 clicks
  3. Filter Kategori - 73 clicks
  4. Search - 52 clicks

⭐ Top Mentors:
  1. Siti Nurassifa - 54 clicks (22% contacted)
  2. Ahmad Hidayat - 34 clicks (26% contacted)
  3. Lisa Indriani - 28 clicks (18% contacted)
```

---

## ❓ TROUBLESHOOTING

**Q: Dashboard shows "Failed to load analytics"**
- A: Check if Supabase URL and key are correct in `.env.local`
- A: Check if tables were created in Supabase (SQL Editor)
- A: Check browser console for error messages

**Q: No data showing in dashboard**
- A: Wait 5-10 seconds after visiting live site (data needs to be inserted)
- A: Check that tracking calls are being made (check console for errors)
- A: Check Supabase connection (try SELECT query in SQL editor)

**Q: Import errors for `useAnalytics`**
- A: Make sure file is at `src/hooks/useAnalytics.ts`
- A: Make sure `@supabase/supabase-js` is installed (npm install)

**Q: Build errors with date-fns or recharts**
- A: Run `npm install date-fns recharts`
- A: Run `npm run build` to verify

---

## 📋 FINAL CHECKLIST

- [ ] Install packages: `npm install @supabase/supabase-js date-fns recharts`
- [ ] Create `.env.local` with Supabase keys
- [ ] Add tracking import to 5 components (App, MentorMatchmaker, SearchFilter, MentorCard, HeroSlide)
- [ ] Test locally by visiting site and checking Supabase tables
- [ ] Build locally: `npm run build` (should pass with 0 errors)
- [ ] Push to GitHub
- [ ] Add env vars in Vercel
- [ ] Verify live dashboard works

**Result:** Production analytics system tracking every user action! 📊

---

## 🎓 Example: Complete Tracking Flow

1. User visits your website → `trackPageView(0, 'Home')`
2. User clicks "Mulai Simulasi" → `trackFeatureClick('Mulai Simulasi', 'button', 1)`
3. Smart Match runs and shows results
4. User clicks on "Siti Nurassifa" detail → `trackMentorInteraction('Siti Nurassifa', 'click', 'Smart Match', 1)`
5. User clicks "Chat" → `trackMentorInteraction('Siti Nurassifa', 'chat', 'Smart Match', 1)`
6. User switches to Direktori → `trackPageView(2, 'Direktori')`
7. User searches for mentor → `trackFeatureClick('Search Mentor', 'search', 2)`
8. User clicks on "Ahmad Hidayat" → `trackMentorInteraction('Ahmad Hidayat', 'click', 'Direktori', 2)`
9. User clicks "Compare" → `trackMentorInteraction('Ahmad Hidayat', 'compare', 'Direktori', 2)`

**Result in Dashboard:**
- Home slide: 1 view
- Smart Match slide: 1 view, feature: 1 Mulai Simulasi click, mentor: Siti Nurassifa (1 click, 1 chat)
- Direktori slide: 1 view, feature: 1 search, mentor: Ahmad Hidayat (1 click, 1 compare)

Perfect! 📊
