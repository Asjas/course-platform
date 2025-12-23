describe("Admin Course Creation Flow", () => {
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

    // Mock course creation
    cy.intercept("POST", "/api/trpc/courses.createCourse*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            id: "new-course-id",
            name: "New Test Course",
            slug: "new-test-course",
            description: "A test course description",
            level: "beginner",
            price: 29.99,
            freeTrialModules: 1,
            published: false,
          },
        },
      },
    }).as("createCourse");
  });

  it("should render course creation form", () => {
    cy.visit("/admin/courses/create");
    cy.wait("@getSession");

    // Verify form fields exist
    cy.get('input[name="name"]').should("be.visible");
    cy.get('input[name="slug"]').should("be.visible");
    cy.get('textarea[name="description"]').should("be.visible");
    cy.get('select[name="level"]').should("be.visible");
    cy.get('input[name="thumbnailUrl"]').should("be.visible");
    cy.get('input[name="price"]').should("be.visible");
    cy.get('input[name="freeTrialModules"]').should("be.visible");

    // Verify preview column is visible
    cy.contains("COURSE STRUCTURE").should("be.visible");
    cy.contains("Module 1").should("be.visible");
    cy.contains("Lesson 1").should("be.visible");
  });

  it("should complete full course creation flow", () => {
    cy.visit("/admin/courses/create");
    cy.wait("@getSession");

    // Fill in course details
    cy.get('input[name="name"]').type("New Test Course");

    // Clear and type slug - split chain for safety
    cy.get('input[name="slug"]').clear();
    cy.get('input[name="slug"]').type("new-test-course");

    cy.get('textarea[name="description"]').type("A test course description");
    cy.get('select[name="level"]').select("beginner");
    cy.get('input[name="thumbnailUrl"]').type(
      "https://example.com/thumbnail.jpg",
    );

    // Uncheck free course checkbox
    cy.get('input[type="checkbox"][name="isFree"]').uncheck();

    // Enter price - split chain for safety
    cy.get('input[name="price"]').clear();
    cy.get('input[name="price"]').type("29.99");

    // Enter free trial modules
    cy.get('input[name="freeTrialModules"]').clear();
    cy.get('input[name="freeTrialModules"]').type("1");

    // Check publish immediately
    cy.get('input[type="checkbox"][name="published"]').check();

    // Submit form
    cy.contains("button", "Create Course").click();

    // Wait for course creation
    cy.wait("@createCourse");

    // Should redirect to course edit page
    cy.url().should("include", "/admin/courses/new-course-id/edit");
  });

  it("should auto-generate slug from course name", () => {
    cy.visit("/admin/courses/create");
    cy.wait("@getSession");

    // Type course name
    cy.get('input[name="name"]').type("My Awesome Course!");

    // Slug should auto-populate
    cy.get('input[name="slug"]').should("have.value", "my-awesome-course");
  });

  it("should toggle price field based on free course checkbox", () => {
    cy.visit("/admin/courses/create");
    cy.wait("@getSession");

    // Price field should be visible initially
    cy.get('input[name="price"]').should("be.visible");

    // Check free course checkbox
    cy.get('input[type="checkbox"][name="isFree"]').check();

    // Price field should be disabled
    cy.get('input[name="price"]').should("be.disabled");

    // Uncheck free course checkbox
    cy.get('input[type="checkbox"][name="isFree"]').uncheck();

    // Price field should be enabled again
    cy.get('input[name="price"]').should("be.enabled");
  });

  it("should validate required fields", () => {
    cy.visit("/admin/courses/create");
    cy.wait("@getSession");

    // Try to submit without filling required fields
    cy.contains("button", "Create Course").click();

    // Should show validation errors (browser native validation)
    cy.get('input[name="name"]:invalid').should("exist");
  });

  it("should show preview of course structure", () => {
    cy.visit("/admin/courses/create");
    cy.wait("@getSession");

    // Verify preview section
    cy.contains("COURSE STRUCTURE").should("be.visible");
    cy.contains(
      "After creating the course, you'll be able to add modules and lessons",
    ).should("be.visible");

    // Verify example modules and lessons are shown
    cy.contains("Module 1").should("be.visible");
    cy.contains("Module 2").should("be.visible");
    cy.contains("Lesson 1").should("be.visible");
    cy.contains("Lesson 2").should("be.visible");
  });
});
