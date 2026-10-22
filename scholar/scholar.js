/* vebro.net/scholar: render publications.json, then try a live refresh
   from ORCID + OpenAlex (both CORS-enabled). Falls back to the snapshot. */
(function () {
  "use strict";
  var ORCID = "0000-0003-2469-6172";
  var SELF = "Vernon S. Brown";
  var TYPES = { "journal-article": "Article", article: "Article", preprint: "Preprint",
    "dissertation-thesis": "Dissertation", dissertation: "Dissertation", "research-technique": "Protocol",
    book: "Book", "book-chapter": "Book chapter", "conference-paper": "Conference paper",
    report: "Report", dataset: "Dataset", review: "Review", other: "Other" };
  var $ = function (id) { return document.getElementById(id); };
  var state = { works: [], generated: null, live: false };

  function normT(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function normD(d) { return d ? String(d).trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "") : null; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hl(s, q) {
    s = esc(s); if (!q) return s;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/&/g, "&amp;") + ")", "ig");
    return s.replace(re, "<mark>$1</mark>");
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return iso; }
  }
  function getJSON(url, ms) {
    var ctl = "AbortController" in window ? new AbortController() : null;
    var t = ctl && setTimeout(function () { ctl.abort(); }, ms || 8000);
    return fetch(url, { headers: { Accept: "application/json" }, signal: ctl && ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .finally(function () { if (t) clearTimeout(t); });
  }

  function metrics() {
    var c = state.works.map(function (w) { return w.cited_by || 0; }).sort(function (a, b) { return b - a; });
    var h = 0; c.forEach(function (v, i) { if (v >= i + 1) h = i + 1; });
    $("m-works").textContent = state.works.length;
    $("m-cites").textContent = c.reduce(function (a, b) { return a + b; }, 0);
    $("m-h").textContent = h;
  }

  function fillFilters() {
    var years = {}, types = {};
    state.works.forEach(function (w) { if (w.year) years[w.year] = 1; types[w.type] = 1; });
    var fy = $("fy"), ft = $("ft"), vy = fy.value, vt = ft.value;
    fy.length = 1; ft.length = 1;
    Object.keys(years).sort().reverse().forEach(function (y) { fy.add(new Option(y, y)); });
    Object.keys(types).sort().forEach(function (t) { ft.add(new Option(t, t)); });
    fy.value = vy; ft.value = vt;
  }

  function render() {
    var q = $("q").value.trim(), ql = q.toLowerCase(), y = $("fy").value, t = $("ft").value;
    var list = state.works.filter(function (w) {
      if (y && String(w.year) !== y) return false;
      if (t && w.type !== t) return false;
      if (!ql) return true;
      return [w.title, w.venue, w.doi, w.type, (w.authors || []).join(" ")].join(" ").toLowerCase().indexOf(ql) > -1;
    });
    var groups = {};
    list.forEach(function (w) { (groups[w.year || "Undated"] = groups[w.year || "Undated"] || []).push(w); });
    var keys = Object.keys(groups).sort(function (a, b) { return (+b || 0) - (+a || 0); });
    $("count").textContent = list.length === state.works.length
      ? "Showing all " + list.length + " works"
      : "Showing " + list.length + " of " + state.works.length + " works";
    if (!list.length) { $("list").innerHTML = '<p class="empty">No publications match your filters.</p>'; return; }
    $("list").innerHTML = keys.map(function (k) {
      return '<section class="year" aria-labelledby="y-' + k + '"><h3 id="y-' + k + '">' + k + '</h3><ol class="pub-list">' +
        groups[k].map(function (w) {
          var title = w.link ? '<a href="' + esc(w.link) + '" rel="noopener">' + hl(w.title, q) + "</a>" : hl(w.title, q);
          var authors = (w.authors || []).map(function (a) { return a === SELF ? "<strong>" + esc(a) + "</strong>" : hl(a, q); }).join(", ");
          var meta = ['<span class="tag">' + esc(w.type) + "</span>"];
          if (w.venue) meta.push('<span class="venue">' + hl(w.venue, q) + "</span>");
          if (w.year) meta.push("<span>" + w.year + "</span>");
          if (w.doi) meta.push('<a class="doi" href="https://doi.org/' + esc(w.doi) + '" rel="noopener">doi:' + hl(w.doi, q) + "</a>");
          var n = w.cited_by || 0;
          return '<li class="pub"><h4>' + title + "</h4>" +
            '<p class="authors">' + authors + "</p>" +
            '<p class="meta">' + meta.join('<span aria-hidden="true">&middot;</span>') + "</p>" +
            '<p class="cites" title="Citations via OpenAlex"><b>' + n + "</b><span>" + (n === 1 ? "citation" : "citations") + "</span></p></li>";
        }).join("") + "</ol></section>";
    }).join("");
  }

  function status(msg) { $("status").textContent = msg; }
  function refreshAll() { metrics(); fillFilters(); render(); }

  // ---- live refresh ---------------------------------------------------
  function liveRefresh() {
    var byDoi = {}, byTitle = {};
    function index() {
      byDoi = {}; byTitle = {};
      state.works.forEach(function (w) { (w.dois || [w.doi]).forEach(function (d) { if (d) byDoi[normD(d)] = w; }); byTitle[normT(w.title)] = w; });
    }
    index();
    var dois = Object.keys(byDoi).slice(0, 50).join("|");
    var oaBase = "https://api.openalex.org/works?per-page=100&select=id,doi,title,publication_year,publication_date,type,cited_by_count,primary_location,authorships&filter=";
    var reqs = [
      getJSON("https://pub.orcid.org/v3.0/" + ORCID + "/works").catch(function () { return null; }),
      getJSON(oaBase + "author.orcid:" + ORCID).catch(function () { return null; }),
      dois ? getJSON(oaBase + "doi:" + dois).catch(function () { return null; }) : Promise.resolve(null)
    ];
    return Promise.all(reqs).then(function (r) {
      var orcid = r[0], oa = [].concat((r[1] && r[1].results) || [], (r[2] && r[2].results) || []);
      if (!orcid && !oa.length) throw new Error("offline");
      var changed = false;
      // New works on ORCID that the snapshot doesn't have yet
      ((orcid && orcid.group) || []).forEach(function (g) {
        var s = g["work-summary"][0], title = s.title && s.title.title && s.title.title.value;
        var ds = ((g["external-ids"] || {})["external-id"] || []).filter(function (e) { return e["external-id-type"] === "doi"; })
          .map(function (e) { return normD(e["external-id-value"]); });
        if (!title || byTitle[normT(title)] || ds.some(function (d) { return byDoi[d]; })) return;
        var pd = s["publication-date"] || {}, y = pd.year && pd.year.value;
        state.works.push({ title: title, year: y ? +y : null, date: y, type: TYPES[s.type] || "Other",
          venue: s["journal-title"] && s["journal-title"].value, authors: [SELF], dois: ds, doi: ds[0] || null,
          link: ds[0] ? "https://doi.org/" + ds[0] : (s.url && s.url.value), cited_by: 0 });
        changed = true;
      });
      index();
      // Citation counts (max across versions, like the nightly script)
      oa.forEach(function (x) {
        var w = byDoi[normD(x.doi)] || byTitle[normT(x.title)];
        if (!w) return;
        var n = x.cited_by_count || 0;
        if (n > (w.cited_by || 0)) { w.cited_by = n; changed = true; }
        if (!w.venue && x.primary_location && x.primary_location.source) w.venue = x.primary_location.source.display_name;
      });
      state.works.sort(function (a, b) { return String(b.date || b.year || "").localeCompare(String(a.date || a.year || "")); });
      if (changed) refreshAll();
      status("Live data checked " + fmtDate(new Date().toISOString()));
    });
  }

  ["q", "fy", "ft"].forEach(function (id) { $(id).addEventListener("input", render); });

  getJSON("publications.json", 10000).then(function (d) {
    state.works = d.works || []; state.generated = d.generated;
    refreshAll();
    status(d.generated ? "Snapshot " + fmtDate(d.generated) : "");
  }).catch(function () {
    $("list").innerHTML = '<p class="empty">Couldn\u2019t load the saved list. Trying live sources\u2026</p>';
  }).then(function () {
    return liveRefresh().catch(function () {
      if (!state.works.length) {
        $("list").innerHTML = '<p class="empty">Publications are unavailable right now. See <a href="https://orcid.org/' + ORCID + '">ORCID</a>.</p>';
      }
    });
  });
})();
