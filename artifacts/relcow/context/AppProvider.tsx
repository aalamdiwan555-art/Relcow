import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import colors from '@/constants/colors';

export type ThemeMode = 'light' | 'dark';

export type Profile = {
  name: string;
  dailyGoal: number | null;
  createdAt: string;
  avatarId?: string;
};

type DailyEntry = {
  count: number;
};

type CountAction = {
  id: string;
  date: string;
  amount: number;
  timestamp: string;
  source: 'manual' | 'auto';
};

export type Friend = {
  id: string;
  name: string;
  code: string;
  status: 'invited' | 'connected' | 'blocked';
};

export type Challenge = {
  id: string;
  title: string;
  target: number;
  startDate: string;
  endDate: string;
  participants: string[];
  status: 'draft' | 'active' | 'complete';
};

export type ReminderSettings = {
  enabled: boolean;
  quietStart: string;
  quietEnd: string;
  cadence: 'daily' | 'weekly';
};

export type RelcowState = {
  profile: Profile | null;
  entries: Record<string, DailyEntry>;
  actionHistory: CountAction[];
  theme: ThemeMode;
  haptics: boolean;
  sound: boolean;
  reducedMotion: boolean;
  customMilestones: number[];
  friends: Friend[];
  challenges: Challenge[];
  reminders: ReminderSettings;
  sync: {
    enabled: boolean;
    pendingChanges: number;
    lastSyncedAt: string | null;
  };
  referralCode: string;
  featureFlags: {
    adsEnabled: boolean;
    multipliersEnabled: boolean;
  };
};

const STORAGE_KEY = '@relcow/state/v1';
const MILESTONES = [10, 25, 50, 100, 150, 200, 300, 500];
const DEFAULT_STATE: RelcowState = {
  profile: null,
  entries: {},
  actionHistory: [],
  theme: 'dark',
  haptics: true,
  sound: false,
  reducedMotion: false,
  customMilestones: [],
  friends: [],
  challenges: [],
  reminders: {
    enabled: false,
    quietStart: '21:00',
    quietEnd: '08:00',
    cadence: 'daily',
  },
  sync: {
    enabled: false,
    pendingChanges: 0,
    lastSyncedAt: null,
  },
  referralCode: '',
  featureFlags: {
    adsEnabled: false,
    multipliersEnabled: false,
  },
};

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return getDateKey(date);
};

