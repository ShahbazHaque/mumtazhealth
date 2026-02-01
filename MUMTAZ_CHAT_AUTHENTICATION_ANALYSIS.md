# Ask Mumtaz Function - Authentication Analysis & Fix

**Date**: February 1, 2026
**Issue**: JWT Authentication Error - "invalid claim: missing sub claim"
**Status**: Critical - Function unusable due to auth errors

---

## Executive Summary

The Ask Mumtaz chatbot function is **currently broken** due to authentication errors. The logs show repeated `AuthApiError: invalid claim: missing sub claim` failures, preventing users from interacting with the chatbot.

**Root Cause**: The Edge Function expects a valid user JWT token, but **users cannot see or know if they're logged in** because there's no login button or auth indicator in the UI when the chat is accessible.

**Current State**: The function requires authentication but provides no way for users to authenticate from the chat interface.

---

## How the System Currently Works

### User Authentication Flow

1. **Login Page** (`/auth`)
   - Users can sign up or log in with email/password
   - Creates a Supabase session with JWT access token
   - Session is stored in browser (localStorage/cookies)
   - After login, users are redirected to dashboard

2. **Session Management**
   - `useAuth()` hook monitors authentication state
   - Provides `user`, `session`, `isAuthenticated`, `isLoading`
   - Automatically subscribes to auth state changes

3. **Protected Routes**
   - Some routes wrapped in `<ProtectedRoute>` component
   - Redirects unauthenticated users to `/auth`
   - Examples: `/settings`, `/insights`, `/my-daily-practice`

### Ask Mumtaz Chatbot Interaction

**Access Points**:
- **Desktop**: Floating "Ask Mumtaz" button (bottom right) - visible on ALL pages
- **Mobile**: Bottom navigation bar icon - visible on ALL pages
- **Both**: Accessible from any route EXCEPT auth pages (`/auth`, `/onboarding`, `/reset-password`)

**Current Behavior**:

```
User Journey:
1. User visits ANY page (authenticated or not)
2. User clicks "Ask Mumtaz" button
3. Chat dialog opens
4. User types a message
5. Frontend calls Edge Function with Authorization header
6. ❌ FAILURE: If user is not logged in, JWT is invalid/missing
7. Error: "invalid claim: missing sub claim"
```

### The Edge Function (`mumtaz-wisdom-guide`)

**Authentication Check** (Lines 98-123):

```typescript
// Get the Authorization header
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Authentication required' }),
    { status: 401 }
  );
}

// Verify the user is authenticated
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } }
});

const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  console.error("[CHATBOT_API_ERROR] Auth verification failed:", authError);
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401 }
  );
}
```

**What the Function Does**:
- ✅ Requires valid user authentication
- ✅ Fetches user profile data (username, dosha, life stage, etc.)
- ✅ Personalizes responses based on user wellness profile
- ✅ Saves conversation history to database (user-specific)
- ✅ Provides safety guardrails for pregnancy, medical advice, etc.

---

## The Problem: What's Going Wrong

### 1. **The JWT Token Issue**

From your logs, the error occurs at this line in the Edge Function:

```
const { data: { user }, error: authError } = await supabase.auth.getUser();
```

**Error Message**:
```
AuthApiError: invalid claim: missing sub claim
Status: 403 (Forbidden)
Code: bad_jwt
```

**What this means**:
- The JWT token being sent is **missing the `sub` (subject) claim**
- The `sub` claim contains the user ID - it's **required** for user authentication
- This happens when:
  - User is not logged in (no session exists)
  - Session has expired
  - An invalid/malformed token is being sent

### 2. **How the Frontend Calls the Function**

In `MumtazWisdomGuide.tsx` (Line 360):

```typescript
const { data, error } = await supabase.functions.invoke("mumtaz-wisdom-guide", {
  body: {
    messages: [...],
    userName: userProfile?.username,
    // ... other profile data
  },
});
```

**The Issue**:
- Supabase client automatically includes the Authorization header from the current session
- **If there's no session** (user not logged in), the token is invalid or missing
- The Edge Function correctly rejects the request
- **But the user has no way to know they need to log in first!**

### 3. **The UX Problem**

**Current Design Flaws**:

❌ No authentication status indicator in the chat UI
❌ No "Sign in to continue" prompt when unauthenticated
❌ No login button in the chat interface
❌ Chat appears to work but silently fails with cryptic errors
❌ Users don't know WHY it's not working

