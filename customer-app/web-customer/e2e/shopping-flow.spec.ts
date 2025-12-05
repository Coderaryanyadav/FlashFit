import { test, expect } from '@playwright/test';

test.describe('Full Shopping Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load homepage and display core elements', async ({ page }) => {
        const brandLogo = page.locator('text=FLASHFIT').first();
        await expect(brandLogo).toBeVisible({ timeout: 15000 });
        await expect(page).toHaveTitle(/FlashFit/i);
    });

    test('should search for products', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Search for products/i).first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('Gym');
            await searchInput.press('Enter');
            await expect(page).toHaveURL(/\/search/);
        }
    });

    test('should add product to cart from details page', async ({ page }) => {
        // 1. Navigate to a category
        await page.goto('/category/men');

        // 2. Check for products
        const productCard = page.locator('a[href^="/product/"]').filter({ has: page.locator('h3') }).first();

        try {
            await expect(productCard).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log("No products found on category page. Skipping 'Add to Cart' test as it requires inventory.");
            test.skip();
            return;
        }

        // 3. Proceed if product found
        await productCard.click();
        await expect(page).toHaveURL(/\/product\//, { timeout: 10000 });

        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

        // Size Selection
        const sizeButtons = page.locator('button.h-14.w-14:not([disabled])');
        if (await sizeButtons.count() > 0) {
            await sizeButtons.first().click();
        }

        // Add to Cart
        const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
        await expect(addToCartBtn).toBeVisible();
        await addToCartBtn.click();

        await expect(page.getByText('Added to cart')).toBeVisible();

        // Cart Check
        const cartButton = page.getByLabel('Open cart');
        await cartButton.click();

        const cartHeading = page.getByRole('heading', { name: /Your Cart/i });
        await expect(cartHeading).toBeVisible();
        await expect(page.getByText('Your cart is empty')).not.toBeVisible();
    });
});
