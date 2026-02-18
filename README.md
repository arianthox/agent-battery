# Agent Battery

[![CI](https://github.com/arianthox/agent-battery/actions/workflows/ci.yml/badge.svg)](https://github.com/arianthox/agent-battery/actions/workflows/ci.yml)

Agent Battery is a cross-platform Electron desktop app for tracking AI account usage across OpenAI/ChatGPT, Claude, and Cursor in one local-first dashboard.

## Tech stack

- Electron + React + TypeScript
- Vite renderer pipeline
- SQLite + Prisma
- React Query + Zustand
- Zod contracts
- OS secret vault via keytar

## Repository layout

- `apps/desktop/electron`: main process, preload bridge, typed IPC, adapters, services
- `apps/desktop/renderer/src`: dashboard, accounts, settings views and hooks
- `packages/shared`: normalized domain models + zod schemas + IPC contracts
- `packages/db`: Prisma schema, migrations, and DB client
- `tests`: unit, IPC, migration asset, adapter, and renderer tests

## Prerequisites

- Node.js 20+
- pnpm 9+
- Native build dependencies for `keytar` on your OS (for Linux, `libsecret-1-dev`)

## Setup

```bash
cd agent-battery
cp packages/db/.env.example packages/db/.env
pnpm install
pnpm db:generate
DATABASE_URL="file:./packages/db/dev.sqlite" pnpm db:migrate
```

## Run in development

```bash
cd agent-battery
DATABASE_URL="file:./packages/db/dev.sqlite" pnpm dev
```

## Quality checks

```bash
cd agent-battery
pnpm lint
pnpm typecheck
DATABASE_URL="file:./packages/db/dev.sqlite" pnpm test
```

## Build desktop app

```bash
cd agent-battery
pnpm --filter @agent-battery/desktop build
```

## Provider integration limitations

- Current adapters are production-safe scaffolds with strict typing and fallback semantics.
- Official provider usage endpoints vary by plan/account and can require custom auth/session flows.
- When official usage endpoints are unavailable, the app supports manual mode and marks confidence as `manual`.
- Placeholder official API fetch logic is present and intentionally constrained to avoid unsafe scraping/session leakage.

## Security principles

- Secrets never enter SQLite, renderer storage, or config files.
- Credentials are stored and read only through `keytar` from the Electron main process.
- Logs are structured and redacted for token/key/cookie/Authorization patterns.
- Raw provider payload persistence is intentionally avoided.
