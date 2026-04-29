import { useNavigate } from "react-router-dom";
import { useProgress } from "../useProgress";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

export function HomePage() {
  const navigate = useNavigate();
  const progress = useProgress();

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
      <div className="mb-16 space-y-4 text-center">
        <h2 className="font-headline-xl text-headline-xl text-primary">Master Your Craft</h2>
        <p className="mx-auto max-w-lg font-body-lg text-stone-500">
          A calm space for technical problem solving. Focus on the pattern, not the pressure.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/rolling")}
          className="group relative rounded-lg border border-stone-100 bg-white p-card-padding text-left shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
            <Icon name="casino" className="text-[32px]" />
          </div>
          <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Random Practice</h3>
          <p className="font-body-md text-on-surface-variant">
            Pick a random challenge and test your foundational knowledge under focus.
          </p>
          <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
            <span>Start Session</span>
            <Icon name="arrow_forward" className="text-sm" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/patterns")}
          className="group relative rounded-lg border border-stone-100 bg-white p-card-padding text-left shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container transition-colors group-hover:bg-secondary group-hover:text-white">
            <Icon name="grid_view" className="text-[32px]" />
          </div>
          <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Explore Patterns</h3>
          <p className="font-body-md text-on-surface-variant">
            Browse problems categorized by algorithmic patterns and data structures.
          </p>
          <div className="mt-8 flex items-center gap-2 font-semibold text-secondary">
            <span>View Library</span>
            <Icon name="arrow_forward" className="text-sm" />
          </div>
        </button>
      </div>

      <div className="mt-section-margin text-center">
        <p className="font-body-md italic text-stone-400">"Slow is smooth, and smooth is fast."</p>
        <p className="mt-2 text-sm text-stone-500">
          Score {progress.score} • Solved {progress.solved} • Streak {progress.streakDays} day{progress.streakDays === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

