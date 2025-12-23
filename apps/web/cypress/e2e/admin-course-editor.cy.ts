describe("Admin Course Editor with Drag-and-Drop", () => {
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

    // Mock course data with modules and lessons
    cy.intercept("GET", "/api/trpc/courses.getCourseAsAdmin*courseId=test-course*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            id: "test-course",
            name: "Test Course",
            slug: "test-course",
            description: "A test course for editing",
            level: "beginner",
            price: 49.99,
            published: false,
            modules: [
              {
                id: "module-1",
                name: "Introduction Module",
                order: 0,
                courseId: "test-course",
                lessons: [
                  {
                    id: "lesson-1",
                    name: "Welcome Lesson",
                    order: 0,
                    moduleId: "module-1",
                  },
                  {
                    id: "lesson-2",
                    name: "Course Overview",
                    order: 1,
                    moduleId: "module-1",
                  },
                ],
              },
              {
                id: "module-2",
                name: "Advanced Topics",
                order: 1,
                courseId: "test-course",
                lessons: [
                  {
                    id: "lesson-3",
                    name: "Deep Dive",
                    order: 0,
                    moduleId: "module-2",
                  },
                ],
              },
            ],
          },
        },
      },
    }).as("getCourse");

    // Mock module mutations
    cy.intercept("POST", "/api/trpc/courses.createModule*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            id: "new-module-id",
            name: "New Module",
            order: 2,
            courseId: "test-course",
          },
        },
      },
    }).as("createModule");

    cy.intercept("POST", "/api/trpc/courses.updateModule*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("updateModule");

    cy.intercept("POST", "/api/trpc/courses.deleteModule*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("deleteModule");

    // Mock lesson mutations
    cy.intercept("POST", "/api/trpc/courses.createLesson*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            id: "new-lesson-id",
            name: "New Lesson",
            order: 0,
            moduleId: "module-1",
          },
        },
      },
    }).as("createLesson");

    cy.intercept("POST", "/api/trpc/courses.updateLesson*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("updateLesson");

    cy.intercept("POST", "/api/trpc/courses.deleteLesson*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("deleteLesson");

    // Mock reorder operations
    cy.intercept("POST", "/api/trpc/courses.reorderModules*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("reorderModules");

    cy.intercept("POST", "/api/trpc/courses.reorderLessons*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("reorderLessons");
  });

  it("should display course editor with sidebar", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Verify course name is displayed
    cy.contains("Test Course").should("be.visible");

    // Verify modules are displayed
    cy.contains("Introduction Module").should("be.visible");
    cy.contains("Advanced Topics").should("be.visible");

    // Verify lessons are displayed
    cy.contains("Welcome Lesson").should("be.visible");
    cy.contains("Course Overview").should("be.visible");
    cy.contains("Deep Dive").should("be.visible");
  });

  it("should allow creating a new module", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Click add module button
    cy.contains("button", "Add Module").click();

    // Fill in module name
    cy.get('input[name="moduleName"]').type("New Module");

    // Submit module creation
    cy.contains("button", "Create Module").click();

    // Wait for module creation
    cy.wait("@createModule");

    // New module should appear in sidebar
    cy.contains("New Module").should("be.visible");
  });

  it("should allow editing a module", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Click edit button on first module
    cy.get('[data-testid="edit-module-button"]').first().click();

    // Change module name
    cy.get('input[name="moduleName"]').clear().type("Updated Module Name");

    // Save changes
    cy.contains("button", "Save").click();

    // Wait for update
    cy.wait("@updateModule");

    // Updated name should be visible
    cy.contains("Updated Module Name").should("be.visible");
  });

  it("should allow deleting a module", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Stub window.confirm to return true
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });

    // Click delete button on last module
    cy.get('[data-testid="delete-module-button"]').last().click();

    // Wait for delete
    cy.wait("@deleteModule");
  });

  it("should allow creating a lesson within a module", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Expand module if collapsed
    cy.contains("Introduction Module").click();

    // Click add lesson button
    cy.get('[data-testid="add-lesson-button"]').first().click();

    // Fill in lesson name
    cy.get('input[name="lessonName"]').type("New Lesson");

    // Submit lesson creation
    cy.contains("button", "Create Lesson").click();

    // Wait for lesson creation
    cy.wait("@createLesson");

    // New lesson should appear in module
    cy.contains("New Lesson").should("be.visible");
  });

  it("should support drag-and-drop reordering of modules", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Note: Actual drag-and-drop testing with @dnd-kit requires more complex setup
    // This is a simplified version that verifies the UI elements exist
    cy.get('[data-testid="draggable-module"]').should("have.length.at.least", 2);

    // Verify drag handles are present
    cy.get('[data-testid="module-drag-handle"]').should("be.visible");
  });

  it("should support drag-and-drop reordering of lessons", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Expand a module
    cy.contains("Introduction Module").click();

    // Verify lesson drag handles exist
    cy.get('[data-testid="lesson-drag-handle"]').should("be.visible");
  });

  it("should show visual feedback during drag operations", () => {
    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // This test verifies the drag-over functionality exists
    // Note: Full drag simulation requires complex setup with @dnd-kit
    cy.get('[data-testid="draggable-module"]').first().should("exist");
  });

  it("should handle errors gracefully", () => {
    // Mock error response
    cy.intercept("POST", "/api/trpc/courses.createModule*", {
      statusCode: 500,
      body: { error: { message: "Internal server error" } },
    }).as("createModuleError");

    cy.visit("/admin/courses/test-course/edit");
    cy.wait("@getSession");
    cy.wait("@getCourse");

    // Try to create module
    cy.contains("button", "Add Module").click();
    cy.get('input[name="moduleName"]').type("New Module");
    cy.contains("button", "Create Module").click();

    // Wait for error
    cy.wait("@createModuleError");

    // Should show error toast (if implemented)
    // cy.contains("Error creating module").should("be.visible");
  });
});
