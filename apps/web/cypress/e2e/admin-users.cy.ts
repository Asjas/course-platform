import { faker } from "@faker-js/faker";

describe("Admin Users Management - Full CRUD", () => {
  let testUserEmail: string;
  let testUserName: string;

  beforeEach(() => {
    cy.loginAsAdmin();
    testUserName = faker.person.fullName();
    testUserEmail = faker.internet
      .email({ provider: "e2e-test.local" })
      .toLowerCase();
  });

  describe("User Creation & Viewing", () => {
    it("should create and view user in admin list", () => {
      cy.signUpViaApi({
        name: testUserName,
        email: testUserEmail,
        password: "TestPassword123!",
      });

      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).should("be.visible");
      cy.contains(testUserName).should("be.visible");
    });

    it("should display user details when clicking", () => {
      cy.signUpViaApi({
        name: testUserName,
        email: testUserEmail,
        password: "TestPassword123!",
      });

      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).click();
      cy.contains(testUserName).should("be.visible");
      cy.contains("Role").should("be.visible");
    });
  });

  describe("User Role Management", () => {
    beforeEach(() => {
      cy.signUpViaApi({
        name: testUserName,
        email: testUserEmail,
        password: "TestPassword123!",
      });
    });

    it("should change user role to MODERATOR", () => {
      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).click();
      cy.get('select[name="role"]').select("MODERATOR");
      cy.contains("button", "Save").click();
      cy.contains(/updated|success/i).should("be.visible");
    });

    it("should change user role to ADMIN", () => {
      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).click();
      cy.get('select[name="role"]').select("ADMIN");
      cy.contains("button", "Save").click();
      cy.contains(/updated|success/i).should("be.visible");
    });
  });

  describe("User Ban Management", () => {
    beforeEach(() => {
      cy.signUpViaApi({
        name: testUserName,
        email: testUserEmail,
        password: "TestPassword123!",
      });
    });

    it("should ban a user", () => {
      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).click();
      cy.contains("button", /ban/i).click();
      cy.get('[role="dialog"]').then(($dialog) => {
        if ($dialog.length) {
          return cy.wrap($dialog).within(() => {
            cy.contains("button", /confirm|ban/i).click();
          });
        }

        return undefined;
      });
      cy.contains(/banned|success/i).should("be.visible");
    });

    it("should unban a user", () => {
      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).click();
      cy.contains("button", /ban/i).click();
      cy.get('[role="dialog"]').then(($dialog) => {
        if ($dialog.length) {
          return cy.wrap($dialog).within(() => {
            cy.contains("button", /confirm/i).click();
          });
        }

        return undefined;
      });
      cy.contains(/banned|success/i).should("be.visible");
      cy.contains("button", /unban/i).click();
      cy.contains(/unbanned|success/i).should("be.visible");
    });
  });

  describe("User Deletion", () => {
    beforeEach(() => {
      cy.signUpViaApi({
        name: testUserName,
        email: testUserEmail,
        password: "TestPassword123!",
      });
    });

    it("should delete user account", () => {
      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).click();
      cy.contains("button", /delete/i).click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('input[type="text"]').then(($input) => {
          if ($input.length) {
            return cy.wrap($input).type("DELETE");
          }

          return undefined;
        });
        cy.contains("button", /confirm|delete/i).click();
      });
      cy.contains(/deleted|success/i).should("be.visible");
      cy.visit("/admin/users");
      cy.get('input[placeholder*="Search"]').type(testUserEmail);
      cy.contains(testUserEmail).should("not.exist");
    });
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
