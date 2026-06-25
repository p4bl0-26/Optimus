# OPTIMUS DEPLOYMENT CHECKLIST
**Phase:** 7 — Chief of Staff Layer Completed

---

## 1. Required Environment Variables

Ensure the following variables are set in both your local `.env.local` and in Vercel's Environment Variables dashboard:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Internal Auth (If bypassing RLS for Edge API routes)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth Integration
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Public Application URL (Crucial for OAuth redirects)
NEXT_PUBLIC_APP_URL=https://your-production-url.vercel.app
```

---

## 2. Vercel Settings
- **Framework Preset:** Next.js
- **Node.js Version:** 20.x
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## 3. Google OAuth Production Redirect URIs
In the [Google Cloud Console](https://console.cloud.google.com/), you must add the following **Authorized redirect URIs** matching your Vercel domain:

1. `https://your-production-url.vercel.app/api/integrations/gmail/callback`
2. `https://your-production-url.vercel.app/api/integrations/classroom/callback`
3. `https://your-production-url.vercel.app/api/integrations/calendar/callback`

> **Note:** Do not forget to update the Google OAuth Consent Screen to Production mode if testing is complete.

---

## 4. Supabase Production Configuration
1. **RLS (Row Level Security):** Ensure RLS policies are enabled on all tables (`obligations`, `risk_profiles`, `interventions`, `briefings`, `agent_activity`, `integrations`, `agent_memory`).
2. **Database Backups:** Enable daily PITR (Point-in-Time Recovery) for production data.
3. **Auth Redirects:** Ensure the Site URL and Redirect URLs in Supabase Authentication -> URL Configuration match the Vercel domain.

---

## DEPLOYMENT STATUS

**STATUS:** ✅ PASS  
**READY FOR PRODUCTION:** TRUE
