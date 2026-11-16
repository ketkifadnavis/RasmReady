import { expect, test, type Page } from '@playwright/test';

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(({ page }) => {
  expect(browserErrors.get(page), 'No uncaught browser errors').toEqual([]);
});

async function navigate(page: Page, name: string) {
  if (await page.getByTitle('Open Navigation', { exact: true }).isVisible()) {
    await page.getByTitle('Open Navigation', { exact: true }).click();
  }
  await page.locator('aside').getByRole('button', { name, exact: name !== 'Tasks' }).click();
}

async function signUp(page: Page, email: string, family = false, inviteLink?: string) {
  await page.goto(inviteLink || './');
  await page.getByRole('button', { name: 'Create Account', exact: true }).click();
  await page.getByLabel('Your name', { exact: true }).fill(family ? 'Family Tester' : 'Host Tester');
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('test-password-123');
  if (family) {
    if (inviteLink) await expect(page.getByLabel('I am the', { exact: true })).toHaveValue('family');
    else await page.getByLabel('I am the', { exact: true }).selectOption('family');
  }
  else {
    await page.getByLabel("Partner's name", { exact: true }).fill('First Partner');
    await page.getByLabel('Wedding date and time', { exact: true }).fill('2027-02-28T18:30');
    await page.getByLabel('Venue and location', { exact: true }).fill('First Venue');
  }
  await page.getByRole('button', { name: family ? 'Create account & join family' : 'Create wedding', exact: true }).click();
}

async function startWorkspace(page: Page) {
  await signUp(page, `scenario-${crypto.randomUUID()}@example.com`);
  await page.getByRole('button', { name: 'Get Started', exact: true }).click();
}

async function waitForSave(page: Page) {
  await expect(page.getByRole('status')).toContainText('Shared wedding workspace');
}

