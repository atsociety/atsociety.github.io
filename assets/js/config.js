/* ============================================================
   SITE CONFIGURATION — the one file you edit after setup.
   ============================================================
   sheetId: the ID of your "ATS Website Content" Google Sheet.
   It's the long code in the sheet's web address, between /d/ and /edit:
   https://docs.google.com/spreadsheets/d/ THIS-LONG-CODE /edit
   The sheet must be shared as "Anyone with the link — Viewer".
   Leave it as "" and the site shows its built-in sample content.
   ============================================================ */

window.ATS_CONFIG = {
  sheetId: "",
  photoBase: "assets/img/photos/",

  /* Archive cards show an "N attended" badge for every event with a
     recorded headcount. Raise this number to hide counts below it
     (e.g. 15 shows only events with 15+ attendees). */
  attendanceBadgeMin: 0
};
