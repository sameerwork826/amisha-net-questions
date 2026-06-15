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
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <p className="text-lg font-semibold text-slate-700">No progress yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Answer some practice questions or take a mock test, and your stats will
          show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Your progress</h1>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Attempted" value={overall.attempted} />
        <Stat label="Correct" value={overall.correct} />
        <Stat label="Accuracy" value={`${Math.round(overall.accuracy * 100)}%`} />
      </section>

      {SYLLABUS.map((p) => {
        const ps = statsForPaper(progress, p.paper);
        if (ps.attempted === 0) return null;
        return (
          <section
            key={p.paper}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                Paper {p.paper}: {p.title}
              </h2>
              <span className="text-sm text-slate-500">
                {ps.correct}/{ps.attempted} · {Math.round(ps.accuracy * 100)}%
              </span>
            </div>
            <UnitBars paper={p.paper} progress={progress} />
          </section>
        );
      })}

      {progress.mocks.length > 0 ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 font-semibold text-slate-800">Mock test history</h2>
          <div className="space-y-2">
            {[...progress.mocks]
              .reverse()
              .slice(0, 10)
              .map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="text-slate-600">
                    {new Date(m.ts).toLocaleDateString()} · Paper {m.paper}
                  </span>
                  <span className="font-semibold text-slate-800">
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
        className="text-sm font-medium text-rose-600 hover:text-rose-700"
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
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span className="truncate pr-2">
                U{u.unit}. {name}
              </span>
              <span className="shrink-0 font-medium">
                {u.correct}/{u.attempted} · {pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
      <div className="text-2xl font-bold text-indigo-700">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
