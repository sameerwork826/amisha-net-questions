import { PAST_PAPERS } from "../data/papers";

export default function Papers() {
  return (
    <div className="space-y-5 animate-pop">
      <div>
        <h1 className="text-2xl font-black heading">
          Past <span className="gradient-text">papers</span>
        </h1>
        <p className="mt-1 text-sm muted">
          Original UGC NET question papers. Open to read online or download the PDF.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAST_PAPERS.map((p) => (
          <div key={p.file} className="card flex flex-col gap-3 p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <span className="chip bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
                  {p.session}
                </span>
              </div>
              <h2 className="mt-2 font-bold heading">{p.title}</h2>
              <p className="text-xs muted">{p.paper}</p>
            </div>
            <div className="mt-auto flex gap-2">
              <a
                href={p.file}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-center"
              >
                Open
              </a>
              <a
                href={p.file}
                download
                className="btn-ghost flex-1 text-center"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs muted">
        Tip: practise these as question sets in the{" "}
        <span className="font-semibold">Practice</span> and{" "}
        <span className="font-semibold">Mock</span> tabs — they already include
        questions from these papers.
      </p>
    </div>
  );
}
