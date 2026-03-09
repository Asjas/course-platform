import { faker } from "@faker-js/faker";

function visitCouponsPage() {
  cy.visit("/admin/coupons");
}

function assertSaveChangesButtonReady() {
  cy.contains("button", "Save Changes")
    .should("be.visible")
    .should("not.be.disabled")
    .should(($button) => {
      expect(Cypress.dom.isAttached($button)).to.equal(true);
      expect($button.attr("type")).to.equal("submit");
    });
}

describe("Admin Coupons Management", () => {
  let couponCode: string;
  let couponDescription: string;

  function waitForCouponRow(code: string) {
    cy.get("tbody tr", { timeout: 20000 }).should("exist");
    cy.contains("tbody tr code", code, { timeout: 20000 }).should("be.visible");
  }

  function waitForSheetClose() {
    cy.get('[role="dialog"]').should("not.exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting -- allow overlay exit transition to finish
    cy.wait(500);
  }

  beforeEach(() => {
    cy.loginAsAdmin();
    couponCode = faker.string.alphanumeric(8).toUpperCase();
    couponDescription = faker.lorem.sentence();
  });

  it("should display coupons page", () => {
    visitCouponsPage();

    cy.contains("h1", "Coupons").should("be.visible");
    cy.contains("button", "Create New Coupon").should("be.visible");
  });

  it("should open create coupon sheet", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.contains("Create Coupon").should("be.visible");
    cy.get('input[name="code"]').should("be.visible");
    cy.get('select[name="discountType"]').should("be.visible");
    cy.get('input[name="discountValue"]').should("be.visible");
  });

  it("should create a new coupon with percentage discount", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('input[name="description"]').type(couponDescription);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("25");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("100");
    cy.contains("button", "Create Coupon").click();

    cy.contains(/created successfully/i).should("be.visible");
    waitForSheetClose();
    waitForCouponRow(couponCode);
  });

  it("should display coupon details in table", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("15");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("50");
    cy.contains("button", "Create Coupon").click();

    waitForCouponRow(couponCode);
    cy.contains("tr", couponCode).within(() => {
      cy.contains("15 %").should("be.visible");
      cy.contains("0 / 50").should("be.visible");
      cy.contains("Active").should("be.visible");
    });
  });

  it("should attempt to copy coupon code and show user feedback", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("10");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("25");
    cy.contains("button", "Create Coupon").click();

    waitForCouponRow(couponCode);
    cy.contains("tr", couponCode).within(() => {
      cy.contains("button", `Copy coupon code ${couponCode}`).click();
    });

    // Clipboard permissions vary in CI/headless. Assert that user gets feedback either way.
    cy.contains(/copied coupon code|failed to copy coupon code/i).should(
      "be.visible",
    );
  });

  it("should edit an existing coupon", () => {
    visitCouponsPage();
    const updatedCouponCode = `${couponCode}ED`;

    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("20");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("30");
    cy.contains("button", "Create Coupon").click();
    waitForSheetClose();

    waitForCouponRow(couponCode);
    cy.contains("tr", couponCode).within(() => {
      cy.contains("button", `Edit coupon ${couponCode}`).click();
    });

    cy.contains("Edit Coupon").should("be.visible");

    // Wait for the form useEffect to populate inputs with coupon data
    cy.get('input[name="code"]').should("have.value", couponCode);

    // Edit text field to verify end-to-end update flow without flaky number input interactions
    cy.get('input[name="code"]').clear();
    cy.get('input[name="code"]').type(updatedCouponCode);
    cy.get('input[name="code"]').should("have.value", updatedCouponCode);

    assertSaveChangesButtonReady();

    cy.contains("button", "Save Changes").click();

    waitForSheetClose();
    waitForCouponRow(updatedCouponCode);
    cy.contains("tr", updatedCouponCode).within(() => {
      cy.contains("20 %", { timeout: 10000 }).should("be.visible");
      cy.contains("0 / 30", { timeout: 10000 }).should("be.visible");
    });
  });

  it("should delete a coupon", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("percentage");
    cy.get('input[name="discountValue"]').type("5");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("10");
    cy.contains("button", "Create Coupon").click();
    waitForSheetClose();

    waitForCouponRow(couponCode);
    cy.contains("tr", couponCode).within(() => {
      cy.contains("button", `Delete coupon ${couponCode}`).click();
    });

    cy.contains("Delete Coupon").should("be.visible");
    cy.contains('[role="dialog"] button', "Delete")
      .should("be.visible")
      .should("not.be.disabled")
      .click();

    // Increase timeout to allow for toast rendering and collection update settling
    cy.contains(/deleted successfully/i, { timeout: 10000 }).should(
      "be.visible",
    );
    // Verify coupon row is removed from table with a generous timeout to allow
    // the collection-backed UI to settle after the deletion is persisted
    cy.contains("tr", couponCode, { timeout: 15000 }).should("not.exist");
  });

  it("should validate required fields", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.contains("button", "Create Coupon").should("be.disabled");
    cy.contains("Create Coupon").should("be.visible");
  });

  it("should create fixed amount discount coupon", () => {
    visitCouponsPage();

    cy.contains("button", "Create New Coupon").click();
    cy.get('input[name="code"]').type(couponCode);
    cy.get('select[name="discountType"]').select("fixed");
    cy.get('input[name="discountValue"]').type("50");
    cy.get('input[name="redemptionLimit"]').clear();
    cy.get('input[name="redemptionLimit"]').type("40");
    cy.contains("button", "Create Coupon").click();

    cy.contains(/created successfully/i).should("be.visible");
    waitForCouponRow(couponCode);
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
    visitCouponsPage();

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
