describe("Admin Stats Dashboard", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit("/admin/stats");
  });

  it("should display stats dashboard page", () => {
    cy.contains("h1", "Platform Statistics").should("be.visible");
    cy.contains("Overview of course enrollments and platform activity").should(
      "be.visible",
    );
  });

  it("should display core statistics sections", () => {
    cy.contains("Platform Overview").should("be.visible");
    cy.contains("Revenue & Purchases").should("be.visible");
    cy.contains("User Activity").should("be.visible");
    cy.contains("Support Tickets").should("be.visible");
    cy.contains("Learning Progress").should("be.visible");
    cy.contains("Additional Metrics").should("be.visible");
    cy.contains("Course Statistics").should("be.visible");
  });

  it("should render formatted values for key KPI cards", () => {
    cy.contains("Net Revenue")
      .parent()
      .parent()
      .within(() => {
        cy.contains(/^\$\d+\.\d{2}$/).should("be.visible");
      });

    cy.contains("Verified Users")
      .parent()
      .parent()
      .within(() => {
        cy.contains(/% verified$/).should("be.visible");
      });

    cy.contains("Resolution Rate")
      .parent()
      .parent()
      .within(() => {
        cy.contains(/^\d+%$/).should("be.visible");
      });
  });

  it("should render course statistics table headers", () => {
    cy.contains("th", "Course Name").should("be.visible");
    cy.contains("th", "Status").should("be.visible");
    cy.contains("th", "Price").should("be.visible");
    cy.contains("th", "Total Enrollments").should("be.visible");
    cy.contains("th", "Completion Rate").should("be.visible");
  });

  it("should show enrollment breakdown cards with percent text", () => {
    cy.get('section[aria-labelledby="enrollment-breakdown-heading"]').within(
      () => {
        cy.contains("Individual").should("be.visible");
        cy.contains("Gift").should("be.visible");
        cy.contains("Team").should("be.visible");
        cy.contains("Refunded").should("be.visible");
        cy.contains("Cancelled").should("be.visible");
        cy.contains("% of total").should("be.visible");
      },
    );
  });

  it("should show additional metrics cards", () => {
    cy.contains("Additional Metrics").should("be.visible");
    cy.contains("Coupons").should("be.visible");
    cy.contains("Team Seats").should("be.visible");
    cy.contains("Wishlisted").should("be.visible");
    cy.contains("Announcements").should("be.visible");
  });
});

describe("Admin Stats Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin stats page", () => {
    cy.visit("/admin/stats");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});
