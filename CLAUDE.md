# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development
npm run dev              # Start dev server on port 8080

# Build
npm run build            # Production build
npm run build:dev        # Development build with source maps

# Testing
npm run test             # Run tests with Vitest
npm run test:ui          # Interactive test UI
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint validation

# Assets
npm run optimize-images  # Compress images (macOS sips-based)
```

### Running a Single Test

```bash
npx vitest run src/components/Logo.test.tsx
npx vitest run --watch src/path/to/file.test.tsx
```

## Architecture Overview

### Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State**: React Query for server state, Context API for global UI state
- **UI**: shadcn/ui components + Tailwind CSS
- **Routing**: React Router v6 with code-splitting

### Key Architectural Patterns

**1. Hybrid State Management**
- `@tanstack/react-query` for all Supabase data (configured with 5-min stale time, 1 retry)
- `LoadingContext` (`src/contexts/LoadingContext.tsx`) for global loading state with ref-based counting
- Local state for forms and UI interactions

**2. Code Splitting**
- Eager load: Index, Auth, NotFound (critical path)
- Lazy load: All other routes via `React.lazy()` with `PageLoadingSkeleton` fallback
- See `src/App.tsx` for route definitions

**3. Error Boundaries**
- Global `ErrorBoundary` wraps entire app
- `RouteErrorBoundary` per route with variant styles (dashboard, tracker, content, simple)

**4. Input Validation**
- All validation schemas in `src/lib/validation.ts` using Zod
- Includes schemas for wellness entries, bookings, chat messages, symptom tracking
- Helper functions: `validateInput()`, `truncateText()`

### Critical Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions, providers, error boundaries |
| `src/contexts/LoadingContext.tsx` | Global loading state management |
| `src/integrations/supabase/client.ts` | Supabase client (auto-generated, don't edit) |
| `src/integrations/supabase/types.ts` | Database types (auto-generated, don't edit) |
| `src/lib/validation.ts` | Zod validation schemas for all user inputs |
| `src/components/MumtazWisdomGuide.tsx` | AI chat companion (global, always mounted) |

### Path Alias

The `@` alias maps to `./src`:
```typescript
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
```

## Domain Concepts

This is a women's wellness app with domain-specific terminology:

- **Dosha**: Ayurvedic constitution types (vata, pitta, kapha)
- **Life Stages**: menstruation, pregnancy, postpartum, perimenopause, menopause
- **Conditions**: PCOS, endometriosis, PMDD, arthritis (tracked via condition-specific schemas)
- **Wellness Entries**: Daily tracking with emotional_state, physical_symptoms, pain_level (0-10), emotional_score (1-10)

### Pregnancy Safety

The `usePregnancySafeMode` hook filters yoga poses for pregnancy safety. Poses have exclusion reasons when not safe for specific trimesters.

## Testing Setup

- **Framework**: Vitest with jsdom environment
- **Setup file**: `src/test/setup.ts` (mocks matchMedia, ResizeObserver, IntersectionObserver)
- **Test pattern**: `src/**/*.{test,spec}.{ts,tsx}`
- **Coverage excludes**: `src/components/ui/` (shadcn components), `src/test/`, `*.d.ts`

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Adding New Routes

1. Create page component in `src/pages/`
2. Add lazy import in `src/App.tsx` (unless critical path)
3. Add Route with `RouteErrorBoundary` wrapper
4. Place above the catch-all `*` route (see comment in App.tsx)

## Component Organization

- `src/components/ui/` - shadcn/ui primitives (don't modify directly)
- `src/components/` - Application-specific components
- `src/pages/` - Route-level page components
- `src/hooks/` - Custom React hooks
- `src/assets/poses/` - Yoga pose images
