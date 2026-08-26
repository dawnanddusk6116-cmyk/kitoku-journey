#!/usr/bin/env python3
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV_FILES = [
    Path("/Users/takenorikawakami/Downloads/twentyfour-solar-terms-1924-1947.csv"),
    Path("/Users/takenorikawakami/Downloads/twentyfour-solar-terms-1948-2064.csv"),
]

SEKKI_TERMS = {
    "小寒": 1,
    "立春": 2,
    "啓蟄": 3,
    "清明": 4,
    "立夏": 5,
    "芒種": 6,
    "小暑": 7,
    "立秋": 8,
    "白露": 9,
    "寒露": 10,
    "立冬": 11,
    "大雪": 12,
}

# Preserve the current production values for 2020-2028.
EXISTING_2020_2028 = {
    2020: {1: 6, 2: 4, 3: 5, 4: 4, 5: 5, 6: 5, 7: 7, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7},
    2021: {1: 5, 2: 3, 3: 5, 4: 5, 5: 5, 6: 5, 7: 7, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7},
    2022: {1: 5, 2: 4, 3: 6, 4: 5, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8, 11: 7, 12: 7},
    2023: {1: 6, 2: 4, 3: 6, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 8, 10: 8, 11: 8, 12: 7},
    2024: {1: 6, 2: 4, 3: 5, 4: 4, 5: 5, 6: 5, 7: 6, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7},
    2025: {1: 5, 2: 3, 3: 5, 4: 4, 5: 5, 6: 5, 7: 7, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7},
    2026: {1: 5, 2: 4, 3: 5, 4: 5, 5: 5, 6: 6, 7: 7, 8: 7, 9: 8, 10: 8, 11: 7, 12: 7},
    2027: {1: 5, 2: 4, 3: 6, 4: 5, 5: 6, 6: 6, 7: 7, 8: 7, 9: 7, 10: 8, 11: 7, 12: 7},
    2028: {1: 6, 2: 4, 3: 5, 4: 4, 5: 5, 6: 5, 7: 6, 8: 7, 9: 7, 10: 7, 11: 7, 12: 6},
}

DEFAULT_DAYS = "{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:7,9:8,10:8,11:7,12:7}"


def parse_day(value):
    return int(str(value).split("/")[-1])


def build_db():
    db = {}
    for path in CSV_FILES:
        with path.open(newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                term = row["節気名"]
                if term not in SEKKI_TERMS:
                    continue
                year = int(row["年（西暦）"])
                month = SEKKI_TERMS[term]
                db.setdefault(year, {})[month] = parse_day(row["新暦日付"])
    for year, months in EXISTING_2020_2028.items():
        db[year] = dict(months)
    missing = [
        (year, month)
        for year in range(1924, 2065)
        for month in range(1, 13)
        if db.get(year, {}).get(month) is None
    ]
    if missing:
        raise RuntimeError(f"Missing SEKKI entries: {missing[:10]}")
    return db


def js_object(obj):
    years = []
    for year in sorted(obj):
        months = ",".join(f"{month}:{obj[year][month]}" for month in range(1, 13))
        years.append(f"{year}:{{{months}}}")
    return "{" + ",".join(years) + "}"


def warn_getter(name, db_name):
    return (
        f"function {name}(y,m){{"
        f"if({db_name}[y]&&{db_name}[y][m])return {db_name}[y][m];"
        f"const A={DEFAULT_DAYS};"
        f"const key=y+'-'+m;"
        f"{name}._warned={name}._warned||{{}};"
        f"if(!{name}._warned[key]&&typeof console!=='undefined'&&console.warn){{"
        f"console.warn('[KITOKU] SEKKI_DB range missing; fallback used',{{year:y,month:m}});"
        f"{name}._warned[key]=true;"
        f"}}"
        f"return A[m]||1;"
        f"}}"
    )


def replace_var_db(content, var_name, declaration, db_literal):
    pattern = re.compile(rf"{declaration} {var_name}=\{{.*?\}};")
    match = pattern.search(content)
    if not match:
        return content, 0
    old = match.group(0)
    new = f"{declaration} {var_name}={db_literal};"
    return content.replace(old, new), 1


def replace_function(content, name, new_func):
    db_name = "ASTRO_SEKKI_DB" if name == "astroSekkiDay" else "SEKKI_DB"
    old_variants = [
        f"function {name}(y,m){{if({db_name}[y])return {db_name}[y][m];const A={DEFAULT_DAYS};return A[m];}}",
        f"function {name}(y,m){{if({db_name}[y])return {db_name}[y][m];return{DEFAULT_DAYS}[m];}}",
        f"function {name}(y,m){{return ({db_name}[y]&&{db_name}[y][m])||SEKKI_DAYS[m]||1;}}",
    ]
    for old in old_variants:
        if old in content:
            return content.replace(old, new_func), 1
    return content, 0


def update_cache(content):
    old = "const KITOKU_CACHE = 'kitoku-pwa-v6-saved-places-v20260826-guide-scent-copy';"
    new = "const KITOKU_CACHE = 'kitoku-pwa-v6-saved-places-v20260826-sekki-db-1924-2064';"
    if old not in content:
        raise RuntimeError("Current KITOKU_CACHE name was not found")
    return content.replace(old, new)


def main():
    db = build_db()
    db_literal = js_object(db)
    targets = [
        ("kitoku-engine.js", "SEKKI_DB", "const", "getSekkiDay"),
        ("direction_v2.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("business.html", "SEKKI_DB", "var", "getSekkiDay"),
        ("relations.html", "SEKKI_DB", "var", "getSekkiDay"),
        ("kitoku-badge.js", "SEKKI_DB", "var", "getSekkiDay"),
        ("triple_board.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("roadmap.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("today.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("ai.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("scent.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("mindmap.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("my_kitoku.html", "SEKKI_DB", "const", "getSekkiDay"),
        ("astro64.html", "ASTRO_SEKKI_DB", "const", "astroSekkiDay"),
        ("en/index.html", "SEKKI_DB", "const", "sekkiDay"),
    ]
    changed = []
    for rel, var_name, declaration, fn_name in targets:
        path = ROOT / rel
        content = path.read_text(encoding="utf-8")
        content, db_count = replace_var_db(content, var_name, declaration, db_literal)
        content, fn_count = replace_function(content, fn_name, warn_getter(fn_name, var_name))
        if db_count != 1 or fn_count != 1:
            raise RuntimeError(f"{rel}: replacement count db={db_count}, fn={fn_count}")
        path.write_text(content, encoding="utf-8")
        changed.append(rel)

    sw = ROOT / "kitoku-sw.js"
    sw.write_text(update_cache(sw.read_text(encoding="utf-8")), encoding="utf-8")
    print(f"SEKKI_DB years: {min(db)}-{max(db)} ({len(db)} years)")
    print("Updated files:")
    for rel in changed + ["kitoku-sw.js"]:
        print(f"- {rel}")


if __name__ == "__main__":
    main()
