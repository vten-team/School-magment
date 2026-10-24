import test from 'node:test';
import assert from 'node:assert/strict';
import {
  seedData,
  isValidData,
  localDate,
  shiftDate,
  validDate,
  filterStudents,
  attendanceSummary,
  recordPayment,
  escapeHTML,
  csv,
} from '../core.js';

test('96 fictional students cover every grade with unique records and valid references', () => {
  const data = seedData('2026-10-24');
  assert.equal(data.students.length, 96);
  assert.equal(data.classes.length, 12);
  assert.equal(new Set(data.students.map((s) => s.id)).size, 96);
  for (const c of data.classes)
    assert.equal(data.students.filter((s) => s.classId === c.id).length, 8);
  assert.ok(isValidData(data));
});
test('date utilities handle month ends and leap years without UTC shifts', () => {
  assert.equal(shiftDate('2026-03-01', -1), '2026-02-28');
  assert.equal(shiftDate('2024-03-01', -1), '2024-02-29');
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
  assert.equal(localDate(new Date(2026, 9, 24, 1)), '2026-10-24');
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('bad date'), false);
});
test('student search combines case-insensitive text, class, and status filters', () => {
  const { students } = seedData('2026-10-24');
  assert.equal(filterStudents(students, { classId: 'C-12' }).length, 8);
  assert.equal(filterStudents(students, { query: 'st-0001' }).length, 1);
  assert.equal(filterStudents(students, { query: '  AARAV ', classId: 'C-1' }).length, 1);
  assert.equal(filterStudents(students, { status: 'Inactive' }).length, 0);
});
test('attendance only counts active students and distinguishes unmarked from absent', () => {
  const students = [
    { id: '1', status: 'Active' },
    { id: '2', status: 'Active' },
    { id: '3', status: 'Active' },
    { id: '4', status: 'Active' },
    { id: '5', status: 'Inactive' },
  ];
  const s = attendanceSummary(students, { 1: 'Present', 2: 'Late', 3: 'Absent', 5: 'Present' });
  assert.deepEqual(s, { present: 1, late: 1, absent: 1, unmarked: 1, total: 4, rate: 66.7 });
  assert.equal(attendanceSummary(students).unmarked, 4);
  assert.equal(attendanceSummary([]).rate, 0);
});
test('payments support partial amounts and reject overpayments, zero, and NaN', () => {
  const data = seedData('2026-10-24');
  const invoice = data.invoices.find((i) => i.paid === 0);
  recordPayment(data, invoice.id, '1250.25', 'Cash', '2025-10-24');
  assert.equal(invoice.paid, 1250.25);
  assert.equal(data.payments.at(-1).amount, 1250.25);
  for (const amount of [0, -1, NaN, Infinity, invoice.amount])
    assert.throws(() => recordPayment(data, invoice.id, amount, 'Cash'));
  recordPayment(data, invoice.id, invoice.amount - invoice.paid, 'Cash', '2025-10-24');
  assert.equal(invoice.paid, invoice.amount);
  assert.ok(isValidData(data));
});
test('backup validation rejects broken shapes, dates, references, statuses, and duplicate IDs', () => {
  for (const mutate of [
    (d) => delete d.classes,
    (d) => {
      d.students[0].classId = 'missing';
    },
    (d) => {
      d.invoices[0].paid = d.invoices[0].amount + 1;
    },
    (d) => {
      d.events[0].date = '2026-02-30';
    },
    (d) => {
      d.students[0].name = null;
    },
    (d) => {
      d.students[1].id = d.students[0].id;
    },
    (d) => {
      d.attendance['2026-10-24']['missing'] = 'Present';
    },
    (d) => {
      d.attendance['2026-10-24']['ST-0001'] = 'Invalid';
    },
    (d) => {
      d.settings.schoolName = null;
    },
    (d) => {
      d.payments[0].amount += 1;
    },
    (d) => {
      d.classes[0].teacherId = 'missing';
    },
    (d) => {
      d.classes[0].capacity = 1;
    },
    (d) => {
      d.students[0].id = 'bad-id\"';
    },
    (d) => {
      d.classes = [];
      d.students = [];
      d.invoices = [];
      d.payments = [];
      d.attendance = {};
    },
  ]) {
    const data = seedData('2026-10-24');
    mutate(data);
    assert.equal(Boolean(isValidData(data)), false);
  }
  assert.equal(isValidData(null), false);
});
test('HTML output escapes untrusted fields and CSV blocks spreadsheet formula injection', () => {
  assert.equal(
    escapeHTML('<img src=x onerror="alert(1)">'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
  );
  assert.equal(csv([['=SUM(1,2)', 'a"b', 'line\nbreak']]), '"\'=SUM(1,2)","a""b","line\nbreak"');
});
