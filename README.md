# OPTIMUS — AI Chief of Staff

> An autonomous intelligence system that discovers obligations, assesses risk, and delivers executive briefings — so you never miss what matters.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-blue)](https://ai.google.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://optimus-gray.vercel.app)

**Live Demo:** [https://optimus-gray.vercel.app](https://optimus-gray.vercel.app)

---

## What OPTIMUS Does

OPTIMUS acts as an AI Chief of Staff that:

- **Discovers** obligations autonomously from Gmail, Google Classroom, and Google Calendar
- **Assesses** operational risk on every commitment (0–100 risk score, critical/monitor/safe bands)
- **Generates** executive morning & evening briefings from real data
- **Recommends** focus, flags overloaded days, and identifies what can be postponed
- **Responds** conversationally via the Ask Chief intelligence layer (powered by Gemini)

---

## Intelligence Architecture

```
Gmail ──────────────┐
Google Classroom ───┤──► Discovery Agent ──► Obligation Pipeline
Google Calendar ────┘         │
                              ▼
                    Risk Engine + Memory Engine
                              │
                              ▼
                    Chief of Staff Engine
                    (Executive Briefings + Strategic Recommendations)
                              │
                              ▼
                    Ask Chief API  ◄──► Gemini 1.5 Flash
                    (Conversational Layer — /api/chief/ask)
```

No vector databases. No LangChain. No RAG pipelines.  
Single-source-of-truth: **Supabase PostgreSQL**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Framer Motion |
| Styling | Tailwind CSS v4, CSS custom properties |
| Backend | Next.js App Router, Server Actions |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Integrations | Gmail API, Google Classroom API, Google Calendar API |
| Deployment | Vercel |

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/p4bl0-26/Optimus.git
cd Optimus
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (Gmail, Classroom, Calendar)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/gmail/callback

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Vercel Deployment

### Required Environment Variables

Set these in your Vercel project dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI   (set to your production domain)
GEMINI_API_KEY
```

### Required Google OAuth Redirect URIs

In Google Cloud Console → APIs & Services → OAuth 2.0 Credentials, add:

```
https://your-domain.vercel.app/api/integrations/gmail/callback
https://your-domain.vercel.app/api/integrations/classroom/callback
https://your-domain.vercel.app/api/integrations/calendar/callback
```

### Required Google APIs (Enable in Cloud Console)

- Gmail API
- Google Classroom API
- Google Calendar API

---

## Features

### Ask Chief
Click **Ask Chief** in the top bar to open the conversational intelligence layer.  
Powered by Gemini 1.5 Flash with full operational context injected as the system prompt.

Quick commands:
- *What should I do first?*
- *What's my biggest risk?*
- *What can I postpone?*
- *Summarize tomorrow.*
- *Give me strategic recommendations.*

### Executive Briefings
Auto-generated morning and evening briefings synthesized from all active obligations, risk scores, interventions, and memory patterns.

### Risk Intelligence
Every obligation is scored 0–100. Risk bands: **Safe → Monitor → High Risk → Critical**.  
Factors: deadline proximity, workload density, conflict detection, historical patterns.

### Integration Discovery
Connect Gmail, Google Classroom, and Google Calendar. OPTIMUS autonomously scans and converts events, assignments, and emails into tracked obligations.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chief/ask/          # Ask Chief API route (Gemini-backed)
│   │   └── integrations/       # OAuth callback routes
│   ├── (pages)/                # Dashboard, Obligations, Briefings, Intelligence, Settings
│   └── actions/                # Server Actions (optimus.ts)
├── components/
│   ├── intelligence/           # AskChiefDrawer
│   ├── dashboard/              # Dashboard widgets
│   └── layout/                 # TopBar, Sidebar, PageContainer
├── lib/
│   ├── intelligence/           # chiefOfStaffEngine, riskEngine, memoryEngine, etc.
│   ├── repositories/           # Supabase repository pattern
│   └── integrations/           # Discovery agent, OAuth handlers
└── types/                      # TypeScript types (database.ts, index.ts)
```

---

## License

MIT — built for the Vibe2Ship Hackathon 2026.
