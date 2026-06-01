const STORAGE_KEY = "study-os-full-app-v2";
const MS_DAY = 24 * 60 * 60 * 1000;

let state = loadState();
state = normalizeState(state);
let activeExamId = null;
let modalSubmit = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function uid(prefix = "id") {
  const part = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${part}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseDate(iso) {
  const [year, month, day] = String(iso).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isoDate(date = new Date()) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDate(iso, options = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!iso) return "-";
  return parseDate(iso).toLocaleDateString([], options);
}

function formatTime(time) {
  if (!time) return "-";
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function timeToMinutes(time) {
  if (!time) return 0;
  const [hour, minute] = time.split(":").map(Number);
  return (hour * 60) + minute;
}

function durationHours(item) {
  const start = timeToMinutes(item.start);
  const end = timeToMinutes(item.end);
  if (!start || !end || end <= start) return 0;
  return (end - start) / 60;
}

function daysUntil(iso) {
  if (!iso) return 0;
  const today = parseDate(isoDate());
  const target = parseDate(iso);
  return Math.ceil((target - today) / MS_DAY);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const loaded = JSON.parse(raw);
    if (loaded.version !== 2) return createSeedState();
    return loaded;
  } catch {
    return createSeedState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The app still runs if browser storage is disabled; it just will not persist.
  }
}

function normalizeState(data) {
  const defaults = {
    enabled: false,
    classes: true,
    exams: true,
    events: true,
    activities: true,
    revision: true,
    focus: true,
    classMinutes: [30, 5],
    activityMinutes: [15, 5],
    examDays: [7, 2, 1, 0],
    eventDays: [1, 0],
    revisionHour: 19,
    sent: {}
  };
  data.notifications = {
    ...defaults,
    ...(data.notifications || {}),
    sent: data.notifications?.sent || {}
  };
  return data;
}

function createSeedState() {
  const physics = uid("sub");
  const chemistry = uid("sub");
  const maths = uid("sub");
  const biology = uid("sub");
  const english = uid("sub");
  const hindi = uid("sub");
  const spanish = uid("sub");
  const french = uid("sub");

  const phyCh = uid("chap");
  const chemCh = uid("chap");
  const mathCh = uid("chap");
  const bioCh = uid("chap");
  const engCh = uid("chap");
  const hindiCh = uid("chap");
  const spanishCh = uid("chap");
  const frenchCh = uid("chap");

  const electro = uid("topic");
  const solutions = uid("topic");
  const real = uid("topic");
  const binomial = uid("topic");
  const cell = uid("topic");
  const letter = uid("topic");

  const pa1 = uid("exam");
  const unit = uid("exam");
  const half = uid("exam");

  return {
    version: 2,
    profile: {
      name: "Aanya",
      quote: "Discipline today, success tomorrow."
    },
    focus: {
      minutes: 25,
      running: false,
      endsAt: null,
      message: "Ready to study"
    },
    notifications: {
      enabled: false,
      classes: true,
      exams: true,
      events: true,
      activities: true,
      revision: true,
      focus: true,
      classMinutes: [30, 5],
      activityMinutes: [15, 5],
      examDays: [7, 2, 1, 0],
      eventDays: [1, 0],
      revisionHour: 19,
      sent: {}
    },
    subjects: [
      { id: physics, name: "Physics", code: "PHY", color: "violet" },
      { id: chemistry, name: "Chemistry", code: "CHEM", color: "teal" },
      { id: maths, name: "Maths", code: "MATH", color: "amber" },
      { id: biology, name: "Biology", code: "BIO", color: "green" },
      { id: english, name: "English", code: "ENG", color: "pink" }
    ],
    chapters: [
      { id: phyCh, subjectId: physics, name: "Chapter 1 - Electrostatics" },
      { id: chemCh, subjectId: chemistry, name: "Chapter 1 - Solutions" },
      { id: mathCh, subjectId: maths, name: "Chapter 1 - Real Numbers" },
      { id: bioCh, subjectId: biology, name: "Chapter 1 - Cell Structure" },
      { id: engCh, subjectId: english, name: "Writing Skills" }
    ],
    topics: [
      { id: electro, chapterId: phyCh, name: "Electrostatics", status: "Not Started", startedAt: "", completedAt: "", difficulty: "", understanding: "" },
      { id: solutions, chapterId: chemCh, name: "Solutions", status: "Not Started", startedAt: "", completedAt: "", difficulty: "", understanding: "" },
      { id: real, chapterId: mathCh, name: "Real Numbers", status: "Studying", startedAt: new Date().toISOString(), completedAt: "", difficulty: "Medium", understanding: "Maybe" },
      { id: binomial, chapterId: mathCh, name: "Binomial Theorem", status: "Not Started", startedAt: "", completedAt: "", difficulty: "", understanding: "" },
      { id: cell, chapterId: bioCh, name: "Cell Structure", status: "Not Started", startedAt: "", completedAt: "", difficulty: "", understanding: "" },
      { id: letter, chapterId: engCh, name: "Formal Letter", status: "Completed", startedAt: "", completedAt: new Date().toISOString(), difficulty: "Easy", understanding: "Yes" }
    ],
    exams: [
      { id: pa1, name: "PA-1", date: addDays(2), priority: "High", pinned: true, syllabusTopicIds: [electro, solutions, real, binomial, cell] },
      { id: unit, name: "Unit Test", date: addDays(12), priority: "Medium", pinned: false, syllabusTopicIds: [real, binomial] },
      { id: half, name: "Half Yearly", date: addDays(28), priority: "Medium", pinned: false, syllabusTopicIds: [electro, solutions, real, binomial, cell, letter] }
    ],
    classes: [
      { id: uid("cls"), date: isoDate(), subjectId: physics, topicId: electro, start: "08:00", end: "09:30" },
      { id: uid("cls"), date: isoDate(), subjectId: chemistry, topicId: solutions, start: "10:00", end: "11:30" },
      { id: uid("cls"), date: isoDate(), subjectId: maths, topicId: binomial, start: "16:00", end: "17:30" }
    ],
    events: [
      { id: uid("evt"), title: "Syllabus review", date: addDays(1), type: "Event", importance: "Important" },
      { id: uid("evt"), title: "Past paper practice", date: addDays(5), type: "Deadline", importance: "Normal" }
    ],
    activities: [
      { id: uid("act"), date: isoDate(), title: "Physics - Electrostatics", type: "Study", subjectId: physics, chapterId: phyCh, topicId: electro, start: "08:00", end: "09:30", done: true },
      { id: uid("act"), date: isoDate(), title: "Chemistry - Solutions", type: "Study", subjectId: chemistry, chapterId: chemCh, topicId: solutions, start: "10:00", end: "11:30", done: true },
      { id: uid("act"), date: isoDate(), title: "Break", type: "Break", subjectId: "", chapterId: "", topicId: "", start: "11:30", end: "12:00", done: true },
      { id: uid("act"), date: isoDate(), title: "Maths - Binomial Theorem", type: "Study", subjectId: maths, chapterId: mathCh, topicId: binomial, start: "12:00", end: "13:00", done: false },
      { id: uid("act"), date: isoDate(), title: "Biology - Cell Structure", type: "Study", subjectId: biology, chapterId: bioCh, topicId: cell, start: "14:00", end: "16:00", done: false },
      { id: uid("act"), date: isoDate(), title: "Online Class - Maths", type: "Class", subjectId: maths, chapterId: mathCh, topicId: binomial, start: "16:00", end: "17:30", done: false },
      { id: uid("act"), date: isoDate(), title: "Revision", type: "Revision", subjectId: maths, chapterId: mathCh, topicId: real, start: "18:00", end: "19:00", done: false }
    ],
    tasks: [
      { id: uid("task"), text: "Plan my week", done: true },
      { id: uid("task"), text: "Update timetable", done: true },
      { id: uid("task"), text: "Update online classes", done: false },
      { id: uid("task"), text: "Fill study goals", done: false },
      { id: uid("task"), text: "Check syllabus", done: true },
      { id: uid("task"), text: "Plan revision", done: false }
    ],
    notes: [
      { id: uid("note"), text: "Stay consistent" },
      { id: uid("note"), text: "Quality > Quantity" },
      { id: uid("note"), text: "Focus on understanding" },
      { id: uid("note"), text: "Revise daily" },
      { id: uid("note"), text: "Past papers" }
    ],
    ui: {
      selectedSubjectId: maths,
      selectedChapterId: mathCh,
      selectedTopicId: real,
      calendarMonth: isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    }
  };
}

function subjectOfChapter(chapterId) {
  const chapter = state.chapters.find((item) => item.id === chapterId);
  return chapter ? state.subjects.find((item) => item.id === chapter.subjectId) : null;
}

function chapterOfTopic(topic) {
  return state.chapters.find((item) => item.id === topic?.chapterId);
}

function subjectOfTopic(topic) {
  const chapter = chapterOfTopic(topic);
  return chapter ? state.subjects.find((item) => item.id === chapter.subjectId) : null;
}

function selectedTopic() {
  return state.topics.find((topic) => topic.id === state.ui.selectedTopicId) || state.topics[0] || null;
}

function sortedExams() {
  return [...state.exams].sort((a, b) => parseDate(a.date) - parseDate(b.date));
}

function selectedExam() {
  const upcoming = sortedExams().filter((exam) => daysUntil(exam.date) >= 0);
  const pinned = upcoming.find((exam) => exam.pinned);
  const urgent = upcoming.find((exam) => daysUntil(exam.date) < 2);
  return pinned || urgent || upcoming[0] || sortedExams()[0] || null;
}

function priorityForExam(exam) {
  if (!exam) return "None";
  const left = daysUntil(exam.date);
  return left >= 0 && left < 2 ? "Urgent" : exam.priority;
}

function render() {
  ensureSelection();
  renderGreeting();
  renderSyllabus();
  renderExam();
  renderCalendar();
  renderClasses();
  renderStudyTracker();
  renderWeekPlanner();
  renderDailyTracker();
  renderStudyBox();
  renderRevision();
  renderNotes();
  renderManagers();
  saveState();
}

function ensureSelection() {
  if (!state.subjects.some((item) => item.id === state.ui.selectedSubjectId)) {
    state.ui.selectedSubjectId = state.subjects[0]?.id || "";
  }
  const chapters = state.chapters.filter((item) => item.subjectId === state.ui.selectedSubjectId);
  if (!chapters.some((item) => item.id === state.ui.selectedChapterId)) {
    state.ui.selectedChapterId = chapters[0]?.id || "";
  }
  const topics = state.topics.filter((item) => item.chapterId === state.ui.selectedChapterId);
  if (!topics.some((item) => item.id === state.ui.selectedTopicId)) {
    state.ui.selectedTopicId = topics[0]?.id || "";
  }
}

function renderGreeting() {
  const hour = new Date().getHours();
  const label = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  $("#greetingTitle").textContent = `${label}, ${state.profile.name}!`;
  $("#quoteText").textContent = `"${state.profile.quote}"`;
}

function renderSyllabus() {
  const exam = selectedExam();
  const box = $("#syllabusContent");
  if (!exam) {
    box.innerHTML = `<p class="empty-state">Add your first exam to build a syllabus.</p>`;
    return;
  }

  $("#syllabusSubheading").textContent = `(${exam.name})`;
  const topics = exam.syllabusTopicIds
    .map((id) => state.topics.find((topic) => topic.id === id))
    .filter(Boolean);
  const completed = topics.filter((topic) => topic.status === "Completed").length;
  const percent = topics.length ? Math.round((completed / topics.length) * 100) : 0;
  const grouped = state.subjects.map((subject) => {
    const names = topics
      .filter((topic) => subjectOfTopic(topic)?.id === subject.id)
      .map((topic) => topic.name);
    return names.length ? `<p><strong>${escapeHTML(subject.name)}</strong>: ${escapeHTML(names.join(", "))}</p>` : "";
  }).join("");

  box.innerHTML = `
    <div class="box-title">
      <strong>${escapeHTML(exam.name)}</strong>
      <button type="button" data-action="open-add-syllabus" aria-label="Add syllabus item"><span data-icon="spark"></span></button>
    </div>
    ${grouped || `<p class="empty-state">No syllabus topics yet.</p>`}
    <div class="progress"><span style="width:${percent}%"></span></div>
    <small>${percent}% Completed (${completed}/${topics.length || 0})</small>
  `;
}

function renderExam() {
  const exam = selectedExam();
  activeExamId = exam?.id || null;
  if (!exam) {
    $("#examNameMain").textContent = "No Exam";
    $("#examPriority").textContent = "Add one";
    $("#examBadge").textContent = "Empty";
    $("#miniExams").innerHTML = `<p>Add exams to start the countdown.</p>`;
    return;
  }

  $("#examNameMain").textContent = exam.name;
  $("#examPriority").textContent = `Priority: ${priorityForExam(exam)}`;
  $("#examBadge").textContent = exam.pinned ? "Pinned" : daysUntil(exam.date) < 2 ? "Auto Urgent" : "Nearest";
  const all = sortedExams().map((item) => {
    const left = daysUntil(item.date);
    const label = left < 0 ? "done" : `${left} days`;
    return `<button type="button" class="${item.id === exam.id ? "active" : ""}" data-action="pin-exam" data-id="${item.id}">
      ${escapeHTML(item.name)} <span>${escapeHTML(label)}</span>
    </button>`;
  }).join("");
  $("#miniExams").innerHTML = `<p>Other Upcoming Exams</p>${all || ""}<button type="button" class="round" data-action="open-add-exam" aria-label="Add exam"><span data-icon="chevron-right"></span></button>`;
  updateCountdown();
}

function updateCountdown() {
  const exam = activeExamId ? state.exams.find((item) => item.id === activeExamId) : selectedExam();
  const slots = ["#days", "#hours", "#minutes", "#seconds"].map((id) => $(id));
  const hourglass = $(".hourglass");
  
  if (!exam) {
    slots.forEach((slot) => { slot.textContent = "00"; });
    if (hourglass) hourglass.style.setProperty("--sand-progress", "0%");
    return;
  }
  
  const target = new Date(`${exam.date}T08:00:00`);
  const totalTime = target.getTime() - new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).getTime();
  const remaining = Math.max(0, target - new Date());
  const secondsTotal = Math.floor(remaining / 1000);
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal % 86400) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;
  
  slots[0].textContent = String(days).padStart(2, "0");
  slots[1].textContent = String(hours).padStart(2, "0");
  slots[2].textContent = String(minutes).padStart(2, "0");
  slots[3].textContent = String(seconds).padStart(2, "0");
  
  // Update hourglass animation: faster as exam approaches
  if (hourglass) {
    const progressPercent = Math.max(0, Math.min(100, 100 - ((remaining / totalTime) * 100)));
    hourglass.style.setProperty("--sand-progress", progressPercent + "%");
    // Faster animation for urgent exams
    const urgency = daysUntil(exam.date);
    const animSpeed = urgency < 2 ? 2 : urgency < 7 ? 3 : 4;
    hourglass.style.setProperty("--anim-speed", animSpeed + "s");
  }
}

