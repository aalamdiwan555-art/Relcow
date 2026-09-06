# Relcow feature matrix

Relcow is intentionally offline-first. The Expo client exposes the product
surface for preview and local use; the native Android companion adds the
explicit accessibility permission required for screen-awareness mode.

## A–Z catalogue

| Key | Feature | Current implementation |
| --- | --- | --- |
| A | Achievements | Local achievement unlocks based on counts, goals, and streaks |
| B | Break reminders | Local reminder settings with quiet hours |
| C | Challenges | Local commitments, join codes, and shareable challenge text |
| D | Daily dashboard | Counter, goal progress, responsible-use prompt |
| E | Experience / XP | XP derived locally from counts and streaks |
| F | Friends | Local invitations, privacy controls, block/report hooks |
| G | Goals | Optional daily goal plus custom milestones |
| H | History | Local daily history |
| I | Insights | Today, week, month, year, streak, and weekly summary |
| J | Journey map | Level checkpoints and progression panel |
| K | Key milestones | Default and custom milestone thresholds |
| L | Levels | 50+ level-compatible XP progression |
| M | Milestone alerts | In-app next-unlock messaging |
| N | Notifications | Native Android reminder receiver; Expo keeps notification preferences local |
| O | Offline mode | AsyncStorage local state and an offline change queue counter |
| P | Profile without login | Name-only onboarding and local profile controls |
| Q | Quick count | +1, +5, +10, and undo |
| R | Referral-ready system | Locally generated referral code, no cash/reward promises |
| S | Statistics | Daily, weekly, monthly, yearly, and all-time views |
| T | Themes | Midnight and daylight themes |
| U | Undo | Last-action undo |
| V | Virtual 3D room | Collection-room surface with reduced-motion-safe collectible cards |
| W | Weekly reports | Local weekly summary |
| X | XP multiplier events | Remote-config-ready flag, off by default |
| Y | Yearly history | Rolling 365-day count |
| Z | Zero-login onboarding | No account, password, or sign-in |

## Additional product controls

- Data export, JSON backup/restore, and destructive reset
- Local midnight date keys and ISO timestamps for events
- Custom milestone entry
- Quiet hours, haptics, sound preference, and reduced motion
- Ad integration seam disabled by default
- Optional cloud sync now has a validated API push/pull path with action-ID merge and per-device rate limiting
- Opt-in leaderboard, challenge, referral, moderation-report, reward-catalogue, and remote-config API endpoints
- Admin reward catalogue and content moderation hooks are server-owned and kept separate from local counting

## Native-only boundary

Automatic ad-label detection is implemented in `native-android` through an
explicit Android `AccessibilityService`. Expo Go cannot run that service.
Detection reads visible accessibility labels only and does not capture
screenshots, keystrokes, passwords, private messages, or arbitrary recordings.
