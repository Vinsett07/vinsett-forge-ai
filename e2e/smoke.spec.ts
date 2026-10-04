import { test, expect } from "@playwright/test";

test("landing page exposes the Forge value proposition and auth CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Da ideia ao projeto executável");
  await expect(page.getByRole("link", { name: "Entrar no Forge" })).toBeVisible();
});

test("authentication surface switches to account creation", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar conta" }).last()).toBeVisible();
});
