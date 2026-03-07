import { faker } from "@faker-js/faker";

describe("Admin Course Editor", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display course editor page", () => {
    cy.visit("/admin/courses");

    // Verify courses page loads
    cy.contains("Courses").should("be.visible");
  });

  it("should open edit page from courses table when a course exists", () => {
    cy.visit("/admin/courses");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No courses found")) {
        return cy.contains("No courses found").should("be.visible");
      }

      return cy
        .get('a[href*="/admin/courses/"][href$="/edit"]')
        .first()
        .then(($editLink) => {
          cy.wrap($editLink).click();
          cy.url().should("include", "/admin/courses/");
          cy.url().should("include", "/edit");
          cy.contains("Edit course structure, modules, and lessons").should(
            "be.visible",
          );
          cy.contains("No selection").should("be.visible");
          return cy.wrap(null);
        });
    });
  });

  it("should show not found state for unknown course id", () => {
    const missingCourseId = `missing-${faker.string.alphanumeric(12)}`;

    cy.visit(`/admin/courses/${missingCourseId}/edit`, {
      failOnStatusCode: false,
    });

    cy.contains("Course not found").should("be.visible");
    cy.contains("Back to Courses").should("be.visible");
  });
});
