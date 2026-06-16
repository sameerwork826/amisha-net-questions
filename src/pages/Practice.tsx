import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Paper, Question } from "../types";
import { getPaper } from "../data/syllabus";
import { buildPracticeSet, countByUnit } from "../data/questionBank";
import { attemptedIds, progressActions, useProgress } from "../hooks/useProgress";
import QuestionCard from "../components/QuestionCard";
import { IconArrow } from "../components/icons";

type Phase = "setup" | "session" | "done";

export default function Practice() {
  const [params] = useSearchParams();
  const initialPaper = (Number(params.get("paper")) === 1 ? 1 : 2) as Paper;
  const progress = useProgress();

  const initialSource =
    params.get("source") === "ai"
      ? "ai"
      : params.get("source") === "pyq"
        ? "pyq"
        : "all";

  const [paper, setPaper] = useState<Paper>(initialPaper);
  const [unit, setUnit] = useState<number | "all">("all");
  const [source, setSource] = useState<"all" | "pyq" | "ai">(initialSource);
  const [skipAttempted, setSkipAttempted] = useState(false);

  const [phase, setPhase] = useState<Phase>("setup");
  const [queue, setQueue] = useState<Question[]>([]);
  const [pos, setPos] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const syllabus = getPaper(paper)!;

  const available = useMemo(() => {
    return buildPracticeSet({
      paper,
      unit: unit === "all" ? undefined : unit,
      source: source === "all" ? undefined : source,
      excludeIds: skipAttempted ? attemptedIds(progress) : undefined,
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, unit, source, skipAttempted, progress.attempts.length]);

  function start() {
    const set = buildPracticeSet(
      {
        paper,
        unit: unit === "all" ? undefined : unit,
        source: source === "all" ? undefined : source,
        excludeIds: skipAttempted ? attemptedIds(progress) : undefined,
      },
      20
    );
    if (set.length === 0) return;
    setQueue(set);
    setPos(0);
    setCorrectCount(0);
    setAnswered(false);
    setPhase("session");
  }

  function handleAnswered(_i: number, correct: boolean) {
    setAnswered(true);
    if (correct) setCorrectCount((c) => c + 1);
    progressActions.recordAnswer(queue[pos], correct);
  }

  function next() {
    if (pos + 1 >= queue.length) {
      setPhase("done");
      return;
    }
    setPos((p) => p + 1);
    setAnswered(false);
  }

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="space-y-7 rise">
        <header>
          <h1 className="display text-2xl font-extrabold">Topic-wise practice</h1>
          <p className="mt-1 t-muted">Pick a paper, unit and source, then begin.</p>
        </header>

        <Field label="Paper">
          <div className="seg">
            {([2, 1] as Paper[]).map((p) => (
              <Seg
                key={p}
                active={paper === p}
                onClick={() => {
                  setPaper(p);
                  setUnit("all");
                }}
              >
                Paper {p} · {getPaper(p)!.title}
              </Seg>
            ))}
          </div>
        </Field>

        <Field label="Source">
          <div className="seg">
            <Seg active={source === "all"} onClick={() => setSource("all")}>
              All
            </Seg>
            <Seg active={source === "pyq"} onClick={() => setSource("pyq")}>
              ⭐ Previous-year
            </Seg>
            <Seg active={source === "ai"} onClick={() => setSource("ai")}>
              ✨ AI-generated
            </Seg>
          </div>
        </Field>

        <Field label="Unit">
          <div className="flex flex-wrap gap-2">
            <Pill active={unit === "all"} onClick={() => setUnit("all")}>
              All units
            </Pill>
            {syllabus.units.map((u) => (
              <Pill
                key={u.number}
                active={unit === u.number}
                onClick={() => setUnit(u.number)}
              >
                {u.number}. {u.name}
                <span className="t-faint"> ({countByUnit(paper, u.number)})</span>
              </Pill>
            ))}
          </div>
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            className="checkbox"
            checked={skipAttempted}
            onChange={(e) => setSkipAttempted(e.target.checked)}
          />
          Skip questions I’ve already attempted
        </label>

        <div className="inset flex items-center justify-between p-4">
          <span className="text-sm t-muted">
            <span className="font-bold" style={{ color: "var(--text)" }}>
              {available}
            </span>{" "}
            question{available === 1 ? "" : "s"} match · session uses up to 20
          </span>
        </div>

        <button
          type="button"
          onClick={start}
          disabled={available === 0}
          className="btn btn-primary w-full sm:w-auto sm:px-10"
        >
          Start practice <IconArrow width={18} />
        </button>
      </div>
    );
  }

  // ---------- DONE ----------
  if (phase === "done") {
    const pct = Math.round((correctCount / queue.length) * 100);
    const msg = pct >= 70 ? "Brilliant work 🎉" : pct >= 40 ? "Good going 💪" : "Keep practising 🌱";
    return (
      <div className="space-y-5 text-center rise">
        <div className="card p-10">
          <p className="field-label">Session complete</p>
          <p className="display mt-3 text-6xl font-extrabold">
            {correctCount}
            <span className="t-faint">/{queue.length}</span>
          </p>
          <p className="mt-2 t-muted">{pct}% correct · {msg}</p>
        </div>
        <button type="button" onClick={() => setPhase("setup")} className="btn btn-primary px-8">
          New session
        </button>
      </div>
    );
  }

  // ---------- SESSION ----------
  const current = queue[pos];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="track">
          <div
            className="fill"
            style={{ width: `${((pos + (answered ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold t-faint">
          {pos + 1}/{queue.length}
        </span>
      </div>

      <QuestionCard
        key={current.id}
        question={current}
        index={pos + 1}
        total={queue.length}
        mode="practice"
        onAnswered={handleAnswered}
      />

      {answered ? (
        <button type="button" onClick={next} className="btn btn-secondary w-full sm:w-auto sm:px-9">
          {pos + 1 >= queue.length ? "Finish session" : "Next question"}
          <IconArrow width={18} />
        </button>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="field-label mb-2.5">{label}</div>
      {children}
    </div>
  );
}

function Seg({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={`seg-item ${active ? "seg-item-active" : ""}`}>
      {children}
    </button>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border px-3 py-1.5 text-sm font-semibold transition"
      style={
        active
          ? { background: "var(--brand-soft)", borderColor: "transparent", color: "var(--brand-soft-text)" }
          : { background: "var(--panel)", borderColor: "var(--border)", color: "var(--text-2)" }
      }
    >
      {children}
    </button>
  );
}
