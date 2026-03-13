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

    // Gate the snapshot: wait until course card links have rendered or the
    // empty-state message is present. The dashboard loads course data from the
    // collection asynchronously, so firing cy.get("body").then() too early
    // returns an empty DOM and falls into the wrong branch.
    cy.waitForContent('a[href*="/courses/"]', "No courses available yet");

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
