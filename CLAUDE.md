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
| `src/components/MumtazWisdomGuide.tsx` | AI chat companion (requires authentication) |
| `src/hooks/useAuth.ts` | Authentication state hook |
| `supabase/functions/mumtaz-wisdom-guide/index.ts` | Edge Function for chatbot (requires ANTHROPIC_API_KEY) |

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

### Supabase Edge Function Secrets

The following secrets must be configured in Supabase Dashboard → Edge Functions → Secrets:

| Secret | Required | Description |
|--------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for Ask Mumtaz chatbot |

#### Setting up the Anthropic API Key

1. Get your API key from [console.anthropic.com](https://console.anthropic.com/)
2. Go to your Supabase Dashboard → Project Settings → Edge Functions
3. Click "Add new secret"
4. Name: `ANTHROPIC_API_KEY`, Value: your API key
5. Deploy the edge function: `supabase functions deploy mumtaz-wisdom-guide`

The chatbot uses **Claude Sonnet** for optimal balance of quality, speed, and cost.

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

## Recent Changes & Important Notes

### February 1, 2026 - Ask Mumtaz Authentication Fix

**Problem**: Users could open the chatbot without being authenticated, leading to JWT errors when trying to send messages.

**Solution Implemented**:
1. Added `useAuth()` hook to `MumtazWisdomGuide.tsx`
2. Created sign-in UI for unauthenticated users
3. Added session validation before sending messages
4. Enhanced error handling for auth errors (AUTH_REQUIRED, SESSION_EXPIRED)
5. Updated Edge Function error messages to be user-friendly

**Files Modified**:
- `src/components/MumtazWisdomGuide.tsx` - Added auth checks and sign-in UI
- `supabase/functions/mumtaz-wisdom-guide/index.ts` - Improved error messages

**Testing**:
- ✅ Unauthenticated users see sign-in screen
- ✅ Authenticated users can chat normally
- ✅ Session expiry redirects to login
- ✅ Clear error messages (no more "missing sub claim")

**Documentation**:
- [CHANGES_APPLIED.md](./CHANGES_APPLIED.md) - Complete change summary
- [MUMTAZ_CHAT_AUTHENTICATION_ANALYSIS.md](./MUMTAZ_CHAT_AUTHENTICATION_ANALYSIS.md) - Technical analysis

### Key Learnings

**Authentication Pattern**:
```typescript
// Always check auth before protected operations
const { isAuthenticated, isLoading: authLoading } = useAuth();

// Validate session before API calls
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  navigate('/auth');
  return;
}
```

**Error Code Handling**:
- `AUTH_REQUIRED` - No auth header provided
- `SESSION_EXPIRED` - JWT invalid or user not found
- `INTERNAL_ERROR` - Transient API error (auto-retry)
- `RATE_LIMIT` - Too many requests

**UX Best Practices**:
- Show clear sign-in UI instead of letting users try and fail
- Provide user-friendly error messages, not technical jargon
- Redirect to login with state preservation for return path
- Disable inputs when authentication is required
