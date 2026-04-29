import patternsJson from "../artifacts/patterns.json";
import questionsJson from "../artifacts/questions.json";
import practiceQuestionsJson from "../artifacts/practiceQuestions.json";
import patternTagMapJson from "../artifacts/patternTagMap.json";

export type PatternId = string;

export type PatternCard = {
  id: PatternId;
  icon: string;
  title: string;
  subtitle: string;
  progressPct: number;
};

export type Question = {
  id: string;
  title: string;
  patternId: PatternId;
  patternLabel: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estTime: string;
  url: string;
  prompt: string;
  exampleInput: string;
  exampleOutput: string;
  exampleExplanation: string;
  hint: string;
  tags?: string[];
  acceptanceRate?: number;
  sourceDifficulty?: "Easy" | "Medium" | "Hard";
};

type ArtifactPattern = {
  id: string;
  name: string;
  description: string;
  order: number;
};

type ArtifactQuestion = {
  id: string;
  title: string;
  patternId: string;
  difficulty: "easy" | "medium" | "hard";
  url: string;
  tags: string[];
  estimatedMinutes: number;
  paidOnly?: boolean;
  sourceMeta?: {
    acRate?: number;
    topicTagSlugs?: string[];
  };
};

type ArtifactPracticeQuestion = ArtifactQuestion & {
  prompt: string;
  exampleInput: string;
  exampleOutput: string;
  exampleExplanation: string;
  hint: string;
  acceptanceRate?: number;
};

const iconByPatternId: Record<string, string> = {
  "arrays-hashing": "data_array",
  "two-pointers": "sync_alt",
  "sliding-window": "auto_awesome_motion",
  "binary-search": "manage_search",
  "linked-list": "timeline",
  trees: "account_tree",
  graphs: "share",
  backtracking: "u_turn_left",
  "dynamic-programming": "layers",
  greedy: "bolt",
  intervals: "filter_list",
  "heap-priority-queue": "heap_snapshot_thumbnail",
};

function toUiDifficulty(value: ArtifactQuestion["difficulty"]): Question["difficulty"] {
  if (value === "easy") return "Easy";
  if (value === "hard") return "Hard";
  return "Medium";
}

const artifactPatterns = patternsJson as ArtifactPattern[];
const artifactQuestions = (questionsJson as ArtifactQuestion[]).filter((q) => !q.paidOnly);
const practiceQuestions = (practiceQuestionsJson as ArtifactPracticeQuestion[]).filter((q) => !q.paidOnly);
const patternTagMap = patternTagMapJson as Record<string, string>;

const patternPriority: Record<string, number> = {
  "two-pointers": 1,
  "sliding-window": 2,
  "binary-search": 3,
  "linked-list": 4,
  trees: 5,
  graphs: 6,
  backtracking: 7,
  "dynamic-programming": 8,
  greedy: 9,
  intervals: 10,
  "heap-priority-queue": 11,
  "arrays-hashing": 99,
};

const patternNameById = new Map(artifactPatterns.map((p) => [p.id, p.name]));
const countsByPattern = artifactQuestions.reduce<Record<string, number>>((acc, q) => {
  acc[q.patternId] = (acc[q.patternId] ?? 0) + 1;
  return acc;
}, {});
const maxCount = Math.max(...Object.values(countsByPattern), 1);

export const patternCards: PatternCard[] = artifactPatterns
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((p) => ({
    id: p.id,
    icon: iconByPatternId[p.id] ?? "grid_view",
    title: p.name,
    subtitle: p.description,
    // temporary neutral progress until user-specific analytics are wired
    progressPct: Math.min(90, Math.max(5, Math.round(((countsByPattern[p.id] ?? 1) / maxCount) * 100))),
  }));

// Keep rich curated practice entries when present, but do not drop patterns
// that are only present in the broader artifact question set.
const practiceQuestionIds = new Set(practiceQuestions.map((q) => q.id));
const questionPool =
  practiceQuestions.length > 0
    ? [...practiceQuestions, ...artifactQuestions.filter((q) => !practiceQuestionIds.has(q.id))]
    : artifactQuestions;

