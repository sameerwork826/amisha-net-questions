import { useEffect, useMemo, useRef, useState } from "react";
import type { Paper, Question } from "../types";
import { getPaper } from "../data/syllabus";
import { buildMockSet, countByPaper } from "../data/questionBank";
import { progressActions } from "../hooks/useProgress";
import QuestionCard from "../components/QuestionCard";
import { IconArrow, IconMock } from "../components/icons";

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
      <div className="space-y-7 rise">
        <header>
          <h1 className="display text-2xl font-extrabold">Timed mock test</h1>
          <p className="mt-1 t-muted">
            Exam-style: no feedback until you submit. The test auto-submits when
            time runs out.
          </p>
        </header>

        <Field label="Paper">
          <div className="seg">
            {([2, 1] as Paper[]).map((p) => (
              <Seg key={p} active={paper === p} onClick={() => setPaper(p)}>
                Paper {p} · {getPaper(p)!.title}
              </Seg>
            ))}
          </div>
        </Field>

        <Field label="Length">
          <div className="seg">
            {PRESETS.map((pr) => (
              <Seg key={pr.count} active={preset.count === pr.count} onClick={() => setPreset(pr)}>
                {pr.count} Q · {pr.minutes} min
              </Seg>
            ))}
          </div>
        </Field>

        <div className="inset p-4 text-sm t-muted">
          {maxAvailable < preset.count
            ? `Only ${maxAvailable} questions available for this paper — the test will use all of them.`
            : `This test will have ${count} questions.`}
        </div>

        <button
          type="button"
          onClick={start}
          disabled={maxAvailable === 0}
          className="btn btn-primary w-full sm:w-auto sm:px-10"
        >
          <IconMock width={18} /> Start test
        </button>
      </div>
    );
  }

  // ---------- RESULT ----------
  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    const attempted = answers.filter((a) => a !== null).length;
    return (
      <div className="space-y-5 rise">
        <div className="card p-8 text-center">
          <p className="field-label">Test submitted</p>
          <p className="display mt-3 text-6xl font-extrabold">
            {score}
            <span className="t-faint">/{questions.length}</span>
          </p>
          <p className="mt-2 t-muted">
            {pct}% · {attempted} attempted · {questions.length - attempted} skipped
          </p>
          <button type="button" onClick={() => setPhase("setup")} className="btn btn-primary mt-5 px-8">
            New test
          </button>
        </div>

        <h2 className="field-label">Review</h2>
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
      <div className="card sticky top-16 z-10 flex items-center justify-between px-4 py-2.5 lg:top-4">
        <span className="text-sm font-bold t-muted">
          Question {pos + 1} / {questions.length}
        </span>
        <span
          className="rounded-lg px-3 py-1 font-mono text-sm font-bold"
          style={{
            background: lowTime ? "var(--danger-soft)" : "var(--panel-2)",
            color: lowTime ? "var(--danger)" : "var(--text)",
          }}
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
          className="btn btn-secondary"
        >
          Prev
        </button>
        {pos + 1 < questions.length ? (
          <button
            type="button"
            onClick={() => setPos((p) => Math.min(questions.length - 1, p + 1))}
            className="btn btn-secondary"
          >
            Next <IconArrow width={18} />
          </button>
        ) : (
          <button type="button" onClick={finish} className="btn btn-success">
            Submit test
          </button>
        )}
      </div>

      {/* Question navigator */}
      <div className="card flex flex-wrap gap-1.5 p-3">
        {questions.map((_, i) => {
          const done = answers[i] !== null;
          const cur = i === pos;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPos(i)}
              className="h-8 w-8 rounded-lg text-xs font-bold transition"
              style={
                cur
                  ? { background: "var(--brand)", color: "#fff" }
                  : done
                    ? { background: "var(--success-soft)", color: "var(--success)" }
                    : { background: "var(--panel-2)", color: "var(--text-3)" }
              }
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={finish} className="btn btn-secondary w-full">
        Submit test now
      </button>
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