test('real accounts, live family edits, wedding isolation, refresh and mobile navigation', async ({ page, browser }) => {
  const suffix = crypto.randomUUID();
  const email = `host-${suffix}@example.com`;
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await signUp(page, email);
  await page.getByRole('button', { name: 'Get Started', exact: true }).click();
  await expect(page.getByTitle('Switch between weddings or join another', { exact: true })).toContainText('Host Tester & First Partner');
  await navigate(page, 'Tasks');
  await page.getByRole('button', { name: 'Add task', exact: true }).first().click();
  await page.getByPlaceholder("e.g. Receive Baraat at Gate or Safeguard Groom's Shoes").fill('First wedding task');
  await page.getByPlaceholder('e.g. Vikram Mama or Neha').fill('Family Tester');
  await page.locator('form').getByRole('button', { name: 'Add Task', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'First wedding task', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Invite Family', exact: true }).click();
  const inviteText = await page.getByText('Official RasmReady Pass', { exact: true }).locator('..').innerText();
  const code = inviteText.match(/RR-[A-F0-9]{32}/)?.[0];
  expect(code).toBeTruthy();
  const inviteLink = await page.getByText(/^https?:\/\/.+\?join=/).innerText();
  expect(new URL(inviteLink).pathname).toBe(new URL(page.url()).pathname);
  await page.getByRole('button', { name: 'Done', exact: true }).click();

  const familyContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const familyPage = await familyContext.newPage();
  try {
    await signUp(familyPage, `family-${suffix}@example.com`, true, inviteLink);
    await familyPage.getByLabel('Wedding Join Code', { exact: true }).fill('RR-NOTFOUND');
    await familyPage.getByRole('button', { name: 'Find wedding', exact: true }).click();
    await expect(familyPage.getByRole('alert')).toContainText('Invitation not found');
    await familyPage.getByLabel('Wedding Join Code', { exact: true }).fill(code!);
    await familyPage.getByRole('button', { name: 'Find wedding', exact: true }).click();
    await familyPage.getByRole('button', { name: 'Accept Invite & Join Wedding', exact: true }).click();
    await familyPage.getByRole('button', { name: 'Get Started', exact: true }).click();
    await navigate(familyPage, 'Tasks');
    await expect(familyPage.getByRole('heading', { name: 'First wedding task', exact: true })).toBeVisible();
    await familyPage.getByTitle('Mark as Done', { exact: true }).click();
    await expect(page.getByTitle('Mark as Done', { exact: true })).toHaveCount(0);
    await expect(familyPage.getByTitle('Edit Wedding Details', { exact: true })).toBeDisabled();

    const addConcurrentTask = async (target: Page, title: string) => {
      await target.getByRole('button', { name: 'Add task', exact: true }).first().click();
      await target.getByPlaceholder("e.g. Receive Baraat at Gate or Safeguard Groom's Shoes").fill(title);
      await target.getByPlaceholder('e.g. Vikram Mama or Neha').fill('Family Tester');
      await target.locator('form').getByRole('button', { name: 'Add Task', exact: true }).click();
    };
    await Promise.all([addConcurrentTask(page, 'Host concurrent task'), addConcurrentTask(familyPage, 'Family concurrent task')]);
    for (const target of [page, familyPage]) {
      await expect(target.getByRole('heading', { name: 'Host concurrent task', exact: true })).toBeVisible();
      await expect(target.getByRole('heading', { name: 'Family concurrent task', exact: true })).toBeVisible();
    }

    await page.getByTitle('Switch between weddings or join another', { exact: true }).click();
    await page.getByRole('button', { name: 'Create another wedding', exact: true }).click();
    await page.getByLabel("Partner's name", { exact: true }).fill('Second Partner');
    await page.getByLabel('Wedding date and time', { exact: true }).fill('2027-11-14T17:00');
    await page.getByLabel('Venue and location', { exact: true }).fill('Second Venue');
    await page.getByRole('button', { name: 'Create wedding', exact: true }).click();
    await expect(page.getByTitle('Switch between weddings or join another', { exact: true })).toContainText('Second Partner');
    await expect(page.getByRole('heading', { name: 'First wedding task', exact: true })).toHaveCount(0);
    await navigate(page, 'Overview');
    await expect(page.locator('main')).toContainText('14 November 2027');
    await expect(page.locator('main')).not.toContainText('First Partner');
    await page.reload();
    await expect(page.getByTitle('Switch between weddings or join another', { exact: true })).toContainText('Second Partner');
    await page.getByTitle('Edit Wedding Details', { exact: true }).click();
    await expect(page.locator('form input[type="text"]').nth(1)).toHaveValue('Second Partner');
    await page.locator('form input[type="text"]').nth(1).fill('Unsaved Partner');
    await page.locator('form').getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByTitle('Edit Wedding Details', { exact: true }).click();
    await expect(page.locator('form input[type="text"]').nth(1)).toHaveValue('Second Partner');
    await page.locator('form').getByRole('button', { name: 'Cancel', exact: true }).click();
    await navigate(page, 'Tasks');
    await expect(page.getByRole('heading', { name: 'First wedding task', exact: true })).toHaveCount(0);
    await page.getByTitle('Switch between weddings or join another', { exact: true }).click();
    await page.getByText("Host Tester & First Partner's Vivaah", { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'First wedding task', exact: true })).toBeVisible();

    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      for (const tab of ['Overview', 'Events & moodboards', 'Tasks', 'Money tracker', 'Vendors', 'Shopping list', 'Couple checklists', 'Guests', 'Our people', 'Shared album']) {
        await navigate(page, tab);
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(documentWidth, `${tab} at ${width}px`).toBeLessThanOrEqual(width);
      }
    }

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByTitle('Your account', { exact: true }).click();
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
    await page.getByLabel('Email address', { exact: true }).fill(email);
    await page.getByLabel('Password', { exact: true }).fill('wrong-password');
    await page.locator('form').getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
    await page.getByLabel('Password', { exact: true }).fill('test-password-123');
    await page.locator('form').getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page.getByTitle('Switch between weddings or join another', { exact: true })).toContainText('First Partner');
    expect(runtimeErrors).toEqual([]);
  } finally { await familyContext.close(); }
});