function inferPatternId(q: ArtifactQuestion): string {
  const slugs = q.sourceMeta?.topicTagSlugs ?? [];
  if (slugs.length === 0) return q.patternId;

  const votes = new Map<string, number>();
  for (const slug of slugs) {
    const mapped = patternTagMap[slug];
    if (!mapped) continue;
    votes.set(mapped, (votes.get(mapped) ?? 0) + 1);
  }
  if (votes.size === 0) return q.patternId;

  const ranked = Array.from(votes.entries()).sort((a, b) => {
    const voteDiff = b[1] - a[1];
    if (voteDiff !== 0) return voteDiff;
    const rankA = patternPriority[a[0]] ?? 50;
    const rankB = patternPriority[b[0]] ?? 50;
    if (rankA !== rankB) return rankA - rankB;
    return a[0].localeCompare(b[0]);
  });
  return ranked[0][0];
}

export const questions: Question[] = questionPool.map((q) => {
  const patternId = inferPatternId(q);
  const patternLabel = patternNameById.get(patternId) ?? patternId;
  const firstTag = q.tags[0] ?? "this pattern";
  const hasRich = "prompt" in q;
  return {
    id: q.id,
    title: q.title,
    patternId,
    patternLabel,
    difficulty: toUiDifficulty(q.difficulty),
    estTime: `${q.estimatedMinutes} mins`,
    url: q.url,
    prompt: hasRich ? (q as ArtifactPracticeQuestion).prompt : `Solve this ${q.difficulty} LeetCode problem using ${patternLabel}.`,
    exampleInput: hasRich ? (q as ArtifactPracticeQuestion).exampleInput : "Refer to LeetCode statement for exact sample input.",
    exampleOutput: hasRich ? (q as ArtifactPracticeQuestion).exampleOutput : "Refer to LeetCode statement for expected output.",
    exampleExplanation: hasRich
      ? (q as ArtifactPracticeQuestion).exampleExplanation
      : "Use the sample walkthrough on LeetCode before coding.",
    hint: hasRich ? (q as ArtifactPracticeQuestion).hint : `Start by identifying the ${firstTag} angle, then derive a ${patternLabel} approach.`,
    tags: q.tags,
    acceptanceRate: hasRich ? (q as ArtifactPracticeQuestion).acceptanceRate : q.sourceMeta?.acRate,
    sourceDifficulty: toUiDifficulty(q.difficulty),
  };
});

export const totalQuestionsByPattern = questions.reduce<Record<string, number>>((acc, q) => {
  acc[q.patternId] = (acc[q.patternId] ?? 0) + 1;
  return acc;
}, {});

export function pickRandomQuestion(patternId?: PatternId) {
  const scopedPool = patternId ? questions.filter((q) => q.patternId === patternId) : questions;
  const pool = scopedPool.length > 0 ? scopedPool : questions;
  if (pool.length === 0) return undefined;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function patternById(patternId?: string) {
  return patternCards.find((p) => p.id === patternId);
}

export function questionById(questionId?: string | null) {
  return questions.find((q) => q.id === questionId);
}

export function getPatternCompletionPct(patternId: string, solvedCount: number): number {
  const total = totalQuestionsByPattern[patternId] ?? 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, solvedCount) / total) * 100));
}

const difficultyOrder: Record<Question["difficulty"], number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

export function pickNextQuestionForOutcome(currentQuestion: Question, outcome: "solved" | "failed"): Question {
  const samePattern = questions.filter((q) => q.patternId === currentQuestion.patternId && q.id !== currentQuestion.id);
  const currentRank = difficultyOrder[currentQuestion.difficulty];

  const preferred = samePattern.filter((q) =>
    outcome === "solved" ? difficultyOrder[q.difficulty] > currentRank : difficultyOrder[q.difficulty] < currentRank
  );

  const fallbackSamePattern = samePattern.filter((q) => difficultyOrder[q.difficulty] === currentRank);
  const pool = preferred.length > 0 ? preferred : fallbackSamePattern.length > 0 ? fallbackSamePattern : samePattern;

  if (pool.length === 0) return currentQuestion;
  return pool[Math.floor(Math.random() * pool.length)];
}

