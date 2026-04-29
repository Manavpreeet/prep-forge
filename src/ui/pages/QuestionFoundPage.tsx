import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { patternById, pickRandomQuestion, type PatternId } from "../mockData";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

export function QuestionFoundPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patternId = searchParams.get("pattern") as PatternId | null;

  const question = useMemo(() => pickRandomQuestion(patternId ?? undefined), [patternId, searchParams]);
  const selectedPattern = patternById(patternId ?? undefined);

  if (!question) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-xl rounded-lg border border-stone-100 bg-white p-8 shadow-soft">
          <h1 className="mb-3 font-headline-lg text-headline-lg">No question available yet</h1>
          <p className="mb-6 text-on-surface-variant">
            We could not find a question for this selection. Try another pattern or start a random practice roll.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/patterns")}
              className="rounded-full border-2 border-primary px-6 py-3 font-headline-md text-primary transition-colors hover:bg-primary/5"
            >
              Browse Patterns
            </button>
            <button
              type="button"
              onClick={() => navigate("/rolling")}
              className="rounded-full bg-primary px-6 py-3 font-headline-md text-on-primary"
            >
              Start Random Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRollAgain = () => {
    if (patternId) {
      navigate(`/rolling?pattern=${patternId}&nonce=${Date.now()}`);
      return;
    }
    navigate(`/rolling?nonce=${Date.now()}`);
  };

  return (
    <div className="botanical-mesh flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center px-4 py-section-margin">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-primary/10 bg-surface-container-lowest p-card-padding shadow-[0_4px_30px_rgba(118,148,130,0.08)] dark:border-slate-600 dark:bg-slate-900">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary dark:bg-slate-700 dark:text-teal-300">
              <Icon name="auto_awesome" className="[font-variation-settings:'FILL'_1]" />
            </div>
            <span className="font-label-md uppercase tracking-widest text-primary">New Problem Found</span>
          </div>

          <h1 className="font-headline-lg text-headline-lg mb-8">{question.title}</h1>
          {selectedPattern ? (
            <p className="-mt-4 mb-8 font-body-md text-on-surface-variant">
              Pattern selected: <span className="font-semibold text-primary">{selectedPattern.title}</span>
            </p>
          ) : null}

          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-DEFAULT bg-surface-container-low p-4 dark:bg-slate-800">
              <span className="font-label-sm uppercase text-on-surface-variant">Pattern</span>
              <div className="flex items-center gap-2">
                <Icon name="layers" className="text-lg text-primary" />
                <span className="font-body-md font-semibold">{question.patternLabel}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-DEFAULT bg-surface-container-low p-4 dark:bg-slate-800">
              <span className="font-label-sm uppercase text-on-surface-variant">Difficulty</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                <span className="font-body-md font-semibold text-secondary">{question.difficulty}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 rounded-DEFAULT bg-surface-container-low p-4 dark:bg-slate-800">
              <span className="font-label-sm uppercase text-on-surface-variant">Est. Time</span>
              <div className="flex items-center gap-2">
                <Icon name="schedule" className="text-lg text-stone-500" />
                <span className="font-body-md font-semibold">{question.estTime}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/practice?q=${question.id}`)}
              className="flex flex-1 items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 font-headline-md text-on-primary shadow-lg transition-all hover:opacity-90 active:scale-95"
            >
              <span>Open Problem</span>
              <Icon name="arrow_forward" />
            </button>
            <button
              type="button"
              onClick={handleRollAgain}
              className="flex flex-1 items-center justify-center gap-3 rounded-full border-2 border-primary px-8 py-4 font-headline-md text-primary transition-all hover:bg-primary/5 active:scale-95"
            >
              <Icon name="casino" />
              <span>Roll Again</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 opacity-40 grayscale transition-all duration-700 hover:opacity-60 hover:grayscale-0">
        <div className="flex h-32 w-32 items-center justify-center">
          <Icon name="spa" className="text-[120px] text-primary opacity-30" />
        </div>
      </div>
    </div>
  );
}