**What Users Experience**:
1. Click "Ask Mumtaz" (works - dialog opens)
2. Type a question (works - input accepted)
3. Click Send (fails silently or shows generic error)
4. Get frustrated and leave

---

## Decision Point: Should This Require Authentication?

### Option A: Keep Authentication Required ✅ **RECOMMENDED**

**Why this makes sense**:
- Personalized responses based on dosha, life stage, pregnancy status
- Conversation history saved for each user
- Safety features require knowing user's wellness profile
- Prevents abuse and rate limiting per user
- Better user experience with context

**What needs to change**:
- Add authentication check BEFORE allowing chat interaction
- Show "Sign in to chat" UI for unauthenticated users
- Clear visual indicator of auth status
- Graceful handling when session expires

### Option B: Allow Anonymous Access

**Why this could work**:
- Lower friction - anyone can try the chatbot
- Good for marketing/demos
- Simpler onboarding

**Drawbacks**:
- No personalization (generic responses only)
- No conversation history
- No safety context (pregnancy, doshas, etc.)
- Harder to prevent abuse
- Loses core value proposition of personalized wellness guidance

**Verdict**: **Option A is better for Mumtaz Health's mission** of personalized, holistic wellness support.

---

## The Fix: Three-Part Solution

### Part 1: Fix the Frontend - Add Auth Check

**Location**: `src/components/MumtazWisdomGuide.tsx`

**Current Issue**: The component doesn't check if user is authenticated before opening

**Fix**: Add authentication awareness to the component

```typescript
import { useAuth } from "@/hooks/useAuth";

export function MumtazWisdomGuide() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOpen: open, openChat, closeChat } = useChat();

  // ... existing state ...

  // Show sign-in prompt if not authenticated
  const showSignInPrompt = open && !isLoading && !isAuthenticated;
```

**Add Sign-In UI**:
When chat opens but user is not authenticated, show:

```tsx
{showSignInPrompt ? (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Sparkles className="h-16 w-16 text-accent mb-4" />
    <h3 className="text-xl font-semibold mb-2">Sign in to Chat with Mumtaz</h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      To receive personalized wellness guidance based on your dosha, life stage,
      and wellness journey, please sign in or create an account.
    </p>
    <div className="flex gap-3">
      <Button onClick={() => navigate('/auth')}>
        Sign In
      </Button>
      <Button variant="outline" onClick={() => navigate('/auth')}>
        Create Account
      </Button>
    </div>
  </div>
) : (
  // ... existing chat UI ...
)}
```

### Part 2: Add Session Validation

**Before sending a message**, verify the session is still valid:

```typescript
const sendMessage = useCallback(async (messageText?: string, isRetry = false) => {
  const textToSend = messageText || input.trim();
  if (!textToSend || loading) return;

  // ✅ ADD THIS: Check session before sending
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast({
      title: "Session Expired",
      description: "Please sign in again to continue chatting.",
      variant: "destructive",
    });
    navigate('/auth');
    return;
  }

  // ... rest of existing code ...
});
```

### Part 3: Improve Error Handling in Edge Function

The Edge Function is actually handling this correctly! But we can make the error message clearer:

**Location**: `supabase/functions/mumtaz-wisdom-guide/index.ts`

**Current** (Lines 100-106):
```typescript
if (!authHeader) {
  console.error("[CHATBOT_API_ERROR] No authorization header provided");
  return new Response(
    JSON.stringify({ error: 'Authentication required' }),
    { status: 401 }
  );
}
```

**Better** (more user-friendly):
```typescript
if (!authHeader) {
  console.error("[CHATBOT_API_ERROR] No authorization header provided");
  return new Response(
    JSON.stringify({
      error: 'Please sign in to continue chatting with Mumtaz',
      errorCode: 'AUTH_REQUIRED'
    }),
    { status: 401 }
  );
}
```

**And** (Lines 117-123):
```typescript
if (authError || !user) {
  console.error("[CHATBOT_API_ERROR] Auth verification failed:", authError);
  return new Response(
    JSON.stringify({
      error: 'Your session has expired. Please sign in again.',
      errorCode: 'SESSION_EXPIRED'
    }),
    { status: 401 }
  );
}
```

---

## Additional Improvements

### 1. Add Visual Auth Status Indicator

Show user's login status in the chat header:

```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* ... existing avatar ... */}
    </div>

    {/* ✅ ADD THIS: Auth status */}
    {isAuthenticated ? (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        Signed in as {userProfile?.username}
      </div>
    ) : (
      <div className="flex items-center gap-2 text-xs text-amber-600">
        <AlertCircle className="h-4 w-4" />
        Not signed in
      </div>
    )}
  </div>
</CardHeader>
```

