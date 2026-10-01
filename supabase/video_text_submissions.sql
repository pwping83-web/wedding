-- 식전영상 글귀 저장 (Supabase SQL Editor에서 실행)

create table if not exists public.video_text_submissions (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null,
  groom_name text not null default '',
  bride_name text not null default '',
  text_payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists video_text_submissions_created_at_idx
  on public.video_text_submissions (created_at desc);

alter table public.video_text_submissions enable row level security;

-- 클라이언트 직접 insert 없음 (API service role만)
