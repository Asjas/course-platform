import { faker } from "@faker-js/faker";

describe("Admin Users Management - Full CRUD", () => {
  let testUserName: string;
  let testUserEmail: string;

  before(() => {
    cy.loginAsAdmin();
    testUserName = faker.person.fullName();
    testUserEmail = faker.internet
      .email({ provider: "e2e-users.local" })
      .toLowerCase();

    cy.task("createTestUser", {
      id: faker.string.uuid(),
      name: testUserName,
      email: testUserEmail,
      role: "member",
    });
  });

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit("/admin/users");
  });

  it("should create and view user in admin list", () => {
    cy.contains("tr", testUserEmail).should("be.visible");
    cy.contains("tr", testUserName).should("be.visible");
  });

  it("should display user details in edit sheet", () => {
    cy.contains("tr", testUserEmail).within(() => {
      cy.contains("button", "Edit").click();
    });

    cy.contains("Edit User").should("be.visible");
    cy.get('input[name="name"]').should("have.value", testUserName);
    cy.get('input[name="email"]').should("have.value", testUserEmail);
    cy.contains("Role").should("be.visible");
    cy.contains("Banned").should("be.visible");
  });

  it("should update user role and ban state", () => {
    cy.contains("tr", testUserEmail).within(() => {
      cy.contains("button", "Edit").click();
    });

    cy.get('select[name="role"]').select("Admin");
    cy.get('button[id="banned"]').click();
    cy.get('textarea[name="banReason"]').clear();
    cy.get('textarea[name="banReason"]').type("E2E moderation test");
    cy.contains("button", "Save Changes").click();

    cy.contains(/updated successfully|User .* updated successfully!/i).should(
      "be.visible",
    );
    cy.contains("tr", testUserEmail).within(() => {
      cy.contains(/admin/i).should("be.visible");
      cy.contains(/Banned/i).should("be.visible");
    });
  });

  it("should delete user account", () => {
    cy.get("body").then(($body) => {
      if ($body.find('[role="dialog"]').length > 0) {
        cy.get("body").type("{esc}");
        cy.get('[role="dialog"]').should("not.exist");
      }

      return null;
    });

    cy.contains("tr", testUserEmail)
      .find("button")
      .contains("Delete")
      .should("be.visible")
      .click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", "Delete")
        .should("be.visible")
        .should("not.be.disabled")
        .click();
    });

    cy.contains(/Deleted user|deleted/i).should("be.visible");
    cy.contains("tr", testUserEmail).should("not.exist");
  });
});

describe("Admin Users Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin users page", () => {
    cy.visit("/admin/users");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
