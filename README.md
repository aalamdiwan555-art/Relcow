# Relcow — Reel Counter 3D

Relcow is a zero-login, offline-first reel-awareness tracker. Users enter their own counts, earn XP, unlock milestones, and review their rhythm without Relcow monitoring another app.

## MVP

- First-launch display name and optional daily awareness goal
- One-tap +1, +5, and +10 reel tracking
- Undo for the latest count
- Local persistence with AsyncStorage
- Today, week, month, and all-time totals
- XP and level progression
- Milestone collection progress
- Responsible break-awareness prompts
- Dark/light appearance modes
- Haptics and reduced-motion preferences
- Reset profile and local data

## Run

This is an Expo app. Install dependencies with pnpm install, then run pnpm dev. Open the generated QR code in Expo Go or use the web preview.

## Product boundary

Relcow tracks counts entered by the user. It does not secretly monitor, scrape, or automate another app.
