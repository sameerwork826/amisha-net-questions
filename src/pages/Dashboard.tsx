import { Link } from "react-router-dom";
import { SYLLABUS } from "../data/syllabus";
import { ALL_QUESTIONS, countByPaper, isPyq } from "../data/questionBank";
import { overallStats, useProgress } from "../hooks/useProgress";

export default function Dashboard() {
  const progress = useProgress();
  const stats = overallStats(progress);
  const pyqCount = ALL_QUESTIONS.filter(isPyq).length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Hi Amisha 👋</h1>
        <p className="mt-1 text-indigo-100">
          Practice UGC NET Political Science — answer, get instant feedback, and
          track where you’re getting stronger.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/practice"
            className="rounded-xl bg-white px-5 py-2.5 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            Start practising
          </Link>
          <Link
            to="/mock"
            className="rounded-xl bg-indigo-500/40 px-5 py-2.5 font-semibold text-white ring-1 ring-white/40 transition hover:bg-indigo-500/60"
          >
            Take a mock test
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="Questions attempted" value={stats.attempted} />
        <Stat
          label="Accuracy"
          value={stats.attempted ? `${Math.round(stats.accuracy * 100)}%` : "—"}
        />
        <Stat label="Mock tests" value={progress.mocks.length} />
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Question bank</h2>
          <span className="text-xs text-slate-500">
            {ALL_QUESTIONS.length} questions · {pyqCount} from past papers
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SYLLABUS.map((p) => (
            <Link
              key={p.paper}
              to={`/practice?paper=${p.paper}`}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40"
            >
              <div className="text-sm font-semibold text-slate-800">
                Paper {p.paper}: {p.title}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {p.units.length} units · {countByPaper(p.paper)} questions
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
      <div className="text-2xl font-bold text-indigo-700">{value}</div>
      <div className="mt-1 text-xs leading-tight text-slate-500">{label}</div>
    </div>
  );
}
