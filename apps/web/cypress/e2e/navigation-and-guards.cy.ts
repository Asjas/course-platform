describe("Auth Guards - Unauthenticated Access", () => {
  it("should redirect to signin when visiting dashboard without auth", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/signin");
  });

  it("should redirect to signin when visiting profile without auth", () => {
    cy.visit("/profile");
    cy.url().should("include", "/signin");
  });

  it("should redirect to signin when visiting account without auth", () => {
    cy.visit("/account");
    cy.url().should("include", "/signin");
  });

  it("should redirect to signin when visiting data-export without auth", () => {
    cy.visit("/data-export");
    cy.url().should("include", "/signin");
  });

  it("should redirect to signin when visiting chat without auth", () => {
    cy.visit("/chat/general");
    cy.url().should("include", "/signin");
  });

  it("should redirect to signin when visiting admin pages without auth", () => {
    cy.visit("/admin/stats");
    cy.url().should("include", "/signin");
  });
});

describe("Auth Guards - Role-Based Access", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should redirect non-admin users and show an access denied popup", () => {
    cy.visit("/admin/stats");

    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });
});

describe("Public Page Access", () => {
  it("should allow unauthenticated access to the home page", () => {
    cy.visit("/");
    cy.get("h1").should("exist");
    cy.url().should("not.include", "/signin");
  });

  it("should allow unauthenticated access to terms page", () => {
    cy.visit("/terms");
    cy.get("h1").contains("Terms of Service").should("be.visible");
  });

  it("should allow unauthenticated access to privacy page", () => {
    cy.visit("/privacy");
    cy.get("h1").contains("Privacy Policy").should("be.visible");
  });

  it("should allow unauthenticated access to cookies page", () => {
    cy.visit("/cookies");
    cy.get("h1").contains("Cookie Policy").should("be.visible");
  });

  it("should allow unauthenticated access to downloads page", () => {
    cy.visit("/downloads");
    cy.get("h1").contains("Downloads").should("be.visible");
  });

  it("should allow unauthenticated access to signup page", () => {
    cy.visit("/signup");
    cy.contains("Account Signup").should("be.visible");
  });

  it("should allow unauthenticated access to signin page", () => {
    cy.visit("/signin");
    cy.contains("Sign In to Your Account").should("be.visible");
  });

  it("should allow unauthenticated access to reset password page", () => {
    cy.visit("/reset-password");
    cy.contains("Reset Password").should("be.visible");
  });
});

describe("Cross-Page Navigation", () => {
  it("should navigate from home to terms via footer link", () => {
    cy.visit("/");
    cy.get("a").contains("Terms of Service").click();
    cy.url().should("include", "/terms");
    cy.get("h1").contains("Terms of Service").should("be.visible");
  });

  it("should navigate from home to privacy via footer link", () => {
    cy.visit("/");
    cy.get("a").contains("Privacy Policy").click();
    cy.url().should("include", "/privacy");
    cy.get("h1").contains("Privacy Policy").should("be.visible");
  });

  it("should navigate from terms to privacy policy", () => {
    cy.visit("/terms");
    cy.get("a").contains("Privacy Policy").click();
    cy.url().should("include", "/privacy");
  });

  it("should navigate from privacy to terms of service", () => {
    cy.visit("/privacy");
    cy.get("a").contains("Terms of Service Policy").click();
    cy.url().should("include", "/terms");
  });

  it("should navigate from cookies to privacy policy", () => {
    cy.visit("/cookies");
    cy.get('a[href="/privacy"]').first().click();
    cy.url().should("include", "/privacy");
  });

  it("should navigate from cookies to terms of service", () => {
    cy.visit("/cookies");
    cy.get('a[href="/terms"]').first().click();
    cy.url().should("include", "/terms");
  });

  it("should navigate from signin to signup", () => {
    cy.visit("/signin");
    cy.get('a[href="/signup"]').first().click();
    cy.url().should("include", "/signup");
    cy.contains("Account Signup").should("be.visible");
  });

  it("should navigate from signup to signin", () => {
    cy.visit("/signup");
    cy.get('a[href="/signin"]').first().click();
    cy.url().should("include", "/signin");
    cy.contains("Sign In to Your Account").should("be.visible");
  });

  it("should navigate from signin to reset password", () => {
    cy.visit("/signin");
    cy.get('a[href="/reset-password"]').click();
    cy.url().should("include", "/reset-password");
    cy.contains("Reset Password").should("be.visible");
  });
});
