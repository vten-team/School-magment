export const STORAGE_KEY = 'edumanage.v1';
export const SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'Nepali',
  'Social Studies',
  'Computer Science',
];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function shiftDate(day, amount) {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return localDate(d);
}
export function uid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}
export function escapeHTML(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}
export function money(amount) {
  return `Rs. ${new Intl.NumberFormat('en-NP', { maximumFractionDigits: 2 }).format(amount)}`;
}
export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDate(date) === value;
}
export function seedData(today = localDate()) {
  const teacherNames = [
    'Anita Sharma',
    'Ramesh Adhikari',
    'Sujata Karki',
    'Prakash Rai',
    'Meena Thapa',
    'Bikash Shrestha',
    'Sita Poudel',
    'Arjun Gurung',
    'Puja Basnet',
    'Sanjay Joshi',
    'Nisha Tamang',
    'Deepak Khadka',
  ];
  const teachers = teacherNames.map((name, i) => ({
    id: `T-${i + 1}`,
    name,
    subject: SUBJECTS[i % 6],
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: '',
    joined: shiftDate(today, -60),
  }));
  const classes = Array.from({ length: 12 }, (_, i) => ({
    id: `C-${i + 1}`,
    name: `Grade ${i + 1}`,
    section: 'A',
    teacherId: teachers[i].id,
    room: `${i < 6 ? '1' : '2'}${String((i % 6) + 1).padStart(2, '0')}`,
    capacity: 30,
    subjects: [...SUBJECTS],
  }));
  const firstNames = [
    'Aarav',
    'Aanya',
    'Bibek',
    'Diya',
    'Ishan',
    'Kritika',
    'Niraj',
    'Priya',
    'Rohan',
    'Saanvi',
    'Suman',
    'Tara',
    'Aayush',
    'Anisha',
    'Dev',
    'Isha',
    'Kabir',
    'Luna',
    'Manish',
    'Neha',
    'Pranav',
    'Riya',
    'Sahil',
    'Trisha',
  ];
  const lastNames = ['Sharma', 'Rai', 'Thapa', 'Karki', 'Gurung', 'Shrestha', 'Tamang', 'Adhikari'];
  const students = classes.flatMap((c, i) =>
    Array.from({ length: 8 }, (_, j) => {
      const n = i * 8 + j;
      return {
        id: `ST-${String(n + 1).padStart(4, '0')}`,
        name: `${firstNames[(i * 3 + j) % firstNames.length]} ${lastNames[(i + j) % lastNames.length]}`,
        classId: c.id,
        status: 'Active',
        email: '',
        guardian: `Guardian ${n + 1}`,
        phone: '',
        joined: shiftDate(today, -Math.floor(n / 4)),
        dob: '',
      };
    }),
  );
  const attendance = {};
  // Demonstration records are deliberately seeded, not inferred from enrollment.
  for (let d = 0; d < 7; d++) {
    const day = shiftDate(today, -d);
    attendance[day] = Object.fromEntries(
      students.map((s, i) => [
        s.id,
        (i + d * 3) % 17 === 0 ? 'Absent' : (i + d) % 29 === 0 ? 'Late' : 'Present',
      ]),
    );
  }
  const invoices = students.map((s, i) => ({
    id: `INV-${String(i + 1).padStart(4, '0')}`,
    studentId: s.id,
    label: 'Monthly tuition',
    amount: 3500 + (i % 12) * 250,
    paid: i % 5 === 0 ? 0 : i % 7 === 0 ? 1500 : 3500 + (i % 12) * 250,
    due: shiftDate(today, i % 5 === 0 ? -3 : 10),
  }));
  const payments = invoices
    .filter((i) => i.paid > 0)
    .map((i, n) => ({
      id: `PAY-${n + 1}`,
      invoiceId: i.id,
      amount: i.paid,
      date: today,
      method: 'Bank transfer',
    }));
  const events = [
    {
      id: 'EV-1',
      title: 'Parent–teacher meeting',
      date: shiftDate(today, 2),
      time: '10:00',
      location: 'School auditorium',
      type: 'Meeting',
    },
    {
      id: 'EV-2',
      title: 'Mid-term examinations',
      date: shiftDate(today, 5),
      time: '09:00',
      location: 'All classrooms',
      type: 'Academic',
    },
    {
      id: 'EV-3',
      title: 'Science & innovation fair',
      date: shiftDate(today, 9),
      time: '10:30',
      location: 'School grounds',
      type: 'Activity',
    },
  ];
  return {
    version: 1,
    settings: {
      schoolName: 'Greenfield Academy',
      year: `${today.slice(0, 4)}/${String(Number(today.slice(0, 4)) + 1).slice(-2)}`,
      address: 'Inaruwa, Koshi, Nepal',
    },
    classes,
    teachers,
    students,
    attendance,
    invoices,
    payments,
    events,
  };
}
export function isValidData(data) {
  const text = (value, max = 200) => typeof value === 'string' && value.length <= max;
  const requiredText = (value, max = 200) => text(value, max) && value.trim().length > 0;
  const currency = (value) =>
    Number.isFinite(value) &&
    value >= 0 &&
    Math.abs(Math.round(value * 100) - value * 100) < 0.00001;
  if (
    !data ||
    data.version !== 1 ||
    !requiredText(data.settings?.schoolName, 80) ||
    !requiredText(data.settings?.year, 20) ||
    !text(data.settings?.address)
  )
    return false;
  const arrays = ['classes', 'teachers', 'students', 'invoices', 'payments', 'events'];
  if (
    !arrays.every(
      (key) =>
        Array.isArray(data[key]) &&
        data[key].every(
          (x) => x && typeof x.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(x.id),
        ) &&
        new Set(data[key].map((x) => x.id)).size === data[key].length,
    )
  )
    return false;
  if (!data.classes.length) return false;
  const classIds = new Set(data.classes.map((c) => c.id));
  const studentIds = new Set(data.students.map((s) => s.id));
  const teacherIds = new Set(data.teachers.map((t) => t.id));
  const invoiceIds = new Set(data.invoices.map((i) => i.id));
  if (
    !data.classes.every(
      (c) =>
        requiredText(c.name, 80) &&
        requiredText(c.section, 10) &&
        requiredText(c.room, 30) &&
        Number.isInteger(c.capacity) &&
        c.capacity > 0 &&
        c.capacity <= 200 &&
        (c.teacherId === '' || teacherIds.has(c.teacherId)) &&
        Array.isArray(c.subjects) &&
        c.subjects.every((s) => SUBJECTS.includes(s)),
    )
  )
    return false;
  if (
    !data.teachers.every(
      (t) =>
        requiredText(t.name, 80) &&
        text(t.email, 120) &&
        SUBJECTS.includes(t.subject) &&
        text(t.phone, 25) &&
        validDate(t.joined),
    )
  )
    return false;
  if (
    !data.students.every(
      (s) =>
        requiredText(s.name, 80) &&
        text(s.email, 120) &&
        text(s.guardian, 80) &&
        text(s.phone, 25) &&
        text(s.dob, 10) &&
        classIds.has(s.classId) &&
        ['Active', 'Inactive'].includes(s.status) &&
        validDate(s.joined) &&
        (!s.dob || (validDate(s.dob) && s.dob <= s.joined)),
    )
  )
    return false;
  if (
    !data.classes.every((c) => data.students.filter((s) => s.classId === c.id).length <= c.capacity)
  )
    return false;
  if (
    !data.invoices.every(
      (i) =>
        studentIds.has(i.studentId) &&
        requiredText(i.label, 100) &&
        currency(i.amount) &&
        i.amount > 0 &&
        i.amount <= 10000000 &&
        currency(i.paid) &&
        i.paid <= i.amount &&
        validDate(i.due),
    )
  )
    return false;
  if (
    !data.payments.every(
      (p) =>
        invoiceIds.has(p.invoiceId) &&
        currency(p.amount) &&
        p.amount > 0 &&
        validDate(p.date) &&
        ['Cash', 'Bank transfer', 'Digital wallet', 'Cheque'].includes(p.method),
    )
  )
    return false;
  // A backup must not silently disagree with its own payment ledger.
  if (
    !data.invoices.every(
      (i) =>
        Math.round(
          data.payments.filter((p) => p.invoiceId === i.id).reduce((sum, p) => sum + p.amount, 0) *
            100,
        ) === Math.round(i.paid * 100),
    )
  )
    return false;
  if (
    !data.events.every(
      (ev) =>
        requiredText(ev.title, 100) &&
        text(ev.location, 100) &&
        ['Academic', 'Meeting', 'Activity', 'Holiday'].includes(ev.type) &&
        validDate(ev.date) &&
        ev.date >= '1900-01-01' &&
        ev.date <= '2100-12-31' &&
        typeof ev.time === 'string' &&
        (!ev.time || /^([01]\d|2[0-3]):[0-5]\d$/.test(ev.time)),
    )
  )
    return false;
  return Boolean(
    data.attendance &&
    typeof data.attendance === 'object' &&
    !Array.isArray(data.attendance) &&
    Object.entries(data.attendance).every(
      ([day, records]) =>
        validDate(day) &&
        records &&
        typeof records === 'object' &&
        !Array.isArray(records) &&
        Object.entries(records).every(
          ([id, status]) => studentIds.has(id) && ['Present', 'Absent', 'Late'].includes(status),
        ),
    ),
  );
}
export function filterStudents(students, { query = '', classId = '', status = '' } = {}) {
  const q = query.trim().toLocaleLowerCase();
  return students.filter(
    (s) =>
      (!classId || s.classId === classId) &&
      (!status || s.status === status) &&
      (!q || [s.name, s.id, s.guardian, s.email].some((v) => v.toLocaleLowerCase().includes(q))),
  );
}
export function attendanceSummary(students, records = {}) {
  const active = students.filter((s) => s.status === 'Active');
  const result = { present: 0, absent: 0, late: 0, unmarked: 0, total: active.length, rate: 0 };
  active.forEach((s) => {
    const status = records[s.id];
    result[status ? status.toLowerCase() : 'unmarked']++;
  });
  const marked = result.present + result.absent + result.late;
  result.rate = marked ? Math.round(((result.present + result.late) / marked) * 1000) / 10 : 0;
  return result;
}
export function recordPayment(data, invoiceId, amount, method, date = localDate()) {
  const invoice = data.invoices.find((i) => i.id === invoiceId);
  if (
    !validDate(date) ||
    date > localDate() ||
    !['Cash', 'Bank transfer', 'Digital wallet', 'Cheque'].includes(method)
  )
    throw new Error('Choose a valid payment date and method.');
  const cents = Math.round(Number(amount) * 100);
  if (
    !invoice ||
    !Number.isFinite(cents) ||
    cents <= 0 ||
    cents > Math.round((invoice.amount - invoice.paid) * 100)
  )
    throw new Error('Enter a payment greater than zero and no more than the outstanding balance.');
  invoice.paid = Math.round(invoice.paid * 100 + cents) / 100;
  data.payments.push({ id: uid('PAY'), invoiceId, amount: cents / 100, date, method });
}
export function csv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          let text = String(value ?? '');
          // Prevent spreadsheet formulas in user-provided fields.
          if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(','),
    )
    .join('\r\n');
}
