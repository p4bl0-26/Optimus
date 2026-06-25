-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. users
create table if not exists public.users (
    id uuid primary key default uuid_generate_v4(),
    email text,
    role text default 'user',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. obligations
create table if not exists public.obligations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    source text not null default 'manual',
    source_id text,
    title text not null,
    description text,
    status text not null default 'pending',
    type text not null default 'assignment',
    priority text not null default 'medium',
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. risk_profiles
create table if not exists public.risk_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    obligation_id uuid references public.obligations(id) on delete cascade not null unique,
    risk_score numeric not null default 0,
    risk_band text not null default 'low',
    reasoning text,
    recommended_focus text,
    missing_work text,
    future_outcomes jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. interventions
create table if not exists public.interventions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    obligation_id uuid references public.obligations(id) on delete cascade not null,
    type text not null,
    severity text not null,
    message text not null,
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. agent_memory
create table if not exists public.agent_memory (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    agent_name text not null,
    memory_type text not null,
    content jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. agent_activity
create table if not exists public.agent_activity (
    id uuid primary key default uuid_generate_v4(),
    agent_name text not null,
    user_id uuid references public.users(id) on delete cascade not null,
    obligation_id uuid references public.obligations(id) on delete cascade,
    action text not null,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. briefings
create table if not exists public.briefings (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    briefing_type text not null,
    content jsonb,
    read_status boolean default false not null,
    generated_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. accountability_partners
create table if not exists public.accountability_partners (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    name text not null,
    email text,
    phone text,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. integrations
create table if not exists public.integrations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade not null,
    provider text not null,
    access_token text,
    refresh_token text,
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: For Demo MVP, we will enable RLS but create open policies for demo tenant usage 
-- (Assuming we pass a fixed demo user_id or handle it in app logic)
alter table public.users enable row level security;
alter table public.obligations enable row level security;
alter table public.risk_profiles enable row level security;
alter table public.interventions enable row level security;
alter table public.agent_memory enable row level security;
alter table public.agent_activity enable row level security;
alter table public.briefings enable row level security;
alter table public.accountability_partners enable row level security;
alter table public.integrations enable row level security;

-- Create completely open policies for MVP Hackathon Phase to allow Demo Mode
create policy "Allow public read/write for MVP Demo" on public.users for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.obligations for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.risk_profiles for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.interventions for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.agent_memory for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.agent_activity for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.briefings for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.accountability_partners for all using (true) with check (true);
create policy "Allow public read/write for MVP Demo" on public.integrations for all using (true) with check (true);
