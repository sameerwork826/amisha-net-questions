# NET Prep · Political Science 💜

A practice platform for **Amisha** to prepare for the **UGC NET Political Science**
exam (Paper 1 + Paper 2). Questions appear one at a time; she answers and gets
instant feedback with an explanation, plus timed mock tests and progress tracking.

🔗 **Live:** https://amisha-net-questions.vercel.app

## Features
- ⚡ **Topic-wise practice** — pick a paper, unit (or all), with "PYQ only" and
  "skip attempted" filters.
- ✅ **Instant feedback + explanations** after every answer.
- ⏱️ **Timed mock tests** (25/50/100 Q) that mimic exam conditions, with a full
  review afterwards.
- 📊 **Progress tracking** — overall accuracy, per-unit strengths/weaknesses, and
  mock history (saved in the browser via `localStorage`).
- 🌙 **Dark mode** toggle.

## Question bank
Questions live as JSON under [src/data/questions/](src/data/questions/), auto-loaded
by [questionBank.ts](src/data/questionBank.ts). Two sources:
- **`PYQ <session>`** — real previous-year questions transcribed from official papers.
- **`Practice`** — questions authored around the official syllabus and recurring patterns.

The syllabus (both papers, verbatim from the official UGC/NTA PDFs) is in
[src/data/syllabus.ts](src/data/syllabus.ts).

### Adding more questions
Drop a new `.json` file anywhere under `src/data/questions/` (e.g.
`paper2/unit05.json`) containing an array of question objects — it is picked up
automatically. Schema (see [src/types.ts](src/types.ts)):

```jsonc
{
  "id": "p2-u5-0007",          // unique
  "paper": 2,                   // 1 or 2
  "unit": 5,                    // syllabus unit number
  "topic": "Theories of IR",
  "type": "mcq",                // mcq | assertion-reason | match | statements | chronological
  "question": "…",              // use \n for line breaks
  "options": ["…", "…", "…", "…"],
  "correctIndex": 1,            // 0-based index into options
  "explanation": "…",
  "source": "PYQ Jun 2024",     // or "Practice"
  "difficulty": "medium"        // easy | medium | hard
}
```

PYQ source PDFs were downloaded from adda247 (kept locally in `pyq-pdfs/`, not
shipped). The papers are scanned images, so questions are transcribed by reading
each page. Sources:
- https://www.adda247.com/teaching-jobs-exam/ugc-net-previous-year-question-papers/
- https://www.adda247.com/teaching-jobs-exam/ugc-net-2004-2025-questions-papers/

## Develop
```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## Deploy
Already linked to Vercel. To redeploy after changes:
```bash
npx vercel --prod --yes --scope sameerwanjari830-7209s-projects
```

## Tech
Vite · React + TypeScript · Tailwind CSS v4 · React Router · localStorage. No
backend — fully static, free to host.
