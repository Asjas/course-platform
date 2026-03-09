describe("Admin Audit Page", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows the audit page heading and tab controls", () => {
    cy.visit("/admin/audit");

    cy.contains("h1", "Audit Logs").should("be.visible");
    cy.contains("GDPR Data Exports").should("be.visible");
    cy.contains("Security Events (Coming Soon)")
      .should("be.visible")
      .and("be.disabled");
  });

  it("shows either empty state or GDPR logs table", () => {
    cy.visit("/admin/audit");

    cy.get("body", { timeout: 15000 }).should(($body) => {
      const text = $body.text();
      expect(
        text.includes("No audit logs yet") || text.includes("Timestamp"),
      ).to.equal(true);
    });

    cy.get("body").then(($body) => {
      if ($body.text().includes("No audit logs yet")) {
        cy.contains("No audit logs yet").should("be.visible");
        return;
      }

      cy.contains("th", "Timestamp").should("be.visible");
      cy.contains("th", "User").should("be.visible");
      cy.contains("th", "Action").should("be.visible");
      cy.contains("th", "Status").should("be.visible");
      return;
    });
  });
});

describe("Admin Audit Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("blocks non-admin users from admin audit page", () => {
    cy.visit("/admin/audit");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
