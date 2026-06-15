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
  /** Question N of M (optional, for headers) */
  index?: number;
  total?: number;
  /**
   * Practice mode: reveal correctness + explanation immediately after the user
   * submits. Test mode: just record the selection, no reveal.
   */
  mode: "practice" | "test";
  /** Pre-selected option (e.g. when reviewing a submitted test). */
  initialSelected?: number | null;
  /** In test mode (or review), force showing the answer. */
  revealAnswer?: boolean;
  /** Called when the user locks in an answer. */
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

  // Reset internal state when the question changes.
  useEffect(() => {
    setSelected(initialSelected);
    setSubmitted(revealAnswer);
  }, [question.id, initialSelected, revealAnswer]);

  const reveal = submitted || revealAnswer;

  function choose(i: number) {
    if (reveal) return;
    setSelected(i);
    if (mode === "test") {
      // In a test, selecting records the answer (changeable until submit).
      onAnswered?.(i, i === question.correctIndex);
    }
  }

  function submit() {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onAnswered?.(selected, selected === question.correctIndex);
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2 text-xs">
        {index && total ? (
          <span className="font-semibold text-slate-500">
            Q{index} / {total}
          </span>
        ) : null}
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
          {TYPE_LABEL[question.type]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
          Unit {question.unit}
        </span>
        {/^PYQ/i.test(question.source) ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
            {question.source}
          </span>
        ) : null}
      </div>

      <p className="whitespace-pre-line text-base leading-relaxed text-slate-900">
        {question.question}
      </p>

      <div className="mt-4 space-y-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isChosen = i === selected;

          let cls =
            "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40";
          if (reveal) {
            if (isCorrect)
              cls = "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300";
            else if (isChosen)
              cls = "border-rose-400 bg-rose-50 ring-1 ring-rose-300";
            else cls = "border-slate-200 bg-white opacity-70";
          } else if (isChosen) {
            cls = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={reveal}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${cls}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                {OPTION_LETTERS[i]}
              </span>
              <span className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                {opt}
              </span>
              {reveal && isCorrect ? (
                <span className="ml-auto text-emerald-600">✓</span>
              ) : null}
              {reveal && isChosen && !isCorrect ? (
                <span className="ml-auto text-rose-600">✕</span>
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
          className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
        >
          Check answer
        </button>
      ) : null}

      {reveal ? (
        <div
          className={`mt-5 rounded-xl border p-4 ${
            selected === question.correctIndex
              ? "border-emerald-200 bg-emerald-50"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <p className="text-sm font-semibold">
            {selected === null
              ? "Not answered"
              : selected === question.correctIndex
                ? "Correct!"
                : "Incorrect"}
            <span className="font-normal text-slate-600">
              {"  "}Answer: {OPTION_LETTERS[question.correctIndex]}
            </span>
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {question.explanation}
          </p>
        </div>
      ) : null}
    </div>
  );
}