test('duplicate registration is rejected without creating another wedding', async ({ page }) => {
  const email = `duplicate-${crypto.randomUUID()}@example.com`;
  await signUp(page, email);
  await page.getByRole('button', { name: 'Get Started', exact: true }).click();
  await page.getByTitle('Your account', { exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toBeVisible();
  await signUp(page, email);
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('email-already-in-use');
  await expect(page.getByTitle('Switch between weddings or join another', { exact: true })).toHaveCount(0);
});

test('wedding details load correctly, preserve local time, refresh, and export the edited wedding', async ({ page }) => {
  await startWorkspace(page);
  await page.getByTitle('Edit Wedding Details', { exact: true }).click();
  await expect(page.locator('form input[type="text"]').nth(0)).toHaveValue('Host Tester');
  await expect(page.locator('form input[type="text"]').nth(1)).toHaveValue('First Partner');
  await expect(page.locator('form input[type="datetime-local"]')).toHaveValue('2027-02-28T18:30');
  await page.locator('form input[type="datetime-local"]').fill('');
  await page.locator('form').getByRole('button', { name: 'Save Changes', exact: true }).click();
  await expect(page.locator('form')).toBeVisible();
  await page.locator('form input[type="text"]').nth(1).fill('Updated Partner');
  await page.locator('form input[type="datetime-local"]').fill('2027-05-10T18:45');
  await page.getByPlaceholder('e.g. Chandra Mahal Palace & Gardens, Jaipur').fill('Updated Venue');
  await page.locator('form').getByRole('button', { name: 'Save Changes', exact: true }).click();
  await expect(page.locator('main')).toContainText('Updated Partner');
  await expect(page.locator('main')).toContainText('10 May 2027');
  await waitForSave(page);
  await page.reload();
  await page.getByTitle('Edit Wedding Details', { exact: true }).click();
  await expect(page.locator('form input[type="datetime-local"]')).toHaveValue('2027-05-10T18:45');
  await page.locator('form').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Export Summary (PDF)', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Wedding Executive Summary', exact: true })).toBeVisible();
  await expect(page.locator('body')).toContainText('Updated Venue');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF', exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toContain('Updated Partner');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).subarray(0, 4).toString()).toBe('%PDF');
});

test('task validation, cancellation, all status transitions, search, side filters and delete confirmation', async ({ page }) => {
  await startWorkspace(page);
  await navigate(page, 'Tasks');
  await page.getByRole('button', { name: 'Add task', exact: true }).first().click();
  await page.locator('form').getByRole('button', { name: 'Add Task', exact: true }).click();
  await expect(page.locator('form')).toBeVisible();
  await page.locator('form').getByRole('button', { name: 'Cancel', exact: true }).click();
  for (const [title, side] of [['Bride side task', 'Ladkiwale'], ['Groom side task', 'Ladkewale'], ['Joint task', 'Joint / Shared']]) {
    await page.getByRole('button', { name: 'Add task', exact: true }).first().click();
    await page.getByPlaceholder("e.g. Receive Baraat at Gate or Safeguard Groom's Shoes").fill(title);
    await page.getByPlaceholder('e.g. Vikram Mama or Neha').fill('QA Delegate');
    await page.locator('form').getByRole('button', { name: side, exact: true }).click();
    await page.locator('form').getByRole('button', { name: 'Add Task', exact: true }).click();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  await page.locator('aside').getByRole('button', { name: 'Ladki', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Groom side task', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Joint task', exact: true })).toBeVisible();
  await page.locator('aside').getByRole('button', { name: 'Both', exact: true }).click();
  await page.getByPlaceholder('Find a task...').fill('Bride side task');
  for (const title of ['Move to In Progress', 'Mark as Blocked', 'Mark as Done', 'Move to Not Started']) {
    await page.getByTitle(title, { exact: true }).click();
    await expect(page.getByTitle(title, { exact: true })).toHaveCount(0);
  }
  await page.getByTitle('Edit Task', { exact: true }).click();
  await page.getByPlaceholder("e.g. Receive Baraat at Gate or Safeguard Groom's Shoes").fill('Renamed bride task');
  await page.locator('form').getByRole('button', { name: 'Save Changes', exact: true }).click();
  await page.getByPlaceholder('Find a task...').fill('Renamed bride task');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByTitle('Delete Task', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Renamed bride task', exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByTitle('Delete Task', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Renamed bride task', exact: true })).toHaveCount(0);
});

