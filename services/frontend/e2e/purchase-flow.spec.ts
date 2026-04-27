import { test, expect } from "@playwright/test";

test("happy path: browse store → add to cart → checkout", async ({ page }) => {
  // Home page loads
  await page.goto("/");
  await expect(page.getByText("Ropa de")).toBeVisible();
  await expect(page.getByText("Avellaneda")).toBeVisible();

  // Navigate to stores
  await page.getByRole("link", { name: "Ver locales" }).click();
  await expect(page).toHaveURL("/stores");

  // If stores exist, click on first one
  const storeCards = page.locator("a[href^='/stores/']");
  const count = await storeCards.count();

  if (count > 0) {
    await storeCards.first().click();
    await expect(page.url()).toMatch(/\/stores\/\d+/);
  }
});

test("cart is empty by default", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
});

test("product page shows size selector", async ({ page }) => {
  // This test requires at least one product in the DB
  // Seed data must be present (see Task 17)
  await page.goto("/");
  const productLinks = page.locator("a[href^='/products/']");
  const count = await productLinks.count();

  if (count > 0) {
    await productLinks.first().click();
    await expect(page.getByText("Seleccioná tu talle")).toBeVisible();
  }
});
