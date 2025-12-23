describe("Admin Stats Dashboard", () => {
  it("should display stats page for admin", () => {
    cy.visit("/admin/stats");
    
    // Verify the page loads
    cy.contains("Stats").should("be.visible");
  });
});