test('budget payment totals, ceremony filters, privacy lock and invalid PIN handling', async ({ page }) => {
  await startWorkspace(page);
  await navigate(page, 'Money tracker');
  await page.getByRole('button', { name: 'Add Expense', exact: true }).click();
  await page.getByPlaceholder('e.g. Mandap Floral Decor or Sangeet DJ').fill('Payment flow');
  await page.locator('form input[type="number"]').nth(0).fill('1000');
  await page.locator('form').getByRole('button', { name: 'Add Item', exact: true }).click();
  const expense = page.locator('tr').filter({ hasText: 'Payment flow' });
  await expense.getByTitle('Click to toggle status', { exact: true }).click();
  await expect(expense).toContainText('advance paid');
  await expect(expense).toContainText('₹500');
  await expense.getByTitle('Click to toggle status', { exact: true }).click();
  await expect(expense).toContainText('fully paid');
  await expect(expense).toContainText('₹0');
  await page.locator('main select').first().selectOption('haldi');
  await expect(expense).toHaveCount(0);
  await page.locator('main select').first().selectOption('all');
  await page.getByTitle('Click to hide sensitive financial numbers', { exact: true }).click();
  await expect(page.locator('main')).toContainText('₹••••••');
  await page.getByTitle('Click to unlock financial details with Admin PIN', { exact: true }).click();
  await page.getByPlaceholder('Enter PIN (e.g. 2027)').fill('0000');
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText('Incorrect Admin PIN. Hint: 2027', { exact: true })).toBeVisible();
  await page.getByPlaceholder('Enter PIN (e.g. 2027)').fill('2027');
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator('main')).not.toContainText('₹••••••');
});

test('moodboard edits and inspiration, checklist completion, theme and guide persist', async ({ page }) => {
  await startWorkspace(page);
  await navigate(page, 'Events & moodboards');
  await page.getByRole('button', { name: 'Edit Moodboard', exact: true }).click();
  await page.locator('form input[type="text"]').first().fill('QA ceremony theme');
  await page.locator('form').getByRole('button', { name: 'Save Moodboard', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'QA ceremony theme', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add Inspiration', exact: true }).click();
  await page.getByPlaceholder('https://...').fill(new URL('assets/aistudio/Screenshot_2026-11-06_at_12.09.50_AM_0ee25bbd.png', page.url()).href);
  await page.getByPlaceholder('e.g. Stage lighting setup or floral entrance').fill('QA inspiration');
  await page.locator('form').getByRole('button', { name: 'Add Inspiration', exact: true }).click();
  await expect(page.getByText('QA inspiration', { exact: true })).toBeVisible();
  await navigate(page, 'Couple checklists');
  await page.getByRole('button', { name: 'Add checklist item', exact: true }).click();
  await page.getByPlaceholder('e.g. Haldi gotapatti dupatta steam ironed').fill('QA custom checklist');
  await page.locator('form button[type="submit"]').click();
  await page.getByRole('button', { name: 'QA custom checklist', exact: true }).click();
  await expect(page.getByText('QA custom checklist', { exact: true })).toHaveClass(/line-through/);
  const before = await page.locator('html').getAttribute('class');
  await page.getByTitle('Toggle Theme', { exact: true }).click();
  await expect(page.locator('html')).not.toHaveAttribute('class', before || '');
  await waitForSave(page);
  await page.reload();
  await navigate(page, 'Couple checklists');
  await expect(page.getByText('QA custom checklist', { exact: true })).toHaveClass(/line-through/);
  await page.getByText('QA custom checklist', { exact: true }).locator('../..').getByTitle('Delete item', { exact: true }).click();
  await expect(page.getByText('QA custom checklist', { exact: true })).toHaveCount(0);
  await navigate(page, 'Events & moodboards');
  await expect(page.getByRole('heading', { name: 'QA ceremony theme', exact: true })).toBeVisible();
  await expect(page.getByText('QA inspiration', { exact: true })).toBeVisible();
  await page.getByTitle('First-Time Guide', { exact: true }).click();
  await page.getByRole('button', { name: 'Close welcome guide', exact: true }).click();
});

test('photo upload, ceremony filters, lightbox, likes, persistence and delete confirmation', async ({ page }) => {
  await startWorkspace(page);
  await navigate(page, 'Shared album');
  await page.getByRole('button', { name: 'Upload Memory', exact: true }).click();
  await expect(page.locator('form button[type="submit"]')).toBeDisabled();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image'),
  });
  await expect(page.getByText('Please select a valid image file (JPG, PNG, WebP, HEIC).', { exact: true })).toBeVisible();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'pixel.png', mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
  });
  await page.getByPlaceholder('e.g. Sangeet dance rehearsal or Baraat entry (optional)').fill('QA wedding memory');
  await page.locator('form').getByRole('button', { name: 'Upload Memory', exact: true }).click();
  await expect(page.getByRole('img', { name: 'QA wedding memory', exact: true })).toBeVisible();
  await page.getByTitle('Like memory', { exact: true }).click();
  await expect(page.getByTitle('Like memory', { exact: true })).toHaveText('2');
  await page.getByRole('img', { name: 'QA wedding memory', exact: true }).click();
  await expect(page.getByText(/Shared by Family Member/)).toBeVisible();
  await page.getByText(/Shared by Family Member/).locator('../..').getByRole('button').click();
  await page.locator('main select').selectOption('haldi');
  await expect(page.getByRole('img', { name: 'QA wedding memory', exact: true })).toHaveCount(0);
  await page.locator('main select').selectOption('all');
  await waitForSave(page);
  await page.reload();
  await navigate(page, 'Shared album');
  await expect(page.getByTitle('Like memory', { exact: true })).toHaveText('2');
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByTitle('Delete photo', { exact: true }).click();
  await expect(page.getByRole('img', { name: 'QA wedding memory', exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByTitle('Delete photo', { exact: true }).click();
  await expect(page.getByRole('img', { name: 'QA wedding memory', exact: true })).toHaveCount(0);
});

test('directory entries are not falsely reported as sent invitations, and can be removed', async ({ page }) => {
  await startWorkspace(page);
  await navigate(page, 'Our people');
  await page.getByRole('button', { name: 'Add Member Directly', exact: true }).click();
  await page.getByPlaceholder('e.g. Vikram Mama, Pooja Bhabhi').fill('QA Directory Member');
  await page.getByPlaceholder('e.g. vikram@family.com or +91 98200 11223').fill('directory@example.com');
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText('Directory entry added for QA Directory Member.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'QA Directory Member', exact: true })).toBeVisible();
  await page.getByRole('heading', { name: 'QA Directory Member', exact: true }).locator('../../../..').getByTitle('Remove member', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'QA Directory Member', exact: true })).toHaveCount(0);
});

