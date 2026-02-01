# Deployment Checklist - Ask Mumtaz Authentication Fix

**Date**: February 1, 2026
**Version**: Authentication Fix Update

---

## Pre-Deployment Checklist

### 1. Code Review

- [x] All changes committed to git
- [ ] Code reviewed (if working with team)
- [ ] No console errors in development
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] ESLint passes (`npm run lint`)

### 2. Testing

#### Local Testing Required

- [ ] **Test 1: Unauthenticated User**
  - Open app in incognito mode (or log out)
  - Click "Ask Mumtaz" button
  - **Expected**: See "Sign in to Chat with Mumtaz" screen
  - **Expected**: No input field visible
  - **Expected**: Quick actions are disabled
  - Click "Sign In to Continue"
  - **Expected**: Redirected to `/auth` page

- [ ] **Test 2: Authenticated User - New Session**
  - Log in to the application
  - Click "Ask Mumtaz"
  - **Expected**: Chat opens with personalized greeting
  - **Expected**: See quick action buttons (enabled)
  - Send message: "Hello"
  - **Expected**: Receive response without errors
  - **Expected**: Response uses your name and wellness profile

- [ ] **Test 3: Session Expiry**
  - Log in and open chat
  - Open browser DevTools console
  - Run: `localStorage.clear()`
  - Try to send a message
  - **Expected**: See "Session Expired" toast
  - **Expected**: Redirected to `/auth`
  - **Expected**: Message is not sent

- [ ] **Test 4: Create Account Flow**
  - Log out
  - Click "Ask Mumtaz"
  - Click "Create Free Account"
  - **Expected**: Redirected to `/auth`
  - Complete signup
  - Return to dashboard
  - Click "Ask Mumtaz"
  - **Expected**: Chat works normally

- [ ] **Test 5: Mobile Experience**
  - Test on mobile viewport (or actual device)
  - Verify sign-in UI is responsive
  - Verify buttons are properly sized
  - Test authentication flow on mobile

### 3. Environment Variables

- [ ] `VITE_SUPABASE_URL` configured in `.env`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` configured in `.env`
- [ ] Edge Function secret `ANTHROPIC_API_KEY` set in Supabase Dashboard

---

## Deployment Steps

### Step 1: Build the Frontend

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run production build
npm run build

# Verify build succeeded
ls -la dist/
```

**Expected**: No errors, `dist/` folder contains compiled files

### Step 2: Deploy Edge Function

```bash
# Navigate to project root
cd /path/to/mumtazhealth

# Deploy the updated Edge Function
supabase functions deploy mumtaz-wisdom-guide

# Verify deployment
supabase functions list
```

**Expected**: Function shows as deployed with recent timestamp

### Step 3: Deploy Frontend

#### Option A: Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod

# Or if first time:
vercel
# Then: vercel --prod
```

#### Option B: Netlify

```bash
# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Option C: Manual Upload

1. Upload `dist/` folder contents to your hosting provider
2. Ensure server is configured for SPA routing (serve `index.html` for all routes)

### Step 4: Verify Deployment

- [ ] Visit production URL
- [ ] Test unauthenticated chatbot access
- [ ] Create test account and verify chatbot works
- [ ] Test on multiple devices/browsers
- [ ] Check browser console for errors

---

## Post-Deployment Verification

### Critical Path Testing (Production)

- [ ] **Homepage loads correctly**
  - No console errors
  - All styles loading
  - Navigation working

- [ ] **Authentication flow works**
  - Can access `/auth` page
  - Can sign up for new account
  - Can log in with existing account
  - Session persists on refresh

- [ ] **Ask Mumtaz works for authenticated users**
  - Chat button appears
  - Chat opens on click
  - Can send messages
  - Receives responses
  - Conversation history saved

- [ ] **Ask Mumtaz redirects for unauthenticated users**
  - See sign-in screen when not logged in
  - "Sign In" button redirects to auth page
  - Can return to chat after logging in

- [ ] **Edge Function is working**
  - No 500 errors from chatbot
  - Responses are personalized
  - Error messages are user-friendly

### Monitoring (First 24 Hours)

- [ ] Check Supabase Dashboard → Edge Functions → Logs
  - No unusual error rates
  - Authentication errors resolved
  - No "missing sub claim" errors

