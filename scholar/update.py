#!/usr/bin/env python3
"""Regenerate scholar/publications.json from ORCID (the list of works) and
OpenAlex (citation counts, venues, authors). Standard library only.

Usage:  python3 scholar/update.py            (writes next to this script)
Exit code 0 always on success; the workflow commits only if the file changed.
"""
import json, os, re, sys, time, urllib.parse, urllib.request
from datetime import datetime, timezone

ORCID = "0000-0003-2469-6172"
SCHOLAR = "https://scholar.google.com/citations?user=L6HtnvkAAAAJ&hl=en"
SELF_NAME = "Vernon S. Brown"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "publications.json")
UA = "vebro.net-scholar-updater (+https://vebro.net/scholar/)"

TYPE_LABELS = {
    "journal-article": "Article", "article": "Article", "preprint": "Preprint",
    "dissertation-thesis": "Dissertation", "dissertation": "Dissertation",
    "research-technique": "Protocol", "book": "Book", "book-chapter": "Book chapter",
    "conference-paper": "Conference paper", "report": "Report", "dataset": "Dataset",
    "review": "Review", "other": "Other",
}


def get(url, accept="application/json", tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"Accept": accept, "User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if i == tries - 1:
                raise
        except Exception:
            if i == tries - 1:
                raise
        time.sleep(2 * (i + 1))


def norm_title(t):
    return re.sub(r"[^a-z0-9]+", " ", (t or "").lower()).strip()


def norm_doi(d):
    d = (d or "").strip().lower()
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", d) or None


def is_self(name, orcid=None):
    if orcid and ORCID in orcid:
        return True
    n = (name or "").lower()
    return bool(re.search(r"\bbrown\b", n) and re.search(r"(^|[\s,])v(ernon|\.|\b)", n))


def main():
    # ---- ORCID: the authoritative list of works -------------------------
    base = f"https://pub.orcid.org/v3.0/{ORCID}"
    person = get(base + "/person") or {}
    groups = (get(base + "/works") or {}).get("group", [])
    put_codes = [g["work-summary"][0]["put-code"] for g in groups]
    details = {}
    for i in range(0, len(put_codes), 100):
        chunk = ",".join(str(p) for p in put_codes[i:i + 100])
        for b in (get(f"{base}/works/{chunk}") or {}).get("bulk", []):
            w = b.get("work")
            if w:
                details[w["put-code"]] = w

    works = []
    for g in groups:
        s = g["work-summary"][0]
        dois = []
        for e in (g.get("external-ids") or {}).get("external-id", []):
            if e.get("external-id-type") == "doi":
                d = norm_doi(e.get("external-id-value"))
                if d and d not in dois:
                    dois.append(d)
        pd = s.get("publication-date") or {}
        y = (pd.get("year") or {}).get("value")
        m = (pd.get("month") or {}).get("value")
        dd = (pd.get("day") or {}).get("value")
        det = details.get(s["put-code"], {})
        authors = []
        for c in ((det.get("contributors") or {}).get("contributor") or []):
            role = (c.get("contributor-attributes") or {}).get("contributor-role")
            if role not in (None, "author"):
                continue
            nm = (c.get("credit-name") or {}).get("value")
            oc = (c.get("contributor-orcid") or {}).get("path")
            if nm:
                authors.append(SELF_NAME if is_self(nm, oc) else nm)
        url = (s.get("url") or {}).get("value")
        works.append({
            "title": s["title"]["title"]["value"].strip(),
            "year": int(y) if y else None,
            "date": "-".join(x for x in (y, m, dd) if x) or None,
            "orcid_type": s.get("type"),
            "venue": (s.get("journal-title") or {}).get("value"),
            "authors": authors,
            "dois": dois,
            "url": url,
            "orcid_put_code": s["put-code"],
            "openalex_ids": [],
            "cited_by": 0,
            "sources": ["ORCID"],
        })

    # ---- OpenAlex: enrich by DOI and by the ORCID author filter ---------
    oa = {}
    all_dois = [d for w in works for d in w["dois"]]
    for i in range(0, len(all_dois), 40):
        q = "|".join(all_dois[i:i + 40])
        r = get("https://api.openalex.org/works?per-page=100&filter=doi:" + urllib.parse.quote(q, safe="|:/"))
        for x in (r or {}).get("results", []):
            oa[x["id"]] = x
    found = {norm_doi(x.get("doi")) for x in oa.values()} | {norm_title(x.get("title")) for x in oa.values()}
    for w in works:  # single-DOI lookup catches records whose stored DOI is a different version
        if norm_title(w["title"]) in found or any(d in found for d in w["dois"]):
            continue
        for d in w["dois"]:
            x = get("https://api.openalex.org/works/doi:" + urllib.parse.quote(d, safe="/:"))
            if x and x.get("id"):
                oa[x["id"]] = x
                break
    r = get(f"https://api.openalex.org/works?per-page=200&filter=author.orcid:{ORCID}")
    for x in (r or {}).get("results", []):
        oa[x["id"]] = x
    author = get(f"https://api.openalex.org/authors/orcid:{ORCID}") or {}

    by_doi = {d: w for w in works for d in w["dois"]}
    by_title = {norm_title(w["title"]): w for w in works}
    unmatched = []
    for x in oa.values():
        d = norm_doi(x.get("doi"))
        w = by_doi.get(d) or by_title.get(norm_title(x.get("title")))
        if not w:
            unmatched.append(x)
            continue
        w["openalex_ids"].append(x["id"].rsplit("/", 1)[-1])
        w["cited_by"] = max(w["cited_by"], x.get("cited_by_count") or 0)  # max, not sum: avoid double counting versions
        if "OpenAlex" not in w["sources"]:
            w["sources"].append("OpenAlex")
        src = ((x.get("primary_location") or {}).get("source") or {}).get("display_name")
        if not w["venue"] and src:
            w["venue"] = re.sub(r"\s*\(CERN.*\)$", "", src)
        if not w["authors"]:
            w["authors"] = [SELF_NAME if is_self(a["author"]["display_name"], a["author"].get("orcid"))
                            else a["author"]["display_name"] for a in x.get("authorships", [])]
    # OpenAlex works credited to this ORCID that ORCID itself doesn't list
    for x in unmatched:
        if not any(ORCID in (a["author"].get("orcid") or "") for a in x.get("authorships", [])):
            continue
        src = ((x.get("primary_location") or {}).get("source") or {}).get("display_name")
        works.append({
            "title": x.get("title"), "year": x.get("publication_year"), "date": x.get("publication_date"),
            "orcid_type": x.get("type"), "venue": src,
            "authors": [SELF_NAME if is_self(a["author"]["display_name"], a["author"].get("orcid"))
                        else a["author"]["display_name"] for a in x.get("authorships", [])],
            "dois": [norm_doi(x.get("doi"))] if x.get("doi") else [], "url": None, "orcid_put_code": None,
            "openalex_ids": [x["id"].rsplit("/", 1)[-1]], "cited_by": x.get("cited_by_count") or 0,
            "sources": ["OpenAlex"],
        })

    for w in works:
        w["type"] = TYPE_LABELS.get(w.pop("orcid_type") or "other", "Other")
        if not w["authors"]:
            w["authors"] = [SELF_NAME]
        w["doi"] = w["dois"][0] if w["dois"] else None
        w["link"] = ("https://doi.org/" + w["doi"]) if w["doi"] else w["url"]
    works.sort(key=lambda w: (w["date"] or str(w["year"] or 0)), reverse=True)

    cites = sorted((w["cited_by"] for w in works), reverse=True)
    h = sum(1 for i, c in enumerate(cites, 1) if c >= i)
    name = ((person.get("name") or {}).get("credit-name") or {}).get("value") or SELF_NAME
    data = {
        "profile": {
            "name": name, "orcid": ORCID, "orcid_url": f"https://orcid.org/{ORCID}",
            "scholar_url": SCHOLAR, "openalex_author": (author.get("id") or "").rsplit("/", 1)[-1] or None,
            "links": [{"label": u.get("url-name"), "url": u["url"]["value"]}
                      for u in ((person.get("researcher-urls") or {}).get("researcher-url") or [])],
        },
        "metrics": {
            "works": len(works),
            "citations": sum(cites),
            "h_index": h,
            "i10_index": sum(1 for c in cites if c >= 10),
            "note": "Works from ORCID; citations and h-index computed from OpenAlex per-work counts.",
            "openalex_author_summary": {
                "works_count": author.get("works_count"), "cited_by_count": author.get("cited_by_count"),
                "h_index": (author.get("summary_stats") or {}).get("h_index"),
            },
        },
        "works": works,
    }
    # Only bump the timestamp if content changed, so the workflow doesn't commit noise.
    try:
        old = json.load(open(OUT))
    except Exception:
        old = {}
    body = {k: v for k, v in data.items()}
    if {k: old.get(k) for k in body} == body and old.get("generated"):
        print("publications.json unchanged")
        return
    data = {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), **data}
    with open(OUT, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"wrote {OUT}: {len(works)} works, {sum(cites)} citations, h={h}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # keep the old snapshot if an API is down
        print("update failed, keeping existing snapshot:", e, file=sys.stderr)
        sys.exit(1)
