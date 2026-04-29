import { useProgress } from "../useProgress";
import { getPatternCompletionPct, patternCards, totalQuestionsByPattern } from "../mockData";

function Icon({ name, className }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className ?? ""}`.trim()}>{name}</span>;
}

export function DashboardPage() {
  const progress = useProgress();
  const weakPatterns = patternCards
    .map((pattern) => {
      const p = progress.byPattern[pattern.id] ?? { attempts: 0, solved: 0, failed: 0 };
      const mastery = getPatternCompletionPct(pattern.id, p.solved);
      const remaining = Math.max((totalQuestionsByPattern[pattern.id] ?? 0) - p.solved, 0);
      return { pattern, mastery, remaining };
    })
    .sort((a, b) => a.mastery - b.mastery || b.remaining - a.remaining)
    .slice(0, 2);

  return (
    <div className="min-h-[calc(100vh-12rem)]">
      <section className="mb-section-margin">
        <div className="relative overflow-hidden rounded-xl border border-stone-50 bg-white p-card-padding shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <div className="relative z-10 max-w-2xl">
            <h1 className="mb-6 font-headline-xl text-headline-xl leading-tight text-on-surface">
              Ready to master your next pattern?
            </h1>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-primary px-8 py-4 font-label-md text-white shadow-soft transition-all hover:scale-105 active:scale-95">
                Start Practice
              </button>
              <button className="rounded-full border-2 border-primary px-8 py-4 font-label-md text-primary transition-all hover:bg-primary/5 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-slate-800">
                Explore Patterns
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/3 opacity-10 lg:block">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(118,148,130,0.35),transparent_60%)]" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-element-gap lg:grid-cols-12">
        <div className="space-y-element-gap lg:col-span-8">
          <div className="rounded-lg border border-stone-50 bg-white p-card-padding shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-1 font-headline-md text-headline-md">Current Focus Pattern</h2>
                <p className="text-body-md text-stone-500 dark:text-slate-400">Dive into the complexities of sliding window logic.</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary dark:bg-slate-800 dark:text-teal-300">
                <Icon name="trending_up" />
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-lg bg-stone-50 p-6 dark:bg-slate-800">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-on-surface">
                  Longest Substring Without Repeating Characters
                </h3>
                <div className="mb-4 flex gap-3">
                  <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase text-on-secondary-container dark:bg-teal-900 dark:text-teal-200">
                    Medium
                  </span>
                  <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold uppercase text-stone-600 dark:bg-slate-700 dark:text-slate-300">
                    Sliding Window
                  </span>
                </div>
                <p className="mb-6 text-sm text-stone-600 dark:text-slate-400">
                  You've successfully solved 4 similar problems this week. This challenge will cement your mastery of dynamic
                  window sizing.
                </p>
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-label-md text-white transition-shadow hover:shadow-lg"
                  href="#"
                >
                  Launch Problem on LeetCode <Icon name="open_in_new" className="text-sm" />
                </a>
              </div>

              <div className="hidden h-32 w-32 opacity-20 sm:block">
                <Icon name="data_object" className="!text-8xl text-primary" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-stone-50 bg-white p-card-padding shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md">Strengthening Base</h2>
              <a className="font-label-md text-primary hover:underline" href="#">
                View all weak spots
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {weakPatterns.map(({ pattern, mastery, remaining }) => (
                <div
                  key={pattern.id}
                  className="group rounded-lg border border-primary/10 bg-primary/5 p-5 transition-all hover:border-primary/30 hover:bg-primary/10 dark:border-slate-600 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-teal-300">
                      <Icon name={pattern.icon} />
                    </div>
                    <h4 className="font-bold text-on-surface transition-colors group-hover:text-primary">{pattern.title}</h4>
                  </div>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${mastery}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-stone-500">
                    <span>{mastery}% Mastery</span>
                    <span>{remaining} problems to focus</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-element-gap lg:col-span-4">
          <div className="rounded-lg border border-stone-50 bg-white p-card-padding shadow-soft dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-on-surface">Activity Stats</h3>
              <Icon name="bar_chart" className="text-stone-400 dark:text-slate-400" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-sm font-medium text-stone-600 dark:text-slate-400">Total Attempts</span>
                </div>
                <span className="font-bold text-on-surface">{progress.attempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-stone-600 dark:text-slate-400">Total Solved</span>
                </div>
                <span className="font-bold text-on-surface">{progress.solved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-sm font-medium text-stone-600 dark:text-slate-400">Current Streak</span>
                </div>
                <span className="font-bold text-on-surface">{progress.streakDays} Days</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-400" />
                  <span className="text-sm font-medium text-stone-600 dark:text-slate-400">Accuracy</span>
                </div>
                <span className="font-bold text-on-surface">{progress.accuracyPct}%</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg bg-primary-container p-6 text-on-primary-container dark:bg-slate-800 dark:text-slate-200">
            <h4 className="mb-2 font-bold">Daily Insight</h4>
            <p className="text-sm leading-relaxed opacity-90">
              Most candidates forget to discuss time complexity before coding. Remember the O(n) constraint for sliding windows.
            </p>
            <Icon name="lightbulb" className="absolute -bottom-2 -right-2 text-6xl opacity-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

