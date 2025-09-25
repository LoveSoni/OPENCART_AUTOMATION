import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export async function createScreenshot(page: Page): Promise<Buffer> {
  const screenshotDir = 'test-results/screenshots';
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(screenshotDir, `screenshot-${timestamp}.png`);
  
  const screenshot = await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshot;
}

export function getRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}