import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { TEST_USER } from '../helpers/test-data';
import { resetTestDatabase } from '../helpers/db-cleanup';

test.describe('Journey 6: Collaboration Team Formation & Workspace', () => {
  const roomId = 'test-collab-room-123';

  test.beforeAll(async ({ request }) => {
    await resetTestDatabase(request);
  });

  test('should create a collaboration workspace and allow team interaction', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const workspacePage = new WorkspacePage(page);

    // 1. Login as a registered user
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await page.waitForURL('**/dashboard');

    // 2. Navigate to a new workspace room (simulating team formation)
    await workspacePage.goto(roomId);

    // 3. Verify workspace loads successfully
    await expect(page.locator(`text=Room: ${roomId}`)).toBeVisible();

    // 4. Check real-time connection status
    await expect(workspacePage.statusText).toContainText(/Connected|Syncing/);

    // 5. Interact with the collaborative editor
    const testContent = 'Hello Team! This is our new collaboration space.';
    await workspacePage.typeContent(testContent);

    // 6. Verify content is reflected in the editor
    await expect(workspacePage.editorTextArea).toHaveValue(testContent);

    // 7. Verify presence indicator (avatar) is visible for the user
    await expect(page.locator('.avatar-group .avatar').first()).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    await resetTestDatabase(request);
  });
});