- [ ] Check analytics/error tracking (if configured)
  - Monitor user engagement with chatbot
  - Track authentication error rates
  - Watch for new error types

- [ ] User feedback
  - No reports of chatbot breaking
  - Users understand they need to sign in
  - No confusion about authentication

---

## Rollback Plan

If critical issues are discovered:

### Immediate Rollback (Frontend)

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
# Re-deploy previous version from git
git checkout [previous-commit]
npm run build
# Upload dist/ folder
```

### Rollback Edge Function

```bash
# Supabase doesn't have easy rollback
# Quick fix: update error messages in Supabase Dashboard → Edge Functions
# Or: git checkout previous version and redeploy

git checkout [previous-commit] supabase/functions/mumtaz-wisdom-guide/index.ts
supabase functions deploy mumtaz-wisdom-guide
```

### What to Monitor During Rollback

- Error rates normalize
- Users can access chatbot again
- Authentication flow works
- No new issues introduced

---

## Known Issues & Workarounds

### Issue: Old Sessions May Fail

**Symptom**: Users logged in before deployment see "Session Expired" error
**Cause**: Session validation now more strict
**Workaround**: Users should log out and log back in
**Impact**: Low - one-time inconvenience

### Issue: Browser Cache

**Symptom**: Users see old version of chatbot UI
**Cause**: Browser caching old JavaScript files
**Workaround**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
**Prevention**: Ensure proper cache headers in deployment config

---

## Performance Considerations

### No Performance Impact Expected

- ✅ No new dependencies added
- ✅ No database schema changes
- ✅ No additional API calls
- ✅ Edge Function logic unchanged (only error messages)

### Slight Improvements

- ✅ Fewer failed API calls (validation happens client-side first)
- ✅ Better user experience (less confusion, clearer errors)

---

## Communication Plan

### Internal Team

- [ ] Notify team of deployment
- [ ] Share testing results
- [ ] Document any issues encountered

### Users (if applicable)

- [ ] No announcement needed (UX improvement only)
- [ ] If issues occur, prepare support response:
  > "We've improved the chatbot authentication experience. If you're having trouble accessing the chat, please log out and log back in. Contact support if issues persist."

---

## Success Criteria

Deployment is successful when:

✅ All tests pass in production
✅ Zero "missing sub claim" errors in logs
✅ Unauthenticated users see sign-in screen
✅ Authenticated users can chat normally
✅ Session expiry handled gracefully
✅ No new errors in console or logs
✅ Mobile experience works properly

---

## Files Changed (Summary)

### Frontend
- `src/components/MumtazWisdomGuide.tsx` - Added authentication UI and validation

### Backend
- `supabase/functions/mumtaz-wisdom-guide/index.ts` - Improved error messages

### Documentation
- `README.md` - Updated with recent changes
- `CLAUDE.md` - Added session notes and patterns
- `CHANGES_APPLIED.md` - Complete change summary
- `MUMTAZ_CHAT_AUTHENTICATION_ANALYSIS.md` - Technical analysis
- `DEPLOYMENT_CHECKLIST.md` - This file

---

## Support Resources

### If Issues Occur

1. **Check Supabase Logs**
   - Dashboard → Edge Functions → mumtaz-wisdom-guide → Logs
   - Look for error patterns

2. **Check Browser Console**
   - Open DevTools → Console
   - Look for React errors or network failures

3. **Verify Environment Variables**
   - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Edge Function: `ANTHROPIC_API_KEY`

4. **Test Authentication Separately**
   - Try logging in/out without using chatbot
   - Verify basic auth flow works

### Reference Documentation

- [CHANGES_APPLIED.md](./CHANGES_APPLIED.md) - What was changed and why
- [MUMTAZ_CHAT_AUTHENTICATION_ANALYSIS.md](./MUMTAZ_CHAT_AUTHENTICATION_ANALYSIS.md) - Deep technical dive
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

## Next Session Prep

For tomorrow's session, review:

- [ ] This deployment checklist
- [ ] [CHANGES_APPLIED.md](./CHANGES_APPLIED.md) for full context
- [ ] [CLAUDE.md](./CLAUDE.md) for architecture patterns
- [ ] Production logs (if deployed)

All documentation is up to date and ready for the next development session!

---

**Prepared by**: Claude Sonnet 4.5
**Date**: February 1, 2026
**Status**: Ready for deployment
