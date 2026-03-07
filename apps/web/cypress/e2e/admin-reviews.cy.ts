describe("Admin Reviews Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display reviews page", () => {
    cy.visit("/admin/reviews");

    cy.contains("h1", "Course Reviews").should("be.visible");
    cy.contains("button", "Add Review").should("be.visible");
  });

  it("should display reviews table with columns", () => {
    cy.visit("/admin/reviews");

    // Verify table headers exist
    cy.contains("th", "User").should("be.visible");
    cy.contains("th", "Course").should("be.visible");
    cy.contains("th", "Rating").should("be.visible");
    cy.contains("th", "Title").should("be.visible");
    cy.contains("th", "Status").should("be.visible");
    cy.contains("th", "Created At").should("be.visible");
  });

  it("should open create review sheet", () => {
    cy.visit("/admin/reviews");

    cy.contains("button", "Add Review").click();
    cy.contains("Create Review").should("be.visible");
    cy.get('select[name="userId"]').should("be.visible");
    cy.get('select[name="courseId"]').should("be.visible");
    cy.get('select[name="rating"]').should("be.visible");
  });

  it("should view review details", () => {
    cy.visit("/admin/reviews");

    // Check if there are any reviews
    cy.get("tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        // Click view button on first review
        cy.get("tbody tr")
          .first()
          .within(() => {
            cy.get('button[aria-label*="View"]').click();
          });

        cy.contains("Review Details").should("be.visible");
      }
      return null;
    });
  });

  it("should display review status with badges", () => {
    cy.visit("/admin/reviews");

    cy.get("tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        // Look for status badges (Approved or Pending)
        cy.get("tbody tr")
          .first()
          .within(() => {
            cy.get("td")
              .contains(/Approved|Pending/i)
              .should("be.visible");
          });
      }
      return null;
    });
  });

  it("should display star ratings correctly", () => {
    cy.visit("/admin/reviews");

    cy.get("tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        cy.get("tbody tr")
          .first()
          .within(() => {
            // Rating should be visible with star symbol
            cy.get("td").contains(/[1-5]/).should("be.visible");
            cy.get("td").contains("★").should("be.visible");
          });
      }
      return null;
    });
  });

  it("should display formatted creation dates", () => {
    cy.visit("/admin/reviews");

    cy.get("tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        cy.get("tbody tr")
          .first()
          .within(() => {
            // Date column should have formatted date (e.g., "Jan 15, 2024")
            cy.get("td")
              .contains(/\w{3} \d{1,2}, \d{4}/)
              .should("be.visible");
          });
      }
      return null;
    });
  });

  it("should show external link icon when review has external link", () => {
    cy.visit("/admin/reviews");

    cy.get("tbody tr").then(($rows) => {
      if ($rows.length > 0) {
        // Look for external link icons
        cy.get('a[href][target="_blank"]').should("exist");
      }
      return null;
    });
  });

  it("should delete a review with confirmation", () => {
    cy.visit("/admin/reviews");

    // Get the count of reviews before deletion
    cy.get("tbody tr").then(($rowsBefore) => {
      const countBefore = $rowsBefore.length;

      if (countBefore > 0) {
        cy.get("tbody tr")
          .first()
          .within(() => {
            cy.get('button[aria-label*="Delete"]').click();
          });

        // Confirm deletion in dialog
        cy.contains("button", "Delete").last().click();

        cy.contains(/deleted successfully/i).should("be.visible");

        // Verify count decreased
        cy.get("tbody tr").should("have.length", countBefore - 1);
      }
      return null;
    });
  });

  it("should show empty state when no reviews exist", () => {
    cy.visit("/admin/reviews");

    cy.get("tbody tr").then(($rows) => {
      if ($rows.length === 0) {
        cy.contains(/no reviews/i).should("be.visible");
      }
      return null;
    });
  });
});

describe("Admin Reviews Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from reviews page", () => {
    cy.visit("/admin/reviews");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
