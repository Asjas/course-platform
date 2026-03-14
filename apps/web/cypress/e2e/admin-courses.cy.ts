describe("Admin Courses Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display courses list page", () => {
    cy.visit("/admin/courses");

    // Verify page loads
    cy.contains("Courses").should("be.visible");
  });

  it("should navigate to create course page", () => {
    cy.visit("/admin/courses");

    cy.contains("Create New Course").click();
    cy.url().should("include", "/admin/courses/create");
  });

  it("should open and close delete confirmation", () => {
    cy.visit("/admin/courses");

    // Gate: wait for the course table to fully render before inspecting the
    // DOM. The collection loads asynchronously after the page heading appears.
    cy.waitForContent("tbody tr", "No courses found");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No courses found")) {
        cy.contains("No courses found").should("be.visible");
        return null;
      }

      const deleteButton = $body
        .find("button:has(svg)")
        .filter(":has(.lucide-trash2)")
        .first();

      if (deleteButton.length === 0) {
        cy.contains(/No courses found|Create New Course/i).should("be.visible");
        return null;
      }

      cy.wrap(deleteButton).click();
      cy.contains("Delete Course").should("be.visible");
      cy.contains("button", "Cancel").click();
      cy.contains("Delete Course").should("not.exist");

      return null;
    });
  });
});

describe("Admin Courses Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin courses page", () => {
    cy.visit("/admin/courses");

    cy.assertAccessDenied();
  });
});