function renderCalendar() {
  const grid = $("#calendarGrid");
  const month = parseDate(state.ui.calendarMonth);
  const monthName = month.toLocaleDateString([], { month: "long", year: "numeric" });
  $("#monthLabel").textContent = monthName;

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);

  const headings = ["M", "T", "W", "T", "F", "S", "S"].map((day) => `<b>${day}</b>`).join("");
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = isoDate(date);
    const inMonth = date.getMonth() === month.getMonth();
    const exams = state.exams.filter((exam) => exam.date === iso);
    const classes = state.classes.filter((item) => item.date === iso);
    const events = state.events.filter((event) => event.date === iso);
    const important = events.some((event) => event.importance === "Important");
    const className = [
      inMonth ? "" : "muted",
      iso === isoDate() ? "today" : "",
      exams.length ? "exam" : "",
      !exams.length && classes.length ? "class" : "",
      important ? "important" : "",
      events.length && !important ? "event" : ""
    ].filter(Boolean).join(" ");
    const title = [...exams.map((e) => e.name), ...classes.map((c) => subjectName(c.subjectId)), ...events.map((e) => e.title)].join(", ");
    cells.push(`<span class="${className}" title="${escapeHTML(title)}">${date.getDate()}</span>`);
  }
  grid.innerHTML = headings + cells.join("");
}

