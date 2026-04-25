-- 情侶共同基金：初始化 schema 與 Row Level Security
-- 在 Supabase Project → SQL Editor 執行此檔。

-- =========================================================
-- 資料表
-- =========================================================

-- 基金本體：member_ids 紀錄哪些 auth.users.id 可存取此基金
create table if not exists public.funds (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  member_ids  uuid[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- 月度預算項：同一個 fund + year_month 可有多筆，總額為 SUM(amount)
create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  fund_id     uuid not null references public.funds(id) on delete cascade,
  year_month  text not null check (year_month ~ '^[0-9]{4}-[0-9]{2}$'),
  amount      numeric(12,2) not null,
  note        text,
  created_by  uuid not null references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists budgets_fund_month_idx
  on public.budgets (fund_id, year_month);

-- 交易：收入或支出
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  fund_id     uuid not null references public.funds(id) on delete cascade,
  date        date not null,
  name        text not null,
  amount      numeric(12,2) not null,
  type        text not null check (type in ('income','expense')),
  note        text,
  created_by  uuid not null references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists transactions_fund_date_idx
  on public.transactions (fund_id, date);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table public.funds        enable row level security;
alter table public.budgets      enable row level security;
alter table public.transactions enable row level security;

-- funds：使用者必須是該基金的成員才能存取
drop policy if exists funds_select on public.funds;
create policy funds_select on public.funds
  for select using (auth.uid() = any (member_ids));

drop policy if exists funds_insert on public.funds;
create policy funds_insert on public.funds
  for insert with check (auth.uid() = any (member_ids));

drop policy if exists funds_update on public.funds;
create policy funds_update on public.funds
  for update using (auth.uid() = any (member_ids))
  with check (auth.uid() = any (member_ids));

drop policy if exists funds_delete on public.funds;
create policy funds_delete on public.funds
  for delete using (auth.uid() = any (member_ids));

-- budgets / transactions：透過 fund 的 member_ids 判斷
drop policy if exists budgets_all on public.budgets;
create policy budgets_all on public.budgets
  for all
  using (
    exists (
      select 1 from public.funds f
      where f.id = budgets.fund_id and auth.uid() = any (f.member_ids)
    )
  )
  with check (
    exists (
      select 1 from public.funds f
      where f.id = budgets.fund_id and auth.uid() = any (f.member_ids)
    )
    and created_by = auth.uid()
  );

drop policy if exists transactions_all on public.transactions;
create policy transactions_all on public.transactions
  for all
  using (
    exists (
      select 1 from public.funds f
      where f.id = transactions.fund_id and auth.uid() = any (f.member_ids)
    )
  )
  with check (
    exists (
      select 1 from public.funds f
      where f.id = transactions.fund_id and auth.uid() = any (f.member_ids)
    )
    and created_by = auth.uid()
  );

-- =========================================================
-- Realtime（Supabase Realtime 預設會發布 public schema 變更，
-- 這裡明確加入以保險）
-- =========================================================
alter publication supabase_realtime add table public.funds;
alter publication supabase_realtime add table public.budgets;
alter publication supabase_realtime add table public.transactions;
