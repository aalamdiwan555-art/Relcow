import { randomUUID } from "node:crypto";

export type SyncAction = {
  id: string;
  date: string;
  amount: number;
  timestamp: string;
  source?: "manual" | "auto";
};

export type SyncEnvelope = {
  deviceId: string;
  displayName: string;
  dailyGoal: number | null;
  entries: Record<string, { count: number }>;
  actionHistory: SyncAction[];
  updatedAt: string;
};

type CloudDevice = SyncEnvelope & {
  firstSeenAt: string;
};

export type CloudChallenge = {
  id: string;
  code: string;
  title: string;
  target: number;
  ownerDeviceId: string;
  participants: string[];
  createdAt: string;
  endDate: string;
};

export type ModerationReport = {
  id: string;
  reporterDeviceId: string;
  subjectCode: string;
  reason: string;
  createdAt: string;
};

const devices = new Map<string, CloudDevice>();
const challenges = new Map<string, CloudChallenge>();
const referrals = new Map<string, Set<string>>();
const moderationReports: ModerationReport[] = [];
const requestWindows = new Map<string, { startedAt: number; count: number }>();

export function allowRequest(key: string, limit = 60) {
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= 60_000) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function mergeSync(envelope: SyncEnvelope) {
  const previous = devices.get(envelope.deviceId);
  const actionMap = new Map<string, SyncAction>();
  for (const action of previous?.actionHistory ?? []) actionMap.set(action.id, action);
  for (const action of envelope.actionHistory) actionMap.set(action.id, action);

  const actions = [...actionMap.values()]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-500);
  const mergedEntries = { ...previous?.entries, ...envelope.entries };
  for (const action of actions) {
    const entry = mergedEntries[action.date];
    const actionCount = actions
      .filter((item) => item.date === action.date)
      .reduce((sum, item) => sum + item.amount, 0);
    mergedEntries[action.date] = {
      count: Math.max(entry?.count ?? 0, Math.min(10_000, actionCount)),
    };
  }

  const merged: CloudDevice = {
    ...envelope,
    entries: mergedEntries,
    actionHistory: actions,
    updatedAt: new Date().toISOString(),
    firstSeenAt: previous?.firstSeenAt ?? new Date().toISOString(),
  };
  devices.set(envelope.deviceId, merged);
  return merged;
}

export function getDevice(deviceId: string) {
  return devices.get(deviceId) ?? null;
}

export function leaderboard() {
  return [...devices.values()]
    .map((device) => ({
      deviceId: device.deviceId,
      displayName: device.displayName,
      totalCount: Object.values(device.entries).reduce((sum, item) => sum + item.count, 0),
      updatedAt: device.updatedAt,
    }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 100);
}

export function createChallenge(input: Omit<CloudChallenge, "id" | "code" | "createdAt">) {
  const challenge: CloudChallenge = {
    ...input,
    id: randomUUID(),
    code: `REL-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
  };
  challenges.set(challenge.id, challenge);
  return challenge;
}

export function joinChallenge(code: string, deviceId: string) {
  const challenge = [...challenges.values()].find((item) => item.code === code);
  if (!challenge) return null;
  if (!challenge.participants.includes(deviceId)) challenge.participants.push(deviceId);
  return challenge;
}

export function listChallenges(deviceId?: string) {
  return [...challenges.values()].filter((item) => !deviceId || item.participants.includes(deviceId));
}

export function claimReferral(code: string, deviceId: string) {
  const claimants = referrals.get(code) ?? new Set<string>();
  claimants.add(deviceId);
  referrals.set(code, claimants);
  return { code, claimed: true, claimantCount: claimants.size };
}

export function addModerationReport(report: Omit<ModerationReport, "id" | "createdAt">) {
  const stored = { ...report, id: randomUUID(), createdAt: new Date().toISOString() };
  moderationReports.push(stored);
  return stored;
}

export function moderationReportCount() {
  return moderationReports.length;
}