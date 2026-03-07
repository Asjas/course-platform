describe("Admin Stats Dashboard", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display stats dashboard page", () => {
    cy.visit("/admin/stats");

    // Verify page loads
    cy.contains("Stats").should("be.visible");
  });

  it("should display platform overview section", () => {
    cy.visit("/admin/stats");

    // Verify platform overview section exists
    cy.contains("Platform Overview").should("be.visible");
  });

  it("should display revenue statistics section", () => {
    cy.visit("/admin/stats");

    // Verify revenue stats section exists
    cy.contains("Revenue").should("be.visible");
  });

  it("should display user statistics section", () => {
    cy.visit("/admin/stats");

    // Verify user stats section exists
    cy.contains("Users").should("be.visible");
  });
});

describe("Admin Stats Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin stats page", () => {
    cy.visit("/admin/stats");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
