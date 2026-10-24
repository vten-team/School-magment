import { test, expect } from '@playwright/test';

const navigate = async (page, view) => {
  await page.locator(`#navigation a[href="#${view}"]`).click();
  await expect(page).toHaveURL(new RegExp(`#${view}$`));
};
const getData = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('edumanage.v1')));

test('all navigation routes work without JavaScript errors; all grades have students', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Good .* Alex/ })).toBeVisible();
  for (const view of [
    'students',
    'teachers',
    'attendance',
    'classes',
    'fees',
    'calendar',
    'reports',
    'settings',
    'dashboard',
  ]) {
    await navigate(page, view);
    await expect(page.locator('#app')).not.toBeEmpty();
  }
  await navigate(page, 'classes');
  await expect(page.locator('.class-card')).toHaveCount(12);
  await expect(page.getByText('8 students', { exact: true })).toHaveCount(12);
  await page
    .locator('.class-card')
    .last()
    .getByRole('button', { name: 'View class roster' })
    .click();
  await expect(page.locator('#studentClassFilter')).toHaveValue('C-12');
  await expect(page.locator('tbody tr')).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('enroll, search, edit, transfer, persist, and delete a student safely', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add student', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Full name *').fill('  ');
  await dialog.getByRole('button', { name: 'Add student', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('not just spaces');
  await dialog.getByLabel('Full name *').fill('Test Learner');
  await dialog.getByLabel('Class & section').selectOption('C-12');
  await dialog.getByLabel('Guardian name').fill('Test Guardian');
  await dialog.getByRole('button', { name: 'Add student', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await getData(page)).students.length).toBe(97);
  await navigate(page, 'students');
  await page.getByLabel('Search student records').fill('Test Learner');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Edit Test Learner', exact: true }).click();
  await dialog.getByLabel('Class & section').selectOption('C-1');
  await dialog.getByLabel('Full name *').fill('Test <img src=x onerror=alert(1)>');
  await dialog.getByRole('button', { name: 'Save student', exact: true }).click();
  await page.reload();
  await page.getByLabel('Search student records').fill('Test <img');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.locator('tbody img')).toHaveCount(0);
  await expect(page.locator('tbody')).toContainText('Grade 1 · A');
  await page
    .getByRole('button', { name: 'Delete Test <img src=x onerror=alert(1)>', exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Delete student', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No students found' })).toBeVisible();
  expect((await getData(page)).students.length).toBe(96);
});

test('filters combine and pagination works; global search navigates to students', async ({
  page,
}) => {
  await page.goto('/#students');
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page.getByText('Page 2 of 10', { exact: true })).toBeVisible();
  await page.getByLabel('Filter by class').selectOption('C-2');
  await expect(page.locator('tbody tr')).toHaveCount(8);
  await page.getByLabel('Filter by status').selectOption('Inactive');
  await expect(page.getByRole('heading', { name: 'No students found' })).toBeVisible();
  await navigate(page, 'dashboard');
  await page.getByLabel('Search students', { exact: true }).fill('ST-0001');
  await expect(page).toHaveURL(/#students$/);
  await expect(page.locator('tbody tr')).toHaveCount(1);
});

