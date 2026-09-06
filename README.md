# Relcow — Reel Counter 3D

Relcow is a zero-login reel-awareness tracker. The repository contains two clients:

- `artifacts/relcow` — Expo MVP for rapid UI iteration and Expo Go previews.
- `native-android` — Kotlin Android app for the real opt-in AccessibilityService screen-awareness feature.

## MVP capabilities

- Manual +1, +5, +10 tracking and undo
- Optional Android screen awareness for likely sponsored/ad labels
- Local-only storage, daily/weekly/monthly/all-time stats, XP, levels, and milestones
- Local collection progress and shareable challenge code foundation
- Dark/light theme, haptics, reduced motion, privacy disclosure, and reset controls

## Screen-awareness boundary

Screen awareness is never silent. The user must enable Android accessibility permission, can pause it from the app, and can turn it off in Android Settings. Relcow reads visible accessibility labels only to identify likely sponsored or advertisement screens. It does not capture screenshots, keystrokes, passwords, private messages, or arbitrary screen recordings.

## Running

The Expo client can be opened with Expo Go or the Replit preview. The native client is intended for Android Studio or CI because an Android SDK/Gradle toolchain is not available in the current Replit container.
