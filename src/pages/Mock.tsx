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

  // Countdown timer.
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
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-slate-900">Timed mock test</h1>
        <p className="text-sm text-slate-600">
          Exam-style: no feedback until you submit. A timer counts down; the test
          auto-submits when time runs out.
        </p>

        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">Paper</div>
          <div className="flex gap-2">
            {([2, 1] as Paper[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPaper(p)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  paper === p
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                }`}
              >
                Paper {p}: {getPaper(p)!.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">Length</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((pr) => (
              <button
                key={pr.count}
                type="button"
                onClick={() => setPreset(pr)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  preset.count === pr.count
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                }`}
              >
                {pr.count} Q · {pr.minutes} min
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
          {maxAvailable < preset.count
            ? `Only ${maxAvailable} questions available for this paper right now — the test will use all of them.`
            : `This test will have ${count} questions.`}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={maxAvailable === 0}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40 sm:w-auto sm:px-10"
        >
          Start test
        </button>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    const attempted = answers.filter((a) => a !== null).length;
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-500">Test submitted</p>
          <p className="mt-2 text-5xl font-bold text-indigo-700">
            {score}/{questions.length}
          </p>
          <p className="mt-1 text-slate-600">
            {pct}% · {attempted} attempted ·{" "}
            {questions.length - attempted} skipped
          </p>
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="mt-5 rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            New test
          </button>
        </div>

        <h2 className="pt-2 font-semibold text-slate-800">Review</h2>
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
      <div className="sticky top-[92px] z-10 flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
        <span className="text-sm font-medium text-slate-600">
          Q{pos + 1} / {questions.length}
        </span>
        <span
          className={`rounded-lg px-3 py-1 font-mono text-sm font-bold ${
            lowTime ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
          }`}
        >
          {mm}:{ss}
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
          className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
        >
          ← Prev
        </button>
        {pos + 1 < questions.length ? (
          <button
            type="button"
            onClick={() => setPos((p) => Math.min(questions.length - 1, p + 1))}
            className="rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
          >
            Submit test
          </button>
        )}
      </div>

      {/* Question navigator */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        {questions.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPos(i)}
            className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
              i === pos
                ? "bg-indigo-600 text-white"
                : answers[i] !== null
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={finish}
        className="w-full rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        Submit test now
      </button>
    </div>
  );
}
