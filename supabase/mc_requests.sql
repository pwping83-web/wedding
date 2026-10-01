-- MC 상담 신청 (Supabase SQL Editor에서 실행)

create table if not exists public.mc_requests (
  id uuid primary key default gen_random_uuid(),
  groom_name text not null,
  bride_name text not null,
  ceremony_date date,
  ceremony_time text,
  venue text not null default '',
  phone text not null,
  email text not null,
  message text not null default '',
  wants_prewedding_video boolean not null default false,
  privacy_agreed boolean not null default false,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists mc_requests_created_at_idx
  on public.mc_requests (created_at desc);

alter table public.mc_requests enable row level security;

drop policy if exists "mc_requests_anon_insert" on public.mc_requests;

-- 익명: 개인정보 동의한 insert만
create policy "mc_requests_anon_insert"
  on public.mc_requests
  for insert
  to anon
  with check (privacy_agreed = true);

-- anon/authenticated select·update·delete 없음 (관리자는 service role API)
