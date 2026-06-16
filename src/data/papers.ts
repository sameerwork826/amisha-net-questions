export interface PastPaper {
  title: string;
  session: string;
  paper:
    | "Paper 2 (Political Science)"
    | "Paper 1 (General)"
    | "Paper 1 + Paper 2 (Full exam)";
  /** Full URL to the PDF. */
  file: string;
  /** True when the PDF includes the answer key + explained solutions. */
  solved?: boolean;
}

// PDFs are hosted as assets on the repo's "papers" GitHub release instead of in
// /public, so they don't count against the Vercel deployment size limit.
const BASE =
  "https://github.com/sameerwork826/amisha-net-questions/releases/download/papers";

// Original UGC NET question papers + PW.live previous-year papers (the PW set
// bundles the General Paper 1 section and the Political Science Paper 2 section,
// and includes the official answer key with explained solutions).
export const PAST_PAPERS: PastPaper[] = [
  // ---- Most recent ----
  {
    title: "UGC NET Political Science",
    session: "June 2025",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2025.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science (Answer Key)",
    session: "January 2025",
    paper: "Paper 2 (Political Science)",
    file: `${BASE}/ugc-net-polsci-jan2025.pdf`,
  },
  {
    title: "UGC NET Political Science",
    session: "December 2024",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_dec2024.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science — Shift 1",
    session: "September 2024",
    paper: "Paper 2 (Political Science)",
    file: `${BASE}/ugc-net-polsci-sep2024-shift1.pdf`,
  },
  {
    title: "UGC NET Political Science — Shift 2",
    session: "September 2024",
    paper: "Paper 2 (Political Science)",
    file: `${BASE}/ugc-net-polsci-sep2024-shift2.pdf`,
  },
  {
    title: "UGC NET Political Science (Re-Exam)",
    session: "June 2024",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2024.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "December 2023",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_dec2023.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "June 2023",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2023.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "December 2022",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_dec2022.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "June 2022",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2022.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "December 2021",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_dec2021.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "June 2020",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2020.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "December 2019",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_dec2019.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "June 2019",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2019.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "December 2018",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_dec2018.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "June 2018",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jun2018.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Political Science",
    session: "July 2016",
    paper: "Paper 1 + Paper 2 (Full exam)",
    file: `${BASE}/pw_polsci_jul2016.pdf`,
    solved: true,
  },
  {
    title: "UGC NET Paper 1 (General)",
    session: "December 2025",
    paper: "Paper 1 (General)",
    file: `${BASE}/ugc-net-paper1-dec2025.pdf`,
  },
];
