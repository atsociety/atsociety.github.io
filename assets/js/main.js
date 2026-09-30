/* ============================================================
   SITE RENDERER v2
   ============================================================
   Builds the navigation, footer, and every dynamic section from
   the content object (Google Sheet, with built-in fallback), and
   powers the site's animation layer (scroll reveals, count-up
   stats, the firm marquee, the event countdown).
   Board members editing content should use the Google Sheet —
   this file normally never needs to change.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- small utilities ---------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // A link in the sheet can point somewhere on the web OR at one of our own
  // pages ("events.html", "join.html#positions", "#sponsorship").
  function isInternalLink(u) {
    u = String(u || "").trim();
    return /^(#|\.\/|\/)/.test(u) || /^[\w-]+\.html(#[\w-]+)?$/i.test(u);
  }

  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u || u === "#") return "";
    if (/^(https?:\/\/|mailto:|tel:)/i.test(u)) return u;
    if (isInternalLink(u)) return u; // one of our own pages — keep it relative
    return "https://" + u;
  }

  /* ---- The application form: one link, pasted in one place ----
     Put the Google Form link in the sheet's Settings tab under
     "Board App Form". Anywhere content says {{apply}} — the Positions
     rows, the applications announcement — it becomes that link.
     Until it's set, {{apply}} points at the Join page instead, so
     nothing is ever broken. */
  function applyFormUrl() {
    var v = String((((window.ATS || {}).settings) || {}).boardappform || "").trim();
    // Ignore the template's bracket placeholder text — that isn't a link.
    if (!v || v.charAt(0) === "[" || /paste/i.test(v)) return "";
    return v;
  }

  function resolveLink(u) {
    var v = String(u == null ? "" : u).trim();
    if (/^\{\{\s*apply\s*\}\}$/i.test(v)) return applyFormUrl() || "join.html#positions";
    return v;
  }

  // Only send visitors to a new tab when the link actually leaves the site.
  function linkTarget(u) {
    if (!u || isInternalLink(u) || /^(mailto:|tel:)/i.test(u)) return "";
    return ' target="_blank" rel="noopener"';
  }

  function parseDate(s) {
    s = String(s || "").trim();
    if (!s) return null;
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (m) {
      var y = +m[3];
      if (y < 100) y += 2000; // "9/3/26" means 2026
      return new Date(y, +m[1] - 1, +m[2]);
    }
    var d = new Date(s);
    // Guard the loose parser: "Sept 3" parses to year 2001 in some engines.
    if (isNaN(d.getTime()) || d.getFullYear() < 2015) return null;
    return d;
  }

  function fmtDate(d, opts) {
    if (!d) return "";
    try {
      return new Intl.DateTimeFormat("en-US", opts || { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(d);
    } catch (e) { return d.toDateString(); }
  }

  function today0() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
  function byOrder(a, b) { return (parseFloat(a.order) || 999) - (parseFloat(b.order) || 999); }
  function el(id) { return document.getElementById(id); }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function photoList(str) {
    var base = (window.ATS_CONFIG && window.ATS_CONFIG.photoBase) || "assets/img/photos/";
    return String(str || "").split(",").map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return /^https?:\/\//i.test(p) ? p : base + p; });
  }

  function semesterOf(d) {
    var m = d.getMonth();
    var s = m <= 4 ? "Spring" : (m <= 6 ? "Summer" : "Fall");
    return s + " " + d.getFullYear();
  }

  /* ---------- animation layer ---------- */

  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        if (en.target.classList.contains("stat-value")) runCountUp(en.target);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 }) : null;

  function revealAll() {
    if (!io) return;
    var sel = ".card, .event-card, .memory-card, .link-tile, .announce-item, .announce-feature, .stat-tile, .tier-card, .board-card, .section-head, .rail-box, .cta-band, .timeline li";
    var batchIndex = {};
    document.querySelectorAll(sel).forEach(function (n) {
      if (n.dataset.rv) return;
      n.dataset.rv = "1";
      n.classList.add("reveal");
      var pk = n.parentNode ? (n.parentNode._rvKey = n.parentNode._rvKey || (Math.random() + "")) : "x";
      batchIndex[pk] = (batchIndex[pk] || 0);
      // Stagger via animation-delay (reveal is a keyframe animation, so card
      // hover transitions stay snappy — see .reveal.in in style.css).
      n.style.animationDelay = (batchIndex[pk] % 6) * 70 + "ms";
      batchIndex[pk]++;
      io.observe(n);
    });
    document.querySelectorAll(".stat-value").forEach(function (n) {
      if (!n.dataset.cu) { n.dataset.cu = "1"; io.observe(n); }
    });
  }

  function runCountUp(node) {
    if (node.dataset.done || reduceMotion()) { node.dataset.done = "1"; return; }
    var m = String(node.textContent).trim().match(/^([^\d]*)(\d[\d,]*)(.*)$/);
    if (!m) return;
    node.dataset.done = "1";
    var pre = m[1], target = parseInt(m[2].replace(/,/g, ""), 10), suf = m[3];
    if (!isFinite(target) || target <= 0) return;
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = pre + Math.round(target * eased).toLocaleString("en-US") + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- link tile icons ---------- */

  var ICONS = {
    instagram: { bg: "linear-gradient(45deg,#F58529,#DD2A7B 55%,#8134AF)", sub: "Photos & announcements",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none"/></svg>' },
    groupme: { bg: "linear-gradient(135deg,#00AFF0,#0077C8)", sub: "Where members talk",
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><rect x="8" y="8" width="2.6" height="5" rx="1" fill="#fff"/><rect x="13.4" y="8" width="2.6" height="5" rx="1" fill="#fff"/></svg>' },
    discord: { bg: "linear-gradient(135deg,#5865F2,#3C48D8)", sub: "Chat with members",
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 5.5C10 5 11 5 12 5s2 0 3.5.5c0 0 3.5 1 4.5 4 0 0 1 3.5.5 7 0 0-2 2.5-5 2.5l-.8-1.4c1.8-.4 2.8-1.6 2.8-1.6-2 1.2-4 1.5-5.5 1.5s-3.5-.3-5.5-1.5c0 0 1 1.2 2.8 1.6L8.5 19c-3 0-5-2.5-5-2.5-.5-3.5.5-7 .5-7 1-3 4.5-4 4.5-4zM9.7 11a1.4 1.6 0 1 0 0 3.2 1.4 1.6 0 0 0 0-3.2zm4.6 0a1.4 1.6 0 1 0 0 3.2 1.4 1.6 0 0 0 0-3.2z"/></svg>' },
    linkedin: { bg: "linear-gradient(135deg,#0A66C2,#084F96)", sub: "Our professional network",
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="9.5" width="4" height="11" rx="0.6"/><circle cx="5" cy="5.4" r="2.2"/><path d="M10 9.5h3.8v1.7c.6-1 1.8-2 3.7-2 3 0 4.5 1.9 4.5 5.4v5.9h-4v-5.4c0-1.6-.6-2.7-2-2.7-1.2 0-1.9.8-2.2 1.6-.1.3-.1.7-.1 1.1v5.4H10z"/></svg>' },
    pin: { bg: "linear-gradient(135deg,#0039A6,#001F5C)", sub: "Make it official on campus",
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="15.5" rx="4.6" ry="3.8"/><ellipse cx="6.2" cy="10.5" rx="1.9" ry="2.5" transform="rotate(-18 6.2 10.5)"/><ellipse cx="10" cy="7" rx="1.9" ry="2.6"/><ellipse cx="14" cy="7" rx="1.9" ry="2.6"/><ellipse cx="17.8" cy="10.5" rx="1.9" ry="2.5" transform="rotate(18 17.8 10.5)"/></svg>' },
    mail: { bg: "linear-gradient(135deg,#0071CE,#0039A6)", sub: "Reach the board",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6.5L20 7"/></svg>' },
    rsvp: { bg: "linear-gradient(135deg,#00AEEF,#0071CE)", sub: "Save your seat",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.6 14.6l2.3 2.3 4.5-4.4" stroke-width="2.2"/></svg>' },
    form: { bg: "linear-gradient(135deg,#7B3FE4,#5B2BC4)", sub: "Board & associate applications",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5"/><path d="M9 12.5h6M9 16h4"/></svg>' },
    link: { bg: "linear-gradient(135deg,#51617E,#33415C)", sub: "Official club link",
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5S9.4 5.9 12 3.5z"/></svg>' }
  };

  function iconFor(label, url) {
    var l = String(label || "").toLowerCase();
    var u = String(url || "").toLowerCase();
    if (l.indexOf("instagram") !== -1 || u.indexOf("instagram") !== -1) return ICONS.instagram;
    if (l.indexOf("groupme") !== -1 || u.indexOf("groupme") !== -1) return ICONS.groupme;
    if (l.indexOf("discord") !== -1 || u.indexOf("discord") !== -1) return ICONS.discord;
    if (l.indexOf("linkedin") !== -1 || u.indexOf("linkedin") !== -1) return ICONS.linkedin;
    if (l.indexOf("pin") !== -1 || l.indexOf("panther") !== -1) return ICONS.pin;
    if (l.indexOf("mail") !== -1 || u.indexOf("mailto:") === 0) return ICONS.mail;
    if (l.indexOf("rsvp") !== -1 || l.indexOf("event") !== -1) return ICONS.rsvp;
    if (l.indexOf("apply") !== -1 || l.indexOf("application") !== -1 || u.indexOf("forms.gle") !== -1 || u.indexOf("docs.google.com/forms") !== -1) return ICONS.form;
    return ICONS.link;
  }

  function linkTile(l) {
    var url = safeUrl(resolveLink(l.url));
    var ic = iconFor(l.label, url);
    return '<a class="link-tile" href="' + esc(url || "#") + '"' +
      (/^mailto:|^#/.test(url) || !url ? "" : ' target="_blank" rel="noopener"') + ">" +
      '<span class="lt-icon" style="background:' + ic.bg + ';">' + ic.svg + "</span>" +
      '<span class="lt-text"><span class="lt-label">' + esc(l.label) + '</span><br>' +
      '<span class="lt-sub">' + esc(l.sub || ic.sub) + "</span></span></a>";
  }

  function renderLinkTiles(containerId, links) {
    var box = el(containerId);
    if (!box) return;
    var list = (links || []).slice().sort(byOrder);
    box.innerHTML = list.map(linkTile).join("") ||
      '<div class="empty-state"><p>Links coming soon.</p></div>';
  }

  /* ---------- firm chips ---------- */

  function firmList(events) {
    // Only firms from PAST, non-service events count as "worked with us" —
    // scheduled future events and community-service partners don't belong
    // in an employer-credibility strip.
    var t = today0(), seen = {}, out = [];
    (events || []).forEach(function (ev) {
      var d = parseDate(ev.date);
      if (!d || d >= t) return;
      if (/service/i.test(ev.type || "")) return;
      // Split on list separators only — never on "&" or "and", which belong
      // to real firm names (Frazier & Deeter, Ernst & Young).
      String(ev.partner || "").split(/[·,;|\/]| [–—] /).forEach(function (f) {
        f = f.trim();
        if (!f || f.length < 2) return;
        var k = f.toLowerCase();
        // The university and the club itself aren't firms — keep the
        // employer strip (and the firms-hosted count) employers-only.
        if (/^(gsu|georgia state( university)?|ats( board)?|n\/?a)$/.test(k)) return;
        if (!seen[k]) { seen[k] = 1; out.push(f); }
      });
    });
    return out;
  }

  function renderFirmMarquee(containerId, events) {
    var box = el(containerId);
    if (!box) return;
    var firms = firmList(events).slice(0, 16);
    if (firms.length < 3) { var band = box.closest(".firm-band"); if (band) band.classList.add("hidden"); return; }
    var chips = firms.map(function (f) { return '<span class="firm-chip">' + esc(f) + "</span>"; }).join("");
    if (reduceMotion()) {
      box.innerHTML = '<div class="firm-chips-static">' + chips + "</div>";
    } else {
      box.innerHTML = '<div class="marquee"><div class="mq-track">' + chips +
        '<span aria-hidden="true" style="display: contents;">' + chips + "</span></div></div>" +
        '<button type="button" class="mq-pause" aria-pressed="false" aria-label="Pause the scrolling firm list">⏸</button>';
      var mq = box.querySelector(".marquee");
      var btn = box.querySelector(".mq-pause");
      btn.addEventListener("click", function () {
        var paused = mq.classList.toggle("paused");
        btn.setAttribute("aria-pressed", String(paused));
        btn.textContent = paused ? "▶" : "⏸";
        btn.setAttribute("aria-label", paused ? "Resume the scrolling firm list" : "Pause the scrolling firm list");
      });
    }
  }

  function renderFirmChips(containerId, events) {
    var box = el(containerId);
    if (!box) return;
    var firms = firmList(events).slice(0, 18);
    box.innerHTML = firms.length
      ? '<div class="firm-chips-static">' + firms.map(function (f) { return '<span class="firm-chip">' + esc(f) + "</span>"; }).join("") + "</div>"
      : '<p class="muted">Firm names appear here automatically as events with partners are added.</p>';
  }

  /* ---------- board grid (used on the For Firms and About pages) ---------- */

  function renderBoardGrid(containerId, c, opts) {
    var box = el(containerId);
    if (!box) return;
    opts = opts || {};
    var board = (c.board || []).slice().sort(byOrder);
    box.innerHTML = board.map(function (b) {
      // An open seat has no person in it yet — show it as a recruiting card
      // so students see the opportunity and firms see the full org chart.
      if (String(b.open || "").toLowerCase() === "yes") {
        var seat = b.role || b.name || "Open board seat";
        return '<div class="card board-card is-open">' +
          '<div class="board-avatar open" aria-hidden="true">+</div>' +
          "<h3>" + esc(seat) + "</h3>" +
          '<div class="role open-role">Open, recruiting now</div>' +
          (b.notes ? '<p class="open-note">' + esc(b.notes) + "</p>" : "") +
          '<a class="li" href="' + (opts.root || "") + 'join.html#positions">See what this seat owns →</a>' +
          "</div>";
      }
      var isPlaceholder = !b.photo || /board-placeholder\.svg$/i.test(b.photo);
      var media;
      if (isPlaceholder) {
        // Until real headshots land: an intentional initials avatar,
        // not an empty circle that reads as a broken image.
        var initials = String(b.name || "").split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase();
        media = '<div class="board-avatar" aria-hidden="true">' + esc(initials) + "</div>";
      } else {
        var photo = /^https?:\/\//i.test(b.photo) ? b.photo : ((window.ATS_CONFIG && window.ATS_CONFIG.photoBase) || "assets/img/photos/") + b.photo;
        media = '<img src="' + esc(photo) + '" alt="' + esc(b.name) + '" loading="lazy" decoding="async">';
      }
      var li = safeUrl(b.linkedin);
      return '<div class="card board-card">' + media +
        "<h3>" + esc(b.name) + '</h3><div class="role">' + esc(b.role) + "</div>" +
        (li ? '<a class="li" href="' + esc(li) + '" target="_blank" rel="noopener" aria-label="' + esc(b.name) + ' on LinkedIn">LinkedIn →</a>' : "") +
        "</div>";
    }).join("");
  }

  /* ---------- structured data (Google rich results) ---------- */

  function injectJsonLd(c) {
    var old = document.getElementById("ats-jsonld");
    if (old) old.parentNode.removeChild(old);
    var s = splitEvents(c.events);
    var data = [{
      "@context": "https://schema.org", "@type": "Organization",
      "name": "Accounting & Tax Society at Georgia State University",
      "alternateName": "ATS at GSU",
      "email": (c.settings && c.settings.email) || undefined,
      "sameAs": [c.settings && c.settings.instagram, c.settings && c.settings.pin].filter(Boolean)
    }];
    s.upcoming.slice(0, 12).forEach(function (ev) {
      var d = parseDate(ev.date);
      if (!d) return;
      var start = new Date(d.getTime() + parseTimeMs(ev.time));
      function p(n) { return (n < 10 ? "0" : "") + n; }
      data.push({
        "@context": "https://schema.org", "@type": "Event",
        "name": ev.title,
        "startDate": start.getFullYear() + "-" + p(start.getMonth() + 1) + "-" + p(start.getDate()) + "T" + p(start.getHours()) + ":" + p(start.getMinutes()) + ":00",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": { "@type": "Place", "name": ev.location || "Georgia State University", "address": "Atlanta, GA" },
        "organizer": { "@type": "Organization", "name": "Accounting & Tax Society at GSU" },
        "description": ev.description || undefined
      });
    });
    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.id = "ats-jsonld";
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  }

  /* ---------- chrome: nav + footer ---------- */

  var NAV_ITEMS = [
    ["index.html", "home", "Home"],
    ["events.html", "events", "Events"],
    ["announcements.html", "announcements", "Announcements"],
    ["opportunities.html", "opportunities", "Opportunities"],
    ["links.html", "links", "Links"],
    ["about.html", "about", "About"],
    ["partners.html", "partners", "For Firms"]
  ];

  function renderChrome(c) {
    var page = document.body.getAttribute("data-page") || "";
    var root = document.body.getAttribute("data-root") || "";

    var navHtml =
      '<div class="container nav-inner">' +
      '<a class="brand" href="' + root + 'index.html">' +
      '<img src="' + root + 'assets/img/ats-logo.svg" alt="ATS logo">' +
      '<span class="brand-text"><span class="brand-name">' + esc(c.settings.clubshort || "ATS") + '</span>' +
      '<span class="brand-sub">Accounting &amp; Tax Society · Georgia State</span></span></a>' +
      '<nav aria-label="Main">' +
      '<button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>' +
      '<ul class="nav-links" id="navLinks">' +
      NAV_ITEMS.map(function (it) {
        return '<li><a href="' + root + it[0] + '"' + (page === it[1] ? ' class="active"' : '') + '>' + it[2] + '</a></li>';
      }).join("") +
      '<li><a class="nav-cta" href="' + root + 'join.html">Join ATS</a></li>' +
      '</ul></nav></div>';

    var nav = el("site-nav");
    if (nav) { nav.classList.add("site-nav"); nav.innerHTML = navHtml; }

    function setMenu(open) {
      var links = el("navLinks");
      var tg = document.querySelector(".nav-toggle");
      if (!links || !tg) return;
      links.classList.toggle("open", open);
      tg.classList.toggle("open", open);
      tg.setAttribute("aria-expanded", open ? "true" : "false");
    }
    window._setMenu = setMenu;
    var toggle = document.querySelector(".nav-toggle");
    if (toggle) toggle.addEventListener("click", function () {
      setMenu(!el("navLinks").classList.contains("open"));
    });
    if (!window._navCloseBound) {
      window._navCloseBound = true;
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && el("navLinks") && el("navLinks").classList.contains("open")) {
          window._setMenu(false);
          var t = document.querySelector(".nav-toggle");
          if (t) t.focus();
        }
      });
      document.addEventListener("click", function (ev) {
        var links = el("navLinks");
        if (!links || !links.classList.contains("open")) return;
        if (ev.target.closest && ev.target.closest(".nav-links a")) { window._setMenu(false); return; }
        if (!(ev.target.closest && ev.target.closest(".site-nav"))) window._setMenu(false);
      });
    }

    if (!window._navScrollBound) {
      window._navScrollBound = true;
      window.addEventListener("scroll", function () {
        var n = el("site-nav");
        if (n) n.classList.toggle("scrolled", window.scrollY > 8);
      }, { passive: true });
    }

    var email = safeUrl("mailto:" + (c.settings.email || ""));
    var footHtml =
      '<div class="container">' +
      '<div class="footer-inner">' +
      '<div><div class="footer-brand"><img src="' + root + 'assets/img/ats-logo.svg" alt="">' +
      '<span class="fb-name">' + esc(c.settings.clubname || "Accounting & Tax Society") + '</span></div>' +
      '<p class="footer-motto">The student organization for Georgia State students heading into accounting, tax, and finance.</p></div>' +
      '<div><h4>Students</h4><ul>' +
      '<li><a href="' + root + 'events.html">Upcoming events</a></li>' +
      '<li><a href="' + root + 'opportunities.html">Opportunities</a></li>' +
      '<li><a href="' + root + 'join.html">Become a member</a></li>' +
      '<li><a href="' + root + 'join.html#positions">Board &amp; associate openings</a></li>' +
      '<li><a href="' + root + 'links.html">All club links</a></li></ul></div>' +
      '<div><h4>Partners</h4><ul>' +
      '<li><a href="' + root + 'partners.html">Why partner with ATS</a></li>' +
      '<li><a href="' + root + 'partners.html#sponsorship">Sponsorship</a></li>' +
      '<li><a href="' + root + 'partners.html#contact">Contact the board</a></li></ul></div>' +
      '<div><h4>Connect</h4><ul>' +
      (safeUrl(c.settings.instagram) ? '<li><a href="' + esc(safeUrl(c.settings.instagram)) + '" target="_blank" rel="noopener">Instagram</a></li>' : "") +
      (safeUrl(c.settings.groupme) ? '<li><a href="' + esc(safeUrl(c.settings.groupme)) + '" target="_blank" rel="noopener">GroupMe</a></li>' : "") +
      (safeUrl(c.settings.pin) ? '<li><a href="' + esc(safeUrl(c.settings.pin)) + '" target="_blank" rel="noopener">PIN page</a></li>' : "") +
      (c.settings.email ? '<li><a href="' + esc(email) + '">' + esc(c.settings.email) + '</a></li>' : "") +
      '</ul></div></div>' +
      '<div class="footer-note"><span>© <span id="footYear"></span> ' + esc(c.settings.clubname || "Accounting & Tax Society") + ' at Georgia State University</span>' +
      '<span><a href="' + root + 'board/index.html">Board members area</a></span></div></div>';

    var foot = el("site-footer");
    if (foot) { foot.classList.add("site-footer"); foot.innerHTML = footHtml; }
    var y = el("footYear");
    if (y) y.textContent = String(new Date().getFullYear());

    // Setup reminder for the BOARD only — visitors never see internal tooling.
    // Shows during local preview (localhost) or when a board member adds
    // ?setup=1 to the address. On the public site it stays hidden.
    var maintainerView = /^(localhost|127\.)/.test(location.hostname) || /[?&]setup=1/.test(location.search);
    if (!c._live && maintainerView) {
      var note = el("sample-note");
      if (note) {
        note.innerHTML = '<div class="container"><div class="placeholder-note">' +
          "<strong>Board view:</strong> this site is running on its built-in content. Connect the club's Google Sheet " +
          "(see the <strong>SETUP guide</strong> in your website package) to manage everything from a spreadsheet, and then this notice disappears. Visitors don't see this message." +
          "</div></div>";
      }
    }
  }

  /* ---------- shared builders ---------- */

  function eventDateBadge(d) {
    return '<span class="event-date-badge"><span class="m">' + fmtDate(d, { month: "short" }) +
      '</span><span class="d">' + d.getDate() + "</span></span>";
  }

  function ebIcon(name) {
    var paths = {
      cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      pin: '<path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>'
    };
    return '<svg class="eb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + "</svg>";
  }

  // "Add to calendar" link (Google Calendar template). End time comes from a
  // range like "6:00–7:15 PM" when present, otherwise start + 90 minutes.
  function gcalUrl(ev, d) {
    var start = d.getTime() + parseTimeMs(ev.time);
    var end = start + 90 * 60000;
    var m = String(ev.time || "").match(/[–—-]\s*(\d{1,2})(?::(\d{2}))?/);
    if (m) {
      var h = +m[1] % 12;
      if (/p\.?m/i.test(String(ev.time)) || +m[1] <= 8) h += 12;
      var e = d.getTime() + (h * 60 + (+m[2] || 0)) * 60000;
      if (e > start) end = e;
    }
    function f(ms) {
      var x = new Date(ms);
      function p(n) { return (n < 10 ? "0" : "") + n; }
      return "" + x.getFullYear() + p(x.getMonth() + 1) + p(x.getDate()) + "T" + p(x.getHours()) + p(x.getMinutes()) + "00";
    }
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(ev.title || "ATS Event") +
      "&dates=" + f(start) + "/" + f(end) +
      (ev.location ? "&location=" + encodeURIComponent(ev.location) : "") +
      "&details=" + encodeURIComponent("Accounting & Tax Society at Georgia State" + (ev.description ? "\n\n" + ev.description : ""));
  }

  function eventBanner(ev) {
    var d = parseDate(ev.date);
    var rsvp = safeUrl(ev.rsvp);
    var gcal = d ? gcalUrl(ev, d) : "";
    return '<article class="event-banner">' +
      '<div class="eb-sheen" aria-hidden="true"></div>' +
      '<div class="eb-main">' +
      '<div class="eb-flag"><span class="eb-pulse" aria-hidden="true"></span>Next event · Don’t miss it</div>' +
      '<h3 class="eb-title">' + esc(ev.title) + "</h3>" +
      '<div class="eb-facts">' +
      '<span class="eb-fact">' + ebIcon("cal") + (d ? fmtDate(d, { weekday: "long", month: "long", day: "numeric" }) : esc(ev.date)) + "</span>" +
      (ev.time ? '<span class="eb-fact">' + ebIcon("clock") + esc(ev.time) + "</span>" : "") +
      (ev.location ? '<span class="eb-fact">' + ebIcon("pin") + esc(ev.location) + "</span>" : "") +
      "</div>" +
      ((ev.type || ev.partner) ? '<div class="event-meta">' +
        (ev.type ? '<span class="tag">' + esc(ev.type) + "</span>" : "") +
        (ev.partner ? '<span class="tag outline">With ' + esc(ev.partner) + "</span>" : "") +
        "</div>" : "") +
      (ev.description ? '<p class="eb-desc">' + esc(ev.description) + "</p>" : "") +
      '<div class="eb-actions">' +
      (rsvp ? '<a class="btn btn-white btn-lg" href="' + esc(rsvp) + '"' + linkTarget(rsvp) + ">" + rsvpLabel(rsvp) + "</a>" : "") +
      (gcal ? '<a class="btn btn-ghost on-dark" href="' + esc(gcal) + '" target="_blank" rel="noopener">Add to calendar</a>' : "") +
      "</div></div>" +
      '<div class="eb-side">' +
      (d ? '<div class="eb-date-tile"><span class="m">' + fmtDate(d, { month: "short" }) +
        '</span><span class="d">' + d.getDate() +
        '</span><span class="wd">' + fmtDate(d, { weekday: "long" }) + "</span></div>" : "") +
      '<div class="eb-label">Starts in</div>' +
      (d ? countdownHtml(d, ev.time) : "") +
      "</div></article>";
  }

  function eventCard(ev, opts) {
    opts = opts || {};
    var d = parseDate(ev.date);
    var rsvp = safeUrl(ev.rsvp);
    return '<article class="event-card' + (opts.featured ? " featured-event" : "") + '">' +
      '<div class="event-top">' + (d ? eventDateBadge(d) : "") +
      '<div><h3>' + esc(ev.title) + "</h3>" +
      '<div class="event-when">' + (d ? fmtDate(d) : esc(ev.date)) + (ev.time ? " · " + esc(ev.time) : "") + "</div></div></div>" +
      '<div class="event-body">' +
      '<div class="event-meta">' +
      (ev.type ? '<span class="tag">' + esc(ev.type) + "</span>" : "") +
      (ev.location ? '<span class="tag outline">' + esc(ev.location) + "</span>" : "") +
      (ev.partner ? '<span class="tag outline">With: ' + esc(ev.partner) + "</span>" : "") +
      "</div>" +
      (ev.description ? '<p class="event-desc">' + esc(ev.description) + "</p>" : "") +
      (opts.countdown && d ? countdownHtml(d, ev.time) : "") +
      (rsvp ? '<div class="event-actions"><a class="btn btn-primary btn-sm" href="' + esc(rsvp) + '"' + linkTarget(rsvp) + ">" + rsvpLabel(rsvp) + "</a></div>" : "") +
      "</div></article>";
  }

  function rsvpLabel(url) {
    return /pin\.gsu\.edu/i.test(url) ? "RSVP on PIN" : "RSVP and save your seat";
  }

  function countdownHtml(d, timeStr) {
    var target = d.getTime() + parseTimeMs(timeStr);
    if (target <= Date.now()) {
      return d >= today0() ? '<div class="event-meta"><span class="tag gold">Happening today</span></div>' : "";
    }
    return '<div class="countdown" data-cd="' + target + '">' +
      ['Days', 'Hours', 'Min', 'Sec'].map(function (lab) {
        return '<div class="cd-cell"><div class="cd-num">–</div><div class="cd-lab">' + lab + "</div></div>";
      }).join("") + "</div>";
  }

  function startCountdowns() {
    var nodes = document.querySelectorAll("[data-cd]");
    if (window._cdInt) { clearInterval(window._cdInt); window._cdInt = null; }
    if (!nodes.length) return;
    function tick() {
      var now = Date.now();
      nodes.forEach(function (n) {
        if (!n.isConnected) return;
        var diff = (+n.getAttribute("data-cd")) - now;
        if (diff <= 0) {
          // Countdown finished while the page was open — swap to the live state.
          n.outerHTML = '<div class="event-meta"><span class="tag gold">Happening now</span></div>';
          return;
        }
        var dd = Math.floor(diff / 86400000);
        var hh = Math.floor(diff % 86400000 / 3600000);
        var mm = Math.floor(diff % 3600000 / 60000);
        var ss = Math.floor(diff % 60000 / 1000);
        var cells = n.querySelectorAll(".cd-num");
        if (cells.length === 4) { cells[0].textContent = dd; cells[1].textContent = hh; cells[2].textContent = mm; cells[3].textContent = ss; }
      });
    }
    tick();
    if (!reduceMotion()) window._cdInt = setInterval(tick, 1000);
  }

  function splitEvents(events) {
    var t = today0(), up = [], past = [];
    (events || []).forEach(function (ev) {
      var d = parseDate(ev.date);
      // Unparseable/TBA dates belong with upcoming (sorted last), never in the archive.
      if (!d || d >= t) up.push(ev); else past.push(ev);
    });
    up.sort(function (a, b) {
      return (parseDate(a.date) || new Date(9999, 0)) - (parseDate(b.date) || new Date(9999, 0));
    });
    past.sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
    return { upcoming: up, past: past };
  }

  // The event that gets the spotlight banner: first one marked Featured=yes,
  // otherwise simply the next one on the calendar.
  function pickNext(upcoming) {
    for (var i = 0; i < upcoming.length; i++) {
      if (String(upcoming[i].featured).toLowerCase() === "yes") return upcoming[i];
    }
    return upcoming[0] || null;
  }

  function parseTimeMs(timeStr) {
    var str = String(timeStr || "");
    var m = str.match(/(\d{1,2})(?::(\d{2}))?/);
    if (!m) return 0;
    var h = +m[1] % 12;
    // "6:00–7:15 PM": the meridiem sits after the range but applies to the start.
    if (/p\.?m/i.test(str)) h += 12;
    else if (!/a\.?m/i.test(str) && +m[1] <= 8) h += 12; // bare "6-7:15" on a campus schedule means evening
    return (h * 60 + (+m[2] || 0)) * 60000;
  }

  // A form link is an ask, not a read — label the button accordingly.
  function announceCta(link, fallback) {
    return /docs\.google\.com\/forms|forms\.gle|forms\.office/i.test(link) ? "Apply now" : (fallback || "Read more");
  }

  function announceFeature(a) {
    var d = parseDate(a.date);
    var link = safeUrl(resolveLink(a.link));
    return '<div class="announce-feature">' +
      '<div class="a-date">Latest · ' + (d ? fmtDate(d) : esc(a.date)) + "</div>" +
      "<h3>" + esc(a.title) + "</h3>" +
      (a.message ? "<p>" + esc(a.message) + "</p>" : "") +
      (link ? '<a class="a-link" href="' + esc(link) + '"' + linkTarget(link) + ">" + announceCta(link, "Read more") + "<span class=\"sr-only\"> about " + esc(a.title) + "</span> →</a>" : "") +
      "</div>";
  }

  function announceItem(a) {
    var d = parseDate(a.date);
    var link = safeUrl(resolveLink(a.link));
    return '<div class="announce-item">' +
      '<div class="a-date">' + (d ? fmtDate(d) : esc(a.date)) + "</div>" +
      "<h3>" + esc(a.title) + "</h3>" +
      (a.message ? "<p>" + esc(a.message) + "</p>" : "") +
      (link ? '<a class="a-link" href="' + esc(link) + '"' + linkTarget(link) + ">" + announceCta(link, "More") + "<span class=\"sr-only\"> about " + esc(a.title) + "</span> →</a>" : "") +
      "</div>";
  }

  function statTiles(imp, audience) {
    var attLabel = imp.attendanceslabel || "Student attendances to date";
    var tiles = audience === "partners" ? [
      [imp.members, "Accounting & finance students in our membership"],
      [imp.turnout, imp.turnoutlabel || "Avg turnout at firm events"],
      [imp.attendances, attLabel],
      [imp.firms, "Firms & partners hosted"]
    ] : [
      [imp.members, "Registered members on PIN"],
      [imp.community, "Students in our GroupMe"],
      [imp.attendances, attLabel],
      [imp.firms, "Firms & partners hosted"]
    ];
    return tiles.filter(function (t) { return t[0]; }).map(function (t) {
      return '<div class="stat-tile"><div class="stat-value">' + esc(t[0]) + '</div><div class="stat-label">' + esc(t[1]) + "</div></div>";
    }).join("");
  }

  /* Fill in impact numbers the site can compute for itself.
     A value set in the sheet's Impact tab always wins; blanks auto-count. */
  function enrichImpact(c) {
    c.impact = c.impact || {};
    if (!c.impact.firms) {
      var n = firmList(c.events).length;
      if (n > 0) c.impact.firms = String(n);
    }
    if (!c.impact.attendances) {
      // Total recorded headcount across all past events, floored to the
      // nearest hundred ("1,000+") so it always reads as a safe claim.
      var t0 = today0(), total = 0, cnt = 0, first = null;
      (c.events || []).forEach(function (ev) {
        var d = parseDate(ev.date);
        var att = parseInt(ev.attendance, 10);
        if (!d || d >= t0 || !isFinite(att) || att <= 0) return;
        total += att; cnt += 1;
        if (!first || d < first) first = d;
      });
      if (cnt >= 5 && total >= 100) {
        var floored = Math.floor(total / 100) * 100;
        c.impact.attendances = String(floored).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "+";
        if (first) c.impact.attendanceslabel = "Student attendances since " + semesterOf(first);
      }
    }
    if (!c.impact.events) {
      var counts = {}, latest = null, latestKey = null;
      (c.events || []).forEach(function (ev) {
        var d = parseDate(ev.date);
        if (!d) return;
        var key = semesterOf(d);
        counts[key] = (counts[key] || 0) + 1;
        if (!latest || d > latest) { latest = d; latestKey = key; }
      });
      var nowKey = semesterOf(new Date());
      if (counts[nowKey]) {
        // Count the CURRENT semester so the label "Events this semester" stays true.
        c.impact.events = String(counts[nowKey]);
      } else if (latestKey) {
        // No events dated this semester yet — show the most recent one, labeled honestly.
        c.impact.events = String(counts[latestKey]);
        c.impact.eventslabel = "Events in " + latestKey;
      }
    }
    if (!c.impact.turnout) {
      // Average turnout at partnered (firm) events over the most recent
      // ACADEMIC YEAR (Aug–Jul) with at least three of them. A full-year
      // window is a bigger sample and balances fall/spring seasonality.
      var t = today0(), byAY = {};
      (c.events || []).forEach(function (ev) {
        var d = parseDate(ev.date);
        var att = parseInt(ev.attendance, 10);
        if (!d || d >= t || !(ev.partner || "").trim() || !isFinite(att)) return;
        var ay = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
        (byAY[ay] = byAY[ay] || { sum: 0, n: 0 });
        byAY[ay].sum += att; byAY[ay].n += 1;
      });
      var pick = null;
      Object.keys(byAY).forEach(function (ay) {
        if (byAY[ay].n >= 3 && (!pick || +ay > +pick)) pick = ay;
      });
      if (pick) {
        c.impact.turnout = String(Math.round(byAY[pick].sum / byAY[pick].n));
        c.impact.turnoutlabel = "Avg turnout at firm events (" + pick + "\u2013" + String((+pick + 1) % 100) + ")";
      }
    }
  }

  function memoryCard(ev, opts) {
    // Guard: Array.prototype.map passes the index as the second argument,
    // so only honor opts when it's an actual options object.
    opts = (opts && typeof opts === "object") ? opts : {};
    var d = parseDate(ev.date);
    var photos = photoList(ev.photos);
    var cover = photos[0];
    var thumbs = photos.slice(1, 5);
    return '<article class="memory-card">' +
      '<div class="memory-cover">' +
      (cover
        ? '<img src="' + esc(cover) + '" alt="Photo from ' + esc(ev.title) + '" loading="lazy" decoding="async">'
        : '<span class="mc-type">' + esc(ev.type || "ATS Event") + "</span>") +
      (d ? '<span class="mc-date">' + fmtDate(d, { month: "short", year: "numeric" }) + "</span>" : "") +
      (photos.length > 1 ? '<span class="mc-count">' + photos.length + " photos</span>" : "") +
      (function () {
        if (opts.hideAttendance) return "";
        var att = parseInt(ev.attendance, 10);
        var min = (window.ATS_CONFIG && window.ATS_CONFIG.attendanceBadgeMin);
        if (!isFinite(att) || att <= 0 || att < (isFinite(min) ? min : 0)) return "";
        return '<span class="mc-att">' + att + " attended</span>";
      })() +
      "</div>" +
      '<div class="memory-body"><h4>' + esc(ev.title) + "</h4>" +
      (ev.partner ? '<div class="mb-partner">With ' + esc(ev.partner) + "</div>" : "") +
      (ev.description ? "<p>" + esc(ev.description) + "</p>" : "") +
      "</div>" +
      (thumbs.length ? '<div class="memory-thumbs">' + thumbs.map(function (p) {
        return '<a href="' + esc(p) + '" target="_blank" rel="noopener"><img src="' + esc(p) + '" alt="Photo from ' + esc(ev.title) + '" loading="lazy" decoding="async"></a>';
      }).join("") + "</div>" : "") +
      "</article>";
  }

  /* ---------- page renderers ---------- */

  function renderHome(c) {
    var s = splitEvents(c.events);
    var next = pickNext(s.upcoming);

    if (el("next-event")) {
      el("next-event").innerHTML = next ? eventBanner(next) :
        '<div class="empty-state"><h3>No events scheduled yet</h3><p>The semester calendar is on its way. Watch our announcements.</p></div>';
    }

    if (el("home-upcoming")) {
      var rest = s.upcoming.filter(function (ev) { return ev !== next; }).slice(0, 3);
      el("home-upcoming").innerHTML = rest.map(function (ev) { return eventCard(ev); }).join("");
      if (!rest.length) el("home-upcoming").classList.add("hidden");
    }

    if (el("home-announcements")) {
      var list = (c.announcements || []).slice().sort(function (a, b) { return (parseDate(b.date) || 0) - (parseDate(a.date) || 0); });
      el("home-announcements").innerHTML = list.slice(0, 3).map(announceItem).join("") ||
        '<div class="empty-state"><p>No announcements yet.</p></div>';
    }

    if (el("home-stats")) el("home-stats").innerHTML = statTiles(c.impact || {});

    if (el("home-photos")) {
      var photos = [];
      s.past.forEach(function (ev) { photoList(ev.photos).forEach(function (p) { photos.push(p); }); });
      el("home-photos").innerHTML = photos.slice(0, 3).map(function (p) {
        return '<img src="' + esc(p) + '" alt="ATS event photo" loading="lazy" decoding="async">';
      }).join("");
      var split = el("home-photos").closest(".about-split");
      if (!photos.length) {
        // No event photos yet — collapse to a single centered column instead
        // of leaving an empty half. The mosaic returns when photos are added.
        el("home-photos").classList.add("hidden");
        if (split) { split.style.gridTemplateColumns = "1fr"; split.style.maxWidth = "820px"; split.style.margin = "0 auto"; }
      } else if (split) {
        el("home-photos").classList.remove("hidden");
        split.style.gridTemplateColumns = ""; split.style.maxWidth = ""; split.style.margin = "";
      }
    }

    renderFirmMarquee("firm-marquee", c.events);
    renderLinkTiles("home-connect", c.links);
    startCountdowns();
  }

  function renderEvents(c) {
    var s = splitEvents(c.events);
    var next = pickNext(s.upcoming);

    // The very next event gets the big spotlight banner; the rest of the
    // semester renders as regular cards below it.
    if (el("next-event-spotlight")) {
      el("next-event-spotlight").innerHTML = next ? eventBanner(next) :
        '<div class="empty-state"><h3>Nothing on the calendar right now</h3><p>New events are announced at the start of each semester.</p></div>';
    }

    var rest = s.upcoming.filter(function (ev) { return ev !== next; });

    function paintUpcoming(type) {
      var list = type ? rest.filter(function (ev) { return (ev.type || "") === type; }) : rest;
      el("upcoming-events").innerHTML = list.map(function (ev) { return eventCard(ev); }).join("") ||
        '<div class="empty-state"><p>Nothing in this category right now. Try another type.</p></div>';
      revealAll();
      startCountdowns();
    }

    if (el("upcoming-events")) {
      // Type filter chips (only worth showing with a real list to filter).
      if (el("event-filters") && rest.length > 3) {
        var types = [];
        rest.forEach(function (ev) { if (ev.type && types.indexOf(ev.type) === -1) types.push(ev.type); });
        if (types.length > 1) {
          el("event-filters").innerHTML =
            '<button type="button" class="filter-chip active" data-type="">All · ' + rest.length + "</button>" +
            types.map(function (t) {
              var n = rest.filter(function (ev) { return ev.type === t; }).length;
              return '<button type="button" class="filter-chip" data-type="' + esc(t) + '">' + esc(t) + " · " + n + "</button>";
            }).join("");
          if (!el("event-filters")._wired) {
            el("event-filters")._wired = true;
            el("event-filters").addEventListener("click", function (e) {
              var b = e.target.closest(".filter-chip");
              if (!b) return;
              el("event-filters").querySelectorAll(".filter-chip").forEach(function (x) { x.classList.remove("active"); });
              b.classList.add("active");
              paintUpcoming(b.getAttribute("data-type"));
            });
          }
        }
      }
      paintUpcoming("");
      el("upcoming-events").classList.toggle("hidden", !rest.length);
    }

    if (el("past-events")) {
      var groups = {}, order = [];
      s.past.forEach(function (ev) {
        var d = parseDate(ev.date);
        var key = d ? semesterOf(d) : "Earlier";
        if (!groups[key]) { groups[key] = []; order.push(key); }
        groups[key].push(ev);
      });
      el("past-events").innerHTML = order.map(function (key, i) {
        var cards = '<div class="memory-grid">' + groups[key].map(memoryCard).join("") + "</div>";
        if (i === 0) {
          // Most recent semester stays open.
          return '<div class="past-semester"><h3>' + esc(key) + "</h3>" + cards + "</div>";
        }
        // Older semesters fold closed so the archive stays browsable.
        return '<details class="past-fold"><summary><span class="pf-title">' + esc(key) +
          '</span><span class="pf-count">' + groups[key].length + " events</span></summary>" + cards + "</details>";
      }).join("") || '<div class="empty-state"><p>Past events will appear here after our first semester on the new site.</p></div>';
    }

    startCountdowns();
  }

  function renderAnnouncements(c) {
    var list = (c.announcements || []).slice().sort(function (a, b) { return (parseDate(b.date) || 0) - (parseDate(a.date) || 0); });

    if (el("announce-feature")) {
      el("announce-feature").innerHTML = list.length ? announceFeature(list[0]) : "";
    }
    if (el("announce-rest")) {
      el("announce-rest").innerHTML = list.slice(1).map(announceItem).join("") ||
        (list.length ? "" : '<div class="empty-state"><h3>No announcements yet</h3></div>');
    }

    // side rail
    var s = splitEvents(c.events);
    if (el("rail-next-event")) {
      el("rail-next-event").innerHTML = s.upcoming[0] ? eventCard(s.upcoming[0]) :
        '<div class="empty-state"><p>No upcoming events.</p></div>';
    }
    if (el("rail-links")) {
      var quick = (c.links || []).slice().sort(byOrder).slice(0, 4);
      el("rail-links").innerHTML = quick.map(linkTile).join("");
    }
  }

  function renderOpportunities(c) {
    var t = today0();
    var list = (c.opportunities || []).slice().sort(function (a, b) {
      return (parseDate(a.deadline) || new Date(9999, 0)) - (parseDate(b.deadline) || new Date(9999, 0));
    });
    var featured = list.filter(function (o) { return String(o.featured).toLowerCase() === "yes"; });
    var rest = list.filter(function (o) { return String(o.featured).toLowerCase() !== "yes"; });

    function oppCard(o, isFeatured) {
      var d = parseDate(o.deadline);
      var past = d && d < t;
      var link = safeUrl(o.link);
      return '<article class="card opp-card' + (isFeatured ? " featured-opp" : "") + '">' +
        '<div class="event-meta">' +
        (isFeatured ? '<span class="tag gold">★ Featured</span>' : "") +
        (o.type ? '<span class="tag">' + esc(o.type) + "</span>" : "") +
        (past ? '<span class="tag outline">Deadline passed</span>' : "") + "</div>" +
        "<h3>" + esc(o.title) + "</h3>" +
        (o.company ? '<div class="opp-company">' + esc(o.company) + "</div>" : "") +
        (o.notes ? '<p class="muted" style="font-size:0.94rem;">' + esc(o.notes) + "</p>" : "") +
        (o.deadline ? '<div class="opp-deadline' + (past ? " past" : "") + '">Deadline: <strong>' + (d ? fmtDate(d) : esc(o.deadline)) + "</strong></div>" : "") +
        (link ? '<div class="mt-2"><a class="btn ' + (isFeatured ? "btn-primary" : "btn-ghost") + ' btn-sm" href="' + esc(link) + '"' + linkTarget(link) + '>Apply directly →</a></div>' : "") +
        "</article>";
    }

    if (el("opps-featured")) {
      el("opps-featured").innerHTML = featured.map(function (o) { return oppCard(o, true); }).join("");
      var wrap = el("opps-featured-wrap");
      if (wrap) wrap.classList.toggle("hidden", !featured.length);
    }
    if (el("opps-list")) {
      el("opps-list").innerHTML = rest.map(function (o) { return oppCard(o, false); }).join("") ||
        (featured.length ? "" : '<div class="empty-state"><h3>Nothing posted right now</h3><p>New internships and opportunities are added as firms share them with us.</p></div>');
    }
  }

  function renderJoin(c) {
    var list = c.positions || [];

    // One prominent Apply button above the postings, shown only once the
    // application form link is set in the sheet.
    if (el("positions-cta")) {
      var formUrl = safeUrl(applyFormUrl());
      el("positions-cta").innerHTML = formUrl
        ? '<a class="btn btn-primary btn-lg" href="' + esc(formUrl) + '" target="_blank" rel="noopener">Apply now</a>' +
          '<p class="muted mt-2" style="font-size:0.9rem;">One form covers all three seats. You only answer the questions for the one you pick.</p>'
        : "";
      el("positions-cta").classList.toggle("hidden", !formUrl);
    }

    if (el("positions-list")) {
      if (list.length) {
        el("positions-list").innerHTML = list.map(function (p) {
          var d = parseDate(p.deadline);
          var link = safeUrl(resolveLink(p.link));
          return '<article class="card opp-card"><h3>' + esc(p.role) + "</h3>" +
            (p.description ? '<p class="muted" style="font-size:0.95rem;">' + esc(p.description) + "</p>" : "") +
            (p.deadline ? '<div class="opp-deadline">Apply by: <strong>' + (d ? fmtDate(d) : esc(p.deadline)) + "</strong></div>" : "") +
            (link ? '<div class="mt-2"><a class="btn btn-primary btn-sm" href="' + esc(link) + '"' + linkTarget(link) + '>Apply</a></div>' : "") +
            "</article>";
        }).join("");
      } else {
        var interest = safeUrl(c.settings.interestform);
        el("positions-list").innerHTML =
          '<div class="empty-state"><h3>Applications are closed right now</h3>' +
          "<p>Openings are posted here when board and associate applications open, usually once a year. We announce them in the GroupMe first.</p>" +
          (interest ? '<p class="mt-2"><a class="btn btn-ghost" href="' + esc(interest) + '"' + linkTarget(interest) + '>Join the interest list</a></p>' : "") +
          "</div>";
      }
    }
  }

  function renderLinks(c) {
    renderLinkTiles("links-list", c.links);
  }

  function renderAbout(c) {
    var list = (c.faq || []).slice().sort(byOrder);
    if (el("faq-list")) {
      el("faq-list").innerHTML = list.map(function (f) {
        return '<details class="faq-item"><summary>' + esc(f.question) + "</summary>" +
          '<div class="faq-body">' + esc(f.answer) + "</div></details>";
      }).join("");
    }
    if (el("about-stats")) el("about-stats").innerHTML = statTiles(c.impact || {});
    renderBoardGrid("about-board", c);
    renderContact(c, "about-contact");
    if (el("meeting-info")) el("meeting-info").textContent = c.settings.meetinginfo || "";
  }

  function renderContact(c, id) {
    var box = el(id);
    if (!box) return;
    var email = c.settings.email || "";
    var form = safeUrl(c.settings.contactform);
    box.innerHTML =
      (email ? '<div class="contact-row"><span class="c-ic">✉</span><a href="mailto:' + esc(email) + '">' + esc(email) + "</a></div>" : "") +
      (form
        ? '<div class="form-embed mt-2"><iframe src="' + esc(form) + '" title="Contact form">Loading…</iframe></div>'
        : "");
  }

  function renderPartners(c) {
    if (el("impact-stats")) el("impact-stats").innerHTML = statTiles(c.impact || {}, "partners");
    renderFirmChips("partner-firms", c.events);

    // Put the contact action inside the closing CTA band
    var mailCta = el("partner-cta-mail");
    if (mailCta) {
      if (c.settings.email && c.settings.email.indexOf("@") !== -1) {
        mailCta.href = "mailto:" + c.settings.email;
        mailCta.textContent = "Email the board";
        mailCta.classList.remove("hidden");
      } else {
        mailCta.classList.add("hidden");
      }
    }
    // Sponsorship packet download, if the board provides one in Settings
    var packet = el("sponsor-packet");
    if (packet) {
      var pUrl = safeUrl(c.settings.sponsorpacket);
      if (pUrl) {
        packet.innerHTML = '<a class="btn btn-ghost" href="' + esc(pUrl) + '"' + linkTarget(pUrl) + '>Download our sponsorship one-pager (PDF)</a>';
      } else {
        packet.innerHTML = "";
      }
    }

    var s = splitEvents(c.events);
    var collabs = s.past.filter(function (ev) { return (ev.partner || "").trim(); }).slice(0, 6);
    if (el("collab-list")) {
      el("collab-list").innerHTML = collabs.length ? collabs.map(function (ev) {
        return memoryCard(ev);
      }).join("") :
        '<div class="empty-state"><p>Firm collaborations will appear here as events are added.</p></div>';
    }

    renderBoardGrid("board-grid", c);

    renderContact(c, "partner-contact");
  }

  /* ---------- boot ---------- */

  var RENDERERS = {
    home: renderHome, events: renderEvents, announcements: renderAnnouncements,
    opportunities: renderOpportunities, join: renderJoin, links: renderLinks,
    about: renderAbout, partners: renderPartners
  };

  function renderAll(content) {
    window.ATS = content;
    enrichImpact(content);
    renderChrome(content);
    var page = document.body.getAttribute("data-page");
    if (RENDERERS[page]) RENDERERS[page](content);
    injectJsonLd(content);
    revealAll();
  }

  var CACHE_KEY = "ats-content-cache";

  document.addEventListener("DOMContentLoaded", function () {
    var hasSheet = !!((window.ATS_CONFIG && window.ATS_CONFIG.sheetId) || "").trim();
    var instant = JSON.parse(JSON.stringify(window.ATS_DEFAULT || {}));
    instant._live = false;

    if (hasSheet) {
      // Sheet configured: render the last successful sheet content instantly
      // (stale-while-revalidate — no blank page while Google answers),
      // otherwise paint the chrome, then refresh from the live sheet.
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (e) { /* private mode */ }
      if (cached && cached.settings && cached.events) {
        cached._live = true;
        renderAll(cached);
      } else {
        renderChrome(instant);
      }
      window.ATS_loadContent().then(function (content) {
        renderAll(content);
        if (content && content._live) {
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(content)); } catch (e) { /* storage full/blocked */ }
        }
      });
    } else {
      // No sheet yet: everything renders instantly from built-in content.
      renderAll(instant);
    }
  });
})();