type AppContextValue = {
  state: RelcowState;
  profile: Profile | null;
  isHydrated: boolean;
  palette: typeof colors.dark;
  totalCount: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  yearCount: number;
  totalXp: number;
  level: number;
  levelProgress: number;
  streak: number;
  achievements: string[];
  dailyGoalProgress: number;
  nextMilestone: number | null;
  unlockedMilestones: number[];
  saveProfile: (name: string, dailyGoal: number | null) => void;
  recordCount: (amount: number) => void;
  undoLast: () => void;
  toggleTheme: () => void;
  setHaptics: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setReminders: (settings: Partial<ReminderSettings>) => void;
  addCustomMilestone: (value: number) => void;
  addFriend: (name: string, code: string) => void;
  blockFriend: (id: string) => void;
  createChallenge: (title: string, target: number, days: number) => void;
  joinChallenge: (code: string) => void;
  setSyncEnabled: (enabled: boolean) => void;
  exportData: () => string;
  restoreData: (payload: string) => boolean;
  resetProfile: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<RelcowState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as Partial<RelcowState>;
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          entries: parsed.entries ?? {},
          actionHistory: parsed.actionHistory ?? [],
          customMilestones: parsed.customMilestones ?? [],
          friends: parsed.friends ?? [],
          challenges: parsed.challenges ?? [],
          referralCode:
            parsed.referralCode ??
            (parsed.profile
              ? `REL-${parsed.profile.name.slice(0, 2).toUpperCase().padEnd(2, 'R')}-0000`
              : ''),
          reminders: { ...DEFAULT_STATE.reminders, ...(parsed.reminders ?? {}) },
          sync: { ...DEFAULT_STATE.sync, ...(parsed.sync ?? {}) },
          featureFlags: { ...DEFAULT_STATE.featureFlags, ...(parsed.featureFlags ?? {}) },
        });
      })
      .catch(() => {
        setState(DEFAULT_STATE);
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [isHydrated, state]);

  const derived = useMemo(() => {
    const entries = Object.entries(state.entries);
    const totalCount = entries.reduce((sum, [, entry]) => sum + entry.count, 0);
    const todayCount = state.entries[getDateKey()]?.count ?? 0;
    const weekCount = entries
      .filter(([date]) => date >= getDaysAgo(6))
      .reduce((sum, [, entry]) => sum + entry.count, 0);
    const monthCount = entries
      .filter(([date]) => date >= getDaysAgo(29))
      .reduce((sum, [, entry]) => sum + entry.count, 0);
    const yearCount = entries
      .filter(([date]) => date >= getDaysAgo(364))
      .reduce((sum, [, entry]) => sum + entry.count, 0);
    const activeDates = entries
      .filter(([, entry]) => entry.count > 0)
      .map(([date]) => date)
      .sort()
      .reverse();
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (const date of activeDates) {
      const expected = getDateKey(cursor);
      const previous = getDateKey(new Date(cursor.getTime() - 86400000));
      if (date === expected || (streak === 0 && date === previous)) {
        streak += 1;
        cursor = new Date(cursor.getTime() - 86400000);
      } else if (date < expected) {
        break;
      }
    }
    const totalXp = totalCount * 10 + Math.floor(streak / 3) * 5;
    const level = Math.max(1, Math.floor(totalXp / 100) + 1);
    const levelProgress = (totalXp % 100) / 100;
    const milestones = [...MILESTONES, ...state.customMilestones]
      .filter((milestone, index, values) => values.indexOf(milestone) === index)
      .sort((a, b) => a - b);
    const unlockedMilestones = milestones.filter((milestone) => totalCount >= milestone);
    const nextMilestone =
      milestones.find((milestone) => totalCount < milestone) ?? null;
    const achievements = [
      totalCount >= 1 ? 'First notice' : null,
      totalCount >= 10 ? 'Double digits' : null,
      totalCount >= 50 ? 'Pattern spotter' : null,
      totalCount >= 100 ? 'Century of awareness' : null,
      streak >= 3 ? 'Three-day rhythm' : null,
      streak >= 7 ? 'Week in view' : null,
      state.profile?.dailyGoal && todayCount >= state.profile.dailyGoal
        ? 'Goal complete'
        : null,
    ].filter((item): item is string => Boolean(item));
    return {
      totalCount,
      todayCount,
      weekCount,
      monthCount,
      yearCount,
      totalXp,
      level,
      levelProgress,
      streak,
      achievements,
      dailyGoalProgress: state.profile?.dailyGoal
        ? Math.min(1, todayCount / state.profile.dailyGoal)
        : 0,
      nextMilestone,
      unlockedMilestones,
    };
  }, [state.entries, state.customMilestones, state.profile]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      profile: state.profile,
      isHydrated,
      palette: colors[state.theme],
      ...derived,
      saveProfile: (name, dailyGoal) => {
        setState((current) => ({
          ...current,
          profile: {
            name: name.trim(),
            dailyGoal,
            createdAt: current.profile?.createdAt ?? new Date().toISOString(),
          },
          referralCode:
            current.referralCode ||
            `REL-${name.trim().slice(0, 2).toUpperCase().padEnd(2, 'R')}-${Math.floor(
              1000 + Math.random() * 9000,
            )}`,
        }));
      },
      recordCount: (amount) => {
        setState((current) => {
          const date = getDateKey();
          const currentEntry = current.entries[date]?.count ?? 0;
          const action = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            date,
            amount,
            timestamp: new Date().toISOString(),
            source: 'manual' as const,
          };
          return {
            ...current,
            entries: {
              ...current.entries,
              [date]: { count: currentEntry + amount },
            },
            actionHistory: [action, ...current.actionHistory].slice(0, 30),
            sync: current.sync.enabled
              ? { ...current.sync, pendingChanges: current.sync.pendingChanges + 1 }
              : current.sync,
          };
        });
        if (state.haptics) {
          Haptics.impactAsync(
            amount === 1
              ? Haptics.ImpactFeedbackStyle.Light
              : Haptics.ImpactFeedbackStyle.Medium,
          ).catch(() => undefined);
        }
      },
      undoLast: () => {
        setState((current) => {
          const [lastAction, ...remaining] = current.actionHistory;
          if (!lastAction) return current;
          const currentEntry = current.entries[lastAction.date]?.count ?? 0;
          const nextCount = Math.max(0, currentEntry - lastAction.amount);
          const nextEntries = { ...current.entries };
          if (nextCount === 0) {
            delete nextEntries[lastAction.date];
          } else {
            nextEntries[lastAction.date] = { count: nextCount };
          }
          return {
            ...current,
            entries: nextEntries,
            actionHistory: remaining,
          };
        });
        if (state.haptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
            () => undefined,
          );
        }
      },
      toggleTheme: () => {
        setState((current) => ({
          ...current,
          theme: current.theme === 'dark' ? 'light' : 'dark',
        }));
      },
      setHaptics: (enabled) => {
        setState((current) => ({ ...current, haptics: enabled }));
      },
      setSound: (enabled) => {
        setState((current) => ({ ...current, sound: enabled }));
      },
      setReducedMotion: (enabled) => {
        setState((current) => ({ ...current, reducedMotion: enabled }));
      },
      setReminders: (settings) => {
        setState((current) => ({
          ...current,
          reminders: { ...current.reminders, ...settings },
        }));
      },
      addCustomMilestone: (value) => {
        if (!Number.isFinite(value) || value <= 0) return;
        setState((current) => ({
          ...current,
          customMilestones: [...new Set([...current.customMilestones, Math.floor(value)])].sort(
            (a, b) => a - b,
          ),
        }));
      },
      addFriend: (name, code) => {
        setState((current) => ({
          ...current,
          friends: [
            ...current.friends,
            {
              id: `${Date.now()}`,
              name: name.trim() || 'Friend',
              code: code.trim().toUpperCase(),
              status: 'invited',
            },
          ],
        }));
      },
      blockFriend: (id) => {
        setState((current) => ({
          ...current,
          friends: current.friends.map((friend) =>
            friend.id === id ? { ...friend, status: 'blocked' } : friend,
          ),
        }));
      },
      createChallenge: (title, target, days) => {
        const start = new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + Math.max(1, days));
        setState((current) => ({
          ...current,
          challenges: [
            ...current.challenges,
            {
              id: `${Date.now()}`,
              title: title.trim() || 'Awareness challenge',
              target: Math.max(1, Math.floor(target)),
              startDate: start.toISOString(),
              endDate: end.toISOString(),
              participants: ['You'],
              status: 'active',
            },
          ],
        }));
      },
      joinChallenge: (code) => {
        if (!code.trim()) return;
        setState((current) => ({
          ...current,
          challenges: [
            ...current.challenges,
            {
              id: `joined-${Date.now()}`,
              title: `Joined challenge ${code.trim().toUpperCase()}`,
              target: 50,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
              participants: ['You', 'Challenge host'],
              status: 'active',
            },
          ],
        }));
      },
      setSyncEnabled: (enabled) => {
        setState((current) => ({
          ...current,
          sync: { ...current.sync, enabled },
        }));
      },
      exportData: () => JSON.stringify(state, null, 2),
      restoreData: (payload) => {
        try {
          const parsed = JSON.parse(payload) as Partial<RelcowState>;
          if (!parsed || typeof parsed !== 'object') return false;
          setState({
            ...DEFAULT_STATE,
            ...parsed,
            entries: parsed.entries ?? {},
            actionHistory: parsed.actionHistory ?? [],
            customMilestones: parsed.customMilestones ?? [],
            friends: parsed.friends ?? [],
            challenges: parsed.challenges ?? [],
            reminders: { ...DEFAULT_STATE.reminders, ...(parsed.reminders ?? {}) },
            sync: { ...DEFAULT_STATE.sync, ...(parsed.sync ?? {}) },
            featureFlags: { ...DEFAULT_STATE.featureFlags, ...(parsed.featureFlags ?? {}) },
          });
          return true;
        } catch {
          return false;
        }
      },
      resetProfile: () => {
        setState(DEFAULT_STATE);
      },
    }),
    [derived, isHydrated, state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}

export function getDisplayDate() {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
}