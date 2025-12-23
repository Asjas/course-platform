describe("Admin Courses Management", () => {
  beforeEach(() => {
    // Mock admin session
    cy.intercept("GET", "/api/auth/get-session", {
      statusCode: 200,
      body: {
        user: {
          id: "admin-user-id",
          email: "admin@codewizard.training",
          name: "Admin User",
          role: "admin",
          isAdmin: true,
        },
      },
    }).as("getSession");

    // Mock courses list
    cy.intercept("GET", "/api/trpc/courses.getAllAsAdmin*", {
      statusCode: 200,
      body: {
        result: {
          data: [
            {
              id: "course-1",
              name: "React Fundamentals",
              slug: "react-fundamentals",
              description: "Learn React from scratch",
              level: "beginner",
              price: 49.99,
              modules: [
                {
                  id: "module-1",
                  name: "Getting Started",
                  order: 0,
                  lessons: [
                    {
                      id: "lesson-1",
                      name: "Introduction",
                      order: 0,
                    },
                  ],
                },
              ],
            },
            {
              id: "course-2",
              name: "Advanced TypeScript",
              slug: "advanced-typescript",
              description: "Master TypeScript",
              level: "advanced",
              price: 79.99,
              modules: [],
            },
          ],
        },
      },
    }).as("getAllCourses");
  });

  it("should display list of courses", () => {
    cy.visit("/admin/courses");
    cy.wait("@getSession");
    cy.wait("@getAllCourses");

    // Verify courses are displayed
    cy.contains("React Fundamentals").should("be.visible");
    cy.contains("Advanced TypeScript").should("be.visible");
  });

  it("should navigate to create course page", () => {
    cy.visit("/admin/courses");
    cy.wait("@getSession");
    cy.wait("@getAllCourses");

    // Click create course button
    cy.contains("Create Course").click();

    // Verify navigation to create page
    cy.url().should("include", "/admin/courses/create");
    cy.contains("Create New Course").should("be.visible");
  });

  it("should navigate to course edit page", () => {
    cy.visit("/admin/courses");
    cy.wait("@getSession");
    cy.wait("@getAllCourses");

    // Click edit button for first course
    cy.get('[data-testid="edit-course-button"]').first().click();

    // Verify navigation to edit page
    cy.url().should("include", "/admin/courses/course-1/edit");
  });

  it("should show delete confirmation dialog", () => {
    cy.visit("/admin/courses");
    cy.wait("@getSession");
    cy.wait("@getAllCourses");

    // Stub window.confirm
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(false);
      return null;
    });

    // Click delete button
    cy.get('[data-testid="delete-course-button"]').first().click();
  });
});
