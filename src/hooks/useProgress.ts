import { useSyncExternalStore } from "react";
import type { Paper, Question } from "../types";

const STORAGE_KEY = "net-prep-progress-v1";

export interface AttemptLog {
  id: string; // question id
  paper: Paper;
  unit: number;
  correct: boolean;
  ts: number;
}

export interface MockRecord {
  ts: number;
  paper: Paper;
  total: number;
  correct: number;
  durationSec: number;
}

export interface ProgressState {
  attempts: AttemptLog[];
  mocks: MockRecord[];
}

const EMPTY: ProgressState = { attempts: [], mocks: [] };

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      attempts: parsed.attempts ?? [],
      mocks: parsed.mocks ?? [],
    };
  } catch {
    return EMPTY;
  }
}

// --- tiny external store so all components stay in sync ---
let state: ProgressState = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / unavailable — ignore */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

// Keep other tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      emit();
    }
  });
}

export const progressActions = {
  recordAnswer(question: Question, correct: boolean) {
    state = {
      ...state,
      attempts: [
        ...state.attempts,
        {
          id: question.id,
          paper: question.paper,
          unit: question.unit,
          correct,
          ts: Date.now(),
        },
      ],
    };
    persist();
  },
  recordMock(record: MockRecord) {
    state = { ...state, mocks: [...state.mocks, record] };
    persist();
  },
  reset() {
    state = EMPTY;
    persist();
  },
};

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// ---------- derived selectors ----------

export interface PaperStats {
  attempted: number;
  correct: number;
  accuracy: number; // 0..1
}

export function overallStats(s: ProgressState): PaperStats {
  const attempted = s.attempts.length;
  const correct = s.attempts.filter((a) => a.correct).length;
  return { attempted, correct, accuracy: attempted ? correct / attempted : 0 };
}

export function statsForPaper(s: ProgressState, paper: Paper): PaperStats {
  const list = s.attempts.filter((a) => a.paper === paper);
  const correct = list.filter((a) => a.correct).length;
  return {
    attempted: list.length,
    correct,
    accuracy: list.length ? correct / list.length : 0,
  };
}

export interface UnitStat extends PaperStats {
  unit: number;
}

export function statsByUnit(s: ProgressState, paper: Paper): UnitStat[] {
  const map = new Map<number, { attempted: number; correct: number }>();
  for (const a of s.attempts) {
    if (a.paper !== paper) continue;
    const cur = map.get(a.unit) ?? { attempted: 0, correct: 0 };
    cur.attempted += 1;
    if (a.correct) cur.correct += 1;
    map.set(a.unit, cur);
  }
  return [...map.entries()]
    .map(([unit, v]) => ({
      unit,
      attempted: v.attempted,
      correct: v.correct,
      accuracy: v.attempted ? v.correct / v.attempted : 0,
    }))
    .sort((a, b) => a.unit - b.unit);
}

/** Set of question ids the user has answered at least once. */
export function attemptedIds(s: ProgressState): Set<string> {
  return new Set(s.attempts.map((a) => a.id));
}
