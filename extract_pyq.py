"""OCR-extract questions from the digital (text-as-image) UGC NET PDFs.

Outputs one JSON per PDF into pyq-pages/raw/<name>.json, each a list of:
  { "q": <num>, "stem": "...", "options": ["..","..","..",".."], "chosen": <1-4|null> }

The actual correct answer and unit tagging are added later (by hand/review);
'chosen' is the candidate's marked option (NOT a verified key).
"""
import fitz, re, json, os, sys
import numpy as np
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
os.makedirs("pyq-pages/raw", exist_ok=True)

PDFS = {
    "jun2025": "pyq-pdfs/polsci-jun2025.pdf",
    "sep2024sh2": "pyq-pdfs/polsci-sep2024-shift2.pdf",
    "jan2025": "pyq-pdfs/polsci-jan2025-answerkey.pdf",
}


def ocr_page(page):
    pix = page.get_pixmap(dpi=150)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    if pix.n == 4:
        img = img[:, :, :3]
    res, _ = ocr(img)
    if not res:
        return ""
    return "\n".join(line[1] for line in res)


def parse_questions(text):
    """Split OCR text into per-question records."""
    out = []
    # Split on Q.<num>
    parts = re.split(r"\bQ\.\s*(\d+)\b", text)
    # parts[0] is preamble; then pairs (num, body)
    for i in range(1, len(parts), 2):
        num = int(parts[i])
        body = parts[i + 1]
        # chosen option
        cm = re.search(r"Chosen Option\s*:\s*(\d+)", body)
        chosen = int(cm.group(1)) if cm else None
        # cut body at the "Options 1. 1" / "Question Type" metadata block
        cut = re.search(r"(Options\s*1\s*\.\s*1|Question Type|Question ID)", body)
        head = body[: cut.start()] if cut else body
        lines = [l.strip() for l in head.splitlines() if l.strip()]
        # options are trailing lines beginning with 1. 2. 3. 4.
        opts = {}
        stem_lines = []
        for l in lines:
            m = re.match(r"^([1-4])\s*[.)]\s*(.+)$", l)
            if m:
                opts[int(m.group(1))] = m.group(2).strip()
            else:
                # continuation of previous option or stem
                if opts and not stem_lines_done(opts, l):
                    pass
                stem_lines.append(l) if not opts else None
        options = [opts.get(k, "") for k in (1, 2, 3, 4)]
        out.append({
            "q": num,
            "stem": " ".join(stem_lines).strip(),
            "options": options,
            "chosen": chosen,
        })
    return out


def stem_lines_done(opts, l):
    return False


for name, path in PDFS.items():
    doc = fitz.open(path)
    alltext = []
    for i in range(doc.page_count):
        t = ocr_page(doc[i])
        alltext.append(t)
        if (i + 1) % 10 == 0:
            print(f"{name}: OCR'd {i+1}/{doc.page_count}", flush=True)
    full = "\n".join(alltext)
    qs = parse_questions(full)
    # keep only well-formed (has stem + >=3 options)
    good = [q for q in qs if q["stem"] and sum(1 for o in q["options"] if o) >= 3]
    json.dump(good, open(f"pyq-pages/raw/{name}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{name}: {len(good)}/{len(qs)} questions parsed -> pyq-pages/raw/{name}.json", flush=True)

print("DONE", flush=True)
