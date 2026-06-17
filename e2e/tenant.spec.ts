import { test, expect } from "@playwright/test";

// Tenant view is scoped to tenant-1 (Alice Johnson / lease-1).

test.describe("Tenant dashboard", () => {
  test("loads with the personalised welcome heading", async ({ page }) => {
    await page.goto("/tenant");

    await expect(
      page.getByRole("heading", { name: "Welcome back, Alice Johnson" }),
    ).toBeVisible();
  });

  test("shows the three info cards", async ({ page }) => {
    await page.goto("/tenant");

    await expect(page.getByText("Property Details")).toBeVisible();
    await expect(page.getByText("Property Manager")).toBeVisible();
    await expect(page.getByText("Lease Details")).toBeVisible();
  });

  test("shows the Payment History section", async ({ page }) => {
    await page.goto("/tenant");

    await expect(page.getByText(/Payment History/)).toBeVisible();
  });

  test("shows an error state when ?fail=true is set", async ({ page }) => {
    await page.goto("/tenant?fail=true");

    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});

test.describe("Pay Rent modal", () => {
  test("Pay Rent button opens the modal for the selected period", async ({ page }) => {
    await page.goto("/tenant");

    const payBtn = page.getByRole("button", { name: "Pay Rent" }).first();
    await expect(payBtn).toBeVisible();
    await payBtn.click();

    // Modal title includes "Pay Rent -"
    await expect(page.getByText(/Pay Rent -/)).toBeVisible();
  });

  test("modal shows the Payment Method selector", async ({ page }) => {
    await page.goto("/tenant");

    await page.getByRole("button", { name: "Pay Rent" }).first().click();

    await expect(page.getByText("Payment Method")).toBeVisible();
  });

  test("Pay Now button is disabled until a payment method is selected", async ({ page }) => {
    await page.goto("/tenant");

    await page.getByRole("button", { name: "Pay Rent" }).first().click();

    const payNowBtn = page.getByRole("button", { name: "Pay Now" });
    await expect(payNowBtn).toBeDisabled();
  });

  test("Cancel closes the modal", async ({ page }) => {
    await page.goto("/tenant");

    await page.getByRole("button", { name: "Pay Rent" }).first().click();
    await expect(page.getByText(/Pay Rent -/)).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText(/Pay Rent -/)).not.toBeVisible();
  });

  test("paying with a saved method shows a success toast", async ({ page }) => {
    await page.goto("/tenant");

    await page.getByRole("button", { name: "Pay Rent" }).first().click();

    // Select the first available saved method (radio / button)
    const methodOption = page.getByRole("radio").first();
    if (await methodOption.isVisible()) {
      await methodOption.click();
    } else {
      // Methods may render as clickable rows - click the first one
      await page.locator("[data-testid='payment-method']").first().click();
    }

    const payNowBtn = page.getByRole("button", { name: "Pay Now" });
    await expect(payNowBtn).toBeEnabled();
    await payNowBtn.click();

    await expect(page.getByText("Rent paid successfully.")).toBeVisible();
  });

  test("adding a new payment method appends it to the list", async ({ page }) => {
    await page.goto("/tenant");

    await page.getByRole("button", { name: "Pay Rent" }).first().click();

    const input = page.getByPlaceholder("e.g. Chase ••••4242");
    await input.fill("Test Card 9999");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText("Test Card 9999")).toBeVisible();
  });
});
