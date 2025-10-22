import { test, expect } from '@playwright/test';

test.describe('Theme Variables', () => {
  test('should apply light mode theme correctly', async ({ page }) => {
    await page.goto('/');

    // Get CSS variables
    const cssVars = await page.evaluate(() => {
      const rootStyles = window.getComputedStyle(document.documentElement);
      return {
        background: rootStyles.getPropertyValue('--background').trim(),
        foreground: rootStyles.getPropertyValue('--foreground').trim(),
        primary: rootStyles.getPropertyValue('--primary').trim(),
        secondary: rootStyles.getPropertyValue('--secondary').trim(),
        muted: rootStyles.getPropertyValue('--muted').trim(),
        accent: rootStyles.getPropertyValue('--accent').trim(),
        border: rootStyles.getPropertyValue('--border').trim(),
        radius: rootStyles.getPropertyValue('--radius').trim(),
      };
    });

    // Verify light mode values
    expect(cssVars.background).toBe('oklch(0.929 0.013 255.508)');
    expect(cssVars.foreground).toBe('#333333');
    expect(cssVars.primary).toBe('#5e30eb');
    expect(cssVars.secondary).toBe('#ed719e');
    expect(cssVars.muted).toBe('#f9fafb');
    expect(cssVars.accent).toBe('#d9cafe');
    expect(cssVars.border).toBe('#e5e7eb');
    expect(cssVars.radius).toBe('0.375rem');
  });

  test('should apply dark mode theme correctly', async ({ browser }) => {
    const context = await browser.newContext({
      colorScheme: 'dark',
    });
    const page = await context.newPage();

    await page.goto('/');

    // Get CSS variables
    const cssVars = await page.evaluate(() => {
      const rootStyles = window.getComputedStyle(document.documentElement);
      return {
        background: rootStyles.getPropertyValue('--background').trim(),
        foreground: rootStyles.getPropertyValue('--foreground').trim(),
        primary: rootStyles.getPropertyValue('--primary').trim(),
        secondary: rootStyles.getPropertyValue('--secondary').trim(),
        muted: rootStyles.getPropertyValue('--muted').trim(),
        border: rootStyles.getPropertyValue('--border').trim(),
        card: rootStyles.getPropertyValue('--card').trim(),
      };
    });

    // Verify dark mode values
    expect(cssVars.background).toBe('oklch(0.372 0.044 257.287)');
    expect(cssVars.foreground).toBe('#e5e5e5');
    expect(cssVars.primary).toBe('#5e30eb');
    expect(cssVars.secondary).toBe('#ed719e');
    expect(cssVars.muted).toBe('#1f1f1f');
    expect(cssVars.border).toBe('#404040');
    expect(cssVars.card).toBe('oklch(0.278 0.033 256.848)');

    await context.close();
  });

  test('should apply body styles correctly', async ({ page }) => {
    await page.goto('/');

    const bodyStyles = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    // Body should use the CSS variables
    expect(bodyStyles.backgroundColor).toBe('oklch(0.929 0.013 255.508)');
    expect(bodyStyles.color).toBe('rgb(51, 51, 51)'); // #333333
  });
});
