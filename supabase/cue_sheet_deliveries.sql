-- Supabase SQL Editor에서 실행하세요.
create table if not exists public.cue_sheet_deliveries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  subject text not null,
  groom_name text not null default '',
  bride_name text not null default '',
  wedding_date text not null default '',
  wedding_time text not null default '',
  venue text not null default '',
  mc_email text not null,
  print_html text not null
);

create index if not exists cue_sheet_deliveries_created_at_idx
  on public.cue_sheet_deliveries (created_at desc);

alter table public.cue_sheet_deliveries enable row level security;
