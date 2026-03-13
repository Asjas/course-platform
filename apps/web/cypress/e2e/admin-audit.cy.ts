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

    cy.waitForContent('th:contains("Timestamp")', "No audit logs yet", {
      timeout: 15000,
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

    cy.assertAccessDenied();
  });
});
