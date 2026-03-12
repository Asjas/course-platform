describe("Admin Chat Reports Page", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display the chat reports page heading", () => {
    cy.visit("/admin/chat-reports");
    cy.contains("h1", "Chat Reports").should("be.visible");
  });

  it("should show either a reports table or empty state", () => {
    cy.visit("/admin/chat-reports");

    cy.get("body", { timeout: 15000 }).should(($body) => {
      const text = $body.text();
      expect(
        text.includes("No chat reports") ||
          text.includes("Reporter") ||
          text.includes("Reason"),
      ).to.equal(true);
    });
  });

  it("should display table column headers when reports exist", () => {
    cy.visit("/admin/chat-reports");

    cy.get("body").then(($body) => {
      if ($body.find("tbody tr").length > 0) {
        cy.contains("th", "Reporter").should("be.visible");
        cy.contains("th", "Reason").should("be.visible");
        cy.contains("th", "Status").should("be.visible");
        cy.contains("th", "Reported At").should("be.visible");
      }

      return null;
    });
  });
});

describe("Admin Chat Reports Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from chat reports page", () => {
    cy.visit("/admin/chat-reports");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
