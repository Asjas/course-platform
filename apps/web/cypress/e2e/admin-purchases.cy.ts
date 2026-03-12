describe("Admin Purchases Page", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display the purchases page heading", () => {
    cy.visit("/admin/purchases");
    cy.contains("h1", "Purchases").should("be.visible");
  });

  it("should display tab controls for filtering purchases", () => {
    cy.visit("/admin/purchases");
    cy.contains("button", "All").should("be.visible");
    cy.contains("button", "Paid").should("be.visible");
    cy.contains("button", "Refunded").should("be.visible");
  });

  it("should show either a purchases table or empty state", () => {
    cy.visit("/admin/purchases");

    cy.get("body", { timeout: 15000 }).should(($body) => {
      const text = $body.text();
      expect(
        text.includes("No purchases found") ||
          text.includes("Amount") ||
          text.includes("Customer"),
      ).to.equal(true);
    });
  });

  it("should display table column headers when purchases exist", () => {
    cy.visit("/admin/purchases");

    cy.get("body").then(($body) => {
      if ($body.find("tbody tr").length > 0) {
        cy.contains("th", "Customer").should("be.visible");
        cy.contains("th", "Amount").should("be.visible");
        cy.contains("th", "Status").should("be.visible");
      }

      return null;
    });
  });

  it("should switch between tab views", () => {
    cy.visit("/admin/purchases");

    cy.contains("button", "Paid").click();
    cy.contains("button", "Paid").should("have.attr", "data-state", "active");

    cy.contains("button", "All").click();
    cy.contains("button", "All").should("have.attr", "data-state", "active");
  });
});

describe("Admin Purchases Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin purchases page", () => {
    cy.visit("/admin/purchases");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
