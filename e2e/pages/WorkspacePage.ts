import { Page, Locator } from '@playwright/test';

export class WorkspacePage {
  readonly page: Page;
  readonly editorTextArea: Locator;
  readonly backButton: Locator;
  readonly statusText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editorTextArea = page.locator('textarea.workspace-textarea');
    this.backButton = page.locator('button.workspace-back-btn');
    this.statusText = page.locator('.status-text');
  }

  async goto(roomId: string) {
    await this.page.goto(`/workspace/${roomId}`);
  }

  async typeContent(content: string) {
    await this.editorTextArea.fill(content);
  }

  async getStatus() {
    return this.statusText.innerText();
  }
}
