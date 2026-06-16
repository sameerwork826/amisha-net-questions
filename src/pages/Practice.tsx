import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Paper, Question } from "../types";
import { getPaper } from "../data/syllabus";
import { buildPracticeSet, countByUnit } from "../data/questionBank";
import { attemptedIds, progressActions, useProgress } from "../hooks/useProgress";
import QuestionCard from "../components/QuestionCard";

type Phase = "setup" | "session" | "done";

export default function Practice() {
  const [params] = useSearchParams();
  const initialPaper = (Number(params.get("paper")) === 1 ? 1 : 2) as Paper;
  const progress = useProgress();

  const [paper, setPaper] = useState<Paper>(initialPaper);
  const [unit, setUnit] = useState<number | "all">("all");
  const [pyqOnly, setPyqOnly] = useState(false);
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
      pyqOnly,
      excludeIds: skipAttempted ? attemptedIds(progress) : undefined,
    }).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, unit, pyqOnly, skipAttempted, progress.attempts.length]);

  function start() {
    const set = buildPracticeSet(
      {
        paper,
        unit: unit === "all" ? undefined : unit,
        pyqOnly,
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
      <div className="space-y-5 animate-pop">
        <h1 className="text-2xl font-black heading">
          Topic-wise <span className="gradient-text">practice</span>
        </h1>

        <Field label="Paper">
          <div className="flex flex-wrap gap-2">
            {([2, 1] as Paper[]).map((p) => (
              <Choice
                key={p}
                active={paper === p}
                onClick={() => {
                  setPaper(p);
                  setUnit("all");
                }}
              >
                Paper {p}: {getPaper(p)!.title}
              </Choice>
            ))}
          </div>
        </Field>

        <Field label="Unit">
          <div className="flex flex-wrap gap-2">
            <Choice active={unit === "all"} onClick={() => setUnit("all")}>
              All units
            </Choice>
            {syllabus.units.map((u) => (
              <Choice
                key={u.number}
                active={unit === u.number}
                onClick={() => setUnit(u.number)}
              >
                {u.number}. {u.name}
                <span className="ml-1 opacity-70">
                  ({countByUnit(paper, u.number)})
                </span>
              </Choice>
            ))}
          </div>
        </Field>

        <div className="flex flex-col gap-2">
          <Toggle checked={pyqOnly} onChange={setPyqOnly}>
            ⭐ Previous-year questions only
          </Toggle>
          <Toggle checked={skipAttempted} onChange={setSkipAttempted}>
            Skip questions I’ve already attempted
          </Toggle>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 text-sm muted dark:border-white/10 dark:bg-white/5">
          <span className="font-bold gradient-text">{available}</span> matching
          question{available === 1 ? "" : "s"} available · a session uses up to
          20, in random order.
        </div>

        <button
          type="button"
          onClick={start}
          disabled={available === 0}
          className="btn-primary w-full sm:w-auto sm:px-12"
        >
          Start →
        </button>
      </div>
    );
  }

  // ---------- DONE ----------
  if (phase === "done") {
    const pct = Math.round((correctCount / queue.length) * 100);
    const msg = pct >= 70 ? "Brilliant! 🎉" : pct >= 40 ? "Good going 💪" : "Keep practising 🌱";
    return (
      <div className="space-y-5 text-center animate-pop">
        <div className="card p-8">
          <p className="text-sm font-medium muted">Session complete</p>
          <p className="mt-2 text-6xl font-black gradient-text">
            {correctCount}/{queue.length}
          </p>
          <p className="mt-1 muted">{pct}% correct · {msg}</p>
        </div>
        <button type="button" onClick={() => setPhase("setup")} className="btn-primary px-8">
          New session
        </button>
      </div>
    );
  }

  // ---------- SESSION ----------
  const current = queue[pos];
  return (
    <div className="space-y-4">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300"
          style={{ width: `${((pos + (answered ? 1 : 0)) / queue.length) * 100}%` }}
        />
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
        <button type="button" onClick={next} className="btn-dark w-full sm:w-auto sm:px-10">
          {pos + 1 >= queue.length ? "Finish" : "Next question →"}
        </button>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold heading">{label}</div>
      {children}
    </div>
  );
}

function Choice({
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
      className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
          : "border-slate-200/80 bg-white/60 text-slate-700 hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-400/50"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      {children}
    </label>
  );
}
