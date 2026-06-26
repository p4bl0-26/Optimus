# OPTIMUS — Deployment Guide

**Version:** Phase 8 — Judge Mode Release  
**Stack:** Next.js 16 · Supabase · Gemini 1.5 Flash · Vercel

---

## 1. Environment Variables

Create `.env.local` locally. In Vercel, add these in **Project → Settings → Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_URL` | ✅ | Same as above (server-side) |
| `SUPABASE_ANON_KEY` | ✅ | Same as above (server-side) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth 2.0 Client Secret |
| `GOOGLE_REDIRECT_URI` | ✅ | Production Gmail callback URL |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |

---

## 2. Google OAuth Setup

### 2.1 Enable Google APIs

In [Google Cloud Console](https://console.cloud.google.com):

1. Go to **APIs & Services → Library**
2. Enable:
   - **Gmail API**
   - **Google Classroom API**
   - **Google Calendar API**
   - **Generative Language API** (for Gemini)

### 2.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add **Authorized redirect URIs** for your production domain:

```
https://your-domain.vercel.app/api/integrations/gmail/callback
https://your-domain.vercel.app/api/integrations/classroom/callback
https://your-domain.vercel.app/api/integrations/calendar/callback
```

5. For local development also add:
```
http://localhost:3000/api/integrations/gmail/callback
http://localhost:3000/api/integrations/classroom/callback
http://localhost:3000/api/integrations/calendar/callback
```

6. Copy the **Client ID** and **Client Secret** into your environment variables.

### 2.3 Set GOOGLE_REDIRECT_URI

The `GOOGLE_REDIRECT_URI` variable must be the production Gmail callback:

```
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/integrations/gmail/callback
```

> **Note:** Classroom and Calendar redirect URIs are currently derived from the same OAuth client. Update all three routes if needed.

---

## 3. Supabase Setup

### 3.1 Required Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Users
create table public.users (
  id uuid primary key,
  email text,
  role text default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Obligations
create table public.obligations (
  id text primary key,
  user_id uuid references public.users(id),
  source text,
  source_id text,
  title text not null,
  description text,
  status text default 'pending',
  type text,
  priority text,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Risk Profiles
create table public.risk_profiles (
  id text primary key,
  user_id uuid references public.users(id),
  obligation_id text references public.obligations(id),
  risk_score numeric default 0,
  risk_band text,
  reasoning text,
  recommended_focus text,
  missing_work text,
  future_outcomes jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Interventions
create table public.interventions (
  id text primary key,
  user_id uuid references public.users(id),
  obligation_id text references public.obligations(id),
  type text,
  severity text,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Agent Memory
create table public.agent_memory (
  id text primary key,
  user_id uuid references public.users(id),
  agent_name text,
  memory_type text,
  content jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent Activity
create table public.agent_activity (
  id text primary key,
  user_id uuid references public.users(id),
  agent_name text,
  obligation_id text,
  action text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Briefings
create table public.briefings (
  id text primary key,
  user_id uuid references public.users(id),
  briefing_type text,
  content jsonb,
  read_status boolean default false,
  generated_at timestamptz,
  created_at timestamptz default now()
);

-- Integrations
create table public.integrations (
  id text primary key,
  user_id uuid references public.users(id),
  provider text,
  provider_id text,
  access_token text,
  refresh_token text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3.2 Insert Demo User

```sql
insert into public.users (id, email, role)
values ('00000000-0000-0000-0000-000000000000', 'demo@optimus.ai', 'admin')
on conflict (id) do nothing;
```

### 3.3 Row Level Security

For the demo user pattern (no auth), ensure RLS is **disabled** or set to allow the anon key:

```sql
-- Disable RLS for demo (review before production launch with real auth)
alter table public.obligations disable row level security;
alter table public.risk_profiles disable row level security;
alter table public.interventions disable row level security;
alter table public.agent_memory disable row level security;
alter table public.agent_activity disable row level security;
alter table public.briefings disable row level security;
alter table public.integrations disable row level security;
```

---

## 4. Vercel Configuration

### 4.1 Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or connect via the [Vercel dashboard](https://vercel.com/new) → Import GitHub repository.

### 4.2 Framework Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### 4.3 Verify Deployment

After deployment:
1. Open `https://your-domain.vercel.app`
2. Click **▶ Start Demo** to launch the guided tour
3. Connect integrations via the dashboard header buttons
4. Click **Ask Chief** to test conversational intelligence

---

## 5. Demo Reset Instructions

### Via UI
1. Click **Reset Demo** in the top bar
2. Confirm in the modal
3. Dashboard refreshes automatically with fresh demo data

### Via API
```bash
curl -X POST https://your-domain.vercel.app/api/demo/reset \
  -H "Content-Type: application/json"
```

The reset seeds:
- 9 obligations (Gmail: 3, Classroom: 3, Calendar: 3)
- 5 risk profiles (2 Critical, 1 High Risk, 2 Monitor)
- 3 interventions (1 Deadline Alert, 1 Conflict, 1 Overload)
- 2 agent memory patterns
- 5 agent activity logs

---

## 6. System Health Check

Visit `https://your-domain.vercel.app` and check the **System Health** panel in the bottom-left of the dashboard.

| Service | Endpoint |
|---------|----------|
| Supabase | `/api/health/supabase` |
| Gemini | `/api/health/gemini` |

Both should return `{ "status": "ok" }`.

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| Gmail not connecting | Verify `GOOGLE_REDIRECT_URI` matches the exact redirect URI in Google Cloud Console |
| Classroom/Calendar not connecting | Add respective callback URIs to Google OAuth authorized redirects |
| Gemini returning errors | Check `GEMINI_API_KEY` is valid and Generative Language API is enabled |
| Demo data not loading | Ensure Supabase demo user exists and RLS is disabled |
| Build failing | Run `npm run lint` first; check for TypeScript errors |
| `PGRST205` table not found | Run the schema SQL from Section 3.1 in Supabase SQL Editor |

---

## 8. Production Checklist

```
[ ] All environment variables set in Vercel
[ ] Google OAuth redirect URIs updated for production domain
[ ] All Google APIs enabled in Cloud Console
[ ] Supabase schema tables created
[ ] Demo user inserted (UUID: 00000000-0000-0000-0000-000000000000)
[ ] RLS configured appropriately
[ ] System Health panel shows all services online
[ ] Demo Tour completes all 8 steps
[ ] Ask Chief responds to queries
[ ] Demo Reset restores state in < 2 seconds
[ ] All three integration sweeps run without errors
```
