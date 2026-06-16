"""OCR-extract Sep 2024 Shift-1 (digital NTA response sheet). Saves raw OCR
text too, so re-parsing never needs re-OCR."""
import fitz, re, json, os
import numpy as np
from rapidocr_onnxruntime import RapidOCR

ocr = RapidOCR()
os.makedirs("pyq-pages/raw", exist_ok=True)

NAME, PATH, DPI = "sep2024sh1", "pyq-pdfs/polsci-sep2024-shift1.pdf", 200


def ocr_page(page):
    pix = page.get_pixmap(dpi=DPI)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    if pix.n == 4:
        img = img[:, :, :3]
    res, _ = ocr(img)
    return "\n".join(line[1] for line in res) if res else ""


def parse_questions(text):
    out = []
    parts = re.split(r"\bQ\.\s*(\d+)\b", text)  # same as the digital extractor
    for i in range(1, len(parts), 2):
        num = int(parts[i]); body = parts[i + 1]
        cm = re.search(r"Chosen Option\s*:\s*(\d+)", body)
        chosen = int(cm.group(1)) if cm else None
        cut = re.search(r"(Options\s*1\s*\.\s*1|Question Type|Question ID)", body)
        head = body[: cut.start()] if cut else body
        lines = [l.strip() for l in head.splitlines() if l.strip()]
        opts = {}; stem = []
        for l in lines:
            m = re.match(r"^([1-4])\s*[.)]\s*(.+)$", l)
            if m:
                opts[int(m.group(1))] = m.group(2).strip()
            elif not opts:
                stem.append(l)
        out.append({"q": num, "stem": " ".join(stem).strip(),
                    "options": [opts.get(k, "") for k in (1, 2, 3, 4)], "chosen": chosen})
    return out


doc = fitz.open(PATH)
full = []
for i in range(doc.page_count):
    full.append(ocr_page(doc[i]))
    if (i + 1) % 10 == 0:
        print(f"{NAME}: {i+1}/{doc.page_count}", flush=True)
text = "\n".join(full)
open(f"pyq-pages/raw/{NAME}.txt", "w", encoding="utf-8").write(text)
qs = parse_questions(text)
good = [q for q in qs if q["stem"] and sum(1 for o in q["options"] if o) >= 3]
json.dump(good, open(f"pyq-pages/raw/{NAME}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{NAME}: {len(good)}/{len(qs)} parsed", flush=True)
print("DONE", flush=True)
