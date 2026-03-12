import { faker } from "@faker-js/faker";

describe("Admin Early Signups - Status filters", () => {
  const pendingEmail = faker.internet
    .email({ provider: "early-signups-pending.test" })
    .toLowerCase();
  const invitedEmail = faker.internet
    .email({ provider: "early-signups-invited.test" })
    .toLowerCase();
  const canceledEmail = faker.internet
    .email({ provider: "early-signups-canceled.test" })
    .toLowerCase();

  beforeEach(() => {
    cy.loginAsAdmin();

    cy.createEarlySignup({
      id: faker.string.alphanumeric({ length: 20, casing: "lower" }),
      email: pendingEmail,
      name: "Pending Signup",
      confirmedAt: null,
      unsubscribedAt: null,
    });

    cy.createEarlySignup({
      id: faker.string.alphanumeric({ length: 20, casing: "lower" }),
      email: invitedEmail,
      name: "Invited Signup",
      confirmedAt: new Date().toISOString(),
      unsubscribedAt: null,
    });

    cy.createEarlySignup({
      id: faker.string.alphanumeric({ length: 20, casing: "lower" }),
      email: canceledEmail,
      name: "Canceled Signup",
      confirmedAt: null,
      unsubscribedAt: new Date().toISOString(),
    });
  });

  it("filters rows by selected status", () => {
    cy.visit("/admin/early-signups");

    cy.contains("button", "Pending").click();
    cy.contains(pendingEmail).should("be.visible");
    cy.contains(invitedEmail).should("not.exist");
    cy.contains(canceledEmail).should("not.exist");

    cy.contains("button", "Invited").click();
    cy.contains(invitedEmail).should("be.visible");
    cy.contains(pendingEmail).should("not.exist");
    cy.contains(canceledEmail).should("not.exist");

    cy.contains("button", "Canceled").click();
    cy.contains(canceledEmail).should("be.visible");
    cy.contains(pendingEmail).should("not.exist");
    cy.contains(invitedEmail).should("not.exist");

    cy.contains("button", "All").click();
    cy.contains(pendingEmail).should("be.visible");
    cy.contains(invitedEmail).should("be.visible");
    cy.contains(canceledEmail).should("be.visible");
  });
});
