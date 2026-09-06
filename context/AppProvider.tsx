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
};

type DailyEntry = {
  count: number;
};

type CountAction = {
  id: string;
  date: string;
  amount: number;
};

export type RelcowState = {
  profile: Profile | null;
  entries: Record<string, DailyEntry>;
  actionHistory: CountAction[];
  theme: ThemeMode;
  haptics: boolean;
  reducedMotion: boolean;
};

const STORAGE_KEY = '@relcow/state/v1';
const MILESTONES = [10, 25, 50, 100, 150, 200, 300, 500];
const DEFAULT_STATE: RelcowState = {
  profile: null,
  entries: {},
  actionHistory: [],
  theme: 'dark',
  haptics: true,
  reducedMotion: false,
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
  totalXp: number;
  level: number;
  levelProgress: number;
  nextMilestone: number | null;
  unlockedMilestones: number[];
  saveProfile: (name: string, dailyGoal: number | null) => void;
  recordCount: (amount: number) => void;
  undoLast: () => void;
  toggleTheme: () => void;
  setHaptics: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
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
    const totalXp = totalCount * 10;
    const level = Math.max(1, Math.floor(totalXp / 100) + 1);
    const levelProgress = (totalXp % 100) / 100;
    const unlockedMilestones = MILESTONES.filter((milestone) => totalCount >= milestone);
    const nextMilestone =
      MILESTONES.find((milestone) => totalCount < milestone) ?? null;
    return {
      totalCount,
      todayCount,
      weekCount,
      monthCount,
      totalXp,
      level,
      levelProgress,
      nextMilestone,
      unlockedMilestones,
    };
  }, [state.entries]);

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
          };
          return {
            ...current,
            entries: {
              ...current.entries,
              [date]: { count: currentEntry + amount },
            },
            actionHistory: [action, ...current.actionHistory].slice(0, 30),
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
      setReducedMotion: (enabled) => {
        setState((current) => ({ ...current, reducedMotion: enabled }));
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