function renderClasses() {
  const today = isoDate();
  const list = state.classes
    .filter((item) => item.date === today)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  $("#classesTodayList").innerHTML = list.length ? list.map((item) => {
    const now = new Date();
    const current = today === item.date && timeToMinutes(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    const isLive = current >= timeToMinutes(item.start) && current <= timeToMinutes(item.end);
    return `
      <div class="class-item ${isLive ? "live" : "today"}">
        <span data-icon="monitor"></span>
        <div>
          <strong>${escapeHTML(subjectName(item.subjectId))}</strong>
          <small>${formatTime(item.start)} - ${formatTime(item.end)}</small>
          <p>${escapeHTML(topicName(item.topicId))}</p>
        </div>
        <em>${isLive ? "Live" : "Today"}</em>
      </div>`;
  }).join("") : `<p class="empty-state inset">No online classes today.</p>`;
}

function renderStudyTracker() {
  const weekStart = startOfWeek();
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return isoDate(date);
  });
  const values = dates.map((date) => state.activities
    .filter((item) => item.type === "Study" && item.date === date)
    .reduce((sum, item) => sum + durationHours(item), 0));
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => {
    const x = 28 + (index * 64);
    const y = 178 - ((value / max) * 126);
    return { x, y };
  });
  const line = points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
  const lastPoint = points[points.length - 1];
  const area = `${line} L${lastPoint.x} 210 L${points[0].x} 210 Z`;
  const total = values.reduce((sum, value) => sum + value, 0);

  $("#studyChart").innerHTML = `
    <div class="y-axis"><span>${Math.ceil(max)}h</span><span>${Math.ceil(max * 0.75)}h</span><span>${Math.ceil(max * 0.5)}h</span><span>${Math.ceil(max * 0.25)}h</span><span>0h</span></div>
    <svg viewBox="0 0 440 210" aria-label="Weekly study chart">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#cd63ff" stop-opacity=".45"/>
          <stop offset="1" stop-color="#cd63ff" stop-opacity=".03"/>
        </linearGradient>
      </defs>
      <path class="grid-line" d="M0 36H440M0 80H440M0 124H440M0 168H440"/>
      <path class="area" fill="url(#chartFill)" d="${area}"/>
      <path class="line" d="${line}"/>
      <g class="points">${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5"/>`).join("")}</g>
    </svg>
    <div class="chart-badge">${total.toFixed(1)}h</div>
  `;
  $("#studyDays").innerHTML = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => `<span>${day}</span>`).join("");
}

function renderWeekPlanner() {
  $("#weekPlannerList").innerHTML = state.tasks.length ? state.tasks.map((task) => `
    <label class="${task.done ? "done" : ""}">
      <input type="checkbox" data-action="toggle-task" data-id="${task.id}" ${task.done ? "checked" : ""}>
      <span>${escapeHTML(task.text)}</span>
      <button type="button" class="tiny-delete" data-action="delete" data-kind="tasks" data-id="${task.id}" aria-label="Delete task">x</button>
    </label>
  `).join("") : `<p class="empty-state">Add weekly tasks for Sunday planning.</p>`;
}

function renderDailyTracker() {
  const today = isoDate();
  const dayName = new Date().toLocaleDateString([], { weekday: "long" });
  $("#dailyDayLabel").textContent = `- ${dayName}`;
  $("#timeRail").innerHTML = ["08 am", "09", "10", "11", "12 pm", "01", "02", "03", "04", "05", "06", "07"].map((time) => `<span>${time.replace(" ", "<br>")}</span>`).join("");

  const items = state.activities
    .filter((item) => item.date === today)
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  if (!items.length) {
    $("#scheduleList").innerHTML = `<p class="empty-state schedule-empty">Plan your first time block.</p>`;
    return;
  }

  const blocks = items.map((item) => {
    const hour = Math.floor(timeToMinutes(item.start) / 60);
    const row = Math.max(1, Math.min(12, hour - 7));
    const type = item.type.toLowerCase();
    const blockClass = type === "class" ? "online" : type === "revision" ? "revise" : type === "break" ? "mini-line" : type === "study" ? subjectClass(item.subjectId) : "chem";
    if (item.type === "Break") {
      return `<div class="mini-line" style="--row:${row}">${escapeHTML(item.title)} <button type="button" class="block-remove" data-action="delete" data-kind="activities" data-id="${item.id}">x</button></div>`;
    }
    return `
      <div class="block ${blockClass}" style="--row:${row}">
        <strong>${escapeHTML(item.title)}</strong>
        <small>${formatTime(item.start)} - ${formatTime(item.end)}</small>
        <em>${escapeHTML(item.type)}</em>
        <button type="button" class="block-remove" data-action="delete" data-kind="activities" data-id="${item.id}" aria-label="Delete block">x</button>
      </div>`;
  }).join("");
  $("#scheduleList").innerHTML = blocks;
}

function renderStudyBox() {
  $("#subjectSelect").innerHTML = state.subjects.map((subject) => `<option value="${subject.id}" ${subject.id === state.ui.selectedSubjectId ? "selected" : ""}>${escapeHTML(subject.name)}</option>`).join("");
  const chapters = state.chapters.filter((chapter) => chapter.subjectId === state.ui.selectedSubjectId);
  $("#chapterSelect").innerHTML = chapters.map((chapter) => `<option value="${chapter.id}" ${chapter.id === state.ui.selectedChapterId ? "selected" : ""}>${escapeHTML(chapter.name)}</option>`).join("");
  const topics = state.topics.filter((topic) => topic.chapterId === state.ui.selectedChapterId);
  $("#topicSelect").innerHTML = topics.map((topic) => `<option value="${topic.id}" ${topic.id === state.ui.selectedTopicId ? "selected" : ""}>${escapeHTML(topic.name)}</option>`).join("");

  const topic = selectedTopic();
  if (!topic) {
    $("#studyCrumbs").innerHTML = "";
    $("#topicCard").innerHTML = `<p class="empty-state">Add a topic to start studying.</p>`;
    return;
  }
  const chapter = chapterOfTopic(topic);
  const subject = subjectOfTopic(topic);
  $("#studyCrumbs").innerHTML = `${escapeHTML(subject?.name || "-")} <span data-icon="chevron-right"></span> ${escapeHTML(chapter?.name || "-")} <span data-icon="chevron-right"></span> <strong>${escapeHTML(topic.name)}</strong>`;
  $("#topicCard").innerHTML = `
    <h4>${escapeHTML(topic.name)} <span>(Topic)</span></h4>
    <dl>
      <div><dt>Status</dt><dd>${escapeHTML(topic.status || "Not Started")}</dd></div>
      <div><dt>Started</dt><dd>${topic.startedAt ? new Date(topic.startedAt).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}</dd></div>
      <div><dt>Completed</dt><dd>${topic.completedAt ? new Date(topic.completedAt).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}</dd></div>
      <div><dt>Difficulty</dt><dd>${topic.difficulty ? `<mark>${escapeHTML(topic.difficulty)}</mark>` : "-"}</dd></div>
      <div><dt>Understanding</dt><dd>${topic.understanding ? `<mark class="${topic.understanding === "Yes" ? "good" : "warn"}">${escapeHTML(topic.understanding)}</mark>` : "-"}</dd></div>
    </dl>
  `;
}

function renderRevision() {
  const needs = state.topics.filter((topic) => topic.understanding === "Maybe" || topic.understanding === "No");
  $("#revisionList").innerHTML = needs.length ? needs.map((topic) => {
    const chapter = chapterOfTopic(topic);
    const subject = subjectOfTopic(topic);
    const noClass = topic.understanding === "No" ? "no" : "maybe";
    return `
      <div class="revision-item ${noClass}">
        <strong>${escapeHTML(topic.name)}</strong>
        <small>${escapeHTML(subject?.name || "")} - ${escapeHTML(chapter?.name || "")}<br>Understanding: <b>${escapeHTML(topic.understanding)}</b></small>
        <button type="button" data-action="mark-understood" data-id="${topic.id}">Mark Yes <span data-icon="chevron-right"></span></button>
      </div>`;
  }).join("") : `<p class="empty-state">No weak topics. Nice and calm.</p>`;
}

function renderNotes() {
  const container = $("#notesList");
  if (!state.notes.length) {
    container.innerHTML = `<li class="note-item"><span>Add quick reminders here.</span></li>`;
    return;
  }
  
  container.innerHTML = state.notes.map((note) => `
    <li class="note-item">
      <span>${escapeHTML(note.text)}</span>
      <button type="button" class="note-delete" data-action="delete" data-kind="notes" data-id="${note.id}" title="Delete note">×</button>
    </li>
  `).join("");
}

function renderManagers() {
  $("#libraryList").innerHTML = state.subjects.map((subject) => {
    const chapters = state.chapters.filter((chapter) => chapter.subjectId === subject.id);
    return `
      <div class="data-row">
        <strong>${escapeHTML(subject.name)}</strong>
        <small>${chapters.length} chapters - ${chapters.reduce((sum, chapter) => sum + state.topics.filter((topic) => topic.chapterId === chapter.id).length, 0)} topics</small>
        <button type="button" data-action="delete" data-kind="subjects" data-id="${subject.id}">Delete</button>
      </div>
      ${chapters.map((chapter) => `
        <div class="data-row child">
          <span>${escapeHTML(chapter.name)}</span>
          <small>${state.topics.filter((topic) => topic.chapterId === chapter.id).length} topics</small>
          <button type="button" data-action="delete" data-kind="chapters" data-id="${chapter.id}">Delete</button>
        </div>`).join("")}
    `;
  }).join("") || `<p class="empty-state">No study library yet.</p>`;

  $("#examManagerList").innerHTML = sortedExams().map((exam) => `
    <div class="data-row">
      <strong>${escapeHTML(exam.name)}</strong>
      <small>${formatDate(exam.date)} - ${escapeHTML(priorityForExam(exam))}</small>
      <button type="button" data-action="pin-exam" data-id="${exam.id}">${exam.pinned ? "Pinned" : "Pin"}</button>
      <button type="button" data-action="delete" data-kind="exams" data-id="${exam.id}">Delete</button>
    </div>
  `).join("") || `<p class="empty-state">No exams yet.</p>`;

  $("#activityManagerList").innerHTML = state.activities
    .slice()
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))
    .map((item) => `
      <div class="data-row">
        <strong>${escapeHTML(item.title)}</strong>
        <small>${formatDate(item.date)} - ${formatTime(item.start)} to ${formatTime(item.end)} - ${escapeHTML(item.type)}</small>
        <button type="button" data-action="delete" data-kind="activities" data-id="${item.id}">Delete</button>
      </div>
    `).join("") || `<p class="empty-state">No time blocks yet.</p>`;
}

function subjectName(id) {
  return state.subjects.find((item) => item.id === id)?.name || "General";
}

function topicName(id) {
  return state.topics.find((item) => item.id === id)?.name || "No topic";
}

function subjectClass(subjectId) {
  const subject = state.subjects.find((item) => item.id === subjectId);
  const value = subject?.name.toLowerCase() || "";
  if (value.includes("math")) return "math";
  if (value.includes("chem")) return "chem";
  if (value.includes("bio")) return "biology";
  return "study";
}

function options(items, selected = "", label = "name") {
  return items.map((item) => `<option value="${item.id}" ${item.id === selected ? "selected" : ""}>${escapeHTML(item[label])}</option>`).join("");
}

function topicOptions(selected = "") {
  return state.topics.map((topic) => {
    const subject = subjectOfTopic(topic)?.name || "";
    return `<option value="${topic.id}" ${topic.id === selected ? "selected" : ""}>${escapeHTML(subject)} - ${escapeHTML(topic.name)}</option>`;
  }).join("");
}

function openModal(title, html, onSubmit) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  modalSubmit = onSubmit;
  $("#modalBackdrop").hidden = false;
  $("#modalBody").querySelector("input, select, textarea")?.focus();
}

function closeModal() {
  $("#modalBackdrop").hidden = true;
  $("#modalBody").innerHTML = "";
  modalSubmit = null;
}

function formShell(fields, submitLabel = "Save") {
  return `<form class="app-form">${fields}<button type="submit" class="primary-action">${submitLabel}</button></form>`;
}

function openAddSubject() {
  openModal("Add Subject", formShell(`
    <label>Subject Name<input name="name" required placeholder="Mathematics"></label>
    <label>Subject Code<input name="code" placeholder="MATH"></label>
    <label>Color<select name="color"><option>violet</option><option>teal</option><option>amber</option><option>green</option><option>pink</option></select></label>
  `), (data) => {
    const subject = { id: uid("sub"), name: data.get("name").trim(), code: data.get("code").trim(), color: data.get("color") };
    state.subjects.push(subject);
    state.ui.selectedSubjectId = subject.id;
  });
}

function openAddChapter() {
  if (!state.subjects.length) return openAddSubject();
  openModal("Add Chapter", formShell(`
    <label>Subject<select name="subjectId">${options(state.subjects, state.ui.selectedSubjectId)}</select></label>
    <label>Chapter Name<input name="name" required placeholder="Chapter 2 - Polynomials"></label>
  `), (data) => {
    const chapter = { id: uid("chap"), subjectId: data.get("subjectId"), name: data.get("name").trim() };
    state.chapters.push(chapter);
    state.ui.selectedSubjectId = chapter.subjectId;
    state.ui.selectedChapterId = chapter.id;
  });
}

function openAddTopic() {
  if (!state.chapters.length) return openAddChapter();
  const chapterList = state.chapters.map((chapter) => ({
    id: chapter.id,
    name: `${subjectName(chapter.subjectId)} - ${chapter.name}`
  }));
  openModal("Add Topic", formShell(`
    <label>Chapter<select name="chapterId">${options(chapterList, state.ui.selectedChapterId)}</select></label>
    <label>Topic Name<input name="name" required placeholder="Euclid's Division Lemma"></label>
    <label>Difficulty<select name="difficulty"><option value="">Not Rated</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
    <label>Understanding<select name="understanding"><option value="">Not Rated</option><option>Yes</option><option>Maybe</option><option>No</option></select></label>
  `), (data) => {
    const topic = {
      id: uid("topic"),
      chapterId: data.get("chapterId"),
      name: data.get("name").trim(),
      status: "Not Started",
      startedAt: "",
      completedAt: "",
      difficulty: data.get("difficulty"),
      understanding: data.get("understanding")
    };
    state.topics.push(topic);
    state.ui.selectedChapterId = topic.chapterId;
    state.ui.selectedSubjectId = subjectOfChapter(topic.chapterId)?.id || state.ui.selectedSubjectId;
    state.ui.selectedTopicId = topic.id;
  });
}

function openAddExam() {
  openModal("Add Exam", formShell(`
    <label>Exam Name<input name="name" required placeholder="PA-2"></label>
    <label>Exam Date<input name="date" type="date" required value="${addDays(7)}"></label>
    <label>Priority<select name="priority"><option>Low</option><option>Medium</option><option selected>High</option></select></label>
    <label class="inline-check"><input name="pinned" type="checkbox"> Pin this exam</label>
  `), (data) => {
    const pinned = data.get("pinned") === "on";
    if (pinned) state.exams.forEach((exam) => { exam.pinned = false; });
    state.exams.push({
      id: uid("exam"),
      name: data.get("name").trim(),
      date: data.get("date"),
      priority: data.get("priority"),
      pinned,
      syllabusTopicIds: []
    });
  });
}

function openAddSyllabus() {
  if (!state.exams.length) return openAddExam();
  if (!state.topics.length) return openAddTopic();
  const exam = selectedExam();
  openModal("Add Syllabus Topic", formShell(`
    <label>Exam<select name="examId">${options(state.exams, exam?.id || "")}</select></label>
    <label>Topic<select name="topicId">${topicOptions()}</select></label>
  `), (data) => {
    const target = state.exams.find((item) => item.id === data.get("examId"));
    const topicId = data.get("topicId");
    if (target && !target.syllabusTopicIds.includes(topicId)) {
      target.syllabusTopicIds.push(topicId);
    }
  });
}

function openAddActivity(defaultType = "Study") {
  openModal("Add Daily Block", formShell(`
    <label>Title<input name="title" required placeholder="Maths - Real Numbers"></label>
    <label>Date<input name="date" type="date" required value="${isoDate()}"></label>
    <label>Type<select name="type"><option ${defaultType === "Study" ? "selected" : ""}>Study</option><option ${defaultType === "Class" ? "selected" : ""}>Class</option><option ${defaultType === "Revision" ? "selected" : ""}>Revision</option><option>Break</option><option>Other</option></select></label>
    <label>Subject<select name="subjectId"><option value="">General</option>${options(state.subjects, state.ui.selectedSubjectId)}</select></label>
    <label>Topic<select name="topicId"><option value="">No topic</option>${topicOptions(state.ui.selectedTopicId)}</select></label>
    <label>Start Time<input name="start" type="time" required value="18:00"></label>
    <label>End Time<input name="end" type="time" required value="19:00"></label>
  `), (data) => {
    const topic = state.topics.find((item) => item.id === data.get("topicId"));
    const chapter = topic ? chapterOfTopic(topic) : null;
    state.activities.push({
      id: uid("act"),
      date: data.get("date"),
      title: data.get("title").trim(),
      type: data.get("type"),
      subjectId: data.get("subjectId") || subjectOfTopic(topic)?.id || "",
      chapterId: chapter?.id || "",
      topicId: data.get("topicId"),
      start: data.get("start"),
      end: data.get("end"),
      done: false
    });
  });
}

function openAddClass() {
  openModal("Add Online Class", formShell(`
    <label>Date<input name="date" type="date" required value="${isoDate()}"></label>
    <label>Subject<select name="subjectId">${options(state.subjects, state.ui.selectedSubjectId)}</select></label>
    <label>Topic<select name="topicId"><option value="">No topic</option>${topicOptions(state.ui.selectedTopicId)}</select></label>
    <label>Start Time<input name="start" type="time" required value="16:00"></label>
    <label>End Time<input name="end" type="time" required value="17:30"></label>
  `), (data) => {
    const subjectId = data.get("subjectId");
    const topicId = data.get("topicId");
    state.classes.push({ id: uid("cls"), date: data.get("date"), subjectId, topicId, start: data.get("start"), end: data.get("end") });
    state.activities.push({
      id: uid("act"),
      date: data.get("date"),
      title: `Online Class - ${subjectName(subjectId)}`,
      type: "Class",
      subjectId,
      chapterId: chapterOfTopic(state.topics.find((topic) => topic.id === topicId))?.id || "",
      topicId,
      start: data.get("start"),
      end: data.get("end"),
      done: false
    });
  });
}

function openAddEvent() {
  openModal("Add Calendar Event", formShell(`
    <label>Event<input name="title" required placeholder="Submit assignment"></label>
    <label>Date<input name="date" type="date" required value="${isoDate()}"></label>
    <label>Type<select name="type"><option>Event</option><option>Deadline</option><option>Exam</option></select></label>
    <label>Importance<select name="importance"><option>Normal</option><option>Important</option></select></label>
  `), (data) => {
    state.events.push({
      id: uid("evt"),
      title: data.get("title").trim(),
      date: data.get("date"),
      type: data.get("type"),
      importance: data.get("importance")
    });
  });
}

function openAddTask() {
  openModal("Add Week Task", formShell(`
    <label>Task<input name="text" required placeholder="Revise weak topics"></label>
  `), (data) => {
    state.tasks.push({ id: uid("task"), text: data.get("text").trim(), done: false });
  });
}

function openAddNote() {
  openModal("Add Quick Note", formShell(`
    <label>Note<textarea name="text" required rows="3" placeholder="Write a quick reminder or tip"></textarea></label>
    <label>Subject (optional)<select name="subjectId"><option value="">General</option>${options(state.subjects, state.ui.selectedSubjectId)}</select></label>
  `), (data) => {
    const text = data.get("text").trim();
    const subjectId = data.get("subjectId");
    state.notes.push({ 
      id: uid("note"), 
      text,
      subjectId,
      type: "text",
      createdAt: new Date().toISOString()
    });
  });
}

function openPWClasses() {
  const url = prompt(
    "Enter the PW Video Player URL (or press Cancel to open the recorded link):",
    "https://www.pw.live/study-v2/study"
  );
  
  if (url !== null) {
    if (url.trim() === "") {
      window.open("https://www.pw.live/study-v2/study", "_blank");
    } else {
      window.open(url, "_blank");
    }
  }
  saveState();
}

function openProfile() {
  openModal("Profile Settings", formShell(`
    <label>Your Name<input name="name" required value="${escapeHTML(state.profile.name)}"></label>
    <label>Daily Quote<input name="quote" required value="${escapeHTML(state.profile.quote)}"></label>
  `), (data) => {
    state.profile.name = data.get("name").trim();
    state.profile.quote = data.get("quote").trim();
  });
}

function openNotifications() {
  const permission = "Notification" in window ? Notification.permission : "unsupported";
  openModal("Notification Settings", formShell(`
    <p class="form-help">Use Start-Study-OS-App.bat for best notification support. Keep the app/browser running so alerts can fire on time.</p>
    <div class="permission-card">
      <strong>Browser Permission</strong>
      <span>${escapeHTML(permission)}</span>
      <button type="button" data-action="enable-notifications">Enable Notifications</button>
      <button type="button" data-action="test-notification">Send Test</button>
    </div>
    <label class="inline-check"><input name="enabled" type="checkbox" ${state.notifications.enabled ? "checked" : ""}> Master alerts on</label>
    <label class="inline-check"><input name="classes" type="checkbox" ${state.notifications.classes ? "checked" : ""}> Class reminders</label>
    <label class="inline-check"><input name="exams" type="checkbox" ${state.notifications.exams ? "checked" : ""}> Exam countdown reminders</label>
    <label class="inline-check"><input name="events" type="checkbox" ${state.notifications.events ? "checked" : ""}> Calendar event reminders</label>
    <label class="inline-check"><input name="activities" type="checkbox" ${state.notifications.activities ? "checked" : ""}> Daily planner reminders</label>
    <label class="inline-check"><input name="revision" type="checkbox" ${state.notifications.revision ? "checked" : ""}> Revision reminders</label>
    <label class="inline-check"><input name="focus" type="checkbox" ${state.notifications.focus ? "checked" : ""}> Focus timer finished</label>
    <label>Revision Reminder Hour<input name="revisionHour" type="number" min="5" max="23" value="${state.notifications.revisionHour}"></label>
  `, "Save Alerts"), (data) => {
    state.notifications.enabled = data.get("enabled") === "on";
    state.notifications.classes = data.get("classes") === "on";
    state.notifications.exams = data.get("exams") === "on";
    state.notifications.events = data.get("events") === "on";
    state.notifications.activities = data.get("activities") === "on";
    state.notifications.revision = data.get("revision") === "on";
    state.notifications.focus = data.get("focus") === "on";
    state.notifications.revisionHour = Number(data.get("revisionHour")) || 19;
  });
}

function openCompleteTopic() {
  const topic = selectedTopic();
  if (!topic) return;
  openModal("Complete Topic", formShell(`
    <label>Difficulty<select name="difficulty" required><option ${topic.difficulty === "Easy" ? "selected" : ""}>Easy</option><option ${topic.difficulty === "Medium" ? "selected" : ""}>Medium</option><option ${topic.difficulty === "Hard" ? "selected" : ""}>Hard</option></select></label>
    <label>Understanding<select name="understanding" required><option ${topic.understanding === "Yes" ? "selected" : ""}>Yes</option><option ${topic.understanding === "Maybe" ? "selected" : ""}>Maybe</option><option ${topic.understanding === "No" ? "selected" : ""}>No</option></select></label>
  `, "Complete"), (data) => {
    topic.status = "Completed";
    topic.completedAt = new Date().toISOString();
    topic.difficulty = data.get("difficulty");
    topic.understanding = data.get("understanding");
    logStudyFromTopic(topic);
  });
}

function logStudyFromTopic(topic) {
  if (!topic.startedAt) return;
  const startDate = new Date(topic.startedAt);
  const endDate = new Date(topic.completedAt);
  const minutes = Math.max(15, Math.round((endDate - startDate) / 60000));
  const start = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
  const end = new Date(startDate.getTime() + (minutes * 60000));
  const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  const chapter = chapterOfTopic(topic);
  const subject = subjectOfTopic(topic);
  state.activities.push({
    id: uid("act"),
    date: isoDate(startDate),
    title: `${subject?.name || "Study"} - ${topic.name}`,
    type: "Study",
    subjectId: subject?.id || "",
    chapterId: chapter?.id || "",
    topicId: topic.id,
    start,
    end: endTime,
    done: true
  });
}

function startTopic() {
  const topic = selectedTopic();
  if (!topic) return;
  topic.status = "Studying";
  topic.startedAt = new Date().toISOString();
  render();
}

function deleteItem(kind, id) {
  if (!confirm("Delete this item?")) return;
  if (kind === "subjects") {
    const chapters = state.chapters.filter((chapter) => chapter.subjectId === id).map((chapter) => chapter.id);
    const topics = state.topics.filter((topic) => chapters.includes(topic.chapterId)).map((topic) => topic.id);
    state.subjects = state.subjects.filter((item) => item.id !== id);
    state.chapters = state.chapters.filter((item) => item.subjectId !== id);
    state.topics = state.topics.filter((item) => !topics.includes(item.id));
    state.exams.forEach((exam) => { exam.syllabusTopicIds = exam.syllabusTopicIds.filter((topicId) => !topics.includes(topicId)); });
  } else if (kind === "chapters") {
    const topics = state.topics.filter((topic) => topic.chapterId === id).map((topic) => topic.id);
    state.chapters = state.chapters.filter((item) => item.id !== id);
    state.topics = state.topics.filter((item) => item.chapterId !== id);
    state.exams.forEach((exam) => { exam.syllabusTopicIds = exam.syllabusTopicIds.filter((topicId) => !topics.includes(topicId)); });
  } else {
    state[kind] = state[kind].filter((item) => item.id !== id);
  }
  render();
}

function pinExam(id) {
  state.exams.forEach((exam) => { exam.pinned = exam.id === id; });
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "study-os-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  if (!confirm("Reset Study OS demo data? Your current saved data will be replaced.")) return;
  state = createSeedState();
  render();
}

function toggleFocus() {
  if (state.focus.running) {
    state.focus.running = false;
    state.focus.endsAt = null;
  } else {
    state.focus.running = true;
    state.focus.endsAt = Date.now() + (state.focus.minutes * 60 * 1000);
  }
  saveState();
  updateFocus();
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return false;
  }
  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission === "granted") {
    state.notifications.enabled = true;
    saveState();
    notifyUser("Study OS alerts enabled", "You will get reminders for classes, exams, events, study blocks, revision, and focus sessions.", "notifications-enabled");
    return true;
  }
  alert("Notifications are not allowed yet. Please allow them in your browser settings.");
  return false;
}

function notificationAllowed() {
  return state.notifications.enabled && "Notification" in window && Notification.permission === "granted";
}

function markSent(key) {
  state.notifications.sent[key] = Date.now();
  saveState();
}

function wasSent(key) {
  return Boolean(state.notifications.sent[key]);
}

function notifyUser(title, body, tag) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const options = {
    body,
    tag,
    icon: "./assets/app-icon.svg",
    badge: "./assets/app-icon.svg",
    silent: false
  };

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.ready
      .then((registration) => registration.showNotification(title, options))
      .catch(() => new Notification(title, options));
  } else {
    new Notification(title, options);
  }
}

function notifyOnce(key, title, body) {
  if (!notificationAllowed() || wasSent(key)) return;
  notifyUser(title, body, key);
  markSent(key);
}

function sameDayDateTime(dateIso, time) {
  return new Date(`${dateIso}T${time || "09:00"}:00`);
}

function minutesUntil(dateIso, time) {
  return Math.round((sameDayDateTime(dateIso, time) - new Date()) / 60000);
}

function checkNotifications() {
  if (!notificationAllowed()) return;
  const now = new Date();
  const today = isoDate(now);

  if (state.notifications.classes) {
    state.classes.forEach((item) => {
      state.notifications.classMinutes.forEach((minute) => {
        const left = minutesUntil(item.date, item.start);
        if (left <= minute && left > minute - 1) {
          notifyOnce(
            `class:${item.id}:${item.date}:${minute}`,
            `${subjectName(item.subjectId)} class in ${minute} min`,
            `${topicName(item.topicId)} starts at ${formatTime(item.start)}.`
          );
        }
      });
    });
  }

  if (state.notifications.activities) {
    state.activities.forEach((item) => {
      state.notifications.activityMinutes.forEach((minute) => {
        const left = minutesUntil(item.date, item.start);
        if (left <= minute && left > minute - 1) {
          notifyOnce(
            `activity:${item.id}:${item.date}:${minute}`,
            `${item.type} starts in ${minute} min`,
            `${item.title} is planned from ${formatTime(item.start)} to ${formatTime(item.end)}.`
          );
        }
      });
    });
  }

  if (state.notifications.exams) {
    state.exams.forEach((exam) => {
      const left = daysUntil(exam.date);
      if (state.notifications.examDays.includes(left)) {
        const title = left === 0 ? `${exam.name} is today` : `${exam.name} in ${left} day${left === 1 ? "" : "s"}`;
        notifyOnce(
          `exam:${exam.id}:${exam.date}:${left}`,
          title,
          `${priorityForExam(exam)} priority. Check your syllabus and revision list.`
        );
      }
    });
  }

  if (state.notifications.events) {
    state.events.forEach((event) => {
      const left = daysUntil(event.date);
      if (state.notifications.eventDays.includes(left)) {
        const title = left === 0 ? `${event.title} is today` : `${event.title} tomorrow`;
        notifyOnce(
          `event:${event.id}:${event.date}:${left}`,
          title,
          `${event.type} - ${event.importance}`
        );
      }
    });
  }

  if (state.notifications.revision) {
    const weakTopics = state.topics.filter((topic) => topic.understanding === "Maybe" || topic.understanding === "No");
    if (weakTopics.length && now.getHours() === state.notifications.revisionHour) {
      notifyOnce(
        `revision:${today}:${state.notifications.revisionHour}`,
        "Revision reminder",
        `${weakTopics.length} topic${weakTopics.length === 1 ? "" : "s"} need revision today.`
      );
    }
  }
}

function updateFocus() {
  const button = $(".music-card .play");
  const icon = button?.querySelector("[data-icon]");
  if (state.focus.running && state.focus.endsAt) {
    const remaining = Math.max(0, state.focus.endsAt - Date.now());
    if (remaining <= 0) {
      state.focus.running = false;
      state.focus.endsAt = null;
      state.focus.message = "Focus complete";
      if (state.notifications.focus) {
        notifyOnce(`focus:${isoDate()}:${Date.now()}`, "Focus session complete", "Nice work. Take a short break or log your study block.");
      }
      saveState();
    } else {
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      state.focus.message = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} left`;
    }
  } else {
    state.focus.message = `${state.focus.minutes} min focus`;
  }
  $("#focusText").textContent = state.focus.message;
  icon?.setAttribute("data-icon", state.focus.running ? "pause" : "play");
  button?.setAttribute("aria-label", state.focus.running ? "Pause focus timer" : "Start focus timer");
}

