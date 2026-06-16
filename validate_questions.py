"""Validate the whole question bank: unique ids, in-range answers, non-empty
options, sane fields. Run after converting/adding questions."""
import json, glob, sys

ids = set()
problems = []
total = 0
by_paper = {1: 0, 2: 0}
by_unit = {}

for f in sorted(glob.glob("src/data/questions/**/*.json", recursive=True)):
    try:
        arr = json.load(open(f, encoding="utf-8"))
    except Exception as e:
        problems.append(f"{f}: invalid JSON ({e})")
        continue
    for q in arr:
        total += 1
        qid = q.get("id")
        if not qid or qid in ids:
            problems.append(f"{f}: duplicate/missing id {qid!r}")
        ids.add(qid)
        opts = q.get("options", [])
        if len(opts) < 2:
            problems.append(f"{qid}: <2 options")
        if any(not str(o).strip() for o in opts):
            problems.append(f"{qid}: empty option")
        ci = q.get("correctIndex")
        if not isinstance(ci, int) or ci < 0 or ci >= len(opts):
            problems.append(f"{qid}: correctIndex {ci} out of range")
        if q.get("paper") not in (1, 2):
            problems.append(f"{qid}: bad paper {q.get('paper')}")
        else:
            by_paper[q["paper"]] += 1
        if len(str(q.get("question", "")).strip()) < 10:
            problems.append(f"{qid}: stem too short")
        key = (q.get("paper"), q.get("unit"))
        by_unit[key] = by_unit.get(key, 0) + 1

print(f"TOTAL questions: {total}")
print(f"Paper 1: {by_paper[1]} | Paper 2: {by_paper[2]}")
print("Per-unit counts (paper, unit): count")
for k in sorted(by_unit, key=lambda x: (x[0] or 0, x[1] or 0)):
    print(f"  P{k[0]} U{k[1]}: {by_unit[k]}")
print(f"\nPROBLEMS: {len(problems)}")
for p in problems[:40]:
    print("  -", p)
sys.exit(1 if problems else 0)