### 2. Graceful Session Expiry Handling

Monitor session in the background:

```typescript
useEffect(() => {
  if (!open || !isAuthenticated) return;

  // Check session validity every 5 minutes
  const checkSession = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Session Expired",
        description: "You've been signed out. Please log in again.",
      });
      closeChat();
      navigate('/auth');
    }
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(checkSession);
}, [open, isAuthenticated]);
```

### 3. Better Error Messages in Frontend

Update error handling (Line 391):

```typescript
if (data?.error) {
  // Check error code for specific handling
  if (data.errorCode === 'AUTH_REQUIRED' || data.errorCode === 'SESSION_EXPIRED') {
    // Show sign-in dialog instead of just toast
    setShowSignInPrompt(true);
  }

  toast({
    title: "Service Notice",
    description: data.error,
    variant: "destructive",
  });
  return;
}
```

---

## Implementation Checklist

### Critical (Must Fix Now)

- [ ] Add `useAuth()` to `MumtazWisdomGuide.tsx`
- [ ] Show "Sign In" UI when unauthenticated
- [ ] Validate session before sending messages
- [ ] Update Edge Function error messages
- [ ] Test: unauthenticated user tries to chat
- [ ] Test: authenticated user can chat
- [ ] Test: session expires during chat

### Important (Should Fix Soon)

- [ ] Add auth status indicator in chat header
- [ ] Handle session expiry gracefully
- [ ] Improve error message UX
- [ ] Add "Sign in" button to chat interface
- [ ] Test on mobile and desktop

### Nice to Have

- [ ] Add "Continue as guest" option (limited functionality)
- [ ] Save draft messages across sessions
- [ ] Show "session expires in X minutes" warning
- [ ] Auto-refresh session before expiry

---

## Testing Plan

### Test Case 1: Unauthenticated User
1. Log out (or use incognito)
2. Navigate to dashboard
3. Click "Ask Mumtaz"
4. **Expected**: See "Sign in to chat" message
5. Click "Sign In" button
6. **Expected**: Redirected to `/auth`

### Test Case 2: Authenticated User
1. Log in
2. Click "Ask Mumtaz"
3. **Expected**: Chat opens with personalized greeting
4. Send a message
5. **Expected**: Response received successfully

### Test Case 3: Session Expires During Chat
1. Log in
2. Open chat
3. Manually clear session (browser dev tools: `localStorage.clear()`)
4. Try to send a message
5. **Expected**: "Session expired" error with sign-in prompt

### Test Case 4: Invalid Token
1. Manually corrupt the auth token
2. Try to send chat message
3. **Expected**: Clear error message, not cryptic JWT error

---

## Summary of Recommendations

### Immediate Action Required

**The Ask Mumtaz function MUST require authentication** because:
1. It provides personalized guidance based on user wellness profiles
2. It saves conversation history per user
3. It has safety features that need user context (pregnancy, etc.)
4. It prevents abuse and enables rate limiting

**The Fix** (3 steps):
1. **Frontend**: Add auth check and "Sign in to chat" UI
2. **Frontend**: Validate session before sending messages
3. **Backend**: Improve error messages for clarity

**The Result**:
- Users know they need to sign in
- Clear path to authentication
- Graceful error handling
- Better user experience

### Long-term Improvements

1. Add session monitoring and auto-refresh
2. Visual auth status indicators
3. Better error recovery UX
4. Consider "guest mode" for demos (limited functionality)

---

## Files to Modify

1. **`src/components/MumtazWisdomGuide.tsx`**
   - Import `useAuth` hook
   - Add auth state check
   - Render sign-in UI when unauthenticated
   - Validate session before sending messages

2. **`supabase/functions/mumtaz-wisdom-guide/index.ts`**
   - Update error messages (Lines 103-106, 119-123)
   - Add `errorCode` to responses

---

## Conclusion

The Ask Mumtaz chatbot is a **personalized wellness companion** - authentication is not just necessary, it's **essential** to its value proposition. The current error occurs because users can access the chat interface without being logged in, but the backend correctly requires authentication.

**Fix the frontend to match the backend's expectations**, and the error will be resolved.

The good news: The backend is working correctly! The Edge Function is properly validating auth. We just need the frontend to handle unauthenticated users gracefully.

**Next Step**: Implement the three-part fix outlined above.