function handleClick(event) {
  const scrollButton = event.target.closest("[data-scroll]");
  if (scrollButton) {
    const target = $(scrollButton.dataset.scroll);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    $$(".tabbar button").forEach((button) => button.classList.remove("active"));
    scrollButton.classList.add("active");
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id, kind } = button.dataset;

  if (action === "close-modal") closeModal();
  if (action === "open-add-subject") openAddSubject();
  if (action === "open-add-chapter") openAddChapter();
  if (action === "open-add-topic") openAddTopic();
  if (action === "open-add-exam") openAddExam();
  if (action === "open-add-syllabus") openAddSyllabus();
  if (action === "open-add-activity") openAddActivity();
  if (action === "open-add-activity-revision") openAddActivity("Revision");
  if (action === "open-add-class") openAddClass();
  if (action === "open-add-event") openAddEvent();
  if (action === "open-add-task") openAddTask();
  if (action === "open-add-note") openAddNote();
  if (action === "open-add-smart-note") openAddSmartNote();
  if (action === "open-pw-classes") openPWClasses();
  if (action === "open-profile") openProfile();
  if (action === "open-notifications") openNotifications();
  if (action === "enable-notifications") {
    requestNotificationPermission().then(() => openNotifications());
  }
  if (action === "test-notification") {
    requestNotificationPermission().then((allowed) => {
      if (allowed) notifyUser("Study OS test alert", "Notifications are working. Your study reminders are ready.", "test-notification");
    });
  }
  if (action === "start-topic") startTopic();
  if (action === "complete-topic") openCompleteTopic();
  if (action === "delete") deleteItem(kind, id);
  if (action === "pin-exam") pinExam(id);
  if (action === "mark-understood") {
    const topic = state.topics.find((item) => item.id === id);
    if (topic) topic.understanding = "Yes";
    render();
  }
  if (action === "prev-month" || action === "next-month" || action === "today-month") {
    const current = parseDate(state.ui.calendarMonth);
    if (action === "prev-month") current.setMonth(current.getMonth() - 1);
    if (action === "next-month") current.setMonth(current.getMonth() + 1);
    if (action === "today-month") {
      const today = new Date();
      current.setFullYear(today.getFullYear(), today.getMonth(), 1);
    }
    state.ui.calendarMonth = isoDate(new Date(current.getFullYear(), current.getMonth(), 1));
    render();
  }
  if (action === "export-data") exportData();
  if (action === "reset-demo") resetDemo();
  if (action === "toggle-focus") toggleFocus();
  if (action === "focus-minus") {
    state.focus.minutes = Math.max(5, state.focus.minutes - 5);
    updateFocus();
    saveState();
  }
  if (action === "focus-plus") {
    state.focus.minutes = Math.min(120, state.focus.minutes + 5);
    updateFocus();
    saveState();
  }
}

