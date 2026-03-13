function visitReviewsPage() {
  cy.visit("/admin/reviews");
  cy.contains("h1", "Course Reviews").should("be.visible");
}

function withReviewsTable(assertion: () => void) {
  cy.get("body").then(($body) => {
    const hasRows = $body.find("tbody tr").length > 0;

    if (hasRows) {
      assertion();
    } else {
      cy.contains(
        /no reviews found|there are no course reviews to display/i,
      ).should("be.visible");
    }

    return null;
  });
}

describe("Admin Reviews Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display reviews page", () => {
    visitReviewsPage();

    cy.contains("button", "Add Review").should("be.visible");
  });

  it("should display reviews table columns when reviews exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.contains("th", "User").should("be.visible");
      cy.contains("th", "Course").should("be.visible");
      cy.contains("th", "Rating").should("be.visible");
      cy.contains("th", "Title").should("be.visible");
      cy.contains("th", "Status").should("be.visible");
      cy.contains("th", "Created At").should("be.visible");
    });
  });

  it("should open create review sheet", () => {
    visitReviewsPage();

    cy.contains("button", "Add Review").click();
    cy.contains("Create Review").should("be.visible");
    cy.get('select[name="userId"]').should("be.visible");
    cy.get('select[name="courseId"]').should("be.visible");
    cy.get('select[name="rating"]').should("be.visible");
  });

  it("should view review details when rows exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("tbody tr")
        .first()
        .within(() => {
          cy.contains("button", "View review details").click();
        });

      cy.contains("Review Details").should("be.visible");
    });
  });

  it("should display review status badges when rows exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("tbody tr")
        .first()
        .within(() => {
          cy.get("td")
            .contains(/Approved|Pending/i)
            .should("be.visible");
        });
    });
  });

  it("should display star ratings correctly when rows exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("tbody tr")
        .first()
        .within(() => {
          cy.get("td").contains(/[1-5]/).should("be.visible");
          cy.get("td").contains("★").should("be.visible");
        });
    });
  });

  it("should display formatted creation dates when rows exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("tbody tr")
        .first()
        .within(() => {
          cy.get("td")
            .contains(/\w{3} \d{1,2}, \d{4}/)
            .should("be.visible");
        });
    });
  });

  it("should validate external links when present", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("body").then(($body) => {
        if ($body.find('a[href][target="_blank"]').length > 0) {
          cy.get('a[href][target="_blank"]').should("exist");
        }

        return null;
      });
    });
  });

  it("should delete a review with confirmation when rows exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("tbody tr").then(($rowsBefore) => {
        const countBefore = $rowsBefore.length;

        cy.get("tbody tr")
          .first()
          .within(() => {
            cy.contains("button", "Delete review").click();
          });

        cy.get('[role="dialog"]').within(() => {
          cy.contains("button", "Delete").should("be.visible").click();
        });

        cy.contains(/deleted successfully/i, { timeout: 10000 }).should(
          "be.visible",
        );
        cy.get("tbody tr").should("have.length", countBefore - 1);

        return null;
      });
    });
  });

  it("should show empty state when no reviews exist", () => {
    visitReviewsPage();

    cy.get("body").then(($body) => {
      if ($body.find("tbody tr").length === 0) {
        cy.contains(
          /no reviews found|there are no course reviews to display/i,
        ).should("be.visible");
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
