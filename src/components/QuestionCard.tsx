import { useEffect, useState } from "react";
import type { Question } from "../types";
import { IconCheck, IconSparkles, IconStar, IconX } from "./icons";

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
  const isPyq = /^PYQ/i.test(question.source);

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
    <div className="card rise p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {index && total ? (
          <span className="text-xs font-bold t-faint">
            {String(index).padStart(2, "0")}
            <span className="t-faint"> / {total}</span>
          </span>
        ) : null}
        <span className="badge badge-neutral">{TYPE_LABEL[question.type]}</span>
        <span className="badge badge-neutral">Unit {question.unit}</span>
        {isPyq ? (
          <span className="badge badge-amber">
            <IconStar width={12} /> {question.source}
          </span>
        ) : (
          <span className="badge badge-violet">
            <IconSparkles width={12} /> AI-generated
          </span>
        )}
      </div>

      <p className="display whitespace-pre-line text-[1.05rem] font-semibold leading-relaxed">
        {question.question}
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isChosen = i === selected;
          let state = "";
          if (reveal) {
            if (isCorrect) state = "opt-correct";
            else if (isChosen) state = "opt-wrong";
            else state = "opt-dim";
          } else if (isChosen) state = "opt-selected";

          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={reveal}
              className={`opt ${state}`}
            >
              <span className="opt-key">{OPTION_LETTERS[i]}</span>
              <span className="whitespace-pre-line pt-0.5 text-sm leading-relaxed">
                {opt}
              </span>
              {reveal && isCorrect ? (
                <IconCheck width={18} className="ml-auto shrink-0" style={{ color: "var(--success)" }} />
              ) : null}
              {reveal && isChosen && !isCorrect ? (
                <IconX width={18} className="ml-auto shrink-0" style={{ color: "var(--danger)" }} />
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
          className="btn btn-primary mt-5 w-full sm:w-auto sm:px-9"
        >
          Check answer
        </button>
      ) : null}

      {reveal ? (
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{
            borderColor: isRight ? "var(--success)" : "var(--danger)",
            background: isRight ? "var(--success-soft)" : "var(--danger-soft)",
          }}
        >
          <p className="flex items-center gap-2 text-sm font-bold">
            {selected === null ? (
              "Not answered"
            ) : isRight ? (
              <>
                <IconCheck width={16} style={{ color: "var(--success)" }} /> Correct
              </>
            ) : (
              <>
                <IconX width={16} style={{ color: "var(--danger)" }} /> Incorrect
              </>
            )}
            <span className="font-medium t-muted">
              · Answer {OPTION_LETTERS[question.correctIndex]}
            </span>
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed t-muted">
            {question.explanation}
          </p>
        </div>
      ) : null}
    </div>
  );
}
