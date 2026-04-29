import { useNavigate } from "react-router-dom";
import { getPatternCompletionPct, patternCards, type PatternId } from "../mockData";
import { useProgress } from "../useProgress";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

function Tile({
  id,
  icon,
  title,
  subtitle,
  progressPct,
  onClick,
}: {
  id: PatternId;
  icon: string;
  title: string;
  subtitle: string;
  progressPct: number;
  onClick: (patternId: PatternId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="group flex cursor-pointer flex-col justify-between rounded-lg border border-primary/10 bg-primary/5 p-card-padding text-left shadow-soft transition-colors hover:border-primary/30 hover:bg-primary/10 dark:border-slate-600 dark:bg-slate-800/70 dark:hover:bg-slate-800"
    >
      <div>
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-colors group-hover:bg-primary/15 group-hover:text-primary dark:bg-slate-700 dark:text-teal-300">
          <Icon name={icon} />
        </div>
        <h3 className="font-headline-md text-headline-md mb-2">{title}</h3>
        <p className="text-body-md text-on-surface-variant">{subtitle}</p>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex justify-between text-label-sm text-stone-400">
          <span>{progressPct}% Complete</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-slate-700">
          <div className="h-full rounded-full bg-primary/60 dark:bg-teal-400/70" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </button>
  );
}

export function PatternsPage() {
  const navigate = useNavigate();
  const progress = useProgress();
  const handleOpenPattern = (patternId: PatternId) => {
    navigate(`/found?pattern=${patternId}`);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      <div className="mb-section-margin">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <Icon name="psychology" className="text-[18px]" />
          <span className="font-label-md text-label-md uppercase tracking-widest">Select a focus area</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl mb-4">Pattern Exploration</h1>
        <p className="max-w-2xl font-body-lg text-on-surface-variant">
          Master the foundational logic of coding interviews. Choose a pattern to discover high-yield questions tailored to your
          journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-element-gap md:grid-cols-2 lg:grid-cols-3">
        {patternCards.map((pattern) => {
          const p = progress.byPattern[pattern.id];
          const livePct = getPatternCompletionPct(pattern.id, p?.solved ?? 0);
          return (
          <Tile
            key={pattern.id}
            id={pattern.id}
            icon={pattern.icon}
            title={pattern.title}
            subtitle={pattern.subtitle}
            progressPct={livePct}
            onClick={handleOpenPattern}
          />
          );
        })}
      </div>
    </div>
  );
}

