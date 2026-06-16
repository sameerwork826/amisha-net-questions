import type { Paper } from "../types";
import { getPaper, SYLLABUS } from "../data/syllabus";
import {
  overallStats,
  progressActions,
  statsByUnit,
  statsForPaper,
  useProgress,
} from "../hooks/useProgress";
import { IconProgress } from "../components/icons";

export default function Progress() {
  const progress = useProgress();
  const overall = overallStats(progress);

  if (overall.attempted === 0 && progress.mocks.length === 0) {
    return (
      <div className="card p-12 text-center rise">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--panel-2)" }}
        >
          <IconProgress width={26} />
        </div>
        <p className="display mt-4 text-lg font-bold">No progress yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm t-muted">
          Answer some practice questions or take a mock test, and your stats will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7 rise">
      <h1 className="display text-2xl font-extrabold">Your progress</h1>

      <section className="grid grid-cols-3 gap-3 sm:gap-4">
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
              <h2 className="display font-bold">
                Paper {p.paper} · {p.title}
              </h2>
              <span className="badge badge-brand">
                {ps.correct}/{ps.attempted} · {Math.round(ps.accuracy * 100)}%
              </span>
            </div>
            <UnitBars paper={p.paper} progress={progress} />
          </section>
        );
      })}

      {progress.mocks.length > 0 ? (
        <section className="card p-5">
          <h2 className="display mb-4 font-bold">Mock test history</h2>
          <div className="flex flex-col">
            {[...progress.mocks]
              .reverse()
              .slice(0, 10)
              .map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b py-2.5 text-sm last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="t-muted">
                    {new Date(m.ts).toLocaleDateString()} · Paper {m.paper}
                  </span>
                  <span className="font-bold">
                    {m.correct}/{m.total}
                    <span className="t-faint"> ({Math.round((m.correct / m.total) * 100)}%)</span>
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
        className="text-sm font-semibold"
        style={{ color: "var(--danger)" }}
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
    <div className="mt-4 space-y-3">
      {units.map((u) => {
        const name = syllabus.units.find((x) => x.number === u.unit)?.name ?? "";
        const pct = Math.round(u.accuracy * 100);
        const color =
          pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
        return (
          <div key={u.unit}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="truncate pr-2 t-muted">
                U{u.unit}. {name}
              </span>
              <span className="shrink-0 font-bold">
                {u.correct}/{u.attempted} · {pct}%
              </span>
            </div>
            <div className="track">
              <div className="fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4 text-center sm:p-5">
      <div className="display text-2xl font-extrabold sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-medium t-faint">{label}</div>
    </div>
  );
}
