-- QCT(큐시트) — 전화번호로 저장·불러오기
create table if not exists public.cue_sheet_qct_saves (
  save_phone text primary key,
  updated_at timestamptz not null default now(),
  flow_screen text not null default 'basic',
  app_data jsonb not null
);

create index if not exists cue_sheet_qct_saves_updated_at_idx
  on public.cue_sheet_qct_saves (updated_at desc);

alter table public.cue_sheet_qct_saves enable row level security;
