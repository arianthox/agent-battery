You are working in /home/ariantho/Workspace/agent-battery.
Fix remaining TypeScript typecheck errors so all of these pass:
- pnpm lint
- pnpm typecheck
- DATABASE_URL="file:./packages/db/dev.sqlite" pnpm test

Known errors are implicit any in:
- apps/desktop/electron/ipc/handlers.ts
- apps/desktop/electron/services/syncService.ts

Requirements:
- Keep changes minimal and targeted.
- Preserve existing architecture.
- Run the three commands above and verify success.
- Print a short summary of files changed and command results.
