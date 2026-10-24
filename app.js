import {
  STORAGE_KEY,
  SUBJECTS,
  localDate,
  shiftDate,
  uid,
  escapeHTML as e,
  money,
  initials,
  seedData,
  isValidData,
  filterStudents,
  attendanceSummary,
  recordPayment,
  csv,
} from './core.js';

const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  students: '<path d="m3 8 9-5 9 5-9 5-9-5Z"/><path d="M6 10v6c4 3 8 3 12 0v-6M21 8v7"/>',
  teachers:
    '<circle cx="10" cy="7" r="4"/><path d="M3 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 7M21 21v-3a7 7 0 0 0-3-6"/>',
  attendance:
    '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4m8-4v4M4 11h16m-12 5 3 3 5-5"/>',
  classes:
    '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4V4Zm16 0h-4a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h3V4Z"/>',
  fees: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h2m4 0h2m-8 3h2"/>',
  reports: '<path d="M5 3h10l4 4v14H5V3Zm10 0v5h4M9 17v-3m3 3v-6m3 6v-4"/>',
  settings:
    '<path d="m10 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 3 3-1 1-3 3-1 1-3-2-2 1-3-3-2-2 1-2-2Z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  school: '<path d="m3 9 9-6 9 6v12H3V9Zm6 12v-6h6v6M7 10h1m8 0h1"/>',
  sparkles:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7 0v4m-2-2h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-4-4L5 15l-1 5Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  location:
    '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  filter: '<path d="M4 6h16M7 12h10m-7 6h4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  heart: '<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 8 15 8 15S25 10 20 5Z"/>',
};
const icon = (name, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
const $ = (selector, root = document) => root.querySelector(selector);
const today = () => localDate();
const formatDate = (day, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', options);
const fmtNumber = (n) => new Intl.NumberFormat('en-NP').format(n);
let blockedStorage = false;
let loadNotice = '';
let data;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    data = JSON.parse(saved);
    if (!isValidData(data)) throw new Error('Invalid data');
  } else {
    data = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
} catch {
  data = seedData();
  blockedStorage = true;
  loadNotice =
    'Saved data could not be loaded. This is a temporary demo; existing storage has not been overwritten. Export a backup, or reset the demo in Settings.';
}
function save() {
  if (blockedStorage) {
    warnStorage(loadNotice);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    warnStorage(
      'Browser storage is unavailable or full. Changes are only kept for this session. Export a backup in Settings before leaving.',
    );
  }
}
function warnStorage(message) {
  $('#storageWarning').textContent = message;
  $('#storageWarning').hidden = false;
}
if (loadNotice) warnStorage(loadNotice);
const state = {
  view: 'dashboard',
  query: '',
  classId: '',
  status: '',
  page: 1,
  attendanceClass: 'C-1',
  attendanceDate: today(),
  feeStatus: '',
  eventMonth: today().slice(0, 7),
};
const views = [
  ['dashboard', 'grid', 'Overview'],
  ['students', 'students', 'Students'],
  ['teachers', 'teachers', 'Teachers'],
  ['attendance', 'attendance', 'Attendance'],
  ['classes', 'classes', 'Classes & subjects'],
  ['fees', 'fees', 'Fees & payments'],
  ['calendar', 'calendar', 'Calendar'],
  ['reports', 'reports', 'Reports'],
  ['settings', 'settings', 'Settings'],
];
let returnFocus;
const colors = ['lilac', 'blue', 'peach', 'mint', 'rose'];
const classById = (id) => data.classes.find((c) => c.id === id);
const studentById = (id) => data.students.find((s) => s.id === id);
const teacherById = (id) => data.teachers.find((t) => t.id === id);
const className = (id) => {
  const c = classById(id);
  return c ? `${c.name} · ${c.section}` : 'Unassigned';
};
const avatar = (name, index = 0, cls = '') =>
  `<span class="avatar ${colors[Math.abs(index) % colors.length]} ${cls}">${e(initials(name))}</span>`;
const badge = (text, color = '') =>
  `<span class="badge ${color || { Active: 'mint', Inactive: 'neutral', Paid: 'mint', Partial: 'blue', Overdue: 'rose', Unpaid: 'peach', Present: 'mint', Absent: 'rose', Late: 'peach' }[text] || 'lilac'}"><i></i>${e(text)}</span>`;
function toast(message, error = false) {
  const node = document.createElement('div');
  node.className = `toast ${error ? 'error' : ''}`;
  node.innerHTML = icon(error ? 'info' : 'check') + `<span>${e(message)}</span>`;
  $('#toasts').append(node);
  setTimeout(() => node.remove(), 4800);
}
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}
function syncShell() {
  $('#schoolLabel').textContent = data.settings.schoolName;
  $('#yearLabel').textContent = `Academic year ${data.settings.year}`;
  $('#navigation').innerHTML =
    `<p class="nav-label">WORKSPACE</p>${views.map(([key, glyph, name], i) => `${i === 6 ? '<p class="nav-label management-label">MANAGEMENT</p>' : ''}<a href="#${key}" class="nav-item ${state.view === key ? 'active' : ''}" ${state.view === key ? 'aria-current="page"' : ''} title="${name}">${icon(glyph)}<span>${name}</span>${key === 'students' ? `<small>${data.students.length}</small>` : ''}${key === 'dashboard' ? '<i></i>' : ''}</a>`).join('')}`;
  $('#breadcrumb').textContent = views.find((v) => v[0] === state.view)?.[2] || 'Overview';
  document.title = `${$('#breadcrumb').textContent} · EduManage`;
}
function heading(title, subtitle, actions = '', eyebrow = '') {
  return `<div class="page-heading"><div>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1><p class="page-description">${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;
}
const btn = (text, action, glyph = 'plus', cls = 'primary-btn', extra = '') =>
  `<button class="${cls}" data-action="${action}" ${extra}>${icon(glyph)}${text}</button>`;
const navBtn = (text, view, cls = 'link-btn') =>
  `<button class="${cls}" data-nav="${view}">${text}${icon('arrow-right')}</button>`;
const classOptions = (selected = '', all = true) =>
  `${all ? '<option value="">All classes</option>' : ''}${data.classes.map((c) => `<option value="${e(c.id)}" ${c.id === selected ? 'selected' : ''}>${e(c.name)} · ${e(c.section)}</option>`).join('')}`;
const empty = (title, description, action = '') =>
  `<div class="empty-state">${icon('search')}<h3>${e(title)}</h3><p>${e(description)}</p>${action}</div>`;
const studentCell = (s, index = 0, sub = true) =>
  `<button class="person-cell" data-action="student-detail" data-id="${e(s.id)}">${avatar(s.name, index)}<span><strong>${e(s.name)}</strong>${sub ? `<small>${e(s.id)}</small>` : ''}</span></button>`;
function statCard(label, value, glyph, color, detail, extra = '') {
  return `<article class="stat-card"><div class="stat-label">${label}<span class="stat-icon ${color}">${icon(glyph)}</span></div><div class="stat-value">${value}</div><div class="stat-detail">${extra}${detail}</div><span class="stat-decoration ${color}"></span></article>`;
}
function render() {
  syncShell();
  const renderers = {
    dashboard: dashboardView,
    students: studentsView,
    teachers: teachersView,
    attendance: attendanceView,
    classes: classesView,
    fees: feesView,
    calendar: calendarView,
    reports: reportsView,
    settings: settingsView,
  };
  $('#app').innerHTML = renderers[state.view]();
  hydrateIcons($('#app'));
}
function navigate(view) {
  if (!views.some((v) => v[0] === view)) view = 'dashboard';
  if (location.hash !== `#${view}`) {
    location.hash = view;
    return;
  }
  state.view = view;
  render();
  closeMenu();
}
window.addEventListener('hashchange', () => {
  state.view = location.hash.slice(1);
  if (!views.some((v) => v[0] === state.view)) state.view = 'dashboard';
  render();
  closeMenu();
  window.scrollTo({ top: 0 });
});
function eventItem(event, compact = false) {
  const color =
    { Meeting: 'lilac', Academic: 'peach', Activity: 'mint', Holiday: 'blue' }[event.type] ||
    'lilac';
  return `<div class="event-item"><div class="date-tile ${color}"><small>${e(formatDate(event.date, { month: 'short' }).toUpperCase())}</small><strong>${Number(event.date.slice(-2))}</strong></div><div class="event-info"><strong>${e(event.title)}</strong><small>${icon('clock')}${e(formatDate(event.date, { weekday: 'short' }))} ${event.time ? `· ${e(event.time)}` : '· All day'}</small>${!compact ? `<small>${icon('location')}${e(event.location || 'Location to be confirmed')}</small>` : ''}</div>${compact ? `<span class="event-color ${color}"></span>` : `<button class="icon-btn" data-action="edit-event" data-id="${e(event.id)}" aria-label="Edit ${e(event.title)}">${icon('edit')}</button>`}</div>`;
}
function dashboardView() {
  const summary = attendanceSummary(data.students, data.attendance[today()]);
  const collected = data.invoices.reduce((sum, i) => sum + i.paid, 0);
  const billed = data.invoices.reduce((sum, i) => sum + i.amount, 0);
  const events = data.events
    .filter((ev) => ev.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3);
  const recent = [...data.students].sort((a, b) => b.joined.localeCompare(a.joined)).slice(0, 5);
  const hour = new Date().getHours();
  return `${heading(`Good ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, Alex <span class="greeting-spark">✳</span>`, `Here’s what’s happening at ${e(data.settings.schoolName)} today.`, `<span class="date-pill">${icon('calendar')}${formatDate(today(), { day: 'numeric', month: 'short', year: 'numeric' })}</span>${btn('Add student', 'add-student')}`, 'YOUR SCHOOL AT A GLANCE')}
    <div class="demo-banner"><span class="demo-icon">${icon('sparkles')}</span><div><strong>A good day to make a difference.</strong><span>Your workspace is ready. All 12 grades are filled with sample student records.</span></div><button data-nav="classes">Explore classes ${icon('arrow-right')}</button><span class="banner-orbit orbit-one"></span><span class="banner-orbit orbit-two"></span></div>
    <div class="stats-grid">${statCard('Total students', fmtNumber(data.students.length), 'students', 'lilac', `in ${data.classes.length} classes`, `<span class="stat-chip lilac">${data.students.filter((s) => s.status === 'Active').length} active</span>`)}${statCard('Attendance today', summary.total - summary.unmarked ? `${summary.rate}%` : '—', 'attendance', 'mint', `${summary.present + summary.late} of ${summary.total} attending`, `<span class="small-dot mint"></span>`)}${statCard('Active classes', data.classes.length, 'classes', 'peach', 'Grades 1–12 · Section A', `<span class="stat-chip peach">${data.teachers.length} teachers</span>`)}${statCard('Fees collected', money(collected), 'fees', 'blue', 'of total billed', `<span class="stat-chip blue">${billed ? Math.round((collected / billed) * 100) : 0}%</span>`)}</div>
    <div class="dashboard-grid"><article class="panel attendance-panel"><div class="panel-heading"><div><h2>Attendance overview</h2><p>A little progress, every school day.</p></div><span class="subtle-pill">Last 7 days ${icon('chevron-down')}</span></div>${attendanceChart()}<div class="chart-legend"><span><i class="legend-dot purple-bg"></i>Present & late</span><span>Based on marked records · sample data</span></div></article>
      <article class="panel events-panel"><div class="panel-heading"><div><h2>Coming up next</h2><p>Things to look forward to.</p></div><button class="icon-btn" data-nav="calendar" aria-label="Open calendar">${icon('arrow-up-right')}</button></div><div class="event-list">${events.length ? events.map((ev) => eventItem(ev, true)).join('') : empty('Your calendar is clear', 'Add an event to plan ahead.')}</div><button class="panel-bottom-link" data-nav="calendar">View school calendar ${icon('arrow-right')}</button></article></div>
    <div class="dashboard-grid lower-grid"><article class="panel recent-panel"><div class="panel-heading"><div><h2>Recent students <span class="count-pill">${data.students.length}</span></h2><p>New faces in our school community.</p></div>${navBtn('View all', 'students')}</div><div class="table-wrap"><table><thead><tr><th>Student name</th><th>Class</th><th>Status</th><th>Date joined</th></tr></thead><tbody>${recent.map((s, i) => `<tr><td>${studentCell(s, i)}</td><td><span class="class-tag">${e(className(s.classId))}</span></td><td>${badge(s.status)}</td><td class="muted">${formatDate(s.joined, { day: 'numeric', month: 'short' })}</td></tr>`).join('') || '<tr><td colspan="4">No students yet.</td></tr>'}</tbody></table></div></article>
    <article class="panel quick-panel"><div class="panel-heading"><div><h2>Make it happen</h2><p>Your everyday shortcuts.</p></div><span class="quick-spark">${icon('sparkles')}</span></div><div class="quick-actions"><button data-action="add-student"><span class="quick-icon lilac">${icon('students')}</span><span><strong>Enroll a student</strong><small>A new chapter starts here</small></span>${icon('chevron-right')}</button><button data-nav="attendance"><span class="quick-icon mint">${icon('attendance')}</span><span><strong>Take attendance</strong><small>Every student counts</small></span>${icon('chevron-right')}</button><button data-nav="fees"><span class="quick-icon peach">${icon('fees')}</span><span><strong>Record a payment</strong><small>Keep the books up to date</small></span>${icon('chevron-right')}</button></div><div class="quick-note">${icon('heart')} Less admin. More possibilities.</div></article></div>`;
}
function attendanceChart() {
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(today(), i - 6));
  const values = days.map((day) => attendanceSummary(data.students, data.attendance[day]).rate);
  return `<div class="bar-chart" role="img" aria-label="Attendance for the last seven days: ${days.map((d, i) => `${formatDate(d)}, ${values[i]}%`).join('; ')}"><div class="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div class="chart-plot"><div class="chart-grid"></div><div class="chart-bars">${days.map((day, i) => `<div class="bar-column"><div class="bar-track"><div class="chart-bar ${i === 6 ? 'today' : ''}" style="height:${values[i]}%"><span>${values[i]}%</span></div></div><small class="${i === 6 ? 'today-label' : ''}">${formatDate(day, { weekday: 'short' })}${i === 6 ? '<i></i>' : ''}</small></div>`).join('')}</div></div></div>`;
}
function studentsView() {
  const students = filterStudents(data.students, state);
  const pageSize = 10,
    pages = Math.max(1, Math.ceil(students.length / pageSize));
  state.page = Math.min(state.page, pages);
  const slice = students.slice((state.page - 1) * pageSize, state.page * pageSize);
  return `${heading('Students', 'A place for every learner. Manage your school community.', `${btn('Export CSV', 'export-students', 'download', 'secondary-btn')}${btn('Add student', 'add-student')}`)}
    <div class="mini-stats"><span><strong>${data.students.length}</strong> Total students</span><span><i class="small-dot mint"></i><strong>${data.students.filter((s) => s.status === 'Active').length}</strong> Active</span><span><i class="small-dot lilac"></i><strong>${data.classes.length}</strong> Classes</span></div>
    <article class="panel list-panel"><div class="list-toolbar"><label class="input-search">${icon('search')}<input id="studentSearch" type="search" placeholder="Search name, ID, or guardian..." aria-label="Search student records" value="${e(state.query)}"></label><div class="filters"><select id="studentClassFilter" aria-label="Filter by class">${classOptions(state.classId)}</select><select id="studentStatusFilter" aria-label="Filter by status"><option value="">All statuses</option><option ${state.status === 'Active' ? 'selected' : ''}>Active</option><option ${state.status === 'Inactive' ? 'selected' : ''}>Inactive</option></select></div></div>
    <div class="table-wrap"><table><thead><tr><th>Student name</th><th>Class / section</th><th>Guardian</th><th>Status</th><th>Joined</th><th class="align-right">Actions</th></tr></thead><tbody>${slice.map((s, i) => `<tr><td>${studentCell(s, i)}</td><td><span class="class-tag">${e(className(s.classId))}</span></td><td><strong class="table-normal">${e(s.guardian || 'Not provided')}</strong><small class="cell-sub">${e(s.phone || 'No phone on file')}</small></td><td>${badge(s.status)}</td><td class="muted nowrap">${formatDate(s.joined)}</td><td><div class="row-actions"><button class="icon-btn" data-action="edit-student" data-id="${e(s.id)}" aria-label="Edit ${e(s.name)}">${icon('edit')}</button><button class="icon-btn danger-hover" data-action="delete-student" data-id="${e(s.id)}" aria-label="Delete ${e(s.name)}">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>${!slice.length ? empty('No students found', 'Try a different search or add your first student.', btn('Add student', 'add-student')) : ''}
    <div class="pagination"><span>${students.length ? `Showing ${(state.page - 1) * pageSize + 1}–${Math.min(state.page * pageSize, students.length)} of ${students.length} students` : '0 students'}</span><div><button class="page-btn" data-action="prev-page" ${state.page === 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chevron-left')}</button><span>Page ${state.page} of ${pages}</span><button class="page-btn" data-action="next-page" ${state.page === pages ? 'disabled' : ''} aria-label="Next page">${icon('chevron-right')}</button></div></div></article><p class="page-hint">${icon('info')} All initial records are fictional sample data. Select a student to see their profile.</p>`;
}
function classesView() {
  return `${heading('Classes & subjects', 'Room to learn, grow, and do great things.', `<span class="subtle-pill">${data.classes.length} classes · ${SUBJECTS.length} subjects</span>`)}<div class="class-grid">${data.classes
    .map((c, i) => {
      const students = data.students.filter((s) => s.classId === c.id),
        teacher = teacherById(c.teacherId);
      return `<article class="panel class-card"><div class="class-card-top"><span class="class-number ${colors[i % 5]}">${String(i + 1).padStart(2, '0')}</span><span class="subtle-pill">Section ${e(c.section)}</span><button class="icon-btn" data-action="edit-class" data-id="${e(c.id)}" aria-label="Edit ${e(c.name)}">${icon('edit')}</button></div><h2>${e(c.name)}</h2><p class="muted">${icon('location')} Room ${e(c.room)}</p><div class="class-teacher">${avatar(teacher?.name || 'Not assigned', i)}<div><small>CLASS TEACHER</small><strong>${e(teacher?.name || 'Not assigned')}</strong></div></div><div class="class-occupancy"><span>${icon('students')} ${students.length} students</span><span>${c.capacity} capacity</span></div><div class="progress-track"><div style="width:${Math.min(100, (students.length / c.capacity) * 100)}%" class="${colors[i % 5]}"></div></div><div class="subject-tags">${c.subjects
        .slice(0, 3)
        .map((s) => `<span>${e(s)}</span>`)
        .join(
          '',
        )}<span>+${Math.max(0, c.subjects.length - 3)} more</span></div><button class="panel-bottom-link" data-action="class-roster" data-id="${e(c.id)}">View class roster ${icon('arrow-right')}</button></article>`;
    })
    .join('')}</div>`;
}
function teachersView() {
  return `${heading('Teachers', 'The people making a difference, every day.', btn('Add teacher', 'add-teacher'))}<div class="teacher-grid">${
    data.teachers
      .map(
        (t, i) =>
          `<article class="panel teacher-card"><div class="teacher-top">${avatar(t.name, i, 'large-avatar')}<button class="icon-btn" data-action="edit-teacher" data-id="${e(t.id)}" aria-label="Edit ${e(t.name)}">${icon('edit')}</button></div><h2>${e(t.name)}</h2><span class="subject-label">${e(t.subject)}</span><p>${icon('mail')}<span>${e(t.email || 'No email provided')}</span></p><div class="teacher-class"><span>Class teacher</span><strong>${e(
            data.classes
              .filter((c) => c.teacherId === t.id)
              .map((c) => c.name)
              .join(', ') || 'Not assigned',
          )}</strong></div></article>`,
      )
      .join('') ||
    empty(
      'No teachers yet',
      'Add the people who make your school special.',
      btn('Add teacher', 'add-teacher'),
    )
  }</div>`;
}
function attendanceView() {
  if (!classById(state.attendanceClass)) state.attendanceClass = data.classes[0]?.id || '';
  const students = data.students.filter(
    (s) => s.classId === state.attendanceClass && s.status === 'Active',
  );
  const records = data.attendance[state.attendanceDate] || {};
  const summary = attendanceSummary(students, records);
  return `${heading('Attendance', 'Every student counts. Keep a clear record of each day.', btn('Export attendance', 'export-attendance', 'download', 'secondary-btn'))}<div class="attendance-controls panel"><label>Class<select id="attendanceClass">${classOptions(state.attendanceClass, false)}</select></label><label>Date<input id="attendanceDate" type="date" value="${state.attendanceDate}" max="${today()}" required></label><div class="autosave-label">${icon('check')} Changes save automatically</div></div>
    <div class="attendance-summary">${[
      ['Present', summary.present, 'mint'],
      ['Absent', summary.absent, 'rose'],
      ['Late', summary.late, 'peach'],
      ['Unmarked', summary.unmarked, 'neutral'],
    ]
      .map(
        ([label, value, color]) =>
          `<div class="panel attendance-tile"><i class="small-dot ${color}"></i><span>${label}</span><strong>${value}</strong></div>`,
      )
      .join('')}</div>
    <article class="panel list-panel"><div class="panel-heading inset"><div><h2>${e(className(state.attendanceClass))}</h2><p>${formatDate(state.attendanceDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${students.length} active students</p></div>${btn('Mark all present', 'mark-all', 'check', 'secondary-btn')}</div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Attendance status</th><th>Record</th></tr></thead><tbody>${students.map((s, i) => `<tr><td>${studentCell(s, i)}</td><td><div class="attendance-options" role="group" aria-label="Attendance for ${e(s.name)}">${['Present', 'Absent', 'Late'].map((status) => `<button class="attendance-option ${records[s.id] === status ? `selected ${status.toLowerCase()}` : ''}" data-action="mark" data-id="${e(s.id)}" data-status="${status}" aria-pressed="${records[s.id] === status}">${icon(status === 'Present' ? 'check' : status === 'Absent' ? 'close' : 'clock')}${status}</button>`).join('')}</div></td><td>${records[s.id] ? badge(records[s.id]) : '<span class="muted">Not marked</span>'}</td></tr>`).join('')}</tbody></table></div>${students.length ? '' : empty('No active students', 'Add an active student to this class to take attendance.')}</article><p class="page-hint">${icon('info')} Attendance rate includes present and late students, divided by marked records. Future dates cannot be marked.</p>`;
}
const invoiceStatus = (i) =>
  i.paid >= i.amount ? 'Paid' : i.due < today() ? 'Overdue' : i.paid > 0 ? 'Partial' : 'Unpaid';
function feesView() {
  const billed = data.invoices.reduce((s, i) => s + i.amount, 0),
    collected = data.invoices.reduce((s, i) => s + i.paid, 0);
  const invoices = data.invoices.filter(
    (i) => !state.feeStatus || invoiceStatus(i) === state.feeStatus,
  );
  return `${heading('Fees & payments', 'Less chasing. More clarity. A healthy school starts here.', btn('Create invoice', 'add-invoice'))}<div class="stats-grid three-stats">${statCard('Total billed', money(billed), 'reports', 'lilac', `${data.invoices.length} invoices`)}${statCard('Collected', money(collected), 'fees', 'mint', `${billed ? Math.round((collected / billed) * 100) : 0}% of total billed`)}${statCard('Outstanding', money(billed - collected), 'clock', 'peach', `${data.invoices.filter((i) => i.paid < i.amount).length} open invoices`)}</div><article class="panel list-panel"><div class="list-toolbar"><div><h2>Student invoices</h2><p class="muted">Payments are recorded against individual invoices.</p></div><select id="feeStatusFilter" aria-label="Filter invoices"><option value="">All invoices</option>${['Paid', 'Partial', 'Unpaid', 'Overdue'].map((s) => `<option ${state.feeStatus === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div><div class="table-wrap fee-table"><table><thead><tr><th>Student / invoice</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Due date</th><th>Status</th><th></th></tr></thead><tbody>${invoices
    .map((i, n) => {
      const s = studentById(i.studentId);
      return `<tr><td>${studentCell(s, n)}<small class="cell-sub invoice-label">${e(i.label)} · ${e(i.id)}</small></td><td class="nowrap">${money(i.amount)}</td><td class="muted nowrap">${money(i.paid)}</td><td class="nowrap"><strong>${money(i.amount - i.paid)}</strong></td><td class="muted nowrap">${formatDate(i.due, { day: 'numeric', month: 'short' })}</td><td>${badge(invoiceStatus(i))}</td><td>${i.paid < i.amount ? `<button class="small-btn" data-action="payment" data-id="${e(i.id)}">Record payment</button>` : '<span class="paid-check">' + icon('check') + '</span>'}</td></tr>`;
    })
    .join(
      '',
    )}</tbody></table></div>${invoices.length ? '' : empty('No invoices found', 'Create an invoice or change the filter.')}</article><p class="page-hint">${icon('info')} This is a record-keeping tool, not an online payment gateway. All amounts are in Nepalese rupees (NPR).</p>`;
}
function calendarView() {
  const month = state.eventMonth,
    first = new Date(`${month}-01T12:00:00`),
    start = first.getDay(),
    days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const events = data.events
    .filter((ev) => ev.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return `${heading('School calendar', 'Bring your school community together.', btn('Add event', 'add-event'))}<div class="calendar-layout"><article class="panel"><div class="panel-heading calendar-heading"><h2>${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2><div class="calendar-navigation"><button class="page-btn" data-action="prev-month" aria-label="Previous month">${icon('chevron-left')}</button><button class="secondary-btn" data-action="this-month">Today</button><button class="page-btn" data-action="next-month" aria-label="Next month">${icon('chevron-right')}</button></div></div><div class="calendar-grid">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="calendar-weekday">${d}</div>`).join('')}${Array.from({ length: start }, () => '<div class="calendar-empty"></div>').join('')}${Array.from(
    { length: days },
    (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, '0')}`,
        dayEvents = events.filter((ev) => ev.date === date);
      return `<button class="calendar-day ${date === today() ? 'is-today' : ''} ${dayEvents.length ? 'has-event' : ''}" data-action="day-event" data-date="${date}" aria-label="${formatDate(date)}, ${dayEvents.length} events"><span>${i + 1}</span>${dayEvents
        .slice(0, 2)
        .map(
          (ev) =>
            `<small class="${{ Meeting: 'lilac', Academic: 'peach', Activity: 'mint', Holiday: 'blue' }[ev.type] || 'lilac'}">${e(ev.title)}</small>`,
        )
        .join('')}${dayEvents.length > 2 ? `<em>+${dayEvents.length - 2} more</em>` : ''}</button>`;
    },
  ).join(
    '',
  )}</div></article><article class="panel calendar-agenda"><div class="panel-heading"><div><h2>On the agenda</h2><p>${events.length} events this month</p></div></div><div class="event-list">${events.length ? events.map((ev) => eventItem(ev)).join('') : empty('A fresh page', 'Add an event to start planning.')}</div><p class="page-hint">Click a day to add an event.</p></article></div>`;
}
function reportsView() {
  const summary = attendanceSummary(data.students, data.attendance[today()]);
  const billed = data.invoices.reduce((s, i) => s + i.amount, 0),
    collected = data.invoices.reduce((s, i) => s + i.paid, 0);
  return `${heading('School reports', 'From everyday records to a clearer picture.', btn('Export school summary', 'export-summary', 'download', 'secondary-btn'))}<div class="stats-grid three-stats">${statCard('Active enrollment', data.students.filter((s) => s.status === 'Active').length, 'students', 'lilac', `${data.students.length} total records`)}${statCard('Attendance today', summary.total - summary.unmarked ? `${summary.rate}%` : '—', 'attendance', 'mint', `${summary.unmarked} students unmarked`)}${statCard('Fee collection', `${billed ? Math.round((collected / billed) * 100) : 0}%`, 'fees', 'peach', `${money(collected)} collected`)}</div><div class="report-layout"><article class="panel"><div class="panel-heading"><div><h2>Enrollment by class</h2><p>Every grade, at a glance.</p></div></div><div class="enrollment-chart">${data.classes
    .map((c, i) => {
      const count = data.students.filter((s) => s.classId === c.id).length;
      return `<div class="enrollment-row"><span>${e(c.name)}</span><div class="progress-track"><div class="${colors[i % 5]}" style="width:${Math.min(100, (count / c.capacity) * 100)}%"></div></div><strong>${count}<small> / ${c.capacity}</small></strong></div>`;
    })
    .join(
      '',
    )}</div></article><article class="panel"><div class="panel-heading"><div><h2>Class summary</h2><p>Live totals from your school records.</p></div></div><div class="table-wrap"><table><thead><tr><th>Class</th><th>Active</th><th>Present / late</th><th>Marked</th></tr></thead><tbody>${data.classes
    .map((c) => {
      const s = attendanceSummary(
        data.students.filter((s) => s.classId === c.id),
        data.attendance[today()],
      );
      return `<tr><td><strong>${e(c.name)}</strong></td><td>${s.total}</td><td>${s.present + s.late}</td><td>${s.total - s.unmarked} / ${s.total}</td></tr>`;
    })
    .join('')}</tbody></table></div></article></div>`;
}
function settingsView() {
  return `${heading('School settings', 'Make this workspace your own.')}<div class="settings-layout"><article class="panel"><div class="panel-heading"><div><h2>School profile</h2><p>The basics behind your school.</p></div></div><form id="settingsForm"><label>School name<input name="schoolName" value="${e(data.settings.schoolName)}" maxlength="80" required></label><div class="form-grid"><label>Academic year<input name="year" value="${e(data.settings.year)}" placeholder="2026/27" maxlength="20" required></label><label>Currency<input value="NPR · Nepalese Rupee" disabled></label></div><label>Address<input name="address" value="${e(data.settings.address)}" maxlength="200"></label><div class="form-actions"><button class="primary-btn" type="submit">${icon('check')}Save changes</button></div></form></article><div class="settings-side"><article class="panel"><div class="panel-heading"><div><h2>Your data, in your hands</h2><p>Keep a copy of your school records.</p></div></div><p class="settings-note">This local demo saves data only in this browser. It has no server, user authentication, or cross-device sync. Use fictional data here; do not store sensitive student information.</p><div class="backup-actions">${btn('Download backup', 'export-backup', 'download', 'secondary-btn')}<label class="secondary-btn file-button">${icon('upload')}Restore backup<input type="file" id="restoreBackup" accept=".json,application/json"></label></div></article><article class="panel danger-panel"><h2>Start fresh</h2><p>Reset all changes and restore the 96 sample students across Grades 1–12. This cannot be undone.</p>${btn('Reset demo data', 'reset', 'trash', 'danger-btn')}</article></div></div>`;
}

function openDialog(title, subtitle, body, options = {}) {
  if (!$('#recordDialog').open) returnFocus = document.activeElement;
  $('#dialogContent').innerHTML =
    `<div class="dialog-heading"><div><span class="eyebrow">${options.eyebrow || 'SCHOOL WORKSPACE'}</span><h2 id="dialogTitle">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button class="icon-btn" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${body}`;
  const dialog = $('#recordDialog');
  dialog.classList.toggle('wide-dialog', Boolean(options.wide));
  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => {
    (
      $('input:not([type="hidden"]):not([disabled]), select, textarea', dialog) ||
      $('button', dialog)
    )?.focus();
  });
}
function closeDialog() {
  $('#recordDialog').close();
  if (returnFocus?.isConnected) returnFocus.focus();
}
$('#recordDialog').addEventListener('click', (ev) => {
  if (ev.target === $('#recordDialog')) {
    const r = ev.target.getBoundingClientRect();
    if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom)
      closeDialog();
  }
});
$('#recordDialog').addEventListener('close', () => {
  if (returnFocus?.isConnected) returnFocus.focus();
});
const formEnd = (label = 'Save changes') =>
  `<p class="form-error" id="formError" role="alert" hidden></p><div class="form-actions"><button type="button" class="secondary-btn" data-action="close-dialog">Cancel</button><button class="primary-btn" type="submit">${icon('check')}${label}</button></div></form>`;
const input = (label, name, value = '', type = 'text', attrs = '') =>
  `<label>${label}<input name="${name}" type="${type}" value="${e(value)}" ${attrs}></label>`;
function studentForm(id = '', classId = '') {
  const s = studentById(id) || {
    name: '',
    classId: classId || data.classes[0]?.id,
    guardian: '',
    phone: '',
    email: '',
    status: 'Active',
    dob: '',
    joined: today(),
  };
  openDialog(
    id ? 'Edit student' : 'A new chapter starts here',
    id ? 'Keep this student’s details up to date.' : 'Add a student to your school community.',
    `<form id="studentForm" data-id="${e(id)}"><div class="form-grid">${input('Full name *', 'name', s.name, 'text', 'required maxlength="80" placeholder="e.g. Aarav Sharma"')}<label>Class & section *<select name="classId" required>${classOptions(s.classId, false)}</select></label>${input('Date of birth', 'dob', s.dob, 'date', `max="${today()}"`)}${input('Date joined *', 'joined', s.joined, 'date', `required max="${today()}"`)}${input('Guardian name', 'guardian', s.guardian, 'text', 'maxlength="80"')}${input('Contact phone', 'phone', s.phone, 'tel', 'maxlength="25" placeholder="e.g. 9800000000"')}${input('Email address', 'email', s.email, 'email', 'maxlength="120"')}<label>Status<select name="status"><option ${s.status === 'Active' ? 'selected' : ''}>Active</option><option ${s.status === 'Inactive' ? 'selected' : ''}>Inactive</option></select></label></div><div class="form-note">${icon('info')} Fields marked * are required. Each student gets a unique ID.</div>${formEnd(id ? 'Save student' : 'Add student')}`,
    { wide: true, eyebrow: id ? 'STUDENT RECORD' : 'NEW ENROLLMENT' },
  );
}
function studentDetail(id) {
  const s = studentById(id);
  if (!s) return;
  const invoices = data.invoices.filter((i) => i.studentId === id),
    balance = invoices.reduce((sum, i) => sum + i.amount - i.paid, 0);
  const records = Object.values(data.attendance).filter((r) => r[id]);
  const attended = records.filter((r) => r[id] !== 'Absent').length;
  openDialog(
    'Student profile',
    e(s.id),
    `<div class="profile-header">${avatar(s.name, 2, 'large-avatar')}<div><h3>${e(s.name)}</h3><p>${e(className(s.classId))}</p></div>${badge(s.status)}</div><dl class="profile-details"><div><dt>Guardian</dt><dd>${e(s.guardian || 'Not provided')}</dd></div><div><dt>Contact</dt><dd>${e(s.phone || 'Not provided')}</dd></div><div><dt>Email</dt><dd>${e(s.email || 'Not provided')}</dd></div><div><dt>Date of birth</dt><dd>${s.dob ? formatDate(s.dob) : 'Not provided'}</dd></div><div><dt>Joined</dt><dd>${formatDate(s.joined)}</dd></div><div><dt>Attendance</dt><dd>${records.length ? Math.round((attended / records.length) * 100) + '% · ' + records.length + ' days marked' : 'No marked records'}</dd></div><div><dt>Outstanding fees</dt><dd>${money(balance)}</dd></div></dl><div class="form-actions"><button class="secondary-btn" data-action="close-dialog">Close</button><button class="primary-btn" data-action="edit-student" data-id="${e(id)}">${icon('edit')}Edit student</button></div>`,
  );
}
function teacherForm(id = '') {
  const t = teacherById(id) || { name: '', email: '', phone: '', subject: SUBJECTS[0] };
  openDialog(
    id ? 'Edit teacher' : 'Welcome a teacher',
    'The people at the heart of your school.',
    `<form id="teacherForm" data-id="${e(id)}">${input('Full name *', 'name', t.name, 'text', 'required maxlength="80"')}<label>Subject<select name="subject">${SUBJECTS.map((s) => `<option ${t.subject === s ? 'selected' : ''}>${e(s)}</option>`).join('')}</select></label>${input('Email', 'email', t.email, 'email', 'maxlength="120"')}${input('Phone', 'phone', t.phone, 'tel', 'maxlength="25"')}${formEnd(id ? 'Save teacher' : 'Add teacher')}`,
  );
}
function classForm(id) {
  const c = classById(id);
  openDialog(
    `Edit ${e(c.name)}`,
    'Set up the space where learning happens.',
    `<form id="classForm" data-id="${e(id)}"><label>Class teacher<select name="teacherId"><option value="">Not assigned</option>${data.teachers.map((t) => `<option value="${e(t.id)}" ${t.id === c.teacherId ? 'selected' : ''}>${e(t.name)}</option>`).join('')}</select></label><div class="form-grid">${input('Room *', 'room', c.room, 'text', 'required maxlength="30"')}${input('Capacity *', 'capacity', c.capacity, 'number', 'required min="1" max="200" step="1"')}</div><label>Subjects</label><div class="subject-checks">${SUBJECTS.map((s) => `<label><input type="checkbox" name="subjects" value="${e(s)}" ${c.subjects.includes(s) ? 'checked' : ''}>${e(s)}</label>`).join('')}</div>${formEnd()}`,
  );
}
function eventForm(id = '', date = today()) {
  const ev = data.events.find((ev) => ev.id === id) || {
    title: '',
    date,
    time: '09:00',
    location: '',
    type: 'Academic',
  };
  openDialog(
    id ? 'Edit school event' : 'Something to look forward to',
    'Add the next important date to your school calendar.',
    `<form id="eventForm" data-id="${e(id)}">${input('Event title *', 'title', ev.title, 'text', 'required maxlength="100"')}<div class="form-grid">${input('Date *', 'date', ev.date, 'date', 'required min="1900-01-01" max="2100-12-31"')}${input('Time (optional)', 'time', ev.time, 'time')}</div>${input('Location', 'location', ev.location, 'text', 'maxlength="100"')}<label>Category<select name="type">${['Academic', 'Meeting', 'Activity', 'Holiday'].map((s) => `<option ${ev.type === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>${id ? `<button type="button" class="text-danger" data-action="delete-event" data-id="${e(id)}">${icon('trash')}Delete event</button>` : ''}${formEnd(id ? 'Save event' : 'Add event')}`,
  );
}
function invoiceForm() {
  if (!data.students.length) {
    toast('Add a student before creating an invoice.', true);
    return;
  }
  openDialog(
    'Create an invoice',
    'Keep school fees clear and organized.',
    `<form id="invoiceForm"><label>Student *<select name="studentId" required><option value="">Choose a student</option>${data.students.map((s) => `<option value="${e(s.id)}">${e(s.name)} · ${e(className(s.classId))} · ${e(s.id)}</option>`).join('')}</select></label>${input('Description *', 'label', '', 'text', 'required maxlength="100" placeholder="e.g. Monthly tuition"')}<div class="form-grid">${input('Amount (NPR) *', 'amount', '', 'number', 'required min="0.01" max="10000000" step="0.01"')}${input('Due date *', 'due', shiftDate(today(), 7), 'date', 'required')}</div>${formEnd('Create invoice')}`,
  );
}
function paymentForm(id) {
  const i = data.invoices.find((i) => i.id === id);
  if (!i || i.paid >= i.amount) return;
  openDialog(
    'Record a payment',
    `${e(studentById(i.studentId).name)} · ${e(i.label)}`,
    `<div class="payment-balance"><span>Outstanding balance</span><strong>${money(i.amount - i.paid)}</strong></div><form id="paymentForm" data-id="${e(id)}">${input('Amount received (NPR) *', 'amount', Number((i.amount - i.paid).toFixed(2)), 'number', `required min="0.01" max="${(i.amount - i.paid).toFixed(2)}" step="0.01"`)}<label>Payment method<select name="method"><option>Cash</option><option>Bank transfer</option><option>Digital wallet</option><option>Cheque</option></select></label>${input('Payment date *', 'date', today(), 'date', `required max="${today()}"`)}<p class="form-note">This records an offline payment. No money is transferred.</p>${formEnd('Confirm payment')}`,
  );
}
let confirmCallback;
function confirmAction(title, description, label, callback) {
  confirmCallback = callback;
  openDialog(
    title,
    description,
    `<div class="confirmation-icon">${icon('info')}</div><div class="form-actions"><button class="secondary-btn" data-action="close-dialog">Cancel</button><button class="danger-btn" data-action="confirm">${icon('trash')}${label}</button></div>`,
  );
}
function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportStudents() {
  const students = filterStudents(data.students, state);
  download(
    `students-${today()}.csv`,
    '\uFEFF' +
      csv([
        ['Student ID', 'Name', 'Class', 'Status', 'Guardian', 'Phone', 'Email', 'Joined'],
        ...students.map((s) => [
          s.id,
          s.name,
          className(s.classId),
          s.status,
          s.guardian,
          s.phone,
          s.email,
          s.joined,
        ]),
      ]),
    'text/csv;charset=utf-8',
  );
  toast(`Exported ${students.length} student records.`);
}
function exportAttendance() {
  const records = data.attendance[state.attendanceDate] || {};
  download(
    `attendance-${state.attendanceDate}.csv`,
    '\uFEFF' +
      csv([
        ['Date', 'Student ID', 'Name', 'Class', 'Status'],
        ...data.students
          .filter((s) => s.classId === state.attendanceClass && s.status === 'Active')
          .map((s) => [
            state.attendanceDate,
            s.id,
            s.name,
            className(s.classId),
            records[s.id] || 'Unmarked',
          ]),
      ]),
    'text/csv;charset=utf-8',
  );
  toast('Attendance exported.');
}
function exportSummary() {
  download(
    `school-summary-${today()}.csv`,
    '\uFEFF' +
      csv([
        [
          'Class',
          'Total students',
          'Active',
          'Present',
          'Absent',
          'Late',
          'Unmarked',
          'Outstanding (NPR)',
        ],
        ...data.classes.map((c) => {
          const students = data.students.filter((s) => s.classId === c.id),
            s = attendanceSummary(students, data.attendance[today()]),
            ids = new Set(students.map((s) => s.id));
          return [
            c.name,
            students.length,
            s.total,
            s.present,
            s.absent,
            s.late,
            s.unmarked,
            data.invoices
              .filter((i) => ids.has(i.studentId))
              .reduce((sum, i) => sum + i.amount - i.paid, 0),
          ];
        }),
      ]),
    'text/csv;charset=utf-8',
  );
  toast('School summary exported.');
}
function closeMenu() {
  $('#sidebar').classList.remove('is-open');
  $('#sidebarOverlay').classList.remove('visible');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
}
const actions = {
  menu: () => {
    const open = $('#sidebar').classList.toggle('is-open');
    $('#sidebarOverlay').classList.toggle('visible', open);
    $('.menu-toggle').setAttribute('aria-expanded', String(open));
  },
  'add-student': (el) => studentForm('', el.dataset.classId),
  'edit-student': (el) => studentForm(el.dataset.id),
  'student-detail': (el) => studentDetail(el.dataset.id),
  'delete-student': (el) => {
    const s = studentById(el.dataset.id);
    confirmAction(
      'Delete student?',
      `This permanently removes ${e(s.name)} and their attendance, invoices, and payment history. Download a backup first if needed.`,
      'Delete student',
      () => {
        const invoices = new Set(
          data.invoices.filter((i) => i.studentId === s.id).map((i) => i.id),
        );
        data.students = data.students.filter((v) => v.id !== s.id);
        data.invoices = data.invoices.filter((i) => !invoices.has(i.id));
        data.payments = data.payments.filter((p) => !invoices.has(p.invoiceId));
        Object.values(data.attendance).forEach((r) => delete r[s.id]);
        save();
        render();
        toast('Student record deleted.');
      },
    );
  },
  'add-teacher': () => teacherForm(),
  'edit-teacher': (el) => teacherForm(el.dataset.id),
  'edit-class': (el) => classForm(el.dataset.id),
  'class-roster': (el) => {
    state.classId = el.dataset.id;
    state.query = '';
    state.status = '';
    state.page = 1;
    $('#globalSearch').value = '';
    navigate('students');
  },
  'prev-page': () => {
    state.page--;
    render();
  },
  'next-page': () => {
    state.page++;
    render();
  },
  mark: (el) => {
    if (state.attendanceDate > today()) return;
    data.attendance[state.attendanceDate] ??= {};
    data.attendance[state.attendanceDate][el.dataset.id] = el.dataset.status;
    save();
    const id = el.dataset.id,
      status = el.dataset.status;
    render();
    $(`button[data-action="mark"][data-id="${id}"][data-status="${status}"]`)?.focus();
  },
  'mark-all': () => {
    if (state.attendanceDate > today()) return;
    data.attendance[state.attendanceDate] ??= {};
    data.students
      .filter((s) => s.classId === state.attendanceClass && s.status === 'Active')
      .forEach((s) => (data.attendance[state.attendanceDate][s.id] = 'Present'));
    save();
    render();
    toast('All active students in this class marked present.');
  },
  'add-invoice': invoiceForm,
  payment: (el) => paymentForm(el.dataset.id),
  'add-event': () => eventForm(),
  'edit-event': (el) => eventForm(el.dataset.id),
  'day-event': (el) => eventForm('', el.dataset.date),
  'delete-event': (el) => {
    const id = el.dataset.id;
    confirmAction(
      'Delete event?',
      'This event will be removed from the school calendar.',
      'Delete event',
      () => {
        data.events = data.events.filter((ev) => ev.id !== id);
        save();
        render();
        toast('Event deleted.');
      },
    );
  },
  'prev-month': () => changeMonth(-1),
  'next-month': () => changeMonth(1),
  'this-month': () => {
    state.eventMonth = today().slice(0, 7);
    render();
  },
  'export-students': exportStudents,
  'export-attendance': exportAttendance,
  'export-summary': exportSummary,
  'export-backup': () => {
    download(`edumanage-backup-${today()}.json`, JSON.stringify(data, null, 2), 'application/json');
    toast('Backup downloaded. Keep it somewhere safe.');
  },
  reset: () =>
    confirmAction(
      'Reset your workspace?',
      'All changes will be replaced with the original fictional demo data. Download a backup first.',
      'Reset demo',
      () => {
        data = seedData();
        blockedStorage = false;
        $('#storageWarning').hidden = true;
        state.query = '';
        state.classId = '';
        state.status = '';
        state.page = 1;
        state.feeStatus = '';
        $('#globalSearch').value = '';
        save();
        render();
        toast('Demo restored with 96 students across all 12 grades.');
      },
    ),
  'close-dialog': closeDialog,
  confirm: () => {
    const callback = confirmCallback;
    confirmCallback = null;
    closeDialog();
    callback?.();
  },
  notifications: () => {
    const events = data.events
      .filter((ev) => ev.date >= today())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
    openDialog(
      'Coming up at school',
      'Your next dates, all in one place.',
      `<div class="event-list">${events.length ? events.map((ev) => eventItem(ev)).join('') : empty('You’re all caught up', 'No upcoming school events.')}</div>`,
    );
  },
  guide: () =>
    openDialog(
      'A simpler school day',
      'Your quick guide to EduManage.',
      `<div class="guide-steps">${[
        [
          'students',
          '1. Bring your community together',
          'Find, enroll, edit, or remove students. Each of Grades 1–12 has 8 sample students.',
        ],
        [
          'attendance',
          '2. Make every student count',
          'Choose a class and date, then mark present, absent, or late. Each change saves immediately.',
        ],
        [
          'fees',
          '3. Keep fees clear',
          'Create an invoice and record partial or full offline payments. Overpayments are prevented.',
        ],
        [
          'settings',
          '4. Keep your data safe',
          'Download a backup in Settings. Data stays in this browser, with no accounts or server sync.',
        ],
      ]
        .map(
          ([glyph, title, desc]) =>
            `<div>${icon(glyph)}<span><strong>${title}</strong><p>${desc}</p></span></div>`,
        )
        .join(
          '',
        )}</div><div class="form-actions"><button class="primary-btn" data-action="close-dialog">Got it ${icon('check')}</button></div>`,
    ),
};
function changeMonth(amount) {
  const d = new Date(`${state.eventMonth}-01T12:00:00`);
  d.setMonth(d.getMonth() + amount);
  if (d.getFullYear() < 1900 || d.getFullYear() > 2100) return;
  state.eventMonth = localDate(d).slice(0, 7);
  render();
}
document.addEventListener('click', (ev) => {
  const nav = ev.target.closest('[data-nav]');
  if (nav) {
    navigate(nav.dataset.nav);
    return;
  }
  const el = ev.target.closest('[data-action]');
  if (el && !el.disabled) actions[el.dataset.action]?.(el);
});
$('#sidebarOverlay').addEventListener('click', closeMenu);
document.addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') {
    ev.preventDefault();
    $('#globalSearch').focus();
  }
  if (ev.key === 'Escape') closeMenu();
});
function updateStudentQuery(value, targetId) {
  const start = $(`#${targetId}`)?.selectionStart;
  state.query = value;
  state.page = 1;
  if (state.view !== 'students') {
    navigate('students');
    return;
  }
  render();
  const field = $(`#${targetId}`);
  field?.focus();
  if (field && start !== null)
    try {
      field.setSelectionRange(start, start);
    } catch {}
}
document.addEventListener('input', (ev) => {
  if (ev.target.id === 'studentSearch') updateStudentQuery(ev.target.value, 'studentSearch');
  if (ev.target.id === 'globalSearch') {
    state.classId = '';
    state.status = '';
    updateStudentQuery(ev.target.value, 'globalSearch');
  }
});
document.addEventListener('change', async (ev) => {
  const el = ev.target;
  if (el.id === 'studentClassFilter') {
    state.classId = el.value;
    state.page = 1;
    render();
  }
  if (el.id === 'studentStatusFilter') {
    state.status = el.value;
    state.page = 1;
    render();
  }
  if (el.id === 'attendanceClass') {
    state.attendanceClass = el.value;
    render();
  }
  if (el.id === 'attendanceDate') {
    if (!el.value || el.value > today() || el.value < '1900-01-01') {
      toast('Choose a valid date, no later than today.', true);
      el.value = state.attendanceDate;
      return;
    }
    state.attendanceDate = el.value;
    render();
  }
  if (el.id === 'feeStatusFilter') {
    state.feeStatus = el.value;
    render();
  }
  if (el.id === 'restoreBackup') {
    const file = el.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast('Choose a backup smaller than 10 MB.', true);
      el.value = '';
      return;
    }
    try {
      const imported = JSON.parse(await file.text());
      if (!isValidData(imported)) throw new Error();
      confirmAction(
        'Replace current records?',
        `Restore ${imported.students.length} students and ${imported.classes.length} classes from this backup? Current records will be replaced.`,
        'Restore backup',
        () => {
          data = imported;
          blockedStorage = false;
          $('#storageWarning').hidden = true;
          state.query = '';
          state.classId = '';
          state.status = '';
          state.page = 1;
          state.feeStatus = '';
          $('#globalSearch').value = '';
          save();
          render();
          toast('Backup restored successfully.');
        },
      );
    } catch {
      toast('That file is not a valid EduManage backup. Your records were not changed.', true);
    }
    el.value = '';
  }
});
document.addEventListener('submit', (ev) => {
  const form = ev.target;
  if (
    ![
      'studentForm',
      'teacherForm',
      'classForm',
      'eventForm',
      'invoiceForm',
      'paymentForm',
      'settingsForm',
    ].includes(form.id)
  )
    return;
  ev.preventDefault();
  if (!form.reportValidity()) return;
  const fd = new FormData(form),
    values = Object.fromEntries(fd);
  Object.keys(values).forEach((key) => {
    if (typeof values[key] === 'string') values[key] = values[key].trim();
  });
  try {
    if (form.id === 'studentForm') {
      if (!values.name) throw new Error('Enter a student name, not just spaces.');
      const c = classById(values.classId);
      if (!c) throw new Error('Choose a valid class.');
      const id = form.dataset.id,
        target = studentById(id);
      const count = data.students.filter((s) => s.classId === c.id && s.id !== id).length;
      if (count >= c.capacity)
        throw new Error(
          'This class is at capacity. Increase the capacity in Classes or select another class.',
        );
      if (values.joined > today() || values.dob > today())
        throw new Error('Birth and joining dates cannot be in the future.');
      if (values.dob && values.dob > values.joined)
        throw new Error('Date of birth must be before the joining date.');
      if (target) Object.assign(target, values);
      else data.students.unshift({ id: uid('ST'), ...values });
      toast(target ? 'Student record updated.' : 'Student enrolled successfully.');
    }
    if (form.id === 'teacherForm') {
      if (!values.name) throw new Error('Enter a teacher name.');
      if (
        values.email &&
        data.teachers.some(
          (t) => t.id !== form.dataset.id && t.email.toLowerCase() === values.email.toLowerCase(),
        )
      )
        throw new Error('A teacher with this email already exists.');
      const t = teacherById(form.dataset.id);
      if (t) Object.assign(t, values);
      else data.teachers.push({ id: uid('T'), joined: today(), ...values });
      toast(t ? 'Teacher updated.' : 'Teacher added.');
    }
    if (form.id === 'classForm') {
      const c = classById(form.dataset.id),
        count = data.students.filter((s) => s.classId === c.id).length;
      if (!values.room) throw new Error('Enter a room name or number.');
      if (Number(values.capacity) < count)
        throw new Error(`Capacity must be at least ${count} to fit current students.`);
      c.teacherId = values.teacherId;
      c.room = values.room;
      c.capacity = Number(values.capacity);
      c.subjects = fd.getAll('subjects');
      toast('Class updated.');
    }
    if (form.id === 'eventForm') {
      if (!values.title) throw new Error('Enter an event title.');
      const event = data.events.find((e) => e.id === form.dataset.id);
      if (event) Object.assign(event, values);
      else data.events.push({ id: uid('EV'), ...values });
      state.eventMonth = values.date.slice(0, 7);
      toast(event ? 'Event updated.' : 'Event added to your calendar.');
    }
    if (form.id === 'invoiceForm') {
      if (!values.label || !studentById(values.studentId))
        throw new Error('Choose a student and enter an invoice description.');
      data.invoices.unshift({
        id: uid('INV'),
        studentId: values.studentId,
        label: values.label,
        amount: Math.round(Number(values.amount) * 100) / 100,
        paid: 0,
        due: values.due,
      });
      toast('Invoice created.');
    }
    if (form.id === 'paymentForm') {
      recordPayment(data, form.dataset.id, values.amount, values.method, values.date);
      toast('Payment recorded successfully.');
    }
    if (form.id === 'settingsForm') {
      if (!values.schoolName || !values.year)
        throw new Error('School name and academic year cannot be blank.');
      Object.assign(data.settings, values);
      save();
      syncShell();
      toast('School profile updated.');
      return;
    }
    save();
    closeDialog();
    render();
  } catch (error) {
    const node = $('#formError', form);
    if (node) {
      node.textContent = error.message;
      node.hidden = false;
    } else toast(error.message, true);
  }
});
hydrateIcons();
state.view = views.some((v) => v[0] === location.hash.slice(1))
  ? location.hash.slice(1)
  : 'dashboard';
render();
