export type Paper = 1 | 2;

export type QuestionType =
  | "mcq" // single best answer
  | "assertion-reason" // Assertion (A) + Reason (R)
  | "match" // Match List-I with List-II
  | "statements" // which of the statement(s) is/are correct
  | "chronological"; // arrange in correct order

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  /** Stable unique id, e.g. "p2-u4-0007" */
  id: string;
  paper: Paper;
  /** Syllabus unit number within the paper */
  unit: number;
  /** Finer topic tag, e.g. "Theories of IR" */
  topic: string;
  type: QuestionType;
  /** The question stem (may include A/R lines, lists, statements as text) */
  question: string;
  /** Exactly the answer choices shown to the user (NET uses 4) */
  options: string[];
  /** Index into `options` of the correct choice */
  correctIndex: number;
  /** Why the answer is correct — shown after answering */
  explanation: string;
  /** "PYQ Dec 2023" for verified previous-year, else "Practice" */
  source: string;
  difficulty: Difficulty;
}

export interface Unit {
  number: number;
  name: string;
  /** Topic tags used to label questions and filter practice */
  topics: string[];
}

export interface PaperSyllabus {
  paper: Paper;
  title: string;
  units: Unit[];
}
