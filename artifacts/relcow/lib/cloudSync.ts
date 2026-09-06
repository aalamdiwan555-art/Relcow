import type { RelcowState } from '@/context/AppProvider';

export type SyncResponse = {
  ok: boolean;
  snapshot?: unknown;
};

const API_URL = process.env.EXPO_PUBLIC_RELCOW_API_URL?.replace(/\/$/, '');

export async function pushRelcowSnapshot(
  deviceId: string,
  state: RelcowState,
): Promise<SyncResponse> {
  if (!API_URL) return { ok: false };
  const response = await fetch(`${API_URL}/sync/push`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-relcow-device': deviceId,
    },
    body: JSON.stringify({
      deviceId,
      displayName: state.profile?.name ?? 'Relcow user',
      dailyGoal: state.profile?.dailyGoal ?? null,
      entries: state.entries,
      actionHistory: state.actionHistory,
      updatedAt: new Date().toISOString(),
    }),
  });
  if (!response.ok) return { ok: false };
  return (await response.json()) as SyncResponse;
}