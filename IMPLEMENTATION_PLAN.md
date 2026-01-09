# Major UI/UX Overhaul - Implementation Tracker

## Status: IN PROGRESS

### Phase 1: Foundation ✅ STARTED
- [x] Data already normalized (allFeedbackItems with sentiment field)
- [ ] Add new KPI calculations (6 tiles)
- [ ] Create 3-zone layout structure
- [ ] Apply new color scheme base

### Phase 2: Visualizations
- [ ] Feedback Volume Over Time (stacked bars)
- [ ] Positive Rate Over Time (line + rolling avg)
- [ ] Unique Raters Over Time (line)
- [ ] Top Issue Types (horizontal bars, stacked by sentiment)
- [ ] Issue Type Trend Over Time (stacked area/bars)
- [ ] Participation Concentration (Pareto)
- [ ] User Polarization (histogram)

### Phase 3: Table & Interactions
- [ ] Filter bar (search, sentiment toggle, issue type filter)
- [ ] Sort controls
- [ ] Detail drawer (click row to expand)
- [ ] Clear filters button

### Phase 4: Insights Panel
- [ ] Create tabbed panel (Summary/Top Users/Examples)
- [ ] Top Raters leaderboard
- [ ] Most Negative/At-risk users
- [ ] Biggest change users
- [ ] Examples section with click-to-filter
- [ ] Move tag clouds to Examples tab

### Phase 5: Polish
- [ ] Apply complete color scheme (slate/indigo/amber/teal)
- [ ] Typography updates (text-[15px] leading-7)
- [ ] Consistent spacing (space-y-6, p-6)
- [ ] Sticky panel with internal scroll
- [ ] Mobile responsive stacking

## Current File Size
- sentiment/page.tsx: ~2000 lines → will grow to ~3500+ lines

## New Components Needed
- DetailDrawer component (optional - can inline)
- Leaderboard component (optional - can inline)

## Files to Modify
1. src/app/sentiment/page.tsx (main work)
2. src/app/globals.css (color variables)
3. Possibly extract new components if file gets too large
