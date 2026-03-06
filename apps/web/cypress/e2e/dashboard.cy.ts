describe("Dashboard Page", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should display the dashboard with my courses heading", () => {
    cy.visit("/dashboard");
    cy.get("h1").contains("My Courses").should("be.visible");
    cy.contains("Continue learning where you left off").should("be.visible");
  });

  it("should show empty state or course cards", () => {
    cy.visit("/dashboard");
    cy.get("h1").contains("My Courses").should("be.visible");

    // Should either show course cards or an empty state
    cy.get("body").then(($body) => {
      if ($body.find(':contains("No courses available yet")').length > 0) {
        cy.contains("No courses available yet").should("be.visible");
        cy.contains("Courses will appear here once you enroll").should(
          "be.visible",
        );
      } else {
        // If courses exist, they should be in a grid
        cy.get('[class*="grid"]').should("exist");
      }
      return undefined;
    });
  });
});

describe("Dashboard Navigation", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
    cy.visit("/dashboard");
  });

  it("should have navigation links accessible from dashboard", () => {
    // The main nav should be visible
    cy.get("nav").should("exist");
  });
});
