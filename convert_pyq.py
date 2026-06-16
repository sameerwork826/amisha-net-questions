"""Convert raw OCR question data -> final question-bank JSON.

Heuristics:
- paper: Q<=50 => Paper 1, else Paper 2
- unit/topic: inferred from keywords in the stem
- type: detected from option shape (match / chronological / statements / mcq)
- correctIndex: the recorded option from the paper (chosen - 1)
- light text cleanup for OCR's missing spaces
"""
import json, re, os
import wordninja


def demerge(s):
    """Re-split OCR-merged words (e.g. 'Whowrotethebook' -> 'Who wrote the book').
    Only long alpha runs are split, so normal words/proper nouns are untouched."""
    out = []
    for tok in s.split():
        core = re.sub(r"[^A-Za-z]", "", tok)
        if len(core) >= 12:
            out.append(" ".join(wordninja.split(tok)))
        else:
            out.append(tok)
    return " ".join(out)

SESSIONS = {
    "jun2025": "PYQ Jun 2025",
    "sep2024sh2": "PYQ Sep 2024 (Shift 2)",
    "jan2025": "PYQ Jan 2025",
    "sep2024sh1": "PYQ Sep 2024 (Shift 1)",
}

# --- unit keyword maps (priority order matters; first hit wins) ---
P2_UNITS = [
    (9, "Public Administration", ["bureaucr", "hawthorne", "taylor", "elton mayo", "posdcorb", "minnowbrook", "drucker", "herzberg", "likert", "maslow", "public administration", "organisation theory", "organization theory", "motivation", "scientific management", "chester barnard", "new public management", "administrative"]),
    (10, "Governance and Public Policy in India", ["governance", "right to information", " rti", "lokpal", "lokayukta", "niti aayog", "e-governance", "mnrega", "mgnrega", "nrega", "right to education", "citizen charter", "ombudsman", "social audit", "panchayati raj", "good governance", "accountab", "grievance"]),
    (6, "India's Foreign Policy", ["foreign policy", "non-align", "non align", "nam ", "panchsheel", "look east", "act east", "gujral", "nuclear policy", "saarc", "neighbour", "india's relation", "india-pakistan", "india and "]),
    (5, "International Relations", ["international relation", "realism", "idealism", "constructivis", "sovereignty", "united nations", "peacekeeping", " un ", "security", "globalis", "globaliz", " wto", "brics", "asean", "european union", "brexit", "treaty", "deterrence", "cold war", "warfare", "climate change", "refugee", "bretton woods", "g-20", "g20"]),
    (3, "Indian Political Thought", ["gandhi", "ambedkar", "nehru", "tilak", "savarkar", "aurobindo", "tagore", "kautilya", "arthashastra", "saptanga", "vivekanand", "lohia", "jayaprakash", "jaya prakash", "upadhyaya", "periyar", "iqbal", "m.n. roy", "kabir", "barani", "ramabai"]),
    (2, "Political Thought (Western)", ["plato", "aristotle", "hobbes", "locke", "rousseau", "machiavelli", "hegel", "j.s. mill", "john stuart mill", "gramsci", "arendt", "fanon", "rawls", "nozick", "wollstonecraft", "confucius", "totalitarian", "marx", "mao"]),
    (7, "Political Institutions in India", ["constitution", "article", "parliament", "president", "prime minister", "supreme court", "high court", "judiciary", "fundamental right", "directive principle", "fundamental dut", "amendment", "federal", "governor", "election commission", "finance commission", "preamble", "constituent assembly", "lok sabha", "rajya sabha", "schedule", "judicial", "speaker", "attorney"]),
    (8, "Political Processes in India", ["identity politics", "caste", "communal", "regionalis", "states reorganis", "reorganisation of states", "social movement", "dalit", "tribal", "farmers", "new economic policy", "liberalisation", "political part", "electoral politic", "coalition", "regional part"]),
    (4, "Comparative Political Analysis", ["comparative", "regime", "constitutionalism", "colonial", "decoloni", "nationalism", "dependency", "modernis", "world system", "party system", "elite", "behavioural", "polyarchy", "dahl", "huntington", "democratis", "civil society", "revolution", "development"]),
    (1, "Political Theory", ["liberty", "equality", "justice", "rights", "democracy", "power", "citizenship", "liberalism", "conservatism", "socialism", "marxis", "feminis", "ecolog", "multicultural", "postmodern", "ideology", "hegemony", "rule of law", "sovereign"]),
]

P1_UNITS = [
    (2, "Research Aptitude", ["research", "hypothesis", "sampling", "thesis", "plagiar", "variable", "methodolog", "questionnaire", "citation", "referenc"]),
    (6, "Logical Reasoning", ["syllogism", "fallac", "deductive", "inductive", "venn", "pramana", "anumana", "premise", "argument", "analog", "proposition"]),
    (5, "Mathematical Reasoning & Aptitude", ["series", "ratio", "percentage", "average", "what is the next", "code", "number", "fraction", "profit", "speed", "distance"]),
    (7, "Data Interpretation", ["pie chart", "histogram", "bar chart", "line chart", "data interpret", "graph", "table given", "tabulat"]),
    (8, "Information & Communication Technology (ICT)", ["ict", "internet", "computer", "url", "e-mail", "email", "software", "digital", "www", "intranet", "memory", "byte"]),
    (9, "People, Development & Environment", ["environment", "pollution", "climate", "sustainable", "sdg", "ecosystem", "disaster", "ozone", "biodiversity", "renewable", "carbon", "greenhouse"]),
    (4, "Communication", ["communication", "mass media", "verbal", "non-verbal", "feedback", "noise", "audience"]),
    (1, "Teaching Aptitude", ["teaching", "learner", "evaluation", "pedagog", "mooc", "swayam", "classroom", "curriculum"]),
    (10, "Higher Education System", ["university", "ugc", "higher education", "nep", "college", "scholarship", "deemed"]),
    (3, "Comprehension", ["passage", "comprehension"]),
]