test('vendor contracts are reachable, editable, filterable and sync idempotently to budget', async ({ page }) => {
  await startWorkspace(page);
  await navigate(page, 'Vendors');
  await page.getByRole('button', { name: 'Add Vendor', exact: true }).click();
  await page.getByPlaceholder('e.g. Pandit Rakesh Shastri').fill('QA Catering');
  await page.getByPlaceholder('e.g. Pt. Rakesh').fill('QA Contact');
  await page.getByPlaceholder('+91 98200 12345').fill('0000000000');
  await page.locator('form').getByRole('button', { name: 'Save Vendor', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'QA Catering', exact: true })).toBeVisible();
  await page.getByTitle('Edit Vendor', { exact: true }).click();
  await page.getByPlaceholder('e.g. Pandit Rakesh Shastri').fill('QA Updated Catering');
  await page.locator('form').getByRole('button', { name: 'Update Vendor', exact: true }).click();
  await page.locator('main select').first().selectOption('pandit');
  await expect(page.getByRole('heading', { name: 'QA Updated Catering', exact: true })).toHaveCount(0);
  await page.locator('main select').first().selectOption('all');
  await navigate(page, 'Money tracker');
  await page.getByRole('button', { name: 'Sync Vendors', exact: true }).click();
  await expect(page.locator('tr').filter({ hasText: 'QA Updated Catering' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Sync Vendors', exact: true }).click();
  await expect(page.locator('tr').filter({ hasText: 'QA Updated Catering' })).toHaveCount(1);
  await navigate(page, 'Vendors');
  page.once('dialog', dialog => dialog.accept());
  await page.getByTitle('Delete Vendor', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'QA Updated Catering', exact: true })).toHaveCount(0);
});

