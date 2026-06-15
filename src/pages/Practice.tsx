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
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Topic-wise practice</h1>

        <Field label="Paper">
          <div className="flex gap-2">
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
                <span className="ml-1 text-xs opacity-70">
                  ({countByUnit(paper, u.number)})
                </span>
              </Choice>
            ))}
          </div>
        </Field>

        <div className="flex flex-col gap-2">
          <Toggle checked={pyqOnly} onChange={setPyqOnly}>
            Previous-year questions only
          </Toggle>
          <Toggle checked={skipAttempted} onChange={setSkipAttempted}>
            Skip questions I’ve already attempted
          </Toggle>
        </div>

        <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          {available} matching question{available === 1 ? "" : "s"} available.
          A session uses up to 20, in random order.
        </div>

        <button
          type="button"
          onClick={start}
          disabled={available === 0}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40 sm:w-auto sm:px-10"
        >
          Start
        </button>
      </div>
    );
  }

  // ---------- DONE ----------
  if (phase === "done") {
    const pct = Math.round((correctCount / queue.length) * 100);
    return (
      <div className="space-y-5 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">Session complete</p>
          <p className="mt-2 text-5xl font-bold text-indigo-700">
            {correctCount}/{queue.length}
          </p>
          <p className="mt-1 text-slate-600">{pct}% correct</p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            New session
          </button>
        </div>
      </div>
    );
  }

  // ---------- SESSION ----------
  const current = queue[pos];
  return (
    <div className="space-y-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-indigo-600 transition-all"
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
        <button
          type="button"
          onClick={next}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 sm:w-auto sm:px-10"
        >
          {pos + 1 >= queue.length ? "Finish" : "Next question →"}
        </button>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-700">{label}</div>
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
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-indigo-500 bg-indigo-600 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
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
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
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
