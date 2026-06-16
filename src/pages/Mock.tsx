import { useEffect, useMemo, useRef, useState } from "react";
import type { Paper, Question } from "../types";
import { getPaper } from "../data/syllabus";
import { buildMockSet, countByPaper } from "../data/questionBank";
import { progressActions } from "../hooks/useProgress";
import QuestionCard from "../components/QuestionCard";

type Phase = "setup" | "test" | "result";

const PRESETS = [
  { count: 25, minutes: 30 },
  { count: 50, minutes: 60 },
  { count: 100, minutes: 120 },
];

export default function Mock() {
  const [paper, setPaper] = useState<Paper>(2);
  const [preset, setPreset] = useState(PRESETS[1]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [pos, setPos] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const startedAt = useRef(0);

  const maxAvailable = countByPaper(paper);
  const count = Math.min(preset.count, maxAvailable);

  function start() {
    const set = buildMockSet(paper, count);
    if (set.length === 0) return;
    setQuestions(set);
    setAnswers(new Array(set.length).fill(null));
    setPos(0);
    setRemaining(preset.minutes * 60);
    startedAt.current = Date.now();
    setPhase("test");
  }

  useEffect(() => {
    if (phase !== "test") return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function record(i: number) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[pos] = i;
      return copy;
    });
  }

  function finish() {
    setPhase("result");
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    progressActions.recordMock({
      ts: Date.now(),
      paper,
      total: questions.length,
      correct,
      durationSec,
    });
    questions.forEach((q, i) => {
      progressActions.recordAnswer(q, answers[i] === q.correctIndex);
    });
  }

  const score = useMemo(
    () =>
      questions.reduce(
        (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
        0
      ),
    [questions, answers]
  );

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="space-y-5 animate-pop">
        <h1 className="text-2xl font-black heading">
          Timed <span className="gradient-text">mock test</span>
        </h1>
        <p className="text-sm muted">
          Exam-style: no feedback until you submit. A timer counts down and the
          test auto-submits when time runs out.
        </p>

        <Block label="Paper">
          {([2, 1] as Paper[]).map((p) => (
            <Pick key={p} active={paper === p} onClick={() => setPaper(p)}>
              Paper {p}: {getPaper(p)!.title}
            </Pick>
          ))}
        </Block>

        <Block label="Length">
          {PRESETS.map((pr) => (
            <Pick
              key={pr.count}
              active={preset.count === pr.count}
              onClick={() => setPreset(pr)}
            >
              {pr.count} Q · {pr.minutes} min
            </Pick>
          ))}
        </Block>

        <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 text-sm muted dark:border-white/10 dark:bg-white/5">
          {maxAvailable < preset.count
            ? `Only ${maxAvailable} questions available for this paper right now — the test will use all of them.`
            : `This test will have ${count} questions.`}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={maxAvailable === 0}
          className="btn-primary w-full sm:w-auto sm:px-12"
        >
          Start test →
        </button>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    const attempted = answers.filter((a) => a !== null).length;
    return (
      <div className="space-y-5 animate-pop">
        <div className="card p-8 text-center">
          <p className="text-sm font-medium muted">Test submitted</p>
          <p className="mt-2 text-6xl font-black gradient-text">
            {score}/{questions.length}
          </p>
          <p className="mt-1 muted">
            {pct}% · {attempted} attempted · {questions.length - attempted} skipped
          </p>
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="btn-primary mt-5 px-8"
          >
            New test
          </button>
        </div>

        <h2 className="pt-2 font-bold heading">Review</h2>
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i + 1}
              total={questions.length}
              mode="test"
              initialSelected={answers[i]}
              revealAnswer
            />
          ))}
        </div>
      </div>
    );
  }

  // ---------- TEST ----------
  const current = questions[pos];
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const lowTime = remaining <= 60;

  return (
    <div className="space-y-4">
      <div className="card sticky top-20 z-10 flex items-center justify-between px-4 py-2.5">
        <span className="text-sm font-bold muted">
          Q{pos + 1} / {questions.length}
        </span>
        <span
          className={`rounded-xl px-3 py-1 font-mono text-sm font-black ${
            lowTime
              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
              : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
          }`}
        >
          ⏱ {mm}:{ss}
        </span>
      </div>

      <QuestionCard
        key={current.id}
        question={current}
        index={pos + 1}
        total={questions.length}
        mode="test"
        initialSelected={answers[pos]}
        onAnswered={record}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPos((p) => Math.max(0, p - 1))}
          disabled={pos === 0}
          className="btn-ghost"
        >
          ← Prev
        </button>
        {pos + 1 < questions.length ? (
          <button
            type="button"
            onClick={() => setPos((p) => Math.min(questions.length - 1, p + 1))}
            className="btn-dark"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="btn bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Submit test
          </button>
        )}
      </div>

      <div className="card flex flex-wrap gap-1.5 p-3">
        {questions.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPos(i)}
            className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
              i === pos
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                : answers[i] !== null
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/20"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={finish}
        className="btn w-full border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
      >
        Submit test now
      </button>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-bold heading">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pick({
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
      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
          : "border-slate-200/80 bg-white/60 text-slate-700 hover:border-indigo-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-indigo-400/50"
      }`}
    >
      {children}
    </button>
  );
}