test('planning changes persist remotely, optional fields can be cleared, and large photos are rejected', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await signUp(page, `crud-${crypto.randomUUID()}@example.com`);
  await page.getByRole('button', { name: 'Get Started', exact: true }).click();
  await navigate(page, 'Money tracker');
  await page.getByRole('button', { name: 'Add Expense', exact: true }).click();
  await page.getByPlaceholder('e.g. Mandap Floral Decor or Sangeet DJ').fill('Shared expense');
  await page.locator('form').getByRole('button', { name: 'Add Item', exact: true }).click();
  let expense = page.locator('tr').filter({ hasText: 'Shared expense' });
  await expect(expense).toBeVisible();
  await expense.getByTitle('Edit Expense', { exact: true }).click();
  await page.getByPlaceholder('e.g. Mandap Floral Decor or Sangeet DJ').fill('Updated expense');
  await page.locator('form').getByRole('button', { name: 'Save Changes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Shared wedding workspace');
  await page.reload();
  await navigate(page, 'Money tracker');
  expense = page.locator('tr').filter({ hasText: 'Updated expense' });
  await expect(expense).toBeVisible();
  await expense.getByTitle('Delete Expense', { exact: true }).click();
  await expect(expense).toHaveCount(0);

  await navigate(page, 'Guests');
  await page.getByRole('button', { name: 'Add Guest', exact: true }).click();
  await page.getByPlaceholder('e.g. Sunil Sharma Family').fill('Shared family');
  await page.getByPlaceholder('+91 98200 12345').fill('0000000000');
  await page.locator('form').getByRole('button', { name: 'Save Guest', exact: true }).click();
  const guest = page.locator('tr').filter({ hasText: 'Shared family' });
  await guest.getByTitle('Click to toggle RSVP status', { exact: true }).click();
  await expect(guest).toContainText('attending');
  await guest.getByTitle('Delete Guest', { exact: true }).click();
  await expect(guest).toHaveCount(0);

  await navigate(page, 'Shopping list');
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByPlaceholder('e.g. Haldi marigold garlands & brass bowls').fill('Shared shopping');
  await page.locator('form').getByRole('button', { name: 'Add to list', exact: true }).click();
  await page.getByPlaceholder('Find a shopping item, person in charge...').fill('Shared shopping');
  await expect(page.locator('main')).toContainText('Shared shopping');
  await page.getByTitle('Edit item', { exact: true }).click();
  await page.getByPlaceholder('https://pinterest.com/...').fill('https://example.com/reference');
  await page.locator('form').getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('a[href="https://example.com/reference"]')).toBeVisible();
  await page.getByTitle('Edit item', { exact: true }).click();
  await page.getByPlaceholder('https://pinterest.com/...').fill('');
  await page.locator('form').getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('a[href="https://example.com/reference"]')).toHaveCount(0);
  await page.getByText('Shared shopping', { exact: true }).locator('../../..').getByRole('button').first().click();
  await expect(page.getByText('Shared shopping', { exact: true })).toHaveClass(/line-through/);
  await page.getByRole('button', { name: 'To Buy', exact: true }).click();
  await expect(page.getByText('Shared shopping', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Bought', exact: true }).click();
  await expect(page.getByText('Shared shopping', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Shared wedding workspace');
  await page.reload();
  await navigate(page, 'Shopping list');
  await expect(page.locator('main')).toContainText('Shared shopping');
  await expect(page.getByText('Shared shopping', { exact: true })).toHaveClass(/line-through/);
  await expect(page.locator('a[href="https://example.com/reference"]')).toHaveCount(0);
  await page.getByTitle('Delete item', { exact: true }).click();
  await expect(page.locator('main')).not.toContainText('Shared shopping');

  await navigate(page, 'Shared album');
  await page.getByRole('button', { name: 'Upload Memory', exact: true }).click();
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'too-large.png', mimeType: 'image/png', buffer: Buffer.alloc(651 * 1024),
  });
  await expect(page.getByText('Choose an image of 650 KB or smaller. Resize larger photos before uploading.', { exact: true })).toBeVisible();
});

