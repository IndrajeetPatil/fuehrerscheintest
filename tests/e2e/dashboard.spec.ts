import { expect, test } from "@playwright/test";

import { expectAccessible, openDashboard } from "./helpers.ts";

test("opens straight on the dashboard on first launch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Führerscheintest" }),
  ).toBeVisible();
  await expect(
    page.getByText("Set your exam date in Einstellungen · Settings below."),
  ).toBeVisible();
  await expectAccessible(page);
});

test("shows start cards, progress and settings", async ({ page }) => {
  await openDashboard(page);
  await expect(
    page.getByRole("heading", { name: "Fortschritt · Progress" }),
  ).toBeVisible();
  await expect(page.getByText("days to go")).toBeVisible();
  await expectAccessible(page);
});

test("searches the catalogue in German or English", async ({ page }) => {
  await openDashboard(page);
  await page.getByRole("link", { name: "Fragenkatalog", exact: true }).click();
  await page.getByLabel("Search questions").fill("zebra crossing");
  await expect(page.getByText("1 shown")).toBeVisible();
  await expect(
    page.getByText("Sie nähern sich einem Fußgängerüberweg (Zebrastreifen)."),
  ).toBeVisible();
  await expectAccessible(page);
});

test("finds a catalogue question by the id a backup uses", async ({ page }) => {
  await openDashboard(page);
  await page.getByRole("link", { name: "Fragenkatalog · catalogue" }).click();
  await page.getByLabel("Search questions").fill("g055");
  await expect(page.getByText("1 shown")).toBeVisible();
  await expect(page.getByText("ID G055", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Verkehrszeichen 201" }),
  ).toBeVisible();
  await expectAccessible(page);
});

test("explains where progress is kept", async ({ page }) => {
  await openDashboard(page);
  await page
    .getByRole("link", { name: "Datenschutz · Privacy" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Datenschutz · Privacy" }),
  ).toBeVisible();
  await expect(page.getByText(/never uploaded/u)).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/IndrajeetPatil/fuehrerscheintest/issues",
  );
  await expectAccessible(page);
});

test("follows the system theme until dark mode is toggled", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await openDashboard(page);
  const html = page.locator("html");
  const toggle = page.getByRole("button", {
    name: "Dunkler Modus · Dark mode",
  });
  await expect(html).toHaveClass("dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(html).not.toHaveClass("dark");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(html).not.toHaveClass("dark");
  await toggle.click();
  await expect(html).toHaveClass("dark");
  // Back at the system theme, nothing is pinned: it follows the system again.
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html).not.toHaveClass("dark");
  await expectAccessible(page);
});

test("exports, resets and imports a backup", async ({ page }) => {
  await openDashboard(page);
  await page.getByRole("button", { name: "Start mock exam" }).click();
  await page.getByRole("button", { name: "Abgeben · Submit" }).first().click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Abgeben · Submit" })
    .click();
  await page.getByRole("link", { name: "Übersicht", exact: true }).click();
  const history = page.getByRole("heading", {
    name: "Verlauf · Session history",
  });
  await expect(history).toBeVisible();
  await expectAccessible(page);

  const saving = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportieren · Export backup" })
    .click();
  const download = await saving;
  const backup = await download.path();
  await expect(page.getByText("Exported 1 sessions.")).toBeVisible();

  await page
    .getByRole("button", { name: "Zurücksetzen · Reset progress" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Löschen · Delete" })
    .click();
  await expect(history).toBeHidden();

  await page.getByLabel("Backup file").setInputFiles(backup);
  await expect(history).toBeVisible();
  await page.reload();
  await expect(history).toBeVisible();
});
