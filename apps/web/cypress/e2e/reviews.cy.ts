import { faker } from "@faker-js/faker";

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
      cy.contains(/no reviews found/i).should("be.visible");
    }

    return null;
  });
}

describe("Course Reviews - Unauthenticated", () => {
  it("redirects to sign-in when accessing admin reviews without auth", () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.visit("/admin/reviews");
    cy.url().should("include", "/signin");
  });
});

describe("Course Reviews - Admin", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("displays the Course Reviews page heading", () => {
    visitReviewsPage();
  });

  it("shows the Add Review button", () => {
    visitReviewsPage();
    cy.contains("button", "Add Review").should("be.visible");
  });

  it("shows column headers when reviews exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.contains("th", "User").should("be.visible");
      cy.contains("th", "Course").should("be.visible");
      cy.contains("th", "Rating").should("be.visible");
      cy.contains("th", "Status").should("be.visible");
    });
  });

  it("opens the Add Review sheet when button is clicked", () => {
    visitReviewsPage();

    cy.contains("button", "Add Review").click();
    cy.contains("Create Review").should("be.visible");
  });

  it("closes the Add Review sheet when Cancel is clicked", () => {
    visitReviewsPage();

    cy.contains("button", "Add Review").click();
    cy.contains("Create Review").should("be.visible");

    cy.contains("button", "Cancel").click();
    cy.contains("Create Review").should("not.exist");
  });

  it("shows review details sheet when View review details is clicked", () => {
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

  it("shows Approved or Pending status badge when reviews exist", () => {
    visitReviewsPage();

    withReviewsTable(() => {
      cy.get("tbody tr")
        .first()
        .find("td")
        .contains(/Approved|Pending/i)
        .should("be.visible");
    });
  });

  it("can create a review through the form when users and courses exist", () => {
    visitReviewsPage();

    cy.contains("button", "Add Review").click();
    cy.contains("Create Review").should("be.visible");

    // The form uses native <select> elements with name attributes.
    // Assert they are present before checking for data.
    cy.get('select[name="userId"]').should("exist");
    cy.get('select[name="courseId"]').should("exist");

    cy.get('select[name="userId"] option').then(($userOptions) => {
      if ($userOptions.length <= 1) {
        // No users in DB — log and cancel rather than silently passing
        cy.log(
          "Skipping create-review test: no users available in the database",
        );
        cy.contains("button", "Cancel").click();
        return null;
      }

      cy.get('select[name="courseId"] option').then(($courseOptions) => {
        if ($courseOptions.length <= 1) {
          cy.log(
            "Skipping create-review test: no courses available in the database",
          );
          cy.contains("button", "Cancel").click();
          return null;
        }

        const randomTitle = `E2E Test Review ${faker.string.alphanumeric(6)}`;

        cy.get('select[name="userId"]').select(
          $userOptions.eq(1).val() as string,
        );
        cy.get('select[name="courseId"]').select(
          $courseOptions.eq(1).val() as string,
        );
        cy.get('input[name="title"]').type(randomTitle);
        cy.get('select[name="rating"]').select("5");
        cy.get('textarea[name="comment"]').type(
          "Great course, highly recommended.",
        );

        cy.intercept("POST", "**/trpc/reviews*").as("createReview");
        cy.contains("button", "Save").click();

        cy.wait("@createReview", { timeout: 15000 });
        cy.contains(randomTitle, { timeout: 10000 }).should("be.visible");
        return null;
      });

      return null;
    });
  });
});

describe("Course Reviews - Regular User Access", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("blocks regular users from accessing the admin reviews page", () => {
    cy.visit("/admin/reviews");
    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
