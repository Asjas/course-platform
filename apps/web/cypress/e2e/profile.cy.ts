describe("Profile Page", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
    cy.visit("/profile");
  });

  it("should display the profile page with heading", () => {
    cy.get("h1").contains("Profile").should("be.visible");
    cy.contains("This information will be displayed publicly").should(
      "be.visible",
    );
  });

  it("should display the profile form fields", () => {
    cy.get("#name").should("be.visible");
    cy.get("#username").should("be.visible");
    cy.get("#color").should("exist");
  });

  it("should have save button disabled when form is not dirty", () => {
    cy.contains("button", "Save").should("be.disabled");
    cy.contains("button", "Cancel").should("be.disabled");
  });

  it("should enable save button after modifying a field", () => {
    cy.get("#name").clear();
    cy.get("#name").type("Updated Name");
    cy.contains("button", "Save").should("not.be.disabled");
    cy.contains("button", "Cancel").should("not.be.disabled");
  });

  it("should reset form when cancel is clicked", () => {
    // Modify a field
    cy.get("#name").clear();
    cy.get("#name").type("Temporary Name");

    // Click cancel
    cy.contains("button", "Cancel").click();

    // Save and Cancel should be disabled again
    cy.contains("button", "Save").should("be.disabled");
    cy.contains("button", "Cancel").should("be.disabled");
  });
});
