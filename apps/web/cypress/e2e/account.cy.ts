describe("Account Management Page", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
    cy.visit("/account");
  });

  it("should display the account management page with heading", () => {
    cy.get("h1").contains("Account Management").should("be.visible");
    cy.contains("Manage your account email and password").should("be.visible");
  });

  it("should display the change password form", () => {
    cy.contains("Change your password").should("be.visible");
    cy.get("#currentPassword").should("be.visible");
    cy.get("#newPassword").should("be.visible");
  });

  it("should display the change email form", () => {
    cy.contains("Change your email").should("be.visible");
    cy.contains("Your current email is").should("be.visible");
    cy.get("#newEmail").should("be.visible");
  });

  it("should display the delete account form", () => {
    cy.contains("Delete your account").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.contains("button", "Delete Account").should("be.visible");
  });

  it("should display delete account warnings", () => {
    cy.contains("permanently deleted").should("be.visible");
    cy.contains("restored from backup within 30 days").should("be.visible");
  });

  it("should have change password save button disabled when form is empty", () => {
    // The save buttons inside change password should be disabled
    cy.contains("Change your password")
      .parents("form")
      .find('button[type="submit"]')
      .should("be.disabled");
  });

  it("should enable change password save button after entering data", () => {
    cy.get("#currentPassword").type("OldPass123!");
    cy.get("#newPassword").type("NewPass456!");

    cy.contains("Change your password")
      .parents("form")
      .find('button[type="submit"]')
      .should("not.be.disabled");
  });

  it("should have delete account button disabled when password is empty", () => {
    cy.contains("Delete your account")
      .parents("form")
      .find('button[type="submit"]')
      .should("be.disabled");
  });

  it("should enable delete account button after entering password", () => {
    // The delete account password field is the one in the delete section
    cy.contains("Delete your account")
      .parents("form")
      .find("#password")
      .type("MyPassword123!");

    cy.contains("Delete your account")
      .parents("form")
      .find('button[type="submit"]')
      .should("not.be.disabled");
  });

  it("should have a link to privacy policy in the delete section", () => {
    cy.contains("Delete your account")
      .parent()
      .find('a[href="/privacy"]')
      .should("exist");
  });
});
