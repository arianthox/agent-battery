# Security Overview

## Credential handling

- Credentials are never stored in SQLite, localStorage, or plaintext config files.
- The only credential write/read path is `apps/desktop/electron/services/credentialService.ts`.
- `credentialService` uses the OS secret vault through `keytar`:
  - macOS: Keychain
  - Windows: Credential Locker
  - Linux: Secret Service/libsecret
- Database records store only `credentialRef` metadata.

## Redaction policy

- Structured logger in `apps/desktop/electron/services/logger.ts` redacts:
  - keys matching `authorization`, `token`, `apiKey`, `secret`, `cookie`, `session`
  - values matching common API key and bearer token patterns
- Debug mode does not bypass redaction.
- Error payloads are sanitized before logging and persisted as minimal error metadata.

## Data persistence rules

- Persisted usage data is normalized into local models (`UsageSnapshot`, `SyncRun`).
- Raw provider responses are not persisted, preventing accidental secret leakage.
- Sync history retains outcome/error metadata without request headers/cookies/tokens.

## Threat model

### In scope

- Local attacker reading app database files
- Accidental secret leakage via logs
- Sync retries causing noisy alerts/spam
- Invalid credentials triggering repeated network calls

### Controls

- OS vault-backed credentials
- Strict IPC boundary with preload bridge and runtime zod validation
- Per-account validation status metadata and backoff policy
- Notification debounce state to suppress repeated alerts

## Known limitations

- Provider integrations currently include guarded placeholder calls for official usage endpoints and manual fallback mode.
- A sufficiently privileged local attacker with access to unlocked user session may access OS vault contents.
- No remote attestation is implemented; this is a local-first desktop architecture.

## Reporting

Open a private security report through your standard repository disclosure channel and include:

- affected version/commit
- reproduction steps
- expected vs observed behavior
- logs with secrets removed
