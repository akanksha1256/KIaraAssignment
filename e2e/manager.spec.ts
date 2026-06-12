import { test, expect } from "@playwright/test";

// The manager view hard-codes prop-1 / unit-1 / lease-1 (Alice Johnson) in the seed DB.

test.describe("Manager dashboard", () => {
  test("loads with the portfolio heading and at least one property", async ({ page }) => {
    await page.goto("/manager");

    await expect(page.getByRole("heading", { name: "Manager Dashboard" })).toBeVisible();
    await expect(page.getByText("Maple Heights")).toBeVisible();
  });

  test("shows portfolio stat cards", async ({ page }) => {
    await page.goto("/manager");

    // StatCards are identified by their labels
    await expect(page.getByText("Total Properties")).toBeVisible();
    await expect(page.getByText("Monthly Rent")).toBeVisible();
  });

  test("shows an error state when ?fail=true is set", async ({ page }) => {
    await page.goto("/manager?fail=true");

    // ErrorState renders a Retry button
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});

test.describe("Property detail", () => {
  test("navigates from the dashboard to a property and shows its units", async ({ page }) => {
    await page.goto("/manager");

    await page.getByText("Maple Heights").click();

    await expect(page).toHaveURL(/\/manager\/properties\/prop-1/);
    await expect(page.getByText("Apt 101")).toBeVisible();
  });

  test("shows the Units section heading", async ({ page }) => {
    await page.goto("/manager/properties/prop-1");

    await expect(page.getByText(/Units/)).toBeVisible();
  });
});

test.describe("Unit detail — payment actions", () => {
  test("loads the unit detail page with tenant and payment history", async ({ page }) => {
    await page.goto("/manager/properties/prop-1/units/unit-1");

    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText(/Payment History/)).toBeVisible();
  });

  test("clicking Mark as Paid shows a success toast", async ({ page }) => {
    await page.goto("/manager/properties/prop-1/units/unit-1");

    // Find the first Mark as Paid button (there may be multiple outstanding rows)
    const markPaidBtn = page.getByRole("button", { name: "Mark as Paid" }).first();
    await expect(markPaidBtn).toBeVisible();

    await markPaidBtn.click();

    await expect(page.getByText("Payment marked as paid successfully.")).toBeVisible();
  });

  test("Mark as Paid is disabled while the request is in flight", async ({ page }) => {
    await page.goto("/manager/properties/prop-1/units/unit-1");

    const markPaidBtn = page.getByRole("button", { name: "Mark as Paid" }).first();
    await markPaidBtn.click();

    // During the 800ms server delay the button should be disabled / show a spinner
    // (the row disables based on processingPeriodMonth)
    await expect(markPaidBtn).toBeDisabled();
  });

  test("shows an error toast when Mark as Paid fails (?fail=true)", async ({ page }) => {
    await page.goto("/manager/properties/prop-1/units/unit-1?fail=true");

    // Error state is shown — no action buttons visible
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  test("Send Reminder button is present for outstanding/overdue rows", async ({ page }) => {
    await page.goto("/manager/properties/prop-1/units/unit-1");

    // RowMenu "⋯" button opens the dropdown with Send Reminder
    const rowMenu = page.getByRole("button", { name: "⋯" }).first();
    await expect(rowMenu).toBeVisible();
    await rowMenu.click();

    await expect(page.getByText("Send Reminder")).toBeVisible();
  });
});

test.describe("Tenant profile (manager view)", () => {
  test("loads tenant info and payment standing", async ({ page }) => {
    await page.goto("/manager/tenants/tenant-1");

    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Payment Standing")).toBeVisible();
  });
});
