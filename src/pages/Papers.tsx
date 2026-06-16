import { PAST_PAPERS } from "../data/papers";
import { IconDownload, IconExternal, IconPapers } from "../components/icons";

export default function Papers() {
  return (
    <div className="space-y-6 rise">
      <header>
        <h1 className="display text-2xl font-extrabold">Past papers</h1>
        <p className="mt-1 t-muted">
          Original UGC NET question papers — read online or download the PDF.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAST_PAPERS.map((p) => (
          <div key={p.file} className="card flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--panel-2)" }}
              >
                <IconPapers width={20} />
              </span>
              <div>
                <span className="badge badge-brand">{p.session}</span>
                {p.solved && (
                  <span className="badge badge-green ml-1.5">Answer key + solutions</span>
                )}
                <h2 className="display mt-1.5 font-bold leading-snug">{p.title}</h2>
                <p className="text-xs t-faint">{p.paper}</p>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <a
                href={p.file}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1"
              >
                <IconExternal width={17} /> Open
              </a>
              <a href={p.file} download className="btn btn-secondary flex-1">
                <IconDownload width={17} /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs t-faint">
        These papers are also bundled into the Practice and Mock question banks.
      </p>
    </div>
  );
}
