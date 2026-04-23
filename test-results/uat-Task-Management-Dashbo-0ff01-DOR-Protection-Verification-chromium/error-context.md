# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: uat.spec.js >> Task Management Dashboard - Full 9-Section UAT Suite >> 3. IDOR Protection Verification
- Location: tests/uat.spec.js:41:5

# Error details

```
Error: page.selectOption: options[0].label: expected string, got object
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]: ⚙️
      - generic [ref=e5]:
        - heading "Task Admin Panel" [level=1] [ref=e6]
        - generic [ref=e7]: Full Access
    - generic [ref=e8]:
      - generic [ref=e11]: API Connected
      - generic [ref=e12]: Admin 1776948113735
      - button "Logout" [ref=e13] [cursor=pointer]
      - link "📁 Manage Projects" [ref=e14] [cursor=pointer]:
        - /url: /admin/projects.html
      - link "👥 Manage Users" [ref=e15] [cursor=pointer]:
        - /url: /admin/users.html
      - link "📋 View Dashboard" [ref=e16] [cursor=pointer]:
        - /url: /
  - generic [ref=e17]:
    - complementary [ref=e18]:
      - heading "➕ Add New Task" [level=2] [ref=e20]
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Task Name *
          - textbox "Task Name *" [active] [ref=e24]:
            - /placeholder: e.g. Deploy to production
            - text: IDOR Test Task 1776948113735
        - generic [ref=e25]:
          - generic [ref=e26]: Assigned To *
          - combobox "Assigned To *" [ref=e27]:
            - option "-- Select Assignee --" [selected]
            - option "Admin 1776948001119 (admin-1776948001119@uat.com)"
            - option "Admin 1776948035386 (admin-1776948035386@uat.com)"
            - option "Admin 1776948113735 (admin-1776948113735@uat.com)"
            - option "User 1776948035386 (user-1776948035386@uat.com)"
            - option "User 1776948113735 (user-1776948113735@uat.com)"
        - generic [ref=e28]:
          - generic [ref=e29]: Project / Group
          - combobox "Project / Group" [ref=e30]:
            - option "-- No Project --" [selected]
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]: Start Date & Time *
            - textbox "Start Date & Time *" [ref=e34]
          - generic [ref=e35]:
            - generic [ref=e36]: Deadline *
            - textbox "Deadline *" [ref=e37]
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]: Estimated Time (Hours)
            - spinbutton "Estimated Time (Hours)" [ref=e41]
          - generic [ref=e42]:
            - generic [ref=e43]: End Time (Optional)
            - textbox "End Time (Optional)" [ref=e44]
        - generic [ref=e45]:
          - generic [ref=e46]: Priority *
          - combobox "Priority *" [ref=e47]:
            - option "Select priority" [selected]
            - option "🔴 High"
            - option "🟠 Medium"
            - option "🟢 Low"
        - generic [ref=e48]:
          - generic [ref=e49]:
            - checkbox "Task is Billable" [ref=e50]
            - generic [ref=e51]: Task is Billable
          - generic [ref=e52]:
            - checkbox "Recurring" [ref=e53]
            - generic [ref=e54]: Recurring
        - generic [ref=e55]:
          - generic [ref=e56]: Frequency
          - combobox "Frequency" [ref=e57]:
            - option "Daily" [selected]
            - option "Weekly"
            - option "Monthly"
        - generic [ref=e58]:
          - generic [ref=e59]: Tags (comma-separated, e.g. bug, frontend)
          - textbox "Tags (comma-separated, e.g. bug, frontend)" [ref=e60]:
            - /placeholder: e.g. bug, design, backend
        - generic [ref=e61]:
          - generic [ref=e62]: Blocked By (Dependencies)
          - listbox "Blocked By (Dependencies)" [ref=e63]
          - generic [ref=e64]: Hold Ctrl (or Cmd) to select multiple
        - group "Attachment (Optional)" [ref=e65]:
          - generic [ref=e66]: Attachment (Optional)
          - generic [ref=e67]:
            - generic [ref=e68]: File Name
            - textbox "File Name" [ref=e69]:
              - /placeholder: e.g. report_v2.pdf
          - generic [ref=e70]:
            - generic [ref=e71]: Download URL
            - textbox "Download URL" [ref=e72]:
              - /placeholder: https://example.com/file.pdf
        - generic [ref=e73]:
          - generic [ref=e74]: Add a comment (optional)
          - textbox "Add a comment (optional)" [ref=e75]:
            - /placeholder: Add a comment (e.g. initial instructions or context)
        - button "➕ Add Task" [ref=e76] [cursor=pointer]
    - main [ref=e77]:
      - generic [ref=e79]:
        - generic [ref=e80]:
          - checkbox "Select All" [ref=e81]
          - generic [ref=e82] [cursor=pointer]: Select All
        - heading "All Tasks 0" [level=2] [ref=e83]:
          - text: All Tasks
          - generic [ref=e84]: "0"
        - generic [ref=e85]:
          - textbox "🔍 Search tasks..." [ref=e86]
          - combobox [ref=e87] [cursor=pointer]:
            - option "All Priorities" [selected]
            - option "🔴 High"
            - option "🟠 Medium"
            - option "🟢 Low"
      - generic [ref=e89]:
        - generic [ref=e90]: 🗂️
        - paragraph [ref=e91]: No tasks match your filter.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Configuration
  4   | const ADMIN_SECRET = 'AdminSecret2026';
  5   | const STAMP = Date.now();
  6   | const ADMIN_NAME = `Admin ${STAMP}`;
  7   | const USER_NAME = `User ${STAMP}`;
  8   | const ADMIN_EMAIL = `admin-${STAMP}@uat.com`;
  9   | const USER_EMAIL = `user-${STAMP}@uat.com`;
  10  | const TEST_PASS = 'Password123!';
  11  | 
  12  | test.describe.configure({ mode: 'serial' });
  13  | 
  14  | test.describe('Task Management Dashboard - Full 9-Section UAT Suite', () => {
  15  |     
  16  |     test('1. Admin Registration', async ({ page }) => {
  17  |         await page.goto('/register', { waitUntil: 'networkidle' });
  18  |         await page.locator('#name').fill(ADMIN_NAME);
  19  |         await page.fill('#email', ADMIN_EMAIL);
  20  |         await page.fill('#password', TEST_PASS);
  21  |         await page.fill('#adminSecret', ADMIN_SECRET);
  22  |         await Promise.all([
  23  |             page.waitForURL('/'),
  24  |             page.click('button.auth-submit-btn')
  25  |         ]);
  26  |         await expect(page.locator('a.admin-link-btn[href="/admin/"]')).toBeVisible();
  27  |     });
  28  | 
  29  |     test('2. Standard User Registration', async ({ page }) => {
  30  |         await page.goto('/register', { waitUntil: 'networkidle' });
  31  |         await page.locator('#name').fill(USER_NAME);
  32  |         await page.fill('#email', USER_EMAIL);
  33  |         await page.fill('#password', TEST_PASS);
  34  |         await Promise.all([
  35  |             page.waitForURL('/'),
  36  |             page.click('button.auth-submit-btn')
  37  |         ]);
  38  |         await expect(page.locator('a.admin-link-btn[href="/admin/"]')).not.toBeVisible();
  39  |     });
  40  | 
  41  |     test('3. IDOR Protection Verification', async ({ page }) => {
  42  |         // Login as Admin
  43  |         await page.goto('/login');
  44  |         await page.fill('#email', ADMIN_EMAIL);
  45  |         await page.fill('#password', TEST_PASS);
  46  |         await Promise.all([
  47  |             page.waitForURL('/'),
  48  |             page.click('button.auth-submit-btn')
  49  |         ]);
  50  | 
  51  |         await page.goto('/admin/');
  52  |         await page.waitForSelector('#taskName');
  53  |         await page.fill('#taskName', `IDOR Test Task ${STAMP}`);
  54  |         // Assign to self (Admin)
> 55  |         await page.selectOption('#assignedTo', { label: new RegExp(ADMIN_NAME) });
      |                    ^ Error: page.selectOption: options[0].label: expected string, got object
  56  |         await page.click('#task-form button[type="submit"]');
  57  |         
  58  |         await page.waitForSelector(`button.delete-btn[data-task-id]`);
  59  |         const deleteBtn = page.locator('button.delete-btn').first();
  60  |         const taskId = await deleteBtn.getAttribute('data-task-id');
  61  |         console.log(`Created Task ID: ${taskId}`);
  62  | 
  63  |         // Login as Regular User
  64  |         await page.goto('/');
  65  |         await page.click('.logout-btn');
  66  |         await page.goto('/login');
  67  |         await page.fill('#email', USER_EMAIL);
  68  |         await page.fill('#password', TEST_PASS);
  69  |         await Promise.all([
  70  |             page.waitForURL('/'),
  71  |             page.click('button.auth-submit-btn')
  72  |         ]);
  73  | 
  74  |         // Attempt access
  75  |         const status = await page.evaluate(async (id) => {
  76  |             const res = await fetch(`/api/tasks/${id}`, {
  77  |                 headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
  78  |             });
  79  |             return res.status;
  80  |         }, taskId);
  81  |         
  82  |         console.log(`IDOR Access Status for user ${USER_NAME}: ${status}`);
  83  |         expect(status).toBe(403);
  84  |     });
  85  | 
  86  |     test('4. Session Persistence', async ({ page }) => {
  87  |         await page.goto('/');
  88  |         await page.reload();
  89  |         await expect(page.locator('.logout-btn')).toBeVisible();
  90  |     });
  91  | 
  92  |     test('5. Task Dashboard View & Filter', async ({ page }) => {
  93  |         await page.goto('/');
  94  |         await page.click('button:has-text("Kanban")');
  95  |         await expect(page.locator('.kanban-column:has-text("Not Started")')).toBeVisible();
  96  |     });
  97  | 
  98  |     test('6. Task Deletion & Cascading Clean', async ({ page }) => {
  99  |         // Login as Admin
  100 |         await page.goto('/login');
  101 |         await page.fill('#email', ADMIN_EMAIL);
  102 |         await page.fill('#password', TEST_PASS);
  103 |         await Promise.all([
  104 |             page.waitForURL('/'),
  105 |             page.click('button.auth-submit-btn')
  106 |         ]);
  107 |         
  108 |         await page.goto('/admin/');
  109 |         const taskName = `Delete Task ${STAMP}`;
  110 |         await page.fill('#taskName', taskName);
  111 |         await page.selectOption('#assignedTo', { label: new RegExp(USER_NAME) });
  112 |         await page.click('#task-form button[type="submit"]');
  113 | 
  114 |         await page.waitForSelector(`div.task-card:has-text("${taskName}")`);
  115 |         const taskId = await page.locator(`div.task-card:has-text("${taskName}") .delete-btn`).getAttribute('data-task-id');
  116 |         
  117 |         // Delete
  118 |         await page.locator(`div.task-card:has-text("${taskName}") .delete-btn`).click();
  119 |         await page.click('#modalOverlay button:has-text("Delete")'); // Confirm modal
  120 |         
  121 |         await expect(page.locator(`div.task-card:has-text("${taskName}")`)).not.toBeVisible();
  122 |     });
  123 | 
  124 |     test('7. Time Tracking & 60s performance', async ({ page }) => {
  125 |         await page.goto('/login');
  126 |         await page.fill('#email', USER_EMAIL);
  127 |         await page.fill('#password', TEST_PASS);
  128 |         await Promise.all([
  129 |             page.waitForURL('/'),
  130 |             page.click('button.auth-submit-btn')
  131 |         ]);
  132 | 
  133 |         const startBtn = page.locator('button:has-text("▶")').first();
  134 |         if (await startBtn.isVisible()) {
  135 |             await startBtn.click();
  136 |             const timer = page.locator('.timer-display').first();
  137 |             const val1 = await timer.textContent();
  138 |             await page.waitForTimeout(3000);
  139 |             const val2 = await timer.textContent();
  140 |             expect(val1).toBe(val2); // Should not update every second
  141 |         }
  142 |     });
  143 | 
  144 |     test('8. Deadline Overdue Lockout', async ({ page }) => {
  145 |         // Admin creates overdue task
  146 |         await page.goto('/login');
  147 |         await page.fill('#email', ADMIN_EMAIL);
  148 |         await page.fill('#password', TEST_PASS);
  149 |         await Promise.all([
  150 |             page.waitForURL('/'),
  151 |             page.click('button.auth-submit-btn')
  152 |         ]);
  153 |         await page.goto('/admin/');
  154 |         
  155 |         const past = new Date(Date.now() - 3600000).toISOString().slice(0, 16);
```