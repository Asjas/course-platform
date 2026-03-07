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
        cy.contains("No courses found").should("be.visible");
        return null;
      }

      const editLink = $body
        .find('a[href*="/admin/courses/"][href$="/edit"]')
        .first();

      expect(editLink.length).to.be.greaterThan(0);
      cy.wrap(editLink).click();
      cy.url().should("include", "/admin/courses/");
      cy.url().should("include", "/edit");
      cy.contains("Edit course structure, modules, and lessons").should(
        "be.visible",
      );
      cy.contains("No selection").should("be.visible");

      return null;
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

describe("Admin Course Editor Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin course editor routes", () => {
    cy.visit("/admin/courses");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