test('offline planning writes remain pending and synchronize after reconnection', async ({ page, context }) => {
  await startWorkspace(page);
  await navigate(page, 'Shopping list');
  await context.setOffline(true);
  try {
    await page.getByRole('button', { name: 'Add item', exact: true }).click();
    await page.getByPlaceholder('e.g. Haldi marigold garlands & brass bowls').fill('Offline queued item');
    await page.locator('form').getByRole('button', { name: 'Add to list', exact: true }).click();
    await expect(page.getByText('Offline queued item', { exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Saving changes');
  } finally {
    await context.setOffline(false);
  }
  await expect(page.getByRole('status')).toContainText('Shared wedding workspace', { timeout: 30_000 });
  await page.reload();
  await navigate(page, 'Shopping list');
  await expect(page.getByText('Offline queued item', { exact: true })).toBeVisible();
});

test('guest logistics and ceremony RSVPs persist, dietary filters work, and invitation text uses this wedding', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await startWorkspace(page);
  await navigate(page, 'Guests');
  await page.getByRole('button', { name: 'Add Guest', exact: true }).click();
  await page.getByPlaceholder('e.g. Sunil Sharma Family').fill('QA Guest Family');
  await page.getByPlaceholder('+91 98200 12345').fill('0000000000');
  await page.locator('form input[type="number"]').first().fill('3');
  await page.locator('form input[type="number"]').nth(1).fill('1');
  await page.locator('form select').selectOption('jain');
  await page.getByPlaceholder('e.g. Palace Suite 204').fill('QA room 101');
  await page.locator('form').getByRole('button', { name: 'Save Guest', exact: true }).click();
  const guest = page.locator('tr').filter({ hasText: 'QA Guest Family' });
  await guest.getByTitle('Edit Guest Details', { exact: true }).click();
  await expect(page.getByPlaceholder('e.g. Palace Suite 204')).toHaveValue('QA room 101');
  await page.locator('form').getByLabel('Attending', { exact: true }).first().check();
  await page.locator('form').getByRole('button', { name: 'Update Guest', exact: true }).click();
  await guest.getByTitle('Click to toggle RSVP status', { exact: true }).click();
  await page.locator('main select').nth(1).selectOption('pure_veg');
  await expect(guest).toHaveCount(0);
  await page.locator('main select').nth(1).selectOption('jain');
  await expect(guest).toBeVisible();
  await waitForSave(page);
  await page.reload();
  await navigate(page, 'Guests');
  await expect(guest).toContainText('attending');
  await page.getByRole('button', { name: 'Digital E-Cards & WhatsApp', exact: true }).click();
  await page.getByRole('button', { name: 'Copy Message & Contacts', exact: true }).click();
  await expect(page.getByText('Copied full invite text & contacts to clipboard!', { exact: true })).toBeVisible();
  const invitation = await page.evaluate(() => navigator.clipboard.readText());
  expect(invitation).toContain('Host Tester & First Partner');
  expect(invitation).toContain('First Venue');
  const whatsapp = page.getByRole('link', { name: 'Open WhatsApp', exact: true });
  const url = new URL((await whatsapp.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.searchParams.get('text')).toBe(invitation);
});

test('clipboard denial shows errors rather than false success or uncaught exceptions', async ({ page }) => {
  await startWorkspace(page);
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => { throw new DOMException('Clipboard blocked', 'NotAllowedError'); };
  });
  await navigate(page, 'Events & moodboards');
  await page.getByTitle(/^Copy #/).first().click();
  await expect(page.getByRole('alert')).toContainText('Could not copy');
  await navigate(page, 'Guests');
  await page.getByRole('button', { name: 'Digital E-Cards & WhatsApp', exact: true }).click();
  await page.getByRole('button', { name: 'Copy Message & Contacts', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not copy');
  await page.getByRole('heading', { name: /Digital E-Card & 1-Click/ }).locator('../..').getByRole('button').click();
  await navigate(page, 'Overview');
  await page.getByRole('button', { name: 'Export Summary (PDF)', exact: true }).click();
  await page.getByTitle('Copy formatted summary to clipboard', { exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not copy');
  await expect(page.getByRole('button', { name: 'Copied!', exact: true })).toHaveCount(0);
});
