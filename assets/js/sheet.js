/* ============================================================
   GOOGLE SHEET LOADER
   ============================================================
   Reads the "ATS Website Content" Google Sheet (see config.js)
   using Google's public visualization endpoint. No API key needed.
   Requirements: the sheet is shared "Anyone with the link — Viewer"
   and the tab names + header rows match the template.
   If anything fails, the site quietly falls back to the built-in
   sample content in content-default.js.
   ============================================================ */

(function () {
  "use strict";

  var TABS = ["Settings", "Events", "Announcements", "Opportunities", "Board", "Positions", "Links", "FAQ", "Impact"];

  // Maps the human-friendly sheet headers to internal field names.
  var HEADER_MAP = {
    "event name": "title", "title": "title", "date": "date", "time": "time",
    "location": "location", "event type": "type", "type": "type",
    "partner firm": "partner", "partner": "partner", "description": "description",
    "rsvp link": "rsvp", "rsvp": "rsvp", "photo files": "photos", "photos": "photos",
    "featured": "featured", "message": "message", "link": "link",
    "students attended": "attendance", "attendance": "attendance", "attended": "attendance",
    "company": "company", "deadline": "deadline", "apply link": "link", "notes": "notes",
    "name": "name", "role": "role", "linkedin": "linkedin", "photo file": "photo", "photo": "photo",
    "open seat?": "open", "open seat": "open", "open?": "open", "open": "open",
    "order": "order", "label": "label", "url": "url",
    "question": "question", "answer": "answer",
    "metric": "metric", "value": "value", "key": "key", "setting": "key"
  };

  function gvizUrl(sheetId, tab) {
    return "https://docs.google.com/spreadsheets/d/" + encodeURIComponent(sheetId) +
      "/gviz/tq?tqx=out:json&headers=1&sheet=" + encodeURIComponent(tab);
  }

  // gviz wraps JSON in a function call; unwrap it safely.
  function parseGviz(text) {
    var start = text.indexOf("(");
    var end = text.lastIndexOf(")");
    if (start === -1 || end === -1 || end <= start) throw new Error("Unexpected sheet response");
    return JSON.parse(text.substring(start + 1, end));
  }

  // Cell values arrive either as plain text, numbers, or "Date(2026,8,10)" strings.
  function cellToString(cell) {
    if (!cell) return "";
    var v = (cell.v !== undefined && cell.v !== null) ? cell.v : "";
    if (typeof v === "string") {
      var m = v.match(/^Date\((\d+),(\d+),(\d+)/);
      if (m) return m[1] + "-" + pad(+m[2] + 1) + "-" + pad(+m[3]); // gviz months are 0-based
      return v.trim();
    }
    if (typeof v === "number") {
      // Prefer the formatted value for numbers (keeps "50+", "5:30 PM" etc. intact)
      return (cell.f !== undefined && cell.f !== null) ? String(cell.f).trim() : String(v);
    }
    if (v instanceof Object && cell.f) return String(cell.f).trim();
    return String(v).trim();
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function tableToRows(table) {
    if (!table || !table.cols || !table.rows) return [];
    var keys = table.cols.map(function (c) {
      var label = (c.label || "").toLowerCase().trim();
      return HEADER_MAP[label] || label.replace(/[^a-z0-9]+/g, "");
    });
    return table.rows.map(function (r) {
      var obj = {};
      (r.c || []).forEach(function (cell, i) {
        if (keys[i]) obj[keys[i]] = cellToString(cell);
      });
      return obj;
    }).filter(function (obj) {
      return Object.keys(obj).some(function (k) { return obj[k] !== ""; });
    });
  }

  function fetchTab(sheetId, tab) {
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    if (ctrl) setTimeout(function () { ctrl.abort(); }, 5000);
    return fetch(gvizUrl(sheetId, tab), { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
      .then(function (text) {
        var parsed = parseGviz(text);
        // A renamed/deleted tab returns a 200 with an error payload or no table —
        // treat that as a failure (keep safe content), NOT as an empty tab.
        if (!parsed || parsed.status === "error" || !parsed.table || !parsed.table.cols) return null;
        return tableToRows(parsed.table);
      })
      .catch(function () { return null; }); // null = tab failed
  }

  function rowsToKeyValue(rows, keyField, valueField) {
    var out = {};
    rows.forEach(function (r) {
      var k = (r[keyField] || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      if (k) out[k] = r[valueField] || "";
    });
    return out;
  }

  // Public: loads everything, merges over defaults, resolves with the content object.
  window.ATS_loadContent = function () {
    var content = JSON.parse(JSON.stringify(window.ATS_DEFAULT || {}));
    content._live = false;

    var id = (window.ATS_CONFIG && window.ATS_CONFIG.sheetId || "").trim();
    if (!id) return Promise.resolve(content);

    return Promise.all(TABS.map(function (t) { return fetchTab(id, t); }))
      .then(function (results) {
        var byTab = {};
        TABS.forEach(function (t, i) { byTab[t] = results[i]; });

        var anyLive = TABS.some(function (t) { return Array.isArray(byTab[t]); });
        var failed = TABS.filter(function (t) { return !Array.isArray(byTab[t]); });
        if (anyLive && failed.length) {
          content._failedTabs = failed;
          try { console.warn("ATS content sheet: could not read tab(s): " + failed.join(", ") + ". Check tab names and sharing."); } catch (e) {}
        }
        content._live = anyLive;

        if (Array.isArray(byTab.Settings) && byTab.Settings.length) {
          var s = rowsToKeyValue(byTab.Settings, "key", "value");
          Object.keys(s).forEach(function (k) { if (s[k]) content.settings[k] = s[k]; });
        }
        ["Events", "Announcements", "Opportunities", "Board", "Positions", "Links", "FAQ"].forEach(function (t) {
          if (Array.isArray(byTab[t])) {
            // Loaded — an empty array is a legitimately empty tab
            content[t.toLowerCase()] = byTab[t];
          } else if (anyLive) {
            // This tab failed while others loaded: show an honest empty state
            // rather than mixing built-in sample data into a live site.
            content[t.toLowerCase()] = [];
          }
        });
        if (Array.isArray(byTab.Impact) && byTab.Impact.length) {
          var imp = rowsToKeyValue(byTab.Impact, "metric", "value");
          Object.keys(imp).forEach(function (k) {
            if (k.indexOf("member") !== -1) content.impact.members = imp[k];
            else if (k.indexOf("group") !== -1 || k.indexOf("community") !== -1) content.impact.community = imp[k];
            else if (k.indexOf("attend") !== -1) content.impact.attendances = imp[k];
            else if (k.indexOf("event") !== -1) content.impact.events = imp[k];
            else if (k.indexOf("firm") !== -1) content.impact.firms = imp[k];
          });
        }
        return content;
      })
      .catch(function () { return content; });
  };
})();
