import { test, expect } from '@playwright/test';

test.describe('PulseBoard dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('opens the dashboard with widgets', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /guest/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /personalized news/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /trending movies/i })).toBeVisible();
  });

  test('search navigates to results page', async ({ page }) => {
    await page.getByRole('searchbox', { name: /global search/i }).fill('Interstellar');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/search\?q=Interstellar/);
    await expect(page.getByRole('heading', { name: /results for/i })).toBeVisible();
  });

  test('movie details open from card', async ({ page }) => {
    await page.goto('/movies');
    const details = page.getByRole('link', { name: /view details/i }).first();
    await expect(details).toBeVisible({ timeout: 15000 });
    await details.scrollIntoViewIfNeeded();
    await details.click();
    await expect(page).toHaveURL(/\/movie\//, { timeout: 15000 });
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
  });

  test('favorites persist across reload', async ({ page }) => {
    await page.goto('/news');
    const fav = page.getByRole('button', { name: /save .* to favorites/i }).first();
    await expect(fav).toBeVisible();
    await fav.click();
    await page.goto('/favorites');
    await expect(page.getByText(/saved item|saved stories/i).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(/saved item/i).first()).toBeVisible();
  });

  test('preferences affect the feed and persist', async ({ page }) => {
    await page.goto('/settings');
    const sports = page.getByRole('button', { name: /sports/i }).first();
    await sports.click();
    await page.getByRole('button', { name: /save preferences/i }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: /sports/i }).first()).toHaveAttribute('aria-pressed', 'true');
  });

  test('theme switching persists', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /switch to light mode|switch to dark mode/i });
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('widget drag handles are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    const handles = page.getByRole('button', { name: /drag to reorder/i });
    await expect(handles.first()).toBeVisible();
    await handles.first().focus();
    await expect(handles.first()).toBeFocused();
  });
});
