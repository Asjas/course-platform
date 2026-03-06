describe("Data Export Page", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
    cy.visit("/data-export");
  });

  it("should display the data export page with heading", () => {
    cy.get("h1").contains("Download My Data").should("be.visible");
  });

  it("should display GDPR compliance information", () => {
    cy.contains("GDPR").should("be.visible");
    cy.contains("POPIA").should("be.visible");
    cy.contains("data protection regulations").should("be.visible");
  });

  it("should display what data is included", () => {
    cy.contains("What data is included").should("be.visible");
    cy.contains("Your profile information").should("be.visible");
    cy.contains("Course enrollments").should("be.visible");
    cy.contains("Learning progress").should("be.visible");
    cy.contains("Purchase history").should("be.visible");
    cy.contains("Notifications and support tickets").should("be.visible");
  });

  it("should display format choice buttons", () => {
    cy.contains("Choose Your Format").should("be.visible");

    // JSON button
    cy.contains("button", "JSON Format").should("be.visible");
    cy.contains("Structured data, ideal for developers").should("be.visible");

    // CSV button
    cy.contains("button", "CSV Format").should("be.visible");
  });

  it("should have export buttons enabled", () => {
    cy.contains("button", "JSON Format").should("not.be.disabled");
    cy.contains("button", "CSV Format").should("not.be.disabled");
  });
});