def clean(s):
    s = s.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    s = demerge(s)                                      # fix OCR-merged words
    s = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", s)         # ThomasHobbes -> Thomas Hobbes
    s = re.sub(r"(?<=[A-Za-z])(?=\d)", " ", s)          # Article249 -> Article 249
    s = re.sub(r"(?<=\d)(?=[A-Za-z])", " ", s)          # 1924in -> 1924 in
    s = re.sub(r"(?<=[A-Za-z])(Only|only)\b", r" Only", s)  # EOnly -> E Only
    s = re.sub(r"(?<=[.,;:])(?=[A-Za-z0-9])", " ", s)   # space after punctuation
    s = re.sub(r"\s+", " ", s).strip()
    return s


COMMON = {"the", "of", "and", "which", "who", "is", "are", "was", "were",
          "following", "in", "to", "by", "for", "with", "from", "that", "what",
          "how", "an", "as", "on", "his", "book", "term", "wrote", "given",
          "between", "during", "their", "this", "these", "correct", "answer"}


CTX_DEP = re.compile(r"as per the (passage|paragraph|above|table|graph)|"
                     r"according to the (passage|paragraph|above|table|graph)|"
                     r"in the (passage|paragraph|given table)|from the (table|graph|data) (above|given)",
                     re.I)


def is_usable(stem, options):
    """Reject OCR gibberish (bilingual/garbled) and passage/data-dependent items.
    Keep clean, self-contained English stems."""
    if CTX_DEP.search(stem):                        # needs a passage/figure we don't have
        return False
    words = re.findall(r"[A-Za-z]+", stem)          # letter runs, ignore punctuation
    long = [w for w in words if len(w) >= 3]
    tokens = stem.split()
    if len(long) < 5:
        return False
    if len(long) / max(1, len(tokens)) < 0.45:       # too much number/symbol soup
        return False
    if len(COMMON.intersection(w.lower() for w in long)) < 2:
        return False
    if sum(1 for c in stem if ord(c) > 127) > 4:     # Devanagari/garble
        return False
    # options may be numeric (years), letter-combos (C,A,D,E,B) or text — just
    # reject ones that are garbled (heavy non-ASCII).
    for o in options:
        if sum(1 for c in o if ord(c) > 127) > 2:
            return False
    return True


def infer_unit(stem, paper):
    low = stem.lower()
    table = P1_UNITS if paper == 1 else P2_UNITS
    for num, name, kws in table:
        if any(k in low for k in kws):
            return num, name
    return (4, "Comparative Political Analysis") if paper == 2 else (1, "Teaching Aptitude")


def detect_type(stem, options):
    joined = " ".join(options)
    if re.search(r"[A-E]\s*-\s*(I|II|III|IV|V)\b", joined):
        return "match"
    if all(re.fullmatch(r"[A-E](\s*,\s*[A-E]){2,}", o.replace(" ", " ").strip()) for o in options if o):
        return "chronological"
    if re.search(r"\b[A-E]\s*[.)]", stem) and re.search(r"only|and", joined, re.I):
        return "statements"
    return "mcq"


total = 0
for key, label in SESSIONS.items():
    path = f"pyq-pages/raw/{key}.json"
    if not os.path.exists(path):
        print(f"{key}: raw not found, skipping")
        continue
    raw = json.load(open(path, encoding="utf-8"))
    out = []
    for r in raw:
        opts = [clean(o) for o in r["options"] if o and o.strip()]
        if len(opts) < 2:
            continue
        stem = clean(r["stem"])
        if len(stem) < 12:
            continue
        if not is_usable(stem, opts):
            continue
        paper = 1 if r["q"] <= 50 else 2
        # Paper 1 has data-interpretation/comprehension items that need a
        # chart/passage image OCR can't capture, so keep Paper 2 only.
        if paper != 2:
            continue
        # Skip questions already hand-verified to avoid duplicates.
        if key == "jun2025" and 51 <= r["q"] <= 58:
            continue
        if key == "jun2024" and 51 <= r["q"] <= 87:
            continue
        unit, uname = infer_unit(stem, paper)
        qtype = detect_type(stem, opts)
        chosen = r.get("chosen")
        ci = (chosen - 1) if isinstance(chosen, int) and 1 <= chosen <= len(opts) else 0
        tag = key.replace("jun", "jun").replace("sep", "sep").replace("jan", "jan")
        out.append({
            "id": f"pyq-{key}-{r['q']:03d}",
            "paper": paper,
            "unit": unit,
            "topic": uname,
            "type": qtype,
            "question": stem,
            "options": opts,
            "correctIndex": ci,
            "explanation": f"Recorded answer from the official UGC NET {label[4:]} Political Science paper.",
            "source": label,
            "difficulty": "medium",
        })
    json.dump(out, open(f"src/data/questions/pyq/auto-{key}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total += len(out)
    print(f"{key}: wrote {len(out)} questions")
print("TOTAL auto-imported:", total)
