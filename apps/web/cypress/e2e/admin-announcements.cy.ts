describe("Admin Announcements Management", () => {
  it("should display announcements page for admin", () => {
    cy.visit("/admin/announcements");
    
    // Verify the page loads
    cy.contains("Announcements").should("be.visible");
    cy.contains("Create Announcement").should("be.visible");
  });
});

describe("User-Facing Announcement Notifications", () => {
  it("should display notification bell in header", () => {
    cy.visit("/");
    
    // Bell icon should be visible in header
    cy.get('[data-testid="notifications-bell"]').should("exist");
  });
});