function handleChange(event) {
  const target = event.target;
  if (target.id === "subjectSelect") {
    state.ui.selectedSubjectId = target.value;
    state.ui.selectedChapterId = state.chapters.find((chapter) => chapter.subjectId === target.value)?.id || "";
    state.ui.selectedTopicId = state.topics.find((topic) => topic.chapterId === state.ui.selectedChapterId)?.id || "";
    render();
  }
  if (target.id === "chapterSelect") {
    state.ui.selectedChapterId = target.value;
    state.ui.selectedTopicId = state.topics.find((topic) => topic.chapterId === target.value)?.id || "";
    render();
  }
  if (target.id === "topicSelect") {
    state.ui.selectedTopicId = target.value;
    render();
  }
  if (target.dataset.action === "toggle-task") {
    const task = state.tasks.find((item) => item.id === target.dataset.id);
    if (task) task.done = target.checked;
    render();
  }
  if (target.id === "trackerRange") {
    renderStudyTracker();
  }
}

function handleSubmit(event) {
  if (!event.target.matches(".app-form")) return;
  event.preventDefault();
  const data = new FormData(event.target);
  modalSubmit?.(data);
  closeModal();
  render();
}

function tick() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  $("#dateLabel").textContent = now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  updateCountdown();
  updateFocus();
  checkNotifications();
}

document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("submit", handleSubmit);
$("#modalBackdrop").addEventListener("click", (event) => {
  if (event.target.id === "modalBackdrop") closeModal();
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

render();
tick();
setInterval(tick, 1000);
