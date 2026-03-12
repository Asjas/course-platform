describe("Header - Unauthenticated", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should show Sign In and Sign Up links for unauthenticated users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Sign In").should("have.attr", "href", "/signin");
      cy.get("a").contains("Sign Up").should("have.attr", "href", "/signup");
    });
  });

  it("should not show Dashboard link for unauthenticated users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Dashboard").should("not.exist");
    });
  });

  it("should not show Chat link for unauthenticated users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Chat").should("not.exist");
    });
  });

  it("should not show Admin link for unauthenticated users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Admin").should("not.exist");
    });
  });

  it("should show the theme toggle button", () => {
    cy.get("header").within(() => {
      cy.get("button").filter('[aria-label*="Change theme"]').should("exist");
    });
  });
});

describe("Header - Authenticated Regular User", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
    cy.visit("/dashboard");
  });

  it("should show Dashboard and Chat links for authenticated users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Dashboard").should("be.visible");
      cy.get("a").contains("Chat").should("be.visible");
    });
  });

  it("should not show Admin link for non-admin users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Admin").should("not.exist");
    });
  });

  it("should show the notifications bell for authenticated users", () => {
    cy.get("header").within(() => {
      cy.contains("button", "Notifications").should("exist");
    });
  });

  it("should show the theme toggle for authenticated users", () => {
    cy.get("header").within(() => {
      cy.get("button").filter('[aria-label*="Change theme"]').should("exist");
    });
  });
});

describe("Header - Authenticated Admin User", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit("/dashboard");
  });

  it("should show Admin link for admin users", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Admin").should("be.visible");
    });
  });

  it("should show Dashboard, Chat, and Admin links", () => {
    cy.get('header nav[aria-label="Global"]').within(() => {
      cy.get("a").contains("Dashboard").should("be.visible");
      cy.get("a").contains("Chat").should("be.visible");
      cy.get("a").contains("Admin").should("be.visible");
    });
  });
});

describe("Footer", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should render the footer element", () => {
    cy.get("footer").should("exist");
  });

  it("should render the brand name link to home page", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("Codewizard Training")
        .should("have.attr", "href", "/");
    });
  });

  it("should render the copyright text", () => {
    cy.get("footer").contains("© 2025").should("be.visible");
  });

  it("should render the contact email link", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("contact@codewizard.training")
        .should("have.attr", "href", "mailto:contact@codewizard.training");
    });
  });

  it("should render the uptime status link with target blank", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("Uptime Status")
        .should("have.attr", "target", "_blank")
        .and("have.attr", "rel", "noopener noreferrer");
    });
  });

  it("should render Terms of Service link", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("Terms of Service")
        .should("have.attr", "href", "/terms");
    });
  });

  it("should render Privacy Policy link", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("Privacy Policy")
        .should("have.attr", "href", "/privacy");
    });
  });

  it("should render Cookie Policy link", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("Cookie Policy")
        .should("have.attr", "href", "/cookies");
    });
  });

  it("should render the builder attribution", () => {
    cy.get("footer").contains("Built with").should("be.visible");
  });

  it("should render the typecraft inspiration link", () => {
    cy.get("footer").within(() => {
      cy.get("a")
        .contains("typecraft")
        .should("have.attr", "href", "https://typecraft.dev")
        .and("have.attr", "target", "_blank");
    });
  });
});
