export interface PastPaper {
  title: string;
  session: string;
  paper: "Paper 2 (Political Science)" | "Paper 1 (General)";
  file: string; // under /papers/
}

// Original UGC NET question papers (with recorded responses), served from /public.
export const PAST_PAPERS: PastPaper[] = [
  {
    title: "UGC NET Political Science",
    session: "June 2025",
    paper: "Paper 2 (Political Science)",
    file: "/papers/ugc-net-polsci-jun2025.pdf",
  },
  {
    title: "UGC NET Political Science — Shift 1",
    session: "September 2024",
    paper: "Paper 2 (Political Science)",
    file: "/papers/ugc-net-polsci-sep2024-shift1.pdf",
  },
  {
    title: "UGC NET Political Science — Shift 2",
    session: "September 2024",
    paper: "Paper 2 (Political Science)",
    file: "/papers/ugc-net-polsci-sep2024-shift2.pdf",
  },
  {
    title: "UGC NET Political Science",
    session: "June 2024",
    paper: "Paper 2 (Political Science)",
    file: "/papers/ugc-net-polsci-jun2024.pdf",
  },
  {
    title: "UGC NET Political Science (Answer Key)",
    session: "January 2025",
    paper: "Paper 2 (Political Science)",
    file: "/papers/ugc-net-polsci-jan2025.pdf",
  },
  {
    title: "UGC NET Paper 1 (General)",
    session: "December 2025",
    paper: "Paper 1 (General)",
    file: "/papers/ugc-net-paper1-dec2025.pdf",
  },
];
