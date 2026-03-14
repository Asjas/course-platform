import { faker } from "@faker-js/faker";

describe("Admin Course Creation Flow", () => {
  let courseName: string;
  let courseSlug: string;
  let courseDescription: string;

  beforeEach(() => {
    cy.loginAsAdmin();
    courseName = faker.company.buzzPhrase();
    courseSlug = `e2e-${faker.string.alphanumeric(10).toLowerCase()}`;
    courseDescription = faker.lorem.paragraph();
  });

  it("should display course creation form", () => {
    cy.visit("/admin/courses/create");

    // Verify form fields are present
    cy.get('input[name="name"]').should("be.visible");
    cy.get('input[name="slug"]').should("be.visible");
    cy.get('textarea[name="description"]').should("be.visible");
    cy.get('select[name="level"]').should("be.visible");
    cy.get('input[name="price"]').should("be.visible");
  });

  it("should show course structure preview", () => {
    cy.visit("/admin/courses/create");

    // Verify preview section exists
    cy.contains("Course Structure").should("be.visible");
  });

  it("should create a course and redirect to edit page", () => {
    cy.visit("/admin/courses/create");

    cy.get('input[name="name"]').type(courseName);
    cy.get('input[name="slug"]').type(courseSlug);
    cy.get('textarea[name="description"]').type(courseDescription);
    cy.get('select[name="level"]').select("Beginner");
    cy.get('input[name="price"]').clear();
    cy.get('input[name="price"]').type("49");
    cy.get('input[name="trialModuleLimit"]').clear();
    cy.get('input[name="trialModuleLimit"]').type("1");
    cy.get('input[name="published"]').check({ force: true });

    cy.contains("button", "Create Course").click({ force: true });

    cy.url().should("include", "/admin/courses/");
    cy.url().should("include", "/edit");
    cy.contains(courseName).should("be.visible");
  });

  it("should block submit when required fields are missing", () => {
    cy.visit("/admin/courses/create");

    cy.get('input[name="name"]').clear();
    cy.get('input[name="slug"]').clear();
    cy.contains("button", "Create Course").click({ force: true });

    cy.get('input[name="name"]:invalid').should("exist");
    cy.get('input[name="slug"]:invalid').should("exist");
    cy.url().should("include", "/admin/courses/create");
  });
});

describe("Admin Course Creation Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from course creation page", () => {
    cy.visit("/admin/courses/create");

    cy.assertAccessDenied();
  });
});
