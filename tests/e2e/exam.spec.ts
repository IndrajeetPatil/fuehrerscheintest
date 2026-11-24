import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { expectAccessible, openDashboard } from "./helpers.ts";

const QUESTIONS = 30;

/**
 * Answers every mock-exam question by key, cycling through the options.
 * @param page - A page showing the first question.
 * @param flagged - The index of a question to flag on the way, if any.
 */
async function answerEveryQuestion(
  page: Page,
  flagged?: number,
): Promise<void> {
  for (let index = 0; index < QUESTIONS; index += 1) {
    // Every question has at least three options.
    await page.keyboard.press(String((index % 3) + 1));
    if (index === flagged) {
      await page.keyboard.press("f");
    }
    await page.keyboard.press("ArrowRight");
  }
}

test("runs a mock exam from start to result", async ({ page }) => {
  await openDashboard(page);
  await page.getByRole("button", { name: "Start mock exam" }).click();
  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.getByText("Frage 1 von 30")).toBeVisible();
  await expectAccessible(page);

  await answerEveryQuestion(page, 2);

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("30 of 30 questions answered, 1 flagged");
  await expectAccessible(page);
  await dialog.getByRole("button", { name: "Abgeben · Submit" }).click();

  await expect(
    page.getByRole("heading", { name: "Ergebnis · Result" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Bestanden · Passed|Nicht bestanden · Not passed/u),
  ).toBeVisible();
  await expectAccessible(page);

  await page.getByRole("link", { name: "Übersicht", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Verlauf · Session history" }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Mock exam" }).first(),
  ).toBeVisible();
});

test("shows wrong answers in English with the English column hidden", async ({
  page,
}) => {
  await openDashboard(page, { showEnglish: false });
  await page.getByRole("button", { name: "Start mock exam" }).click();
  await expect(page.getByText("Frage 1 von 30")).toBeVisible();
  await answerEveryQuestion(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Abgeben · Submit" })
    .click();

  for (const caption of [
    /^Richtige Antworten? · Correct answers?$/u,
    "Ihre Auswahl · Your selection",
  ]) {
    const group = page.getByText(caption).first().locator("..");
    await expect(group.locator('[lang="en"]').first()).toBeVisible();
  }
  await expect(page.getByText("English", { exact: true })).toHaveCount(0);
});
