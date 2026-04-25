# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 語言規範（最高優先）

所有輸出**一律使用繁體中文**，包含但不限於：

- 對使用者的回覆與說明
- 思考內容（thinking）
- 任務清單（TodoWrite 等）
- 分析、建議、規劃
- 程式碼註解
- Commit message 與 PR 說明

**嚴禁**使用簡體中文或其他語言。專有名詞、API 名稱、識別字、檔案路徑等技術用語可保留原文。此規則優先於預設的英文輸出習慣。

## 專案概述

此專案為「情侶共同基金」記帳網站：以 Supabase 為後端，兩位使用者各自登入後共享同一份基金資料、即時同步。每個基金可有多個月的獨立預算（同月份可累加多筆預算），並紀錄每筆收支。

## 技術堆疊

- **建置**：Vite + React 18 + TypeScript（path alias `@/*` → `src/*`）
- **UI**：Tailwind CSS + shadcn/ui 風格（元件直接寫在 `src/components/ui/`，依賴 Radix Primitives）
- **後端**：Supabase（Postgres + Auth + Realtime）
- **認證**：Email + Password；不開放公開註冊，使用者由 Supabase 後台手動建立

## 常用指令

```bash
npm install              # 安裝套件
npm run dev              # 啟動 dev server（預設 http://localhost:5173）
npm run build            # tsc -b && vite build；型別檢查 + 產出 dist/
npm run preview          # 預覽 build 結果
npm run lint             # ESLint
```

開發前必備：複製 `.env.example` 為 `.env`，填入 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY`。沒設定的話 `src/lib/supabase.ts` 會直接拋例外。

## Supabase 設定

1. 在 Supabase 建立新 Project，取得 URL 與 anon key 寫入 `.env`。
2. 進 Project → SQL Editor，貼入並執行 `supabase/migrations/0001_init.sql`（建立 `funds` / `budgets` / `transactions` 三張表、RLS policies、加入 Realtime publication）。
3. 進 Authentication → Users，手動為兩位使用者建立 Email + Password。
4. 任一使用者於 UI 新增基金後，會自動把自己加入 `funds.member_ids`。**另一位需在 SQL Editor 把自己的 `auth.users.id` 加入該基金的 `member_ids`** 才能看到資料：
   ```sql
   update public.funds
     set member_ids = array_append(member_ids, '<另一位的 UUID>'::uuid)
     where id = '<基金 UUID>';
   ```

## 資料模型

| Table | 用途 |
| --- | --- |
| `funds` | 基金本體；`member_ids uuid[]` 控制哪些 user 可存取 |
| `budgets` | 月度預算項；`(fund_id, year_month)` 可有多筆，當月總預算 = SUM(amount) |
| `transactions` | 收支紀錄；`type ∈ {income, expense}`、`created_by` 標示記帳者 |

RLS：三張表全部啟用，皆以 `auth.uid() = ANY(funds.member_ids)` 判定。`budgets` / `transactions` 的 INSERT 還會強制 `created_by = auth.uid()`，避免偽造記帳人。

## 程式碼架構

- `src/App.tsx`：依 `useSession` 結果切換 `Login` / `Dashboard`
- `src/lib/supabase.ts`：唯一 Supabase client 入口
- `src/lib/month.ts`：`'YYYY-MM'` 字串與 `Date` 互轉、月份位移、產生月份起訖日期範圍
- `src/hooks/`：三個資料 hook 全部採同一套模式 — `useEffect` 內做一次初始 query，再 subscribe 對應 table 的 `postgres_changes` event 並重新 load。狀態存在 React local state，**沒有引入 React Query**，請保持輕量。
- `src/components/Dashboard.tsx`：總控頁面，串起 `FundSwitcher` / `MonthSwitcher` / `SummaryCards` / `AddBudgetDialog` / `AddTransactionForm` / `TransactionList`
- `src/components/ui/`：shadcn/ui 元件本體（不要透過 `npx shadcn add` 安裝；都是直接維護的原始檔）

## 重要慣例

- **shadcn `Select` 的 `onValueChange` 直接收字串值**（不是 event），所有使用 Select 的元件必須沿用此 API。
- **金額計算**：DB 的 `amount` 是 `numeric(12,2)`，Supabase JS client 會回傳成字串或 number 視欄位定義；hooks 與顯示處統一用 `Number(t.amount)` 轉換，避免字串相加。
- **結餘公式**：`本月預算 + 本月收入 − 本月支出`（`SummaryCards.tsx`）。
- **Realtime 訂閱**必須記得在 `useEffect` cleanup 呼叫 `supabase.removeChannel(channel)`，否則 hot reload 會累積訂閱。
- **UI 文案維持繁體中文**，沿用既有用詞（基金、預算、收入、支出、結餘）。

## 分支慣例

開發分支：`claude/add-claude-documentation-pHl9Q`。預設分支：`main`。
