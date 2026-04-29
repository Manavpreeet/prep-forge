import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

export function RollingForQuestionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rolling, setRolling] = useState(true);
  const patternId = searchParams.get("pattern");

  useEffect(() => {
    if (!rolling) return;
    const t = window.setTimeout(() => {
      if (patternId) {
        navigate(`/found?pattern=${patternId}&nonce=${Date.now()}`);
        return;
      }
      navigate(`/found?nonce=${Date.now()}`);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [navigate, patternId, rolling]);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-primary/10 bg-surface-container-lowest p-card-padding shadow-[0_4px_30px_rgba(118,148,130,0.08)] dark:border-slate-600 dark:bg-slate-900">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] [background-size:200%_100%] animate-[shimmer_2s_linear_infinite]" />

        <div className="relative z-10 flex flex-col items-center gap-element-gap text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed dark:bg-slate-700">
            <Icon name="casino" className="text-[40px] text-primary animate-[spin_3s_linear_infinite] dark:text-teal-300" />
          </div>

          <div className="space-y-2">
            <h1 className="font-headline-lg text-headline-lg">Finding next challenge...</h1>
            <p className="mx-auto max-w-md font-body-md text-on-surface-variant">
              Our algorithm is selecting the perfect data structure problem to match your current mastery levels and learning curve.
            </p>
          </div>

          <div className="w-full space-y-4 py-8">
            <div className="mx-auto h-4 w-3/4 rounded-full bg-surface-container-high dark:bg-slate-700" />
            <div className="mx-auto h-4 w-1/2 rounded-full bg-surface-container-high dark:bg-slate-700" />
            <div className="mt-4 flex justify-center gap-2">
              <div className="h-6 w-20 rounded-full bg-surface-container-high dark:bg-slate-700" />
              <div className="h-6 w-24 rounded-full bg-surface-container-high dark:bg-slate-700" />
            </div>
          </div>

          <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 rounded-full bg-stone-300 px-8 py-3 font-label-md text-stone-500 opacity-70 dark:bg-slate-700 dark:text-slate-300"
            >
              Open Problem <Icon name="lock" className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => setRolling(false)}
              className="rounded-full border-2 border-primary px-8 py-3 font-label-md text-primary transition-colors hover:bg-primary-fixed dark:border-teal-400 dark:text-teal-300 dark:hover:bg-slate-800"
            >
              Stop Roll
            </button>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 rotate-12 opacity-10">
          <Icon name="potted_plant" className="text-[160px] text-primary" />
        </div>
        <div className="absolute -top-10 -left-10 -rotate-12 opacity-5">
          <Icon name="eco" className="text-[120px] text-primary" />
        </div>
      </div>

      <div className="mt-element-gap max-w-lg text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Icon name="auto_awesome" className="text-sm [font-variation-settings:'FILL'_1]" />
          <p className="font-label-sm uppercase tracking-widest">Mastery Tip</p>
        </div>
        <p className="mt-2 font-body-md italic text-stone-500 dark:text-slate-400">
          "Focus on the underlying pattern, not just the solution. Today's session targets Graph Traversal optimization."
        </p>
      </div>

    </div>
  );
}

