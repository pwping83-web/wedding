-- Supabase SQL Editor에서 실행하세요.
create table if not exists public.cue_sheet_drafts (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  groom_name text not null,
  bride_name text not null,
  app_data jsonb not null,
  unique (groom_name, bride_name)
);

create index if not exists cue_sheet_drafts_updated_at_idx
  on public.cue_sheet_drafts (updated_at desc);

alter table public.cue_sheet_drafts enable row level security;

-- QCT 전화번호·마지막 화면 (선택 — 없어도 app_data.cueSavePhone 으로 동작)
alter table public.cue_sheet_drafts
  add column if not exists save_phone text;
alter table public.cue_sheet_drafts
  add column if not exists flow_screen text not null default 'basic';

create unique index if not exists cue_sheet_drafts_save_phone_key
  on public.cue_sheet_drafts (save_phone)
  where save_phone is not null and save_phone <> '';

-- 기존 전송 기록에도 식순 JSON 저장 (선택)
alter table public.cue_sheet_deliveries
  add column if not exists app_data jsonb;
