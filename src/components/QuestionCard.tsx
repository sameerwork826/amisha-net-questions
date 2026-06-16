import { useEffect, useState } from "react";
import type { Question } from "../types";

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "Multiple Choice",
  "assertion-reason": "Assertion & Reason",
  match: "Match the Following",
  statements: "Statements",
  chronological: "Arrange in Order",
};

interface Props {
  question: Question;
  index?: number;
  total?: number;
  mode: "practice" | "test";
  initialSelected?: number | null;
  revealAnswer?: boolean;
  onAnswered?: (selectedIndex: number, correct: boolean) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({
  question,
  index,
  total,
  mode,
  initialSelected = null,
  revealAnswer = false,
  onAnswered,
}: Props) {
  const [selected, setSelected] = useState<number | null>(initialSelected);
  const [submitted, setSubmitted] = useState(revealAnswer);

  useEffect(() => {
    setSelected(initialSelected);
    setSubmitted(revealAnswer);
  }, [question.id, initialSelected, revealAnswer]);

  const reveal = submitted || revealAnswer;
  const isRight = selected === question.correctIndex;

  function choose(i: number) {
    if (reveal) return;
    setSelected(i);
    if (mode === "test") onAnswered?.(i, i === question.correctIndex);
  }

  function submit() {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onAnswered?.(selected, selected === question.correctIndex);
  }

  return (
    <div className="card animate-pop p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        {index && total ? (
          <span className="font-bold muted">
            Q{index}/{total}
          </span>
        ) : null}
        <span className="chip bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
          {TYPE_LABEL[question.type]}
        </span>
        <span className="chip bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          Unit {question.unit}
        </span>
        {/^PYQ/i.test(question.source) ? (
          <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
            ⭐ {question.source}
          </span>
        ) : null}
      </div>

      <p className="whitespace-pre-line text-base leading-relaxed heading">
        {question.question}
      </p>

      <div className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isChosen = i === selected;

          let cls =
            "border-slate-200/80 bg-white/60 hover:border-indigo-400 hover:bg-indigo-50/60 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/60 dark:hover:bg-indigo-400/10";
          if (reveal) {
            if (isCorrect)
              cls =
                "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300 dark:border-emerald-400/60 dark:bg-emerald-400/10 dark:ring-emerald-400/40";
            else if (isChosen)
              cls =
                "border-rose-400 bg-rose-50 ring-1 ring-rose-300 dark:border-rose-400/60 dark:bg-rose-400/10 dark:ring-rose-400/40";
            else cls = "border-slate-200/70 bg-white/40 opacity-60 dark:border-white/10 dark:bg-white/5";
          } else if (isChosen) {
            cls =
              "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-400/10 dark:ring-indigo-400/40";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={reveal}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${cls}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {OPTION_LETTERS[i]}
              </span>
              <span className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                {opt}
              </span>
              {reveal && isCorrect ? (
                <span className="ml-auto font-bold text-emerald-600 dark:text-emerald-400">
                  ✓
                </span>
              ) : null}
              {reveal && isChosen && !isCorrect ? (
                <span className="ml-auto font-bold text-rose-600 dark:text-rose-400">
                  ✕
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {mode === "practice" && !reveal ? (
        <button
          type="button"
          onClick={submit}
          disabled={selected === null}
          className="btn-primary mt-5 w-full sm:w-auto sm:px-10"
        >
          Check answer
        </button>
      ) : null}

      {reveal ? (
        <div
          className={`mt-5 rounded-2xl border p-4 ${
            isRight
              ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-400/30 dark:bg-emerald-400/10"
              : "border-rose-200 bg-rose-50/80 dark:border-rose-400/30 dark:bg-rose-400/10"
          }`}
        >
          <p className="text-sm font-bold heading">
            {selected === null
              ? "⏳ Not answered"
              : isRight
                ? "✅ Correct!"
                : "❌ Incorrect"}
            <span className="font-medium muted">
              {"  "}· Answer: {OPTION_LETTERS[question.correctIndex]}
            </span>
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {question.explanation}
          </p>
        </div>
      ) : null}
    </div>
  );
}
