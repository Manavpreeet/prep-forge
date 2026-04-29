import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPatternCompletionPct, pickNextQuestionForOutcome, pickRandomQuestion, questionById } from "../mockData";
import { openExternalUrl } from "../openExternalUrl";
import { recordQuestionOutcome } from "../progress";
import { useProgress } from "../useProgress";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DS_TERMS = [
  "array",
  "arrays",
  "string",
  "strings",
  "tree",
  "trees",
  "binary tree",
  "graph",
  "graphs",
  "linked list",
  "linked lists",
  "queue",
  "stack",
  "heap",
  "priority queue",
  "hash map",
  "hash table",
  "set",
  "sliding window",
  "two pointers",
  "dynamic programming",
  "greedy",
  "backtracking",
  "binary search",
  "dfs",
  "bfs",
  "node",
  "nodes",
  "edge",
  "edges",
  "adjacency",
  "substring",
  "subarray",
  "prefix",
  "suffix",
];

function highlightText(text: string) {
  const numberPattern = "(?:\\b\\d+(?:\\.\\d+)?\\b|\\b\\d+\\s*\\^\\s*\\d+\\b|\\[[^\\]]*\\d[^\\]]*\\])";
  const termPattern = DS_TERMS.sort((a, b) => b.length - a.length).map(escapeRegExp).join("|");
  const combined = new RegExp(`(${numberPattern})|\\b(${termPattern})\\b`, "gi");

  const out: Array<string | ReactNode> = [];
  let last = 0;
  let idx = 0;

  for (const match of text.matchAll(combined)) {
    const m = match[0];
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const isNumber = new RegExp(`^${numberPattern}$`, "i").test(m);
    out.push(
      <span
        key={`hl-${idx++}-${start}`}
        className={
          isNumber
            ? "rounded bg-stone-200 px-1 font-mono text-[0.95em] text-stone-900"
            : "rounded bg-stone-200/70 px-1 font-semibold text-stone-900"
        }
      >
        {m}
      </span>
    );
    last = start + m.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

function formatPromptSections(prompt: string): string[] {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  const markers = [
    "Example\\s*\\d*:",
    "Input:",
    "Output:",
    "Explanation:",
    "Constraints:",
    "Follow[- ]?up:",
    "Note:",
  ];
  const withBreaks = normalized.replace(new RegExp(`\\s*(${markers.join("|")})`, "gi"), "\n\n$1");
  return withBreaks
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type SectionKind = "example" | "input" | "output" | "explanation" | "constraints" | "followup" | "note" | "general";
type PromptGroup = {
  kind: "exampleGroup" | "constraintGroup" | "generalGroup";
  title?: string;
  lines: { kind: SectionKind; text: string }[];
};

function sectionKind(section: string): SectionKind {
  if (/^Example\s*\d*:/i.test(section)) return "example";
  if (/^Input:/i.test(section)) return "input";
  if (/^Output:/i.test(section)) return "output";
  if (/^Explanation:/i.test(section)) return "explanation";
  if (/^Constraints:/i.test(section)) return "constraints";
  if (/^Follow[- ]?up:/i.test(section)) return "followup";
  if (/^Note:/i.test(section)) return "note";
  return "general";
}

function lineStyle(kind: SectionKind) {
  switch (kind) {
    case "input":
    case "output":
    case "constraints":
      return "font-mono text-sm text-stone-800";
    case "example":
      return "text-sm font-semibold text-stone-900";
    case "explanation":
    case "followup":
    case "note":
      return "text-sm leading-7 text-stone-700";
    default:
      return "text-[15px] leading-7 text-on-surface-variant";
  }
}

function groupPromptSections(sections: string[]): PromptGroup[] {
  const groups: PromptGroup[] = [];
  let currentExample: PromptGroup | null = null;

  for (const section of sections) {
    const kind = sectionKind(section);
    const line = { kind, text: section };

    if (kind === "example") {
      if (currentExample) groups.push(currentExample);
      currentExample = { kind: "exampleGroup", title: section, lines: [] };
      continue;
    }

    if (kind === "input" || kind === "output" || kind === "explanation") {
      if (!currentExample) currentExample = { kind: "exampleGroup", title: "Example", lines: [] };
      currentExample.lines.push(line);
      continue;
    }

    if (currentExample) {
      groups.push(currentExample);
      currentExample = null;
    }

    if (kind === "constraints") {
      groups.push({ kind: "constraintGroup", title: "Constraints", lines: [line] });
    } else {
      groups.push({ kind: "generalGroup", lines: [line] });
    }
  }

  if (currentExample) groups.push(currentExample);
  return groups;
}

export function PracticeQuestionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showHint, setShowHint] = useState(false);
  const progress = useProgress();
  const qid = searchParams.get("q");

  const question = useMemo(() => questionById(qid) ?? pickRandomQuestion(), [qid]);
  if (!question) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
        <div className="max-w-xl rounded-lg border border-stone-100 bg-white p-8 text-center shadow-soft">
          <h1 className="mb-3 font-headline-lg text-headline-lg">No practice question found</h1>
          <p className="mb-6 text-on-surface-variant">
            We could not load a question right now. Please go back and roll again.
          </p>
          <button
            type="button"
            onClick={() => navigate("/rolling")}
            className="rounded-full bg-primary px-6 py-3 font-headline-md text-on-primary"
          >
            Roll a Question
          </button>
        </div>
      </div>
    );
  }
  const promptSections = useMemo(() => formatPromptSections(question.prompt), [question.prompt]);
  const promptGroups = useMemo(() => groupPromptSections(promptSections), [promptSections]);
  const promptAlreadyHasExamples = useMemo(
    () => promptSections.some((section) => /^(Example|Input:|Output:|Explanation:)/i.test(section)),
    [promptSections]
  );
  const patternProgress = progress.byPattern[question.patternId];
  const conceptProficiency = getPatternCompletionPct(question.patternId, patternProgress?.solved ?? 0);

  const goToOutcomeQuestion = (outcome: "solved" | "failed") => {
    recordQuestionOutcome({
      questionId: question.id,
      patternId: question.patternId,
      outcome,
      difficulty: question.difficulty,
    });

    const nextQuestion = pickNextQuestionForOutcome(question, outcome);
    navigate(`/practice?q=${nextQuestion.id}`);
    setShowHint(false);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-soft">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase text-on-secondary-container">
            {question.difficulty}
          </span>
          <span className="text-sm text-stone-500">Question #{question.id}</span>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-on-surface">{question.title}</h2>
        <div className="mb-5 rounded-xl border border-stone-200 bg-stone-50/70 px-4 pb-4 pt-6">
          <div className="mb-4 border-b border-stone-200/80 pb-3">
            <p className="text-xs uppercase tracking-widest text-stone-500">Problem Statement</p>
          </div>
          <div className="space-y-3">
            {promptGroups.map((group, idx) => {
              if (group.kind === "exampleGroup") {
                return (
                  <div key={`g-${idx}`} className="rounded-lg border border-stone-300 bg-white p-3">
                    <p className="mb-2 text-sm font-semibold text-stone-900">{group.title ?? "Example"}</p>
                    <div className="space-y-2">
                      {group.lines.map((line, lineIdx) => (
                        <p key={`l-${idx}-${lineIdx}`} className={lineStyle(line.kind)}>
                          {highlightText(line.text)}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              }
              if (group.kind === "constraintGroup") {
                return (
                  <div key={`g-${idx}`} className="rounded-lg border border-stone-300 bg-stone-100 p-3">
                    {group.lines.map((line, lineIdx) => (
                      <p key={`l-${idx}-${lineIdx}`} className={lineStyle(line.kind)}>
                        {highlightText(line.text)}
                      </p>
                    ))}
                  </div>
                );
              }
              return (
                <div key={`g-${idx}`} className="rounded-lg bg-stone-100/70 px-3 py-2">
                  {group.lines.map((line, lineIdx) => (
                    <p key={`l-${idx}-${lineIdx}`} className={lineStyle(line.kind)}>
                      {highlightText(line.text)}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {!promptAlreadyHasExamples ? (
          <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-5">
            <p className="mb-2 text-sm text-stone-500">// Example Case</p>
            <p className="font-mono text-sm">
              <span className="font-semibold text-primary">Input:</span> {question.exampleInput}
            </p>
            <p className="font-mono text-sm">
              <span className="font-semibold text-primary">Output:</span> {question.exampleOutput}
            </p>
            <p className="mt-1 text-sm italic text-stone-500">Explanation: {question.exampleExplanation}</p>
          </div>
        ) : null}

        {showHint ? (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-on-surface">
            <span className="font-semibold text-primary">Hint:</span> {question.hint}
          </div>
        ) : null}

        <div className="border-t border-stone-100 pt-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="rounded-full border-2 border-primary px-5 py-2 font-medium text-primary hover:bg-primary/5 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-slate-800"
            >
              Reveal Hint
            </button>
            <button
              type="button"
              onClick={() => goToOutcomeQuestion("solved")}
              className="rounded-full bg-primary px-5 py-2 font-medium text-white dark:bg-teal-500 dark:text-slate-900"
            >
              <Icon name="check_circle" className="mr-1 text-sm" />
              Solved
            </button>
            <button
              type="button"
              onClick={() => goToOutcomeQuestion("failed")}
              className="rounded-full bg-stone-200 px-5 py-2 font-medium text-stone-700 dark:bg-slate-700 dark:text-slate-200"
            >
              Not able to Solve
            </button>
            <button
              type="button"
              onClick={() => openExternalUrl(question.url)}
              className="rounded-full bg-secondary px-5 py-2 font-medium text-white dark:bg-teal-600 dark:text-white"
            >
              Open question
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-stone-500">Concept: {question.patternLabel}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-primary" style={{ width: `${conceptProficiency}%` }} />
          </div>
          <p className="mt-2 text-xs text-stone-500">{conceptProficiency}% Proficiency reached</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-stone-500">Question Signals</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
              <div className="flex items-center gap-2 text-stone-500">
                <Icon name="signal_cellular_alt" className="text-base" />
                <span className="text-xs uppercase tracking-wide">Difficulty</span>
              </div>
              <span className="font-mono text-sm font-semibold text-primary">{question.sourceDifficulty ?? question.difficulty}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
              <div className="flex items-center gap-2 text-stone-500">
                <Icon name="percent" className="text-base" />
                <span className="text-xs uppercase tracking-wide">Acceptance</span>
              </div>
              <span className="font-mono text-sm font-semibold text-secondary">
                {typeof question.acceptanceRate === "number" ? `${question.acceptanceRate.toFixed(1)}%` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
              <div className="flex items-center gap-2 text-stone-500">
                <Icon name="sell" className="text-base" />
                <span className="text-xs uppercase tracking-wide">Primary Tag</span>
              </div>
              <span className="font-mono text-sm font-semibold text-stone-700">{question.tags?.[0] ?? "General"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

