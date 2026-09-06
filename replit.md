# Relcow

Relcow is an Android-first, offline reel-awareness tracker where users enter their own counts, earn XP, unlock milestones, and review their viewing rhythm without hidden monitoring.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/relcow` — Expo mobile MVP
- `native-android` — native Kotlin Android companion with the opt-in AccessibilityService
- `artifacts/relcow/app/index.tsx` — onboarding and the main counting experience
- `artifacts/relcow/context/AppProvider.tsx` — AsyncStorage-backed local profile, counts, XP, milestones, and preferences
- `artifacts/relcow/constants/colors.ts` — Relcow light and midnight theme tokens
- `attached_assets/Relcow_1788679708701.zip` — original product blueprint and Android starter reference

## Architecture decisions

- The first release is frontend-only and offline-first; AsyncStorage keeps the zero-login core usable without a backend.
- Counts are always explicitly entered by the user. Relcow does not monitor, scrape, or automate another app.
- XP is derived from total tracked reels, keeping progression deterministic and easy to validate before a future backend.
- The MVP uses one focused screen with an in-app settings sheet instead of adding navigation chrome around the primary action.
- Automatic ad counting lives in the native Android companion because Android AccessibilityService cannot run inside Expo Go.

## Product

- First-launch display name and optional daily awareness goal
- +1, +5, and +10 tracking with undo
- Daily, weekly, monthly, and all-time counts
- XP, levels, milestone progress, haptics, themes, reduced-motion preference, and reset controls
- Responsible break-awareness prompts at higher daily counts
- Native Android screen-awareness mode for likely sponsored/ad labels, with explicit permission and pause controls
- Full offline A–Z feature surface is documented in `docs/FEATURE_MATRIX.md`; cloud sync and online identity remain opt-in extension points.

## User preferences

 - Keep the product responsible: awareness and self-tracking, never engagement-maximizing automation.

## Gotchas

- Expo preview may log a missing `libglib-2.0.so.0` error while attempting to install React Native DevTools; Metro and Expo Go preview can still run normally.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
