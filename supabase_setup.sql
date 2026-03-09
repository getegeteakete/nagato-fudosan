-- ============================
-- 長門不動産 Supabase セットアップSQL
-- Supabase Dashboard > SQL Editor に貼り付けて実行
-- ============================

-- 1. 記事テーブル
create table if not exists site_articles (
  id          text primary key,
  title       text not null,
  body        text not null,
  article_type text not null,
  property_ids text[] default '{}',
  published_at timestamptz not null default now(),
  status      text not null default 'draft',
  created_at  timestamptz default now()
);

-- RLS（Row Level Security）有効化
alter table site_articles enable row level security;

-- 公開記事は誰でも読める
create policy "公開記事は誰でも読める" on site_articles
  for select using (status = 'published');

-- 管理者のみ書き込み（anon keyでも書けるようservice_roleを使う場合はこちら）
create policy "全員が書き込み可" on site_articles
  for all using (true);

-- 2. 退去申請テーブル
create table if not exists moveout_requests (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  room        text,
  move_date   text,
  reason      text,
  message     text,
  status      text default 'new',
  created_at  timestamptz default now()
);

alter table moveout_requests enable row level security;
create policy "全員が書き込み可" on moveout_requests for all using (true);

-- 3. 査定依頼テーブル
create table if not exists valuation_requests (
  id            text primary key default gen_random_uuid()::text,
  name          text not null,
  email         text,
  phone         text,
  property_type text,
  address       text,
  area          numeric,
  message       text,
  status        text default 'new',
  created_at    timestamptz default now()
);

alter table valuation_requests enable row level security;
create policy "全員が書き込み可" on valuation_requests for all using (true);

-- 4. お問い合わせテーブル
create table if not exists contacts (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  email      text,
  phone      text,
  subject    text,
  message    text not null,
  status     text default 'new',
  created_at timestamptz default now()
);

alter table contacts enable row level security;
create policy "全員が書き込み可" on contacts for all using (true);

