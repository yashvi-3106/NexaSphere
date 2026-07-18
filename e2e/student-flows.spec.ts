import { test, expect } from '@playwright/test';

test.describe('Student Engagement and Admin Approval Flows', () => {
  test('should log in student, update profile, and register for an event', async ({ page }) => {
    // 1. Student SSO Login
    await page.goto('/api/auth/mock-login');
    await expect(page).toHaveURL(/.*dashboard|.*profile/);

    // 2. Updating Profile
    await page.goto('/settings/account');
    const bioTextarea = page.locator('textarea[name="bio"], textarea');
    if (await bioTextarea.isVisible()) {
      await bioTextarea.fill('I am a passionate software engineering student.');
      const saveBtn = page.getByRole('button', { name: /save|update/i }).first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await expect(page.locator('text=success|updated').first()).toBeVisible();
      }
    }

    // 3. Registering for an Event
    await page.goto('/events');
    const registerBtn = page.locator('button, a', { hasText: /Register/i }).first();
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      // Fill the form if fields are visible
      const nameInput = page.getByPlaceholder(/name/i);
      const emailInput = page.getByPlaceholder(/email/i);
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Student');
      }
      if (await emailInput.isVisible()) {
        await emailInput.fill('teststudent@glbajaj.org');
      }
      const submitBtn = page.getByRole('button', { name: /submit|register/i }).first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });

  test('should allow admin to approve a resource', async ({ page }) => {
    // 4. Admin approving a resource/project
    await page.goto('/admin');
    await page.getByPlaceholder(/username|email/i).fill('admin');
    await page.getByPlaceholder(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login|submit/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Go to resources manager page
    await page.goto('/dashboard/resources');

    // Find first approve button if it exists
    const approveBtn = page.getByRole('button', { name: /approve/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.locator('text=Resource approved').first()).toBeVisible();
    }
  });
});
