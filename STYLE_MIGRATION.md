# Style Migration Summary

This document outlines the style migration from Tailwind classes to inline styles, matching the design system from `agent-orchestrator-catalog`.

## Overview

The pilot-command application has been updated to match the visual style and layout of the agent-orchestrator-catalog application. This includes:

- **Design System**: Clean, modern interface with consistent spacing and typography
- **Color Scheme**: Purple/blue primary color (#343ced) with coordinated status colors
- **Layout**: Fixed header with navigation, centered content area, footer
- **Components**: Inline styles instead of Tailwind classes for better consistency

---

## Color Palette

### Primary Colors
- **Primary**: `#343ced` (purple/blue)
- **Primary Light**: `#ede9fe` (light purple background)
- **Primary Border**: `#c4b5fd` (purple border)

### Status Colors
- **Success**: `#10b981` (green)
  - Background: `#d1fae5`
- **Warning**: `#f59e0b` (amber)
  - Background: `#fef3c7`
- **Danger**: `#ef4444` (red)
  - Background: `#fee2e2`

### Text Colors
- **Dark**: `#1f2937` (headings, primary text)
- **Medium**: `#6b7280` (secondary text)
- **Light**: `#9ca3af` (tertiary text)

### Background Colors
- **Body Background**: `#f8f9fb` (light gray)
- **Card Background**: `white`
- **Gray Background**: `#f9fafb`

### Border Colors
- **Border**: `#e5e7eb` (standard border)
- **Border Light**: `#d1d5db` (lighter border)

---

## Layout Structure

### Fixed Header
The header is now fixed at the top with:
- Glean logo (32x32px)
- Application title and subtitle
- Navigation tabs
- White background with subtle shadow
- 85px padding-top on body to account for fixed header

### Content Area
- Max width: 1400px (centered)
- White background with rounded corners (12px)
- Padding: 32px
- Border and subtle shadow

### Footer
- Multi-column layout
- Resources, support links, system info
- Gray background with border-top

---

## Component Updates

### 1. Card Component (`src/components/ui/Card.tsx`)

**Before** (Tailwind):
```tsx
<Card className="rounded-lg border">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

**After** (Inline Styles):
```tsx
<Card style={{ marginBottom: 20 }}>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>
```

**Features**:
- Hover effect with shadow transition
- Consistent border-radius (12px)
- Standard padding (20px)
- Optional onClick handler

### 2. Stat Component (`src/components/ui/Stat.tsx`)

**Usage**:
```tsx
<Stat 
  label="Total Users" 
  value={1234}
  color="#343ced"
  bg="#ede9fe"
  trend={{ value: 12, isPositive: true }}
/>
```

**Features**:
- Colored number badge (64x64px)
- Label below badge
- Optional trend indicator
- Optional icon in top-right

### 3. Button Component (`src/components/ui/Button.tsx`)

**Usage**:
```tsx
<button style={buttonStyles.primary}>
  Click Me
</button>

// Or use the Button component
<Button variant="primary" size="md">
  Click Me
</Button>
```

**Variants**: primary, secondary, success, warning, danger, disabled
**Sizes**: sm, md, lg

### 4. Badge Component (`src/components/ui/Badge.tsx`)

**Usage**:
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>
```

**Features**:
- Rounded corners (12px)
- Color-coded backgrounds and text
- Subtle borders

---

## Common Styles (`src/lib/commonStyles.ts`)

Import and use predefined styles:

```tsx
import { buttonStyles, cardStyles, colors } from '@/lib/commonStyles';

// Button styles
<button style={buttonStyles.primary}>Primary</button>
<button style={buttonStyles.secondary}>Secondary</button>
<button style={buttonStyles.success}>Success</button>

// Card styles
<div style={cardStyles.card}>
  Content
</div>

// Colors
<div style={{ color: colors.primary }}>
  Colored text
</div>
```

---

## Navigation

The navigation component (`src/components/layout/Navigation.tsx`) provides:
- Tab-style navigation
- Active state highlighting (purple background + border)
- Hover effects
- Client-side routing with Next.js

**Tabs**:
- Dashboard (`/`)
- Sentiment (`/sentiment`)
- Users (`/users`)
- Health (`/health`)

---

## Typography

### System Font Stack
```css
font-family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
```

### Heading Sizes
- **H1**: 32px, font-weight 700
- **H2**: 24px, font-weight 600
- **H3 (Card Title)**: 18px, font-weight 600
- **H4**: 14px, font-weight 600

### Body Text
- **Large**: 16px
- **Regular**: 14px
- **Small**: 13px
- **Extra Small**: 12px (badges)

---

## Global CSS (`src/app/globals.css`)

Key features:
- CSS variables for card heights and spacing
- Responsive grid utilities
- Form element styling (inputs, selects, buttons)
- Focus states with primary color
- Link styles

---

## Migration Checklist

When creating new components or pages:

- ✅ Use inline styles instead of Tailwind classes
- ✅ Import `commonStyles` for buttons and cards
- ✅ Use color constants from `commonStyles.ts`
- ✅ Apply consistent spacing (12px, 16px, 20px, 32px)
- ✅ Use border-radius: 12px for cards and containers
- ✅ Use border-radius: 8px for buttons and inputs
- ✅ Include hover effects where appropriate
- ✅ Maintain 1400px max-width for content
- ✅ Use the updated Card, Stat, Button, Badge components

---

## Example Page Structure

```tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { buttonStyles } from '@/lib/commonStyles';

export default function MyPage() {
  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#111827' }}>
          Page Title
        </h1>
        <p style={{ marginTop: 8, fontSize: 16, color: '#6b7280' }}>
          Page description
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 16,
        marginBottom: 32 
      }}>
        <Stat label="Total" value={100} />
        <Stat label="Active" value={85} color="#10b981" bg="#d1fae5" />
      </div>

      {/* Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
          <CardDescription>Section description</CardDescription>
        </CardHeader>
        <CardContent>
          <button style={buttonStyles.primary}>
            Action Button
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Key Files Updated

1. **Layout & Navigation**
   - `src/app/layout.tsx` - Root layout with header and footer
   - `src/app/globals.css` - Global styles and CSS variables
   - `src/components/layout/Navigation.tsx` - Tab navigation
   - `src/components/layout/Footer.tsx` - Footer component

2. **UI Components**
   - `src/components/ui/Card.tsx` - Card with inline styles
   - `src/components/ui/Stat.tsx` - Stat card component
   - `src/components/ui/Button.tsx` - Button with variants
   - `src/components/ui/Badge.tsx` - Badge component

3. **Utilities**
   - `src/lib/commonStyles.ts` - Shared style definitions

4. **Pages**
   - `src/app/page.tsx` - Updated homepage example

5. **Assets**
   - `public/logos/glean.svg` - Glean logo

---

## Development Tips

1. **Consistency**: Use the predefined styles from `commonStyles.ts` instead of creating custom inline styles
2. **Spacing**: Stick to multiples of 4px (8, 12, 16, 20, 24, 32, 40)
3. **Colors**: Use the color constants to ensure consistency across the app
4. **Hover States**: Add subtle hover effects for interactive elements
5. **Responsiveness**: Use CSS Grid with `repeat(auto-fit, minmax(..., 1fr))` for responsive layouts

---

## Testing

Run the development server to see the new styling:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the updated interface.

---

**Last Updated**: January 2026



