import { faker } from "@faker-js/faker";

describe("Admin Coupons Management", () => {
  let couponCode: string;
  let couponDescription: string;

  beforeEach(() => {
    cy.loginAsAdmin();
    couponCode = faker.string.alphanumeric(8).toUpperCase();
    couponDescription = faker.lorem.sentence();
  });

  it("should display coupons page", () => {
    cy.visit("/admin/coupons");

    cy.contains("h1", "Coupons").should("be.visible");
    cy.contains("button", "Create New Coupon").should("be.visible");
  });

  it("should open create coupon sheet", () => {
    cy.visit("/admin/coupons");

    cy.contains("button", "Create New Coupon").click();
    cy.contains("Create Coupon").should("be.visible");
    cy.get('input[name="code"]').should("be.visible");
    cy.get('select[name="discountType"]').should("be.visible");
    cy.get('input[name="discountValue"]').should("be.visible");
  });

  it("should create a new coupon with percentage discount", () => {
    cy.visit("/admin/coupons");

    cy.contains("button", "Create New Coupon").click();

    cy.get('input[name="code"]').type(couponCode);
    cy.get('input[name="description"]').type(couponDescription);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("25");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("100");

    cy.contains("button", "Create").click();

    cy.contains(/created successfully/i).should("be.visible");
    cy.contains(couponCode).should("be.visible");
  });

  it("should display coupon details in table", () => {
    cy.visit("/admin/coupons");

    // Create a coupon first
    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("15");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("50");
    cy.contains("button", "Create").click();

    // Verify table displays coupon
    cy.contains("tr", couponCode).within(() => {
      cy.contains("15 %").should("be.visible");
      cy.contains("0 / 50").should("be.visible");
      cy.contains("Active").should("be.visible");
    });
  });

  it("should copy coupon code to clipboard", () => {
    cy.visit("/admin/coupons");

    // Create a coupon
    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("10");
    cy.contains("button", "Create").click();

    // Click copy button
    cy.contains("tr", couponCode).within(() => {
      cy.get('button[aria-label*="Copy"]').first().click();
    });

    cy.contains(/copied/i).should("be.visible");
  });

  it("should edit an existing coupon", () => {
    cy.visit("/admin/coupons");

    // Create a coupon
    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("20");
    cy.contains("button", "Create").click();

    // Edit the coupon
    cy.contains("tr", couponCode).within(() => {
      cy.get('button[aria-label*="Edit"]').click();
    });

    cy.contains("Edit Coupon").should("be.visible");
    cy.get('input[name="discountValue"]').clear();
    cy.get('input[name="discountValue"]').type("30");
    cy.contains("button", "Save").click();

    cy.contains(/updated successfully/i).should("be.visible");
    cy.contains("tr", couponCode).within(() => {
      cy.contains("30 %").should("be.visible");
    });
  });

  it("should delete a coupon", () => {
    cy.visit("/admin/coupons");

    // Create a coupon
    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("5");
    cy.contains("button", "Create").click();

    // Delete the coupon
    cy.contains("tr", couponCode).within(() => {
      cy.get('button[aria-label*="Delete"]').click();
    });

    // Confirm deletion
    cy.contains("button", "Delete").last().click();

    cy.contains(/deleted successfully/i).should("be.visible");
    cy.contains(couponCode).should("not.exist");
  });

  it("should validate required fields", () => {
    cy.visit("/admin/coupons");

    cy.contains("button", "Create New Coupon").click();

    // Try to submit without filling required fields
    cy.contains("button", "Create").click();

    // Form should show validation errors
    cy.contains("Create Coupon").should("be.visible");
  });

  it("should create fixed amount discount coupon", () => {
    cy.visit("/admin/coupons");

    cy.contains("button", "Create New Coupon").click();

    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("fixed");
    cy.get('input[name="discountValue"]').type("50");
    cy.contains("button", "Create").click();

    cy.contains(/created successfully/i).should("be.visible");
    cy.contains("tr", couponCode).within(() => {
      cy.contains("Fixed Amount").should("be.visible");
      cy.contains("$ 50.00").should("be.visible");
    });
  });
});

describe("Admin Coupons Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from coupons page", () => {
    cy.visit("/admin/coupons");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
