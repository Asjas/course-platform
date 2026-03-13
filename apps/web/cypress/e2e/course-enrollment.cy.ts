describe("Course Enrollment - Unauthenticated", () => {
  it("redirects to sign-in when visiting a course page without authentication", () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.visit("/courses/some-course-id");
    cy.url().should("include", "/signin");
  });
});

describe("Course Enrollment - Authenticated", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("displays the dashboard with My Courses heading", () => {
    cy.visit("/dashboard");
    cy.contains("h1", "My Courses").should("be.visible");
  });

  it("shows the courses page with a grid or empty state", () => {
    cy.visit("/dashboard");
    cy.get("body").then(($body) => {
      if ($body.text().includes("No courses available yet")) {
        cy.contains("No courses available yet").should("be.visible");
      } else {
        // At least one course card or list item should exist
        cy.get("article, li, h2, h3").should("exist");
      }
      return null;
    });
  });

  it("can navigate to an individual course page when courses exist", () => {
    cy.visit("/dashboard");

    // Wait for async course data to render before inspecting the DOM
    cy.get("body").should(($body) => {
      expect(
        $body.find('a[href*="/courses/"]').length > 0 ||
          $body.text().includes("No courses available yet"),
        "courses or empty state to render",
      ).to.equal(true);
    });

    cy.get("body").then(($body) => {
      // Only test navigation if course cards are present
      const hasCards = $body.find('a[href*="/courses/"]').length > 0;
      if (!hasCards) {
        cy.contains("No courses available yet").should("be.visible");
        return null;
      }

      cy.get('a[href*="/courses/"]').first().click();
      cy.url().should("match", /\/courses\/[^/]+/);
      cy.get("h1").should("be.visible");
      return null;
    });
  });

  it("shows lesson links inside a course when modules are available", () => {
    cy.visit("/dashboard");

    // Wait for async course data to render before inspecting the DOM
    cy.get("body").should(($body) => {
      expect(
        $body.find('a[href*="/courses/"]').length > 0 ||
          $body.text().includes("No courses available yet"),
        "courses or empty state to render",
      ).to.equal(true);
    });

    cy.get("body").then(($body) => {
      const hasCards = $body.find('a[href*="/courses/"]').length > 0;
      if (!hasCards) {
        cy.contains("No courses available yet").should("be.visible");
        return null;
      }

      cy.get('a[href*="/courses/"]').first().click();
      cy.url().should("match", /\/courses\/[^/]+/);

      cy.get("body").then(($coursePage) => {
        const hasLessons = $coursePage.find('a[href*="/lessons/"]').length > 0;
        if (!hasLessons) {
          // Course may have no lessons yet — that's fine
          cy.contains("h1").should("be.visible");
          return null;
        }

        cy.get('a[href*="/lessons/"]').first().click();
        cy.url().should("match", /\/lessons\/[^/]+/);
        return null;
      });

      return null;
    });
  });

  it("shows Back to Courses navigation on a course detail page", () => {
    cy.visit("/dashboard");

    // Wait for async course data to render before inspecting the DOM
    cy.get("body").should(($body) => {
      expect(
        $body.find('a[href*="/courses/"]').length > 0 ||
          $body.text().includes("No courses available yet"),
        "courses or empty state to render",
      ).to.equal(true);
    });

    cy.get("body").then(($body) => {
      const hasCards = $body.find('a[href*="/courses/"]').length > 0;
      if (!hasCards) {
        cy.contains("No courses available yet").should("be.visible");
        return null;
      }

      cy.get('a[href*="/courses/"]').first().click();
      cy.url().should("match", /\/courses\/[^/]+/);

      cy.contains("Back to Courses").should("be.visible");
      return null;
    });
  });
});

describe("Course Enrollment - Admin", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("admin can view the courses admin page", () => {
    cy.visit("/admin/courses");
    cy.contains("Courses").should("be.visible");
  });
});
