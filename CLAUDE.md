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

## Repository Contents

This repo contains a single source file, `1.html`. Despite the `.html` extension, the file is **JSX/React source**, not HTML — it exports a default React component (`BudgetTracker`) and imports from `react` and `@/components/ui/*` (shadcn/ui aliases).

There is no `package.json`, build config, test suite, lint config, README, or other tooling in the repository. No commands are wired up; running build/test/lint commands will fail because no project scaffolding exists.

## The Component

`1.html` implements a Chinese-language personal budget tracker (記帳小幫手):

- Local component state via `useState` — `entries` (list) and `form` (current input).
- `addEntry` validates that `date`, `name`, and `amount` are non-empty, parses `amount` as float, appends to `entries`, and resets the form.
- Totals (`totalIncome`, `totalExpense`) are derived inline on each render by filtering and reducing `entries` by `type` (`"income"` | `"expense"`).
- UI is composed from shadcn/ui primitives (`Card`, `Button`, `Input`, `Select`) and styled with Tailwind utility classes.
- No persistence — state is lost on reload.

## Working in This Repo

- The file is a snippet, not a runnable project. To execute it, it must be dropped into a host project that already provides React, Tailwind, and shadcn/ui with the `@/components/ui/*` path alias configured. Don't try to "run" `1.html` standalone.
- If asked to modify the component, edit `1.html` directly. The `.html` extension is misleading but is the file's actual name — don't rename it unless the user asks.
- The component assumes the shadcn/ui `Select` API where `onValueChange` returns the selected string value directly (not an event). Preserve this when editing.
- UI strings are Traditional Chinese. Keep new user-facing text consistent with the existing language unless the user requests otherwise.

## Branch Convention

Development for this task happens on `claude/add-claude-documentation-pHl9Q`. The default branch is `main`.
