import type { Difficulty, Paper, Question } from "../types";

// Auto-load every question file under ./questions/**. Drop a new JSON file in
// (e.g. questions/paper2/unit05.json) and it is picked up automatically — no
// code change needed. Each file must export (be) an array of Question objects.
const modules = import.meta.glob<Question[]>("./questions/**/*.json", {
  eager: true,
  import: "default",
});

export const ALL_QUESTIONS: Question[] = Object.values(modules).flat();

if (import.meta.env.DEV) {
  // Catch duplicate ids early during development.
  const seen = new Set<string>();
  for (const q of ALL_QUESTIONS) {
    if (seen.has(q.id)) console.warn(`Duplicate question id: ${q.id}`);
    seen.add(q.id);
  }
}

export interface QuestionFilter {
  paper?: Paper;
  unit?: number;
  topic?: string;
  difficulty?: Difficulty;
  /** "pyq" = previous-year only, "ai" = AI-generated only, undefined = all */
  source?: "pyq" | "ai";
  /** Exclude ids the user has already attempted */
  excludeIds?: Set<string>;
}

export function filterQuestions(filter: QuestionFilter = {}): Question[] {
  return ALL_QUESTIONS.filter((q) => {
    if (filter.paper !== undefined && q.paper !== filter.paper) return false;
    if (filter.unit !== undefined && q.unit !== filter.unit) return false;
    if (filter.topic !== undefined && q.topic !== filter.topic) return false;
    if (filter.difficulty !== undefined && q.difficulty !== filter.difficulty)
      return false;
    if (filter.source === "pyq" && !isPyq(q)) return false;
    if (filter.source === "ai" && isPyq(q)) return false;
    if (filter.excludeIds && filter.excludeIds.has(q.id)) return false;
    return true;
  });
}

export function isPyq(q: Question): boolean {
  return /^PYQ/i.test(q.source.trim());
}

export function countBySource(kind: "pyq" | "ai"): number {
  return ALL_QUESTIONS.filter((q) => (kind === "pyq" ? isPyq(q) : !isPyq(q)))
    .length;
}

/** Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a randomized practice set. */
export function buildPracticeSet(
  filter: QuestionFilter,
  limit?: number
): Question[] {
  const pool = shuffle(filterQuestions(filter));
  return limit ? pool.slice(0, limit) : pool;
}

/**
 * Build a mock test: spread questions across the paper's units when possible,
 * then shuffle the final order.
 */
export function buildMockSet(paper: Paper, count: number): Question[] {
  const pool = filterQuestions({ paper });
  const byUnit = new Map<number, Question[]>();
  for (const q of pool) {
    if (!byUnit.has(q.unit)) byUnit.set(q.unit, []);
    byUnit.get(q.unit)!.push(q);
  }
  for (const list of byUnit.values()) {
    list.sort(() => Math.random() - 0.5);
  }

  // Round-robin across units for balanced coverage.
  const picked: Question[] = [];
  const units = shuffle([...byUnit.keys()]);
  let added = true;
  while (picked.length < count && added) {
    added = false;
    for (const u of units) {
      const list = byUnit.get(u)!;
      const next = list.shift();
      if (next) {
        picked.push(next);
        added = true;
        if (picked.length >= count) break;
      }
    }
  }
  return shuffle(picked);
}

export function countByPaper(paper: Paper): number {
  return filterQuestions({ paper }).length;
}

export function countByUnit(paper: Paper, unit: number): number {
  return filterQuestions({ paper, unit }).length;
}
