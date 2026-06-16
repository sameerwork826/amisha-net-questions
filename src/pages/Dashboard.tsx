import { Link } from "react-router-dom";
import { SYLLABUS } from "../data/syllabus";
import { ALL_QUESTIONS, countByPaper, countBySource } from "../data/questionBank";
import { overallStats, useProgress } from "../hooks/useProgress";

export default function Dashboard() {
  const progress = useProgress();
  const stats = overallStats(progress);
  const pyqCount = countBySource("pyq");
  const aiCount = countBySource("ai");

  return (
    <div className="space-y-7 animate-pop">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-7 text-white shadow-2xl shadow-indigo-600/30">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-fuchsia-300/20 blur-2xl" />
        <p className="relative text-sm font-medium text-indigo-100">
          Welcome back
        </p>
        <h1 className="relative mt-1 text-3xl font-black tracking-tight">
          Hi Amisha 👋
        </h1>
        <p className="relative mt-2 max-w-md text-indigo-100">
          Practise UGC NET Political Science — answer, get instant feedback with
          explanations, and watch your weak topics turn strong.
        </p>
        <div className="relative mt-5 flex flex-wrap gap-3">
          <Link
            to="/practice"
            className="rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:scale-[1.03]"
          >
            ⚡ Start practising
          </Link>
          <Link
            to="/mock"
            className="rounded-2xl bg-white/15 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/25"
          >
            ⏱️ Take a mock test
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Attempted" value={stats.attempted} icon="📝" />
        <Stat
          label="Accuracy"
          value={stats.attempted ? `${Math.round(stats.accuracy * 100)}%` : "—"}
          icon="🎯"
        />
        <Stat label="Mock tests" value={progress.mocks.length} icon="🏆" />
      </section>

      {/* Practice by source */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/practice?source=pyq"
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg transition hover:-translate-y-0.5"
        >
          <div className="text-2xl">⭐</div>
          <div className="mt-1 text-lg font-extrabold">Previous-year questions</div>
          <div className="text-sm text-amber-50/90">
            {pyqCount} real questions from past papers →
          </div>
        </Link>
        <Link
          to="/practice?source=ai"
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5 text-white shadow-lg transition hover:-translate-y-0.5"
        >
          <div className="text-2xl">✨</div>
          <div className="mt-1 text-lg font-extrabold">AI-generated practice</div>
          <div className="text-sm text-violet-50/90">
            {aiCount} questions across the full syllabus →
          </div>
        </Link>
      </section>

      <Link
        to="/papers"
        className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5"
      >
        <span className="flex items-center gap-2 font-semibold heading">
          📄 Past papers
        </span>
        <span className="text-sm muted">view &amp; download PDFs →</span>
      </Link>

      {/* Question bank */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold heading">Question bank</h2>
          <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
            {ALL_QUESTIONS.length} Qs · {pyqCount} past-paper
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SYLLABUS.map((p) => (
            <Link
              key={p.paper}
              to={`/practice?paper=${p.paper}`}
              className="group rounded-2xl border border-slate-200/70 bg-white/50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/50"
            >
              <div className="text-sm font-bold heading">
                Paper {p.paper}
              </div>
              <div className="gradient-text text-base font-extrabold">
                {p.title}
              </div>
              <div className="mt-1 text-xs muted">
                {p.units.length} units · {countByPaper(p.paper)} questions →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="card p-4 text-center">
      <div className="text-lg">{icon}</div>
      <div className="mt-1 text-2xl font-black gradient-text">{value}</div>
      <div className="mt-0.5 text-xs leading-tight muted">{label}</div>
    </div>
  );
}
