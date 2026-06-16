import type { Paper } from "../types";
import { getPaper, SYLLABUS } from "../data/syllabus";
import {
  overallStats,
  progressActions,
  statsByUnit,
  statsForPaper,
  useProgress,
} from "../hooks/useProgress";

export default function Progress() {
  const progress = useProgress();
  const overall = overallStats(progress);

  if (overall.attempted === 0 && progress.mocks.length === 0) {
    return (
      <div className="card p-10 text-center animate-pop">
        <p className="text-4xl">📊</p>
        <p className="mt-3 text-lg font-bold heading">No progress yet</p>
        <p className="mt-2 text-sm muted">
          Answer some practice questions or take a mock test, and your stats will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pop">
      <h1 className="text-2xl font-black heading">
        Your <span className="gradient-text">progress</span>
      </h1>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Attempted" value={overall.attempted} />
        <Stat label="Correct" value={overall.correct} />
        <Stat label="Accuracy" value={`${Math.round(overall.accuracy * 100)}%`} />
      </section>

      {SYLLABUS.map((p) => {
        const ps = statsForPaper(progress, p.paper);
        if (ps.attempted === 0) return null;
        return (
          <section key={p.paper} className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold heading">
                Paper {p.paper}: {p.title}
              </h2>
              <span className="chip bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
                {ps.correct}/{ps.attempted} · {Math.round(ps.accuracy * 100)}%
              </span>
            </div>
            <UnitBars paper={p.paper} progress={progress} />
          </section>
        );
      })}

      {progress.mocks.length > 0 ? (
        <section className="card p-5">
          <h2 className="mb-3 font-bold heading">Mock test history</h2>
          <div className="space-y-2">
            {[...progress.mocks]
              .reverse()
              .slice(0, 10)
              .map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-slate-100/70 px-3 py-2 text-sm dark:bg-white/5"
                >
                  <span className="muted">
                    {new Date(m.ts).toLocaleDateString()} · Paper {m.paper}
                  </span>
                  <span className="font-bold heading">
                    {m.correct}/{m.total} ({Math.round((m.correct / m.total) * 100)}
                    %)
                  </span>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (confirm("Reset all your progress? This cannot be undone.")) {
            progressActions.reset();
          }
        }}
        className="text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
      >
        Reset all progress
      </button>
    </div>
  );
}

function UnitBars({
  paper,
  progress,
}: {
  paper: Paper;
  progress: ReturnType<typeof useProgress>;
}) {
  const units = statsByUnit(progress, paper);
  const syllabus = getPaper(paper)!;
  return (
    <div className="mt-4 space-y-2.5">
      {units.map((u) => {
        const name = syllabus.units.find((x) => x.number === u.unit)?.name ?? "";
        const pct = Math.round(u.accuracy * 100);
        const color =
          pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
        return (
          <div key={u.unit}>
            <div className="mb-1 flex justify-between text-xs muted">
              <span className="truncate pr-2">
                U{u.unit}. {name}
              </span>
              <span className="shrink-0 font-bold">
                {u.correct}/{u.attempted} · {pct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-black gradient-text">{value}</div>
      <div className="mt-1 text-xs muted">{label}</div>
    </div>
  );
}
