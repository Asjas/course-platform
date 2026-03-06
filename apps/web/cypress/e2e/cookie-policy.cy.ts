describe("Cookie Policy Page", () => {
  beforeEach(() => {
    cy.visit("/cookies");
  });

  it("should display the cookie policy page with heading", () => {
    cy.get("h1").contains("Cookie Policy").should("be.visible");
  });

  it("should display the effective date", () => {
    cy.contains("Effective Date: November 8, 2025").should("be.visible");
  });

  it("should contain links to privacy policy and terms of service", () => {
    cy.get('a[href="/privacy"]')
      .contains("Privacy Policy")
      .should("be.visible");
    cy.get('a[href="/terms"]')
      .contains("Terms of Service")
      .should("be.visible");
  });

  it("should display version history table", () => {
    cy.contains("h2", "Policy Version History").should("be.visible");
    cy.get("table").should("be.visible");
    cy.contains("th", "Version").should("be.visible");
    cy.contains("th", "Effective Date").should("be.visible");
    cy.contains("th", "Summary of Changes").should("be.visible");
    cy.contains("td", "1.0").should("be.visible");
  });

  it("should display the cookie categories section", () => {
    cy.contains("h2", "Cookie Categories").should("be.visible");

    // Should list all cookie categories
    cy.contains("td", "Essential").should("be.visible");
    cy.contains("td", "Analytics").should("be.visible");
    cy.contains("td", "Tracking/Ads").should("be.visible");

    // Tracking/Ads should be listed as "None used"
    cy.contains("td", "None used").should("be.visible");
  });

  it("should display the about cookies section", () => {
    cy.contains("h2", "About Cookies").should("be.visible");
    cy.contains("No third-party tracking or advertising cookies").should(
      "be.visible",
    );
  });

  it("should display how to manage cookies section", () => {
    cy.contains("h2", "How to Manage Cookies").should("be.visible");
    cy.contains("Cookie Banner").should("be.visible");
    cy.contains("Browser Controls").should("be.visible");
  });
});
