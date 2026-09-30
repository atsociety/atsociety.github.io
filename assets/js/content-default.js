/* ============================================================
   BUILT-IN CONTENT
   ============================================================
   The live site reads content from your Google Sheet (see config.js).
   This file is the safety net: if the sheet isn't connected or can't
   be reached, the site shows this instead of breaking.
   The event history, board, stats, and links below are REAL
   (from the club's ATS Overview deck, Aug 2026). Items marked
   [SAMPLE]/[PLACEHOLDER] are still stand-ins.
   ============================================================ */

window.ATS_DEFAULT = {

  settings: {
    clubname: "Accounting & Tax Society",
    clubshort: "ATS",
    tagline: "Built by students, for students. Connecting you to real-world opportunities.",
    email: "acctandtaxsocietygsu@gmail.com",
    instagram: "https://www.instagram.com/acctandtaxsocietygsu/",
    groupme: "https://groupme.com/join_group/99381560/o0oduSKH",
    pin: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society",
    meetinginfo: "Our events run Mondays at 6:00 PM at 55 Park Place. The room gets announced in the GroupMe the week of each event.",
    /* ▼▼ THE APPLICATION FORM: this one line feeds every Apply button ▼▼
       Everything marked {{apply}} below (the announcement and all three open
       positions) points here. To swap forms later, change only this line,
       or, on the live site, the Google Sheet's Settings tab > Board App Form. */
    boardappform: "https://forms.gle/NuAVdqNxuFkcm94G8",
    interestform: "",
    contactform: "",
    sponsorpacket: ""
  },

  /* Real event history: Fall 2024, Spring 2025, Fall 2025 (attendance from club records).
     Add Fall 2026 events here or, better, in the Google Sheet's Events tab. */
  events: [
    /* ---- Fall 2026 (upcoming, from the Event Management System V4.2) ---- */
    { title: "Fall Refresher", date: "2026-08-31", time: "6:00–7:15 PM", location: "55 Park Place", type: "Info Session", partner: "", description: "What's new in ATS this year, how the club works, and what's coming this fall. Good for returning members and first-timers both.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Inside Public Accounting: Careers Panel", date: "2026-09-14", time: "6:00–7:15 PM", location: "55 Park Place", type: "Panel", partner: "Deloitte", description: "Professionals from several firms on what public accounting actually looks like after graduation: the service lines, the departments, and how people end up picking one.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Trivia with Firms", date: "2026-09-21", time: "6:00–7:15 PM", location: "55 Park Place", type: "Social", partner: "", description: "Students and firm reps compete in accounting and business trivia while getting to know each other.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Mid-Tier Firm Spotlight", date: "2026-09-28", time: "6:00–7:15 PM", location: "55 Park Place", type: "Panel", partner: "", description: "One mid-tier firm up close: the work, the culture, the clients, internships, and how promotions really happen.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Coffee & Credits", date: "2026-10-05", time: "6:00–8:30 PM", location: "55 Park Place", type: "Networking", partner: "KPMG · WBL", description: "Round-robin coffee chats. You rotate between professionals, get real practice at the conversation, and leave with a few contacts.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "M&A Simulation", date: "2026-10-12", time: "6:00–7:15 PM", location: "55 Park Place", type: "Workshop", partner: "", description: "A team-based mini acquisition case: evaluate a company and pitch buy, pass, or renegotiate.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Budget Battle: The Financial Survival Challenge", date: "2026-10-19", time: "6:00–7:15 PM", location: "55 Park Place", type: "Workshop", partner: "", description: "A fast team competition built on real financial decisions: housing, debt, emergencies, investing. Every choice you make moves your balance.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Meet Turner & Townsend: Accounting & Consulting Careers", date: "2026-10-26", time: "6:00–7:15 PM", location: "55 Park Place", type: "Panel", partner: "Turner & Townsend", description: "Careers that use accounting skills in consulting, cost management, and project budgeting.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "CPA, CMA, CFA: Life after Graduation", date: "2026-11-02", time: "6:00–7:15 PM", location: "55 Park Place", type: "Info Session", partner: "", description: "Which credential fits which career, explained by people who hold them.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Tax Myths & Facts", date: "2026-11-09", time: "6:00–7:15 PM", location: "55 Park Place", type: "Info Session", partner: "", description: "Clearing up the biggest misconceptions about tax work, plus the tax careers (and side hustles) open to students.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Game Night with Professors", date: "2026-11-16", time: "6:00–7:15 PM", location: "55 Park Place", type: "Social", partner: "", description: "Students against professors: games, trivia, and some friendly competition outside the classroom.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },
    { title: "Spring Recruiter Preview", date: "2026-11-30", time: "6:00–7:45 PM", location: "55 Park Place", type: "Networking", partner: "WBL", description: "Recruiters on when spring positions open, what they look for, and what to finish over winter break.", rsvp: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", photos: "", attendance: "" },

    /* ---- Spring 2026 (attendance from PIN records) ---- */
    { title: "ATS Spring Refresh", date: "2026-02-02", time: "6:00–7:30 PM", location: "55 Park Place", type: "Professional Development", partner: "", description: "Resume polish, LinkedIn updates, and a recruiting game plan for the semester ahead.", rsvp: "", photos: "", attendance: "17" },
    { title: "CPA Pathways", date: "2026-02-05", time: "5:00–6:00 PM", location: "55 Park Place", type: "Info Session", partner: "Becker", description: "CPA exam structure, timelines, and prep strategy with a senior Becker instructor. Co-hosted with BAP and NABA.", rsvp: "", photos: "", attendance: "30" },
    { title: "Build Your Professional Brand", date: "2026-02-09", time: "6:00–7:15 PM", location: "55 Park Place", type: "Professional Development", partner: "", description: "How to present yourself to recruiters, online and in the room.", rsvp: "", photos: "", attendance: "10" },
    { title: "Case Study with ATS", date: "2026-02-16", time: "6:00–7:15 PM", location: "55 Park Place", type: "Workshop", partner: "", description: "A hands-on accounting case worked in teams.", rsvp: "", photos: "", attendance: "18" },
    { title: "Tax Talk: Tax Tech & Automation", date: "2026-02-23", time: "6:00–7:15 PM", location: "55 Park Place", type: "Tax Talk", partner: "Aprio", description: "How SAP, Alteryx, Excel macros, and AI are changing tax work. Live demos from an Aprio professional, plus a hands-on mini challenge.", rsvp: "", photos: "", attendance: "18" },
    { title: "Opportunities Beyond CPA", date: "2026-03-02", time: "6:00–7:15 PM", location: "55 Park Place", type: "Info Session", partner: "", description: "Career paths accounting majors tend to overlook: advisory, industry, government, and more.", rsvp: "", photos: "", attendance: "15" },
    { title: "Internship Roadmap", date: "2026-03-09", time: "6:00–7:15 PM", location: "55 Park Place", type: "Panel", partner: "Smith + Howard · EY · BDO", description: "A recruiter panel on landing your first accounting internship: timelines, outreach, career-fair strategy, and what to do when an offer comes in.", rsvp: "", photos: "", attendance: "20" },
    { title: "Social Night: Accounting Trivia", date: "2026-03-30", time: "6:00–7:00 PM", location: "55 Park Place", type: "Social", partner: "", description: "Trivia night, accounting edition.", rsvp: "", photos: "", attendance: "11" },
    { title: "Coffee & Credits", date: "2026-04-13", time: "6:00–8:00 PM", location: "55 Park Place", type: "Networking", partner: "Deloitte · WBL", description: "Round-robin coffee chats with eight professionals from Deloitte and WBL. Our best-attended spring event.", rsvp: "", photos: "", attendance: "39" },

    /* ---- Fall 2024 (the founding semester) ---- */
    { title: "Welcome to the Accounting & Tax Society", date: "2024-09-09", time: "", location: "", type: "Kickoff", partner: "", description: "Our very first event as a club.", rsvp: "", photos: "", attendance: "35" },
    { title: "PwC Event with NABA & BAP", date: "2024-09-12", time: "", location: "", type: "Firm Event", partner: "PwC", description: "", rsvp: "", photos: "", attendance: "23" },
    { title: "Route to CPA with BAP", date: "2024-09-23", time: "", location: "", type: "Firm Event", partner: "Deloitte", description: "", rsvp: "", photos: "", attendance: "21" },
    { title: "Tax 101", date: "2024-10-07", time: "", location: "", type: "Tax Talk", partner: "GSU", description: "", rsvp: "", photos: "", attendance: "20" },
    { title: "Bank of America Event", date: "2024-10-21", time: "", location: "", type: "Firm Event", partner: "Bank of America", description: "", rsvp: "", photos: "", attendance: "15" },
    { title: "Movie Night at Cinefest with BAP & NABA", date: "2024-10-24", time: "", location: "", type: "Social", partner: "", description: "", rsvp: "", photos: "", attendance: "15" },
    { title: "Comparing the Presidential Tax Plans", date: "2024-11-04", time: "", location: "", type: "Tax Talk", partner: "KPMG", description: "", rsvp: "", photos: "", attendance: "12" },
    { title: "Accounting Thanksgiving Potluck with BAP & NABA", date: "2024-11-18", time: "", location: "", type: "Social", partner: "", description: "", rsvp: "", photos: "", attendance: "25" },
    { title: "End of Semester Celebration", date: "2024-12-02", time: "", location: "", type: "Social", partner: "", description: "", rsvp: "", photos: "", attendance: "11" },

    /* ---- Spring 2025 ---- */
    { title: "Professional Development Event", date: "2025-01-27", time: "", location: "", type: "Professional Development", partner: "", description: "", rsvp: "", photos: "", attendance: "17" },
    { title: "Love for Accounting", date: "2025-02-10", time: "", location: "", type: "Social", partner: "", description: "", rsvp: "", photos: "", attendance: "15" },
    { title: "Grant Thornton Event", date: "2025-02-20", time: "", location: "", type: "Firm Event", partner: "Grant Thornton", description: "", rsvp: "", photos: "", attendance: "27" },
    { title: "Tax Talk: Federal Tax", date: "2025-02-24", time: "", location: "", type: "Tax Talk", partner: "", description: "", rsvp: "", photos: "", attendance: "15" },
    { title: "Master's Info Session", date: "2025-03-03", time: "", location: "", type: "Info Session", partner: "", description: "", rsvp: "", photos: "", attendance: "18" },
    { title: "Forensic Accounting & Fraud", date: "2025-03-10", time: "", location: "", type: "Workshop", partner: "", description: "", rsvp: "", photos: "", attendance: "18" },
    { title: "Accounting Panel with BAP", date: "2025-03-13", time: "", location: "", type: "Panel", partner: "EY · PwC · Delta · GSU", description: "", rsvp: "", photos: "", attendance: "36" },
    { title: "Tax Talk: ESG", date: "2025-03-24", time: "", location: "", type: "Tax Talk", partner: "TEI · Koch Industries · GSU", description: "", rsvp: "", photos: "", attendance: "19" },
    { title: "Past, Present & Future of Accounting with EY", date: "2025-03-31", time: "", location: "", type: "Firm Event", partner: "EY", description: "", rsvp: "", photos: "", attendance: "13" },
    { title: "End of Year Celebration", date: "2025-04-07", time: "", location: "", type: "Social", partner: "", description: "", rsvp: "", photos: "", attendance: "25" },

    /* ---- Fall 2025 ---- */
    { title: "Fall Kick-off", date: "2025-09-08", time: "", location: "", type: "Kickoff", partner: "EY · Deloitte · KPMG · Rödl · BDO · Grant Thornton", description: "Six firms on campus to open the year. Our biggest kickoff yet.", rsvp: "", photos: "", attendance: "94" },
    { title: "Interviewing 101 & Resume Reviews", date: "2025-09-15", time: "", location: "", type: "Professional Development", partner: "BDO", description: "", rsvp: "", photos: "", attendance: "25" },
    { title: "Night with the Big 4", date: "2025-09-22", time: "", location: "", type: "Firm Event", partner: "EY · Deloitte · KPMG · PwC", description: "Our flagship. All four firms on campus for panels, networking, and recruiting conversations, with 93 students in the room.", rsvp: "", photos: "", attendance: "93" },
    { title: "Tax Talk: Property Tax with Ryan", date: "2025-09-23", time: "", location: "", type: "Tax Talk", partner: "Ryan", description: "", rsvp: "", photos: "", attendance: "60" },
    { title: "Meeting Smith + Howard", date: "2025-09-29", time: "", location: "", type: "Firm Event", partner: "Smith + Howard", description: "", rsvp: "", photos: "", attendance: "28" },
    { title: "Journey of Accounting", date: "2025-10-06", time: "", location: "", type: "Firm Event", partner: "EY", description: "", rsvp: "", photos: "", attendance: "40" },
    { title: "Mid-Semester Check-In", date: "2025-10-13", time: "", location: "", type: "General Meeting", partner: "", description: "", rsvp: "", photos: "", attendance: "16" },
    { title: "Consulting & Advisory Meeting", date: "2025-10-20", time: "", location: "", type: "Info Session", partner: "", description: "", rsvp: "", photos: "", attendance: "35" },
    { title: "Industry Night", date: "2025-10-27", time: "", location: "", type: "Firm Event", partner: "Truist · BankUnited", description: "", rsvp: "", photos: "", attendance: "25" },
    { title: "Tax Talk: OBBBA & VITA", date: "2025-11-03", time: "", location: "", type: "Tax Talk", partner: "", description: "", rsvp: "", photos: "", attendance: "30" },
    { title: "What is Technical Accounting?", date: "2025-11-10", time: "", location: "", type: "Workshop", partner: "Frazier & Deeter", description: "", rsvp: "", photos: "", attendance: "23" },
    { title: "Accounting Thanksgiving", date: "2025-11-20", time: "", location: "", type: "Social", partner: "", description: "", rsvp: "", photos: "", attendance: "47" }
  ],

  announcements: [
    {
      /* ▼ PASTE THE GOOGLE FORM LINK IN "link" BELOW (replace join.html#positions).
         Do the same in the Positions tab's Apply Link column. */
      date: "2026-08-16", title: "Applications are open: the ATS Associate Board",
      message: "We're launching the Associate Board, our program for freshmen and sophomores who want in early. Each associate is paired with an officer, learns how the club actually runs, and is leading real event tasks by the end of the semester. It's also the most direct route onto next year's board. Apply below. There aren't many spots.",
      link: "{{apply}}"
    },
    {
      date: "2026-08-14", title: "The Fall 2026 calendar is live. First up is the Fall Refresher on Aug 31",
      message: "All twelve events for the semester are posted: firm panels, hands-on workshops, Coffee & Credits, and Budget Battle. RSVP on PIN and join the GroupMe, where we announce the room the week of each event.",
      link: "events.html"
    }
  ],

  /* Real internships and scholarships go here as firms share them;
     the page shows an honest "nothing posted right now" state while empty. */
  opportunities: [],

  board: [
    { name: "Karam Kraga", role: "Chairman", linkedin: "https://www.linkedin.com/in/karamkraga/", photo: "karam.jpg", order: "1" },
    { name: "Frank Albeer", role: "President", linkedin: "https://www.linkedin.com/in/frank-albeer/", photo: "frank.jpg", order: "2" },
    { name: "Andres Vazquez", role: "Vice President", linkedin: "https://www.linkedin.com/in/andres-vazquez-456b8a307/", photo: "andres.jpg", order: "3" },
    { name: "D'Ahni Banks", role: "Chief Financial Officer", linkedin: "https://www.linkedin.com/in/dahnibanks/", photo: "dahni.jpg", order: "4" },
    { name: "Harshi Pandiri", role: "Chief Marketing Officer", linkedin: "https://www.linkedin.com/in/harshitha-pandiri1/", photo: "harshi.jpg", order: "5" },
    { name: "Phuong Truong", role: "Chief Professional Development Officer", linkedin: "https://www.linkedin.com/in/phuongtruongha/", photo: "phuong.jpg", order: "6" },
    { name: "Jakarta Crafton", role: "Chief Events Officer", linkedin: "https://www.linkedin.com/in/jakarta-crafton-ii-a50b87383/", photo: "jakarta.jpg", order: "7" },
    { name: "Sofia Eraydin", role: "Chief Operating Officer", linkedin: "https://www.linkedin.com/in/sofiaaeraydin-atl/", photo: "sofia.jpg", order: "8" }
  ],

  positions: [
    {
      /* ▼ PASTE THE GOOGLE FORM LINK IN "link" BELOW and the Apply button appears. */
      role: "Associate Board Member",
      description: "Our program for freshmen and sophomores who want in early. You get paired with an officer, learn how the club runs from the inside, and are running real event tasks by the end of the semester. It's also the most direct route onto next year's board. No experience needed. Show up and care.",
      deadline: "", link: "{{apply}}"
    }
  ],

  links: [
    { label: "Instagram", url: "https://www.instagram.com/acctandtaxsocietygsu/", order: "1" },
    { label: "GroupMe", url: "https://groupme.com/join_group/99381560/o0oduSKH", order: "2", sub: "470+ students. Join the chat" },
    { label: "PIN (Panther Involvement Network)", url: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", order: "3", sub: "Our official GSU page. Join here" },
    { label: "Email the board", url: "mailto:acctandtaxsocietygsu@gmail.com", order: "4" },
    { label: "RSVP for the next event", url: "https://pin.gsu.edu/actioncenter/organization/accounting-and-tax-society", order: "5", sub: "Event RSVPs run through PIN" },
    /* Delete this row when applications close. */
    { label: "Apply to the board", url: "{{apply}}", order: "6", sub: "Associate Board applications, open now" }
  ],

  faq: [
    { question: "Who can join ATS?", answer: "Any Georgia State student. Most of our members are accounting majors, but anyone interested in accounting, tax, or finance is welcome, including freshmen who haven't declared yet.", order: "1" },
    { question: "How do I become a member?", answer: "Add us on PIN, our official GSU page. The link is on the homepage and the Links page. Then join the GroupMe. That's it. It's free, there are no dues, and there's no application.", order: "2" },
    { question: "What should I wear? Is there food?", answer: "Casual is fine for socials and workshops. Business casual for firm nights. And yes, there's usually food. Details for each event go out in the GroupMe that week.", order: "6" },
    { question: "When and where are events?", answer: "Mondays at 6:00 PM at 55 Park Place. The room changes by event and gets announced in the GroupMe and on the event's PIN page. Not every Monday has an event, so check the calendar.", order: "3" },
    { question: "I'm a freshman or sophomore. Is it too early?", answer: "No. Firms recruit earlier every year, and our events are how you get in front of them before you ever apply.", order: "4" },
    { question: "How do I hear about events?", answer: "Announcements go up here, on Instagram, and in the GroupMe. RSVPs run through our PIN page.", order: "5" }
  ],

  impact: {
    members: "440+",       /* registered on PIN (444 at last count) */
    community: "470+",     /* students in the GroupMe */
    attendances: "",       /* blank = total headcount summed automatically from past events */
    events: "",            /* blank = counted automatically from the Events list */
    firms: ""              /* blank = counted automatically from event partners */
  }
};
