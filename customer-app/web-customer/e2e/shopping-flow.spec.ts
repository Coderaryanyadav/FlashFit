import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
    test('should complete full checkout flow', async ({ page }) => {
        // Navigate to home
        await page.goto('/');

        // Browse products
        await expect(page.locator('h1')).toContainText('FlashFit');

        // Add to cart
        const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
        await addToCartButton.click();

        // Go to cart
        await page.click('[aria-label="Cart"]');
        await expect(page).toHaveURL(/.*cart/);

        // Verify item in cart
        await expect(page.locator('.cart-item')).toBeVisible();

        // Proceed to checkout
        await page.click('button:has-text("Checkout")');
        await expect(page).toHaveURL(/.*checkout/);
    });

    test('should search and filter products', async ({ page }) => {
        await page.goto('/');

        // Search
        await page.fill('input[placeholder*="Search"]', 'shirt');
        await page.press('input[placeholder*="Search"]', 'Enter');

        // Filter by category
        await page.click('text=Fashion');

        // Verify results
        await expect(page.locator('.product-card')).toHaveCount(1, { timeout: 5000 });
    });
});

test.describe('User Authentication', () => {
    test('should login and update profile', async ({ page }) => {
        await page.goto('/login');

        // Login
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Login")');

        // Navigate to profile
        await page.click('[aria-label="Profile"]');
        await expect(page).toHaveURL(/.*profile/);

        // Update profile
        await page.fill('input[name="name"]', 'Test User');
        await page.click('button:has-text("Save")');

        // Verify success
        await expect(page.locator('text=Profile updated')).toBeVisible();
    });
});
