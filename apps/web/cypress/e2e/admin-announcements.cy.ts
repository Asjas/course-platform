describe("Admin Announcements Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display announcements page", () => {
    cy.visit("/admin/announcements");

    // Verify page loads
    cy.contains("Announcements").should("be.visible");
  });

  it("should have create announcement button", () => {
    cy.visit("/admin/announcements");

    cy.contains("Create Announcement").should("be.visible");
  });
});

describe("User-Facing Announcement Notifications", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should display notification bell in header", () => {
    cy.visit("/dashboard");

    // Verify bell icon exists in header - PopoverButton with Bell icon and sr-only text "Notifications"
    cy.get('button').contains('Notifications').should("exist");
  });
});
