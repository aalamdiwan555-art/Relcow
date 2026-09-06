import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import {
  addModerationReport,
  allowRequest,
  claimReferral,
  createChallenge,
  getDevice,
  joinChallenge,
  leaderboard,
  listChallenges,
  mergeSync,
  moderationReportCount,
} from "../lib/relcowCloud";

const router: IRouter = Router();

const deviceId = z.string().min(16).max(128).regex(/^[a-zA-Z0-9_-]+$/);
const action = z.object({
  id: z.string().min(1).max(128),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().int().min(1).max(100),
  timestamp: z.string().datetime(),
  source: z.enum(["manual", "auto"]).optional(),
});
const syncSchema = z.object({
  deviceId,
  displayName: z.string().trim().min(1).max(64),
  dailyGoal: z.number().int().min(1).max(10_000).nullable(),
  entries: z.record(z.string(), z.object({ count: z.number().int().min(0).max(10_000) })).default({}),
  actionHistory: z.array(action).max(500).default([]),
  updatedAt: z.string().datetime(),
});

function requireDevice(req: { header(name: string): string | undefined }, res: { status: (code: number) => { json: (body: unknown) => unknown } }) {
  const value = req.header("x-relcow-device");
  const parsed = deviceId.safeParse(value);
  if (!parsed.success) {
    res.status(400).json({ error: "A valid x-relcow-device header is required." });
    return null;
  }
  return parsed.data;
}

router.post("/sync/push", (req, res) => {
  const id = requireDevice(req, res);
  if (!id || !allowRequest(id)) return id ? res.status(429).json({ error: "Too many sync requests." }) : undefined;
  const parsed = syncSchema.safeParse({ ...req.body, deviceId: id });
  if (!parsed.success) return res.status(400).json({ error: "Invalid sync envelope.", issues: parsed.error.issues });
  const merged = mergeSync(parsed.data);
  return res.json({
    ok: true,
    strategy: "action-id-union-with-date-count-cap",
    conflictSafe: true,
    snapshot: merged,
  });
});

router.get("/sync/:deviceId", (req, res) => {
  const parsed = deviceId.safeParse(req.params.deviceId);
  if (!parsed.success) return res.status(400).json({ error: "Invalid device id." });
  const snapshot = getDevice(parsed.data);
  if (!snapshot) return res.status(404).json({ error: "No synced snapshot found." });
  return res.json({ snapshot });
});

router.get("/leaderboard", (_req, res) => {
  res.json({ scope: "opt-in-sync", entries: leaderboard() });
});

const challengeSchema = z.object({
  title: z.string().trim().min(1).max(80),
  target: z.number().int().min(1).max(100_000),
  endDate: z.string().datetime(),
});

router.post("/challenges", (req, res) => {
  const owner = requireDevice(req, res);
  if (!owner || !allowRequest(owner, 20)) return owner ? res.status(429).json({ error: "Too many challenge requests." }) : undefined;
  const parsed = challengeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid challenge.", issues: parsed.error.issues });
  const challenge = createChallenge({ ...parsed.data, ownerDeviceId: owner, participants: [owner] });
  return res.status(201).json({ challenge });
});

router.get("/challenges", (req, res) => {
  const owner = req.header("x-relcow-device");
  res.json({ challenges: listChallenges(owner) });
});

router.post("/challenges/join", (req, res) => {
  const owner = requireDevice(req, res);
  if (!owner) return undefined;
  const code = z.string().regex(/^REL-\d{6}$/).safeParse(req.body?.code);
  if (!code.success) return res.status(400).json({ error: "Invalid challenge code." });
  const challenge = joinChallenge(code.data, owner);
  if (!challenge) return res.status(404).json({ error: "Challenge not found." });
  return res.json({ challenge });
});

router.post("/referrals/claim", (req, res) => {
  const owner = requireDevice(req, res);
  if (!owner) return undefined;
  const code = z.string().regex(/^REL-[A-Z0-9]{2}-\d{4}$/).safeParse(req.body?.code);
  if (!code.success) return res.status(400).json({ error: "Invalid referral code." });
  return res.json(claimReferral(code.data, owner));
});

router.post("/moderation/reports", (req, res) => {
  const owner = requireDevice(req, res);
  if (!owner) return undefined;
  const parsed = z.object({
    subjectCode: z.string().trim().min(1).max(128),
    reason: z.string().trim().min(1).max(500),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid moderation report." });
  const report = addModerationReport({ ...parsed.data, reporterDeviceId: owner });
  return res.status(201).json({ reportId: report.id, accepted: true });
});

router.get("/admin/catalogue", (_req, res) => {
  res.json({
    version: 1,
    adsEnabled: false,
    rewards: [
      { id: "awareness-seed", title: "Awareness Seed", rarity: "common", unlockLevel: 1 },
      { id: "pattern-crystal", title: "Pattern Crystal", rarity: "rare", unlockLevel: 5 },
      { id: "pause-orb", title: "Pause Orb", rarity: "epic", unlockLevel: 10 },
    ],
    moderation: { reportCount: moderationReportCount() },
  });
});

router.get("/config", (_req, res) => {
  res.json({
    version: 1,
    flags: {
      adsEnabled: false,
      multipliersEnabled: false,
      cloudSyncEnabled: true,
      leaderboardsEnabled: true,
    },
  });
});

export default router;