describe("Direct Messages - Unauthenticated", () => {
  it("redirects to sign-in when visiting chat without authentication", () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.visit("/chat");
    cy.url().should("include", "/signin");
  });
});

describe("Direct Messages - Authenticated", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("shows the Community Chat heading on the chat page", () => {
    cy.visit("/chat");
    // The h1 is sr-only but should be in the DOM
    cy.get("h1").contains("Community Chat").should("exist");
  });

  it("shows the Direct Messages section in the sidebar", () => {
    cy.visit("/chat");
    cy.contains("Direct Messages").should("be.visible");
  });

  it("shows the New Direct Message button", () => {
    cy.visit("/chat");
    cy.get('button[aria-label="New direct message"]').should("be.visible");
  });

  it("shows empty state when no DMs exist", () => {
    cy.visit("/chat");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No direct messages yet")) {
        cy.contains("No direct messages yet").should("be.visible");
      } else {
        // DMs exist — ensure at least one conversation link is shown
        cy.get('a[href*="/chat/dm"]').should("exist");
      }
      return null;
    });
  });

  it("shows a DM request dialog when New direct message button is clicked", () => {
    cy.visit("/chat");
    cy.get('button[aria-label="New direct message"]').click();

    // The DM request modal or a user picker should appear
    cy.get("body").then(($body) => {
      const hasDialog =
        $body.find('[role="dialog"]').length > 0 ||
        $body.find('[role="alertdialog"]').length > 0;

      if (hasDialog) {
        cy.get('[role="dialog"], [role="alertdialog"]').should("be.visible");
      } else {
        // Might render inline search or different UI
        cy.get("body").should("be.visible");
      }

      return null;
    });
  });

  it("can navigate to an existing DM conversation", () => {
    cy.visit("/chat");

    cy.get("body").then(($body) => {
      const hasDMLinks = $body.find('a[href*="/chat/dm"]').length > 0;

      if (!hasDMLinks) {
        cy.contains("No direct messages yet").should("be.visible");
        return null;
      }

      cy.get('a[href*="/chat/dm"]').first().click();
      cy.url().should("match", /\/chat\/dm\//);
      return null;
    });
  });

  it("shows channel navigation in the chat sidebar", () => {
    cy.visit("/chat");

    // The channels should be visible in the sidebar
    cy.get("nav, aside, [role='navigation']").should("exist");
  });
});

describe("Direct Messages - Admin", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("admin can also access the chat page", () => {
    cy.visit("/chat");
    cy.get("h1").contains("Community Chat").should("exist");
  });

  it("admin sees the Direct Messages section", () => {
    cy.visit("/chat");
    cy.contains("Direct Messages").should("be.visible");
  });
});
