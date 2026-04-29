type QuestionOutcome = "solved" | "failed";

type QuestionProgress = {
  questionId: string;
  patternId: string;
  outcome: QuestionOutcome;
  attemptedAt: string;
  difficulty?: "Easy" | "Medium" | "Hard";
};

type UserProgressState = {
  attempts: number;
  solved: number;
  failed: number;
  score: number;
  streakDays: number;
  lastPracticedDate?: string;
  byPattern: Record<string, { attempts: number; solved: number; failed: number }>;
  byQuestion: Record<string, QuestionProgress>;
  lastQuestionId?: string;
};

type PublicProgress = UserProgressState & {
  accuracyPct: number;
  masteryPct: number;
  journeyPct: number;
};

const STORAGE_KEY = "dsa-helper.user-progress.v1";
let cachedRaw: string | null = null;
let cachedSnapshot: PublicProgress | null = null;

function initialState(): UserProgressState {
  return {
    attempts: 0,
    solved: 0,
    failed: 0,
    score: 0,
    streakDays: 0,
    lastPracticedDate: undefined,
    byPattern: {},
    byQuestion: {},
  };
}

function loadState(): UserProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    return initialState();
  }
}

function saveState(state: UserProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("dsa-helper-progress-updated"));
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(olderIsoDate: string, newerIsoDate: string): number {
  const older = new Date(`${olderIsoDate}T00:00:00`);
  const newer = new Date(`${newerIsoDate}T00:00:00`);
  return Math.round((newer.getTime() - older.getTime()) / (1000 * 60 * 60 * 24));
}

function computeMasteryPct(state: UserProgressState): number {
  if (state.attempts === 0) return 0;
  const solvedRatio = state.solved / state.attempts;
  return Math.round(solvedRatio * 100);
}

function toPublicProgress(state: UserProgressState): PublicProgress {
  const accuracyPct = state.attempts === 0 ? 0 : Number(((state.solved / state.attempts) * 100).toFixed(1));
  const masteryPct = computeMasteryPct(state);
  // Journey uses solved count as long-term progression; tune target as product evolves.
  const journeyTargetSolved = 500;
  const journeyPct = Math.min(100, Math.round((state.solved / journeyTargetSolved) * 100));
  return { ...state, accuracyPct, masteryPct, journeyPct };
}

function normalizeState(state: UserProgressState): UserProgressState {
  // Rebuild counters from byQuestion when old snapshots are inconsistent.
  const byPattern: UserProgressState["byPattern"] = {};
  let solved = 0;
  let failed = 0;
  let scoreFromHistory = 0;

  for (const q of Object.values(state.byQuestion)) {
    if (!byPattern[q.patternId]) {
      byPattern[q.patternId] = { attempts: 0, solved: 0, failed: 0 };
    }
    byPattern[q.patternId].attempts += 1;
    if (q.outcome === "solved") {
      solved += 1;
      byPattern[q.patternId].solved += 1;
      scoreFromHistory += 1;
    } else {
      failed += 1;
      byPattern[q.patternId].failed += 1;
    }
  }

  const attempts = solved + failed;
  const hasHistory = Object.keys(state.byQuestion).length > 0;

  return {
    ...state,
    attempts: hasHistory ? Math.max(state.attempts, attempts) : state.attempts,
    solved: hasHistory ? Math.max(state.solved, solved) : state.solved,
    failed: hasHistory ? Math.max(state.failed, failed) : state.failed,
    byPattern: hasHistory ? { ...byPattern, ...state.byPattern } : state.byPattern,
    // Keep score aligned with solved-count model.
    score: scoreFromHistory,
  };
}

export function recordQuestionOutcome(params: {
  questionId: string;
  patternId: string;
  outcome: QuestionOutcome;
  difficulty?: "Easy" | "Medium" | "Hard";
}) {
  const state = loadState();
  const todayIso = toIsoDate(new Date());

  if (!state.lastPracticedDate) {
    state.streakDays = 1;
  } else {
    const diff = daysBetween(state.lastPracticedDate, todayIso);
    if (diff === 1) state.streakDays += 1;
    if (diff > 1) state.streakDays = 1;
    // diff === 0 => same day, keep streak
  }
  state.lastPracticedDate = todayIso;

  state.attempts += 1;
  state.lastQuestionId = params.questionId;

  if (!state.byPattern[params.patternId]) {
    state.byPattern[params.patternId] = { attempts: 0, solved: 0, failed: 0 };
  }
  state.byPattern[params.patternId].attempts += 1;

  if (params.outcome === "solved") {
    state.solved += 1;
    state.byPattern[params.patternId].solved += 1;
    state.score += 1;
  } else {
    state.failed += 1;
    state.byPattern[params.patternId].failed += 1;
  }

  state.byQuestion[params.questionId] = {
    questionId: params.questionId,
    patternId: params.patternId,
    outcome: params.outcome,
    attemptedAt: new Date().toISOString(),
    difficulty: params.difficulty,
  };

  const normalized = normalizeState(state);
  saveState(normalized);
  return toPublicProgress(normalized);
}

export function getProgressSnapshot(): PublicProgress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }

  if (raw === cachedRaw && cachedSnapshot) {
    return cachedSnapshot;
  }

  let parsed: UserProgressState;
  if (!raw) {
    parsed = initialState();
  } else {
    try {
      parsed = normalizeState({ ...initialState(), ...JSON.parse(raw) } as UserProgressState);
    } catch {
      parsed = initialState();
    }
  }
  const snapshot = toPublicProgress(parsed);
  cachedRaw = raw;
  cachedSnapshot = snapshot;
  return snapshot;
}

export function subscribeToProgress(onStoreChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener("dsa-helper-progress-updated", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("dsa-helper-progress-updated", onCustom);
  };
}

