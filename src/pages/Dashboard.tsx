import { Link } from "react-router-dom";
import { SYLLABUS } from "../data/syllabus";
import { ALL_QUESTIONS, countByPaper, countBySource } from "../data/questionBank";
import { overallStats, useProgress } from "../hooks/useProgress";
import { IconArrow, IconMock, IconPapers, IconPractice, IconSparkles, IconStar } from "../components/icons";

export default function Dashboard() {
  const progress = useProgress();
  const stats = overallStats(progress);
  const pyqCount = countBySource("pyq");
  const aiCount = countBySource("ai");

  return (
    <div className="space-y-8 rise">
      {/* Hero */}
      <section>
        <p className="text-sm font-semibold t-muted">Welcome back</p>
        <h1 className="display mt-1 text-3xl font-extrabold sm:text-4xl">
          Hi Amisha 👋
        </h1>
        <p className="mt-2 max-w-lg t-muted">
          Practise UGC NET Political Science, get instant feedback with
          explanations, and track where you’re improving.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/practice" className="btn btn-primary">
            <IconPractice width={18} /> Start practising
          </Link>
          <Link to="/mock" className="btn btn-secondary">
            <IconMock width={18} /> Take a mock test
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Attempted" value={stats.attempted} />
        <Stat
          label="Accuracy"
          value={stats.attempted ? `${Math.round(stats.accuracy * 100)}%` : "—"}
        />
        <Stat label="Mock tests" value={progress.mocks.length} />
      </section>

      {/* Practice modes */}
      <section>
        <h2 className="field-label mb-3">Choose your practice</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            to="/practice?source=pyq"
            icon={<IconStar width={20} />}
            tint="var(--warning)"
            title="Previous-year questions"
            sub={`${pyqCount} real questions from past papers`}
          />
          <ModeCard
            to="/practice?source=ai"
            icon={<IconSparkles width={20} />}
            tint="var(--brand)"
            title="AI-generated practice"
            sub={`${aiCount} questions across the full syllabus`}
          />
        </div>
      </section>

      {/* Papers */}
      <Link to="/papers" className="card card-hover flex items-center justify-between p-4">
        <span className="flex items-center gap-3 font-semibold">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "var(--panel-2)" }}
          >
            <IconPapers width={20} />
          </span>
          Past papers
        </span>
        <span className="flex items-center gap-1 text-sm t-muted">
          View &amp; download <IconArrow width={16} />
        </span>
      </Link>

      {/* Question bank by paper */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="field-label">Question bank</h2>
          <span className="badge badge-neutral">{ALL_QUESTIONS.length} questions</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SYLLABUS.map((p) => (
            <Link
              key={p.paper}
              to={`/practice?paper=${p.paper}`}
              className="card card-hover p-4"
            >
              <div className="text-xs font-semibold t-faint">Paper {p.paper}</div>
              <div className="display mt-0.5 text-lg font-bold">{p.title}</div>
              <div className="mt-2 flex items-center gap-1 text-xs t-muted">
                {p.units.length} units · {countByPaper(p.paper)} questions
                <IconArrow width={14} />
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
    <div className="card p-4 text-center sm:p-5">
      <div className="display text-2xl font-extrabold sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-medium t-faint">{label}</div>
    </div>
  );
}

function ModeCard({
  to,
  icon,
  tint,
  title,
  sub,
}: {
  to: string;
  icon: React.ReactNode;
  tint: string;
  title: string;
  sub: string;
}) {
  return (
    <Link to={to} className="card card-hover flex items-start gap-3 p-5">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: tint }}
      >
        {icon}
      </span>
      <span>
        <span className="display block font-bold">{title}</span>
        <span className="mt-0.5 block text-sm t-muted">{sub}</span>
      </span>
    </Link>
  );
}