test('attendance saves per class and date; future dates are rejected', async ({ page }) => {
  await page.goto('/#attendance');
  const date = '2025-01-01';
  await page.getByLabel('Date', { exact: true }).fill(date);
  await page.getByLabel('Date', { exact: true }).blur();
  await expect(page.getByText('Not marked', { exact: true })).toHaveCount(8);
  await page
    .locator('tbody tr')
    .first()
    .getByRole('button', { name: 'Absent', exact: true })
    .click();
  expect((await getData(page)).attendance[date]['ST-0001']).toBe('Absent');
  await page.getByRole('button', { name: 'Mark all present', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Present', exact: true, pressed: true }),
  ).toHaveCount(8);
  expect(Object.keys((await getData(page)).attendance[date]).length).toBe(8);
  await page.getByRole('combobox', { name: 'Class', exact: true }).selectOption('C-2');
  await expect(page.getByText('Not marked', { exact: true })).toHaveCount(8);
  await page.getByLabel('Date', { exact: true }).fill('2099-01-01');
  await page.getByLabel('Date', { exact: true }).blur();
  await expect(page.getByLabel('Date', { exact: true })).toHaveValue(date);
  await page.reload();
  expect((await getData(page)).attendance[date]['ST-0001']).toBe('Present');
});

test('create invoice, record partial then final payment, prevent overpayment', async ({ page }) => {
  await page.goto('/#fees');
  await page.getByRole('button', { name: 'Create invoice', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Student *', exact: true }).selectOption('ST-0001');
  await dialog.getByLabel('Description').fill('Test tuition');
  await dialog.getByLabel('Amount (NPR)').fill('1250.50');
  await dialog.getByRole('button', { name: 'Create invoice', exact: true }).click();
  const row = page.locator('tbody tr').filter({ hasText: 'Test tuition' });
  await row.getByRole('button', { name: 'Record payment' }).click();
  await dialog.getByLabel('Amount received').fill('2000');
  await dialog.getByRole('button', { name: 'Confirm payment' }).click();
  await expect(dialog).toBeVisible();
  expect((await getData(page)).invoices[0].paid).toBe(0);
  await dialog.getByLabel('Amount received').fill('1000.25');
  await dialog.getByRole('button', { name: 'Confirm payment' }).click();
  await expect(row).toContainText('Rs. 250.25');
  await row.getByRole('button', { name: 'Record payment' }).click();
  await expect(dialog.getByLabel('Amount received')).toHaveValue('250.25');
  await dialog.getByRole('button', { name: 'Confirm payment' }).click();
  await expect(row).toContainText('Paid');
  await expect(row.getByRole('button', { name: 'Record payment' })).toHaveCount(0);
  await page.reload();
  expect((await getData(page)).invoices[0].paid).toBe(1250.5);
});

test('teacher and class updates persist; capacity cannot be reduced below enrollment', async ({
  page,
}) => {
  await page.goto('/#teachers');
  await page.getByRole('button', { name: 'Add teacher', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Full name').fill('Test Teacher');
  await dialog.getByLabel('Email', { exact: true }).fill('teacher@example.com');
  await dialog.getByRole('button', { name: 'Add teacher', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Test Teacher' })).toBeVisible();
  const teacher = (await getData(page)).teachers.at(-1);
  await navigate(page, 'classes');
  await page.getByRole('button', { name: 'Edit Grade 1', exact: true }).click();
  await dialog.getByLabel('Capacity').fill('7');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(dialog.getByRole('alert')).toContainText('at least 8');
  await dialog.getByLabel('Capacity').fill('25');
  await dialog.getByLabel('Class teacher').selectOption(teacher.id);
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('.class-card').first()).toContainText('Test Teacher');
  await page.reload();
  expect((await getData(page)).classes[0].capacity).toBe(25);
});

test('event can be created, edited, and deleted', async ({ page }) => {
  await page.goto('/#calendar');
  await page.getByRole('button', { name: 'Add event', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Event title').fill('Test school concert');
  await dialog.getByLabel('Location').fill('Main hall');
  await dialog.getByRole('button', { name: 'Add event', exact: true }).click();
  await expect(page.locator('.calendar-agenda')).toContainText('Test school concert');
  await page.getByRole('button', { name: 'Edit Test school concert', exact: true }).click();
  await dialog.getByLabel('Event title').fill('Updated concert');
  await dialog.getByRole('button', { name: 'Save event' }).click();
  await page.getByRole('button', { name: 'Edit Updated concert', exact: true }).click();
  await dialog.getByRole('button', { name: 'Delete event' }).click();
  await dialog.getByRole('button', { name: 'Delete event' }).click();
  await expect(page.locator('.calendar-agenda')).not.toContainText('Updated concert');
});

test('backup download and restore, invalid import, settings, and reset', async ({ page }) => {
  await page.goto('/#settings');
  await page.getByLabel('School name').fill('Test Academy');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('#schoolLabel')).toHaveText('Test Academy');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^edumanage-backup-/);
  await page.locator('#restoreBackup').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.locator('#toasts')).toContainText('not a valid EduManage backup');
  expect((await getData(page)).settings.schoolName).toBe('Test Academy');
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.locator('#schoolLabel')).toHaveText('Greenfield Academy');
  await page.locator('#restoreBackup').setInputFiles(await download.path());
  await page.getByRole('dialog').getByRole('button', { name: 'Restore backup' }).click();
  await expect(page.locator('#schoolLabel')).toHaveText('Test Academy');
});

test('corrupted storage is not overwritten and recovery remains available', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('edumanage.v1', 'corrupted'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('could not be loaded');
  await expect(page.getByRole('heading', { name: /Good .* Alex/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('edumanage.v1'))).toBe('corrupted');
});

test('mobile navigation and layouts have no page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  for (const view of [
    'dashboard',
    'students',
    'classes',
    'teachers',
    'attendance',
    'fees',
    'calendar',
    'reports',
    'settings',
  ]) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.locator(`#navigation a[href="#${view}"]`).click();
    await expect(page.locator('#sidebar')).not.toHaveClass(/is-open/);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `overflow on ${view}`,
    ).toBe(true);
  }
});
