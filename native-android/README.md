# Relcow native Android build

This folder is the native Android companion for the Expo MVP in `artifacts/relcow`.
It exists because Android `AccessibilityService` support cannot run inside Expo Go.

## Screen-awareness boundary

Screen awareness is opt-in. Android shows the user the system accessibility permission
screen before the service can run. Relcow reads visible accessibility labels and text
only to identify likely sponsored or advertisement screens. It does not capture
screenshots, keystrokes, passwords, private messages, or arbitrary screen recordings.

The service is paused from the app at any time, and manual counting remains available.

## Features

- Zero-login onboarding
- Manual +1, +5, +10 count and undo
- Auto-ad detection through an explicit accessibility permission
- Daily, weekly, monthly, and all-time stats
- XP, levels, milestones, and local collectible progress
- Local challenge/share code foundation
- Dark/light theme, haptics, reduced motion, and reset controls

The Android SDK and Gradle toolchain are not available in the current Replit
container, so this native source is checked in for Android Studio or CI builds.